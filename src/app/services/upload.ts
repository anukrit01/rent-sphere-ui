import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface UploadedImage {
  url: string;
  publicId: string;
  format?: string;
  bytes?: number;
}

export interface UploadApiResponse {
  success: boolean;
  data: UploadedImage[];
  message?: string;
}

@Injectable({ providedIn: 'root' })
export class UploadService {
  private http = inject(HttpClient);

  /**
   * Upload multiple images through the backend RentSphere API.
   * Uses POST /api/v1/assets/upload-images with multipart/form-data and field name 'images'.
   */
  uploadImages(files: File[]): Observable<UploadedImage[]> {
    if (!files || files.length === 0) {
      return throwError(() => new Error('No files provided for upload'));
    }

    if (files.length > 10) {
      return throwError(() => new Error('Maximum 10 images can be uploaded in a single batch'));
    }

    const formData = new FormData();
    files.forEach((file) => {
      formData.append('images', file);
    });

    return this.http
      .post<UploadApiResponse | UploadedImage[]>(
        `${environment.apiUrl}/assets/upload-images`,
        formData
      )
      .pipe(
        map((res: any) => {
          if (res && res.success && Array.isArray(res.data)) {
            return res.data as UploadedImage[];
          }
          if (Array.isArray(res)) {
            return res as UploadedImage[];
          }
          throw new Error(res?.message || 'Invalid upload response from server');
        })
      );
  }

  /**
   * Upload a single image through the backend RentSphere API.
   */
  uploadImage(file: File): Observable<UploadedImage> {
    return this.uploadImages([file]).pipe(map((images) => images[0]));
  }

  /**
   * Convenience helper returning just the image URL from a single upload.
   */
  uploadImageUrl(file: File): Observable<string> {
    return this.uploadImage(file).pipe(map((img) => img.url));
  }

  /**
   * Upload images attached directly to an existing asset.
   * Uses POST /api/v1/assets/:id/images with multipart/form-data and field name 'images'.
   */
  uploadAssetImages(assetId: string | number, files: File[]): Observable<UploadedImage[]> {
    if (!files || files.length === 0) {
      return throwError(() => new Error('No files provided for upload'));
    }

    const formData = new FormData();
    files.forEach((file) => {
      formData.append('images', file);
    });

    return this.http
      .post<UploadApiResponse | UploadedImage[]>(
        `${environment.apiUrl}/assets/${assetId}/images`,
        formData
      )
      .pipe(
        map((res: any) => {
          if (res && res.success && Array.isArray(res.data)) {
            return res.data as UploadedImage[];
          }
          if (Array.isArray(res)) {
            return res as UploadedImage[];
          }
          throw new Error(res?.message || 'Invalid upload response from server');
        })
      );
  }
}
