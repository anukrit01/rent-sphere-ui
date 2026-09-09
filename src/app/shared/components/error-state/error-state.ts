import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../../material/material-module';

@Component({
  selector: 'app-error-state',
  standalone: true,
  imports: [CommonModule, MaterialModule],
  template: `
    <div class="rs-error-state rs-card rs-animate-fade-in" role="alert">
      <div class="rs-error-state__icon-box">
        <mat-icon aria-hidden="true">{{ icon }}</mat-icon>
      </div>
      <h3 class="rs-h3 rs-error-state__title">{{ title }}</h3>
      <p class="rs-body rs-error-state__desc">{{ message }}</p>

      @if (showRetry) {
        <div class="rs-error-state__actions">
          <button type="button" class="rs-btn rs-btn--secondary rs-btn--error" (click)="retryClick.emit()">
            <mat-icon aria-hidden="true">refresh</mat-icon>
            <span>{{ retryLabel }}</span>
          </button>
        </div>
      }
    </div>
  `,
  styles: [`
    .rs-error-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      padding: var(--rs-space-10) var(--rs-space-6);
      background-color: var(--rs-color-error-50);
      border: 1px solid var(--rs-color-error-100);
      border-radius: var(--rs-radius-xl);
      max-width: 580px;
      margin: var(--rs-space-6) auto;

      &__icon-box {
        width: 60px;
        height: 60px;
        border-radius: var(--rs-radius-full);
        background-color: var(--rs-color-white);
        color: var(--rs-color-error-500);
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: var(--rs-space-4);
        box-shadow: var(--rs-shadow-sm);
        border: 1px solid var(--rs-color-error-100);

        mat-icon {
          font-size: 32px;
          width: 32px;
          height: 32px;
        }
      }

      &__title {
        color: var(--rs-color-error-700);
        margin: 0 0 var(--rs-space-2) 0;
        font-weight: var(--rs-font-semibold);
      }

      &__desc {
        color: var(--rs-text-secondary);
        max-width: 440px;
        margin: 0 0 var(--rs-space-5) 0;
        line-height: var(--rs-leading-relaxed);
      }

      &__actions {
        display: flex;
        align-items: center;
        gap: var(--rs-space-3);
      }

      .rs-btn--error {
        border-color: var(--rs-color-error-500);
        color: var(--rs-color-error-600);
        background-color: var(--rs-color-white);

        &:hover {
          background-color: var(--rs-color-error-50);
          color: var(--rs-color-error-700);
        }
      }
    }
  `],
})
export class ErrorStateComponent {
  @Input() icon: string = 'error_outline';
  @Input() title: string = 'Something went wrong';
  @Input() message: string = 'We encountered an error while loading this data. Please try again.';
  @Input() retryLabel: string = 'Try Again';
  @Input() showRetry: boolean = true;

  @Output() retryClick = new EventEmitter<void>();
}
