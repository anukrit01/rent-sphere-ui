import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MaterialModule } from '../../../shared/material/material-module';
import { PageContainerComponent } from '../../../core/components/page-container/page-container';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge';
import { AuthService } from '../../../services/auth';
import { AssetService } from '../../../services/asset';
import { NotificationService } from '../../../core/services/notification.service';
import { EquipmentCondition, EquipmentStatus, Asset } from '../../../shared/models/asset.model';
import { MARKETPLACE_CATEGORIES, MARKETPLACE_LOCATIONS } from '../../../shared/data/marketplace.data';
import { Category, LocationHub } from '../../../shared/models/category.model';

export interface WizardStep {
  number: number;
  id: string;
  title: string;
  subtitle: string;
  icon: string;
}

export interface EquipmentFormData {
  // Step 1: Basic Info
  title: string;
  category: string;
  tagline: string;
  description: string;
  condition: EquipmentCondition;

  // Step 2: Specifications
  brand: string;
  model: string;
  year: number;
  operatingHours: number;
  capacity: string;
  operatingWeight: string;
  enginePower: string;
  fuelType: 'Diesel' | 'Electric' | 'Hybrid' | 'Petrol';
  features: string[];

  // Step 3: Pricing & Terms
  pricePerDay: number;
  pricePerWeek: number;
  autoCalcWeekly: boolean;
  securityDeposit: number;
  minimumRentalDays: number;
  operatorProvided: boolean;
  operatorDailyFee: number;
  deliveryAvailable: boolean;
  deliveryFee: number;
  rentalTerms: string[];

  // Step 4: Availability & Schedule
  availableFrom: string;
  availableUntil: string;
  blockedDates: string[];
  advanceNoticeHours: number;

  // Step 5: Location & Dispatch Yard
  city: string;
  state: string;
  pinCode: string;
  yardAddress: string;
  accessNotes: string;

  // Step 6: Images
  images: string[];
  coverImageIndex: number;
}

@Component({
  selector: 'app-asset-form',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    FormsModule,
    MaterialModule,
    PageContainerComponent,
    StatusBadgeComponent,
  ],
  templateUrl: './asset-form.html',
  styleUrl: './asset-form.scss',
})
export class AssetForm implements OnInit {
  private router = inject(Router);
  private auth = inject(AuthService);
  private assetService = inject(AssetService);
  private notification = inject(NotificationService);

  // Stepper metadata
  public steps: WizardStep[] = [
    { number: 1, id: 'basic', title: 'Basic Info', subtitle: 'Category & Overview', icon: 'info' },
    { number: 2, id: 'specs', title: 'Specifications', subtitle: 'Technical Details', icon: 'tune' },
    { number: 3, id: 'pricing', title: 'Pricing & Terms', subtitle: 'Rental Rates & Escrow', icon: 'payments' },
    { number: 4, id: 'availability', title: 'Availability', subtitle: 'Calendar & Notice', icon: 'calendar_month' },
    { number: 5, id: 'location', title: 'Location', subtitle: 'Dispatch Yard Hub', icon: 'location_on' },
    { number: 6, id: 'images', title: 'Photos', subtitle: 'Fleet Gallery', icon: 'photo_library' },
    { number: 7, id: 'review', title: 'Review & Submit', subtitle: 'Admin Approval', icon: 'fact_check' },
  ];

  // State Signals
  public currentStep = signal<number>(1);
  public completedSteps = signal<Set<number>>(new Set());
  public submitting = signal<boolean>(false);
  public isSubmitted = signal<boolean>(false);
  public submittedAsset = signal<Asset | null>(null);

  // Categories and Locations
  public categories: Category[] = MARKETPLACE_CATEGORIES;
  public locationHubs: LocationHub[] = MARKETPLACE_LOCATIONS.filter((l) => l.id !== 'loc-all');

  // Input helpers
  public customFeature = '';
  public customTerm = '';
  public newBlockedDate = '';

  // Breadcrumbs
  public breadcrumbs = [
    { label: 'Marketplace', url: '/' },
    { label: 'Fleet Owner Portal', url: '/dashboard/leaser' },
    { label: 'List Equipment' },
  ];

  // Condition options
  public conditionOptions: { value: EquipmentCondition; label: string; desc: string }[] = [
    {
      value: 'Excellent (Like New)',
      label: 'Excellent (Like New)',
      desc: 'Under 2 years old, pristine working condition, manufacturer warranty or OEM maintained.',
    },
    {
      value: 'Good (Fully Serviced)',
      label: 'Good (Fully Serviced)',
      desc: 'Regularly serviced, verified hydraulic & powertrain integrity, field ready.',
    },
    {
      value: 'Certified Rebuilt',
      label: 'Certified Rebuilt',
      desc: 'Factory or certified third-party overhauled components with diagnostic inspection report.',
    },
    {
      value: 'Working',
      label: 'Working Condition',
      desc: 'Operational for general duty construction, cosmetic wear consistent with age.',
    },
  ];

  // Fuel Types
  public fuelTypes: ('Diesel' | 'Electric' | 'Hybrid' | 'Petrol')[] = [
    'Diesel',
    'Electric',
    'Hybrid',
    'Petrol',
  ];

  // Form State
  public formData: EquipmentFormData = {
    // Step 1
    title: '',
    category: 'Excavators',
    tagline: '',
    description: '',
    condition: 'Good (Fully Serviced)',

    // Step 2
    brand: '',
    model: '',
    year: new Date().getFullYear() - 1,
    operatingHours: 1200,
    capacity: '',
    operatingWeight: '',
    enginePower: '',
    fuelType: 'Diesel',
    features: [
      'Climate-Controlled ROPS/FOPS Operator Cab',
      'Integrated GPS Telematics & Remote Monitoring',
      'Hydraulic Quick Coupler for Attachments',
      'Standard Digging Bucket Included',
    ],

    // Step 3
    pricePerDay: 8500,
    pricePerWeek: 51000,
    autoCalcWeekly: true,
    securityDeposit: 30000,
    minimumRentalDays: 2,
    operatorProvided: true,
    operatorDailyFee: 800,
    deliveryAvailable: true,
    deliveryFee: 3500,
    rentalTerms: [
      'Standard 8-hour operating shift per rental day',
      'Fuel supplied by renter on certified hour-meter basis',
      'Security deposit refundable within 24 hours of site inspection',
      'Routine maintenance and oil change included by leaser',
    ],

    // Step 4
    availableFrom: new Date().toISOString().split('T')[0],
    availableUntil: '',
    blockedDates: ['2026-10-15 to 2026-10-18 (Routine Hydraulic Service)'],
    advanceNoticeHours: 24,

    // Step 5
    city: 'Indore',
    state: 'Madhya Pradesh',
    pinCode: '452010',
    yardAddress: 'Plot 18-B, Sanwer Road Industrial Area, Sector C',
    accessNotes: 'Direct access for low-bed heavy transport trailers; 24x7 gate security and overhead crane available.',

    // Step 6
    images: [
      'https://images.unsplash.com/photo-1579829366248-204fe8413f31?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1581094288338-2314dddb7ece?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1200&q=80',
    ],
    coverImageIndex: 0,
  };

  // Sample presets by category
  private categorySampleImages: Record<string, string[]> = {
    Excavators: [
      'https://images.unsplash.com/photo-1579829366248-204fe8413f31?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1581094288338-2314dddb7ece?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1200&q=80',
    ],
    'Backhoe & Wheel Loaders': [
      'https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1616401784845-180882ba9ba8?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1200&q=80',
    ],
    'Cranes & Lifters': [
      'https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1508873696983-2df5293cb32b?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1581094288338-2314dddb7ece?auto=format&fit=crop&w=1200&q=80',
    ],
    'Diesel Generators': [
      'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=1200&q=80',
    ],
    'Forklifts & Reach Trucks': [
      'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1553413077-190dd305871c?auto=format&fit=crop&w=1200&q=80',
    ],
    'Compactors & Rollers': [
      'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=80',
    ],
    Bulldozers: [
      'https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1579829366248-204fe8413f31?auto=format&fit=crop&w=1200&q=80',
    ],
    'Concrete Mixers & Pumps': [
      'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1581094288338-2314dddb7ece?auto=format&fit=crop&w=1200&q=80',
    ],
  };

  ngOnInit(): void {
    // Attempt restoring draft from localStorage
    this.restoreDraft();
  }

  // Pre-fill with a realistic template for instant demonstration
  public loadTemplateData(categoryName?: string): void {
    const cat = categoryName || this.formData.category || 'Excavators';
    this.formData.category = cat;

    if (cat === 'Excavators') {
      this.formData.title = 'Komatsu PC210-10M0 Heavy Crawler Excavator';
      this.formData.tagline = '21-Ton Hydraulic Excavator with Heavy Duty Rock Breaker Piping';
      this.formData.description =
        'High efficiency Tier 3 hydraulic excavator suitable for mass earthwork, trenching, road grading, and quarry operations. Features hydraulic pilot controls, factory auxiliary piping, eco-gauge fuel economy monitoring, and reinforced heavy-duty undercarriage.';
      this.formData.brand = 'Komatsu';
      this.formData.model = 'PC210-10M0';
      this.formData.year = 2023;
      this.formData.capacity = '1.2 m³ Heavy Rock Bucket';
      this.formData.operatingWeight = '21,200 kg';
      this.formData.enginePower = '165 HP @ 2000 rpm';
      this.formData.operatingHours = 1450;
      this.formData.pricePerDay = 9500;
      this.formData.securityDeposit = 35000;
    } else if (cat.includes('Loader')) {
      this.formData.title = 'JCB 3DX Super EcoXcellence Backhoe Loader';
      this.formData.tagline = 'Heavy Duty 4WD Backhoe with 1.1 m³ Shovel & Extendable Dipper';
      this.formData.description =
        'Versatile construction workhorse powered by JCB ecoMAX engine. Equipped with heavy-duty front shovel, standard 0.26 m³ excavator bucket, auxiliary hydraulic circuit, and LiveLink telematic security system.';
      this.formData.brand = 'JCB';
      this.formData.model = '3DX Super EcoXcellence';
      this.formData.year = 2023;
      this.formData.capacity = '1.1 m³ Shovel / 0.26 m³ Hoe';
      this.formData.operatingWeight = '7,640 kg';
      this.formData.enginePower = '76 HP';
      this.formData.operatingHours = 980;
      this.formData.pricePerDay = 6200;
      this.formData.securityDeposit = 25000;
    } else if (cat.includes('Crane')) {
      this.formData.title = 'ACE 15XF Hydra Pick and Carry Mobile Crane';
      this.formData.tagline = '15-Ton Heavy Duty Hydra Crane with 4-Section Slotted Boom';
      this.formData.description =
        'Heavy-duty industrial yard and construction crane with 15-tonne safe working load capacity. Features slotted boom with fly jib option, certified safe load indicator (SLI), and all-terrain traction.';
      this.formData.brand = 'Action Construction Equipment (ACE)';
      this.formData.model = '15XF Hydra';
      this.formData.year = 2022;
      this.formData.capacity = '15 Ton Safe Load';
      this.formData.operatingWeight = '14,200 kg';
      this.formData.enginePower = '101 HP @ 2200 rpm';
      this.formData.operatingHours = 1800;
      this.formData.pricePerDay = 7500;
      this.formData.securityDeposit = 30000;
    } else if (cat.includes('Generator')) {
      this.formData.title = 'Cummins 125 kVA Silent Acoustic Diesel Generator';
      this.formData.tagline = 'Continuous Prime Power DG Set with CPCB-II Soundproof Acoustic Canopy';
      this.formData.description =
        'Industrial grade silent diesel generator with Cummins 6BTA5.9 engine and Stamford alternator. CPCB-II certified acoustic enclosure (< 75 dB at 1m), electronic governor, and AMF control panel.';
      this.formData.brand = 'Cummins India';
      this.formData.model = 'C125D5P Prime';
      this.formData.year = 2023;
      this.formData.capacity = '125 kVA / 100 kWe';
      this.formData.operatingWeight = '2,450 kg';
      this.formData.enginePower = '153 HP';
      this.formData.operatingHours = 840;
      this.formData.pricePerDay = 4500;
      this.formData.securityDeposit = 20000;
    } else {
      this.formData.title = `${this.formData.category} Industrial Unit`;
      this.formData.brand = 'Standard OEM';
      this.formData.model = 'Series 2024';
    }

    this.onPriceChange();
    this.loadCategoryPresetImages();
    this.notification.info(`Loaded sample configuration for ${this.formData.category}.`);
  }

  // Auto calculate weekly pricing
  public onPriceChange(): void {
    if (this.formData.autoCalcWeekly && this.formData.pricePerDay) {
      // 6 days charged for 7 days (14.3% discount)
      this.formData.pricePerWeek = Math.round(this.formData.pricePerDay * 6);
    }
  }

  public toggleAutoCalcWeekly(): void {
    this.formData.autoCalcWeekly = !this.formData.autoCalcWeekly;
    if (this.formData.autoCalcWeekly) {
      this.onPriceChange();
    }
  }

  // Location Hub selected
  public onHubSelected(hubCity: string): void {
    const hub = this.locationHubs.find((h) => h.city === hubCity);
    if (hub) {
      this.formData.city = hub.city;
      this.formData.state = hub.state;
    }
  }

  // Features manager
  public addFeature(): void {
    const feat = this.customFeature.trim();
    if (feat && !this.formData.features.includes(feat)) {
      this.formData.features.push(feat);
      this.customFeature = '';
    }
  }

  public removeFeature(index: number): void {
    this.formData.features.splice(index, 1);
  }

  // Terms manager
  public addTerm(): void {
    const term = this.customTerm.trim();
    if (term && !this.formData.rentalTerms.includes(term)) {
      this.formData.rentalTerms.push(term);
      this.customTerm = '';
    }
  }

  public removeTerm(index: number): void {
    this.formData.rentalTerms.splice(index, 1);
  }

  // Blocked dates manager
  public addBlockedDate(): void {
    const val = this.newBlockedDate.trim();
    if (val && !this.formData.blockedDates.includes(val)) {
      this.formData.blockedDates.push(val);
      this.newBlockedDate = '';
    }
  }

  public removeBlockedDate(index: number): void {
    this.formData.blockedDates.splice(index, 1);
  }

  // Images Management
  public onFileInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    Array.from(input.files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        if (result) {
          this.formData.images.push(result);
        }
      };
      reader.readAsDataURL(file);
    });

    this.notification.success(`Added ${input.files.length} image(s).`);
    input.value = '';
  }

  public loadCategoryPresetImages(): void {
    const presets = this.categorySampleImages[this.formData.category] || this.categorySampleImages['Excavators'];
    this.formData.images = [...presets];
    this.formData.coverImageIndex = 0;
  }

  public setCoverImage(index: number): void {
    if (index >= 0 && index < this.formData.images.length) {
      this.formData.coverImageIndex = index;
      this.notification.info('Updated cover photo.');
    }
  }

  public moveImage(index: number, direction: 'left' | 'right'): void {
    const targetIdx = direction === 'left' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= this.formData.images.length) return;

    // Track cover index shift
    const isCover = this.formData.coverImageIndex === index;
    const isTargetCover = this.formData.coverImageIndex === targetIdx;

    const temp = this.formData.images[index];
    this.formData.images[index] = this.formData.images[targetIdx];
    this.formData.images[targetIdx] = temp;

    if (isCover) {
      this.formData.coverImageIndex = targetIdx;
    } else if (isTargetCover) {
      this.formData.coverImageIndex = index;
    }
  }

  public removeImage(index: number): void {
    if (this.formData.images.length <= 1) {
      this.notification.warning('You must keep at least one machinery image.');
      return;
    }
    this.formData.images.splice(index, 1);
    if (this.formData.coverImageIndex >= this.formData.images.length) {
      this.formData.coverImageIndex = 0;
    }
  }

  public getCoverImageUrl(): string {
    if (this.formData.images.length === 0) {
      return 'https://images.unsplash.com/photo-1579829366248-204fe8413f31?auto=format&fit=crop&w=1200&q=80';
    }
    return this.formData.images[this.formData.coverImageIndex] || this.formData.images[0];
  }

  // Step Validation
  public validateCurrentStep(): boolean {
    const step = this.currentStep();
    if (step === 1) {
      if (!this.formData.title.trim()) {
        this.notification.warning('Please enter an equipment title / listing name.');
        return false;
      }
      if (!this.formData.category) {
        this.notification.warning('Please select an equipment category.');
        return false;
      }
      if (!this.formData.description.trim() || this.formData.description.trim().length < 20) {
        this.notification.warning('Please write a brief description (at least 20 characters).');
        return false;
      }
    } else if (step === 2) {
      if (!this.formData.brand.trim()) {
        this.notification.warning('Please specify the equipment manufacturer brand.');
        return false;
      }
      if (!this.formData.model.trim()) {
        this.notification.warning('Please specify the model designation.');
        return false;
      }
      if (!this.formData.year || this.formData.year < 1990 || this.formData.year > new Date().getFullYear() + 1) {
        this.notification.warning('Please specify a valid manufacturing year.');
        return false;
      }
    } else if (step === 3) {
      if (!this.formData.pricePerDay || this.formData.pricePerDay <= 0) {
        this.notification.warning('Please enter a valid daily rental rate.');
        return false;
      }
      if (this.formData.securityDeposit === undefined || this.formData.securityDeposit < 0) {
        this.notification.warning('Please specify the security deposit amount.');
        return false;
      }
    } else if (step === 4) {
      if (!this.formData.availableFrom) {
        this.notification.warning('Please select an availability start date.');
        return false;
      }
    } else if (step === 5) {
      if (!this.formData.city.trim() || !this.formData.state.trim()) {
        this.notification.warning('Please specify the city and state where the equipment is located.');
        return false;
      }
      if (!this.formData.pinCode.trim()) {
        this.notification.warning('Please provide a postal PIN code.');
        return false;
      }
    } else if (step === 6) {
      if (this.formData.images.length === 0) {
        this.notification.warning('Please upload or select at least one photo of your equipment.');
        return false;
      }
    }
    return true;
  }

  // Navigation
  public goToStep(stepNumber: number): void {
    // Can always go backwards or to completed steps
    if (stepNumber < this.currentStep() || this.completedSteps().has(stepNumber - 1)) {
      this.currentStep.set(stepNumber);
      this.saveDraft();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  public nextStep(): void {
    if (!this.validateCurrentStep()) return;

    this.completedSteps.update((set) => {
      const updated = new Set(set);
      updated.add(this.currentStep());
      return updated;
    });

    this.saveDraft();

    if (this.currentStep() < 7) {
      this.currentStep.update((s) => s + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  public prevStep(): void {
    if (this.currentStep() > 1) {
      this.currentStep.update((s) => s - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  // Draft save & restore
  public saveDraft(): void {
    try {
      localStorage.setItem('rentsphere_listing_draft', JSON.stringify(this.formData));
    } catch {
      // Ignore
    }
  }

  public restoreDraft(): void {
    try {
      const saved = localStorage.getItem('rentsphere_listing_draft');
      if (saved) {
        const parsed = JSON.parse(saved);
        this.formData = { ...this.formData, ...parsed };
      }
    } catch {
      // Ignore
    }

    // Default template if blank
    if (!this.formData.title) {
      this.loadTemplateData('Excavators');
    }
  }

  public clearDraft(): void {
    try {
      localStorage.removeItem('rentsphere_listing_draft');
      this.notification.info('Draft cleared.');
      this.loadTemplateData('Excavators');
      this.currentStep.set(1);
    } catch {
      // Ignore
    }
  }

  // Final Submission
  public submitListing(): void {
    if (!this.validateCurrentStep()) return;

    this.submitting.set(true);

    const currentUser = this.auth.currentUserSignal();

    const newAssetPayload: Partial<Asset> = {
      title: this.formData.title,
      name: this.formData.title,
      category: this.formData.category,
      categorySlug: this.formData.category.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      tagline: this.formData.tagline || `${this.formData.brand} ${this.formData.model} heavy equipment`,
      description: this.formData.description,
      images: [...this.formData.images],
      coverImage: this.getCoverImageUrl(),
      pricePerDay: Number(this.formData.pricePerDay),
      pricePerWeek: Number(this.formData.pricePerWeek),
      securityDeposit: Number(this.formData.securityDeposit),
      location: `${this.formData.city}, ${this.formData.state}`,
      city: this.formData.city,
      state: this.formData.state,
      pinCode: this.formData.pinCode,
      rating: 5.0,
      reviewCount: 0,
      available: false, // will become true upon admin approval
      status: 'pending', // IMPORTANT: Requires admin approval
      condition: this.formData.condition,
      specifications: {
        brand: this.formData.brand,
        model: this.formData.model,
        year: Number(this.formData.year),
        operatingHours: Number(this.formData.operatingHours),
        capacity: this.formData.capacity || undefined,
        operatingWeight: this.formData.operatingWeight || undefined,
        enginePower: this.formData.enginePower || undefined,
        fuelType: this.formData.fuelType,
      },
      features: [...this.formData.features],
      rentalTerms: [...this.formData.rentalTerms],
      minimumRentalDays: this.formData.minimumRentalDays,
      operatorProvided: this.formData.operatorProvided,
      deliveryAvailable: this.formData.deliveryAvailable,
      deliveryFee: this.formData.deliveryFee,
      owner: {
        id: currentUser?.id || 201,
        name: currentUser?.name || 'Vikram Patel',
        companyName: currentUser?.companyName || 'Shree Krishna Heavy Earthmovers',
        verified: currentUser?.verified ?? true,
        rating: currentUser?.rating || 4.9,
        reviewCount: currentUser?.completedRentals || 42,
        completedRentals: currentUser?.completedRentals || 42,
        responseTime: 'Within 1 hour',
        memberSince: currentUser?.memberSince || '2023',
        location: `${this.formData.city}, ${this.formData.state}`,
        phone: currentUser?.phone || '+91 94250 87654',
      },
      createdAt: new Date().toISOString().split('T')[0],
      isNewArrival: true,
      popular: false,
      featured: false,
    };

    this.assetService.createAsset(newAssetPayload).subscribe({
      next: (created) => {
        this.submitting.set(false);
        this.submittedAsset.set(created);
        this.isSubmitted.set(true);

        // Clear local draft upon successful submission
        try {
          localStorage.removeItem('rentsphere_listing_draft');
        } catch {
          // ignore
        }

        // Exact prompt notification:
        this.notification.success('Equipment listing submitted for approval.');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      },
      error: (err) => {
        this.submitting.set(false);
        this.notification.error('Unable to submit listing. Please try again.');
        console.error('Listing creation error:', err);
      },
    });
  }

  // Helper for restarting or listing another
  public listAnother(): void {
    this.isSubmitted.set(false);
    this.submittedAsset.set(null);
    this.completedSteps.set(new Set());
    this.loadTemplateData('Backhoe & Wheel Loaders');
    this.currentStep.set(1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
