export type EquipmentStatus = 'available' | 'rented' | 'maintenance' | 'pending' | 'approved' | 'rejected' | 'changes_requested';
export type EquipmentCondition = 'Excellent (Like New)' | 'Good (Fully Serviced)' | 'Certified Rebuilt' | 'Working';

export interface AssetSpecification {
  brand: string;
  model: string;
  year: number;
  operatingWeight?: string;
  enginePower?: string;
  fuelType?: 'Diesel' | 'Electric' | 'Hybrid' | 'Petrol';
  operatingHours?: number;
  capacity?: string;
  maxReach?: string;
  boomLength?: string;
}

export interface AssetOwner {
  id: number;
  name: string;
  companyName: string;
  verified: boolean;
  rating: number;
  reviewCount: number;
  completedRentals: number;
  responseTime: string;
  memberSince: string;
  location: string;
  phone?: string;
}

export interface AssetReview {
  id: number;
  authorName: string;
  authorCompany?: string;
  rating: number;
  date: string;
  comment: string;
  projectType?: string;
}

export interface Asset {
  id: number;
  title: string;
  name?: string; // alias
  category: string;
  categorySlug?: string;
  tagline?: string;
  description: string;
  images: string[];
  coverImage?: string;
  pricePerDay: number;
  pricePerWeek?: number;
  securityDeposit: number;
  location: string;
  city: string;
  state: string;
  pinCode?: string;
  rating: number;
  reviewCount: number;
  available: boolean;
  status: EquipmentStatus;
  condition: EquipmentCondition;
  featured?: boolean;
  popular?: boolean;
  isNewArrival?: boolean;
  specifications: AssetSpecification;
  features: string[];
  rentalTerms: string[];
  owner: AssetOwner;
  reviews?: AssetReview[];
  minimumRentalDays?: number;
  operatorProvided?: boolean;
  deliveryAvailable?: boolean;
  deliveryFee?: number;
  createdAt?: string;
  leaserId?: number;
  adminNotes?: string;
  auditReason?: string;
}
