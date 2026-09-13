import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { Booking, BookingCalculation, BookingStatus } from '../shared/models/booking.model';
import { Asset } from '../shared/models/asset.model';
import { MOCK_ASSETS } from '../shared/data/assets.data';

export const INITIAL_BOOKINGS: Booking[] = [
  {
    id: 1001,
    assetId: 1,
    asset: MOCK_ASSETS[0],
    renterId: 101,
    renterName: 'Aman Sharma',
    renterCompany: 'Apex Infra Projects',
    renterPhone: '+91 98260 12345',
    startDate: '2025-09-05',
    endDate: '2025-09-09',
    durationDays: 4,
    dailyRate: 8500,
    rentalSubtotal: 34000,
    operatorRequired: true,
    operatorFee: 3200,
    deliveryRequired: true,
    deliveryFee: 4500,
    securityDeposit: 35000,
    estimatedTotal: 76700,
    projectLocation: 'Dewas Bypass Road Project, Indore MP',
    projectDescription: 'Excavation of foundation trenches and roadside drainage line.',
    status: 'approved',
    createdAt: '2025-08-25',
  },
  {
    id: 1002,
    assetId: 2,
    asset: MOCK_ASSETS[1],
    renterId: 101,
    renterName: 'Aman Sharma',
    renterCompany: 'Apex Infra Projects',
    renterPhone: '+91 98260 12345',
    startDate: '2025-09-12',
    endDate: '2025-09-15',
    durationDays: 3,
    dailyRate: 4500,
    rentalSubtotal: 13500,
    operatorRequired: true,
    operatorFee: 2400,
    deliveryRequired: true,
    deliveryFee: 2500,
    securityDeposit: 20000,
    estimatedTotal: 38400,
    projectLocation: 'Hoshangabad Road Commercial Complex, Bhopal MP',
    projectDescription: 'Earth leveling and gravel loading for basement paving.',
    status: 'pending',
    createdAt: '2025-08-28',
  },
  {
    id: 1003,
    assetId: 4,
    asset: MOCK_ASSETS[3],
    renterId: 102,
    renterName: 'Priya Infra Build',
    renterCompany: 'Priya Constructions',
    renterPhone: '+91 98110 99887',
    startDate: '2025-08-10',
    endDate: '2025-08-20',
    durationDays: 10,
    dailyRate: 3500,
    rentalSubtotal: 35000,
    operatorRequired: false,
    operatorFee: 0,
    deliveryRequired: true,
    deliveryFee: 3000,
    securityDeposit: 15000,
    estimatedTotal: 53000,
    projectLocation: 'Sector 62, Noida NCR',
    projectDescription: 'Continuous prime power backup for transformer replacement.',
    status: 'completed',
    createdAt: '2025-08-01',
  },
];

@Injectable({ providedIn: 'root' })
export class BookingService {
  private bookings: Booking[] = [...INITIAL_BOOKINGS];

  constructor() {
    try {
      const stored = localStorage.getItem('rentsphere_bookings');
      if (stored) {
        this.bookings = JSON.parse(stored) as Booking[];
      }
    } catch {
      // ignore
    }
  }

  private save(): void {
    try {
      localStorage.setItem('rentsphere_bookings', JSON.stringify(this.bookings));
    } catch {
      // ignore
    }
  }

  public calculateBookingCost(params: {
    asset: Asset;
    durationDays: number;
    operatorRequired: boolean;
    deliveryRequired: boolean;
  }): BookingCalculation {
    const duration = Math.max(1, params.durationDays || 1);
    const dailyRate = params.asset.pricePerDay;
    const rentalSubtotal = dailyRate * duration;
    const operatorFee = params.operatorRequired ? (800 * duration) : 0;
    const deliveryFee = params.deliveryRequired ? (params.asset.deliveryFee || 2500) : 0;
    const securityDeposit = params.asset.securityDeposit;
    const estimatedTotal = rentalSubtotal + operatorFee + deliveryFee + securityDeposit;

    return {
      durationDays: duration,
      dailyRate,
      rentalSubtotal,
      operatorFee,
      deliveryFee,
      securityDeposit,
      estimatedTotal,
    };
  }

  public createBooking(payload: Omit<Booking, 'id' | 'createdAt' | 'status'>): Observable<Booking> {
    const newBooking: Booking = {
      ...payload,
      id: Math.floor(Math.random() * 90000) + 10000,
      status: 'pending',
      createdAt: new Date().toISOString().split('T')[0],
    };

    this.bookings.unshift(newBooking);
    this.save();
    return of(newBooking).pipe(delay(350));
  }

  public getBookingsForUser(userId?: number): Observable<Booking[]> {
    const list = userId ? this.bookings.filter((b) => b.renterId === userId) : this.bookings;
    return of(list).pipe(delay(150));
  }

  public getBookingsForLeaser(leaserId?: number): Observable<Booking[]> {
    const list = leaserId
      ? this.bookings.filter((b) => b.asset?.leaserId === leaserId || b.asset?.owner?.id === leaserId)
      : this.bookings;
    return of(list).pipe(delay(150));
  }

  public getBookingsForAsset(assetId: number): Observable<Booking[]> {
    const list = this.bookings.filter((b) => b.assetId === assetId);
    return of(list).pipe(delay(150));
  }

  public updateBookingStatus(id: number, status: BookingStatus, reason?: string): Observable<Booking> {
    const idx = this.bookings.findIndex((b) => b.id === id);
    if (idx !== -1) {
      this.bookings[idx] = {
        ...this.bookings[idx],
        status,
        rejectionReason: reason || this.bookings[idx].rejectionReason,
      };
      this.save();
      return of(this.bookings[idx]).pipe(delay(200));
    }
    throw new Error('Booking not found');
  }

  public getAllBookings(): Observable<Booking[]> {
    return of([...this.bookings]).pipe(delay(150));
  }
}
