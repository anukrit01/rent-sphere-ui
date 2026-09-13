import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { MaterialModule } from '../../material/material-module';
import { Asset } from '../../models/asset.model';
import { AssetService } from '../../../services/asset';
import { NotificationService } from '../../../core/services/notification.service';
import { PriceDisplayComponent } from '../price-display/price-display';
import { RatingComponent } from '../rating/rating';
import { StatusBadgeComponent } from '../status-badge/status-badge';

@Component({
  selector: 'app-asset-card',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MaterialModule,
    PriceDisplayComponent,
    RatingComponent,
    StatusBadgeComponent,
  ],
  templateUrl: './asset-card.html',
  styleUrl: './asset-card.scss',
})
export class AssetCardComponent {
  @Input({ required: true }) asset!: Asset;
  @Input() showOperatorTag = true;

  private assetService = inject(AssetService);
  private notificationService = inject(NotificationService);
  private router = inject(Router);

  public get isFavorite(): boolean {
    return this.assetService.isFavorite(this.asset.id);
  }

  public toggleFavorite(event: MouseEvent): void {
    event.stopPropagation();
    event.preventDefault();
    const isNowFav = this.assetService.toggleFavorite(this.asset.id);
    if (isNowFav) {
      this.notificationService.success(
        `${this.asset.title} added to your saved equipment.`,
        'Saved to Favorites'
      );
    } else {
      this.notificationService.info(
        `${this.asset.title} removed from favorites.`,
        'Removed'
      );
    }
  }

  public navigateToDetail(): void {
    this.router.navigate(['/assets', this.asset.id]);
  }
}
