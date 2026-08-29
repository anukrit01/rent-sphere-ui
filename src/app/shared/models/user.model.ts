export type UserRole = 'guest' | 'renter' | 'leaser' | 'admin';

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  companyName?: string;
  avatar?: string;
  location?: string;
  verified?: boolean;
  memberSince?: string;
  completedRentals?: number;
  rating?: number;
  token?: string;
}

export interface DemoAccount {
  user: User;
  description: string;
  badgeLabel: string;
}
