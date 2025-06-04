
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { ClothingPreference } from '@/types';

interface MeasurementFormProps {
  onSubmit: (waist: number, hip: number, preferences: ClothingPreference) => void;
}

const MeasurementForm: React.FC<MeasurementFormProps> = ({ onSubmit }) => {
  const [waist, setWaist] = useState<number>(28);
  const [hip, setHip] = useState<number>(36);
  const [preferences, setPreferences] = useState<ClothingPreference>({
    fit: 'regular',
    style: ['casual'],
    colors: ['neutral'],
  });

  const handleStyleChange = (style: string) => {
    setPreferences(prev => {
      const updatedStyles = prev.style.includes(style)
        ? prev.style.filter(s => s !== style)
        : [...prev.style, style];
      
      return { ...prev, style: updatedStyles };
    });
  };

  const handleColorChange = (color: string) => {
    setPreferences(prev => {
      const updatedColors = prev.colors.includes(color)
        ? prev.colors.filter(c => c !== color)
        : [...prev.colors, color];
      
      return { ...prev, colors: updatedColors };
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!waist || !hip) {
      toast.error("Please enter your measurements");
      return;
    }
    
    onSubmit(waist, hip, preferences);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <h2 className="font-medium text-lg">Your Measurements</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="waist">Waist (inches)</Label>
            <div className="flex items-center space-x-4">
              <Slider
                id="waist-slider"
                min={20}
                max={50}
                step={0.5}
                value={[waist]}
                onValueChange={(values) => setWaist(values[0])}
                className="flex-grow"
              />
              <Input
                id="waist"
                type="number"
                value={waist}
                onChange={(e) => setWaist(Number(e.target.value))}
                min={20}
                max={50}
                step={0.5}
                className="w-16"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="hip">Hip (inches)</Label>
            <div className="flex items-center space-x-4">
              <Slider
                id="hip-slider"
                min={30}
                max={60}
                step={0.5}
                value={[hip]}
                onValueChange={(values) => setHip(values[0])}
                className="flex-grow"
              />
              <Input
                id="hip"
                type="number"
                value={hip}
                onChange={(e) => setHip(Number(e.target.value))}
                min={30}
                max={60}
                step={0.5}
                className="w-16"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="font-medium text-lg">Fit Preference</h2>
        <RadioGroup 
          value={preferences.fit} 
          onValueChange={(value) => setPreferences({...preferences, fit: value as ClothingPreference['fit']})}
          className="flex space-x-4"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="tight" id="tight" />
            <Label htmlFor="tight">Tight Fit</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="regular" id="regular" />
            <Label htmlFor="regular">Regular Fit</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="loose" id="loose" />
            <Label htmlFor="loose">Loose Fit</Label>
          </div>
        </RadioGroup>
      </div>

      <div className="space-y-4">
        <h2 className="font-medium text-lg">Style Preferences</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {['casual', 'formal', 'bohemian', 'minimalist', 'sporty', 'vintage'].map((style) => (
            <div 
              key={style}
              onClick={() => handleStyleChange(style)}
              className={`px-4 py-2 border rounded-md cursor-pointer text-center capitalize ${
                preferences.style.includes(style) 
                  ? 'border-fashion-gold bg-fashion-cream text-fashion-charcoal' 
                  : 'border-gray-200 text-gray-600'
              }`}
            >
              {style}
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="font-medium text-lg">Color Preferences</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {['neutral', 'bright', 'pastel', 'dark', 'earthy', 'monochrome'].map((color) => (
            <div 
              key={color}
              onClick={() => handleColorChange(color)}
              className={`px-4 py-2 border rounded-md cursor-pointer text-center capitalize ${
                preferences.colors.includes(color) 
                  ? 'border-fashion-gold bg-fashion-cream text-fashion-charcoal' 
                  : 'border-gray-200 text-gray-600'
              }`}
            >
              {color}
            </div>
          ))}
        </div>
      </div>

      <Button type="submit" className="w-full bg-fashion-gold text-white hover:bg-fashion-gold/90">
        Get Personalized Recommendations
      </Button>
    </form>
  );
};

export default MeasurementForm;
