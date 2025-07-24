export interface PurchaseItem {
  id: string;
  title: string;
  status: string;
  time: string;
  price?: number;
  rating?: number;
  label?: string;
}

export const MOCK_PURCHASES: PurchaseItem[] = [
  {
    id: '1',
    title: 'Tas dari Botol Plastik Daur Ulang',
    status: 'Dikirim',
    time: '1 hari lalu',
    price: 125000,
  },
  {
    id: '2',
    title: 'Review: EcoFurniture Co.',
    status: 'Dipublikasi',
    rating: 4,
    time: '3 hari lalu',
  },
  {
    id: '3',
    title: 'Lacak: Sepatu dari Ban Bekas',
    status: 'Dilihat',
    label: 'Transparan',
    time: '5 hari lalu',
  },
];

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  progress: number;
  target: number;
}

export const MOCK_ACHIEVEMENTS: Achievement[] = [
  {
    id: '1',
    title: 'Eco Shopper',
    description: 'Buy 20+ eco products',
    icon: 'trophy',
    progress: 18,
    target: 20,
  },
  {
    id: '2',
    title: 'Planet Saver',
    description: 'Reduce 50kg CO2',
    icon: 'leaf',
    progress: 45.2,
    target: 50,
  },
  {
    id: '3',
    title: 'Business Supporter',
    description: 'Support 10+ businesses',
    icon: 'diamond',
    progress: 7,
    target: 10,
  },
];