
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface ImageUploadProps {
  onImageUpload: (image: File) => void;
}

const ImageUpload: React.FC<ImageUploadProps> = ({ onImageUpload }) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    handleFile(file);
  };

  const handleFile = (file?: File) => {
    if (file) {
      if (file.type.startsWith('image/')) {
        setPreviewUrl(URL.createObjectURL(file));
        onImageUpload(file);
      } else {
        toast.error('Please upload an image file');
      }
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files?.[0];
    handleFile(file);
  };

  return (
    <div className="w-full">
      <div
        className={`border-2 border-dashed rounded-lg p-4 text-center ${
          isDragging ? 'border-fashion-gold bg-fashion-cream' : 'border-gray-300'
        } ${previewUrl ? 'bg-fashion-cream' : 'bg-gray-50'}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {previewUrl ? (
          <div className="relative">
            <img 
              src={previewUrl} 
              alt="Preview" 
              className="mx-auto h-64 object-contain rounded-md" 
            />
            <Button 
              variant="outline" 
              className="mt-4" 
              onClick={() => {
                setPreviewUrl(null);
              }}
            >
              Change Photo
            </Button>
          </div>
        ) : (
          <>
            <div className="py-6">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
              </svg>
              <p className="mt-2 text-sm text-gray-600">
                Drag and drop your photo, or
              </p>
              <label className="mt-2 inline-block">
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleFileChange}
                />
                <span className="cursor-pointer text-fashion-mauve font-medium hover:text-fashion-gold transition-colors">
                  browse to upload
                </span>
              </label>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ImageUpload;
