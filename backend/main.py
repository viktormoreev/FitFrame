from fastapi import FastAPI, UploadFile, File, HTTPException, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import numpy as np
import cv2
from PIL import Image
import io
import json
import os
import base64
import traceback
from typing import Optional, List, Dict, Any, Union
from pydantic import BaseModel

# Import from our modules
from pose_detection import initialize_pose_detector, detect_pose_in_image
from body_measurements import calculate_body_measurements
from side_view_processing import process_side_view
from size_prediction import determine_jeans_size, determine_dress_size, determine_skirt_size, get_size_details

# Initialize global variables
pose_detector = None

# Load size charts
try:
    with open(os.path.join(os.path.dirname(__file__), '..', 'data', 'size_charts.json'), 'r') as f:
        SIZE_CHARTS = json.load(f)
except Exception as e:
    print(f"Error loading size charts: {e}")
    SIZE_CHARTS = {}

# Create FastAPI app
app = FastAPI(title="Size Prediction API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origin
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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
        results = detect_pose_in_image(pose_detector, img_bgr)
        
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
            front_results = detect_pose_in_image(pose_detector, img_bgr)
            
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
        side_img_with_markers = None  # Will store the image with depth markers
        side_contents = await side_image.read()
        try:
            side_img = Image.open(io.BytesIO(side_contents))
            side_img_rgb = side_img.convert('RGB')
            side_img_np = np.array(side_img_rgb)
            
            # Convert from RGB to BGR (OpenCV format)
            side_img_bgr = cv2.cvtColor(side_img_np, cv2.COLOR_RGB2BGR)
            
            # Process the side view image with OpenPose
            side_results = detect_pose_in_image(pose_detector, side_img_bgr)
            
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
        
        # Calculate body measurements from front view
        measurements = calculate_body_measurements(
            front_results["landmarks"], 
            img_np.shape, 
            height_cm
        )
        
        # Process side view to get depth measurements
        side_view_results = process_side_view(
            side_results["landmarks"],
            side_img_np,
            measurements["waist_y_offset"]
        )
        
        # Update measurements with side view data
        measurements.update(side_view_results["measurements"])
        side_img_with_markers = side_view_results["marked_image"]
        
        # Calculate circumferences using ellipse approximation
        ellipse_perimeter = side_view_results["ellipse_perimeter_func"]
        
        hip_circumference_cm = ellipse_perimeter(measurements["hip_width_px"], measurements["hip_depth_px"]) * measurements["scaling_factor"]
        waist_circumference_cm = ellipse_perimeter(measurements["waist_width_px"], measurements["waist_depth_px"]) * measurements["scaling_factor"]
        bust_circumference_cm = ellipse_perimeter(measurements["bust_width_px"], measurements["bust_depth_px"]) * measurements["scaling_factor"]
        inseam_cm = measurements["inseam_cm"]
        
        # Determine sizes based on measurements
        jeans_size = determine_jeans_size(waist_circumference_cm, hip_circumference_cm, SIZE_CHARTS)
        dress_size = determine_dress_size(bust_circumference_cm, waist_circumference_cm, hip_circumference_cm, SIZE_CHARTS)
        skirt_size = determine_skirt_size(waist_circumference_cm, hip_circumference_cm, SIZE_CHARTS)
        
        # Get detailed size information including EU and UK sizes
        jeans_details = get_size_details("jeans", jeans_size, SIZE_CHARTS)
        dress_details = get_size_details("dresses", dress_size, SIZE_CHARTS)
        skirt_details = get_size_details("skirts", skirt_size, SIZE_CHARTS)
        
        # Convert the marked image to base64 for returning to the client
        marked_image_base64 = None
        if side_img_with_markers is not None:
            # Add a title and explanation to the image
            cv2.putText(side_img_with_markers, "Improved Depth Measurement", (10, 30),
                        cv2.FONT_HERSHEY_SIMPLEX, 1, (255, 255, 255), 2)
            cv2.putText(side_img_with_markers, "Red: Front point, Blue: Back point", (10, 60),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 255), 1)
            cv2.putText(side_img_with_markers, "Green boxes: Analysis regions", (10, 90),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 255), 1)
            
            # Convert to base64 for sending to frontend
            _, buffer = cv2.imencode('.jpg', side_img_with_markers)
            marked_image_base64 = base64.b64encode(buffer).decode('utf-8')
            
            # Save the marked image to a file for debugging
            debug_img_path = os.path.join(os.path.dirname(__file__), 'debug_side_view.jpg')
            cv2.imwrite(debug_img_path, side_img_with_markers)
            print(f"DEBUG - Saved marked side view image to: {debug_img_path}")
        
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
            },
            "debug_images": {
                "side_view_with_markers": marked_image_base64
            } if marked_image_base64 else {}
        }
        
    except Exception as e:
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

# Initialize the pose detector on startup
pose_detector = initialize_pose_detector()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)