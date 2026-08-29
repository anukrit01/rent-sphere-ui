import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-price-display',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="rs-price" [class.rs-price--lg]="size === 'lg'" [class.rs-price--sm]="size === 'sm'">
      <span class="rs-price__currency">₹</span>
      <span class="rs-price__amount">{{ amount | number:'1.0-0' }}</span>
      <span class="rs-price__period">/{{ period }}</span>
    </div>
  `,
  styles: [`
    .rs-price {
      display: inline-flex;
      align-items: baseline;
      font-family: var(--rs-font-family);
      line-height: 1;
      color: var(--rs-color-primary-900);

      &__currency {
        font-size: 0.85em;
        font-weight: var(--rs-font-semibold);
        margin-right: 1px;
      }

      &__amount {
        font-size: var(--rs-text-xl);
        font-weight: var(--rs-font-bold);
        letter-spacing: -0.02em;
      }

      &__period {
        font-size: var(--rs-text-xs);
        font-weight: var(--rs-font-regular);
        color: var(--rs-text-secondary);
        margin-left: 2px;
      }

      &--lg {
        .rs-price__amount {
          font-size: var(--rs-text-3xl);
        }
        .rs-price__period {
          font-size: var(--rs-text-sm);
        }
      }

      &--sm {
        .rs-price__amount {
          font-size: var(--rs-text-md);
        }
        .rs-price__period {
          font-size: 10px;
        }
      }
    }
  `],
})
export class PriceDisplayComponent {
  @Input() amount: number = 0;
  @Input() period: string = 'day';
  @Input() size: 'sm' | 'md' | 'lg' = 'md';
}
