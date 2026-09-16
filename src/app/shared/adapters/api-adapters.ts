import { Asset, EquipmentStatus, EquipmentCondition, AssetSpecification } from '../models/asset.model';
import { Booking, BookingStatus } from '../models/booking.model';
import { User, UserRole } from '../models/user.model';

const DEFAULT_IMAGE =
  'https://images.unsplash.com/photo-1579829366248-204fe8413f31?auto=format&fit=crop&w=1200&q=80';

export function mapBackendCondition(condition?: string): EquipmentCondition {
  if (!condition) return 'Good (Fully Serviced)';
  const normalized = condition.toUpperCase();
  if (normalized.includes('EXCELLENT')) return 'Excellent (Like New)';
  if (normalized.includes('REBUILT')) return 'Certified Rebuilt';
  if (normalized.includes('WORKING')) return 'Working';
  return 'Good (Fully Serviced)';
}

export function mapFuelType(fuel?: string): 'Diesel' | 'Electric' | 'Hybrid' | 'Petrol' {
  if (!fuel) return 'Diesel';
  const f = fuel.toUpperCase();
  if (f === 'ELECTRIC') return 'Electric';
  if (f === 'HYBRID') return 'Hybrid';
  if (f === 'PETROL') return 'Petrol';
  return 'Diesel';
}

export function mapBackendAssetToUiAsset(raw: any): Asset {
  if (!raw) {
    throw new Error('Cannot map empty asset record');
  }

  // Handle images array (could be strings or { id, url, isCover } objects)
  let imageUrls: string[] = [];
  let coverUrl = DEFAULT_IMAGE;

  if (Array.isArray(raw.images) && raw.images.length > 0) {
    imageUrls = raw.images.map((img: any) => (typeof img === 'string' ? img : img.url)).filter(Boolean);
    const coverObj = raw.images.find((img: any) => typeof img === 'object' && img.isCover);
    coverUrl = coverObj ? coverObj.url : imageUrls[0] || DEFAULT_IMAGE;
  } else if (raw.coverImage) {
    imageUrls = [raw.coverImage];
    coverUrl = raw.coverImage;
  } else {
    imageUrls = [DEFAULT_IMAGE];
  }

  // Specifications
  const specs: AssetSpecification = {
    brand: raw.specification?.brand || 'Standard',
    model: raw.specification?.model || 'Industrial',
    year: raw.specification?.year || 2023,
    operatingWeight: raw.specification?.operatingWeight ? `${raw.specification.operatingWeight} kg` : undefined,
    enginePower: raw.specification?.enginePower ? `${raw.specification.enginePower} HP` : undefined,
    fuelType: mapFuelType(raw.specification?.fuelType),
    operatingHours: raw.specification?.operatingHours,
  };

  const statusLower = (raw.status ? raw.status.toLowerCase() : 'available') as EquipmentStatus;

  return {
    id: raw.id,
    title: raw.title || 'Heavy Equipment',
    name: raw.title || 'Heavy Equipment',
    category: raw.category?.name || 'Heavy Machinery',
    categorySlug: raw.category?.slug || (raw.category?.name || 'machinery').toLowerCase().replace(/\s+/g, '-'),
    tagline: raw.tagline || `${specs.brand} ${specs.model} - Available for lease`,
    description: raw.description || '',
    images: imageUrls,
    coverImage: coverUrl,
    pricePerDay: Number(raw.dailyRate ?? raw.pricePerDay) || 5000,
    pricePerWeek: Number(raw.weeklyRate ?? raw.pricePerWeek) || (Number(raw.dailyRate ?? 5000) * 6),
    securityDeposit: Number(raw.securityDeposit) || 20000,
    location: raw.location
      ? `${raw.location}, ${raw.city || ''}`.trim().replace(/,\s*$/, '')
      : (raw.city || 'Madhya Pradesh, India'),
    city: raw.city || 'Bhopal',
    state: raw.state || 'Madhya Pradesh',
    pinCode: raw.pinCode || '',
    rating: Number(raw.avgRating ?? raw.rating) || 5.0,
    reviewCount: Number(raw.totalReviews ?? raw.reviewCount) || 0,
    available: raw.status === 'AVAILABLE' || raw.available === true,
    status: statusLower === 'available' || statusLower === 'approved' ? 'available' : statusLower,
    condition: mapBackendCondition(raw.condition),
    featured: !!raw.featured,
    popular: !!raw.popular || Number(raw.avgRating ?? 0) >= 4.8,
    isNewArrival: !!raw.isNewArrival,
    specifications: specs,
    features: raw.features || ['Standard factory equipment', 'Inspected and certified', 'Telematics enabled'],
    rentalTerms: raw.rentalTerms || ['Minimum 2 days rental', 'Standard 8h daily shift standard', 'Transit insurance available'],
    owner: {
      id: raw.owner?.id || '201',
      name: raw.owner?.name || 'Verified Machinery Owner',
      companyName: raw.owner?.companyName || 'RentSphere Certified Fleet',
      verified: true,
      rating: 4.8,
      reviewCount: 20,
      completedRentals: 15,
      responseTime: 'Within 1 hour',
      memberSince: '2024',
      location: raw.city || 'Madhya Pradesh, India',
      phone: raw.owner?.phone,
    },
    reviews: Array.isArray(raw.reviews)
      ? raw.reviews.map((r: any) => ({
          id: r.id,
          authorName: r.authorName || r.renter?.name || 'Verified Contractor',
          rating: Number(r.rating) || 5,
          date: r.createdAt ? new Date(r.createdAt).toISOString().split('T')[0] : '2025-01-01',
          comment: r.comment || '',
        }))
      : undefined,
    createdAt: raw.createdAt ? new Date(raw.createdAt).toISOString().split('T')[0] : undefined,
    leaserId: raw.ownerId || raw.leaserId || raw.owner?.id,
  };
}

export function mapBackendBookingToUiBooking(raw: any): Booking {
  const statusMap: Record<string, BookingStatus> = {
    PENDING: 'pending',
    APPROVED: 'approved',
    ACTIVE: 'active',
    REJECTED: 'rejected',
    COMPLETED: 'completed',
    CANCELLED: 'cancelled',
  };

  return {
    id: raw.id,
    assetId: raw.assetId,
    asset: raw.asset ? mapBackendAssetToUiAsset(raw.asset) : undefined,
    renterId: raw.renterId || raw.renter?.id,
    renterName: raw.renter?.name,
    renterCompany: raw.renter?.companyName,
    renterPhone: raw.renter?.phone,
    startDate: raw.startDate ? new Date(raw.startDate).toISOString().split('T')[0] : '',
    endDate: raw.endDate ? new Date(raw.endDate).toISOString().split('T')[0] : '',
    durationDays: Number(raw.durationDays) || 1,
    dailyRate: Number(raw.dailyRate) || 5000,
    rentalSubtotal: Number(raw.rentalCost ?? raw.rentalSubtotal) || 5000,
    operatorRequired: !!raw.operatorRequired,
    operatorFee: Number(raw.operatorCost ?? raw.operatorFee) || 0,
    deliveryRequired: !!raw.deliveryRequired,
    deliveryFee: Number(raw.deliveryFee) || 0,
    securityDeposit: Number(raw.securityDeposit) || 0,
    estimatedTotal: Number(raw.totalCost ?? raw.estimatedTotal) || 5000,
    projectLocation: raw.deliveryAddress || raw.projectLocation || 'Job Site Location',
    projectDescription: raw.notes || raw.projectDescription,
    status: statusMap[raw.status] || (raw.status ? (raw.status.toLowerCase() as BookingStatus) : 'pending'),
    createdAt: raw.createdAt ? new Date(raw.createdAt).toISOString().split('T')[0] : '',
    rejectionReason: raw.rejectionReason,
  };
}

export function mapBackendUserToUiUser(raw: any, token?: string): User {
  const roleMap: Record<string, UserRole> = {
    ADMIN: 'admin',
    LEASER: 'leaser',
    RENTER: 'renter',
  };

  const role: UserRole = roleMap[raw.role] || (raw.role ? (raw.role.toLowerCase() as UserRole) : 'renter');

  return {
    id: raw.id,
    name: raw.name || 'User',
    email: raw.email || '',
    role,
    phone: raw.phone,
    companyName: raw.companyName,
    location: raw.city && raw.state ? `${raw.city}, ${raw.state}` : (raw.location || 'India'),
    verified: true,
    memberSince: raw.createdAt ? new Date(raw.createdAt).getFullYear().toString() : '2024',
    rating: 5.0,
    completedRentals: 0,
    token,
  };
}
