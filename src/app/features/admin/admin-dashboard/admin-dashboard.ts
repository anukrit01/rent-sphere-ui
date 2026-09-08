import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MaterialModule } from '../../../shared/material/material-module';
import { PageContainerComponent } from '../../../core/components/page-container/page-container';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge';
import { AuthService } from '../../../services/auth';
import { AssetService } from '../../../services/asset';
import { BookingService } from '../../../services/booking';
import { NotificationService } from '../../../core/services/notification.service';
import { Asset, EquipmentStatus } from '../../../shared/models/asset.model';
import { Booking } from '../../../shared/models/booking.model';
import { Category, LocationHub } from '../../../shared/models/category.model';
import { MARKETPLACE_CATEGORIES, MARKETPLACE_LOCATIONS } from '../../../shared/data/marketplace.data';

export interface AdminUser {
  id: number;
  name: string;
  email: string;
  role: 'renter' | 'leaser' | 'admin';
  phone: string;
  companyName: string;
  location: string;
  verified: boolean;
  active: boolean;
  memberSince: string;
  completedRentals: number;
  rating: number;
}

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [
    CommonModule,

    FormsModule,
    MaterialModule,
    PageContainerComponent,
    StatusBadgeComponent,
  ],
  templateUrl: './admin-dashboard.html',
  styleUrl: './admin-dashboard.scss',
})
export class AdminDashboard implements OnInit {
  private assetService = inject(AssetService);
  private bookingService = inject(BookingService);
  private auth = inject(AuthService);
  private notification = inject(NotificationService);
  private router = inject(Router);

  // Active Main Navigation Tab
  public activeTab = signal<'approvals' | 'users' | 'bookings' | 'categories' | 'reports'>('approvals');

  // Breadcrumbs
  public breadcrumbs = [
    { label: 'Marketplace', url: '/' },
    { label: 'Platform Administration' },
  ];

  // Core Data Signals
  public assets = signal<Asset[]>([]);
  public bookings = signal<Booking[]>([]);
  public categories = signal<Category[]>([...MARKETPLACE_CATEGORIES]);
  public locationHubs: LocationHub[] = MARKETPLACE_LOCATIONS.filter((l) => l.id !== 'loc-all');
  public loading = signal<boolean>(true);

  // Users Directory Database
  public users = signal<AdminUser[]>([
    {
      id: 101,
      name: 'Aman Sharma',
      email: 'aman.sharma@buildcorp.in',
      role: 'renter',
      phone: '+91 98260 12345',
      companyName: 'Apex Infra Projects',
      location: 'Indore, Madhya Pradesh',
      verified: true,
      active: true,
      memberSince: '2024',
      completedRentals: 18,
      rating: 4.9,
    },
    {
      id: 102,
      name: 'Rajesh Kulkarni',
      email: 'rajesh@kulkarni-infra.com',
      role: 'renter',
      phone: '+91 94251 33445',
      companyName: 'Kulkarni Earthworks & Roads',
      location: 'Bhopal, Madhya Pradesh',
      verified: true,
      active: true,
      memberSince: '2023',
      completedRentals: 24,
      rating: 4.8,
    },
    {
      id: 103,
      name: 'Pooja Deshmukh',
      email: 'pooja.d@deshmukh-constructions.com',
      role: 'renter',
      phone: '+91 97552 88990',
      companyName: 'Deshmukh Bridge Builders',
      location: 'Pune, Maharashtra',
      verified: true,
      active: true,
      memberSince: '2024',
      completedRentals: 11,
      rating: 4.7,
    },
    {
      id: 201,
      name: 'Vikram Patel',
      email: 'vikram@shreekrishnamachinery.com',
      role: 'leaser',
      phone: '+91 94250 87654',
      companyName: 'Shree Krishna Heavy Earthmovers',
      location: 'Bhopal, Madhya Pradesh',
      verified: true,
      active: true,
      memberSince: '2023',
      completedRentals: 42,
      rating: 4.8,
    },
    {
      id: 202,
      name: 'Harish Chandra',
      email: 'harish@central-cranehire.com',
      role: 'leaser',
      phone: '+91 98930 45678',
      companyName: 'Central Cranes & Hydra Fleet',
      location: 'Indore, Madhya Pradesh',
      verified: true,
      active: true,
      memberSince: '2022',
      completedRentals: 56,
      rating: 4.9,
    },
    {
      id: 203,
      name: 'Sunil Rao',
      email: 'sunil@deccanpowergens.in',
      role: 'leaser',
      phone: '+91 98220 77112',
      companyName: 'Deccan Power & Silent DG Solutions',
      location: 'Pune, Maharashtra',
      verified: false,
      active: true,
      memberSince: '2024',
      completedRentals: 9,
      rating: 4.6,
    },
    {
      id: 999,
      name: 'Anukrit Tiwari',
      email: 'admin@rentsphere.in',
      role: 'admin',
      phone: '+91 98260 00001',
      companyName: 'RentSphere Platform Operations',
      location: 'Bhopal, Madhya Pradesh',
      verified: true,
      active: true,
      memberSince: '2023',
      completedRentals: 0,
      rating: 5.0,
    },
  ]);

  // Filters
  public approvalFilter = signal<'pending' | 'all' | 'approved' | 'rejected' | 'changes_requested'>('pending');
  public userSearchQuery = signal<string>('');
  public userRoleFilter = signal<string>('all');
  public bookingSearchQuery = signal<string>('');
  public bookingStatusFilter = signal<string>('all');

  // Inspection Drawer Preview
  public inspectingAsset = signal<Asset | null>(null);
  public previewCoverIndex = signal<number>(0);

  // Reason Modal (for Reject and Request Changes)
  public showReasonModal = signal<boolean>(false);
  public reasonActionType = signal<'reject' | 'request_changes'>('reject');
  public targetAsset = signal<Asset | null>(null);
  public reasonText = signal<string>('');

  // Confirmation Dialog
  public showConfirmDialog = signal<boolean>(false);
  public confirmTitle = signal<string>('');
  public confirmMessage = signal<string>('');
  public confirmButtonText = signal<string>('Confirm');
  public confirmButtonType = signal<'primary' | 'danger'>('primary');
  private confirmCallback: (() => void) | null = null;

  // Add Category Modal
  public showAddCategoryModal = signal<boolean>(false);
  public newCategoryName = signal<string>('');
  public newCategoryIcon = signal<string>('construction');
  public newCategoryDesc = signal<string>('');

  // ----------------------------------------------------
  // COMPUTED KPIS
  // ----------------------------------------------------
  public totalUsersCount = computed(() => this.users().length);
  public totalEquipmentCount = computed(() => this.assets().length);
  public pendingApprovalsCount = computed(
    () => this.assets().filter((a) => a.status === 'pending').length
  );
  public activeRentalsCount = computed(
    () => this.bookings().filter((b) => b.status === 'approved' || b.status === 'active').length
  );
  public totalRevenue = computed(() =>
    this.bookings().reduce((sum, b) => sum + (b.estimatedTotal || 0), 0)
  );
  public platformCommission = computed(() => Math.round(this.totalRevenue() * 0.08));
  public escrowHeldBalance = computed(() =>
    this.bookings()
      .filter((b) => b.status === 'approved' || b.status === 'active')
      .reduce((sum, b) => sum + (b.securityDeposit || 0), 0)
  );

  // Filtered Assets for Approval Queue
  public filteredApprovalAssets = computed(() => {
    const list = this.assets();
    const filter = this.approvalFilter();
    if (filter === 'all') return list;
    return list.filter((a) => a.status === filter);
  });

  // Filtered Users
  public filteredUsers = computed(() => {
    let list = this.users();
    const q = this.userSearchQuery().toLowerCase().trim();
    const role = this.userRoleFilter();

    if (role !== 'all') {
      list = list.filter((u) => u.role === role);
    }

    if (q) {
      list = list.filter(
        (u) =>
          u.name.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q) ||
          u.companyName.toLowerCase().includes(q) ||
          u.location.toLowerCase().includes(q)
      );
    }
    return list;
  });

  // Filtered Bookings
  public filteredBookings = computed(() => {
    let list = this.bookings();
    const q = this.bookingSearchQuery().toLowerCase().trim();
    const status = this.bookingStatusFilter();

    if (status !== 'all') {
      list = list.filter((b) => b.status === status);
    }

    if (q) {
      list = list.filter(
        (b) =>
          (b.asset?.title && b.asset.title.toLowerCase().includes(q)) ||
          (b.renterName && b.renterName.toLowerCase().includes(q)) ||
          (b.renterCompany && b.renterCompany.toLowerCase().includes(q)) ||
          (b.projectLocation && b.projectLocation.toLowerCase().includes(q)) ||
          String(b.id).includes(q)
      );
    }
    return list;
  });

  ngOnInit(): void {
    this.loadAdminData();
  }

  public loadAdminData(): void {
    this.loading.set(true);

    this.assetService.getAllAssetsAdmin().subscribe({
      next: (assets) => {
        this.assets.set(assets);

        // If there are pending assets, default inspection to first pending
        const pending = assets.find((a) => a.status === 'pending');
        if (pending && !this.inspectingAsset()) {
          this.openInspect(pending);
        }
      },
    });

    this.bookingService.getAllBookings().subscribe({
      next: (bookings) => {
        this.bookings.set(bookings);
        this.loading.set(false);
      },
    });
  }

  // ----------------------------------------------------
  // AREA 1: EQUIPMENT APPROVAL WORKFLOW
  // ----------------------------------------------------

  public openInspect(asset: Asset): void {
    this.inspectingAsset.set(asset);
    this.previewCoverIndex.set(0);
  }

  public closeInspect(): void {
    this.inspectingAsset.set(null);
  }

  public approveEquipment(asset: Asset): void {
    this.assetService.adminApprove(asset.id).subscribe({
      next: (updated) => {
        this.assets.update((list) =>
          list.map((a) => (a.id === updated.id ? updated : a))
        );
        if (this.inspectingAsset()?.id === updated.id) {
          this.inspectingAsset.set(updated);
        }
        this.notification.success(`Approved "${updated.title}". Machine is now live in marketplace fleet.`);
      },
      error: () => this.notification.error('Failed to approve equipment.'),
    });
  }

  public openRejectModal(asset: Asset): void {
    this.targetAsset.set(asset);
    this.reasonActionType.set('reject');
    this.reasonText.set('');
    this.showReasonModal.set(true);
  }

  public openRequestChangesModal(asset: Asset): void {
    this.targetAsset.set(asset);
    this.reasonActionType.set('request_changes');
    this.reasonText.set('');
    this.showReasonModal.set(true);
  }

  public closeReasonModal(): void {
    this.showReasonModal.set(false);
    this.targetAsset.set(null);
    this.reasonText.set('');
  }

  public submitReasonAction(): void {
    const asset = this.targetAsset();
    const reason = this.reasonText().trim();
    if (!asset) return;

    if (!reason) {
      this.notification.warning('Please provide a mandatory reason for the fleet owner.');
      return;
    }

    if (this.reasonActionType() === 'reject') {
      this.assetService.adminReject(asset.id, reason).subscribe({
        next: (updated) => {
          this.assets.update((list) =>
            list.map((a) => (a.id === updated.id ? updated : a))
          );
          if (this.inspectingAsset()?.id === updated.id) {
            this.inspectingAsset.set(updated);
          }
          this.closeReasonModal();
          this.notification.error(`Rejected listing "${updated.title}". Rejection notice dispatched to owner.`);
        },
      });
    } else {
      this.assetService.adminRequestChanges(asset.id, reason).subscribe({
        next: (updated) => {
          this.assets.update((list) =>
            list.map((a) => (a.id === updated.id ? updated : a))
          );
          if (this.inspectingAsset()?.id === updated.id) {
            this.inspectingAsset.set(updated);
          }
          this.closeReasonModal();
          this.notification.warning(`Changes requested for "${updated.title}". Notification sent to owner.`);
        },
      });
    }
  }

  // ----------------------------------------------------
  // AREA 2: USERS MANAGEMENT
  // ----------------------------------------------------

  public toggleUserVerification(user: AdminUser): void {
    const newStatus = !user.verified;
    this.users.update((list) =>
      list.map((u) => (u.id === user.id ? { ...u, verified: newStatus } : u))
    );
    this.notification.info(
      `Updated ${user.name} verification status: ${newStatus ? 'VERIFIED' : 'UNVERIFIED'}`
    );
  }

  public toggleUserStatus(user: AdminUser): void {
    const newActive = !user.active;
    const actionLabel = newActive ? 'activate' : 'suspend';

    this.confirmAction(
      `${actionLabel === 'activate' ? 'Re-activate' : 'Suspend'} User Account`,
      `Are you sure you want to ${actionLabel} access for ${user.name} (${user.companyName})?`,
      actionLabel === 'activate' ? 'Re-activate' : 'Suspend Account',
      actionLabel === 'activate' ? 'primary' : 'danger',
      () => {
        this.users.update((list) =>
          list.map((u) => (u.id === user.id ? { ...u, active: newActive } : u))
        );
        this.notification.warning(`User ${user.name} has been ${newActive ? 'activated' : 'suspended'}.`);
      }
    );
  }

  // ----------------------------------------------------
  // AREA 3: BOOKINGS & ESCROW
  // ----------------------------------------------------

  public auditBookingEscrow(booking: Booking): void {
    this.notification.info(
      `Escrow audit report for Booking #${booking.id}: ₹${booking.securityDeposit?.toLocaleString()} held securely in RBI-compliant escrow account.`
    );
  }

  // ----------------------------------------------------
  // AREA 4: CATEGORIES MANAGEMENT
  // ----------------------------------------------------

  public openAddCategory(): void {
    this.newCategoryName.set('');
    this.newCategoryIcon.set('construction');
    this.newCategoryDesc.set('');
    this.showAddCategoryModal.set(true);
  }

  public closeAddCategory(): void {
    this.showAddCategoryModal.set(false);
  }

  public submitAddCategory(): void {
    const name = this.newCategoryName().trim();
    if (!name) {
      this.notification.warning('Please enter a category name.');
      return;
    }

    const newCat: Category = {
      id: `cat-${name.toLowerCase().replace(/\s+/g, '-')}`,
      name,
      slug: name.toLowerCase().replace(/\s+/g, '-'),
      icon: this.newCategoryIcon(),
      description: this.newCategoryDesc().trim() || 'Industrial rental machinery',
      assetCount: 0,
      featured: false,
      popularModels: [],
    };

    this.categories.update((list) => [...list, newCat]);
    this.closeAddCategory();
    this.notification.success(`Category "${name}" added to marketplace taxonomy.`);
  }

  // ----------------------------------------------------
  // AREA 5: REPORTS & FINANCIALS
  // ----------------------------------------------------

  public exportReport(type: 'csv' | 'pdf'): void {
    this.notification.success(
      `RentSphere ${type.toUpperCase()} audit report generated & downloaded.`
    );
  }

  // ----------------------------------------------------
  // CONFIRMATION DIALOG HELPER
  // ----------------------------------------------------

  public confirmAction(
    title: string,
    message: string,
    btnText: string,
    btnType: 'primary' | 'danger',
    onConfirm: () => void
  ): void {
    this.confirmTitle.set(title);
    this.confirmMessage.set(message);
    this.confirmButtonText.set(btnText);
    this.confirmButtonType.set(btnType);
    this.confirmCallback = onConfirm;
    this.showConfirmDialog.set(true);
  }

  public onConfirmDialogAccept(): void {
    if (this.confirmCallback) {
      this.confirmCallback();
    }
    this.showConfirmDialog.set(false);
    this.confirmCallback = null;
  }

  public onConfirmDialogCancel(): void {
    this.showConfirmDialog.set(false);
    this.confirmCallback = null;
  }
}
