import { Injectable, signal } from '@angular/core';

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface ToastNotification {
  id: string;
  type: NotificationType;
  title?: string;
  message: string;
  duration?: number;
}

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private notificationsSignal = signal<ToastNotification[]>([]);
  public readonly notifications = this.notificationsSignal.asReadonly();

  public show(notification: Omit<ToastNotification, 'id'>): string {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
    const duration = notification.duration ?? 4000;
    const newToast: ToastNotification = { ...notification, id, duration };

    this.notificationsSignal.update((list) => [...list, newToast]);

    if (duration > 0) {
      setTimeout(() => {
        this.dismiss(id);
      }, duration);
    }

    return id;
  }

  public success(message: string, title?: string, duration?: number): string {
    return this.show({ type: 'success', message, title, duration });
  }

  public error(message: string, title?: string, duration?: number): string {
    return this.show({ type: 'error', message, title, duration });
  }

  public warning(message: string, title?: string, duration?: number): string {
    return this.show({ type: 'warning', message, title, duration });
  }

  public info(message: string, title?: string, duration?: number): string {
    return this.show({ type: 'info', message, title, duration });
  }

  public dismiss(id: string): void {
    this.notificationsSignal.update((list) => list.filter((n) => n.id !== id));
  }

  public clearAll(): void {
    this.notificationsSignal.set([]);
  }
}
