export interface Booking {
  id?: number;
  assetId: number;
  renterId: number;
  startDate: string;
  endDate: string;
  totalAmount?: number;
  status?: 'pending' | 'approved' | 'rejected' | 'completed';
  createdAt?: string;
}
