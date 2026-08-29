import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService, ToastNotification } from '../../services/notification.service';
import { MaterialModule } from '../../../shared/material/material-module';

@Component({
  selector: 'app-notification-toast',
  standalone: true,
  imports: [CommonModule, MaterialModule],
  templateUrl: './notification.html',
  styleUrl: './notification.scss',
})
export class NotificationToastComponent {
  private notificationService = inject(NotificationService);
  public notifications = this.notificationService.notifications;

  public dismiss(id: string): void {
    this.notificationService.dismiss(id);
  }

  public getIcon(type: string): string {
    switch (type) {
      case 'success':
        return 'check_circle';
      case 'error':
        return 'error';
      case 'warning':
        return 'warning';
      case 'info':
      default:
        return 'info';
    }
  }
}
