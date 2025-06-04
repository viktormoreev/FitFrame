
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import { Skeleton } from '@/components/ui/skeleton';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { ClothingItem, Brand } from '@/types';
import ClothingCard from '@/components/ClothingCard';

// Sample brands data (same as in Brands.tsx)
const brandsData: Brand[] = [
  {
    id: 'levis',
    name: "Levi's",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/75/Levi%27s_logo.svg/1200px-Levi%27s_logo.svg.png",
    description: "Iconic American brand known for high-quality denim and casual wear since 1853. From their classic 501 jeans to modern styles, Levi's combines heritage craftsmanship with contemporary design to create timeless pieces that last for years.",
    websiteUrl: "https://www.levis.com",
    featured: true,
  },
  {
    id: 'zara',
    name: "Zara",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fd/Zara_Logo.svg/1200px-Zara_Logo.svg.png",
    description: "International fashion retailer offering trendy clothing and accessories for all ages. Known for quickly turning the latest runway styles into affordable fashion, Zara delivers new designs to their stores twice a week, ensuring their collections are always fresh and on-trend.",
    websiteUrl: "https://www.zara.com",
    featured: true,
  },
  {
    id: 'reformation',
    name: "Reformation",
    logo: "https://logos-world.net/wp-content/uploads/2023/01/Reformation-Logo.png",
    description: "Sustainable fashion brand creating stylish clothing with eco-friendly practices. Reformation's mission is to create effortless silhouettes that celebrate the feminine figure while minimizing environmental impact through sustainable fabrics and responsible manufacturing processes.",
    websiteUrl: "https://www.thereformation.com",
    featured: true,
  },
  {
    id: 'everlane',
    name: "Everlane",
    logo: "https://1000logos.net/wp-content/uploads/2021/05/Everlane-logo.png",
    description: "Ethical fashion brand focused on transparent pricing and sustainable practices. Everlane reveals the true costs behind all of their products—from materials to labor to transportation—and offers them without traditional retail markups.",
    websiteUrl: "https://www.everlane.com",
    featured: false,
  },
  {
    id: 'madewell',
    name: "Madewell",
    logo: "https://logos-world.net/wp-content/uploads/2022/01/Madewell-Logo.png",
    description: "American specialty retailer known for denim and casual clothing with a vintage inspiration. With a focus on quality craftsmanship and timeless design, Madewell creates pieces that are meant to be worn and loved for years to come.",
    websiteUrl: "https://www.madewell.com",
    featured: false,
  },
  {
    id: 'anthropologie',
    name: "Anthropologie",
    logo: "https://logos-world.net/wp-content/uploads/2022/01/Anthropologie-Logo.png",
    description: "Unique, bohemian apparel, accessories, and home decor with artistic flair. Anthropologie curates a thoughtful and diverse product offering that creates an immersive shopping experience for customers who appreciate creativity and individual expression.",
    websiteUrl: "https://www.anthropologie.com",
    featured: false,
  },
  {
    id: 'hm',
    name: "H&M",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/H%26M-Logo.svg/1200px-H%26M-Logo.svg.png",
    description: "Global fashion retailer offering affordable and sustainable fashion for all. H&M's business concept is to offer fashion and quality at the best price in a sustainable way, with collections that are updated daily with new arrivals.",
    websiteUrl: "https://www.hm.com",
    featured: false,
  },
  {
    id: 'uniqlo',
    name: "Uniqlo",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/92/UNIQLO_logo.svg/1200px-UNIQLO_logo.svg.png",
    description: "Japanese casual wear designer, manufacturer offering high-quality basics at affordable prices. Uniqlo is known for its innovative fabrics like HEATTECH and AIRism, which combine technology with everyday comfort to create versatile wardrobe essentials.",
    websiteUrl: "https://www.uniqlo.com",
    featured: false,
  }
];

// Sample clothing items by brand
const getClothingByBrand = (brandId: string): ClothingItem[] => {
  switch(brandId) {
    case 'levis':
      return [
        {
          id: 'levis-1',
          name: 'High-Rise Straight Leg Jeans',
          description: 'Classic high-rise jeans with a straight leg fit. Made with premium denim that offers just the right amount of stretch for all-day comfort.',
          brand: "Levi's",
          type: 'pants',
          imageUrl: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?q=80&w=1887&auto=format&fit=crop',
          price: 79.99,
          url: 'https://www.levis.com',
          waistRange: { min: 24, max: 34 },
          hipRange: { min: 34, max: 44 }
        },
        {
          id: 'levis-2',
          name: 'Ribcage Wide Leg Jeans',
          description: 'Our highest rise yet with a dramatic wide leg. These statement jeans create a long, lean silhouette.',
          brand: "Levi's",
          type: 'pants',
          imageUrl: 'https://images.unsplash.com/photo-1582418702059-97ebafb35d09?q=80&w=1915&auto=format&fit=crop',
          price: 98.00,
          url: 'https://www.levis.com',
          waistRange: { min: 23, max: 32 },
          hipRange: { min: 33, max: 43 }
        },
        {
          id: 'levis-3',
          name: 'Wedgie Fit Jeans',
          description: 'The vintage-inspired mom jean with a modern update. Features a flattering fit that accentuates your waist.',
          brand: "Levi's",
          type: 'pants',
          imageUrl: 'https://images.unsplash.com/photo-1604176424472-9d0af5d0d59b?q=80&w=1964&auto=format&fit=crop',
          price: 89.99,
          url: 'https://www.levis.com',
          waistRange: { min: 24, max: 34 },
          hipRange: { min: 32, max: 44 }
        },
      ];
    case 'zara':
      return [
        {
          id: 'zara-1',
          name: 'Pleated Midi Skirt',
          description: 'Elegant pleated midi skirt with elastic waistband for comfort. Perfect for office or special occasions.',
          brand: "Zara",
          type: 'skirt',
          imageUrl: 'https://images.unsplash.com/photo-1577900232427-18219b8349cc?q=80&w=1770&auto=format&fit=crop',
          price: 49.99,
          url: 'https://www.zara.com',
          waistRange: { min: 24, max: 34 },
          hipRange: { min: 34, max: 44 }
        },
        {
          id: 'zara-2',
          name: 'Wide Leg Culotte Pants',
          description: 'Flowy culotte pants with wide leg and high waist. Features side pockets and back zip closure.',
          brand: "Zara",
          type: 'pants',
          imageUrl: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?q=80&w=1887&auto=format&fit=crop',
          price: 59.90,
          url: 'https://www.zara.com',
          waistRange: { min: 25, max: 34 },
          hipRange: { min: 35, max: 45 }
        },
        {
          id: 'zara-3',
          name: 'Printed Midi Dress',
          description: 'Flowing midi dress with V-neckline and short sleeves. Features an allover floral print pattern.',
          brand: "Zara",
          type: 'dress',
          imageUrl: 'https://images.unsplash.com/photo-1612336307429-8a898d10e223?q=80&w=1887&auto=format&fit=crop',
          price: 69.90,
          url: 'https://www.zara.com',
          waistRange: { min: 25, max: 33 },
          hipRange: { min: 35, max: 43 }
        },
      ];
    // Add cases for other brands with their respective items
    default:
      return [
        {
          id: `${brandId}-1`,
          name: 'Signature Style Item',
          description: 'A popular clothing item from this brand.',
          brand: brandId.charAt(0).toUpperCase() + brandId.slice(1),
          type: 'dress',
          imageUrl: 'https://images.unsplash.com/photo-1495385794356-15371f348c31?q=80&w=1940&auto=format&fit=crop',
          price: 89.99,
          url: `https://www.${brandId}.com`,
          waistRange: { min: 24, max: 36 },
          hipRange: { min: 34, max: 46 }
        },
        {
          id: `${brandId}-2`,
          name: 'Essential Basic Item',
          description: 'A must-have piece for any wardrobe.',
          brand: brandId.charAt(0).toUpperCase() + brandId.slice(1),
          type: 'pants',
          imageUrl: 'https://images.unsplash.com/photo-1506629082955-511b1aa562c8?q=80&w=1887&auto=format&fit=crop',
          price: 59.99,
          url: `https://www.${brandId}.com`,
          waistRange: { min: 25, max: 35 },
          hipRange: { min: 35, max: 45 }
        }
      ];
  }
};

const BrandDetail = () => {
  const { brandId } = useParams<{ brandId: string }>();
  const [brand, setBrand] = useState<Brand | null>(null);
  const [clothing, setClothing] = useState<ClothingItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API fetch with delay
    setLoading(true);
    setTimeout(() => {
      if (brandId) {
        const foundBrand = brandsData.find(b => b.id === brandId);
        if (foundBrand) {
          setBrand(foundBrand);
          setClothing(getClothingByBrand(brandId));
        }
      }
      setLoading(false);
    }, 800);
  }, [brandId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Navigation />
        <div className="container mx-auto px-4 py-12">
          <div className="w-full h-24 mb-6">
            <Skeleton className="h-24 w-48" />
          </div>
          <Skeleton className="h-16 w-full mb-8" />
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <Skeleton key={i} className="h-80 w-full" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!brand) {
    return (
      <div className="min-h-screen bg-white">
        <Navigation />
        <div className="container mx-auto px-4 py-12">
          <div className="text-center py-16">
            <h2 className="text-2xl font-medium mb-2">Brand Not Found</h2>
            <p className="text-gray-600 mb-6">
              The brand you're looking for doesn't exist or has been removed.
            </p>
            <Link to="/brands" className="text-fashion-gold hover:underline">
              View all brands
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      
      <div className="container mx-auto px-4 py-12">
        <div className="mb-8 flex flex-col md:flex-row items-start gap-8">
          {/* Brand logo */}
          <div className="w-full md:w-1/4 mb-6 md:mb-0">
            <div className="bg-fashion-cream/30 rounded-lg p-6">
              <AspectRatio ratio={3/2} className="w-full">
                <img 
                  src={brand.logo} 
                  alt={`${brand.name} logo`} 
                  className="object-contain w-full h-full"
                />
              </AspectRatio>
            </div>
          </div>
          
          {/* Brand info */}
          <div className="w-full md:w-3/4">
            <h1 className="text-3xl font-serif mb-3">{brand.name}</h1>
            <p className="text-gray-600 mb-6">{brand.description}</p>
            <a 
              href={brand.websiteUrl} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="inline-block text-fashion-gold hover:underline"
            >
              Visit Official Website
            </a>
          </div>
        </div>
        
        {/* Brand catalog */}
        <div className="mb-8">
          <h2 className="text-xl font-serif font-medium mb-6">{brand.name} Collection</h2>
          
          {clothing.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {clothing.map(item => (
                <ClothingCard key={item.id} item={item} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-gray-50 rounded-lg">
              <p>No items available for this brand at the moment.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BrandDetail;
