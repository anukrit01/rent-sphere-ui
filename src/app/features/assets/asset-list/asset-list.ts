import { Component, OnInit } from '@angular/core';
import { AssetService } from '../../../services/asset';
import { Asset } from '../../../shared/models/asset.model';
import { FormControl } from '@angular/forms';
import { MaterialModule } from "../../../shared/material/material-module";
import { AssetCard } from "../asset-card/asset-card";
import { AssetsModule } from '../assets-module';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-asset-list',
  templateUrl: './asset-list.html',
  styleUrls: ['./asset-list.scss'],
  imports: [MaterialModule, AssetsModule, CommonModule]
})
export class AssetListComponent implements OnInit {
  assets: Asset[] = [];
  q = new FormControl('');
  category = new FormControl('');
  loading = false;
  categories = [
    {name: 'Excavators', desc: 'Soil and rock digging machines', icon: 'precision_manufacturing'},
    {name: 'Cranes', desc: 'Lifting heavy materials easily', icon: 'auto_towing'},
    {name: 'Generators', desc: 'Energy source for remote sites', icon: 'wind_power'},
    {name: 'Loaders', desc: 'Material handling made simple', icon: 'front_loader'},
  ];

  equipments = [
    {name: 'Excavators X200', price: 5000},
    {name: 'Heavy Generatorr G10', price: 2500},
    {name: 'Scissor Lift M45', price: 2000},
    {name: 'Crawler Crane C600', price: 8000},
  ]


  ngOnInit() {
    // this.load();
    // this.q.valueChanges.subscribe(() => this.load());
    // this.category.valueChanges.subscribe(() => this.load());
  }

  load() {
    this.loading = true;
    // this.assetService.getAssets({ q: this.q.value, category: this.category.value }).subscribe({
    //   next: res => { this.assets = res.data; this.loading = false; },
    //   error: () => { this.loading = false; }
    // });
  }
}
