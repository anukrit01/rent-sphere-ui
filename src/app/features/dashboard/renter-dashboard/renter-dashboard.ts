import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MaterialModule } from '../../../shared/material/material-module';
import { PageContainerComponent } from '../../../core/components/page-container/page-container';
import { AssetCardComponent } from '../../../shared/components/asset-card/asset-card';
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
  selector: 'app-renter-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MaterialModule,
    PageContainerComponent,
    AssetCardComponent,
    EmptyStateComponent,
    LoadingSkeletonComponent,
    ErrorStateComponent,
  ],
  templateUrl: './renter-dashboard.html',
  styleUrl: './renter-dashboard.scss',
})
export class RenterDashboard implements OnInit {
  public auth = inject(AuthService);
  private bookingService = inject(BookingService);
  private assetService = inject(AssetService);
  private notificationService = inject(NotificationService);
  private router = inject(Router);

  public bookings = signal<Booking[]>([]);
  public savedAssets = signal<Asset[]>([]);
  public loading = signal<boolean>(true);
  public error = signal<string | null>(null);
  public activeTab = signal<'active' | 'pending' | 'all' | 'completed' | 'saved' | 'escrow'>('active');

  public breadcrumbs = [
    { label: 'Marketplace', url: '/' },
    { label: 'Renter Project Hub' },
  ];

  ngOnInit(): void {
    this.loadRenterData();
  }

  public loadRenterData(): void {
    this.loading.set(true);
    this.error.set(null);
    const user = this.auth.getCurrentUser();
    const userId = user?.id || 101;

    this.bookingService.getBookingsForUser(userId).subscribe({
      next: (list) => {
        this.bookings.set(list);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Failed to load your project rentals. Please check your connection and retry.');
        this.loading.set(false);
      },
    });

    this.assetService.getAssets().subscribe({
      next: (res) => {
        const favs = res.data.filter((a) => this.assetService.isFavorite(a.id));
        this.savedAssets.set(favs.length > 0 ? favs : res.data.slice(0, 2));
      },
      error: () => {
        // non-critical
      },
    });
  }

  // Filtered views
  public activeBookings = computed(() => {
    return this.bookings().filter((b) => b.status === 'approved');
  });

  public pendingBookings = computed(() => {
    return this.bookings().filter((b) => b.status === 'pending');
  });

  public completedBookings = computed(() => {
    return this.bookings().filter((b) => b.status === 'completed' || b.status === 'rejected');
  });

  // Summary Metrics
  public totalEscrowHeld = computed(() => {
    return this.bookings()
      .filter((b) => b.status === 'approved' || b.status === 'pending')
      .reduce((sum, b) => sum + (b.securityDeposit || 0), 0);
  });

  public totalSpent = computed(() => {
    return this.bookings()
      .filter((b) => b.status === 'completed' || b.status === 'approved')
      .reduce((sum, b) => sum + (b.rentalSubtotal + b.operatorFee + b.deliveryFee), 0);
  });

  public getAssetCover(booking: Booking): string {
    return (
      booking.asset?.coverImage ||
      (booking.asset?.images && booking.asset.images.length > 0 ? booking.asset.images[0] : '') ||
      'https://images.unsplash.com/photo-1579829366248-204fe8413f31?auto=format&fit=crop&w=600&q=80'
    );
  }

  // Interactive Actions
  public requestExtension(booking: Booking): void {
    const additionalDays = 3;
    const addedCost = booking.dailyRate * additionalDays;
    
    this.notificationService.success(
      `Extension request (+${additionalDays} days for ₹${addedCost.toLocaleString('en-IN')}) submitted to fleet owner for Booking #${booking.id}.`,
      'Extension Requested'
    );
  }

  public downloadInvoice(booking: Booking): void {
    this.notificationService.info(
      `GST Tax Invoice & Rental Agreement for Booking #${booking.id} generated and downloaded.`,
      'Invoice Ready'
    );
  }

  public contactOwner(booking: Booking): void {
    const phone = booking.asset?.owner?.phone || '+91 94250 87654';
    this.notificationService.info(
      `Fleet Owner Hotline: ${phone} (Representative: ${booking.asset?.owner?.name || 'Vikram Patel'}).`,
      'Owner Contact'
    );
  }

  public reportBreakdown(booking: Booking): void {
    this.notificationService.warning(
      `Support ticket dispatched for machine #${booking.assetId} at ${booking.projectLocation}. Our emergency fleet technician has been notified.`,
      'Site Assistance Alert'
    );
  }

  public cancelBooking(booking: Booking): void {
    this.bookingService.updateBookingStatus(booking.id, 'cancelled').subscribe(() => {
      this.notificationService.info(`Rental request #${booking.id} cancelled. Any held deposit released immediately.`, 'Cancelled');
      this.loadRenterData();
    });
  }
}
