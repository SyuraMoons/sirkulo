export const CRAFT_CATEGORIES = ['All', 'Home Furniture', 'Gardening', 'Animal Feed'] as const;

export type CraftCategory = (typeof CRAFT_CATEGORIES)[number];

export interface CraftItem {
  id: string;
  name: string;
  category: CraftCategory;
  rating: number;
  ratingCount: number;
  price: string;
  stock: number;
  seller: string;
  details: string;
  image: number;
}

export const MOCK_CRAFTS: CraftItem[] = [
  {
    id: '1',
    name: 'Recycled Plastic Chair',
    category: 'Home Furniture',
    rating: 4.6,
    ratingCount: 2,
    price: 'IDR 150,000',
    stock: 23,
    seller: 'EcoFurni',
    details: 'plastic',
    image: require('@/assets/images/plastic-chair.jpg'),
  },
  {
    id: '2',
    name: 'Rustic Pallet Chair',
    category: 'Home Furniture',
    rating: 4.8,
    ratingCount: 2,
    price: 'IDR 250,000',
    stock: 12,
    seller: 'KayuLama Studio',
    details: 'Wood',
    image: require('@/assets/images/WoodChair.jpg'),
  },
  {
    id: '3',
    name: 'Eco-Friendly Plant Pot',
    category: 'Gardening',
    rating: 4.5,
    ratingCount: 2,
    price: 'IDR 50,000',
    stock: 45,
    seller: 'TanamBaik',
    details: 'Plastic',
    image: require('@/assets/images/PlantPot.jpg'),
  },
  {
    id: '4',
    name: 'Earthworm Compost',
    category: 'Gardening',
    rating: 4.9,
    ratingCount: 2,
    price: 'IDR 30,000 / kg',
    stock: 60,
    seller: 'EarthCycle Organics',
    details: 'Organic',
    image: require('@/assets/images/Fertilizer.jpg'),
  },
  {
    id: '5',
    name: 'Maggot Dried Food',
    category: 'Animal Feed',
    rating: 4.7,
    ratingCount: 2,
    price: 'IDR 40,000 / 250g',
    stock: 35,
    seller: 'LarvaFarm',
    details: 'Organic',
    image: require('@/assets/images/Manggot.jpg'),
  },
];
