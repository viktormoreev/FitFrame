
import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { ClothingItem } from '@/types';

interface ClothingCardProps {
  item: ClothingItem;
}

const ClothingCard: React.FC<ClothingCardProps> = ({ item }) => {
  return (
    <Link to={`/item/${item.id}`}>
      <Card className="overflow-hidden card-hover">
        <div className="aspect-[2/3] overflow-hidden">
          <img 
            src={item.imageUrl} 
            alt={item.name} 
            className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
          />
        </div>
        <CardContent className="p-4">
          <div className="font-medium text-sm text-gray-500 mb-1">{item.brand}</div>
          <h3 className="font-medium line-clamp-1">{item.name}</h3>
          <div className="mt-2 flex justify-between items-center">
            <span className="font-semibold">${item.price.toFixed(2)}</span>
            {item.sizeRecommendation && (
              <span className="text-xs px-2 py-1 bg-fashion-cream text-fashion-charcoal rounded">
                Size: {item.sizeRecommendation}
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};

export default ClothingCard;
