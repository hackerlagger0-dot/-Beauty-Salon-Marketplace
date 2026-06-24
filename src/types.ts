export interface Service {
  id: string;
  name: string;
  category: 'haircut' | 'bridal_makeup' | 'spa' | 'nail_art' | 'skincare';
  price: number;
  duration: string;
  description: string;
}

export interface Stylist {
  id: string;
  name: string;
  role: string;
  rating: number;
  image: string;
  specialties: string[];
}

export interface BeforeAfter {
  id: string;
  before: string;
  after: string;
  description: string;
}

export interface Review {
  id: string;
  userName: string;
  userAvatar: string;
  rating: number;
  date: string;
  comment: string;
  service: string;
  photos?: string[];
}

export interface Salon {
  id: string;
  name: string;
  city: string;
  locality: string;
  pincode: string;
  rating: number;
  reviewsCount: number;
  gender: 'unisex' | 'male' | 'female';
  image: string;
  description: string;
  address: string;
  distance: string; // e.g., "1.2 km"
  coordinates: { lat: number; lng: number };
  openingHours: string;
  contact: string;
  services: Service[];
  stylists: Stylist[];
  beforeAfter: BeforeAfter[];
  reviews: Review[];
  featured?: boolean;
}

export interface Booking {
  id: string;
  salonId: string;
  salonName: string;
  salonAddress: string;
  service: Service;
  stylist: Stylist;
  date: string;
  time: string;
  status: 'confirmed' | 'rescheduled' | 'cancelled';
  paymentMethod: string;
  price: number;
  pointsEarned: number;
  clientName: string;
  clientPhone: string;
}

export interface Offer {
  code: string;
  discount: number; // percentage or flat amount
  type: 'percentage' | 'flat';
  description: string;
  expiry: string;
  minBookingValue: number;
}
