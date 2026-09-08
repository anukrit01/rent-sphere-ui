import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EquipmentStatus } from '../../models/asset.model';
import { BookingStatus } from '../../models/booking.model';

@Component({
  selector: 'app-status-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span
      class="rs-badge"
      [class.rs-badge--success]="status === 'available' || status === 'approved' || status === 'active' || status === 'completed'"
      [class.rs-badge--warning]="status === 'rented' || status === 'changes_requested'"
      [class.rs-badge--error]="status === 'unavailable' || status === 'rejected' || status === 'cancelled'"
      [class.rs-badge--accent]="status === 'pending'"
      [class.rs-badge--neutral]="status === 'maintenance'"
    >
      <span
        class="rs-status-dot"
        [class.rs-status-dot--available]="status === 'available' || status === 'approved' || status === 'active' || status === 'completed'"
        [class.rs-status-dot--busy]="status === 'rented' || status === 'changes_requested'"
        [class.rs-status-dot--unavailable]="status === 'unavailable' || status === 'rejected' || status === 'cancelled'"
        [class.rs-status-dot--pending]="status === 'pending'"
      ></span>
      <span>{{ label || getStatusLabel() }}</span>
    </span>
  `,
  styles: [`
    :host {
      display: inline-flex;
    }
  `],
})
export class StatusBadgeComponent {
  @Input() status: EquipmentStatus | BookingStatus | 'active' | 'unavailable' = 'available';
  @Input() label?: string;

  public getStatusLabel(): string {
    switch (this.status) {
      case 'available':
      case 'approved':
        return 'AVAILABLE';
      case 'active':
        return 'ACTIVE ON SITE';
      case 'rented':
        return 'RENTED / BUSY';
      case 'pending':
        return 'PENDING APPROVAL';
      case 'changes_requested':
        return 'CHANGES REQUESTED';
      case 'maintenance':
        return 'MAINTENANCE';
      case 'completed':
        return 'COMPLETED';
      case 'cancelled':
        return 'CANCELLED';
      case 'rejected':
      case 'unavailable':
        return 'REJECTED';
      default:
        return String(this.status).toUpperCase();
    }
  }
}
