export interface Asset {
  id?: number;
  title: string;
  description: string;
  category: string;
  images?: string[]; // urls
  pricePerDay: number;
  location?: string;
  availability?: { from: string; to: string }[]; // optional calendar ranges
  leaserId?: number;
  status?: 'pending' | 'approved' | 'rejected';
}
