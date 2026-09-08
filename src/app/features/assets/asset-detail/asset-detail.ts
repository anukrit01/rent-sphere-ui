import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MaterialModule } from '../../../shared/material/material-module';
import { PageContainerComponent } from '../../../core/components/page-container/page-container';
import { PriceDisplayComponent } from '../../../shared/components/price-display/price-display';
import { RatingComponent } from '../../../shared/components/rating/rating';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state';
import { LoadingSkeletonComponent } from '../../../shared/components/loading-skeleton/loading-skeleton';
import { ErrorStateComponent } from '../../../shared/components/error-state/error-state';
import { BookingDialog } from '../../bookings/booking-dialog/booking-dialog';
import { AssetService } from '../../../services/asset';
import { BookingService } from '../../../services/booking';
import { AuthService } from '../../../services/auth';
import { NotificationService } from '../../../core/services/notification.service';
import { Asset } from '../../../shared/models/asset.model';

@Component({
  selector: 'app-asset-detail',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MaterialModule,
    PageContainerComponent,
    PriceDisplayComponent,
    RatingComponent,
    StatusBadgeComponent,
    EmptyStateComponent,
    LoadingSkeletonComponent,
    ErrorStateComponent,
  ],
  templateUrl: './asset-detail.html',
  styleUrl: './asset-detail.scss',
})
export class AssetDetail implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private assetService = inject(AssetService);
  private bookingService = inject(BookingService);
  public auth = inject(AuthService);
  private notificationService = inject(NotificationService);
  private dialog = inject(MatDialog);

  public asset = signal<Asset | undefined>(undefined);
  public loading = signal<boolean>(true);
  public error = signal<string | null>(null);
  public currentAssetId = signal<number | null>(null);
  public activeImageIndex = signal<number>(0);

  // Sticky Booking Widget state
  public startDate = signal<string>('');
  public endDate = signal<string>('');
  public operatorRequired = signal<boolean>(true);
  public deliveryRequired = signal<boolean>(true);

  // Active Information Tab
  public activeTab = signal<'overview' | 'specs' | 'features' | 'terms' | 'reviews'>('overview');

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      const id = Number(params['id']);
      if (id) {
        this.currentAssetId.set(id);
        this.loadAsset(id);
      }
    });

    // Default dates (tomorrow + 3 days)
    const today = new Date();
    const start = new Date(today);
    start.setDate(today.getDate() + 1);

    const end = new Date(start);
    end.setDate(start.getDate() + 3);

    this.startDate.set(start.toISOString().split('T')[0]);
    this.endDate.set(end.toISOString().split('T')[0]);
  }

  public reloadAsset(): void {
    const id = this.currentAssetId();
    if (id) {
      this.loadAsset(id);
    }
  }

  private loadAsset(id: number): void {
    this.loading.set(true);
    this.error.set(null);
    this.assetService.getAsset(id).subscribe({
      next: (found) => {
        this.asset.set(found);
        this.activeImageIndex.set(0);
        if (found) {
          this.operatorRequired.set(!!found.operatorProvided);
        }
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Failed to load machinery details. Please check your connection and retry.');
        this.loading.set(false);
      },
    });
  }

  public durationDays = computed(() => {
    const s = new Date(this.startDate());
    const e = new Date(this.endDate());
    if (isNaN(s.getTime()) || isNaN(e.getTime())) return 1;
    const diffTime = e.getTime() - s.getTime();
    const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(1, days || 1);
  });

  public calculation = computed(() => {
    const a = this.asset();
    if (!a) {
      return {
        durationDays: 1,
        dailyRate: 0,
        rentalSubtotal: 0,
        operatorFee: 0,
        deliveryFee: 0,
        securityDeposit: 0,
        estimatedTotal: 0,
      };
    }

    return this.bookingService.calculateBookingCost({
      asset: a,
      durationDays: this.durationDays(),
      operatorRequired: this.operatorRequired(),
      deliveryRequired: this.deliveryRequired(),
    });
  });

  public get isFavorite(): boolean {
    const a = this.asset();
    return a ? this.assetService.isFavorite(a.id) : false;
  }

  public toggleFavorite(): void {
    const a = this.asset();
    if (!a) return;
    const isNowFav = this.assetService.toggleFavorite(a.id);
    if (isNowFav) {
      this.notificationService.success(`${a.title} saved to your favorites.`, 'Favorite Added');
    } else {
      this.notificationService.info(`${a.title} removed from favorites.`, 'Removed');
    }
  }

  public shareAsset(): void {
    navigator.clipboard.writeText(window.location.href);
    this.notificationService.success('Machine listing link copied to clipboard!', 'Link Copied');
  }

  public openBookingDialog(): void {
    const a = this.asset();
    if (!a) return;

    this.dialog.open(BookingDialog, {
      data: {
        asset: a,
        initialStartDate: this.startDate(),
        initialEndDate: this.endDate(),
        initialOperator: this.operatorRequired(),
        initialDelivery: this.deliveryRequired(),
      },
      width: '820px',
      maxWidth: '95vw',
      panelClass: 'rs-dialog-panel',
    });
  }

  public contactOwner(): void {
    const a = this.asset();
    if (!a) return;
    this.notificationService.info(
      `Owner Hotline: ${a.owner.phone || '+91 94250 87654'}. Operating hours 08:00–20:00 IST.`,
      'Contact Owner'
    );
  }

  public get breadcrumbs() {
    const a = this.asset();
    return [
      { label: 'Marketplace', url: '/' },
      { label: a?.category || 'Fleet', url: '/assets' },
      { label: a?.name || a?.title || 'Equipment Details' },
    ];
  }
}
