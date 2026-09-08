import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MaterialModule } from '../../shared/material/material-module';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [CommonModule, RouterLink, MaterialModule],
  template: `
    <div class="rs-404-container">
      <div class="rs-404-content rs-animate-fade-in">
        <!-- Visual badge / illustration -->
        <div class="rs-404-badge">
          <div class="rs-404-badge__pulse"></div>
          <mat-icon class="rs-404-badge__icon">construction</mat-icon>
        </div>

        <div class="rs-404-code">404</div>
        <h1 class="rs-h1 rs-404-title">Equipment Site Not Found</h1>
        <p class="rs-body rs-404-message">
          The page or equipment listing you are looking for has been moved, decommissioned,
          or does not exist on the RentSphere platform.
        </p>

        <!-- Primary & Secondary actions -->
        <div class="rs-404-actions">
          <a routerLink="/assets" class="rs-btn rs-btn--primary rs-btn--lg">
            <mat-icon>precision_manufacturing</mat-icon>
            <span>Browse Available Fleet</span>
          </a>
          <a routerLink="/" class="rs-btn rs-btn--secondary rs-btn--lg">
            <mat-icon>home</mat-icon>
            <span>Return to Homepage</span>
          </a>
        </div>

        <!-- Quick helpful links -->
        <div class="rs-404-quick-links">
          <span class="rs-caption rs-text-muted">Popular Destinations:</span>
          <div class="rs-404-links-group">
            <a routerLink="/assets" [queryParams]="{category: 'Earthmoving'}" class="rs-404-link">
              Earthmoving
            </a>
            <span class="rs-divider-dot">&bull;</span>
            <a routerLink="/assets" [queryParams]="{category: 'Aerial & Lifting'}" class="rs-404-link">
              Aerial & Lifting
            </a>
            <span class="rs-divider-dot">&bull;</span>
            <a routerLink="/dashboard/leaser/list-equipment" class="rs-404-link">
              List Your Fleet
            </a>
            <span class="rs-divider-dot">&bull;</span>
            <a routerLink="/auth/login" class="rs-404-link">
              Sign In
            </a>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .rs-404-container {
      min-height: calc(100vh - 160px);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: var(--rs-space-12) var(--rs-space-6);
      background: radial-gradient(circle at 50% 30%, var(--rs-color-primary-50) 0%, var(--rs-bg-secondary) 70%);
    }

    .rs-404-content {
      max-width: 640px;
      width: 100%;
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      background-color: var(--rs-surface-default);
      border: 1px solid var(--rs-border-default);
      border-radius: var(--rs-radius-2xl);
      padding: var(--rs-space-12) var(--rs-space-8);
      box-shadow: var(--rs-shadow-xl);
    }

    .rs-404-badge {
      position: relative;
      width: 80px;
      height: 80px;
      border-radius: var(--rs-radius-full);
      background-color: var(--rs-color-accent-50);
      color: var(--rs-color-accent-600);
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: var(--rs-space-4);
      border: 2px solid var(--rs-color-accent-200);

      &__pulse {
        position: absolute;
        inset: -6px;
        border-radius: var(--rs-radius-full);
        border: 2px solid var(--rs-color-accent-300);
        opacity: 0.4;
        animation: rs-skeleton-pulse 2s infinite ease-in-out;
      }

      &__icon {
        font-size: 40px;
        width: 40px;
        height: 40px;
      }
    }

    .rs-404-code {
      font-size: clamp(4rem, 12vw, 6.5rem);
      font-weight: var(--rs-font-black, 900);
      line-height: 1;
      letter-spacing: -0.04em;
      background: linear-gradient(135deg, var(--rs-color-primary-900) 0%, var(--rs-color-accent-600) 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      margin-bottom: var(--rs-space-2);
    }

    .rs-404-title {
      font-size: var(--rs-font-2xl);
      color: var(--rs-color-primary-900);
      margin: 0 0 var(--rs-space-3) 0;
    }

    .rs-404-message {
      color: var(--rs-text-secondary);
      font-size: var(--rs-font-base);
      line-height: var(--rs-leading-relaxed);
      max-width: 480px;
      margin: 0 0 var(--rs-space-8) 0;
    }

    .rs-404-actions {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: var(--rs-space-4);
      flex-wrap: wrap;
      width: 100%;
      margin-bottom: var(--rs-space-8);
      padding-bottom: var(--rs-space-8);
      border-bottom: 1px solid var(--rs-border-subtle);
    }

    .rs-404-quick-links {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: var(--rs-space-2);
    }

    .rs-404-links-group {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      justify-content: center;
      gap: var(--rs-space-2);
    }

    .rs-404-link {
      font-size: var(--rs-font-sm);
      color: var(--rs-color-blue-600);
      text-decoration: none;
      font-weight: var(--rs-font-medium);
      transition: color var(--rs-duration-fast) var(--rs-ease-default);

      &:hover {
        color: var(--rs-color-accent-600);
        text-decoration: underline;
      }
    }

    .rs-divider-dot {
      color: var(--rs-border-strong);
      user-select: none;
    }
  `]
})
export class NotFoundComponent {}
