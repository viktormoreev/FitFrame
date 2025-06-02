import os
import sys
import urllib.request
import shutil

def print_manual_instructions():
    """Print instructions for manual model download"""
    print("\nMANUAL DOWNLOAD INSTRUCTIONS:")
    print("===========================")
    print("Download the following files and place them in the specified locations:")
    print("\n1. COCO model (18 keypoints):")
    print("   - Download the prototxt file:")
    print("     URL: https://raw.githubusercontent.com/opencv/opencv_extra/master/testdata/dnn/openpose_pose_coco.prototxt")
    print("     Save to: backend/models/openpose/pose/coco/pose_deploy_linevec.prototxt")
    print("\n   - Download the caffemodel file:")
    print("     URL: https://www.dropbox.com/s/2h2bv29a130sgrk/pose_iter_440000.caffemodel")
    print("     Save to: backend/models/openpose/pose/coco/pose_iter_440000.caffemodel")
    print("\n2. MPI model (15 keypoints):")
    print("   - Download the prototxt file:")
    print("     URL: https://raw.githubusercontent.com/opencv/opencv_extra/master/testdata/dnn/openpose_pose_mpi_faster_4_stages.prototxt")
    print("     Save to: backend/models/openpose/pose/mpi/pose_deploy_linevec.prototxt")
    print("\n   - Download the caffemodel file:")
    print("     URL: https://www.dropbox.com/s/m25tx63izetq9ym/pose_iter_160000.caffemodel")
    print("     Save to: backend/models/openpose/pose/mpi/pose_iter_160000.caffemodel")
    print("\nAlternatively, you can use pre-trained model weights available in many OpenPose tutorials.")

def download_file(url, output_path):
    """Download a file from a URL to the specified path"""
    print(f"Downloading {url} to {output_path}...")
    
    # Create directory if it doesn't exist
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    
    # Download the file
    try:
        with urllib.request.urlopen(url) as response, open(output_path, 'wb') as out_file:
            shutil.copyfileobj(response, out_file)
        print(f"Downloaded {output_path} successfully!")
        return True
    except Exception as e:
        print(f"Error downloading {url}: {e}")
        return False

def download_openpose_models():
    """Download OpenPose model files"""
    base_dir = os.path.dirname(os.path.abspath(__file__))
    models_dir = os.path.join(base_dir, "models", "openpose")
    
    # Create models directory if it doesn't exist
    os.makedirs(models_dir, exist_ok=True)
    os.makedirs(os.path.join(models_dir, "pose", "coco"), exist_ok=True)
    os.makedirs(os.path.join(models_dir, "pose", "mpi"), exist_ok=True)
    
    # We'll only try to download the prototxt files which are hosted on GitHub
    model_files = {
        # COCO model (18 keypoints)
        "pose/coco/pose_deploy_linevec.prototxt": "https://raw.githubusercontent.com/opencv/opencv_extra/master/testdata/dnn/openpose_pose_coco.prototxt",
        # MPI model (15 keypoints)
        "pose/mpi/pose_deploy_linevec.prototxt": "https://raw.githubusercontent.com/opencv/opencv_extra/master/testdata/dnn/openpose_pose_mpi_faster_4_stages.prototxt",
    }
    
    # Download each model file
    success = True
    for rel_path, url in model_files.items():
        output_path = os.path.join(models_dir, rel_path)
        if not download_file(url, output_path):
            success = False
    
    print("\nPROTOTXT files downloaded. For model weights, please follow manual instructions below.")
    print_manual_instructions()
    
    return success

if __name__ == "__main__":
    print("OpenPose Model Downloader")
    print("=========================")
    print("Note: This script will download prototxt files, but you'll need to manually")
    print("download model weights due to their size and hosting limitations.")
    print("=========================")
    
    download_openpose_models()