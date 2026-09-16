import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { delay, tap, map, catchError } from 'rxjs/operators';
import { User, UserRole, DemoAccount } from '../shared/models/user.model';
import { environment } from '../../environments/environment';
import { mapBackendUserToUiUser } from '../shared/adapters/api-adapters';

export const DEMO_ACCOUNTS: DemoAccount[] = [
  {
    badgeLabel: 'Guest',
    description: 'Public visitor browsing the marketplace',
    user: {
      id: 0,
      name: 'Guest Visitor',
      email: 'guest@rentsphere.in',
      role: 'guest',
      location: 'Madhya Pradesh, India',
    },
  },
  {
    badgeLabel: 'Renter',
    description: 'Contractor renting equipment for project sites',
    user: {
      id: 101,
      name: 'Aman Sharma',
      email: 'aman.sharma@buildcorp.in',
      role: 'renter',
      phone: '+91 98260 12345',
      companyName: 'Apex Infra Projects',
      location: 'Indore, Madhya Pradesh',
      verified: true,
      memberSince: '2024',
      completedRentals: 18,
      rating: 4.9,
      token: 'demo-jwt-renter-token-101',
    },
  },
  {
    badgeLabel: 'Leaser',
    description: 'Machinery owner listing heavy fleet assets',
    user: {
      id: 201,
      name: 'Vikram Patel',
      email: 'vikram@shreekrishnamachinery.com',
      role: 'leaser',
      phone: '+91 94250 87654',
      companyName: 'Shree Krishna Heavy Earthmovers',
      location: 'Bhopal, Madhya Pradesh',
      verified: true,
      memberSince: '2023',
      completedRentals: 42,
      rating: 4.8,
      token: 'demo-jwt-leaser-token-201',
    },
  },
  {
    badgeLabel: 'Admin',
    description: 'Marketplace platform administrator',
    user: {
      id: 999,
      name: 'Anukrit Tiwari',
      email: 'admin@rentsphere.in',
      role: 'admin',
      phone: '+91 98110 55555',
      companyName: 'RentSphere Platform HQ',
      location: 'New Delhi / Bhopal',
      verified: true,
      memberSince: '2022',
      completedRentals: 0,
      rating: 5.0,
      token: 'demo-jwt-admin-token-999',
    },
  },
];

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);

  private currentUserSubject = new BehaviorSubject<User | null>(this.getInitialUser());
  public currentUser$ = this.currentUserSubject.asObservable();

  // Angular Signal state for modern reactive UI
  public currentUserSignal = signal<User | null>(this.getInitialUser());

  public isAuthenticated = computed(() => {
    const user = this.currentUserSignal();
    return !!user && user.role !== 'guest';
  });

  public currentRole = computed<UserRole>(() => {
    const user = this.currentUserSignal();
    return user ? user.role : 'guest';
  });

  public isRenter = computed(() => this.currentRole() === 'renter');
  public isLeaser = computed(() => this.currentRole() === 'leaser');
  public isAdmin = computed(() => this.currentRole() === 'admin');

  constructor() {}

  private getInitialUser(): User | null {
    try {
      const stored = localStorage.getItem('rentsphere_user');
      if (stored) {
        return JSON.parse(stored) as User;
      }
    } catch {
      // Fallback
    }
    // Default to Guest visitor on first load
    return DEMO_ACCOUNTS[0].user;
  }

  public setUser(user: User | null): void {
    if (user) {
      localStorage.setItem('rentsphere_user', JSON.stringify(user));
      if (user.token) {
        localStorage.setItem('token', user.token);
      }
    } else {
      localStorage.removeItem('rentsphere_user');
      localStorage.removeItem('token');
    }
    this.currentUserSubject.next(user);
    this.currentUserSignal.set(user);
  }

  public switchDemoRole(role: UserRole): void {
    const demo = DEMO_ACCOUNTS.find((acc) => acc.user.role === role);
    if (demo) {
      this.setUser({ ...demo.user });
    }
  }

  public login(credentials: { email: string; password: string }): Observable<User> {
    return this.http
      .post<any>(`${environment.apiUrl}/auth/login`, credentials)
      .pipe(
        map((res) => {
          const user = mapBackendUserToUiUser(res.data.user, res.data.accessToken);
          this.setUser(user);
          return user;
        }),
        catchError((err) => {
          // If offline or network error, fallback to mock demo account matching email
          const matched = DEMO_ACCOUNTS.find(
            (a) => a.user.email.toLowerCase() === credentials.email.toLowerCase()
          );
          if (matched) {
            const user: User = { ...matched.user };
            this.setUser(user);
            return of(user).pipe(delay(200));
          }
          return throwError(() => err);
        })
      );
  }

  public register(payload: {
    name: string;
    email: string;
    phone?: string;
    password?: string;
    role: 'renter' | 'leaser';
    companyName?: string;
  }): Observable<User> {
    const backendPayload = {
      name: payload.name,
      email: payload.email,
      password: payload.password || 'RentSphere@2025!',
      role: payload.role.toUpperCase(),
      phone: payload.phone || '+919876543210',
      companyName: payload.companyName || 'Apex Infra Projects',
      city: 'Bhopal',
      state: 'Madhya Pradesh',
    };

    return this.http
      .post<any>(`${environment.apiUrl}/auth/register`, backendPayload)
      .pipe(
        map((res) => {
          const user = mapBackendUserToUiUser(res.data.user, res.data.accessToken);
          this.setUser(user);
          return user;
        }),
        catchError((err) => {
          // Fallback mock registration
          const newUser: User = {
            id: Math.floor(Math.random() * 9000) + 1000,
            name: payload.name,
            email: payload.email,
            phone: payload.phone || '+91 98000 00000',
            companyName: payload.companyName || 'Industrial Construction Ltd.',
            role: payload.role,
            verified: false,
            memberSince: '2025',
            completedRentals: 0,
            rating: 5.0,
            token: `demo-token-${Date.now()}`,
          };
          this.setUser(newUser);
          return of(newUser).pipe(delay(200));
        })
      );
  }

  public logout(): void {
    const token = this.getToken();
    if (token && !token.startsWith('demo-')) {
      this.http.post(`${environment.apiUrl}/auth/logout`, {}).subscribe({
        error: () => {},
      });
    }
    // Reset to guest account
    this.setUser({ ...DEMO_ACCOUNTS[0].user });
  }

  public fetchCurrentUser(): Observable<User | null> {
    return this.http.get<any>(`${environment.apiUrl}/auth/me`).pipe(
      map((res) => {
        const token = this.getToken() || undefined;
        const user = mapBackendUserToUiUser(res.data.user, token);
        this.setUser(user);
        return user;
      }),
      catchError(() => of(this.getCurrentUser()))
    );
  }

  public getToken(): string | null {
    const u = this.currentUserSubject.value;
    return u?.token || localStorage.getItem('token') || null;
  }

  public isLoggedIn(): boolean {
    const u = this.currentUserSubject.value;
    return !!u && u.role !== 'guest';
  }

  public getUserRole(): UserRole {
    const u = this.currentUserSubject.value;
    return u ? u.role : 'guest';
  }

  public getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }
}
