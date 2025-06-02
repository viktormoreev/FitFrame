import React, { useState } from 'react';
import axios from 'axios';
import { useDropzone } from 'react-dropzone';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import PoseVisualizer from './PoseVisualizer';

interface SizeResult {
  measurements: {
    waist: number;
    hip: number;
    inseam: number;
    bust: number;
  };
  sizes: {
    jeans: {
      us: string;
      eu: string;
      uk: string;
    };
    dress: {
      us: string;
      eu: string;
      uk: string;
    };
    skirt: {
      us: string;
      eu: string;
      uk: string;
    };
  };
}

interface Landmark {
  x: number;
  y: number;
  z: number;
  visibility: number;
}

interface Connection {
  from: string;
  to: string;
}

interface PoseResult {
  landmarks: Record<string, Landmark>;
  connections: Connection[];
  image_width: number;
  image_height: number;
  warning?: string;
}

interface FixedPoseModeStatus {
  fixed_pose_mode: boolean;
  has_reference_pose: boolean;
  message: string;
}

function App() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [height, setHeight] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<SizeResult | null>(null);
  const [poseData, setPoseData] = useState<PoseResult | null>(null);
  const [showPose, setShowPose] = useState<boolean>(false);
  const [detectingPose, setDetectingPose] = useState<boolean>(false);
  const [fixedPoseModeStatus, setFixedPoseModeStatus] = useState<FixedPoseModeStatus | null>(null);
  const [settingReferencePose, setSettingReferencePose] = useState<boolean>(false);

  const onDrop = (acceptedFiles: File[]) => {
    setError(null);
    setResult(null);
    
    if (acceptedFiles && acceptedFiles.length > 0) {
      const selectedFile = acceptedFiles[0];
      setFile(selectedFile);
      
      // Create preview
      const objectUrl = URL.createObjectURL(selectedFile);
      setPreviewUrl(objectUrl);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png'],
    },
    maxFiles: 1,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!file) {
      setError('Please upload an image first');
      return;
    }
    
    if (!height) {
      setError('Please enter your height in cm');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    const formData = new FormData();
    formData.append('image', file);
    formData.append('height_cm', height);

    try {
      const response = await axios.post('http://localhost:8000/predict-size/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      setResult(response.data);
    } catch (err) {
      console.error('Error:', err);
      setError('An error occurred while predicting size. Please try a different image.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleDetectPose = async () => {
    if (!file) {
      setError('Please upload an image first');
      return;
    }

    setDetectingPose(true);
    setError(null);

    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await axios.post('http://localhost:8000/detect-pose/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      setPoseData(response.data);
      setShowPose(true);
    } catch (err) {
      console.error('Error:', err);
      setError('An error occurred while detecting pose. Please try a different image.');
    } finally {
      setDetectingPose(false);
    }
  };

  const handleSetReferencePose = async () => {
    if (!file) {
      setError('Please upload an image first');
      return;
    }

    setSettingReferencePose(true);
    setError(null);

    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await axios.post('http://localhost:8000/set-reference-pose/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      fetchFixedPoseModeStatus();
      setError(null);
    } catch (err: any) {
      console.error('Error:', err);
      setError(`Error setting reference pose: ${err.response?.data?.detail || 'Unknown error'}`);
    } finally {
      setSettingReferencePose(false);
    }
  };

  const handleToggleFixedPoseMode = async () => {
    try {
      const response = await axios.get('http://localhost:8000/toggle-fixed-pose-mode/');
      setFixedPoseModeStatus(response.data);
    } catch (err: any) {
      console.error('Error:', err);
      setError(`Error toggling fixed pose mode: ${err.response?.data?.detail || 'Unknown error'}`);
    }
  };

  const fetchFixedPoseModeStatus = async () => {
    try {
      const response = await axios.get('http://localhost:8000/fixed-pose-mode-status');
      setFixedPoseModeStatus(response.data);
    } catch (err) {
      console.error('Error fetching fixed pose mode status:', err);
    }
  };

  // Fetch fixed pose mode status on component mount
  React.useEffect(() => {
    fetchFixedPoseModeStatus();
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <h1>Size Predict</h1>
        <p className="subtitle">Estimate clothing sizes from a full-body photo</p>
      </header>
      
      <main className="container">
        <div className="row">
          <div className="col-md-6">
            <div className="upload-section">
              <h2>Upload Photo</h2>
              <div 
                {...getRootProps()} 
                className={`dropzone ${isDragActive ? 'active' : ''}`}
              >
                <input {...getInputProps()} />
                {previewUrl ? (
                  <img src={previewUrl} alt="Preview" className="preview-image" />
                ) : (
                  <p>Drag & drop a full-body photo here, or click to select</p>
                )}
              </div>
              
              <div className="height-input mt-3">
                <label htmlFor="height" className="form-label">Height (cm, required):</label>
                <input
                  type="number"
                  id="height"
                  className="form-control"
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  placeholder="Enter your height in cm"
                  required
                />
                <small className="text-muted">
                  Your height is needed for accurate size prediction
                </small>
              </div>
              
              <button
                className="btn btn-primary mt-3"
                onClick={handleSubmit}
                disabled={!file || loading || !height}
              >
                {loading ? 'Processing...' : 'Predict My Size'}
              </button>
              
              <button
                className="btn btn-secondary mt-3 ms-2"
                onClick={handleDetectPose}
                disabled={!file || loading || detectingPose}
              >
                {detectingPose ? 'Detecting...' : 'Show Body Points'}
              </button>
              
              <div className="fixed-pose-controls mt-4">
                <h3>Fixed Pose Mode</h3>
                <p className="small text-muted">
                  In fixed pose mode, all photos will use the same reference points for consistency.
                </p>
                
                <div className="d-flex flex-wrap gap-2 mb-3">
                  <button
                    className="btn btn-outline-primary"
                    onClick={handleSetReferencePose}
                    disabled={!file || settingReferencePose}
                  >
                    {settingReferencePose ? 'Setting...' : 'Set Current Image as Reference'}
                  </button>
                  
                  <button
                    className={`btn ${fixedPoseModeStatus?.fixed_pose_mode ? 'btn-success' : 'btn-outline-secondary'}`}
                    onClick={handleToggleFixedPoseMode}
                    disabled={!fixedPoseModeStatus?.has_reference_pose}
                  >
                    {fixedPoseModeStatus?.fixed_pose_mode ? 'Fixed Pose Mode: ON' : 'Fixed Pose Mode: OFF'}
                  </button>
                </div>
                
                {fixedPoseModeStatus && (
                  <div className={`alert ${fixedPoseModeStatus.fixed_pose_mode ? 'alert-success' : 'alert-secondary'} small`}>
                    <strong>Status:</strong> {fixedPoseModeStatus.message}
                  </div>
                )}
              </div>
              
              {error && (
                <div className="alert alert-danger mt-3">
                  {error}
                </div>
              )}
            </div>
            
            {showPose && poseData && previewUrl && (
              <div className="mt-4">
                <h3>Body Keypoints</h3>
                <div className="pose-container">
                  <PoseVisualizer
                    landmarks={poseData.landmarks}
                    connections={poseData.connections}
                    imageWidth={poseData.image_width}
                    imageHeight={poseData.image_height}
                    imageUrl={previewUrl}
                  />
                </div>
                <p className="mt-2 small text-muted">
                  The colored lines and points show the detected body keypoints used for measurements.
                  {poseData.warning && (
                    <span className="text-warning"> Warning: {poseData.warning}</span>
                  )}
                </p>
                <button
                  className="btn btn-outline-secondary btn-sm mt-2"
                  onClick={() => setShowPose(false)}
                >
                  Hide Points
                </button>
              </div>
            )}
          </div>
          
          <div className="col-md-6">
            <div className="results-section">
              <h2>Results</h2>
              
              {loading && (
                <div className="text-center">
                  <div className="spinner-border" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  <p>Analyzing your photo...</p>
                </div>
              )}
              
              {!loading && !result && !error && (
                <div className="placeholder-results">
                  <p>Upload a photo to see your estimated sizes</p>
                  <ul>
                    <li>Use a full-body photo</li>
                    <li>Stand straight, arms slightly away from body</li>
                    <li>Wear fitted clothing for best results</li>
                  </ul>
                </div>
              )}
              
              {result && (
                <div className="size-results">
                  <h3>Estimated Measurements</h3>
                  <div className="measurements">
                    <div className="measurement-item">
                      <span className="label">Bust:</span>
                      <span className="value">{result.measurements.bust} cm</span>
                    </div>
                    <div className="measurement-item">
                      <span className="label">Waist:</span>
                      <span className="value">{result.measurements.waist} cm</span>
                    </div>
                    <div className="measurement-item">
                      <span className="label">Hip:</span>
                      <span className="value">{result.measurements.hip} cm</span>
                    </div>
                    <div className="measurement-item">
                      <span className="label">Inseam:</span>
                      <span className="value">{result.measurements.inseam} cm</span>
                    </div>
                  </div>
                  
                  <h3>Recommended Sizes</h3>
                  <div className="sizes">
                    <div className="size-item">
                      <span className="label">Jeans:</span>
                      <div className="size-values">
                        <span className="value">US: {result.sizes.jeans.us}</span>
                        <span className="value">EU: {result.sizes.jeans.eu}</span>
                        <span className="value">UK: {result.sizes.jeans.uk}</span>
                      </div>
                      {result.sizes.jeans.us && result.sizes.jeans.us.includes('-') && (
                        <small className="text-muted">Your measurements fall between these sizes</small>
                      )}
                    </div>
                    <div className="size-item">
                      <span className="label">Dress:</span>
                      <div className="size-values">
                        <span className="value">US: {result.sizes.dress.us}</span>
                        <span className="value">EU: {result.sizes.dress.eu}</span>
                        <span className="value">UK: {result.sizes.dress.uk}</span>
                      </div>
                      {result.sizes.dress.us && result.sizes.dress.us.includes('-') && (
                        <small className="text-muted">Your measurements fall between these sizes</small>
                      )}
                    </div>
                    <div className="size-item">
                      <span className="label">Skirt:</span>
                      <div className="size-values">
                        <span className="value">US: {result.sizes.skirt.us}</span>
                        <span className="value">EU: {result.sizes.skirt.eu}</span>
                        <span className="value">UK: {result.sizes.skirt.uk}</span>
                      </div>
                      {result.sizes.skirt.us && result.sizes.skirt.us.includes('-') && (
                        <small className="text-muted">Your measurements fall between these sizes</small>
                      )}
                    </div>
                  </div>
                  
                  <div className="disclaimer mt-3">
                    <small>
                      Note: These are estimates based on standard size charts.
                      Actual fit may vary by brand and style.
                    </small>
                    <small className="d-block mt-1">
                      When measurements fall between standard sizes, a range is shown (e.g., "4-6").
                    </small>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      
      <footer className="footer mt-5">
        <div className="container">
          <p className="text-center">
            SizePredict MVP - A prototype for clothing size estimation
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
