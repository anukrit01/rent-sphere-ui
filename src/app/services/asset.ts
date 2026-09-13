import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay, map } from 'rxjs/operators';
import { Asset } from '../shared/models/asset.model';
import { MOCK_ASSETS } from '../shared/data/assets.data';

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
  private assets: Asset[] = [...MOCK_ASSETS];
  private favorites = new Set<number>();

  constructor() {
    try {
      const savedFavs = localStorage.getItem('rentsphere_favorites');
      if (savedFavs) {
        const parsed = JSON.parse(savedFavs) as number[];
        parsed.forEach((id) => this.favorites.add(id));
      }
    } catch {
      // ignore
    }
  }

  public getAssets(query?: AssetQueryParams): Observable<{ data: Asset[]; total: number }> {
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

    // Sorting
    switch (query?.sortBy) {
      case 'price_asc':
        filtered.sort((a, b) => a.pricePerDay - b.pricePerDay);
        break;
      case 'price_desc':
        filtered.sort((a, b) => b.pricePerDay - a.pricePerDay);
        break;
      case 'rating':
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case 'newest':
        filtered.sort((a, b) => (b.isNewArrival ? 1 : 0) - (a.isNewArrival ? 1 : 0));
        break;
      case 'recommended':
      default:
        filtered.sort((a, b) => (b.popular ? 1 : 0) - (a.popular ? 1 : 0));
        break;
    }

    const total = filtered.length;
    const page = query?.page || 1;
    const limit = query?.limit || 20;
    const start = (page - 1) * limit;
    const paginated = filtered.slice(start, start + limit);

    return of({ data: paginated, total }).pipe(delay(150));
  }

  public getPopularAssets(): Observable<Asset[]> {
    const popular = this.assets.filter((a) => a.popular || a.featured).slice(0, 6);
    return of(popular).pipe(delay(100));
  }

  public getNewArrivals(): Observable<Asset[]> {
    const news = this.assets.filter((a) => a.isNewArrival || a.id > 6).slice(0, 4);
    return of(news).pipe(delay(100));
  }

  public getAsset(id: number): Observable<Asset | undefined> {
    const found = this.assets.find((a) => a.id === Number(id));
    return of(found ? { ...found } : undefined).pipe(delay(150));
  }

  public createAsset(payload: Partial<Asset>): Observable<Asset> {
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
      status: 'pending', // Requires admin approval
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
        id: 201,
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
    return of(newAsset).pipe(delay(300));
  }

  public updateAsset(id: number, payload: Partial<Asset>): Observable<Asset> {
    const idx = this.assets.findIndex((a) => a.id === id);
    if (idx !== -1) {
      this.assets[idx] = { ...this.assets[idx], ...payload };
      return of(this.assets[idx]).pipe(delay(200));
    }
    throw new Error('Asset not found');
  }

  public getAllAssetsAdmin(): Observable<Asset[]> {
    return of([...this.assets]).pipe(delay(100));
  }

  public adminApprove(id: number): Observable<Asset> {
    return this.updateAsset(id, { status: 'approved', available: true, auditReason: undefined });
  }

  public adminReject(id: number, reason: string): Observable<Asset> {
    return this.updateAsset(id, { status: 'rejected', available: false, auditReason: reason });
  }

  public adminRequestChanges(id: number, notes: string): Observable<Asset> {
    return this.updateAsset(id, { status: 'changes_requested', available: false, adminNotes: notes });
  }

  // Favorite toggle
  public isFavorite(id: number): boolean {
    return this.favorites.has(id);
  }

  public toggleFavorite(id: number): boolean {
    if (this.favorites.has(id)) {
      this.favorites.delete(id);
    } else {
      this.favorites.add(id);
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
}
