import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';
import { Asset } from '../shared/models/asset.model';

@Injectable({ providedIn: 'root' })
export class AssetService {
  base = `${environment.apiUrl}/assets`;
  constructor(private http: HttpClient) {}

  getAssets(query?: { category?: string; q?: string; page?: number; limit?: number }): Observable<{data: Asset[], total: number}> {
    let params = new HttpParams();
    if (query?.category) params = params.set('category', query.category);
    if (query?.q) params = params.set('q', query.q);
    if (query?.page) params = params.set('page', String(query.page));
    if (query?.limit) params = params.set('limit', String(query.limit));
    return this.http.get<{data: Asset[], total: number}>(this.base, { params });
  }

  getAsset(id: number): Observable<Asset> {
    return this.http.get<Asset>(`${this.base}/${id}`);
  }

  createAsset(payload: Partial<Asset>): Observable<Asset> {
    return this.http.post<Asset>(this.base, payload);
  }

  updateAsset(id: number, payload: Partial<Asset>): Observable<Asset> {
    return this.http.put<Asset>(`${this.base}/${id}`, payload);
  }

  adminApprove(id: number): Observable<any> {
    return this.http.post(`${this.base}/${id}/approve`, {});
  }
}
