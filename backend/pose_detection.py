from openpose_utils import OpenPoseDetector
import cv2
import numpy as np

# Global pose detector instance
pose_detector = None

def initialize_pose_detector():
    """Initialize the OpenPose detector"""
    global pose_detector
    try:
        pose_detector = OpenPoseDetector()
        print("OpenPose detector initialized successfully")
        if hasattr(pose_detector, 'demo_mode') and pose_detector.demo_mode:
            print("Running in DEMO mode with synthetic poses - model weights not found")
        return pose_detector
    except Exception as e:
        print(f"Error initializing OpenPose detector: {e}")
        print("Please make sure the model files are downloaded correctly.")
        # We'll create the detector in demo mode
        try:
            # Force demo mode
            pose_detector = OpenPoseDetector()
            pose_detector.demo_mode = True
            print("Falling back to DEMO mode with synthetic poses")
            return pose_detector
        except Exception as e2:
            print(f"Could not initialize even in demo mode: {e2}")
            return None

def detect_pose_in_image(detector, img_bgr):
    """
    Detect pose landmarks in an image using OpenPose
    
    Args:
        detector: OpenPose detector instance
        img_bgr: Image in BGR format (OpenCV)
        
    Returns:
        Dictionary containing landmarks and connections
    """
    return detector.detect_pose(img_bgr)