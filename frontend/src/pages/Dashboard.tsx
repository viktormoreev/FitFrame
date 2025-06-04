
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ClothingCard from '@/components/ClothingCard';
import OffersList from '@/components/OffersList';
import Navigation from '@/components/Navigation';
import { ClothingItem, ExternalOffer, User } from '@/types';
import { toast } from 'sonner';

// Sample clothing items data
const sampleClothingItems: ClothingItem[] = [
  {
    id: '1',
    name: 'High-Waisted Straight Leg Jeans',
    description: 'Classic high-waisted jeans with a straight leg fit. Perfect for everyday wear.',
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
    description: 'Elegant pleated midi skirt with elastic waistband for comfort.',
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
    description: 'Flattering wrap style maxi dress with adjustable waist.',
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
    description: 'Comfortable wide leg cropped pants with side pockets.',
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
    description: 'Versatile A-line denim skirt that pairs with everything.',
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
    description: 'Beautiful floral print midi wrap dress, perfect for special occasions.',
    brand: 'Anthropologie',
    type: 'dress',
    imageUrl: 'https://images.unsplash.com/flagged/photo-1585052201332-b8c0ce30972f?q=80&w=1885&auto=format&fit=crop',
    price: 148.00,
    url: 'https://www.anthropologie.com',
    waistRange: { min: 25, max: 32 },
    hipRange: { min: 36, max: 43 }
  },
];

// Sample offers data
const sampleOffers: ExternalOffer[] = [
  {
    id: '101',
    name: 'Stretch Skinny Jeans',
    brand: 'Gap',
    imageUrl: 'https://images.unsplash.com/photo-1475178626620-a4d074967452?q=80&w=1886&auto=format&fit=crop',
    price: 69.95,
    discountedPrice: 49.99,
    discount: '30% OFF',
    url: 'https://www.gap.com',
    store: 'Gap Online',
  },
  {
    id: '102',
    name: 'Linen Blend Wide Leg Pants',
    brand: 'H&M',
    imageUrl: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?q=80&w=1897&auto=format&fit=crop',
    price: 49.99,
    discountedPrice: 34.99,
    discount: 'SALE',
    url: 'https://www.hm.com',
    store: 'H&M',
  },
  {
    id: '103',
    name: 'Ribbed Bodycon Dress',
    brand: 'ASOS',
    imageUrl: 'https://images.unsplash.com/photo-1588117305388-c2631a279f82?q=80&w=1887&auto=format&fit=crop',
    price: 45.00,
    url: 'https://www.asos.com',
    store: 'ASOS',
  },
  {
    id: '104',
    name: 'Relaxed Fit Cargo Pants',
    brand: 'Uniqlo',
    imageUrl: 'https://images.unsplash.com/photo-1551854838-212c9a5eea46?q=80&w=1887&auto=format&fit=crop',
    price: 39.90,
    url: 'https://www.uniqlo.com',
    store: 'Uniqlo',
  },
  {
    id: '105',
    name: 'Pleated Tennis Skirt',
    brand: 'American Eagle',
    imageUrl: 'https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?q=80&w=1886&auto=format&fit=crop',
    price: 39.95,
    discountedPrice: 29.99,
    discount: '25% OFF',
    url: 'https://www.ae.com',
    store: 'American Eagle',
  },
];

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [recommendedItems, setRecommendedItems] = useState<ClothingItem[]>([]);
  const [offers, setOffers] = useState<ExternalOffer[]>([]);
  
  useEffect(() => {
    // Check if user is logged in
    const userData = localStorage.getItem('fashionUser');
    if (!userData) {
      toast.error("Please log in to view your recommendations");
      navigate('/register');
      return;
    }

    try {
      const parsedUser = JSON.parse(userData) as User;
      setUser(parsedUser);
      
      // Simulate loading data
      setLoading(true);
      setTimeout(() => {
        // Filter clothing items based on user measurements
        const filtered = sampleClothingItems
          .filter(item => {
            const waistMatch = item.waistRange.min <= parsedUser.waistSize && 
                              parsedUser.waistSize <= item.waistRange.max;
            const hipMatch = item.hipRange.min <= parsedUser.hipSize && 
                            parsedUser.hipSize <= item.hipRange.max;
            return waistMatch && hipMatch;
          })
          .map(item => ({
            ...item,
            sizeRecommendation: getSizeRecommendation(parsedUser.waistSize, parsedUser.hipSize, item)
          }));
        
        // Add size recommendations to offers too
        const offersWithSizes = sampleOffers.map(offer => ({
          ...offer,
          sizeRecommendation: getOfferSizeRecommendation(parsedUser.waistSize, parsedUser.hipSize)
        }));
        
        setRecommendedItems(filtered);
        setOffers(offersWithSizes);
        setLoading(false);
        
        if (filtered.length === 0) {
          toast.info("We couldn't find exact matches for your measurements. Showing similar items instead.");
          setRecommendedItems(sampleClothingItems.slice(0, 3));
        }
      }, 1500);
    } catch (error) {
      console.error("Error parsing user data:", error);
      toast.error("Something went wrong. Please try logging in again.");
      navigate('/register');
    }
  }, [navigate]);
  
  // Simple function to determine clothing size
  const getSizeRecommendation = (waist: number, hip: number, item: ClothingItem): string => {
    if (waist < 27) return 'XS';
    if (waist < 29) return 'S';
    if (waist < 32) return 'M';
    if (waist < 35) return 'L';
    return 'XL';
  };
  
  // Size recommendation for offers
  const getOfferSizeRecommendation = (waist: number, hip: number): string => {
    if (waist < 27) return 'XS';
    if (waist < 29) return 'S';
    if (waist < 32) return 'M';
    if (waist < 35) return 'L';
    return 'XL';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Navigation />
        <div className="container mx-auto px-4 py-20">
          <div className="text-center">
            <h2 className="text-2xl font-serif mb-4">Finding your perfect styles...</h2>
            <div className="flex justify-center">
              <div className="w-16 h-16 border-4 border-fashion-gold border-t-transparent rounded-full animate-spin"></div>
            </div>
            <p className="mt-4 text-gray-500">Analyzing your measurements for the best fit</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      
      <div className="container mx-auto px-4 py-12">
        {user && (
          <div className="mb-8">
            <h1 className="text-3xl font-serif mb-2">
              Welcome{user.name ? `, ${user.name}` : ''}!
            </h1>
            <p className="text-gray-600">
              Here are your personalized clothing recommendations based on your measurements.
            </p>
          </div>
        )}
        
        <Tabs defaultValue="recommendations" className="w-full">
          <TabsList className="mb-8">
            <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
            <TabsTrigger value="offers">Special Offers</TabsTrigger>
          </TabsList>
          
          <TabsContent value="recommendations" className="space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {recommendedItems.map(item => (
                <ClothingCard key={item.id} item={item} />
              ))}
            </div>
            
            {recommendedItems.length === 0 && (
              <div className="text-center py-20 bg-fashion-cream/50 rounded-lg">
                <h3 className="text-xl font-medium mb-2">No exact matches found</h3>
                <p className="text-gray-600">
                  We couldn't find perfect matches for your exact measurements.
                  <br />Try adjusting your preferences or check our special offers instead.
                </p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="offers">
            <OffersList offers={offers} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Dashboard;
