import { HttpErrorResponse, HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpEvent } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { NotificationService } from '../services/notification.service';

/**
 * Modern Angular Functional Error Interceptor.
 * Catches HTTP error responses, parses standardized backend error envelopes,
 * and surfaces user-friendly notifications via NotificationService.
 */
export const errorInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> => {
  const notificationService = inject(NotificationService);
  const router = inject(Router);

  return next(req).pipe(
    catchError((error: unknown) => {
      if (error instanceof HttpErrorResponse) {
        let errorMessage = 'An unexpected error occurred. Please try again.';

        // Extract standardized backend error envelope: { success: false, error: { message, code } }
        if (error.error && typeof error.error === 'object') {
          if (error.error.error && error.error.error.message) {
            errorMessage = error.error.error.message;
          } else if (error.error.message) {
            errorMessage = error.error.message;
          }
        } else if (typeof error.error === 'string') {
          errorMessage = error.error;
        }

        // Handle specific HTTP status codes
        switch (error.status) {
          case 401:
            // Avoid looping on auth check endpoints
            if (!req.url.includes('/auth/login') && !req.url.includes('/auth/register')) {
              notificationService.warning('Session expired or unauthorized. Please log in again.');
              router.navigate(['/auth/login']);
            }
            break;

          case 403:
            notificationService.error(errorMessage || 'You do not have permission to perform this action.');
            break;

          case 404:
            // 404s can be handled by components, but if not captured, notify
            break;

          case 409:
            // Conflict (e.g. double booking or duplicate email)
            notificationService.warning(errorMessage);
            break;

          case 500:
          case 502:
          case 503:
            notificationService.error(
              errorMessage || 'Server error. If this is a free-tier cold start, please retry in a moment.'
            );
            break;

          default:
            if (error.status === 0) {
              // Network error / CORS failure / Backend offline
              console.warn('[HTTP 0] Network connectivity error or backend unreachable:', req.url);
            }
            break;
        }
      }

      return throwError(() => error);
    })
  );
};
