import { Component } from '@angular/core';
import { Asset } from '../../../shared/models/asset.model';

@Component({
  selector: 'app-asset-card',
  imports: [],
  templateUrl: './asset-card.html',
  styleUrl: './asset-card.scss'
})
export class AssetCard {
  asset: Asset[] = [];
}
