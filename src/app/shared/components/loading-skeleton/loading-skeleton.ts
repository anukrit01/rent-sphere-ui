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
    } @else if (type === 'kpi') {
      <div class="rs-grid rs-grid--5 rs-gap-4 rs-kpi-skeleton-grid">
        @for (item of repeatArray; track $index) {
          <div class="rs-card rs-p-5 rs-kpi-skeleton-card">
            <div class="rs-flex rs-justify-between rs-items-center rs-mb-3">
              <div class="rs-skeleton rs-skeleton--text" style="width: 55%; height: 14px; margin-bottom: 0;"></div>
              <div class="rs-skeleton rs-skeleton--circle" style="width: 36px; height: 36px;"></div>
            </div>
            <div class="rs-skeleton rs-skeleton--heading" style="width: 60%; height: 32px; margin-bottom: var(--rs-space-2);"></div>
            <div class="rs-skeleton rs-skeleton--text" style="width: 40%; height: 12px; margin-bottom: 0;"></div>
          </div>
        }
      </div>
    } @else if (type === 'table') {
      <div class="rs-card rs-table-skeleton">
        <div class="rs-table-skeleton__header">
          <div class="rs-skeleton rs-skeleton--text" style="width: 20%; height: 16px; margin: 0;"></div>
          <div class="rs-skeleton rs-skeleton--text" style="width: 25%; height: 16px; margin: 0;"></div>
          <div class="rs-skeleton rs-skeleton--text" style="width: 15%; height: 16px; margin: 0;"></div>
          <div class="rs-skeleton rs-skeleton--text" style="width: 15%; height: 16px; margin: 0;"></div>
          <div class="rs-skeleton rs-skeleton--text" style="width: 10%; height: 16px; margin: 0;"></div>
        </div>
        @for (item of repeatArray; track $index) {
          <div class="rs-table-skeleton__row">
            <div class="rs-skeleton rs-skeleton--text" style="width: 22%; height: 14px; margin: 0;"></div>
            <div class="rs-skeleton rs-skeleton--text" style="width: 28%; height: 14px; margin: 0;"></div>
            <div class="rs-skeleton rs-skeleton--text" style="width: 12%; height: 14px; margin: 0;"></div>
            <div class="rs-skeleton rs-skeleton--text" style="width: 16%; height: 14px; margin: 0;"></div>
            <div class="rs-skeleton rs-skeleton--button" style="width: 60px; height: 26px;"></div>
          </div>
        }
      </div>
    } @else if (type === 'detail') {
      <div class="rs-grid rs-grid--2 rs-gap-8 rs-detail-skeleton">
        <div class="rs-flex rs-flex-col rs-gap-4">
          <div class="rs-skeleton rs-skeleton--image" style="aspect-ratio: 16/10; width: 100%; border-radius: var(--rs-radius-xl);"></div>
          <div class="rs-flex rs-gap-3">
            <div class="rs-skeleton" style="width: 80px; height: 60px; border-radius: var(--rs-radius-md);"></div>
            <div class="rs-skeleton" style="width: 80px; height: 60px; border-radius: var(--rs-radius-md);"></div>
            <div class="rs-skeleton" style="width: 80px; height: 60px; border-radius: var(--rs-radius-md);"></div>
          </div>
        </div>
        <div class="rs-flex rs-flex-col rs-gap-4">
          <div class="rs-skeleton rs-skeleton--text" style="width: 25%; height: 20px;"></div>
          <div class="rs-skeleton rs-skeleton--heading" style="width: 80%; height: 36px;"></div>
          <div class="rs-skeleton rs-skeleton--text" style="width: 45%; height: 16px;"></div>
          <div class="rs-card rs-p-4 rs-my-2">
            <div class="rs-skeleton rs-skeleton--heading" style="width: 40%; height: 30px;"></div>
            <div class="rs-skeleton rs-skeleton--text" style="width: 60%;"></div>
          </div>
          <div class="rs-grid rs-grid--2 rs-gap-3 rs-my-2">
            <div class="rs-skeleton" style="height: 50px; border-radius: var(--rs-radius-md);"></div>
            <div class="rs-skeleton" style="height: 50px; border-radius: var(--rs-radius-md);"></div>
            <div class="rs-skeleton" style="height: 50px; border-radius: var(--rs-radius-md);"></div>
            <div class="rs-skeleton" style="height: 50px; border-radius: var(--rs-radius-md);"></div>
          </div>
          <div class="rs-skeleton rs-skeleton--button" style="width: 100%; height: 48px; margin-top: auto;"></div>
        </div>
      </div>
    } @else if (type === 'hero') {
      <div class="rs-card rs-hero-skeleton rs-p-10">
        <div class="rs-flex rs-flex-col rs-items-center rs-gap-4 rs-text-center">
          <div class="rs-skeleton rs-skeleton--heading" style="width: 60%; height: 44px; margin: 0 auto;"></div>
          <div class="rs-skeleton rs-skeleton--text" style="width: 40%; height: 18px; margin: 0 auto;"></div>
          <div class="rs-skeleton rs-skeleton--button" style="width: 400px; max-width: 90%; height: 52px; border-radius: var(--rs-radius-xl); margin-top: var(--rs-space-4);"></div>
        </div>
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

    .rs-kpi-skeleton-card {
      border-radius: var(--rs-radius-xl);
      background-color: var(--rs-surface-default);
      border: 1px solid var(--rs-border-default);
    }

    .rs-table-skeleton {
      border-radius: var(--rs-radius-xl);
      border: 1px solid var(--rs-border-default);
      overflow: hidden;

      &__header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: var(--rs-space-4) var(--rs-space-6);
        background-color: var(--rs-bg-secondary);
        border-bottom: 1px solid var(--rs-border-default);
        gap: var(--rs-space-4);
      }

      &__row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: var(--rs-space-4) var(--rs-space-6);
        border-bottom: 1px solid var(--rs-border-subtle);
        gap: var(--rs-space-4);

        &:last-child {
          border-bottom: none;
        }
      }
    }

    .rs-detail-skeleton {
      background-color: var(--rs-surface-default);
      border: 1px solid var(--rs-border-default);
      border-radius: var(--rs-radius-xl);
      padding: var(--rs-space-8);
    }

    .rs-hero-skeleton {
      border-radius: var(--rs-radius-2xl);
      border: 1px solid var(--rs-border-default);
      background-color: var(--rs-surface-default);
    }

    @media (max-width: 991px) {
      .rs-grid--5 {
        grid-template-columns: repeat(2, 1fr) !important;
      }
    }

    @media (max-width: 576px) {
      .rs-grid--5 {
        grid-template-columns: 1fr !important;
      }
    }
  `],
})
export class LoadingSkeletonComponent {
  @Input() type: 'card-grid' | 'list' | 'detail' | 'table' | 'kpi' | 'hero' = 'card-grid';
  @Input() count: number = 6;

  public get repeatArray(): number[] {
    return Array.from({ length: this.count });
  }
}
