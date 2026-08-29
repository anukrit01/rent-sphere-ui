import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MaterialModule } from '../../material/material-module';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [CommonModule, RouterLink, MaterialModule],
  template: `
    <div class="rs-empty-state rs-card rs-animate-fade-in">
      <div class="rs-empty-state__icon-box">
        <mat-icon>{{ icon }}</mat-icon>
      </div>
      <h3 class="rs-h3 rs-empty-state__title">{{ title }}</h3>
      <p class="rs-body rs-empty-state__desc">{{ message }}</p>

      <div class="rs-empty-state__actions">
        @if (actionLabel) {
          @if (actionRoute) {
            <a [routerLink]="actionRoute" class="rs-btn rs-btn--primary">
              @if (actionIcon) {
                <mat-icon>{{ actionIcon }}</mat-icon>
              }
              <span>{{ actionLabel }}</span>
            </a>
          } @else {
            <button type="button" class="rs-btn rs-btn--primary" (click)="actionClick.emit()">
              @if (actionIcon) {
                <mat-icon>{{ actionIcon }}</mat-icon>
              }
              <span>{{ actionLabel }}</span>
            </button>
          }
        }
        @if (secondaryActionLabel) {
          <button type="button" class="rs-btn rs-btn--secondary" (click)="secondaryActionClick.emit()">
            <span>{{ secondaryActionLabel }}</span>
          </button>
        }
      </div>
    </div>
  `,
  styles: [`
    .rs-empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      padding: var(--rs-space-12) var(--rs-space-6);
      background-color: var(--rs-surface-default);
      border: 1px dashed var(--rs-border-strong);
      border-radius: var(--rs-radius-xl);
      max-width: 600px;
      margin: var(--rs-space-6) auto;

      &__icon-box {
        width: 64px;
        height: 64px;
        border-radius: var(--rs-radius-full);
        background-color: var(--rs-color-primary-50);
        color: var(--rs-color-primary-500);
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: var(--rs-space-4);

        mat-icon {
          font-size: 32px;
          width: 32px;
          height: 32px;
        }
      }

      &__title {
        color: var(--rs-color-primary-900);
        margin: 0 0 var(--rs-space-2) 0;
      }

      &__desc {
        color: var(--rs-text-secondary);
        max-width: 440px;
        margin: 0 0 var(--rs-space-6) 0;
        line-height: var(--rs-leading-relaxed);
      }

      &__actions {
        display: flex;
        align-items: center;
        gap: var(--rs-space-3);
        flex-wrap: wrap;
        justify-content: center;
      }
    }
  `],
})
export class EmptyStateComponent {
  @Input() icon: string = 'search_off';
  @Input() title: string = 'No equipment found';
  @Input() message: string = 'Try adjusting your filters, location, or search terms to find available machinery.';
  @Input() actionLabel?: string = 'Clear All Filters';
  @Input() actionIcon?: string = 'refresh';
  @Input() actionRoute?: string;
  @Input() secondaryActionLabel?: string;

  @Output() actionClick = new EventEmitter<void>();
  @Output() secondaryActionClick = new EventEmitter<void>();
}
