
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { ExternalOffer } from '@/types';

interface OffersListProps {
  offers: ExternalOffer[];
}

const OffersList: React.FC<OffersListProps> = ({ offers }) => {
  if (offers.length === 0) {
    return <div className="text-center py-10">No offers available at the moment</div>;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-serif font-medium">Special Offers Based On Your Size</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {offers.map((offer) => (
          <a 
            href={offer.url} 
            target="_blank" 
            rel="noopener noreferrer" 
            key={offer.id}
            className="block"
          >
            <Card className="overflow-hidden card-hover">
              <div className="relative aspect-[2/3] overflow-hidden">
                <img 
                  src={offer.imageUrl} 
                  alt={offer.name} 
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                />
                {offer.discount && (
                  <div className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                    {offer.discount}
                  </div>
                )}
              </div>
              <CardContent className="p-4">
                <div className="font-medium text-sm text-gray-500 mb-1 flex justify-between">
                  <span>{offer.brand}</span>
                  <span className="text-xs text-gray-400">{offer.store}</span>
                </div>
                <h3 className="font-medium line-clamp-1">{offer.name}</h3>
                <div className="mt-2 flex items-center space-x-2">
                  {offer.discountedPrice ? (
                    <>
                      <span className="font-semibold">${offer.discountedPrice.toFixed(2)}</span>
                      <span className="text-gray-400 line-through text-sm">${offer.price.toFixed(2)}</span>
                    </>
                  ) : (
                    <span className="font-semibold">${offer.price.toFixed(2)}</span>
                  )}
                  {offer.sizeRecommendation && (
                    <span className="ml-auto text-xs px-2 py-1 bg-fashion-cream text-fashion-charcoal rounded">
                      Size: {offer.sizeRecommendation}
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          </a>
        ))}
      </div>
    </div>
  );
};

export default OffersList;
