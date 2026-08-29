import { Component, Inject, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MaterialModule } from '../../../shared/material/material-module';
import { Asset } from '../../../shared/models/asset.model';
import { BookingService } from '../../../services/booking';
import { AuthService } from '../../../services/auth';
import { NotificationService } from '../../../core/services/notification.service';

export interface BookingDialogData {
  asset: Asset;
  initialStartDate?: string;
  initialEndDate?: string;
  initialOperator?: boolean;
  initialDelivery?: boolean;
}

@Component({
  selector: 'app-booking-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule, MaterialModule],
  templateUrl: './booking-dialog.html',
  styleUrl: './booking-dialog.scss',
})
export class BookingDialog implements OnInit {
  private bookingService = inject(BookingService);
  private auth = inject(AuthService);
  private notificationService = inject(NotificationService);

  public asset: Asset;
  public startDate = signal<string>('');
  public endDate = signal<string>('');
  public operatorRequired = signal<boolean>(true);
  public deliveryRequired = signal<boolean>(true);
  public projectLocation = signal<string>('');
  public projectNotes = signal<string>('');
  public submitting = signal<boolean>(false);

  constructor(
    public dialogRef: MatDialogRef<BookingDialog>,
    @Inject(MAT_DIALOG_DATA) public data: BookingDialogData
  ) {
    this.asset = data.asset;
  }

  ngOnInit(): void {
    // Set default dates: tomorrow to +4 days
    const today = new Date();
    const start = new Date(today);
    start.setDate(today.getDate() + 1);

    const end = new Date(start);
    end.setDate(start.getDate() + (this.asset.minimumRentalDays || 3));

    this.startDate.set(this.data.initialStartDate || start.toISOString().split('T')[0]);
    this.endDate.set(this.data.initialEndDate || end.toISOString().split('T')[0]);
    this.operatorRequired.set(this.data.initialOperator !== undefined ? this.data.initialOperator : !!this.asset.operatorProvided);
    this.deliveryRequired.set(this.data.initialDelivery !== undefined ? this.data.initialDelivery : true);

    const user = this.auth.getCurrentUser();
    if (user?.location) {
      this.projectLocation.set(`${this.asset.city} Site - Construction Area`);
    } else {
      this.projectLocation.set(`${this.asset.location} (Project Site)`);
    }
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
    return this.bookingService.calculateBookingCost({
      asset: this.asset,
      durationDays: this.durationDays(),
      operatorRequired: this.operatorRequired(),
      deliveryRequired: this.deliveryRequired(),
    });
  });

  public submitRequest(): void {
    if (!this.projectLocation().trim()) {
      this.notificationService.warning('Please enter the project site delivery location.', 'Location Required');
      return;
    }

    this.submitting.set(true);
    const user = this.auth.getCurrentUser();

    const calc = this.calculation();
    this.bookingService
      .createBooking({
        assetId: this.asset.id,
        asset: this.asset,
        renterId: user?.id || 101,
        renterName: user?.name || 'Aman Sharma',
        renterCompany: user?.companyName || 'Apex Infra Projects',
        renterPhone: user?.phone || '+91 98260 12345',
        startDate: this.startDate(),
        endDate: this.endDate(),
        durationDays: calc.durationDays,
        dailyRate: calc.dailyRate,
        rentalSubtotal: calc.rentalSubtotal,
        operatorRequired: this.operatorRequired(),
        operatorFee: calc.operatorFee,
        deliveryRequired: this.deliveryRequired(),
        deliveryFee: calc.deliveryFee,
        securityDeposit: calc.securityDeposit,
        estimatedTotal: calc.estimatedTotal,
        projectLocation: this.projectLocation().trim(),
        projectDescription: this.projectNotes().trim(),
      })
      .subscribe({
        next: (created) => {
          this.submitting.set(false);
          this.notificationService.success(
            `Rental request #${created.id} sent to ${this.asset.owner.name}. You will be notified upon confirmation.`,
            'Request Submitted'
          );
          this.dialogRef.close(created);
        },
        error: () => {
          this.submitting.set(false);
          this.notificationService.error('Unable to submit rental request. Please try again.', 'Error');
        },
      });
  }
}
