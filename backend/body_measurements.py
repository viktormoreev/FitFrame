import numpy as np

def calculate_body_measurements(landmarks, image_shape, height_cm):
    """
    Calculate body measurements from pose landmarks
    
    Args:
        landmarks: Dictionary of pose landmarks
        image_shape: Tuple of image dimensions (height, width, channels)
        height_cm: Height of the person in centimeters
        
    Returns:
        Dictionary containing calculated measurements
    """
    image_height, image_width, _ = image_shape
    
    # Extract key points
    left_shoulder = (landmarks["LEFT_SHOULDER"]["x"], landmarks["LEFT_SHOULDER"]["y"])
    right_shoulder = (landmarks["RIGHT_SHOULDER"]["x"], landmarks["RIGHT_SHOULDER"]["y"])
    left_hip = (landmarks["LEFT_HIP"]["x"], landmarks["LEFT_HIP"]["y"])
    right_hip = (landmarks["RIGHT_HIP"]["x"], landmarks["RIGHT_HIP"]["y"])
    left_knee = (landmarks["LEFT_KNEE"]["x"], landmarks["LEFT_KNEE"]["y"])
    left_ankle = (landmarks["LEFT_ANKLE"]["x"], landmarks["LEFT_ANKLE"]["y"])
    
    # Calculate basic measurements in pixels
    hip_width_px = np.sqrt((right_hip[0] - left_hip[0])**2 + (right_hip[1] - left_hip[1])**2)
    shoulder_width_px = np.sqrt((right_shoulder[0] - left_shoulder[0])**2 + (right_shoulder[1] - left_shoulder[1])**2)
    inseam_px = np.sqrt((left_hip[0] - left_ankle[0])**2 + (left_hip[1] - left_ankle[1])**2)
    
    # Calculate body proportions
    shoulder_hip_ratio = shoulder_width_px / hip_width_px
    
    # Determine body type and set parameters
    if shoulder_hip_ratio > 1.5:  # Very V-shaped/athletic body
        body_type = "very_athletic"
        waist_y_offset = 0.33
        bust_multiplier = 1.08
    elif shoulder_hip_ratio > 1.3:  # Athletic body
        body_type = "athletic"
        waist_y_offset = 0.35
        bust_multiplier = 1.05
    elif shoulder_hip_ratio > 1.1:  # Slightly athletic
        body_type = "slightly_athletic"
        waist_y_offset = 0.38
        bust_multiplier = 1.0
    elif shoulder_hip_ratio > 0.9:  # Balanced proportions
        body_type = "balanced"
        waist_y_offset = 0.4
        bust_multiplier = 0.5
    elif shoulder_hip_ratio > 0.8:  # Slightly pear-shaped
        body_type = "slightly_pear"
        waist_y_offset = 0.42
        bust_multiplier = 0.97
    else:  # More pear-shaped body
        body_type = "pear"
        waist_y_offset = 0.45
        bust_multiplier = 0.95
    
    # Calculate waist position
    torso_length_left = abs(left_hip[1] - left_shoulder[1])
    torso_length_right = abs(right_hip[1] - right_shoulder[1])
    
    left_waist_distance = torso_length_left * waist_y_offset
    right_waist_distance = torso_length_right * waist_y_offset
    
    left_waist = (left_hip[0], left_hip[1] - left_waist_distance)
    right_waist = (right_hip[0], right_hip[1] - right_waist_distance)
    
    # Calculate waist width and bust width
    waist_width_px = np.sqrt((right_waist[0] - left_waist[0])**2 + (right_waist[1] - left_waist[1])**2)
    
    # Calculate bust based on body type
    if body_type == "athletic":
        bust_width_px = shoulder_width_px * bust_multiplier
    elif body_type == "pear":
        bust_width_px = hip_width_px * bust_multiplier
    else:  # balanced
        bust_width_px = (shoulder_width_px + hip_width_px) * bust_multiplier
    
    # Calculate scaling factor
    body_height_px = np.sqrt((left_shoulder[0] - left_ankle[0])**2 + (left_shoulder[1] - left_ankle[1])**2) * 1.2
    scaling_factor = height_cm / body_height_px
    
    return {
        "hip_width_px": hip_width_px,
        "waist_width_px": waist_width_px,
        "bust_width_px": bust_width_px,
        "inseam_px": inseam_px,
        "scaling_factor": scaling_factor,
        "body_type": body_type,
        "waist_y_offset": waist_y_offset,
        "shoulder_hip_ratio": shoulder_hip_ratio,
        "inseam_cm": inseam_px * scaling_factor
    }