import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router } from '@angular/router';
import { AuthService } from '../services/auth';

@Injectable({ providedIn: 'root' })
export class RoleGuard implements CanActivate {
  constructor(private auth: AuthService, private router: Router) {}
  canActivate(route: ActivatedRouteSnapshot): boolean {
    const expected = route.data['role'] as string;
    const role = this.auth.getUserRole();
    if (role === expected) return true;
    // unauthorized
    this.router.navigate(['/']);
    return false;
  }
}
