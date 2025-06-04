
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FormItem, FormLabel } from '@/components/ui/form';
import ImageUpload from '@/components/ImageUpload';
import { toast } from 'sonner';

const Welcome = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    waistCircumference: '',
    hipCircumference: '',
    height: '',
    photo: null as File | null
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleImageUpload = (image: File) => {
    setFormData(prev => ({
      ...prev,
      photo: image
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.waistCircumference || !formData.hipCircumference || !formData.height) {
      toast.error('Please fill in all required measurements');
      return;
    }

    // Store user data in localStorage
    const userData = {
      waistSize: Number(formData.waistCircumference),
      hipSize: Number(formData.hipCircumference),
      height: Number(formData.height),
      photoUrl: formData.photo ? URL.createObjectURL(formData.photo) : undefined,
      id: 'user1',
      email: 'user@example.com',
      name: 'Fashion User'
    };

    localStorage.setItem('fashionUser', JSON.stringify(userData));
    
    toast.success('Measurements saved! Let\'s find your perfect fit.');
    navigate('/category-selection');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-fashion-cream to-white flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center pb-8">
          <CardTitle className="text-3xl font-serif text-fashion-charcoal mb-2">
            Fashion Fit Finder
          </CardTitle>
          <p className="text-gray-600 text-lg">
            This app helps you find the perfect pants, skirts, and dresses for your body type and measurements.
          </p>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormItem>
                <FormLabel className="text-base font-medium">
                  Waist Circumference (inches) *
                </FormLabel>
                <Input
                  type="number"
                  placeholder="e.g., 28"
                  value={formData.waistCircumference}
                  onChange={(e) => handleInputChange('waistCircumference', e.target.value)}
                  className="mt-2"
                  min="20"
                  max="60"
                  step="0.5"
                />
              </FormItem>

              <FormItem>
                <FormLabel className="text-base font-medium">
                  Hip Circumference (inches) *
                </FormLabel>
                <Input
                  type="number"
                  placeholder="e.g., 36"
                  value={formData.hipCircumference}
                  onChange={(e) => handleInputChange('hipCircumference', e.target.value)}
                  className="mt-2"
                  min="25"
                  max="70"
                  step="0.5"
                />
              </FormItem>
            </div>

            <FormItem>
              <FormLabel className="text-base font-medium">
                Height (inches) *
              </FormLabel>
              <Input
                type="number"
                placeholder="e.g., 65"
                value={formData.height}
                onChange={(e) => handleInputChange('height', e.target.value)}
                className="mt-2"
                min="48"
                max="84"
                step="0.5"
              />
            </FormItem>

            <FormItem>
              <FormLabel className="text-base font-medium">
                Upload a photo (Optional)
              </FormLabel>
              <p className="text-sm text-gray-500 mb-3">
                Helps improve accuracy of recommendations
              </p>
              <ImageUpload onImageUpload={handleImageUpload} />
            </FormItem>

            <Button 
              type="submit" 
              className="w-full bg-fashion-gold text-white hover:bg-fashion-gold/90 text-lg py-6"
            >
              Show me suggestions
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Welcome;
