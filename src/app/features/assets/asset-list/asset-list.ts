import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MaterialModule } from '../../../shared/material/material-module';
import { AssetService } from '../../../services/asset';
import { AuthService } from '../../../services/auth';
import { Asset } from '../../../shared/models/asset.model';
import { Category, LocationHub } from '../../../shared/models/category.model';
import { MARKETPLACE_CATEGORIES, MARKETPLACE_LOCATIONS } from '../../../shared/data/marketplace.data';
import { AssetCardComponent } from '../../../shared/components/asset-card/asset-card';
import { CategoryCardComponent } from '../../../shared/components/category-card/category-card';

@Component({
  selector: 'app-asset-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    FormsModule,
    MaterialModule,
    AssetCardComponent,
    CategoryCardComponent,
  ],
  templateUrl: './asset-list.html',
  styleUrl: './asset-list.scss',
})
export class AssetListComponent implements OnInit {
  private assetService = inject(AssetService);
  public auth = inject(AuthService);
  private router = inject(Router);

  // Data
  public popularAssets = signal<Asset[]>([]);
  public newArrivals = signal<Asset[]>([]);
  public categories: Category[] = MARKETPLACE_CATEGORIES;
  public locations: LocationHub[] = MARKETPLACE_LOCATIONS;

  // Hero Search Form State
  public heroQuery = signal('');
  public heroCategory = signal('All');
  public heroLocation = signal('All Locations');
  public loading = signal(true);

  // Trust Statistics
  public trustStats = [
    { value: '500+', label: 'Verified Machines', icon: 'precision_manufacturing' },
    { value: '18+', label: 'Industrial Hubs', icon: 'location_city' },
    { value: '99.2%', label: 'On-Time Dispatch', icon: 'schedule' },
    { value: '₹0', label: 'Hidden Fees', icon: 'verified' },
  ];

  // How It Works Steps
  public howItWorksSteps = [
    {
      step: '01',
      title: 'Find Equipment',
      description: 'Search certified excavators, cranes, generators and loaders by location and specifications.',
      icon: 'search',
    },
    {
      step: '02',
      title: 'Check Availability',
      description: 'Select project dates, review transparent daily rates, and choose optional certified operator support.',
      icon: 'calendar_month',
    },
    {
      step: '03',
      title: 'Request Rental',
      description: 'Submit your rental request. Security deposit is held securely in escrow until site deployment.',
      icon: 'verified_user',
    },
    {
      step: '04',
      title: 'Get to Work',
      description: 'Machinery dispatched to your project site with pre-inspection checklist and active telematics.',
      icon: 'engineering',
    },
  ];

  // Why RentSphere Value Pillars
  public whyRentSpherePillars = [
    {
      title: '100% Verified Fleet Owners',
      description: 'Every equipment owner is KYC verified and machinery undergoes periodic fitness & telematics audits.',
      icon: 'gpp_good',
    },
    {
      title: 'Transparent Daily & Weekly Rates',
      description: 'All-inclusive GST pricing with clear security deposits. Zero middlemen markups or surprise charges.',
      icon: 'payments',
    },
    {
      title: 'Flexible Deployment Durations',
      description: 'Rent for 2 days or 12 months with seamless digital extensions and automated utilization reports.',
      icon: 'sync_alt',
    },
    {
      title: 'Local Regional Fleet Availability',
      description: 'Deploy equipment from regional hubs across Bhopal, Indore, Jabalpur, Gwalior, Delhi, Pune, and more.',
      icon: 'near_me',
    },
    {
      title: 'Certified Operator Network',
      description: 'Request skilled, certified heavy machinery operators alongside equipment for uninterrupted site work.',
      icon: 'badge',
    },
    {
      title: '24/7 On-Site Logistics Assistance',
      description: 'Dedicated fleet support team managing low-bed trailer logistics, mobilization, and rapid breakdown response.',
      icon: 'support_agent',
    },
  ];

  ngOnInit(): void {
    this.loadMarketplaceData();
  }

  private loadMarketplaceData(): void {
    this.loading.set(true);
    this.assetService.getPopularAssets().subscribe((popular) => {
      this.popularAssets.set(popular);
    });

    this.assetService.getNewArrivals().subscribe((news) => {
      this.newArrivals.set(news);
      this.loading.set(false);
    });
  }

  public onHeroSearch(): void {
    const queryParams: any = {};
    if (this.heroQuery().trim()) {
      queryParams.q = this.heroQuery().trim();
    }
    if (this.heroCategory() && this.heroCategory() !== 'All') {
      queryParams.category = this.heroCategory();
    }
    if (this.heroLocation() && this.heroLocation() !== 'All Locations') {
      queryParams.location = this.heroLocation();
    }

    this.router.navigate(['/assets'], { queryParams });
  }

  public navigateCategory(categoryName: string): void {
    this.router.navigate(['/assets'], { queryParams: { category: categoryName } });
  }
}
