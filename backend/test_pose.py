import cv2
import numpy as np
import matplotlib.pyplot as plt
import os
from openpose_utils import OpenPoseDetector

def test_pose_detection(image_path):
    """
    Test OpenPose detection on a sample image
    
    Args:
        image_path: Path to the test image
    """
    # Check if file exists
    if not os.path.exists(image_path):
        print(f"Error: Image file not found at {image_path}")
        return False
    
    # Initialize OpenPose detector
    try:
        pose_detector = OpenPoseDetector()
        print("OpenPose detector initialized successfully")
    except Exception as e:
        print(f"Error initializing OpenPose detector: {e}")
        print("Please make sure the model files are downloaded correctly.")
        return False
    
    # Read the image
    try:
        image = cv2.imread(image_path)
        if image is None:
            print(f"Error: Unable to read image at {image_path}")
            return False
        
        # Process the image with OpenPose
        results = pose_detector.detect_pose(image)
        
        if not results["landmarks"] or len(results["landmarks"]) == 0:
            print("No pose landmarks detected in the image.")
            return False
        
        print(f"Successfully detected pose in {image_path}")
        
        # Draw pose landmarks on the image using our utility
        annotated_image = pose_detector.draw_pose(image, results["landmarks"])
        
        # Convert to RGB for matplotlib display
        annotated_image_rgb = cv2.cvtColor(annotated_image, cv2.COLOR_BGR2RGB)
        
        # Display the image with landmarks
        plt.figure(figsize=(10, 10))
        plt.imshow(annotated_image_rgb)
        plt.title('OpenPose Landmarks')
        plt.axis('off')
        
        # Save the annotated image
        output_path = os.path.join(os.path.dirname(image_path), 'pose_detected.jpg')
        cv2.imwrite(output_path, annotated_image)
        print(f"Saved annotated image to {output_path}")
        
        return True
    
    except Exception as e:
        print(f"Error processing image: {e}")
        return False

if __name__ == "__main__":
    # Create a test_images directory if it doesn't exist
    test_dir = os.path.join(os.path.dirname(__file__), '..', 'test_images')
    os.makedirs(test_dir, exist_ok=True)
    
    # Default test image path - you need to add a test image here
    test_image = os.path.join(test_dir, 'test_image.jpg')
    
    print("OpenPose Detection Test")
    print("======================")
    print(f"Testing image: {test_image}")
    print("Note: You need to add a test image to run this script")
    print("Make sure the OpenPose model files are downloaded correctly.")
    print("======================")
    
    if os.path.exists(test_image):
        success = test_pose_detection(test_image)
        if success:
            print("✅ Test completed successfully!")
        else:
            print("❌ Test failed.")
            print("\nPossible solutions:")
            print("1. Make sure you've downloaded the OpenPose model files correctly.")
            print("2. Run the download_models.py script to get the necessary model files.")
            print("3. Check if the person is clearly visible in the image.")
    else:
        print(f"Please add a test image at {test_image}")
        print("You can use any full-body image for testing.")