import { WasteCategory } from '../types/features';

export const WASTE_CATEGORIES: WasteCategory[] = [
  {
    id: 'plastic',
    name: 'Plastic',
    icon: 'recycle',
    subcategories: [
      {
        id: 'pet-bottles',
        name: 'PET Bottles',
        description: 'Plastic bottles (water, soda, etc.)',
        materialSpecs: ['PET #1', 'Clear or colored', 'Clean condition'],
      },
      {
        id: 'hdpe-containers',
        name: 'HDPE Containers',
        description: 'Milk jugs, detergent bottles',
        materialSpecs: ['HDPE #2', 'Various colors', 'Label removal preferred'],
      },
      {
        id: 'plastic-bags',
        name: 'Plastic Bags',
        description: 'Shopping bags, food packaging',
        materialSpecs: ['LDPE #4', 'Clean and dry', 'No mixed materials'],
      },
    ],
    processingRequirements: ['Cleaning', 'Sorting by type', 'Label removal'],
  },
  {
    id: 'metal',
    name: 'Metal',
    icon: 'cog',
    subcategories: [
      {
        id: 'aluminum-cans',
        name: 'Aluminum Cans',
        description: 'Beverage cans, food containers',
        materialSpecs: ['Aluminum alloy', 'Crushed or whole', 'Clean condition'],
      },
      {
        id: 'steel-scrap',
        name: 'Steel Scrap',
        description: 'Steel pieces, appliances',
        materialSpecs: ['Various steel grades', 'Size limitations apply', 'Rust acceptable'],
      },
      {
        id: 'copper-wire',
        name: 'Copper Wire',
        description: 'Electrical wiring, plumbing',
        materialSpecs: ['Pure copper', 'Insulation removal preferred', 'No corrosion'],
      },
    ],
    processingRequirements: ['Sorting by grade', 'Cleaning', 'Size reduction'],
  },
  {
    id: 'paper',
    name: 'Paper',
    icon: 'file-text-o',
    subcategories: [
      {
        id: 'cardboard',
        name: 'Cardboard',
        description: 'Boxes, packaging materials',
        materialSpecs: ['Corrugated cardboard', 'Flat or folded', 'Dry condition'],
      },
      {
        id: 'office-paper',
        name: 'Office Paper',
        description: 'White paper, documents',
        materialSpecs: ['White paper', 'No plastic coating', 'Staples acceptable'],
      },
      {
        id: 'newspapers',
        name: 'Newspapers',
        description: 'Newsprint, magazines',
        materialSpecs: ['Newsprint quality', 'No glossy inserts', 'Bundle preferred'],
      },
    ],
    processingRequirements: ['Moisture control', 'Contamination removal', 'Baling'],
  },
  {
    id: 'electronic',
    name: 'Electronic',
    icon: 'mobile',
    subcategories: [
      {
        id: 'smartphones',
        name: 'Smartphones',
        description: 'Mobile phones, tablets',
        materialSpecs: ['Working or broken', 'Battery included', 'Data wiped'],
      },
      {
        id: 'computers',
        name: 'Computers',
        description: 'Laptops, desktops, components',
        materialSpecs: ['Complete or parts', 'Hard drives wiped', 'Power cables included'],
      },
      {
        id: 'small-appliances',
        name: 'Small Appliances',
        description: 'Toasters, microwaves, etc.',
        materialSpecs: ['Working or broken', 'Complete units', 'Power cords attached'],
      },
    ],
    processingRequirements: [
      'Data destruction',
      'Component separation',
      'Hazardous material handling',
    ],
  },
  {
    id: 'organic',
    name: 'Organic',
    icon: 'leaf',
    subcategories: [
      {
        id: 'food-waste',
        name: 'Food Waste',
        description: 'Kitchen scraps, expired food',
        materialSpecs: ['Organic matter only', 'No packaging', 'Fresh condition'],
      },
      {
        id: 'yard-waste',
        name: 'Yard Waste',
        description: 'Leaves, branches, grass',
        materialSpecs: ['Natural materials', 'No treated wood', 'Seasonal availability'],
      },
      {
        id: 'wood-scraps',
        name: 'Wood Scraps',
        description: 'Untreated lumber, furniture',
        materialSpecs: ['Untreated wood', 'No paint or stain', 'Various sizes'],
      },
    ],
    processingRequirements: ['Composting preparation', 'Size reduction', 'Contamination removal'],
  },
  {
    id: 'textile',
    name: 'Textile',
    icon: 'scissors',
    subcategories: [
      {
        id: 'clothing',
        name: 'Clothing',
        description: 'Used clothes, accessories',
        materialSpecs: ['Clean condition', 'Various materials', 'Wearable or damaged'],
      },
      {
        id: 'fabric-scraps',
        name: 'Fabric Scraps',
        description: 'Leftover fabric, upholstery',
        materialSpecs: ['Various fabric types', 'Clean pieces', 'Size varies'],
      },
      {
        id: 'shoes',
        name: 'Shoes',
        description: 'Footwear, boots, sandals',
        materialSpecs: ['Various materials', 'Paired or single', 'Any condition'],
      },
    ],
    processingRequirements: ['Sorting by material', 'Cleaning', 'Component separation'],
  },
  {
    id: 'glass',
    name: 'Glass',
    icon: 'glass',
    subcategories: [
      {
        id: 'bottles',
        name: 'Glass Bottles',
        description: 'Beverage bottles, jars',
        materialSpecs: ['Clear or colored glass', 'Whole or broken', 'Labels acceptable'],
      },
      {
        id: 'window-glass',
        name: 'Window Glass',
        description: 'Flat glass, mirrors',
        materialSpecs: ['Flat glass sheets', 'Various sizes', 'Handle with care'],
      },
      {
        id: 'cookware',
        name: 'Glass Cookware',
        description: 'Pyrex, glass dishes',
        materialSpecs: ['Tempered glass', 'Complete pieces', 'Heat-resistant glass'],
      },
    ],
    processingRequirements: ['Color sorting', 'Crushing', 'Contamination removal'],
  },
  {
    id: 'composite',
    name: 'Composite',
    icon: 'puzzle-piece',
    subcategories: [
      {
        id: 'tetra-pak',
        name: 'Tetra Pak',
        description: 'Milk cartons, juice boxes',
        materialSpecs: ['Multi-layer packaging', 'Clean and dry', 'Caps removed'],
      },
      {
        id: 'mixed-materials',
        name: 'Mixed Materials',
        description: 'Complex products with multiple materials',
        materialSpecs: ['Various combinations', 'Disassembly required', 'Component identification'],
      },
    ],
    processingRequirements: ['Material separation', 'Specialized processing', 'Component recovery'],
  },
];

export const QUALITY_GRADES = [
  {
    id: 'premium',
    name: 'Premium',
    description: 'Excellent condition, minimal contamination',
    color: '#4CAF50',
  },
  {
    id: 'standard',
    name: 'Standard',
    description: 'Good condition, some minor contamination',
    color: '#2196F3',
  },
  {
    id: 'low-grade',
    name: 'Low Grade',
    description: 'Fair condition, moderate contamination',
    color: '#FF9800',
  },
  {
    id: 'contaminated',
    name: 'Contaminated',
    description: 'Poor condition, significant contamination',
    color: '#F44336',
  },
];

export const URGENCY_LEVELS = [
  {
    id: 'flexible',
    name: 'Flexible',
    description: 'No rush, flexible timing',
    color: '#4CAF50',
  },
  {
    id: 'moderate',
    name: 'Moderate',
    description: 'Preferred timeline, some flexibility',
    color: '#2196F3',
  },
  {
    id: 'urgent',
    name: 'Urgent',
    description: 'Time-sensitive, quick pickup needed',
    color: '#FF9800',
  },
  {
    id: 'critical',
    name: 'Critical',
    description: 'Immediate attention required',
    color: '#F44336',
  },
];

export const QUANTITY_UNITS = [
  { id: 'kg', name: 'Kilograms (kg)', type: 'weight' },
  { id: 'tons', name: 'Tons', type: 'weight' },
  { id: 'pieces', name: 'Pieces', type: 'count' },
  { id: 'liters', name: 'Liters', type: 'volume' },
  { id: 'cubic-meters', name: 'Cubic Meters', type: 'volume' },
  { id: 'bags', name: 'Bags', type: 'container' },
  { id: 'boxes', name: 'Boxes', type: 'container' },
];

export const PROJECT_TEMPLATES = [
  {
    id: 'plastic-chair',
    name: 'Chair from Plastic Waste',
    description: 'Transform plastic bottles into functional seating',
    category: 'furniture',
    materials: ['PET bottles', 'HDPE containers'],
    estimatedTime: '2-4 weeks',
    complexity: 'moderate',
    image: 'chair-template.jpg',
  },
  {
    id: 'metal-art',
    name: 'Wall Art from Metal Scraps',
    description: 'Create decorative wall pieces from metal waste',
    category: 'decor',
    materials: ['Steel scraps', 'Aluminum pieces'],
    estimatedTime: '1-3 weeks',
    complexity: 'simple',
    image: 'art-template.jpg',
  },
  {
    id: 'storage-container',
    name: 'Storage from Composite Materials',
    description: 'Build storage solutions from mixed materials',
    category: 'functional',
    materials: ['Plastic containers', 'Metal components'],
    estimatedTime: '1-2 weeks',
    complexity: 'simple',
    image: 'storage-template.jpg',
  },
  {
    id: 'garden-planter',
    name: 'Garden Planter from Organic Waste',
    description: 'Create planters using wood and organic materials',
    category: 'outdoor',
    materials: ['Wood scraps', 'Organic matter'],
    estimatedTime: '2-3 weeks',
    complexity: 'moderate',
    image: 'planter-template.jpg',
  },
];

export const BUSINESS_ACHIEVEMENT_CATEGORIES = [
  {
    id: 'environmental',
    name: 'Environmental',
    icon: 'leaf',
    color: '#4CAF50',
  },
  {
    id: 'innovation',
    name: 'Innovation',
    icon: 'lightbulb-o',
    color: '#2196F3',
  },
  {
    id: 'partnership',
    name: 'Partnership',
    icon: 'handshake-o',
    color: '#FF9800',
  },
  {
    id: 'efficiency',
    name: 'Efficiency',
    icon: 'tachometer',
    color: '#9C27B0',
  },
];

export const MATERIAL_ICONS = {
  plastic: 'recycle',
  metal: 'cog',
  paper: 'file-text-o',
  electronic: 'mobile',
  organic: 'leaf',
  textile: 'scissors',
  glass: 'glass',
  composite: 'puzzle-piece',
};

export const COLORS = {
  primary: '#386B5F',
  secondary: '#E6F3EC',
  accent: '#4CAF50',
  warning: '#FF9800',
  error: '#F44336',
  success: '#4CAF50',
  info: '#2196F3',
  background: '#FFFFFF',
  surface: '#F5F6F8',
  text: {
    primary: '#222222',
    secondary: '#666666',
    disabled: '#999999',
  },
};
