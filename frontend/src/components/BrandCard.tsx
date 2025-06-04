
import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Brand } from '@/types';

interface BrandCardProps {
  brand: Brand;
}

const BrandCard: React.FC<BrandCardProps> = ({ brand }) => {
  return (
    <Link to={`/brands/${brand.id}`}>
      <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
        <div className="p-4">
          <AspectRatio ratio={3/2} className="bg-fashion-cream/30 rounded-md overflow-hidden">
            <img 
              src={brand.logo} 
              alt={`${brand.name} logo`} 
              className="object-contain w-full h-full p-2"
            />
          </AspectRatio>
        </div>
        <CardContent className="p-4">
          <h3 className="font-serif text-lg font-medium mb-1">{brand.name}</h3>
          <p className="text-sm text-gray-500 line-clamp-2 h-10">{brand.description}</p>
        </CardContent>
      </Card>
    </Link>
  );
};

export default BrandCard;
