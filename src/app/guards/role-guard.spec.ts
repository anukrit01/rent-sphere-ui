import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, Router } from '@angular/router';
import { RoleGuard } from './role-guard';
import { AuthService } from '../services/auth';

describe('RoleGuard', () => {
  let guard: RoleGuard;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(() => {
    authServiceSpy = jasmine.createSpyObj('AuthService', ['getUserRole']);
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        RoleGuard,
        { provide: AuthService, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy },
      ],
    });

    guard = TestBed.inject(RoleGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });

  it('should allow activation when user role matches expected role', () => {
    authServiceSpy.getUserRole.and.returnValue('renter');
    const route = { data: { role: 'renter' } } as unknown as ActivatedRouteSnapshot;

    expect(guard.canActivate(route)).toBeTrue();
  });

  it('should redirect to / and deny activation when user role does not match', () => {
    authServiceSpy.getUserRole.and.returnValue('renter');
    const route = { data: { role: 'admin' } } as unknown as ActivatedRouteSnapshot;

    expect(guard.canActivate(route)).toBeFalse();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/']);
  });
});

