import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { UploadService, UploadedImage } from './upload';
import { environment } from '../../environments/environment';

describe('UploadService', () => {
  let service: UploadService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(UploadService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should construct FormData with field name "images" and post to RentSphere API', (done) => {
    const file1 = new File(['image-content-1'], 'cat1.jpg', { type: 'image/jpeg' });
    const file2 = new File(['image-content-2'], 'cat2.png', { type: 'image/png' });

    const mockResponse = {
      success: true,
      data: [
        {
          url: 'https://res.cloudinary.com/rentsphere/image/upload/v1/assets/cat1.jpg',
          publicId: 'assets/cat1',
          format: 'jpg',
          bytes: 1024,
        },
        {
          url: 'https://res.cloudinary.com/rentsphere/image/upload/v1/assets/cat2.png',
          publicId: 'assets/cat2',
          format: 'png',
          bytes: 2048,
        },
      ],
    };

    service.uploadImages([file1, file2]).subscribe({
      next: (results) => {
        expect(results.length).toBe(2);
        expect(results[0].url).toBe('https://res.cloudinary.com/rentsphere/image/upload/v1/assets/cat1.jpg');
        expect(results[0].publicId).toBe('assets/cat1');
        expect(results[1].url).toBe('https://res.cloudinary.com/rentsphere/image/upload/v1/assets/cat2.png');
        done();
      },
      error: () => {
        fail('Expected successful upload');
        done();
      },
    });

    // Verify request goes to RentSphere API, NOT api.cloudinary.com
    const req = httpMock.expectOne(`${environment.apiUrl}/assets/upload-images`);
    expect(req.request.method).toBe('POST');
    expect(req.request.url).not.toContain('api.cloudinary.com');

    // Verify body is FormData
    expect(req.request.body instanceof FormData).toBeTrue();
    const formData = req.request.body as FormData;

    // Verify field name is 'images'
    const files = formData.getAll('images');
    expect(files.length).toBe(2);

    // Verify NO upload_preset or Cloudinary config is present in FormData
    expect(formData.has('upload_preset')).toBeFalse();
    expect(formData.has('file')).toBeFalse();

    req.flush(mockResponse);
  });

  it('should propagate API upload error and not convert to fake successful data URL', (done) => {
    const file = new File(['bad-content'], 'bad.exe', { type: 'application/x-msdownload' });

    service.uploadImages([file]).subscribe({
      next: () => {
        fail('Expected upload to fail');
        done();
      },
      error: (err) => {
        expect(err).toBeTruthy();
        expect(err.status).toBe(400);
        done();
      },
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/assets/upload-images`);
    req.flush(
      { success: false, message: 'Invalid file format. Only JPEG, PNG, and WebP images are permitted.' },
      { status: 400, statusText: 'Bad Request' }
    );
  });

  it('should reject when empty files array is passed', (done) => {
    service.uploadImages([]).subscribe({
      next: () => {
        fail('Expected error on empty files');
        done();
      },
      error: (err) => {
        expect(err.message).toBe('No files provided for upload');
        done();
      },
    });

    httpMock.expectNone(`${environment.apiUrl}/assets/upload-images`);
  });

  it('should reject when more than 10 files are passed', (done) => {
    const files = Array.from({ length: 11 }, (_, i) => new File(['data'], `img${i}.jpg`, { type: 'image/jpeg' }));

    service.uploadImages(files).subscribe({
      next: () => {
        fail('Expected error on > 10 files');
        done();
      },
      error: (err) => {
        expect(err.message).toBe('Maximum 10 images can be uploaded in a single batch');
        done();
      },
    });

    httpMock.expectNone(`${environment.apiUrl}/assets/upload-images`);
  });

  it('should support uploadImage for a single file', (done) => {
    const file = new File(['single-file'], 'single.jpg', { type: 'image/jpeg' });
    const mockResponse = {
      success: true,
      data: [
        {
          url: 'https://res.cloudinary.com/rentsphere/image/upload/v1/assets/single.jpg',
          publicId: 'assets/single',
        },
      ],
    };

    service.uploadImage(file).subscribe({
      next: (result: UploadedImage) => {
        expect(result.url).toBe('https://res.cloudinary.com/rentsphere/image/upload/v1/assets/single.jpg');
        expect(result.publicId).toBe('assets/single');
        done();
      },
      error: () => {
        fail('Expected successful upload');
        done();
      },
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/assets/upload-images`);
    expect(req.request.method).toBe('POST');
    req.flush(mockResponse);
  });

  it('should support uploadImageUrl convenience helper returning just URL string', (done) => {
    const file = new File(['single-file'], 'url-only.jpg', { type: 'image/jpeg' });
    const mockResponse = {
      success: true,
      data: [
        {
          url: 'https://res.cloudinary.com/rentsphere/image/upload/v1/assets/url-only.jpg',
          publicId: 'assets/url-only',
        },
      ],
    };

    service.uploadImageUrl(file).subscribe({
      next: (url: string) => {
        expect(url).toBe('https://res.cloudinary.com/rentsphere/image/upload/v1/assets/url-only.jpg');
        done();
      },
      error: () => {
        fail('Expected successful upload');
        done();
      },
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/assets/upload-images`);
    req.flush(mockResponse);
  });
});
