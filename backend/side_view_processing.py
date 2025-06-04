import cv2
import numpy as np

def process_side_view(landmarks, side_img_np, waist_y_offset):
    """
    Process side view image to get depth measurements
    
    Args:
        landmarks: Dictionary of pose landmarks from side view
        side_img_np: Side view image as numpy array
        waist_y_offset: Waist position offset calculated from front view
        
    Returns:
        Dictionary containing depth measurements and marked image
    """
    side_height, side_width, _ = side_img_np.shape
    side_img_with_markers = None
    
    # Get key points from side view
    side_hip = (landmarks["LEFT_HIP"]["x"], landmarks["LEFT_HIP"]["y"])
    side_shoulder = (landmarks["LEFT_SHOULDER"]["x"], landmarks["LEFT_SHOULDER"]["y"])
    
    # Calculate positions for measurements
    hip_y = int(side_hip[1])
    waist_y = int(side_hip[1] - (side_hip[1] - side_shoulder[1]) * waist_y_offset)
    bust_y = int(side_shoulder[1] + (side_hip[1] - side_shoulder[1]) * 0.25)
    
    # Initialize measurements with default values
    measurements = {
        "hip_depth_px": side_width * 0.15,
        "waist_depth_px": side_width * 0.12,
        "bust_depth_px": side_width * 0.14
    }
    
    # Process each measurement point (hip, waist, bust)
    for point_name, y_coord in [("hip", hip_y), ("waist", waist_y), ("bust", bust_y)]:
        if 0 <= y_coord < side_height:
            roi_y_start = max(0, y_coord - 15)
            roi_y_end = min(side_height, y_coord + 15)
            roi = side_img_np[roi_y_start:roi_y_end, :, :]
            
            # Convert ROI to grayscale and process
            roi_gray = cv2.cvtColor(roi, cv2.COLOR_RGB2GRAY)
            roi_blur = cv2.GaussianBlur(roi_gray, (5, 5), 0)
            _, roi_thresh = cv2.threshold(roi_blur, 0, 255, cv2.THRESH_BINARY_INV + cv2.THRESH_OTSU)
            
            # Clean up mask
            kernel = np.ones((3, 3), np.uint8)
            roi_thresh = cv2.morphologyEx(roi_thresh, cv2.MORPH_OPEN, kernel)
            roi_thresh = cv2.morphologyEx(roi_thresh, cv2.MORPH_CLOSE, kernel)
            
            # Find contours
            contours, _ = cv2.findContours(roi_thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
            
            if contours and len(contours) > 0:
                largest_contour = max(contours, key=cv2.contourArea)
                mask = np.zeros_like(roi_thresh)
                cv2.drawContours(mask, [largest_contour], 0, 255, -1)
                
                # Get depth measurement
                point_center_y = y_coord - roi_y_start
                if 0 <= point_center_y < mask.shape[0]:
                    mask_row = mask[point_center_y, :]
                    non_zero_indices = np.where(mask_row > 0)[0]
                    
                    if len(non_zero_indices) > 0:
                        leftmost = non_zero_indices[0]
                        rightmost = non_zero_indices[-1]
                        depth_px = rightmost - leftmost
                        
                        # Validate measurement
                        min_depth = side_width * 0.05
                        max_depth = side_width * (0.5 if point_name == "hip" else 0.4 if point_name == "bust" else 0.35)
                        
                        if depth_px < min_depth:
                            depth_px = min_depth
                        elif depth_px > max_depth:
                            depth_px = max_depth
                            
                        measurements[f"{point_name}_depth_px"] = depth_px
                        
                        # Update visualization
                        if side_img_with_markers is None:
                            side_img_with_markers = side_img_np.copy()
                        
                        # Draw markers
                        cv2.rectangle(side_img_with_markers, (0, roi_y_start), (side_width, roi_y_end), (0, 255, 0), 1)
                        cv2.line(side_img_with_markers, (0, y_coord), (side_width, y_coord), (0, 255, 255), 1)
                        cv2.circle(side_img_with_markers, (leftmost, y_coord), 5, (0, 0, 255), -1)
                        cv2.circle(side_img_with_markers, (rightmost, y_coord), 5, (255, 0, 0), -1)
                        
                        # Add labels
                        cv2.putText(side_img_with_markers, f"{point_name.title()} Front", (leftmost - 30, y_coord - 10),
                                  cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 0, 255), 1)
                        cv2.putText(side_img_with_markers, f"{point_name.title()} Back", (rightmost + 5, y_coord - 10),
                                  cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 0, 0), 1)
    
    # Calculate circumferences using ellipse approximation
    def ellipse_perimeter(width, depth):
        a = width / 2
        b = depth / 2
        if a < 1 or b < 1:
            return 2 * np.pi * max(a, b)
        h = ((a - b) ** 2) / ((a + b) ** 2)
        return np.pi * (a + b) * (1 + (3 * h) / (10 + np.sqrt(4 - 3 * h)))
    
    return {
        "measurements": measurements,
        "marked_image": side_img_with_markers,
        "ellipse_perimeter_func": ellipse_perimeter
    }