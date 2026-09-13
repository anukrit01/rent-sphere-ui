import { Routes } from '@angular/router';
import { AssetListComponent } from './features/assets/asset-list/asset-list';
import { AssetCatalogComponent } from './features/assets/asset-catalog/asset-catalog';
import { AssetDetail } from './features/assets/asset-detail/asset-detail';
import { AssetForm } from './features/assets/asset-form/asset-form';
import { Login } from './features/auth/login/login';
import { Register } from './features/auth/register/register';
import { RenterDashboard } from './features/dashboard/renter-dashboard/renter-dashboard';
import { LeaserDashboard } from './features/dashboard/leaser-dashboard/leaser-dashboard';
import { AdminDashboard } from './features/admin/admin-dashboard/admin-dashboard';
import { NotFoundComponent } from './features/not-found/not-found';
import { AuthGuard } from './guards/auth-guard';
import { RoleGuard } from './guards/role-guard';

export const routes: Routes = [
  { path: '', component: AssetListComponent },
  { path: 'assets', component: AssetCatalogComponent },
  { path: 'assets/:id', component: AssetDetail },
  { path: 'auth/login', component: Login },
  { path: 'auth/register', component: Register },
  {
    path: 'dashboard/renter',
    component: RenterDashboard,
    canActivate: [AuthGuard, RoleGuard],
    data: { role: 'renter' },
  },
  {
    path: 'dashboard/leaser',
    component: LeaserDashboard,
    canActivate: [AuthGuard, RoleGuard],
    data: { role: 'leaser' },
  },
  {
    path: 'dashboard/leaser/list-equipment',
    component: AssetForm,
    canActivate: [AuthGuard, RoleGuard],
    data: { role: 'leaser' },
  },
  {
    path: 'list-equipment',
    component: AssetForm,
    canActivate: [AuthGuard],
  },
  {
    path: 'admin',
    component: AdminDashboard,
    canActivate: [AuthGuard, RoleGuard],
    data: { role: 'admin' },
  },
  { path: '**', component: NotFoundComponent },
];
