import { Asset } from './asset.model';
import { User } from './user.model';

export type BookingStatus = 'pending' | 'approved' | 'active' | 'rejected' | 'completed' | 'cancelled';

export interface Booking {
  id: number;
  assetId: number;
  asset?: Asset;
  renterId: number;
  renterName?: string;
  renterCompany?: string;
  renterPhone?: string;
  startDate: string;
  endDate: string;
  durationDays: number;
  dailyRate: number;
  rentalSubtotal: number;
  operatorRequired: boolean;
  operatorFee: number;
  deliveryRequired: boolean;
  deliveryFee: number;
  securityDeposit: number;
  estimatedTotal: number;
  projectLocation: string;
  projectDescription?: string;
  status: BookingStatus;
  createdAt: string;
  rejectionReason?: string;
}

export interface BookingCalculation {
  durationDays: number;
  dailyRate: number;
  rentalSubtotal: number;
  operatorFee: number;
  deliveryFee: number;
  securityDeposit: number;
  estimatedTotal: number;
}
