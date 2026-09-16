import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { delay, map, catchError } from 'rxjs/operators';
import { Booking, BookingCalculation, BookingStatus } from '../shared/models/booking.model';
import { Asset } from '../shared/models/asset.model';
import { MOCK_ASSETS } from '../shared/data/assets.data';
import { environment } from '../../environments/environment';
import { mapBackendBookingToUiBooking } from '../shared/adapters/api-adapters';

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
  private http = inject(HttpClient);
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
    const operatorFee = params.operatorRequired ? 800 * duration : 0;
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
    const isUuid = typeof payload.assetId === 'string' && payload.assetId.includes('-');
    const apiPayload = {
      assetId: String(payload.assetId),
      startDate: new Date(payload.startDate).toISOString(),
      endDate: new Date(payload.endDate).toISOString(),
      operatorRequired: !!payload.operatorRequired,
      deliveryRequired: !!payload.deliveryRequired,
      projectLocation: payload.projectLocation,
      projectDescription: payload.projectDescription || 'Heavy equipment rental lease.',
    };

    if (isUuid) {
      return this.http.post<any>(`${environment.apiUrl}/bookings`, apiPayload).pipe(
        map((res) => {
          if (res && res.success && res.data) {
            const mapped = mapBackendBookingToUiBooking(res.data);
            this.bookings.unshift(mapped);
            this.save();
            return mapped;
          }
          return this.createMockBooking(payload);
        }),
        catchError(() => of(this.createMockBooking(payload)))
      );
    }

    return of(this.createMockBooking(payload)).pipe(delay(350));
  }

  public getBookingsForUser(userId?: string | number): Observable<Booking[]> {
    return this.http
      .get<any>(`${environment.apiUrl}/bookings`, {
        params: new HttpParams().set('role', 'renter'),
      })
      .pipe(
        map((res) => {
          if (res && res.success && Array.isArray(res.data) && res.data.length > 0) {
            const apiBookings = res.data.map((item: any) => mapBackendBookingToUiBooking(item));
            return apiBookings;
          }
          return this.filterMockUserBookings(userId);
        }),
        catchError(() => of(this.filterMockUserBookings(userId)))
      );
  }

  public getBookingsForLeaser(leaserId?: string | number): Observable<Booking[]> {
    return this.http
      .get<any>(`${environment.apiUrl}/bookings`, {
        params: new HttpParams().set('role', 'leaser'),
      })
      .pipe(
        map((res) => {
          if (res && res.success && Array.isArray(res.data) && res.data.length > 0) {
            return res.data.map((item: any) => mapBackendBookingToUiBooking(item));
          }
          return this.filterMockLeaserBookings(leaserId);
        }),
        catchError(() => of(this.filterMockLeaserBookings(leaserId)))
      );
  }

  public getAllBookings(): Observable<Booking[]> {
    return this.http
      .get<any>(`${environment.apiUrl}/bookings`, {
        params: new HttpParams().set('role', 'all'),
      })
      .pipe(
        map((res) => {
          if (res && res.success && Array.isArray(res.data) && res.data.length > 0) {
            return res.data.map((item: any) => mapBackendBookingToUiBooking(item));
          }
          return [...this.bookings];
        }),
        catchError(() => of([...this.bookings]))
      );
  }

  public getBookingsForAsset(assetId: string | number): Observable<Booking[]> {
    const isUuid = typeof assetId === 'string' && assetId.includes('-');
    if (isUuid) {
      return this.http
        .get<any>(`${environment.apiUrl}/bookings`, {
          params: new HttpParams().set('assetId', String(assetId)),
        })
        .pipe(
          map((res) => {
            if (res && res.success && Array.isArray(res.data)) {
              return res.data.map((item: any) => mapBackendBookingToUiBooking(item));
            }
            return this.bookings.filter((b) => b.assetId == assetId);
          }),
          catchError(() => of(this.bookings.filter((b) => b.assetId == assetId)))
        );
    }
    return of(this.bookings.filter((b) => b.assetId == assetId)).pipe(delay(150));
  }

  public updateBookingStatus(id: string | number, status: BookingStatus, reason?: string): Observable<Booking> {
    const isUuid = typeof id === 'string' && id.includes('-');
    if (isUuid) {
      let endpoint = `${environment.apiUrl}/bookings/${id}/status`;
      let reqBody: any = { status: status.toUpperCase(), reason };

      if (status === 'approved') {
        endpoint = `${environment.apiUrl}/bookings/${id}/approve`;
        reqBody = {};
      } else if (status === 'rejected') {
        endpoint = `${environment.apiUrl}/bookings/${id}/reject`;
        reqBody = { rejectionReason: reason || 'Booking rejected by leaser' };
      } else if (status === 'cancelled') {
        endpoint = `${environment.apiUrl}/bookings/${id}/cancel`;
        reqBody = { reason: reason || 'Booking cancelled by user' };
      }

      return this.http.patch<any>(endpoint, reqBody).pipe(
        map((res) => {
          if (res && res.success && res.data) {
            const mapped = mapBackendBookingToUiBooking(res.data);
            this.updateLocalBooking(mapped);
            return mapped;
          }
          return this.updateMockBookingStatus(id, status, reason);
        }),
        catchError(() => of(this.updateMockBookingStatus(id, status, reason)))
      );
    }

    return of(this.updateMockBookingStatus(id, status, reason)).pipe(delay(200));
  }

  // --- Mock Helpers ---
  private createMockBooking(payload: Omit<Booking, 'id' | 'createdAt' | 'status'>): Booking {
    const newBooking: Booking = {
      ...payload,
      id: Math.floor(Math.random() * 90000) + 10000,
      status: 'pending',
      createdAt: new Date().toISOString().split('T')[0],
    };

    this.bookings.unshift(newBooking);
    this.save();
    return newBooking;
  }

  private filterMockUserBookings(userId?: string | number): Booking[] {
    if (!userId) return [...this.bookings];
    return this.bookings.filter((b) => b.renterId == userId);
  }

  private filterMockLeaserBookings(leaserId?: string | number): Booking[] {
    if (!leaserId) return [...this.bookings];
    return this.bookings.filter(
      (b) => b.asset?.leaserId == leaserId || b.asset?.owner?.id == leaserId
    );
  }

  private updateMockBookingStatus(id: string | number, status: BookingStatus, reason?: string): Booking {
    const idx = this.bookings.findIndex((b) => b.id == id);
    if (idx !== -1) {
      this.bookings[idx] = {
        ...this.bookings[idx],
        status,
        rejectionReason: reason || this.bookings[idx].rejectionReason,
      };
      this.save();
      return this.bookings[idx];
    }
    return { ...this.bookings[0], status, rejectionReason: reason };
  }

  private updateLocalBooking(updated: Booking): void {
    const idx = this.bookings.findIndex((b) => b.id == updated.id);
    if (idx !== -1) {
      this.bookings[idx] = updated;
    } else {
      this.bookings.unshift(updated);
    }
    this.save();
  }
}
