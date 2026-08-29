import { Component, Input, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MaterialModule } from '../../material/material-module';
import { Category, LocationHub } from '../../models/category.model';
import { MARKETPLACE_CATEGORIES, MARKETPLACE_LOCATIONS } from '../../data/marketplace.data';

export interface FilterState {
  category: string;
  location: string;
  minPrice?: number;
  maxPrice?: number;
  availableOnly: boolean;
  condition: string;
  minRating: number;
  operatorRequired: boolean;
}

@Component({
  selector: 'app-filter-panel',
  standalone: true,
  imports: [CommonModule, FormsModule, MaterialModule],
  templateUrl: './filter-panel.html',
  styleUrl: './filter-panel.scss',
})
export class FilterPanelComponent {
  @Input() currentFilters: FilterState = {
    category: 'All',
    location: 'All Locations',
    availableOnly: false,
    condition: 'All',
    minRating: 0,
    operatorRequired: false,
  };

  @Input() totalResultsCount = 0;
  @Input() isMobileDrawer = false;

  @Output() filtersChange = new EventEmitter<FilterState>();
  @Output() closeDrawer = new EventEmitter<void>();

  public categories: Category[] = MARKETPLACE_CATEGORIES;
  public locations: LocationHub[] = MARKETPLACE_LOCATIONS;

  public pricePresets = [
    { label: 'All Rates', min: undefined, max: undefined },
    { label: 'Under ₹3,000/day', min: 0, max: 3000 },
    { label: '₹3,000 – ₹6,000/day', min: 3000, max: 6000 },
    { label: '₹6,000 – ₹10,000/day', min: 6000, max: 10000 },
    { label: 'Above ₹10,000/day', min: 10000, max: undefined },
  ];

  public conditions = ['All', 'Excellent (Like New)', 'Good (Fully Serviced)', 'Certified Rebuilt'];
  public ratingOptions = [
    { label: 'All Ratings', value: 0 },
    { label: '4.5 ★ & above', value: 4.5 },
    { label: '4.0 ★ & above', value: 4.0 },
    { label: '3.5 ★ & above', value: 3.5 },
  ];

  public onFilterUpdate(): void {
    this.filtersChange.emit({ ...this.currentFilters });
  }

  public setCategory(catName: string): void {
    this.currentFilters.category = catName;
    this.onFilterUpdate();
  }

  public setLocation(city: string): void {
    this.currentFilters.location = city;
    this.onFilterUpdate();
  }

  public setPricePreset(preset: { min?: number; max?: number }): void {
    this.currentFilters.minPrice = preset.min;
    this.currentFilters.maxPrice = preset.max;
    this.onFilterUpdate();
  }

  public resetAllFilters(): void {
    this.currentFilters = {
      category: 'All',
      location: 'All Locations',
      minPrice: undefined,
      maxPrice: undefined,
      availableOnly: false,
      condition: 'All',
      minRating: 0,
      operatorRequired: false,
    };
    this.onFilterUpdate();
  }

  public get hasActiveFilters(): boolean {
    return (
      this.currentFilters.category !== 'All' ||
      this.currentFilters.location !== 'All Locations' ||
      this.currentFilters.minPrice !== undefined ||
      this.currentFilters.maxPrice !== undefined ||
      this.currentFilters.availableOnly ||
      this.currentFilters.condition !== 'All' ||
      this.currentFilters.minRating > 0 ||
      this.currentFilters.operatorRequired
    );
  }
}
