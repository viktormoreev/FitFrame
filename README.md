# SizePredict MVP

SizePredict is a web application that estimates a woman's jeans, dress, or skirt size from a full-body photo using pose estimation.

## Features

- Upload a full-body photo
- Optional height input for better scaling
- Estimate key body measurements (waist, hip, bust, inseam)
- Determine clothing sizes for jeans, dresses, and skirts
- Fixed pose mode for consistent measurements across different photos
- Simple, responsive UI

## Project Structure

```
SizePredict/
├── backend/           # FastAPI backend
│   ├── main.py        # Main API server
│   └── requirements.txt
├── frontend/          # React frontend
│   ├── public/
│   ├── src/
│   └── package.json
└── data/              # Size chart data
    └── size_charts.json
```

## Setup Instructions

### Prerequisites

- Python 3.8+ for the backend
- Node.js 14+ for the frontend

### Backend Setup

1. Navigate to the backend directory:
   ```
   cd backend
   ```

2. Create a virtual environment (optional but recommended):
   ```
   python -m venv venv
   ```

3. Activate the virtual environment:
   - Windows:
     ```
     venv\Scripts\activate
     ```
   - macOS/Linux:
     ```
     source venv/bin/activate
     ```

4. Install dependencies:
   ```
   pip install -r requirements.txt
   ```

5. Download OpenPose models:
   ```
   python download_models.py
   ```
  
  This will download the required model files. If automatic download fails:
  
  - Manually download the models as instructed by the script
  - Place the files in the correct directories under `backend/models/openpose/`

### Frontend Setup

1. Navigate to the frontend directory:
   ```
   cd frontend
   ```

2. Install dependencies:
   ```
   npm install
   ```

## Running the Application

### Start the Backend

1. From the backend directory:
   ```
   uvicorn main:app --reload
   ```
   The API will be available at http://localhost:8000

2. You can access the API documentation at http://localhost:8000/docs

### Start the Frontend

1. From the frontend directory:
   ```
   npm start
   ```
   The application will be available at http://localhost:3000

## How It Works

1. **Pose Estimation**: The application uses OpenPose's pose estimation model to detect key body points from the uploaded image.

2. **Measurement Calculation**: 
   - Waist: Estimated from a point slightly above the hips
   - Hips: Measured at the hip keypoints
   - Bust: Approximated from shoulder width
   - Inseam: Distance from hip to ankle

3. **Scaling**: 
   - If height is provided, measurements are scaled accordingly
   - Otherwise, statistical averages are used for approximate scaling

4. **Size Determination**:
   - Measurements are compared to standard size charts
   - The best matching size is selected based on the closest match

5. **Fixed Pose Mode**:
   - Set a reference image with clear body pose points
   - All subsequent measurements use the same reference points for consistency
   - Ensures consistent size predictions even with different poses or photo angles

## Limitations

- Accuracy depends on the quality of the photo and pose detection
- Works best with:
  - Full-body photos
  - Person standing straight
  - Fitted clothing
  - Clear visibility of the body outline

## Future Improvements

- Enhanced fixed pose mode with multiple reference poses for different body types
- Multi-angle photo support for better 3D approximation
- Machine learning model trained on real measurement data
- Support for men's clothing and more garment types
- Brand-specific size charts
- Confidence scores for predictions
- Adjustable body shape profiles

## License

This project is an MVP demonstration and is not intended for production use without further development and testing.