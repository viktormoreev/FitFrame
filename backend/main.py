from fastapi import FastAPI, UploadFile, File, HTTPException, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import numpy as np
import cv2
from PIL import Image
import io
import json
import os
from typing import Optional, List, Dict, Any, Union
from openpose_utils import OpenPoseDetector
from pydantic import BaseModel

app = FastAPI(title="Size Prediction API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origin
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize OpenPose detector
pose_detector = None

def initialize_pose_detector():
    global pose_detector
    try:
        pose_detector = OpenPoseDetector()
        print("OpenPose detector initialized successfully")
        if hasattr(pose_detector, 'demo_mode') and pose_detector.demo_mode:
            print("Running in DEMO mode with synthetic poses - model weights not found")
        return True
    except Exception as e:
        print(f"Error initializing OpenPose detector: {e}")
        print("Please make sure the model files are downloaded correctly.")
        # We'll create the detector in demo mode
        try:
            # Force demo mode
            pose_detector = OpenPoseDetector()
            pose_detector.demo_mode = True
            print("Falling back to DEMO mode with synthetic poses")
            return True
        except Exception as e2:
            print(f"Could not initialize even in demo mode: {e2}")
            return False

# Try to initialize detector now
initialize_pose_detector()

# Load size charts
try:
    with open(os.path.join(os.path.dirname(__file__), '..', 'data', 'size_charts.json'), 'r') as f:
        SIZE_CHARTS = json.load(f)
except Exception as e:
    print(f"Error loading size charts: {e}")
    SIZE_CHARTS = {}

# Key body points from MediaPipe
# For waist: we'll use the midpoint between left_hip and right_hip
# For hips: we'll use the width between left_hip and right_hip
# For inseam: we'll use the distance between hip and ankle

class FixedPoseModeResponse(BaseModel):
    enabled: bool
    message: str

@app.get("/")
async def root():
    return {"message": "Size Prediction API is running"}

@app.post("/detect-pose/")
async def detect_pose(image: UploadFile = File(...)):
    """
    Detect pose landmarks in an image and return their coordinates using OpenPose
    
    Returns:
        JSON with landmarks and connections or error details
    """
    global pose_detector
    
    try:
        # Validate input file
        if not image.content_type.startswith('image/'):
            raise HTTPException(
                status_code=400,
                detail="File must be an image (JPEG, PNG, etc.)"
            )
            
        # If detector is not initialized, try to initialize it
        if pose_detector is None:
            if not initialize_pose_detector():
                raise HTTPException(
                    status_code=503,
                    detail="Could not initialize OpenPose detector. Please ensure model weights are downloaded."
                )

        # Verify detector is properly initialized
        if not hasattr(pose_detector, 'net') or pose_detector.net is None:
            raise HTTPException(
                status_code=503,
                detail="OpenPose model not loaded. Check model files in backend/models/openpose/"
            )
            
        # Read and process the image
        contents = await image.read()
        img = Image.open(io.BytesIO(contents))
        img_rgb = img.convert('RGB')
        img_np = np.array(img_rgb)
        
        # Convert from RGB to BGR (OpenCV format)
        img_bgr = cv2.cvtColor(img_np, cv2.COLOR_RGB2BGR)
        
        # Process the image with OpenPose
        results = pose_detector.detect_pose(img_bgr)
        
        # Validate required landmarks
        required_landmarks = ["LEFT_SHOULDER", "RIGHT_SHOULDER",
                           "LEFT_HIP", "RIGHT_HIP",
                           "LEFT_KNEE", "LEFT_ANKLE"]
        missing_landmarks = []
        
        for lm in required_landmarks:
            if lm not in results["landmarks"] or results["landmarks"][lm]["visibility"] < 0.3:
                missing_landmarks.append(lm)
        
        if missing_landmarks:
            raise HTTPException(
                status_code=400,
                detail=f"Missing or low-confidence landmarks: {', '.join(missing_landmarks)}. " +
                      "Please ensure full body is visible in the image."
            )
        
        # If we're in demo mode, add a warning to the response
        if hasattr(pose_detector, 'demo_mode') and pose_detector.demo_mode:
            results["warning"] = "Using synthetic pose data - model files not found"
            
        return results
        
    except Exception as e:
        import traceback
        error_details = traceback.format_exc()
        print(f"ERROR in detect_pose: {str(e)}\n{error_details}")
        raise HTTPException(status_code=500, detail=str(e))



@app.get("/fixed-pose-mode-status")
async def get_fixed_pose_mode_status():
    """
    Get current status of fixed pose mode
    
    Returns:
        JSONResponse with status and message
    """
    global pose_detector
    
    try:
        # Initialize detector if needed
        if pose_detector is None:
            print("Initializing OpenPose detector...")
            if not initialize_pose_detector():
                return JSONResponse(
                    status_code=503,
                    content={
                        "error": "OpenPose detector not initialized",
                        "message": "Please check server logs and model files"
                    }
                )
        
        # Check for required attributes
        if not hasattr(pose_detector, 'fixed_pose_mode'):
            pose_detector.fixed_pose_mode = False
            
        if not hasattr(pose_detector, 'reference_landmarks'):
            pose_detector.reference_landmarks = None
            
        # Get current status
        has_reference = pose_detector.reference_landmarks is not None
        is_enabled = pose_detector.fixed_pose_mode
        
        return JSONResponse({
            "fixed_pose_mode": is_enabled,
            "has_reference_pose": has_reference,
            "message": (
                "Fixed pose mode is enabled and using reference pose" if is_enabled and has_reference else
                "Fixed pose mode is disabled" if not is_enabled else
                "Fixed pose mode is enabled but no reference pose has been set"
            ),
            "demo_mode": getattr(pose_detector, 'demo_mode', False)
        })
        
    except Exception as e:
        import traceback
        error_details = traceback.format_exc()
        print(f"ERROR in fixed_pose_mode_status: {str(e)}\n{error_details}")
        return JSONResponse(
            status_code=500,
            content={
                "error": "Internal server error",
                "message": str(e),
                "details": error_details
            }
        )


@app.post("/predict-size/")
async def predict_size(
    image: UploadFile = File(...),
    height_cm: float = Form(...),  # Making height mandatory
    side_image: UploadFile = File(...)  # Side view image is now required
):
    global pose_detector
    
    try:
        # If detector is not initialized, try to initialize it
        if pose_detector is None:
            if not initialize_pose_detector():
                raise HTTPException(status_code=500, detail="Could not initialize OpenPose detector. Please check server logs.")
            
        # Read and process the front view image
        contents = await image.read()
        try:
            img = Image.open(io.BytesIO(contents))
            img_rgb = img.convert('RGB')
            img_np = np.array(img_rgb)
            
            # Convert from RGB to BGR (OpenCV format)
            img_bgr = cv2.cvtColor(img_np, cv2.COLOR_RGB2BGR)
        except Exception as img_error:
            raise HTTPException(
                status_code=400,
                detail=f"Failed to process front view image: {str(img_error)}"
            )
        
        # Process the front view image with OpenPose
        try:
            front_results = pose_detector.detect_pose(img_bgr)
            
            if not front_results["landmarks"] or len(front_results["landmarks"]) == 0:
                raise HTTPException(
                    status_code=400,
                    detail="No person detected in the front view image. Try a clearer photo with full body visible."
                )
        except Exception as pose_error:
            raise HTTPException(
                status_code=500,
                detail=f"Front view pose detection failed: {str(pose_error)}"
            )
        
        # Process side view image (now required)
        side_results = None
        side_img_np = None
        side_contents = await side_image.read()
        try:
            side_img = Image.open(io.BytesIO(side_contents))
            side_img_rgb = side_img.convert('RGB')
            side_img_np = np.array(side_img_rgb)
            
            # Convert from RGB to BGR (OpenCV format)
            side_img_bgr = cv2.cvtColor(side_img_np, cv2.COLOR_RGB2BGR)
            
            # Process the side view image with OpenPose
            side_results = pose_detector.detect_pose(side_img_bgr)
            
            if not side_results["landmarks"] or len(side_results["landmarks"]) == 0:
                raise HTTPException(
                    status_code=400,
                    detail="No person detected in the side view image. Try a clearer side view photo."
                )
        except Exception as side_img_error:
            raise HTTPException(
                status_code=400,
                detail=f"Failed to process side view image: {str(side_img_error)}"
            )
        
        # If we're in demo mode, log a warning
        if hasattr(pose_detector, 'demo_mode') and pose_detector.demo_mode:
            print("WARNING: Using synthetic pose data for size prediction")
            
        # Extract landmarks from front view results
        landmarks = front_results["landmarks"]
        
        # Get image dimensions for scaling
        image_height, image_width, _ = img_np.shape
        
        # Check if key landmarks are detected with sufficient visibility
        required_landmarks = ["LEFT_SHOULDER", "RIGHT_SHOULDER", "LEFT_HIP", "RIGHT_HIP", "LEFT_KNEE", "LEFT_ANKLE"]
        missing_landmarks = []
        
        for lm in required_landmarks:
            if lm not in landmarks or landmarks[lm]["visibility"] < 0.1:
                missing_landmarks.append(lm)
                
        if missing_landmarks:
            print(f"Missing or low confidence landmarks: {', '.join(missing_landmarks)}")
            
            # Try to use the available landmarks or defaults
            for lm in missing_landmarks:
                if lm not in landmarks:
                    # Initialize with default position at image center if completely missing
                    landmarks[lm] = {
                        "x": image_width / 2,
                        "y": image_height / 2,
                        "z": 0.0,
                        "visibility": 0.1  # Just above threshold
                    }
                else:
                    # If exists but low visibility, boost it to threshold
                    landmarks[lm]["visibility"] = 0.1
        
        # Calculate pixel coordinates for key points
        left_shoulder = (landmarks["LEFT_SHOULDER"]["x"], landmarks["LEFT_SHOULDER"]["y"])
        right_shoulder = (landmarks["RIGHT_SHOULDER"]["x"], landmarks["RIGHT_SHOULDER"]["y"])
        left_hip = (landmarks["LEFT_HIP"]["x"], landmarks["LEFT_HIP"]["y"])
        right_hip = (landmarks["RIGHT_HIP"]["x"], landmarks["RIGHT_HIP"]["y"])
        left_knee = (landmarks["LEFT_KNEE"]["x"], landmarks["LEFT_KNEE"]["y"])
        left_ankle = (landmarks["LEFT_ANKLE"]["x"], landmarks["LEFT_ANKLE"]["y"])
        
        # Step 1: Calculate basic measurements in pixels
        hip_width_px = np.sqrt((right_hip[0] - left_hip[0])**2 + (right_hip[1] - left_hip[1])**2)
        shoulder_width_px = np.sqrt((right_shoulder[0] - left_shoulder[0])**2 + (right_shoulder[1] - left_shoulder[1])**2)
        inseam_px = np.sqrt((left_hip[0] - left_ankle[0])**2 + (left_hip[1] - left_ankle[1])**2)
        
        # Step 2: Calculate body proportions for body type determination
        shoulder_hip_ratio = shoulder_width_px / hip_width_px
        print(f"Shoulder-to-hip ratio: {shoulder_hip_ratio:.2f}")
        
        # Step 3: Determine body type and set appropriate parameters with more granularity
        # Use a more granular approach to body type classification
        if shoulder_hip_ratio > 1.5:  # Very V-shaped/athletic body
            body_type = "very_athletic"
            waist_y_offset = 0.33  # Waist is lower (closer to hips)
            bust_multiplier = 1.08  # Bust calculation relative to shoulders
            hip_circumference_multiplier = 2.25
            waist_circumference_multiplier = 2.15
            bust_circumference_multiplier = 2.45
        elif shoulder_hip_ratio > 1.3:  # Athletic body
            body_type = "athletic"
            waist_y_offset = 0.35  # Waist is lower (closer to hips)
            bust_multiplier = 1.05  # Bust calculation relative to shoulders
            hip_circumference_multiplier = 2.3
            waist_circumference_multiplier = 2.2
            bust_circumference_multiplier = 2.4
        elif shoulder_hip_ratio > 1.1:  # Slightly athletic
            body_type = "slightly_athletic"
            waist_y_offset = 0.38  # Waist position
            bust_multiplier = 1.0  # Bust calculation
            hip_circumference_multiplier = 2.4
            waist_circumference_multiplier = 2.3
            bust_circumference_multiplier = 2.45
        elif shoulder_hip_ratio > 0.9:  # Balanced proportions
            body_type = "balanced"
            waist_y_offset = 0.4  # Middle position
            bust_multiplier = 0.5  # Average of shoulders and hips
            hip_circumference_multiplier = 2.5
            waist_circumference_multiplier = 2.4
            bust_circumference_multiplier = 2.5
        elif shoulder_hip_ratio > 0.8:  # Slightly pear-shaped
            body_type = "slightly_pear"
            waist_y_offset = 0.42  # Waist position
            bust_multiplier = 0.97  # Bust calculation
            hip_circumference_multiplier = 2.6
            waist_circumference_multiplier = 2.35
            bust_circumference_multiplier = 2.35
        else:  # More pear-shaped body
            body_type = "pear"
            waist_y_offset = 0.45  # Waist is higher (closer to ribcage)
            bust_multiplier = 0.95  # Bust calculation relative to hips
            hip_circumference_multiplier = 2.7
            waist_circumference_multiplier = 2.4
            bust_circumference_multiplier = 2.3
            
        print(f"Body type determined: {body_type} (shoulder-hip ratio: {shoulder_hip_ratio:.2f})")
        
        # Step 4: Calculate waist position
        torso_length_left = abs(left_hip[1] - left_shoulder[1])
        torso_length_right = abs(right_hip[1] - right_shoulder[1])
        
        left_waist_distance = torso_length_left * waist_y_offset
        right_waist_distance = torso_length_right * waist_y_offset
        
        left_waist = (left_hip[0], left_hip[1] - left_waist_distance)
        right_waist = (right_hip[0], right_hip[1] - right_waist_distance)
        
        # Step 5: Calculate waist width and bust width
        waist_width_px = np.sqrt((right_waist[0] - left_waist[0])**2 + (right_waist[1] - left_waist[1])**2)
        
        # Calculate bust based on body type
        if body_type == "athletic":
            bust_width_px = shoulder_width_px * bust_multiplier
        elif body_type == "pear":
            bust_width_px = hip_width_px * bust_multiplier
        else:  # balanced
            bust_width_px = (shoulder_width_px + hip_width_px) * bust_multiplier
        
        # Step 6: Calculate height and scaling factor
        body_height_px = np.sqrt((left_shoulder[0] - left_ankle[0])**2 + (left_shoulder[1] - left_ankle[1])**2) * 1.2
        scaling_factor = 1.0
        
        if height_cm:
            # Use provided height for more accurate scaling
            scaling_factor = height_cm / body_height_px
        else:
            # Estimate height based on body type
            if body_type == "athletic":
                shoulder_to_height_ratio = 4.8  # Athletic builds tend to have wider shoulders relative to height
            elif body_type == "pear":
                shoulder_to_height_ratio = 5.2  # Pear shapes tend to have narrower shoulders relative to height
            else:
                shoulder_to_height_ratio = 5.0  # Balanced proportions
                
            estimated_height_cm = shoulder_width_px * shoulder_to_height_ratio
            
            # Adjust based on apparent gender cues from body proportions
            if shoulder_hip_ratio > 1.0:  # More likely male proportions
                estimated_height_cm *= 1.08  # Males tend to be taller
            
            # Calculate scaling factor based on estimated height
            scaling_factor = estimated_height_cm / body_height_px
            
            print(f"Estimated height: {estimated_height_cm:.1f}cm (based on image proportions)")
        
        # Step 7: Incorporate side view measurements if available
        side_depth_adjustments = {
            "hip": 1.0,
            "waist": 1.0,
            "bust": 1.0
        }
        
        if side_results and side_img_np is not None:
            side_landmarks = side_results["landmarks"]
            side_height, side_width, _ = side_img_np.shape
            
            # Check if we have the necessary landmarks in the side view
            side_required = ["LEFT_HIP", "LEFT_SHOULDER", "NECK"]
            has_required_side_landmarks = all(lm in side_landmarks and side_landmarks[lm]["visibility"] > 0.1 for lm in side_required)
            
            if has_required_side_landmarks:
                print("Using side view data to improve measurements")
                
                # Get key points from side view
                side_hip = (side_landmarks["LEFT_HIP"]["x"], side_landmarks["LEFT_HIP"]["y"])
                side_shoulder = (side_landmarks["LEFT_SHOULDER"]["x"], side_landmarks["LEFT_SHOULDER"]["y"])
                
                # Calculate depth (anterior-posterior dimension) at hip level
                # We'll use the width of the person at hip level in the side view
                # This is an approximation of the depth
                hip_depth_px = side_width * 0.15  # Default estimate if we can't detect properly
                
                # Try to detect the actual depth by analyzing the silhouette at hip level
                hip_y = int(side_hip[1])
                if 0 <= hip_y < side_height:
                    # Get the row of pixels at hip height
                    hip_row = side_img_np[hip_y, :, :]
                    
                    # Convert to grayscale and threshold to find the silhouette
                    hip_row_gray = cv2.cvtColor(hip_row.reshape(1, side_width, 3), cv2.COLOR_RGB2GRAY)
                    _, hip_row_thresh = cv2.threshold(hip_row_gray, 127, 255, cv2.THRESH_BINARY_INV)
                    
                    # Find the leftmost and rightmost non-zero pixels
                    non_zero_indices = np.where(hip_row_thresh[0, :] > 0)[0]
                    if len(non_zero_indices) > 0:
                        leftmost = non_zero_indices[0]
                        rightmost = non_zero_indices[-1]
                        hip_depth_px = rightmost - leftmost
                
                # Calculate depth at waist level
                waist_y = int(side_hip[1] - (side_hip[1] - side_shoulder[1]) * waist_y_offset)
                waist_depth_px = side_width * 0.12  # Default estimate
                
                if 0 <= waist_y < side_height:
                    # Get the row of pixels at waist height
                    waist_row = side_img_np[waist_y, :, :]
                    
                    # Convert to grayscale and threshold to find the silhouette
                    waist_row_gray = cv2.cvtColor(waist_row.reshape(1, side_width, 3), cv2.COLOR_RGB2GRAY)
                    _, waist_row_thresh = cv2.threshold(waist_row_gray, 127, 255, cv2.THRESH_BINARY_INV)
                    
                    # Find the leftmost and rightmost non-zero pixels
                    non_zero_indices = np.where(waist_row_thresh[0, :] > 0)[0]
                    if len(non_zero_indices) > 0:
                        leftmost = non_zero_indices[0]
                        rightmost = non_zero_indices[-1]
                        waist_depth_px = rightmost - leftmost
                
                # Calculate depth at bust level
                bust_y = int(side_shoulder[1] + (side_hip[1] - side_shoulder[1]) * 0.25)
                bust_depth_px = side_width * 0.14  # Default estimate
                
                if 0 <= bust_y < side_height:
                    # Get the row of pixels at bust height
                    bust_row = side_img_np[bust_y, :, :]
                    
                    # Convert to grayscale and threshold to find the silhouette
                    bust_row_gray = cv2.cvtColor(bust_row.reshape(1, side_width, 3), cv2.COLOR_RGB2GRAY)
                    _, bust_row_thresh = cv2.threshold(bust_row_gray, 127, 255, cv2.THRESH_BINARY_INV)
                    
                    # Find the leftmost and rightmost non-zero pixels
                    non_zero_indices = np.where(bust_row_thresh[0, :] > 0)[0]
                    if len(non_zero_indices) > 0:
                        leftmost = non_zero_indices[0]
                        rightmost = non_zero_indices[-1]
                        bust_depth_px = rightmost - leftmost
                
                # Calculate the ratio of depth to width for each measurement
                # This will help us adjust the circumference calculations
                hip_depth_to_width_ratio = hip_depth_px / hip_width_px
                waist_depth_to_width_ratio = waist_depth_px / waist_width_px
                bust_depth_to_width_ratio = bust_depth_px / bust_width_px
                
                # Adjust the circumference multipliers based on the depth-to-width ratios
                # The idea is to make the circumference calculation more accurate by considering
                # the actual shape of the body in 3D
                side_depth_adjustments["hip"] = 0.5 + hip_depth_to_width_ratio
                side_depth_adjustments["waist"] = 0.5 + waist_depth_to_width_ratio
                side_depth_adjustments["bust"] = 0.5 + bust_depth_to_width_ratio
                
                print(f"Side view depth adjustments: hip={side_depth_adjustments['hip']:.2f}, " +
                      f"waist={side_depth_adjustments['waist']:.2f}, bust={side_depth_adjustments['bust']:.2f}")
        
        # Step 8: Calculate final measurements using the scaling factor, body type-specific multipliers,
        # and side view depth adjustments if available
        hip_circumference_cm = hip_width_px * scaling_factor * hip_circumference_multiplier * side_depth_adjustments["hip"]
        waist_circumference_cm = waist_width_px * scaling_factor * waist_circumference_multiplier * side_depth_adjustments["waist"]
        inseam_cm = inseam_px * scaling_factor
        bust_circumference_cm = bust_width_px * scaling_factor * bust_circumference_multiplier * side_depth_adjustments["bust"]
        
        # Determine sizes based on measurements
        jeans_size = determine_jeans_size(waist_circumference_cm, hip_circumference_cm)
        dress_size = determine_dress_size(bust_circumference_cm, waist_circumference_cm, hip_circumference_cm)
        skirt_size = determine_skirt_size(waist_circumference_cm, hip_circumference_cm)
        
        # Get detailed size information including EU and UK sizes
        jeans_details = get_size_details("jeans", jeans_size)
        dress_details = get_size_details("dresses", dress_size)
        skirt_details = get_size_details("skirts", skirt_size)
        
        return {
            "measurements": {
                "waist": round(waist_circumference_cm, 1),
                "hip": round(hip_circumference_cm, 1),
                "inseam": round(inseam_cm, 1),
                "bust": round(bust_circumference_cm, 1)
            },
            "sizes": {
                "jeans": {
                    "us": jeans_size,
                    "eu": jeans_details.get("eu_size", ""),
                    "uk": jeans_details.get("uk_size", "")
                },
                "dress": {
                    "us": dress_size,
                    "eu": dress_details.get("eu_size", ""),
                    "uk": dress_details.get("uk_size", "")
                },
                "skirt": {
                    "us": skirt_size,
                    "eu": skirt_details.get("eu_size", ""),
                    "uk": skirt_details.get("uk_size", "")
                }
            }
        }
        
    except Exception as e:
        import traceback
        error_details = traceback.format_exc()
        print(f"ERROR in predict_size: {str(e)}\n{error_details}")
        
        # Check if error is related to model loading
        if "OpenPose model not loaded" in str(e):
            raise HTTPException(
                status_code=503,
                detail="OpenPose model not loaded. Please ensure model weights are downloaded and placed in the correct directory."
            )
        elif "No person detected" in str(e):
            raise HTTPException(
                status_code=400,
                detail="No person detected in the image. Please try with a clearer image."
            )
        else:
            raise HTTPException(
                status_code=500,
                detail=f"Error processing image: {str(e)}"
            )

def determine_jeans_size(waist_cm, hip_cm):
    """Determine jeans size based on waist and hip measurements with improved sensitivity"""
    best_match = None
    min_diff = float('inf')
    between_sizes = False
    between_size_lower = None
    between_size_upper = None
    
    # Prioritize waist measurement for jeans (70% waist, 30% hip)
    waist_weight = 0.7
    hip_weight = 0.3
    
    # Sort sizes for potential between-size determination
    size_data = []
    for size, data in SIZE_CHARTS.get("jeans", {}).get("size_mapping", {}).items():
        size_data.append((size, data))
    
    # Sort by waist measurement
    size_data.sort(key=lambda x: x[1]["waist"])
    
    # Find best match with weighted measurements
    for size, data in size_data:
        waist_diff = abs(data["waist"] - waist_cm) * waist_weight
        hip_diff = abs(data["hip"] - hip_cm) * hip_weight
        total_diff = waist_diff + hip_diff
        
        if total_diff < min_diff:
            min_diff = total_diff
            best_match = size
    
    # Check if measurements are between sizes
    for i in range(len(size_data) - 1):
        current_size, current_data = size_data[i]
        next_size, next_data = size_data[i + 1]
        
        if (current_data["waist"] <= waist_cm <= next_data["waist"]):
            # Calculate how close to each size
            lower_diff = abs(current_data["waist"] - waist_cm)
            upper_diff = abs(next_data["waist"] - waist_cm)
            total_range = next_data["waist"] - current_data["waist"]
            
            # If within 30% of either size, consider it between sizes
            if lower_diff / total_range <= 0.3 or upper_diff / total_range <= 0.3:
                between_sizes = True
                between_size_lower = current_size
                between_size_upper = next_size
                
                # If closer to upper size, use that as best match
                if upper_diff < lower_diff:
                    best_match = next_size
                else:
                    best_match = current_size
                break
    
    # Format the result
    result = best_match.replace("US_", "") if best_match else ""
    
    # Add between-size indicator if applicable
    if between_sizes:
        lower = between_size_lower.replace("US_", "")
        upper = between_size_upper.replace("US_", "")
        
        # If very close to one size (within 15% of range), don't show as between
        lower_diff = abs(SIZE_CHARTS["jeans"]["size_mapping"][between_size_lower]["waist"] - waist_cm)
        upper_diff = abs(SIZE_CHARTS["jeans"]["size_mapping"][between_size_upper]["waist"] - waist_cm)
        total_range = SIZE_CHARTS["jeans"]["size_mapping"][between_size_upper]["waist"] - SIZE_CHARTS["jeans"]["size_mapping"][between_size_lower]["waist"]
        
        if 0.15 < lower_diff / total_range < 0.85 and 0.15 < upper_diff / total_range < 0.85:
            result = f"{lower}-{upper}"
    
    print(f"Jeans size determination: waist={waist_cm:.1f}cm, hip={hip_cm:.1f}cm to size {result}")
    return result

def determine_dress_size(bust_cm, waist_cm, hip_cm):
    """Determine dress size based on bust, waist, and hip measurements with improved sensitivity"""
    best_match = None
    min_diff = float('inf')
    between_sizes = False
    between_size_lower = None
    between_size_upper = None
    
    # For dresses, weight measurements by importance
    bust_weight = 0.4   # Bust is most important for dresses
    waist_weight = 0.35 # Waist is second most important
    hip_weight = 0.25   # Hip is least important but still matters
    
    # Sort sizes for potential between-size determination
    size_data = []
    for size, data in SIZE_CHARTS.get("dresses", {}).get("size_mapping", {}).items():
        size_data.append((size, data))
    
    # Sort by bust measurement (primary factor for dresses)
    size_data.sort(key=lambda x: x[1]["bust"])
    
    # Find best match with weighted measurements
    for size, data in size_data:
        bust_diff = abs(data["bust"] - bust_cm) * bust_weight
        waist_diff = abs(data["waist"] - waist_cm) * waist_weight
        hip_diff = abs(data["hip"] - hip_cm) * hip_weight
        total_diff = bust_diff + waist_diff + hip_diff
        
        if total_diff < min_diff:
            min_diff = total_diff
            best_match = size
    
    # Check if measurements are between sizes
    for i in range(len(size_data) - 1):
        current_size, current_data = size_data[i]
        next_size, next_data = size_data[i + 1]
        
        # Check if bust measurement is between sizes
        if (current_data["bust"] <= bust_cm <= next_data["bust"]):
            # Calculate how close to each size
            lower_diff = abs(current_data["bust"] - bust_cm)
            upper_diff = abs(next_data["bust"] - bust_cm)
            total_range = next_data["bust"] - current_data["bust"]
            
            # If within 30% of either size, consider it between sizes
            if lower_diff / total_range <= 0.3 or upper_diff / total_range <= 0.3:
                between_sizes = True
                between_size_lower = current_size
                between_size_upper = next_size
                
                # If closer to upper size, use that as best match
                if upper_diff < lower_diff:
                    best_match = next_size
                else:
                    best_match = current_size
                break
    
    # Format the result
    result = best_match.split("/")[0].replace("US_", "") if best_match else ""
    
    # Add between-size indicator if applicable
    if between_sizes:
        lower = between_size_lower.split("/")[0].replace("US_", "")
        upper = between_size_upper.split("/")[0].replace("US_", "")
        
        # If very close to one size (within 15% of range), don't show as between
        lower_diff = abs(SIZE_CHARTS["dresses"]["size_mapping"][between_size_lower]["bust"] - bust_cm)
        upper_diff = abs(SIZE_CHARTS["dresses"]["size_mapping"][between_size_upper]["bust"] - bust_cm)
        total_range = SIZE_CHARTS["dresses"]["size_mapping"][between_size_upper]["bust"] - SIZE_CHARTS["dresses"]["size_mapping"][between_size_lower]["bust"]
        
        if 0.15 < lower_diff / total_range < 0.85 and 0.15 < upper_diff / total_range < 0.85:
            result = f"{lower}-{upper}"
    
    print(f"Dress size determination: bust={bust_cm:.1f}cm, waist={waist_cm:.1f}cm, hip={hip_cm:.1f}cm -> size {result}")
    return result

def determine_skirt_size(waist_cm, hip_cm):
    """Determine skirt size based on waist and hip measurements with improved sensitivity"""
    best_match = None
    min_diff = float('inf')
    between_sizes = False
    between_size_lower = None
    between_size_upper = None
    
    # For skirts, waist is more important than hip
    waist_weight = 0.65
    hip_weight = 0.35
    
    # Sort sizes for potential between-size determination
    size_data = []
    for size, data in SIZE_CHARTS.get("skirts", {}).get("size_mapping", {}).items():
        size_data.append((size, data))
    
    # Sort by waist measurement (primary factor for skirts)
    size_data.sort(key=lambda x: x[1]["waist"])
    
    # Find best match with weighted measurements
    for size, data in size_data:
        waist_diff = abs(data["waist"] - waist_cm) * waist_weight
        hip_diff = abs(data["hip"] - hip_cm) * hip_weight
        total_diff = waist_diff + hip_diff
        
        if total_diff < min_diff:
            min_diff = total_diff
            best_match = size
    
    # Check if measurements are between sizes
    for i in range(len(size_data) - 1):
        current_size, current_data = size_data[i]
        next_size, next_data = size_data[i + 1]
        
        # Check if waist measurement is between sizes
        if (current_data["waist"] <= waist_cm <= next_data["waist"]):
            # Calculate how close to each size
            lower_diff = abs(current_data["waist"] - waist_cm)
            upper_diff = abs(next_data["waist"] - waist_cm)
            total_range = next_data["waist"] - current_data["waist"]
            
            # If within 30% of either size, consider it between sizes
            if lower_diff / total_range <= 0.3 or upper_diff / total_range <= 0.3:
                between_sizes = True
                between_size_lower = current_size
                between_size_upper = next_size
                
                # If closer to upper size, use that as best match
                if upper_diff < lower_diff:
                    best_match = next_size
                else:
                    best_match = current_size
                break
    
    # Format the result
    result = best_match.split("/")[0].replace("US_", "") if best_match else ""
    
    # Add between-size indicator if applicable
    if between_sizes:
        lower = between_size_lower.split("/")[0].replace("US_", "")
        upper = between_size_upper.split("/")[0].replace("US_", "")
        
        # If very close to one size (within 15% of range), don't show as between
        lower_diff = abs(SIZE_CHARTS["skirts"]["size_mapping"][between_size_lower]["waist"] - waist_cm)
        upper_diff = abs(SIZE_CHARTS["skirts"]["size_mapping"][between_size_upper]["waist"] - waist_cm)
        total_range = SIZE_CHARTS["skirts"]["size_mapping"][between_size_upper]["waist"] - SIZE_CHARTS["skirts"]["size_mapping"][between_size_lower]["waist"]
        
        if 0.15 < lower_diff / total_range < 0.85 and 0.15 < upper_diff / total_range < 0.85:
            result = f"{lower}-{upper}"
    
    print(f"Skirt size determination: waist={waist_cm:.1f}cm, hip={hip_cm:.1f}cm -> size {result}")
    return result

def get_size_details(garment_type, size_code):
    """Get detailed size information for a given garment type and size code"""
    if not size_code:
        return {}
    
    # Add the US_ prefix back for lookup in the size chart
    lookup_code = f"US_{size_code}"
    
    # For dress and skirt sizes that might have format like "4/S", we need to handle differently
    if garment_type in ["dresses", "skirts"]:
        # Try exact match first
        size_mapping = SIZE_CHARTS.get(garment_type, {}).get("size_mapping", {})
        if lookup_code in size_mapping:
            return size_mapping.get(lookup_code, {})
        
        # Try with format like "US_4/S"
        for key in size_mapping.keys():
            if key.startswith(lookup_code + "/"):
                return size_mapping.get(key, {})
    else:
        # For jeans, just do direct lookup
        size_mapping = SIZE_CHARTS.get(garment_type, {}).get("size_mapping", {})
        return size_mapping.get(lookup_code, {})
    
    return {}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)