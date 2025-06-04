
import React, { useState, useEffect } from 'react';
import { ClothingItem } from '@/types';
import Navigation from '@/components/Navigation';
import ClothingCard from '@/components/ClothingCard';

const Favorites = () => {
  const [favorites, setFavorites] = useState<ClothingItem[]>([]);

  useEffect(() => {
    const savedFavorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    setFavorites(savedFavorites);
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-serif mb-4">Your Favorites</h1>
          <p className="text-gray-600">Items you've saved for later</p>
        </div>
        
        {favorites.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">❤️</div>
            <h2 className="text-xl font-medium mb-2">No favorites yet</h2>
            <p className="text-gray-500">Start browsing and add items you love!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {favorites.map(item => (
              <ClothingCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Favorites;
