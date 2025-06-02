import os
import numpy as np
import cv2

class OpenPoseDetector:
    """
    Utility class for OpenPose-based pose detection using OpenCV DNN
    
    Supports two modes:
    1. Normal mode: Uses OpenPose to detect pose keypoints in each image
    2. Demo mode: Uses synthetic pose data when model files aren't available
    """
    # COCO Output Format
    COCO_BODY_PARTS = {
        0: "Nose", 1: "Neck",
        2: "Right_Shoulder", 3: "Right_Elbow", 4: "Right_Wrist",
        5: "Left_Shoulder", 6: "Left_Elbow", 7: "Left_Wrist",
        8: "Right_Hip", 9: "Right_Knee", 10: "Right_Ankle",
        11: "Left_Hip", 12: "Left_Knee", 13: "Left_Ankle",
        14: "Right_Eye", 15: "Left_Eye", 16: "Right_Ear", 17: "Left_Ear"
    }
    
    # Define the body part connections for visualization
    POSE_PAIRS = [
        # Torso
        (1, 0), (1, 2), (1, 5), (2, 5), (1, 8), (1, 11), (8, 11),
        # Right arm
        (2, 3), (3, 4),
        # Left arm
        (5, 6), (6, 7),
        # Right leg
        (8, 9), (9, 10),
        # Left leg
        (11, 12), (12, 13),
        # Face
        (0, 14), (0, 15), (14, 16), (15, 17)
    ]
    
    # Maps OpenPose COCO keypoints to MediaPipe-like naming for compatibility
    KEYPOINT_MAPPING = {
        0: "NOSE", 
        1: "NECK",
        2: "RIGHT_SHOULDER", 
        3: "RIGHT_ELBOW", 
        4: "RIGHT_WRIST",
        5: "LEFT_SHOULDER", 
        6: "LEFT_ELBOW", 
        7: "LEFT_WRIST",
        8: "RIGHT_HIP", 
        9: "RIGHT_KNEE", 
        10: "RIGHT_ANKLE",
        11: "LEFT_HIP", 
        12: "LEFT_KNEE", 
        13: "LEFT_ANKLE",
        14: "RIGHT_EYE", 
        15: "LEFT_EYE", 
        16: "RIGHT_EAR", 
        17: "LEFT_EAR"
    }
    
    def __init__(self, model_path="models/openpose"):
        # Get the base directory
        base_dir = os.path.dirname(os.path.abspath(__file__))
        self.model_path = os.path.join(base_dir, model_path)
        
        # Set demo_mode to False by default
        self.demo_mode = False
        
        # Initialize reference landmarks for fixed pose mode
        self.fixed_pose_mode = False
        self.reference_landmarks = None
        
        # Try to load the network, fall back to demo mode if it fails
        try:
            self.load_model()
        except Exception as e:
            print(f"Error loading OpenPose model: {e}")
            print("Falling back to DEMO mode with synthetic poses")
            self.demo_mode = True
            self.net = None
        
    def load_model(self):
        """Load the OpenPose model from the specified path"""
        try:
            # Try to load COCO model (18 keypoints)
            prototxt = os.path.join(self.model_path, "pose/coco/pose_deploy_linevec.prototxt")
            weights = os.path.join(self.model_path, "pose/coco/pose_iter_440000.caffemodel")
            
            if os.path.exists(prototxt) and os.path.exists(weights):
                self.net = cv2.dnn.readNetFromCaffe(prototxt, weights)
                self.model_type = "COCO"
                print("Loaded OpenPose COCO model")
                return
            
            # Try to load MPI model (15 keypoints) as fallback
            prototxt = os.path.join(self.model_path, "pose/mpi/pose_deploy_linevec.prototxt")
            weights = os.path.join(self.model_path, "pose/mpi/pose_iter_160000.caffemodel")
            
            if os.path.exists(prototxt) and os.path.exists(weights):
                self.net = cv2.dnn.readNetFromCaffe(prototxt, weights)
                self.model_type = "MPI"
                print("Loaded OpenPose MPI model")
                return
                
            # If neither model is available, fail with clear instructions
            print("ERROR: Missing model weights. Please download them using:")
            print("python download_models.py")
            print("Or manually download from:")
            print("COCO model: https://www.dropbox.com/s/2h2bv29a130sgrk/pose_iter_440000.caffemodel")
            print("MPI model: https://www.dropbox.com/s/ilz7m9qyzlzq1g8/pose_iter_160000.caffemodel")
            
            raise FileNotFoundError("OpenPose model files not found. Please run download_models.py first.")
            
        except Exception as e:
            print(f"Error loading OpenPose model: {e}")
            raise
    
    
    def detect_pose(self, image):
        """
        Detect pose keypoints in the given image
        
        Args:
            image: numpy array of the image (BGR format)
            
        Returns:
            Dictionary containing landmarks and connections
            
        Raises:
            RuntimeError: If model weights are not loaded and demo mode is disabled
        """
        # Get image dimensions
        image_height, image_width, _ = image.shape
        
        # Check if we're in demo mode
        if self.demo_mode:
            return self._generate_demo_pose(image_width, image_height)
        
        if not hasattr(self, 'net') or self.net is None:
            raise RuntimeError("OpenPose model not loaded. Please download model weights first.")
        
        try:
            # Prepare the image for the network
            # OpenPose requires a fixed size input - we'll use 368x368
            input_width, input_height = 368, 368
            
            # Create a blob from the image
            input_blob = cv2.dnn.blobFromImage(
                image, 1.0 / 255, (input_width, input_height), (0, 0, 0), swapRB=True, crop=False
            )
            
            # Set the input
            self.net.setInput(input_blob)
            
            # Forward pass through the network
            output = self.net.forward()
            
            # Extract keypoints
            keypoints = []
            landmark_dict = {}
            
            # Output dimensions: [1, 19 (number of keypoints + background), H, W]
            # For each keypoint, we get a heatmap
            for i in range(len(self.KEYPOINT_MAPPING)):
                # Get the probability map for this keypoint
                prob_map = output[0, i, :, :]
                prob_map = cv2.resize(prob_map, (image_width, image_height))
                
                # Find global maxima of the probability map
                _, prob, _, point = cv2.minMaxLoc(prob_map)
                
                x = point[0]
                y = point[1]
                
                # Add the keypoint if the probability is greater than a threshold
                if prob > 0.1:
                    keypoints.append((i, x, y, prob))
                    
                    # Add to landmark dictionary with MediaPipe-compatible naming
                    landmark_name = self.KEYPOINT_MAPPING[i]
                    landmark_dict[landmark_name] = {
                        "x": float(x),
                        "y": float(y),
                        "z": 0.0,  # OpenPose doesn't provide z-coordinate
                        "visibility": float(prob)
                    }
                    
                    # Validate required keypoints
                    required_keypoints = ["LEFT_SHOULDER", "RIGHT_SHOULDER",
                                        "LEFT_HIP", "RIGHT_HIP",
                                        "LEFT_KNEE", "LEFT_ANKLE"]
                    if landmark_name in required_keypoints and prob < 0.3:
                        print(f"Warning: Low confidence ({prob:.2f}) for required keypoint {landmark_name}")
                else:
                    # Add with zero visibility if below threshold
                    landmark_name = self.KEYPOINT_MAPPING[i]
                    
                    # Attempt to infer position using anatomical constraints if key points are missing
                    inferred_position = self._infer_missing_keypoint(i, landmark_dict)
                    
                    landmark_dict[landmark_name] = {
                        "x": float(inferred_position[0] if inferred_position else 0),
                        "y": float(inferred_position[1] if inferred_position else 0),
                        "z": 0.0,
                        "visibility": 0.05 if inferred_position else 0.0  # Lower visibility for inferred points
                    }
        except Exception as e:
            print(f"Error in OpenPose detection: {e}")
            raise RuntimeError(f"Pose detection failed: {str(e)}")
        
        # Create connections list for visualization
        connections = []
        for pair in self.POSE_PAIRS:
            from_idx, to_idx = pair
            
            if from_idx in self.KEYPOINT_MAPPING and to_idx in self.KEYPOINT_MAPPING:
                from_name = self.KEYPOINT_MAPPING[from_idx]
                to_name = self.KEYPOINT_MAPPING[to_idx]
                
                connections.append({
                    "from": from_name,
                    "to": to_name
                })
        
        return {
            "landmarks": landmark_dict,
            "connections": connections,
            "image_width": image_width,
            "image_height": image_height
        }
        
    
    def _infer_missing_keypoint(self, keypoint_idx, existing_landmarks):
        """
        Attempts to infer missing keypoint positions based on anatomical constraints
        and relationships between body parts
        
        Args:
            keypoint_idx: Index of the missing keypoint
            existing_landmarks: Dictionary of already detected landmarks
            
        Returns:
            (x, y) tuple of inferred position, or None if inference not possible
        """
        # Map keypoint index to name
        keypoint_name = self.KEYPOINT_MAPPING[keypoint_idx]
        
        # Define helper function to check if a landmark exists and is visible
        def is_valid(lm_name):
            return (lm_name in existing_landmarks and
                    existing_landmarks[lm_name]["visibility"] > 0.1 and
                    existing_landmarks[lm_name]["x"] != 0 and
                    existing_landmarks[lm_name]["y"] != 0)
        
        # Get position of a landmark
        def pos(lm_name):
            return (existing_landmarks[lm_name]["x"], existing_landmarks[lm_name]["y"])
        
        # Infer different keypoints based on their anatomical relationships
        
        # Nose (0)
        if keypoint_idx == 0:
            # If both eyes are visible, nose is between them but slightly lower
            if is_valid("LEFT_EYE") and is_valid("RIGHT_EYE"):
                left_eye = pos("LEFT_EYE")
                right_eye = pos("RIGHT_EYE")
                return ((left_eye[0] + right_eye[0]) / 2,
                        (left_eye[1] + right_eye[1]) / 2 + 10)  # Slightly below eyes
        
        # Neck (1)
        elif keypoint_idx == 1:
            # If shoulders are visible, neck is between them but slightly higher
            if is_valid("LEFT_SHOULDER") and is_valid("RIGHT_SHOULDER"):
                left_shoulder = pos("LEFT_SHOULDER")
                right_shoulder = pos("RIGHT_SHOULDER")
                return ((left_shoulder[0] + right_shoulder[0]) / 2,
                        (left_shoulder[1] + right_shoulder[1]) / 2 - 15)  # Above shoulders
        
        # Right Shoulder (2)
        elif keypoint_idx == 2:
            # If neck and right elbow are visible
            if is_valid("NECK") and is_valid("RIGHT_ELBOW"):
                neck = pos("NECK")
                right_elbow = pos("RIGHT_ELBOW")
                # Shoulder is between neck and elbow but closer to neck
                return (neck[0] + (right_elbow[0] - neck[0]) * 0.25,
                        neck[1] + (right_elbow[1] - neck[1]) * 0.25)
        
        # Left Shoulder (5)
        elif keypoint_idx == 5:
            # If neck and left elbow are visible
            if is_valid("NECK") and is_valid("LEFT_ELBOW"):
                neck = pos("NECK")
                left_elbow = pos("LEFT_ELBOW")
                # Shoulder is between neck and elbow but closer to neck
                return (neck[0] + (left_elbow[0] - neck[0]) * 0.25,
                        neck[1] + (left_elbow[1] - neck[1]) * 0.25)
        
        # Right Hip (8)
        elif keypoint_idx == 8:
            # If right knee and right shoulder are visible
            if is_valid("RIGHT_KNEE") and is_valid("RIGHT_SHOULDER"):
                right_knee = pos("RIGHT_KNEE")
                right_shoulder = pos("RIGHT_SHOULDER")
                # Hip is between shoulder and knee
                return (right_shoulder[0] + (right_knee[0] - right_shoulder[0]) * 0.33,
                        right_shoulder[1] + (right_knee[1] - right_shoulder[1]) * 0.33)
        
        # Left Hip (11)
        elif keypoint_idx == 11:
            # If left knee and left shoulder are visible
            if is_valid("LEFT_KNEE") and is_valid("LEFT_SHOULDER"):
                left_knee = pos("LEFT_KNEE")
                left_shoulder = pos("LEFT_SHOULDER")
                # Hip is between shoulder and knee
                return (left_shoulder[0] + (left_knee[0] - left_shoulder[0]) * 0.33,
                        left_shoulder[1] + (left_knee[1] - left_shoulder[1]) * 0.33)
        
        # If we can't infer the position using anatomical constraints, we'll look at symmetry
        
        # Check if we can infer based on symmetry (right/left counterparts)
        symmetric_pairs = {
            2: 5,  # Right/Left Shoulder
            3: 6,  # Right/Left Elbow
            4: 7,  # Right/Left Wrist
            8: 11, # Right/Left Hip
            9: 12, # Right/Left Knee
            10: 13, # Right/Left Ankle
            14: 15, # Right/Left Eye
            16: 17  # Right/Left Ear
        }
        
        # Create a reverse mapping as well
        reverse_pairs = {v: k for k, v in symmetric_pairs.items()}
        symmetric_pairs.update(reverse_pairs)
        
        # Check if we can use symmetry
        if keypoint_idx in symmetric_pairs:
            symmetric_idx = symmetric_pairs[keypoint_idx]
            symmetric_name = self.KEYPOINT_MAPPING[symmetric_idx]
            
            # If the symmetric keypoint exists and is visible
            if is_valid(symmetric_name):
                symmetric_pos = pos(symmetric_name)
                
                # For right/left pairs, we need to reflect across the vertical midline
                # We can approximate this using other visible midline points
                midline_y = symmetric_pos[1]  # Same height
                
                # Find the midline x-coordinate
                midline_x = None
                
                # Try to find midline using nose/neck
                if is_valid("NOSE"):
                    midline_x = pos("NOSE")[0]
                elif is_valid("NECK"):
                    midline_x = pos("NECK")[0]
                # If we have both shoulders or both hips, use their midpoint
                elif is_valid("LEFT_SHOULDER") and is_valid("RIGHT_SHOULDER"):
                    midline_x = (pos("LEFT_SHOULDER")[0] + pos("RIGHT_SHOULDER")[0]) / 2
                elif is_valid("LEFT_HIP") and is_valid("RIGHT_HIP"):
                    midline_x = (pos("LEFT_HIP")[0] + pos("RIGHT_HIP")[0]) / 2
                
                if midline_x is not None:
                    # Reflect the x-coordinate across the midline
                    reflected_x = midline_x + (midline_x - symmetric_pos[0])
                    return (reflected_x, midline_y)
        
        # If we get here, we couldn't infer the position
        return None
        
    def draw_pose(self, image, landmarks):
        """
        Draw pose keypoints and connections on the image
        
        Args:
            image: numpy array of the image (BGR format)
            landmarks: dictionary of landmarks from detect_pose
            
        Returns:
            image with pose drawn on it
        """
        img_copy = image.copy()
        
        # Draw keypoints
        for name, data in landmarks.items():
            if data["visibility"] > 0.1:
                x, y = int(data["x"]), int(data["y"])
                cv2.circle(img_copy, (x, y), 5, (0, 255, 255), -1)
                cv2.putText(img_copy, name, (x, y - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0), 1)
        
        # Draw connections
        for pair in self.POSE_PAIRS:
            from_idx, to_idx = pair
            
            if from_idx in self.KEYPOINT_MAPPING and to_idx in self.KEYPOINT_MAPPING:
                from_name = self.KEYPOINT_MAPPING[from_idx]
                to_name = self.KEYPOINT_MAPPING[to_idx]
                
                if (from_name in landmarks and to_name in landmarks and 
                    landmarks[from_name]["visibility"] > 0.1 and 
                    landmarks[to_name]["visibility"] > 0.1):
                    
                    from_x, from_y = int(landmarks[from_name]["x"]), int(landmarks[from_name]["y"])
                    to_x, to_y = int(landmarks[to_name]["x"]), int(landmarks[to_name]["y"])
                    
                    cv2.line(img_copy, (from_x, from_y), (to_x, to_y), (0, 255, 0), 2)
        
        return img_copy