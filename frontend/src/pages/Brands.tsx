
import React from 'react';
import Navigation from '@/components/Navigation';
import BrandCard from '@/components/BrandCard';
import { Brand } from '@/types';

// Sample brands data
const brandsData: Brand[] = [
  {
    id: 'levis',
    name: "Levi's",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/75/Levi%27s_logo.svg/1200px-Levi%27s_logo.svg.png",
    description: "Iconic American brand known for high-quality denim and casual wear since 1853.",
    websiteUrl: "https://www.levis.com",
    featured: true,
  },
  {
    id: 'zara',
    name: "Zara",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fd/Zara_Logo.svg/1200px-Zara_Logo.svg.png",
    description: "International fashion retailer offering trendy clothing and accessories for all ages.",
    websiteUrl: "https://www.zara.com",
    featured: true,
  },
  {
    id: 'reformation',
    name: "Reformation",
    logo: "https://logos-world.net/wp-content/uploads/2023/01/Reformation-Logo.png",
    description: "Sustainable fashion brand creating stylish clothing with eco-friendly practices.",
    websiteUrl: "https://www.thereformation.com",
    featured: true,
  },
  {
    id: 'everlane',
    name: "Everlane",
    logo: "https://1000logos.net/wp-content/uploads/2021/05/Everlane-logo.png",
    description: "Ethical fashion brand focused on transparent pricing and sustainable practices.",
    websiteUrl: "https://www.everlane.com",
    featured: false,
  },
  {
    id: 'madewell',
    name: "Madewell",
    logo: "https://logos-world.net/wp-content/uploads/2022/01/Madewell-Logo.png",
    description: "American specialty retailer known for denim and casual clothing with a vintage inspiration.",
    websiteUrl: "https://www.madewell.com",
    featured: false,
  },
  {
    id: 'anthropologie',
    name: "Anthropologie",
    logo: "https://logos-world.net/wp-content/uploads/2022/01/Anthropologie-Logo.png",
    description: "Unique, bohemian apparel, accessories, and home decor with artistic flair.",
    websiteUrl: "https://www.anthropologie.com",
    featured: false,
  },
  {
    id: 'hm',
    name: "H&M",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/H%26M-Logo.svg/1200px-H%26M-Logo.svg.png",
    description: "Global fashion retailer offering affordable and sustainable fashion for all.",
    websiteUrl: "https://www.hm.com",
    featured: false,
  },
  {
    id: 'uniqlo',
    name: "Uniqlo",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/92/UNIQLO_logo.svg/1200px-UNIQLO_logo.svg.png",
    description: "Japanese casual wear designer, manufacturer offering high-quality basics at affordable prices.",
    websiteUrl: "https://www.uniqlo.com",
    featured: false,
  }
];

const Brands = () => {
  const featuredBrands = brandsData.filter(brand => brand.featured);
  const allBrands = brandsData;

  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-3xl font-serif mb-8">Brand Catalogs</h1>
        
        {/* Featured Brands Section */}
        <section className="mb-12">
          <h2 className="text-xl font-serif font-medium mb-6">Featured Brands</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredBrands.map(brand => (
              <BrandCard key={brand.id} brand={brand} />
            ))}
          </div>
        </section>
        
        {/* All Brands Section */}
        <section>
          <h2 className="text-xl font-serif font-medium mb-6">All Brands</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {allBrands.map(brand => (
              <BrandCard key={brand.id} brand={brand} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default Brands;
