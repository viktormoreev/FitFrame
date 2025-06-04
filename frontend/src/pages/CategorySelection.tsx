
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

const CategorySelection = () => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showFitModal, setShowFitModal] = useState(false);

  const categories = [
    { id: 'pants', name: 'Pants', icon: '👖', fits: ['Slim Fit', 'Oversize', 'Straight'] },
    { id: 'dresses', name: 'Dresses', icon: '👗', fits: ['Bodycon', 'A-Line', 'Loose Fit'] },
    { id: 'skirts', name: 'Skirts', icon: '👚', fits: ['Pencil', 'A-Line', 'Pleated'] }
  ];

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setShowFitModal(true);
  };

  const handleFitSelect = (fit: string) => {
    // Store the selected preferences
    const existingUser = JSON.parse(localStorage.getItem('fashionUser') || '{}');
    const updatedUser = {
      ...existingUser,
      preferences: {
        category: selectedCategory,
        fit: fit.toLowerCase().replace(' ', '-'),
        style: [fit],
        colors: []
      }
    };
    localStorage.setItem('fashionUser', JSON.stringify(updatedUser));
    
    // Navigate to the product gallery
    navigate('/dashboard');
  };

  const selectedCategoryData = categories.find(cat => cat.id === selectedCategory);

  return (
    <div className="min-h-screen bg-gradient-to-br from-fashion-cream to-white flex items-center justify-center p-4">
      <div className="w-full max-w-4xl text-center">
        <h1 className="text-3xl font-serif text-fashion-charcoal mb-2">
          What are you shopping for today?
        </h1>
        <p className="text-gray-600 mb-12 text-lg">
          Choose a category to see personalized recommendations
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {categories.map((category) => (
            <Card 
              key={category.id}
              className="cursor-pointer hover:shadow-lg transition-all duration-300 hover:scale-105"
              onClick={() => handleCategorySelect(category.id)}
            >
              <CardContent className="p-8 text-center">
                <div className="text-6xl mb-4">{category.icon}</div>
                <h3 className="text-2xl font-medium text-fashion-charcoal">
                  {category.name}
                </h3>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <Dialog open={showFitModal} onOpenChange={setShowFitModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-xl">
              Choose your preferred fit for {selectedCategoryData?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            {selectedCategoryData?.fits.map((fit) => (
              <Button
                key={fit}
                variant="outline"
                className="w-full justify-start text-left h-12"
                onClick={() => handleFitSelect(fit)}
              >
                {fit}
              </Button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CategorySelection;
