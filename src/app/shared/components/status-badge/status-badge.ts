import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EquipmentStatus } from '../../models/asset.model';

@Component({
  selector: 'app-status-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span
      class="rs-badge"
      [class.rs-badge--success]="status === 'available' || status === 'approved'"
      [class.rs-badge--warning]="status === 'rented'"
      [class.rs-badge--error]="status === 'unavailable' || status === 'rejected'"
      [class.rs-badge--accent]="status === 'pending'"
      [class.rs-badge--neutral]="status === 'maintenance'"
    >
      <span
        class="rs-status-dot"
        [class.rs-status-dot--available]="status === 'available' || status === 'approved'"
        [class.rs-status-dot--busy]="status === 'rented'"
        [class.rs-status-dot--unavailable]="status === 'unavailable' || status === 'rejected'"
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
  @Input() status: EquipmentStatus | 'active' | 'unavailable' = 'available';
  @Input() label?: string;

  public getStatusLabel(): string {
    switch (this.status) {
      case 'available':
      case 'approved':
        return 'AVAILABLE';
      case 'rented':
        return 'RENTED / BUSY';
      case 'pending':
        return 'PENDING APPROVAL';
      case 'maintenance':
        return 'MAINTENANCE';
      case 'rejected':
      case 'unavailable':
        return 'UNAVAILABLE';
      default:
        return String(this.status).toUpperCase();
    }
  }
}
