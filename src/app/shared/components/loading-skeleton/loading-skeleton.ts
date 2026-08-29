import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-loading-skeleton',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (type === 'card-grid') {
      <div class="rs-grid rs-grid--3 rs-gap-6">
        @for (item of repeatArray; track $index) {
          <div class="rs-card rs-skeleton-card">
            <div class="rs-skeleton rs-skeleton--image"></div>
            <div class="rs-skeleton-card__body">
              <div class="rs-skeleton rs-skeleton--text" style="width: 40%;"></div>
              <div class="rs-skeleton rs-skeleton--heading" style="width: 85%;"></div>
              <div class="rs-skeleton rs-skeleton--text" style="width: 60%;"></div>
              <div class="rs-skeleton-card__footer">
                <div class="rs-skeleton rs-skeleton--text" style="width: 35%; height: 24px;"></div>
                <div class="rs-skeleton rs-skeleton--button" style="width: 90px; height: 32px;"></div>
              </div>
            </div>
          </div>
        }
      </div>
    } @else if (type === 'list') {
      <div class="rs-flex rs-flex-col rs-gap-4">
        @for (item of repeatArray; track $index) {
          <div class="rs-card rs-p-4 rs-flex rs-gap-4 rs-items-center">
            <div class="rs-skeleton rs-skeleton--image" style="width: 120px; height: 80px; flex-shrink: 0;"></div>
            <div class="rs-flex-1 rs-flex rs-flex-col rs-gap-2">
              <div class="rs-skeleton rs-skeleton--heading" style="width: 50%;"></div>
              <div class="rs-skeleton rs-skeleton--text" style="width: 75%;"></div>
            </div>
          </div>
        }
      </div>
    }
  `,
  styles: [`
    .rs-skeleton-card {
      border-radius: var(--rs-radius-lg);
      overflow: hidden;
      background-color: var(--rs-surface-default);
      border: 1px solid var(--rs-border-default);

      &__body {
        padding: var(--rs-space-4);
        display: flex;
        flex-direction: column;
        gap: var(--rs-space-2);
      }

      &__footer {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-top: var(--rs-space-3);
        padding-top: var(--rs-space-3);
        border-top: 1px solid var(--rs-border-subtle);
      }
    }
  `],
})
export class LoadingSkeletonComponent {
  @Input() type: 'card-grid' | 'list' = 'card-grid';
  @Input() count: number = 6;

  public get repeatArray(): number[] {
    return Array.from({ length: this.count });
  }
}
