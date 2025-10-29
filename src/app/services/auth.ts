import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { User } from '../shared/models/user.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private userSub = new BehaviorSubject<User | null>(this.getStoredUser());
  user$ = this.userSub.asObservable();

  constructor(private http: HttpClient) {}

  private getStoredUser(): User | null {
    const raw = localStorage.getItem('user');
    return raw ? JSON.parse(raw) as User : null;
  }

  private storeUser(user: User) {
    localStorage.setItem('user', JSON.stringify(user));
    if (user?.token) localStorage.setItem('token', user.token);
    this.userSub.next(user);
  }

  register(payload: { name: string; email: string; password: string; role: string }): Observable<any> {
    return this.http.post(`${environment.apiUrl}/auth/register`, payload);
  }

  login(credentials: { email: string; password: string }): Observable<User> {
    return this.http.post<User>(`${environment.apiUrl}/auth/login`, credentials)
      .pipe(tap(user => this.storeUser(user)));
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.userSub.next(null);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  getUserRole(): string | null {
    const u = this.getStoredUser();
    return u ? u.role : null;
  }
}
