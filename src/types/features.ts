// Waste Listing Types
export interface WasteListing {
  id: string;
  title: string;
  category: WasteCategory;
  subcategory: string;
  quantity: {
    amount: number;
    unit: 'kg' | 'tons' | 'pieces' | 'liters';
    volume?: number;
    weight?: number;
  };
  location: {
    address: string;
    coordinates: {
      latitude: number;
      longitude: number;
    };
    accessInfo: string;
    facilityDetails?: string;
  };
  photos: string[];
  availability: {
    startDate: Date;
    endDate?: Date;
    timeWindows: TimeWindow[];
    urgency: 'flexible' | 'moderate' | 'urgent' | 'critical';
  };
  pricing: {
    basePrice?: number;
    negotiable: boolean;
    paymentTerms: string[];
    bulkDiscounts?: boolean;
  };
  description: string;
  qualityGrade: 'premium' | 'standard' | 'low-grade' | 'contaminated';
  status: 'draft' | 'active' | 'reserved' | 'completed' | 'expired';
  createdAt: Date;
  updatedAt: Date;
  userId: string;
}

export interface WasteCategory {
  id: string;
  name: string;
  icon: string;
  subcategories: WasteSubcategory[];
  processingRequirements: string[];
}

export interface WasteSubcategory {
  id: string;
  name: string;
  description: string;
  materialSpecs: string[];
}

export interface TimeWindow {
  startTime: string;
  endTime: string;
  days: string[];
}

// Project Request Types
export interface ProjectRequest {
  id: string;
  title: string;
  description: string;
  concept: {
    recyclingProcess: string;
    expectedOutcome: string;
    materialRequirements: MaterialRequirement[];
    functionalRequirements: string[];
    designPreferences: string[];
  };
  references: {
    images: string[];
    technicalDrawings?: string[];
    styleGuides?: string[];
    inspirationPhotos: string[];
  };
  timeline: {
    deadline: Date;
    urgency: 'flexible' | 'moderate' | 'urgent' | 'critical';
    milestones: ProjectMilestone[];
    flexibilityWindow?: number; // days
  };
  budget?: {
    min?: number;
    max?: number;
    currency: string;
    paymentTerms: string[];
  };
  status: 'draft' | 'published' | 'proposals_received' | 'in_progress' | 'completed' | 'cancelled';
  proposals: ProjectProposal[];
  selectedProposal?: string;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
}

export interface MaterialRequirement {
  materialType: string;
  quantity: string;
  qualitySpecs: string[];
  alternatives?: string[];
}

export interface ProjectMilestone {
  id: string;
  name: string;
  description: string;
  targetDate: Date;
  completed: boolean;
}

export interface ProjectProposal {
  id: string;
  recyclerId: string;
  recyclerName: string;
  approach: string;
  timeline: Date;
  cost: number;
  materials: string[];
  portfolio: string[];
  rating: number;
  submittedAt: Date;
}

// Business Dashboard Types
export interface BusinessDashboard {
  impactStatistics: ImpactStatistics;
  recyclingMetrics: RecyclingMetrics;
  carbonReduction: CarbonReduction;
  achievements: BusinessAchievement[];
  publicProfile: BusinessPublicProfile;
}

export interface ImpactStatistics {
  totalEnvironmentalImpact: number;
  realTimeMetrics: {
    co2Reduced: number;
    wasteProcessed: number;
    resourcesConserved: number;
  };
  trends: {
    period: string;
    data: { date: string; value: number }[];
  };
  comparativeAnalysis: {
    industryAverage: number;
    peerBenchmark: number;
    personalBest: number;
  };
  activityBreakdown: {
    activity: string;
    impact: number;
    percentage: number;
  }[];
}

export interface RecyclingMetrics {
  totalRecycled: {
    weight: number;
    volume: number;
    items: number;
  };
  materialBreakdown: {
    material: string;
    amount: number;
    percentage: number;
    icon: string;
  }[];
  recyclingRate: number;
  monthlyReports: {
    month: string;
    recycled: number;
    target: number;
  }[];
  yearlyProgress: {
    year: number;
    total: number;
    growth: number;
  }[];
}

export interface CarbonReduction {
  totalCO2Reduced: number;
  carbonSavingsCalculator: {
    activity: string;
    co2Saved: number;
    equivalent: string;
  }[];
  emissionTrends: {
    period: string;
    reduction: number;
  }[];
  projectAttribution: {
    projectId: string;
    projectName: string;
    co2Reduction: number;
  }[];
  carbonOffsetEquivalent: {
    trees: number;
    cars: number;
    energy: number;
  };
}

export interface BusinessAchievement {
  id: string;
  title: string;
  description: string;
  category: 'environmental' | 'innovation' | 'partnership' | 'efficiency';
  icon: string;
  earnedAt: Date;
  verified: boolean;
  criteria: string[];
  progress?: {
    current: number;
    target: number;
  };
}

export interface BusinessPublicProfile {
  visibility: 'public' | 'professional' | 'private';
  showcase: {
    achievements: string[];
    certifications: string[];
    sustainabilityInitiatives: string[];
    keyMetrics: string[];
  };
  sharing: {
    socialMedia: boolean;
    qrCode: string;
    profileLink: string;
  };
  networking: {
    industryConnections: boolean;
    partnershipOpportunities: boolean;
    knowledgeSharing: boolean;
  };
}

// Common Types
export interface User {
  id: string;
  name: string;
  email: string;
  mode: 'Customer' | 'Recycler' | 'Business';
  profile: {
    avatar?: string;
    bio?: string;
    location?: string;
    verified: boolean;
    rating: number;
    joinedAt: Date;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Form Types
export interface WasteListingFormData {
  step: number;
  title: string;
  category: string;
  subcategory: string;
  description: string;
  quantity: {
    amount: string;
    unit: string;
  };
  location: {
    address: string;
    accessInfo: string;
  };
  photos: string[];
  availability: {
    startDate: string;
    timeWindows: string[];
  };
  pricing: {
    basePrice: string;
    negotiable: boolean;
  };
}

export interface ProjectRequestFormData {
  step: number;
  title: string;
  description: string;
  concept: string;
  materialRequirements: string;
  references: string[];
  deadline: string;
  urgency: string;
  budget?: {
    min: string;
    max: string;
  };
}
