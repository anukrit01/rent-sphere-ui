import { Component, OnInit, inject, signal, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MaterialModule } from '../../../shared/material/material-module';
import { PageContainerComponent } from '../../../core/components/page-container/page-container';
import { AssetCardComponent } from '../../../shared/components/asset-card/asset-card';
import { FilterPanelComponent, FilterState } from '../../../shared/components/filter-panel/filter-panel';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state';
import { LoadingSkeletonComponent } from '../../../shared/components/loading-skeleton/loading-skeleton';
import { ErrorStateComponent } from '../../../shared/components/error-state/error-state';
import { AssetService, AssetQueryParams } from '../../../services/asset';
import { Asset } from '../../../shared/models/asset.model';

@Component({
  selector: 'app-asset-catalog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MaterialModule,
    PageContainerComponent,
    AssetCardComponent,
    FilterPanelComponent,
    EmptyStateComponent,
    LoadingSkeletonComponent,
    ErrorStateComponent,
  ],
  templateUrl: './asset-catalog.html',
  styleUrl: './asset-catalog.scss',
})
export class AssetCatalogComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private assetService = inject(AssetService);

  public assets = signal<Asset[]>([]);
  public totalResults = signal(0);
  public loading = signal(true);
  public error = signal<string | null>(null);
  public mobileFilterOpen = signal(false);
  public viewMode = signal<'grid' | 'list'>('grid');

  // Search input state
  public searchInput = signal('');
  public selectedSort = signal<'recommended' | 'price_asc' | 'price_desc' | 'rating' | 'newest'>('recommended');

  public filters = signal<FilterState>({
    category: 'All',
    location: 'All Locations',
    minPrice: undefined,
    maxPrice: undefined,
    availableOnly: false,
    condition: 'All',
    minRating: 0,
    operatorRequired: false,
  });

  public breadcrumbs = [
    { label: 'Marketplace', url: '/' },
    { label: 'All Equipment Fleet' },
  ];

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      this.syncFromQueryParams(params);
      this.fetchResults();
    });
  }

  private syncFromQueryParams(params: any): void {
    if (params['q']) {
      this.searchInput.set(params['q']);
    } else {
      this.searchInput.set('');
    }

    const newFilters: FilterState = {
      category: params['category'] || 'All',
      location: params['location'] || 'All Locations',
      minPrice: params['minPrice'] ? Number(params['minPrice']) : undefined,
      maxPrice: params['maxPrice'] ? Number(params['maxPrice']) : undefined,
      availableOnly: params['availableOnly'] === 'true',
      condition: params['condition'] || 'All',
      minRating: params['minRating'] ? Number(params['minRating']) : 0,
      operatorRequired: params['operatorRequired'] === 'true',
    };

    if (params['sortBy']) {
      this.selectedSort.set(params['sortBy']);
    }

    this.filters.set(newFilters);
  }

  public fetchResults(): void {
    this.loading.set(true);

    const f = this.filters();
    const queryParams: AssetQueryParams = {
      q: this.searchInput().trim() || undefined,
      category: f.category !== 'All' ? f.category : undefined,
      location: f.location !== 'All Locations' ? f.location : undefined,
      minPrice: f.minPrice,
      maxPrice: f.maxPrice,
      availableOnly: f.availableOnly,
      condition: f.condition !== 'All' ? f.condition : undefined,
      sortBy: this.selectedSort(),
    };

    this.error.set(null);
    this.assetService.getAssets(queryParams).subscribe({
      next: (res) => {
        let filtered = res.data;

        // In-memory filter enhancements for rating & operator
        if (f.minRating > 0) {
          filtered = filtered.filter((a) => a.rating >= f.minRating);
        }
        if (f.operatorRequired) {
          filtered = filtered.filter((a) => a.operatorProvided);
        }

        this.assets.set(filtered);
        this.totalResults.set(filtered.length);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Failed to load fleet catalog. Please check your network connection and retry.');
        this.loading.set(false);
      },
    });
  }

  public onSearchSubmit(): void {
    this.updateUrlParams();
  }

  public onFiltersChanged(newFilters: FilterState): void {
    this.filters.set(newFilters);
    this.updateUrlParams();
  }

  public onSortChanged(sortValue: any): void {
    this.selectedSort.set(sortValue);
    this.updateUrlParams();
  }

  public removeFilter(key: keyof FilterState, defaultValue: any): void {
    const current = { ...this.filters(), [key]: defaultValue };
    this.filters.set(current);
    this.updateUrlParams();
  }

  public clearSearch(): void {
    this.searchInput.set('');
    this.updateUrlParams();
  }

  public resetAll(): void {
    this.searchInput.set('');
    this.filters.set({
      category: 'All',
      location: 'All Locations',
      minPrice: undefined,
      maxPrice: undefined,
      availableOnly: false,
      condition: 'All',
      minRating: 0,
      operatorRequired: false,
    });
    this.selectedSort.set('recommended');
    this.router.navigate(['/assets']);
  }

  private updateUrlParams(): void {
    const f = this.filters();
    const qParams: any = {};

    if (this.searchInput().trim()) qParams.q = this.searchInput().trim();
    if (f.category !== 'All') qParams.category = f.category;
    if (f.location !== 'All Locations') qParams.location = f.location;
    if (f.minPrice !== undefined) qParams.minPrice = f.minPrice;
    if (f.maxPrice !== undefined) qParams.maxPrice = f.maxPrice;
    if (f.availableOnly) qParams.availableOnly = true;
    if (f.condition !== 'All') qParams.condition = f.condition;
    if (f.minRating > 0) qParams.minRating = f.minRating;
    if (f.operatorRequired) qParams.operatorRequired = true;
    if (this.selectedSort() !== 'recommended') qParams.sortBy = this.selectedSort();

    this.router.navigate(['/assets'], { queryParams: qParams });
  }

  public get activePills(): { label: string; remove: () => void }[] {
    const pills: { label: string; remove: () => void }[] = [];
    const f = this.filters();

    if (this.searchInput().trim()) {
      pills.push({
        label: `"${this.searchInput().trim()}"`,
        remove: () => this.clearSearch(),
      });
    }
    if (f.category !== 'All') {
      pills.push({
        label: `Category: ${f.category}`,
        remove: () => this.removeFilter('category', 'All'),
      });
    }
    if (f.location !== 'All Locations') {
      pills.push({
        label: `Location: ${f.location}`,
        remove: () => this.removeFilter('location', 'All Locations'),
      });
    }
    if (f.minPrice !== undefined || f.maxPrice !== undefined) {
      const min = f.minPrice ? `₹${f.minPrice}` : '₹0';
      const max = f.maxPrice ? `₹${f.maxPrice}` : 'Any';
      pills.push({
        label: `Rate: ${min} - ${max}`,
        remove: () => {
          this.filters.update((curr) => ({ ...curr, minPrice: undefined, maxPrice: undefined }));
          this.updateUrlParams();
        },
      });
    }
    if (f.availableOnly) {
      pills.push({
        label: 'Available Now',
        remove: () => this.removeFilter('availableOnly', false),
      });
    }
    if (f.condition !== 'All') {
      pills.push({
        label: `Condition: ${f.condition}`,
        remove: () => this.removeFilter('condition', 'All'),
      });
    }
    if (f.minRating > 0) {
      pills.push({
        label: `${f.minRating}★ & above`,
        remove: () => this.removeFilter('minRating', 0),
      });
    }
    if (f.operatorRequired) {
      pills.push({
        label: 'Operator Included',
        remove: () => this.removeFilter('operatorRequired', false),
      });
    }

    return pills;
  }

  @HostListener('window:keydown.escape')
  public handleEscape(): void {
    if (this.mobileFilterOpen()) {
      this.mobileFilterOpen.set(false);
    }
  }
}
