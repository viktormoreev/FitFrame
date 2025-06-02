"""
Test script for the fixed pose mode feature

This script demonstrates how to:
1. Set a reference pose from an image
2. Toggle fixed pose mode
3. Get pose detection using the fixed reference points

Usage:
    python test_fixed_pose.py [reference_image_path] [test_image_path]
"""

import sys
import os
import cv2
import numpy as np
from openpose_utils import OpenPoseDetector

def main():
    # Check arguments
    if len(sys.argv) < 3:
        print("Usage: python test_fixed_pose.py [reference_image_path] [test_image_path]")
        print("Example: python test_fixed_pose.py ../test_images/reference.jpg ../test_images/test.jpg")
        sys.exit(1)
    
    reference_image_path = sys.argv[1]
    test_image_path = sys.argv[2]
    
    # Check if files exist
    if not os.path.exists(reference_image_path):
        print(f"Reference image not found: {reference_image_path}")
        sys.exit(1)
    
    if not os.path.exists(test_image_path):
        print(f"Test image not found: {test_image_path}")
        sys.exit(1)
    
    print("\n=== Fixed Pose Mode Test ===\n")
    
    # Initialize detector
    print("Initializing OpenPose detector...")
    detector = OpenPoseDetector()
    
    # Load reference image
    print(f"Loading reference image: {reference_image_path}")
    reference_img = cv2.imread(reference_image_path)
    if reference_img is None:
        print("Failed to load reference image")
        sys.exit(1)
    
    # Detect pose in reference image (normal mode)
    print("\nDetecting pose in reference image (normal mode)...")
    reference_results = detector.detect_pose(reference_img)
    
    # Set as reference pose
    print("\nSetting reference pose...")
    success = detector.set_reference_pose(reference_img)
    if not success:
        print("Failed to set reference pose")
        sys.exit(1)
    print("Reference pose set successfully")
    print(f"Fixed pose mode: {detector.fixed_pose_mode}")
    
    # Load test image
    print(f"\nLoading test image: {test_image_path}")
    test_img = cv2.imread(test_image_path)
    if test_img is None:
        print("Failed to load test image")
        sys.exit(1)
    
    # Run detection with fixed pose mode
    print("\nRunning detection with fixed pose mode...")
    fixed_results = detector.detect_pose(test_img)
    
    # Compare results
    print("\n=== Comparison ===")
    print(f"Reference image size: {reference_img.shape[1]}x{reference_img.shape[0]}")
    print(f"Test image size: {test_img.shape[1]}x{test_img.shape[0]}")
    
    # Visualize results
    print("\nVisualizing results...")
    
    # Draw pose on reference image
    reference_viz = detector.draw_pose(reference_img, reference_results["landmarks"])
    # Draw fixed pose on test image
    test_viz = detector.draw_pose(test_img, fixed_results["landmarks"])
    
    # Create side-by-side comparison
    height = max(reference_viz.shape[0], test_viz.shape[0])
    width = reference_viz.shape[1] + test_viz.shape[1]
    comparison = np.zeros((height, width, 3), dtype=np.uint8)
    
    # Copy images to the comparison
    comparison[:reference_viz.shape[0], :reference_viz.shape[1]] = reference_viz
    comparison[:test_viz.shape[0], reference_viz.shape[1]:reference_viz.shape[1]+test_viz.shape[1]] = test_viz
    
    # Add labels
    cv2.putText(comparison, "Reference Image", (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 255), 2)
    cv2.putText(comparison, "Test Image (Fixed Pose)", (reference_viz.shape[1] + 10, 30), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 255), 2)
    
    # Save and show results
    output_path = "fixed_pose_comparison.jpg"
    cv2.imwrite(output_path, comparison)
    print(f"Comparison saved to: {output_path}")
    
    # Try to display the image if possible
    try:
        cv2.imshow("Fixed Pose Mode Comparison", comparison)
        print("Press any key to exit...")
        cv2.waitKey(0)
        cv2.destroyAllWindows()
    except:
        print("Could not display image. Check the saved comparison file.")

if __name__ == "__main__":
    main()