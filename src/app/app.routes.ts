import { Routes } from '@angular/router';
import { AssetList } from './features/assets/asset-list/asset-list';
import { Login } from './features/auth/login/login';
import { Register } from './features/auth/register/register';
import { AssetDetail } from './features/assets/asset-detail/asset-detail';
import { RenterDashboard } from './features/dashboard/renter-dashboard/renter-dashboard';
import { authGuard } from './guards/auth-guard';
import { roleGuard } from './guards/role-guard';
import { LeaserDashboard } from './features/dashboard/leaser-dashboard/leaser-dashboard';
import { AdminDashboard } from './features/admin/admin-dashboard/admin-dashboard';

export const routes: Routes = [
    {path: '', component: AssetList},
    {path: 'auth/login', component: Login},
    {path: 'auth/register', component: Register},
    {path: 'assets/:id', component: AssetDetail},
    {path: 'dashboard/renter', component: RenterDashboard, canActivate:[authGuard, roleGuard], data: {role: 'renter'}},
    {path: 'dashboard/leaser', component: LeaserDashboard, canActivate:[authGuard, roleGuard], data: {role: 'leaser'}},
    {path: 'admin', component: AdminDashboard, canActivate:[authGuard, roleGuard], data: {role: 'admin'}},
    {path: '**', redirectTo:''}
];
