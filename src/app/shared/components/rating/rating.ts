import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../../material/material-module';

@Component({
  selector: 'app-rating',
  standalone: true,
  imports: [CommonModule, MaterialModule],
  template: `
    <div class="rs-rating" [class.rs-rating--sm]="size === 'sm'">
      <div class="rs-rating__badge">
        <mat-icon class="rs-rating__star">star</mat-icon>
        <span class="rs-rating__value">{{ rating | number:'1.1-1' }}</span>
      </div>
      @if (reviewCount !== undefined) {
        <span class="rs-rating__count">({{ reviewCount }})</span>
      }
    </div>
  `,
  styles: [`
    .rs-rating {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      font-size: var(--rs-text-xs);

      &__badge {
        display: inline-flex;
        align-items: center;
        gap: 2px;
        background-color: var(--rs-color-primary-900);
        color: var(--rs-color-white);
        padding: 2px 6px;
        border-radius: var(--rs-radius-sm);
        font-weight: var(--rs-font-semibold);
      }

      &__star {
        font-size: 13px;
        width: 13px;
        height: 13px;
        color: var(--rs-color-accent-400);
      }

      &__value {
        line-height: 1;
      }

      &__count {
        color: var(--rs-text-tertiary);
        font-size: var(--rs-text-xs);
      }

      &--sm {
        &__badge {
          padding: 1px 4px;
          font-size: 11px;
        }
        &__star {
          font-size: 11px;
          width: 11px;
          height: 11px;
        }
      }
    }
  `],
})
export class RatingComponent {
  @Input() rating: number = 5.0;
  @Input() reviewCount?: number;
  @Input() size: 'sm' | 'md' = 'md';
}
