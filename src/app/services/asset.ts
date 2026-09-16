import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { delay, map, catchError } from 'rxjs/operators';
import { Asset } from '../shared/models/asset.model';
import { MOCK_ASSETS } from '../shared/data/assets.data';
import { environment } from '../../environments/environment';
import { mapBackendAssetToUiAsset } from '../shared/adapters/api-adapters';

export interface AssetQueryParams {
  q?: string;
  category?: string;
  location?: string;
  minPrice?: number;
  maxPrice?: number;
  availableOnly?: boolean;
  condition?: string;
  sortBy?: 'recommended' | 'price_asc' | 'price_desc' | 'rating' | 'newest';
  page?: number;
  limit?: number;
}

@Injectable({ providedIn: 'root' })
export class AssetService {
  private http = inject(HttpClient);

  private assets: Asset[] = [...MOCK_ASSETS];
  private favorites = new Set<string | number>();

  constructor() {
    try {
      const savedFavs = localStorage.getItem('rentsphere_favorites');
      if (savedFavs) {
        const parsed = JSON.parse(savedFavs) as Array<string | number>;
        parsed.forEach((id) => this.favorites.add(id));
      }
    } catch {
      // ignore
    }
  }

  public getAssets(query?: AssetQueryParams): Observable<{ data: Asset[]; total: number }> {
    let params = new HttpParams();

    if (query?.q) params = params.set('search', query.q);
    if (query?.category && query.category !== 'All') params = params.set('category', query.category);
    if (query?.location && query.location !== 'All Locations') params = params.set('city', query.location);
    if (query?.minPrice !== undefined) params = params.set('minPrice', query.minPrice.toString());
    if (query?.maxPrice !== undefined) params = params.set('maxPrice', query.maxPrice.toString());
    if (query?.page) params = params.set('page', query.page.toString());
    if (query?.limit) params = params.set('limit', query.limit.toString());
    if (query?.sortBy) params = params.set('sortBy', query.sortBy);

    return this.http
      .get<any>(`${environment.apiUrl}/assets`, { params })
      .pipe(
        map((res) => {
          if (res && res.success && Array.isArray(res.data)) {
            const mapped = res.data.map((item: any) => mapBackendAssetToUiAsset(item));
            return {
              data: mapped,
              total: res.pagination?.total ?? mapped.length,
            };
          }
          return this.getMockFilteredAssets(query);
        }),
        catchError(() => of(this.getMockFilteredAssets(query)))
      );
  }

  public getPopularAssets(): Observable<Asset[]> {
    return this.http
      .get<any>(`${environment.apiUrl}/assets`, {
        params: new HttpParams().set('limit', '6'),
      })
      .pipe(
        map((res) => {
          if (res && res.success && Array.isArray(res.data) && res.data.length > 0) {
            return res.data.map((item: any) => mapBackendAssetToUiAsset(item));
          }
          return this.assets.filter((a) => a.popular || a.featured).slice(0, 6);
        }),
        catchError(() => of(this.assets.filter((a) => a.popular || a.featured).slice(0, 6)))
      );
  }

  public getNewArrivals(): Observable<Asset[]> {
    return this.http
      .get<any>(`${environment.apiUrl}/assets`, {
        params: new HttpParams().set('limit', '4'),
      })
      .pipe(
        map((res) => {
          if (res && res.success && Array.isArray(res.data) && res.data.length > 0) {
            return res.data.map((item: any) => mapBackendAssetToUiAsset(item));
          }
          return this.assets.filter((a) => a.isNewArrival || Number(a.id) > 6).slice(0, 4);
        }),
        catchError(() => of(this.assets.filter((a) => a.isNewArrival || Number(a.id) > 6).slice(0, 4)))
      );
  }

  public getAsset(id: string | number): Observable<Asset | undefined> {
    return this.http
      .get<any>(`${environment.apiUrl}/assets/${id}`)
      .pipe(
        map((res) => {
          if (res && res.success && res.data) {
            return mapBackendAssetToUiAsset(res.data);
          }
          const found = this.assets.find((a) => a.id == id);
          return found ? { ...found } : undefined;
        }),
        catchError(() => {
          const found = this.assets.find((a) => a.id == id);
          return of(found ? { ...found } : undefined);
        })
      );
  }

  public createAsset(payload: Partial<Asset>): Observable<Asset> {
    const backendDto = {
      title: payload.title || 'Heavy Machinery Asset',
      description: payload.description || 'Equipment ready for rental lease.',
      dailyRate: Number(payload.pricePerDay || 5000),
      weeklyRate: Number(payload.pricePerWeek || (Number(payload.pricePerDay || 5000) * 6)),
      securityDeposit: Number(payload.securityDeposit || 20000),
      location: payload.location || 'Industrial Area',
      city: payload.city || 'Bhopal',
      state: payload.state || 'Madhya Pradesh',
      pinCode: payload.pinCode || '462001',
      categoryId: (payload as any).categoryId || 'cat_excavators',
      condition: (payload.condition || 'Good').toUpperCase().includes('EXCELLENT') ? 'EXCELLENT' : 'GOOD',
      specification: {
        brand: payload.specifications?.brand || 'Standard',
        model: payload.specifications?.model || 'Industrial',
        year: payload.specifications?.year || 2024,
        fuelType: (payload.specifications?.fuelType || 'Diesel').toUpperCase(),
      },
    };

    return this.http
      .post<any>(`${environment.apiUrl}/assets`, backendDto)
      .pipe(
        map((res) => {
          if (res && res.success && res.data) {
            const created = mapBackendAssetToUiAsset(res.data);
            this.assets.unshift(created);
            return created;
          }
          return this.createMockAsset(payload);
        }),
        catchError(() => of(this.createMockAsset(payload)))
      );
  }

  public updateAsset(id: string | number, payload: Partial<Asset>): Observable<Asset> {
    return this.http
      .put<any>(`${environment.apiUrl}/assets/${id}`, payload)
      .pipe(
        map((res) => {
          if (res && res.success && res.data) {
            return mapBackendAssetToUiAsset(res.data);
          }
          return this.updateMockAsset(id, payload);
        }),
        catchError(() => of(this.updateMockAsset(id, payload)))
      );
  }

  public getAllAssetsAdmin(): Observable<Asset[]> {
    return this.http
      .get<any>(`${environment.apiUrl}/admin/assets/pending`)
      .pipe(
        map((res) => {
          if (res && res.success && Array.isArray(res.data)) {
            return res.data.map((item: any) => mapBackendAssetToUiAsset(item));
          }
          return [...this.assets];
        }),
        catchError(() => of([...this.assets]))
      );
  }

  public adminApprove(id: string | number): Observable<Asset> {
    return this.http
      .patch<any>(`${environment.apiUrl}/admin/assets/${id}/approve`, {})
      .pipe(
        map((res) => {
          if (res && res.success && res.data) {
            return mapBackendAssetToUiAsset(res.data);
          }
          return this.updateMockAsset(id, { status: 'available', available: true });
        }),
        catchError(() => of(this.updateMockAsset(id, { status: 'available', available: true })))
      );
  }

  public adminReject(id: string | number, reason: string): Observable<Asset> {
    return this.http
      .patch<any>(`${environment.apiUrl}/admin/assets/${id}/reject`, { reason })
      .pipe(
        map((res) => {
          if (res && res.success && res.data) {
            return mapBackendAssetToUiAsset(res.data);
          }
          return this.updateMockAsset(id, { status: 'rejected', available: false, auditReason: reason });
        }),
        catchError(() => of(this.updateMockAsset(id, { status: 'rejected', available: false, auditReason: reason })))
      );
  }

  public adminRequestChanges(id: string | number, notes: string): Observable<Asset> {
    return of(this.updateMockAsset(id, { status: 'changes_requested', available: false, adminNotes: notes }));
  }

  // Favorite toggle with API persistence
  public isFavorite(id: string | number): boolean {
    return this.favorites.has(id);
  }

  public toggleFavorite(id: string | number): boolean {
    const isFav = this.favorites.has(id);
    if (isFav) {
      this.favorites.delete(id);
      this.http.delete(`${environment.apiUrl}/assets/${id}/favorite`).subscribe({ error: () => {} });
    } else {
      this.favorites.add(id);
      this.http.post(`${environment.apiUrl}/assets/${id}/favorite`, {}).subscribe({ error: () => {} });
    }
    try {
      localStorage.setItem('rentsphere_favorites', JSON.stringify(Array.from(this.favorites)));
    } catch {
      // ignore
    }
    return this.favorites.has(id);
  }

  public getFavoritesCount(): number {
    return this.favorites.size;
  }

  // --- Mock Fallback Helpers ---
  private getMockFilteredAssets(query?: AssetQueryParams): { data: Asset[]; total: number } {
    let filtered = [...this.assets];

    if (query?.q) {
      const q = query.q.toLowerCase().trim();
      filtered = filtered.filter(
        (a) =>
          a.title.toLowerCase().includes(q) ||
          (a.name && a.name.toLowerCase().includes(q)) ||
          a.category.toLowerCase().includes(q) ||
          a.location.toLowerCase().includes(q) ||
          a.specifications.brand.toLowerCase().includes(q) ||
          a.specifications.model.toLowerCase().includes(q)
      );
    }

    if (query?.category && query.category !== 'All') {
      const cat = query.category.toLowerCase().trim();
      filtered = filtered.filter(
        (a) =>
          a.category.toLowerCase().includes(cat) ||
          (a.categorySlug && a.categorySlug.toLowerCase().includes(cat))
      );
    }

    if (query?.location && query.location !== 'All Locations') {
      const loc = query.location.toLowerCase().trim();
      filtered = filtered.filter(
        (a) => a.location.toLowerCase().includes(loc) || a.city.toLowerCase().includes(loc)
      );
    }

    if (query?.minPrice !== undefined) {
      filtered = filtered.filter((a) => a.pricePerDay >= query.minPrice!);
    }

    if (query?.maxPrice !== undefined) {
      filtered = filtered.filter((a) => a.pricePerDay <= query.maxPrice!);
    }

    if (query?.availableOnly) {
      filtered = filtered.filter((a) => a.available);
    }

    if (query?.condition) {
      filtered = filtered.filter((a) => a.condition.includes(query.condition!));
    }

    const total = filtered.length;
    const page = query?.page || 1;
    const limit = query?.limit || 20;
    const start = (page - 1) * limit;
    const paginated = filtered.slice(start, start + limit);

    return { data: paginated, total };
  }

  private createMockAsset(payload: Partial<Asset>): Asset {
    const newAsset: Asset = {
      id: Math.floor(Math.random() * 9000) + 1000,
      title: payload.title || 'New Equipment Listing',
      name: payload.title || 'New Equipment',
      category: payload.category || 'Excavators',
      categorySlug: (payload.category || 'excavators').toLowerCase().replace(/\s+/g, '-'),
      description: payload.description || '',
      images: payload.images && payload.images.length > 0 ? payload.images : [
        'https://images.unsplash.com/photo-1579829366248-204fe8413f31?auto=format&fit=crop&w=1200&q=80',
      ],
      coverImage: payload.coverImage || (payload.images && payload.images[0]) || 'https://images.unsplash.com/photo-1579829366248-204fe8413f31?auto=format&fit=crop&w=1200&q=80',
      pricePerDay: Number(payload.pricePerDay) || 5000,
      pricePerWeek: Number(payload.pricePerDay || 5000) * 6,
      securityDeposit: Number(payload.securityDeposit) || 20000,
      location: payload.location || 'Bhopal, Madhya Pradesh',
      city: payload.city || 'Bhopal',
      state: payload.state || 'Madhya Pradesh',
      rating: 5.0,
      reviewCount: 0,
      available: true,
      status: 'pending',
      condition: payload.condition || 'Good (Fully Serviced)',
      specifications: payload.specifications || {
        brand: 'Standard',
        model: 'Standard Model',
        year: 2024,
        fuelType: 'Diesel',
      },
      features: payload.features || ['Standard factory equipment', 'Inspected and certified'],
      rentalTerms: payload.rentalTerms || ['Minimum 2 days', 'Daily 8h shift standard'],
      owner: payload.owner || {
        id: '201',
        name: 'Vikram Patel',
        companyName: 'Shree Krishna Heavy Earthmovers',
        verified: true,
        rating: 4.8,
        reviewCount: 42,
        completedRentals: 42,
        responseTime: 'Within 1 hour',
        memberSince: '2023',
        location: 'Bhopal, MP',
      },
      createdAt: new Date().toISOString().split('T')[0],
      isNewArrival: true,
    };

    this.assets.unshift(newAsset);
    return newAsset;
  }

  private updateMockAsset(id: string | number, payload: Partial<Asset>): Asset {
    const idx = this.assets.findIndex((a) => a.id == id);
    if (idx !== -1) {
      this.assets[idx] = { ...this.assets[idx], ...payload };
      return this.assets[idx];
    }
    return { ...this.assets[0], ...payload };
  }
}
