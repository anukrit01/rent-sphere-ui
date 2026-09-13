import { Component, inject, signal, computed, HostListener, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService, DEMO_ACCOUNTS } from '../../../services/auth';
import { NotificationService } from '../../services/notification.service';
import { MaterialModule } from '../../../shared/material/material-module';
import { UserRole } from '../../../shared/models/user.model';
import { Category, LocationHub } from '../../../shared/models/category.model';
import { MARKETPLACE_CATEGORIES, MARKETPLACE_LOCATIONS, POPULAR_SEARCH_TERMS } from '../../../shared/data/marketplace.data';

export interface HeaderNotification {
  id: number;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: 'booking' | 'listing' | 'system';
  targetUrl: string;
}

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, FormsModule, MaterialModule],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header {
  public auth = inject(AuthService);
  private router = inject(Router);
  private notificationService = inject(NotificationService);
  private elementRef = inject(ElementRef);

  // Search & Navigation State
  public searchQuery = signal('');
  public searchFocused = signal(false);
  public mobileMenuOpen = signal(false);
  public selectedLocation = signal<LocationHub>(MARKETPLACE_LOCATIONS[0]);

  // Categories & Locations Data
  public categories: Category[] = MARKETPLACE_CATEGORIES;
  public locations: LocationHub[] = MARKETPLACE_LOCATIONS;
  public popularSearchTerms: string[] = POPULAR_SEARCH_TERMS;
  public demoAccounts = DEMO_ACCOUNTS;

  // Mock Notifications
  public notifications = signal<HeaderNotification[]>([
    {
      id: 1,
      title: 'Booking Approved',
      message: 'Your CAT 320D Excavator request is approved for site deployment.',
      time: '12m ago',
      read: false,
      type: 'booking',
      targetUrl: '/dashboard/renter',
    },
    {
      id: 2,
      title: 'New Rental Request',
      message: 'Vikram Infra received a request for JCB 3DX Backhoe (5 days).',
      time: '45m ago',
      read: false,
      type: 'booking',
      targetUrl: '/dashboard/leaser',
    },
    {
      id: 3,
      title: 'Fleet Inspection Verified',
      message: 'Komatsu PC210 has passed the safety & telematics audit.',
      time: '1d ago',
      read: true,
      type: 'listing',
      targetUrl: '/dashboard/leaser',
    },
    {
      id: 4,
      title: 'New Listing Pending Approval',
      message: 'Ajax Argo 4000 Concrete Mixer submitted by owner.',
      time: '2d ago',
      read: true,
      type: 'system',
      targetUrl: '/admin',
    },
  ]);

  public unreadNotificationCount = computed(() => {
    return this.notifications().filter((n) => !n.read).length;
  });

  // Filtered search suggestions based on current query
  public filteredCategories = computed(() => {
    const q = this.searchQuery().toLowerCase().trim();
    if (!q) return this.categories.slice(0, 4);
    return this.categories.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        c.popularModels?.some((m) => m.toLowerCase().includes(q))
    );
  });

  public filteredModels = computed(() => {
    const q = this.searchQuery().toLowerCase().trim();
    const allModels: { model: string; category: string }[] = [];
    this.categories.forEach((cat) => {
      cat.popularModels?.forEach((m) => {
        allModels.push({ model: m, category: cat.name });
      });
    });

    if (!q) return allModels.slice(0, 4);
    return allModels.filter((m) => m.model.toLowerCase().includes(q)).slice(0, 5);
  });

  public onSearchSubmit(): void {
    const q = this.searchQuery().trim();
    const loc = this.selectedLocation().id !== 'loc-all' ? this.selectedLocation().city : undefined;
    
    this.searchFocused.set(false);
    this.mobileMenuOpen.set(false);

    this.router.navigate(['/assets'], {
      queryParams: {
        ...(q ? { q } : {}),
        ...(loc ? { location: loc } : {}),
      },
    });
  }

  public selectSearchSuggestion(term: string): void {
    this.searchQuery.set(term);
    this.onSearchSubmit();
  }

  public selectCategory(cat: Category): void {
    this.searchFocused.set(false);
    this.mobileMenuOpen.set(false);
    this.router.navigate(['/assets'], { queryParams: { category: cat.name } });
  }

  public selectLocation(loc: LocationHub): void {
    this.selectedLocation.set(loc);
    this.notificationService.info(`Location set to ${loc.city}, ${loc.state}`, 'Location Updated');
    if (this.router.url.startsWith('/assets')) {
      const q = this.searchQuery().trim();
      this.router.navigate(['/assets'], {
        queryParams: {
          ...(q ? { q } : {}),
          ...(loc.id !== 'loc-all' ? { location: loc.city } : {}),
        },
      });
    }
  }

  public selectLocationById(id: string): void {
    const found = this.locations.find((l) => l.id === id) || this.locations[0];
    this.selectLocation(found);
  }

  public toggleMobileMenu(): void {
    this.mobileMenuOpen.update((v) => !v);
  }

  public closeMobileMenu(): void {
    this.mobileMenuOpen.set(false);
  }

  public switchRole(role: UserRole): void {
    this.auth.switchDemoRole(role);
    this.notificationService.success(
      `Switched to ${role.toUpperCase()} mode. All role interfaces and actions are now active.`,
      'Role Changed'
    );
    this.mobileMenuOpen.set(false);

    if (role === 'renter') {
      this.router.navigate(['/dashboard/renter']);
    } else if (role === 'leaser') {
      this.router.navigate(['/dashboard/leaser']);
    } else if (role === 'admin') {
      this.router.navigate(['/admin']);
    } else {
      this.router.navigate(['/']);
    }
  }

  public markNotificationAsRead(item: HeaderNotification): void {
    this.notifications.update((list) =>
      list.map((n) => (n.id === item.id ? { ...n, read: true } : n))
    );
    this.router.navigateByUrl(item.targetUrl);
  }

  public markAllNotificationsAsRead(): void {
    this.notifications.update((list) => list.map((n) => ({ ...n, read: true })));
    this.notificationService.info('All notifications marked as read', 'Notifications');
  }

  public logout(): void {
    this.auth.logout();
    this.notificationService.success('You have successfully signed out.', 'Signed Out');
    this.router.navigate(['/']);
    this.mobileMenuOpen.set(false);
  }

  @HostListener('document:click', ['$event'])
  public onDocumentClick(event: MouseEvent): void {
    const clickedInside = this.elementRef.nativeElement.contains(event.target);
    if (!clickedInside) {
      this.searchFocused.set(false);
    }
  }

  @HostListener('document:keydown.escape')
  public handleEscape(): void {
    this.searchFocused.set(false);
    this.mobileMenuOpen.set(false);
  }
}
