import React, { useState } from 'react';
import axios from 'axios';
import { useDropzone } from 'react-dropzone';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import Navigation from '@/components/Navigation';
import PoseVisualizer from '@/components/PoseVisualizer';

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
  debug_images?: {
    side_view_with_markers?: string;
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

const Register = () => {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [sideFile, setSideFile] = useState<File | null>(null);
  const [sidePreviewUrl, setSidePreviewUrl] = useState<string | null>(null);
  const [height, setHeight] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<SizeResult | null>(null);
  const [poseData, setPoseData] = useState<PoseResult | null>(null);
  const [sidePoseData, setSidePoseData] = useState<PoseResult | null>(null);
  const [showPose, setShowPose] = useState<boolean>(false);
  const [showSidePose, setShowSidePose] = useState<boolean>(false);
  const [detectingPose, setDetectingPose] = useState<boolean>(false);
  const [detectingSidePose, setDetectingSidePose] = useState<boolean>(false);

  const onDropFront = (acceptedFiles: File[]) => {
    if (acceptedFiles && acceptedFiles.length > 0) {
      const selectedFile = acceptedFiles[0];
      setFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile));
      setResult(null);
    }
  };

  const onDropSide = (acceptedFiles: File[]) => {
    if (acceptedFiles && acceptedFiles.length > 0) {
      const selectedFile = acceptedFiles[0];
      setSideFile(selectedFile);
      setSidePreviewUrl(URL.createObjectURL(selectedFile));
      setResult(null);
    }
  };

  const { getRootProps: getFrontRootProps, getInputProps: getFrontInputProps } = useDropzone({
    onDrop: onDropFront,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png'],
    },
    maxFiles: 1,
  });

  const { getRootProps: getSideRootProps, getInputProps: getSideInputProps } = useDropzone({
    onDrop: onDropSide,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png'],
    },
    maxFiles: 1,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!file) {
      toast.error('Please upload a front view image first');
      return;
    }
    
    if (!sideFile) {
      toast.error('Please upload a side view image');
      return;
    }
    
    if (!height) {
      toast.error('Please enter your height in cm');
      return;
    }

    setLoading(true);
    setResult(null);

    await detectBothPoses();

    const formData = new FormData();
    formData.append('image', file);
    formData.append('height_cm', height);
    formData.append('side_image', sideFile);

    try {
      const response = await axios.post('http://localhost:8000/predict-size/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      setResult(response.data);
      toast.success('Size prediction completed successfully!');
    } catch (err) {
      console.error('Error:', err);
      toast.error('An error occurred while predicting size. Please try a different image.');
    } finally {
      setLoading(false);
    }
  };

  const detectBothPoses = async () => {
    if (file) {
      setDetectingPose(true);
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
        console.error('Error detecting front pose:', err);
        toast.error('Failed to detect pose in front view image');
      } finally {
        setDetectingPose(false);
      }
    }

    if (sideFile) {
      setDetectingSidePose(true);
      const formData = new FormData();
      formData.append('image', sideFile);

      try {
        const response = await axios.post('http://localhost:8000/detect-pose/', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        
        setSidePoseData(response.data);
        setShowSidePose(true);
      } catch (err) {
        console.error('Error detecting side pose:', err);
        toast.error('Failed to detect pose in side view image');
      } finally {
        setDetectingSidePose(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-fashion-cream">
      <Navigation />
      
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-serif text-center mb-8">
            Size Prediction System
          </h1>
          
          <Card className="p-6 md:p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold mb-4">Upload Photos</h2>
                  
                  <div className="space-y-4">
                    <div>
                      <Label>Front View Photo</Label>
                      <div
                        {...getFrontRootProps()}
                        className="mt-2 border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-fashion-gold transition-colors cursor-pointer"
                      >
                        <input {...getFrontInputProps()} />
                        {previewUrl ? (
                          <img src={previewUrl} alt="Front Preview" className="max-h-48 mx-auto" />
                        ) : (
                          <p className="text-center text-gray-500">
                            Drag & drop a front-view photo here, or click to select
                          </p>
                        )}
                      </div>
                    </div>

                    <div>
                      <Label>Side View Photo</Label>
                      <p className="text-sm text-gray-500 mb-2">Required for accurate measurements</p>
                      <div
                        {...getSideRootProps()}
                        className="mt-2 border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-fashion-gold transition-colors cursor-pointer"
                      >
                        <input {...getSideInputProps()} />
                        {sidePreviewUrl ? (
                          <img src={sidePreviewUrl} alt="Side Preview" className="max-h-48 mx-auto" />
                        ) : (
                          <p className="text-center text-gray-500">
                            Drag & drop a side-view photo here, or click to select
                          </p>
                        )}
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="height">Height (cm)</Label>
                      <Input
                        id="height"
                        type="number"
                        value={height}
                        onChange={(e) => setHeight(e.target.value)}
                        placeholder="Enter your height in cm"
                        className="mt-1"
                      />
                    </div>

                    <Button
                      onClick={handleSubmit}
                      disabled={!file || !sideFile || loading || !height}
                      className="w-full bg-fashion-gold text-white hover:bg-fashion-gold/90"
                    >
                      {loading ? 'Processing...' : 'Predict Size'}
                    </Button>
                  </div>
                </div>

                {showPose && poseData && previewUrl && (
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Front View Body Points</h3>
                    <div className="border rounded-lg overflow-hidden">
                      <PoseVisualizer
                        landmarks={poseData.landmarks}
                        connections={poseData.connections}
                        imageWidth={poseData.image_width}
                        imageHeight={poseData.image_height}
                        imageUrl={previewUrl}
                      />
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => setShowPose(false)}
                      className="mt-2"
                    >
                      Hide Points
                    </Button>
                  </div>
                )}

                {showSidePose && sidePoseData && sidePreviewUrl && (
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Side View Body Points</h3>
                    <div className="border rounded-lg overflow-hidden">
                      <PoseVisualizer
                        landmarks={sidePoseData.landmarks}
                        connections={sidePoseData.connections}
                        imageWidth={sidePoseData.image_width}
                        imageHeight={sidePoseData.image_height}
                        imageUrl={sidePreviewUrl}
                      />
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => setShowSidePose(false)}
                      className="mt-2"
                    >
                      Hide Points
                    </Button>
                  </div>
                )}
              </div>

              <div>
                <h2 className="text-xl font-semibold mb-4">Results</h2>
                
                {!result && !loading && (
                  <div className="text-gray-500 space-y-4">
                    <p>Upload photos to see your estimated sizes</p>
                    <ul className="list-disc list-inside space-y-2">
                      <li>Stand straight, arms slightly away from body</li>
                      <li>Wear fitted clothing for best results</li>
                      <li>Both views are required for accurate measurements</li>
                    </ul>
                  </div>
                )}

                {result && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold mb-3">Measurements</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Bust</Label>
                          <p className="text-lg">{result.measurements.bust} cm</p>
                        </div>
                        <div>
                          <Label>Waist</Label>
                          <p className="text-lg">{result.measurements.waist} cm</p>
                        </div>
                        <div>
                          <Label>Hip</Label>
                          <p className="text-lg">{result.measurements.hip} cm</p>
                        </div>
                        <div>
                          <Label>Inseam</Label>
                          <p className="text-lg">{result.measurements.inseam} cm</p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold mb-3">Recommended Sizes</h3>
                      <div className="space-y-4">
                        <div>
                          <Label>Jeans</Label>
                          <div className="grid grid-cols-3 gap-2">
                            <div>US: {result.sizes.jeans.us}</div>
                            <div>EU: {result.sizes.jeans.eu}</div>
                            <div>UK: {result.sizes.jeans.uk}</div>
                          </div>
                        </div>
                        <div>
                          <Label>Dress</Label>
                          <div className="grid grid-cols-3 gap-2">
                            <div>US: {result.sizes.dress.us}</div>
                            <div>EU: {result.sizes.dress.eu}</div>
                            <div>UK: {result.sizes.dress.uk}</div>
                          </div>
                        </div>
                        <div>
                          <Label>Skirt</Label>
                          <div className="grid grid-cols-3 gap-2">
                            <div>US: {result.sizes.skirt.us}</div>
                            <div>EU: {result.sizes.skirt.eu}</div>
                            <div>UK: {result.sizes.skirt.uk}</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {result.debug_images?.side_view_with_markers && (
                      <div>
                        <h3 className="text-lg font-semibold mb-3">Depth Analysis</h3>
                        <div className="border rounded-lg overflow-hidden">
                          <img
                            src={`data:image/jpeg;base64,${result.debug_images.side_view_with_markers}`}
                            alt="Side view analysis"
                            className="w-full"
                          />
                        </div>
                        <p className="text-sm text-gray-500 mt-2">
                          Red points show front edge, blue points show back edge
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Register;
