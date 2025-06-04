
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Navigation from '@/components/Navigation';
import OffersList from '@/components/OffersList';
import ClothingCard from '@/components/ClothingCard';
import { ClothingItem, ExternalOffer, User } from '@/types';
import { toast } from 'sonner';

// Sample clothing items (same as in Dashboard)
const sampleClothingItems: ClothingItem[] = [
  {
    id: '1',
    name: 'High-Waisted Straight Leg Jeans',
    description: 'Classic high-waisted jeans with a straight leg fit. Perfect for everyday wear. These jeans feature a flattering rise that sits just above the navel and a straight leg that creates a streamlined silhouette. Made with premium denim fabric that provides stretch and comfort while maintaining its shape throughout the day.',
    brand: 'Levi\'s',
    type: 'pants',
    imageUrl: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?q=80&w=1887&auto=format&fit=crop',
    price: 79.99,
    url: 'https://www.levis.com',
    waistRange: { min: 26, max: 32 },
    hipRange: { min: 34, max: 42 }
  },
  {
    id: '2',
    name: 'Pleated Midi Skirt',
    description: 'Elegant pleated midi skirt with elastic waistband for comfort. This versatile skirt falls elegantly below the knee and features fine pleating throughout for a sophisticated look. The elastic waistband ensures a comfortable fit for various body types. Pair with a tucked-in blouse for work or a casual t-shirt for weekend outings.',
    brand: 'Zara',
    type: 'skirt',
    imageUrl: 'https://images.unsplash.com/photo-1577900232427-18219b8349cc?q=80&w=1770&auto=format&fit=crop',
    price: 49.99,
    url: 'https://www.zara.com',
    waistRange: { min: 24, max: 34 },
    hipRange: { min: 34, max: 44 }
  },
  {
    id: '3',
    name: 'Wrap Maxi Dress',
    description: 'Flattering wrap style maxi dress with adjustable waist. This stunning maxi dress features a true wrap design that allows for customizable fit at the waist. The V-neckline and flowing skirt create an elegant silhouette that works for both casual and formal occasions. Made from a lightweight, breathable fabric that drapes beautifully.',
    brand: 'Reformation',
    type: 'dress',
    imageUrl: 'https://images.unsplash.com/photo-1568251723346-42c84b49ed27?q=80&w=1964&auto=format&fit=crop',
    price: 128.00,
    url: 'https://www.thereformation.com',
    waistRange: { min: 24, max: 36 },
    hipRange: { min: 34, max: 46 }
  },
  {
    id: '4',
    name: 'Wide Leg Cropped Pants',
    description: 'Comfortable wide leg cropped pants with side pockets. These modern pants feature a high rise waist and wide legs that crop just above the ankle. The relaxed silhouette provides comfort while maintaining a polished appearance. Functional side pockets add practicality to this stylish piece.',
    brand: 'Everlane',
    type: 'pants',
    imageUrl: 'https://images.unsplash.com/photo-1509551388413-e18d05e95afa?q=80&w=1887&auto=format&fit=crop',
    price: 68.00,
    url: 'https://www.everlane.com',
    waistRange: { min: 25, max: 34 },
    hipRange: { min: 35, max: 44 }
  },
  {
    id: '5',
    name: 'A-Line Denim Skirt',
    description: 'Versatile A-line denim skirt that pairs with everything. This classic denim skirt features a flattering A-line silhouette that skims the hips and falls to a comfortable mid-thigh length. Made from quality denim with just the right amount of stretch, it maintains its shape while providing all-day comfort.',
    brand: 'Madewell',
    type: 'skirt',
    imageUrl: 'https://images.unsplash.com/photo-1592301933927-35b597393c0a?q=80&w=1887&auto=format&fit=crop',
    price: 72.00,
    url: 'https://www.madewell.com',
    waistRange: { min: 24, max: 32 },
    hipRange: { min: 34, max: 42 }
  },
  {
    id: '6',
    name: 'Floral Midi Wrap Dress',
    description: 'Beautiful floral print midi wrap dress, perfect for special occasions. This feminine dress features a flattering wrap design that ties at the waist and a lovely floral print throughout. The midi length and slight A-line skirt create an elegant silhouette that works for weddings, garden parties, and other special events.',
    brand: 'Anthropologie',
    type: 'dress',
    imageUrl: 'https://images.unsplash.com/flagged/photo-1585052201332-b8c0ce30972f?q=80&w=1885&auto=format&fit=crop',
    price: 148.00,
    url: 'https://www.anthropologie.com',
    waistRange: { min: 25, max: 32 },
    hipRange: { min: 36, max: 43 }
  },
];

// Sample similar items
const getSimilarItems = (currentItem: ClothingItem): ClothingItem[] => {
  return sampleClothingItems
    .filter(item => item.id !== currentItem.id && item.type === currentItem.type)
    .slice(0, 3);
};

// Sample related offers
const sampleRelatedOffers: ExternalOffer[] = [
  {
    id: '201',
    name: 'Cropped Wide Leg Jeans',
    brand: 'Madewell',
    imageUrl: 'https://images.unsplash.com/photo-1548624313-0396c75f8e0d?q=80&w=1887&auto=format&fit=crop',
    price: 89.95,
    discountedPrice: 59.99,
    discount: '30% OFF',
    url: 'https://www.madewell.com',
    store: 'Madewell',
  },
  {
    id: '202',
    name: 'Straight Leg Pants',
    brand: 'J.Crew',
    imageUrl: 'https://images.unsplash.com/photo-1563609236404-e7207111d156?q=80&w=1887&auto=format&fit=crop',
    price: 98.00,
    url: 'https://www.jcrew.com',
    store: 'J.Crew',
  },
];

const ItemDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [item, setItem] = useState<ClothingItem | null>(null);
  const [similarItems, setSimilarItems] = useState<ClothingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  
  useEffect(() => {
    // Check if user is logged in
    const userData = localStorage.getItem('fashionUser');
    if (userData) {
      setUser(JSON.parse(userData));
    }
    
    // Find the item with the matching ID
    const foundItem = sampleClothingItems.find(item => item.id === id);
    
    setTimeout(() => {
      if (foundItem) {
        // Add size recommendation if user exists
        if (userData) {
          const parsedUser = JSON.parse(userData) as User;
          const itemWithSize = {
            ...foundItem,
            sizeRecommendation: getSizeRecommendation(parsedUser.waistSize, parsedUser.hipSize, foundItem)
          };
          setItem(itemWithSize);
          setSimilarItems(getSimilarItems(foundItem).map(item => ({
            ...item,
            sizeRecommendation: getSizeRecommendation(parsedUser.waistSize, parsedUser.hipSize, item)
          })));
        } else {
          setItem(foundItem);
          setSimilarItems(getSimilarItems(foundItem));
        }
      } else {
        toast.error("Item not found");
        navigate('/dashboard');
      }
      
      setLoading(false);
    }, 800);
  }, [id, navigate]);
  
  // Simple function to determine clothing size (same as Dashboard)
  const getSizeRecommendation = (waist: number, hip: number, item: ClothingItem): string => {
    if (waist < 27) return 'XS';
    if (waist < 29) return 'S';
    if (waist < 32) return 'M';
    if (waist < 35) return 'L';
    return 'XL';
  };

  if (loading || !item) {
    return (
      <div className="min-h-screen bg-white">
        <Navigation />
        <div className="container mx-auto px-4 py-20">
          <div className="text-center">
            <div className="flex justify-center">
              <div className="w-12 h-12 border-4 border-fashion-gold border-t-transparent rounded-full animate-spin"></div>
            </div>
            <p className="mt-4 text-gray-500">Loading item details...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Product Image */}
          <div className="rounded-lg overflow-hidden">
            <img 
              src={item.imageUrl} 
              alt={item.name} 
              className="w-full h-auto object-cover"
            />
          </div>
          
          {/* Product Details */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-serif mb-1">{item.name}</h1>
              <div className="text-lg text-gray-600 mb-2">{item.brand}</div>
              <div className="text-2xl font-medium">${item.price.toFixed(2)}</div>
            </div>
            
            {item.sizeRecommendation && (
              <div className="bg-fashion-cream/60 p-4 rounded-md">
                <h3 className="font-medium mb-1">Your Recommended Size</h3>
                <div className="flex items-center">
                  <div className="text-2xl font-bold text-fashion-gold mr-2">
                    {item.sizeRecommendation}
                  </div>
                  <div className="text-sm text-gray-600">
                    Based on your measurements
                  </div>
                </div>
              </div>
            )}
            
            <div className="space-y-3">
              <h3 className="font-medium">Description</h3>
              <p className="text-gray-600">{item.description}</p>
            </div>
            
            <div className="pt-4">
              <a 
                href={item.url} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="block"
              >
                <Button className="w-full bg-fashion-gold text-white hover:bg-fashion-gold/90">
                  Shop Now at {item.brand}
                </Button>
              </a>
            </div>
          </div>
        </div>
        
        <div className="mt-16">
          <Tabs defaultValue="similar" className="w-full">
            <TabsList className="mb-8">
              <TabsTrigger value="similar">Similar Items</TabsTrigger>
              <TabsTrigger value="offers">Related Offers</TabsTrigger>
            </TabsList>
            
            <TabsContent value="similar">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {similarItems.map(similarItem => (
                  <ClothingCard key={similarItem.id} item={similarItem} />
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="offers">
              <OffersList offers={sampleRelatedOffers} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default ItemDetail;
