import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable, from } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class UploadService {
  constructor(private http: HttpClient) {}

  uploadImage(file: File): Observable<string> {
    const url = `https://api.cloudinary.com/v1_1/${environment.cloudinaryName}/upload`;
    const fd = new FormData();
    fd.append('file', file);
    fd.append('upload_preset', environment.cloudinaryUploadPreset);

    return this.http.post<any>(url, fd).pipe(
      map((res) => (res.secure_url || res.url) as string),
      catchError(() => this.readFileAsDataUrl(file))
    );
  }

  private readFileAsDataUrl(file: File): Observable<string> {
    return from(
      new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () =>
          resolve('https://images.unsplash.com/photo-1579829366248-204fe8413f31?auto=format&fit=crop&w=1200&q=80');
        reader.readAsDataURL(file);
      })
    );
  }
}
