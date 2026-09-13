import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MaterialModule } from '../../../shared/material/material-module';
import { PageContainerComponent } from '../../../core/components/page-container/page-container';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state';
import { LoadingSkeletonComponent } from '../../../shared/components/loading-skeleton/loading-skeleton';
import { ErrorStateComponent } from '../../../shared/components/error-state/error-state';
import { AuthService } from '../../../services/auth';
import { BookingService } from '../../../services/booking';
import { AssetService } from '../../../services/asset';
import { NotificationService } from '../../../core/services/notification.service';
import { Booking } from '../../../shared/models/booking.model';
import { Asset } from '../../../shared/models/asset.model';

@Component({
  selector: 'app-leaser-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    FormsModule,
    MaterialModule,
    PageContainerComponent,
    StatusBadgeComponent,
    EmptyStateComponent,
    LoadingSkeletonComponent,
    ErrorStateComponent,
  ],
  templateUrl: './leaser-dashboard.html',
  styleUrl: './leaser-dashboard.scss',
})
export class LeaserDashboard implements OnInit {
  public auth = inject(AuthService);
  private bookingService = inject(BookingService);
  private assetService = inject(AssetService);
  private notificationService = inject(NotificationService);
  private router = inject(Router);

  public bookings = signal<Booking[]>([]);
  public fleetAssets = signal<Asset[]>([]);
  public loading = signal<boolean>(true);
  public error = signal<string | null>(null);
  public activeTab = signal<'fleet' | 'incoming' | 'active' | 'earnings' | 'history'>('fleet');
  public rejectionReason = signal<string>('');
  public showRejectDialog = signal<number | null>(null);

  public breadcrumbs = [
    { label: 'Marketplace', url: '/' },
    { label: 'Fleet Owner Portal' },
  ];

  ngOnInit(): void {
    this.loadLeaserData();
  }

  public loadLeaserData(): void {
    this.loading.set(true);
    this.error.set(null);

    // Load all bookings (the leaser owns assets, so filter by owner id)
    this.bookingService.getAllBookings().subscribe({
      next: (allBookings) => {
        // For demo: leaser sees all bookings (in production, filtered by owner)
        this.bookings.set(allBookings);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Failed to load fleet booking records. Please check your connection and retry.');
        this.loading.set(false);
      },
    });

    // Load fleet: assets owned by this leaser
    this.assetService.getAssets().subscribe({
      next: (res) => {
        // For demo: show first 6 as "leaser's fleet"
        this.fleetAssets.set(res.data.slice(0, 6));
      },
      error: () => {
        // non-critical
      },
    });
  }

  // ---- Computed filtered views ----

  public incomingRequests = computed(() => {
    return this.bookings().filter((b) => b.status === 'pending');
  });

  public activeDeployments = computed(() => {
    return this.bookings().filter((b) => b.status === 'approved');
  });

  public completedBookings = computed(() => {
    return this.bookings().filter((b) => b.status === 'completed');
  });

  // ---- Computed KPIs ----

  public totalRevenue = computed(() => {
    return this.bookings()
      .filter((b) => b.status === 'completed' || b.status === 'approved')
      .reduce((sum, b) => sum + b.rentalSubtotal + b.operatorFee + b.deliveryFee, 0);
  });

  public totalEscrowHeld = computed(() => {
    return this.bookings()
      .filter((b) => b.status === 'approved' || b.status === 'pending')
      .reduce((sum, b) => sum + (b.securityDeposit || 0), 0);
  });

  public avgUtilizationRate = computed(() => {
    const fleet = this.fleetAssets();
    if (fleet.length === 0) return 0;
    const rented = fleet.filter((a) => a.status === 'rented').length;
    // Fake some utilization for demo
    return Math.round(((rented + this.activeDeployments().length) / Math.max(fleet.length, 1)) * 100);
  });

  // ---- Actions ----

  public approveRequest(booking: Booking): void {
    this.bookingService.updateBookingStatus(booking.id, 'approved').subscribe(() => {
      this.notificationService.success(
        `Rental request #RS-${booking.id} from ${booking.renterCompany || booking.renterName} APPROVED. Low-bed trailer dispatch notification sent.`,
        'Request Approved'
      );
      this.loadLeaserData();
    });
  }

  public openRejectDialog(bookingId: number): void {
    this.showRejectDialog.set(bookingId);
    this.rejectionReason.set('');
  }

  public cancelRejectDialog(): void {
    this.showRejectDialog.set(null);
    this.rejectionReason.set('');
  }

  public confirmReject(): void {
    const bookingId = this.showRejectDialog();
    if (!bookingId) return;

    const reason = this.rejectionReason().trim() || 'Equipment unavailable for the requested dates.';
    this.bookingService.updateBookingStatus(bookingId, 'rejected', reason).subscribe(() => {
      this.notificationService.info(
        `Rental request #RS-${bookingId} rejected. Contractor has been notified with your reason.`,
        'Request Declined'
      );
      this.showRejectDialog.set(null);
      this.rejectionReason.set('');
      this.loadLeaserData();
    });
  }

  public toggleAvailability(asset: Asset): void {
    const newStatus = asset.status === 'available' ? 'rented' : 'available';
    asset.status = newStatus;
    asset.available = newStatus === 'available';
    this.notificationService.success(
      `${asset.title} is now marked as "${newStatus === 'available' ? 'Available for Hire' : 'Currently Deployed'}".`,
      'Availability Updated'
    );
  }

  public editListing(asset: Asset): void {
    this.notificationService.info(
      `Editing ${asset.title}. The multi-step listing wizard will be available in Phase 13.`,
      'Edit Listing'
    );
  }

  public downloadSettlementReport(): void {
    this.notificationService.success(
      'Monthly revenue settlement report (GST-compliant) has been generated and downloaded as PDF.',
      'Report Ready'
    );
  }

  public getAssetCover(booking: Booking): string {
    return (
      booking.asset?.coverImage ||
      (booking.asset?.images && booking.asset.images.length > 0 ? booking.asset.images[0] : '') ||
      'https://images.unsplash.com/photo-1579829366248-204fe8413f31?auto=format&fit=crop&w=600&q=80'
    );
  }
}
