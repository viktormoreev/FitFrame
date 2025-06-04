
export type User = {
  id: string;
  name?: string;
  email: string;
  waistSize: number;
  hipSize: number;
  photoUrl?: string;
  preferences?: ClothingPreference;
};

export type ClothingPreference = {
  fit: 'tight' | 'regular' | 'loose';
  style: string[];
  colors: string[];
};

export type ClothingItem = {
  id: string;
  name: string;
  description: string;
  brand: string;
  type: 'pants' | 'skirt' | 'dress';
  imageUrl: string;
  price: number;
  url: string;
  sizeRecommendation?: string;
  waistRange: {
    min: number;
    max: number;
  };
  hipRange: {
    min: number;
    max: number;
  };
};

export type ExternalOffer = {
  id: string;
  name: string;
  brand: string;
  imageUrl: string;
  price: number;
  discountedPrice?: number;
  discount?: string;
  url: string;
  store: string;
  sizeRecommendation?: string;
};

export type Brand = {
  id: string;
  name: string;
  logo: string;
  description: string;
  websiteUrl: string;
  featured: boolean;
};
