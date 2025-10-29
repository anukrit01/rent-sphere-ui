import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Booking } from '../shared/models/booking.model';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class BookingService {
  base = `${environment.apiUrl}/bookings`;
  constructor(private http: HttpClient) {}

  createBooking(payload: Booking): Observable<Booking> {
    return this.http.post<Booking>(this.base, payload);
  }

  getBookingsForUser(userId: number): Observable<Booking[]> {
    return this.http.get<Booking[]>(`${this.base}/user/${userId}`);
  }

  getBookingsForAsset(assetId: number): Observable<Booking[]> {
    return this.http.get<Booking[]>(`${this.base}/asset/${assetId}`);
  }
}
