import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class UploadService {
  constructor(private http: HttpClient) {}

  uploadImage(file: File): Observable<string> {
    const url = `https://api.cloudinary.com/v1_1/${environment.cloudinaryName}/upload`;
    const fd = new FormData();
    fd.append('file', file);
    fd.append('upload_preset', environment.cloudinaryUploadPreset);
    return this.http.post<any>(url, fd).pipe(map(res => res.secure_url as string));
  }
}
