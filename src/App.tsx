import React, { useState, useEffect, useMemo, useRef } from 'react';
import { SALONS, OFFERS, CITIES, LOCALITIES_BY_CITY } from './data';
import { Salon, Booking, Service, Stylist, Offer, Review } from './types';
import Navbar from './components/Navbar';
import AiStylingLab from './components/AiStylingLab';
import OwnerDashboard from './components/OwnerDashboard';
import Chatbot from './components/Chatbot';
import MapMock from './components/MapMock';
import { 
  Search, SlidersHorizontal, Star, Sparkles, Phone, Clock, MapPin, 
  CheckCircle, Shield, CreditCard, ChevronRight, X, Calendar as CalendarIcon, 
  Tag, Scissors, Heart, Gift, Award, HelpCircle, Users, Smile, ChevronDown, Check, Trash2, Camera
} from 'lucide-react';

export default function App() {
  // Global States
  const [currentCity, setCurrentCity] = useState<string>('Mumbai');
  const [activeTab, setActiveTab] = useState<'explore' | 'ai_lab' | 'owner' | 'my_bookings'>('explore');
  const [salons, setSalons] = useState<Salon[]>(SALONS);
  const [loyaltyPoints, setLoyaltyPoints] = useState<number>(450);
  const [userName, setUserName] = useState<string>('Rohan Mehra');
  const [userPhone, setUserPhone] = useState<string>('+91 91234 56789');
  
  // Filtering states
  const [searchQuery, setSearchQuery] = useState('');
  const [searchInputText, setSearchInputText] = useState('');
  const [showRecs, setShowRecs] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowRecs(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Compute search recommendations
  const searchRecommendations = useMemo(() => {
    if (!searchInputText.trim()) return [];
    const query = searchInputText.toLowerCase().trim();
    const list: Array<{ type: 'city' | 'locality' | 'salon' | 'service'; label: string; value: string; subLabel?: string }> = [];

    // Match cities
    CITIES.forEach(city => {
      if (city.toLowerCase().includes(query)) {
        list.push({
          type: 'city',
          label: city,
          value: `Salons in ${city}`,
          subLabel: 'City'
        });
      }
    });

    // Match localities
    Object.entries(LOCALITIES_BY_CITY).forEach(([city, localities]) => {
      localities.forEach(loc => {
        if (loc.toLowerCase().includes(query)) {
          list.push({
            type: 'locality',
            label: `${loc}, ${city}`,
            value: `salons in ${loc}`,
            subLabel: 'Locality'
          });
        }
      });
    });

    // Match salons
    salons.forEach(s => {
      if (s.name.toLowerCase().includes(query)) {
        list.push({
          type: 'salon',
          label: s.name,
          value: s.name,
          subLabel: `${s.locality}, ${s.city}`
        });
      }
    });

    // Match services
    const addedServices = new Set<string>();
    salons.forEach(s => {
      s.services.forEach(serv => {
        const servNameLower = serv.name.toLowerCase();
        if (servNameLower.includes(query) && !addedServices.has(servNameLower)) {
          addedServices.add(servNameLower);
          list.push({
            type: 'service',
            label: serv.name,
            value: serv.name,
            subLabel: `Service in ${serv.category}`
          });
        }
      });
    });

    return list.slice(0, 6);
  }, [searchInputText, salons]);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [selectedGender, setSelectedGender] = useState<string>('all');
  const [maxBudget, setMaxBudget] = useState<number>(16000);
  const [minRating, setMinRating] = useState<number>(0);
  const [showFiltersDrawer, setShowFiltersDrawer] = useState(false);

  // Detail Modal
  const [selectedSalon, setSelectedSalon] = useState<Salon | null>(null);

  // Booking Wizard State
  const [bookingWizardOpen, setBookingWizardOpen] = useState(false);
  const [bookingSalon, setBookingSalon] = useState<Salon | null>(null);
  const [bookingService, setBookingService] = useState<Service | null>(null);
  const [bookingStylist, setBookingStylist] = useState<Stylist | null>(null);
  const [bookingDate, setBookingDate] = useState<string>('2026-06-25');
  const [bookingTime, setBookingTime] = useState<string>('11:00 AM');
  const [appliedCoupon, setAppliedCoupon] = useState<Offer | null>(null);
  const [couponCodeInput, setCouponCodeInput] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<string>('upi');
  const [checkoutStep, setCheckoutStep] = useState<1 | 2 | 3>(1); // 1: Stylist & DateTime, 2: Payment & Coupons, 3: Confirmation

  // Chatbot State
  const [chatbotOpen, setChatbotOpen] = useState(false);

  // Mock initial bookings for full owner dashboard visibility
  const [bookings, setBookings] = useState<Booking[]>([
    {
      id: 'book-mock-1',
      salonId: 'salon-1',
      salonName: 'Prism Hair & Nail Studio',
      salonAddress: 'Shop 4, Hill Road, Bandra West, Mumbai',
      service: {
        id: 's-101',
        name: 'Creative Haircut & Blow Dry',
        category: 'haircut',
        price: 999,
        duration: '45 mins',
        description: 'Personalized hairstyle tailored to your face shape, followed by professional blow dry.'
      },
      stylist: {
        id: 'st-101',
        name: 'Vikram Malhotra',
        role: 'Master Creative Hair Director',
        rating: 4.9,
        image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
        specialties: ['French Balayage', 'Pixie Cuts']
      },
      date: '2026-06-26',
      time: '02:00 PM',
      status: 'confirmed',
      paymentMethod: 'UPI (Paytm)',
      price: 999,
      pointsEarned: 100,
      clientName: 'Rohan Mehra',
      clientPhone: '+91 91234 56789'
    },
    {
      id: 'book-mock-2',
      salonId: 'salon-2',
      salonName: 'Glow & Co. Luxury Wellness Spa',
      salonAddress: '1024, 100 Feet Road, Indiranagar, Bangalore',
      service: {
        id: 's-201',
        name: 'Signature HydroPeel Hydrafacial',
        category: 'skincare',
        price: 2499,
        duration: '75 mins',
        description: 'Multi-step facial skin treatment to cleanse, exfoliate, extract, and infuse rich serums.'
      },
      stylist: {
        id: 'st-201',
        name: 'Elena Gilbert',
        role: 'Chief Medical Esthetician',
        rating: 5.0,
        image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80',
        specialties: ['Hydrafacials']
      },
      date: '2026-06-28',
      time: '11:00 AM',
      status: 'confirmed',
      paymentMethod: 'Credit Card',
      price: 2499,
      pointsEarned: 250,
      clientName: 'Rohan Mehra',
      clientPhone: '+91 91234 56789'
    }
  ]);

  // Review posting state
  const [reviewRating, setReviewRating] = useState<number>(5);
  const [reviewComment, setReviewComment] = useState<string>('');
  const [reviewService, setReviewService] = useState<string>('');
  const [reviewImage, setReviewImage] = useState<string | null>(null);

  // Trigger referral program alert
  const triggerReferralAlert = () => {
    alert(`🎉 Referral Code Shared!\nYour referral code is: GLAM-${userName.toUpperCase().replace(' ', '')}\n\nShare this code with friends. They get ₹150 off on their first booking, and you get 100 Loyalty Points when their session is completed!`);
  };

  // Filter salons based on city and criteria
  const filteredSalons = salons.filter((sal) => {
    // City Filter
    if (sal.city.toLowerCase() !== currentCity.toLowerCase()) return false;

    // Search query (pincode, name, locality)
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchName = sal.name.toLowerCase().includes(q);
      const matchLocality = sal.locality.toLowerCase().includes(q);
      const matchPincode = sal.pincode.includes(q);
      if (!matchName && !matchLocality && !matchPincode) return false;
    }

    // Category Filter
    if (activeCategory !== 'all') {
      const hasCategory = sal.services.some(s => s.category === activeCategory);
      if (!hasCategory) return false;
    }

    // Gender suitability Filter
    if (selectedGender !== 'all') {
      if (selectedGender === 'male' && sal.gender === 'female') return false;
      if (selectedGender === 'female' && sal.gender === 'male') return false;
    }

    // Budget range filter
    const minServicePrice = Math.min(...sal.services.map(s => s.price));
    if (minServicePrice > maxBudget) return false;

    // Rating filter
    if (sal.rating < minRating) return false;

    return true;
  });

  // Smart Search parser & Auto Scroll down to recommendations
  const handleSearch = (rawQuery: string) => {
    let finalQuery = rawQuery.trim();
    const q = finalQuery.toLowerCase();

    // Check for city specifications in the search query
    let foundCity: string | null = null;
    if (q.includes('mumbai')) foundCity = 'Mumbai';
    else if (q.includes('bangalore') || q.includes('bengaluru')) foundCity = 'Bangalore';
    else if (q.includes('delhi')) foundCity = 'Delhi';
    else if (q.includes('pune')) foundCity = 'Pune';

    if (foundCity) {
      setCurrentCity(foundCity);
      // If they asked for "all salons in [city]" or "salons in [city]", strip the city name and filler words
      const fillerWords = ['give', 'me', 'all', 'salons', 'salon', 'in', 'of', 'show', 'list', 'the', 'best', 'any', 'mumbai', 'bangalore', 'bengaluru', 'delhi', 'pune', 'my', 'city'];
      const words = q.split(/\s+/).filter(w => w.length > 0);
      const isOnlyFillerAndCity = words.every(w => fillerWords.includes(w));
      
      if (isOnlyFillerAndCity) {
        finalQuery = '';
        setSearchInputText('');
      } else {
        // Remove the city name and filler words from the query so it searches for actual services/localities
        // e.g., "haircut in mumbai" -> "haircut"
        const filteredWords = words.filter(w => !['mumbai', 'bangalore', 'bengaluru', 'delhi', 'pune', 'in', 'all', 'salons', 'salon'].includes(w));
        finalQuery = filteredWords.join(' ');
        setSearchInputText(finalQuery);
      }
    } else if (q.includes('my city') || q.includes('this city') || q.includes('current city')) {
      // Just clear search query filler to show all salons in current city
      const fillerWords = ['give', 'me', 'all', 'salons', 'salon', 'in', 'of', 'show', 'list', 'the', 'best', 'any', 'my', 'city', 'current', 'this'];
      const words = q.split(/\s+/).filter(w => w.length > 0);
      const isOnlyFiller = words.every(w => fillerWords.includes(w));
      if (isOnlyFiller) {
        finalQuery = '';
        setSearchInputText('');
      }
    } else {
      // Handle generic/conversational keywords even without city name, e.g. "give me all salons"
      const fillerWords = ['give', 'me', 'all', 'salons', 'salon', 'in', 'of', 'show', 'list', 'the', 'best', 'any', 'my', 'city'];
      const words = q.split(/\s+/).filter(w => w.length > 0);
      const isOnlyFiller = words.every(w => fillerWords.includes(w));
      if (isOnlyFiller) {
        finalQuery = '';
        setSearchInputText('');
      }
    }

    setSearchQuery(finalQuery);

    // Auto scroll down to recommendations
    setTimeout(() => {
      const element = document.getElementById('salon-listing-section');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };

  // Handle service price changes in dashboard
  const handleUpdateServicePrice = (salonId: string, serviceId: string, newPrice: number) => {
    setSalons(prev => prev.map(sal => {
      if (sal.id === salonId) {
        return {
          ...sal,
          services: sal.services.map(s => {
            if (s.id === serviceId) {
              return { ...s, price: newPrice };
            }
            return s;
          })
        };
      }
      return sal;
    }));
  };

  // Add portfolio photo in dashboard
  const handleAddPortfolioPhoto = (salonId: string, beforeUrl: string, afterUrl: string, description: string) => {
    setSalons(prev => prev.map(sal => {
      if (sal.id === salonId) {
        const newPortfolio = {
          id: `ba-${Date.now()}`,
          before: beforeUrl,
          after: afterUrl,
          description: description
        };
        return {
          ...sal,
          beforeAfter: [newPortfolio, ...sal.beforeAfter]
        };
      }
      return sal;
    }));
  };

  // Booking process flow
  const initiateBooking = (salon: Salon, service: Service) => {
    setBookingSalon(salon);
    setBookingService(service);
    // Default to first stylist or unisex
    setBookingStylist(salon.stylists[0] || null);
    setAppliedCoupon(null);
    setCouponCodeInput('');
    setCheckoutStep(1);
    setBookingWizardOpen(true);
  };

  const applyCouponCode = (code: string) => {
    const offer = OFFERS.find(o => o.code.toUpperCase() === code.trim().toUpperCase());
    if (offer) {
      if (bookingService && bookingService.price >= offer.minBookingValue) {
        setAppliedCoupon(offer);
        alert(`Success! Applied promo code "${offer.code}". Discount details updated.`);
      } else {
        alert(`Sorry! This coupon requires a minimum booking value of ₹${offer?.minBookingValue}.`);
      }
    } else {
      alert("Invalid Promo Code. Please try GLOWFIRST or HAIRMAGIC.");
    }
  };

  const handleConfirmBooking = () => {
    if (!bookingSalon || !bookingService || !bookingStylist) return;

    let finalPrice = bookingService.price;
    if (appliedCoupon) {
      if (appliedCoupon.type === 'percentage') {
        finalPrice = Math.round(finalPrice * (1 - appliedCoupon.discount / 100));
      } else {
        finalPrice = Math.max(0, finalPrice - appliedCoupon.discount);
      }
    }

    const calculatedPoints = Math.round(finalPrice * 0.1);

    const newReservation: Booking = {
      id: `book-${Date.now()}`,
      salonId: bookingSalon.id,
      salonName: bookingSalon.name,
      salonAddress: bookingSalon.address,
      service: bookingService,
      stylist: bookingStylist,
      date: bookingDate,
      time: bookingTime,
      status: 'confirmed',
      paymentMethod: paymentMethod.toUpperCase(),
      price: finalPrice,
      pointsEarned: calculatedPoints,
      clientName: userName,
      clientPhone: userPhone
    };

    setBookings([newReservation, ...bookings]);
    setLoyaltyPoints(prev => prev + calculatedPoints);
    setBookingWizardOpen(false);
    setSelectedSalon(null); // Close main profile
    
    // Auto redirect to My Bookings tab
    setActiveTab('my_bookings');
    alert(`🎉 Booking Confirmed Instantly!\n\nYour appointment is reserved for ${bookingDate} at ${bookingTime} at ${bookingSalon.name}. You earned ${calculatedPoints} Loyalty Reward Points!`);
  };

  // Manage Bookings
  const handleUpdateBookingStatus = (bookingId: string, status: 'confirmed' | 'rescheduled' | 'cancelled') => {
    setBookings(prev => prev.map(b => {
      if (b.id === bookingId) {
        return { ...b, status };
      }
      return b;
    }));
  };

  // Submit Review form
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setReviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePostReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSalon || !reviewComment.trim() || !reviewService) return;

    const newRev: Review = {
      id: `r-${Date.now()}`,
      userName: userName,
      userAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
      rating: reviewRating,
      date: new Date().toISOString().split('T')[0],
      comment: reviewComment,
      service: reviewService,
      photos: reviewImage ? [reviewImage] : undefined
    };

    // Update state
    setSalons(prev => prev.map(sal => {
      if (sal.id === selectedSalon.id) {
        const updatedReviews = [newRev, ...sal.reviews];
        const newRating = parseFloat(((sal.rating * sal.reviewsCount + reviewRating) / (sal.reviewsCount + 1)).toFixed(1));
        return {
          ...sal,
          reviews: updatedReviews,
          reviewsCount: sal.reviewsCount + 1,
          rating: newRating
        };
      }
      return sal;
    }));

    // Reset Form
    setReviewComment('');
    setReviewImage(null);
    setReviewService('');
    alert("💖 Thank you for sharing your experience! Your review has been verified and posted.");
  };

  // Quick category tags
  const categories = [
    { id: 'all', label: 'All Services', icon: Scissors },
    { id: 'haircut', label: 'Haircuts & Styling', icon: Scissors },
    { id: 'spa', label: 'Spa & Wellness', icon: Smile },
    { id: 'bridal_makeup', label: 'Bridal Makeup', icon: Sparkles },
    { id: 'nail_art', label: 'Nail Art & Extensions', icon: Sparkles },
    { id: 'skincare', label: 'Clinical Skincare', icon: Smile },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans text-gray-800 selection:bg-pink-100 selection:text-pink-900" id="app-root-container">
      
      {/* Top Banner Offer ticker */}
      <div className="bg-pink-600 text-white py-2 px-4 text-center text-xs font-semibold tracking-wide flex items-center justify-center gap-2">
        <Sparkles className="h-3.5 w-3.5 animate-pulse" />
        <span>First booking discount! Use coupon <strong>GLOWFIRST</strong> to get 20% off any premium service.</span>
      </div>

      <Navbar
        currentCity={currentCity}
        onCityChange={(city) => {
          setCurrentCity(city);
          setSelectedSalon(null);
        }}
        isOwnerMode={activeTab === 'owner'}
        onToggleMode={() => setActiveTab(activeTab === 'owner' ? 'explore' : 'owner')}
        loyaltyPoints={loyaltyPoints}
        userName={userName}
        onShowAiTab={() => setActiveTab('ai_lab')}
        onHomeClick={() => {
          setActiveTab('explore');
          setSelectedSalon(null);
        }}
        onOpenChat={() => setChatbotOpen(true)}
        favoriteSalonsCount={0}
      />

      {/* Main Switchboard */}
      {activeTab === 'ai_lab' && (
        <AiStylingLab currentCity={currentCity} onBack={() => setActiveTab('explore')} />
      )}

      {activeTab === 'owner' && (
        <OwnerDashboard
          salons={salons}
          bookings={bookings}
          onUpdateBookingStatus={handleUpdateBookingStatus}
          onUpdateServicePrice={handleUpdateServicePrice}
          onAddPortfolioPhoto={handleAddPortfolioPhoto}
        />
      )}

      {activeTab === 'my_bookings' && (
        <div className="mx-auto max-w-4xl px-4 py-8 w-full flex-1">
          <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-6">
            <div>
              <span className="text-[10px] font-bold text-pink-600 uppercase tracking-widest">Self Service Portal</span>
              <h1 className="text-2xl font-black text-gray-900 font-sans mt-0.5">My Salon Appointments</h1>
            </div>
            <button
              onClick={() => setActiveTab('explore')}
              className="px-4 py-2 rounded-xl bg-pink-500 hover:bg-pink-600 text-white font-bold text-xs"
            >
              Explore Salons
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Loyalty and refer status widget */}
            <div className="md:col-span-1 bg-white p-5 rounded-2xl border border-gray-100 shadow-xs flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600 shadow-xs">
                  <Award className="h-5 w-5 fill-current" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wide leading-none">Loyalty Club</h3>
                  <span className="text-xl font-black font-mono text-gray-800 mt-1 block">{loyaltyPoints} Points</span>
                </div>
              </div>
              <div className="p-3 bg-gray-50 rounded-xl text-[11px] text-gray-500 leading-normal">
                🥇 Platinum Member tier. Earn 10% points on every booking value. Redeem 100 points for ₹100 cash discount.
              </div>

              <div className="border-t border-gray-100 pt-3">
                <button
                  onClick={triggerReferralAlert}
                  className="w-full py-2.5 bg-pink-50 hover:bg-pink-100 border border-pink-200/50 text-pink-700 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5"
                >
                  <Gift className="h-4 w-4" />
                  Refer & Earn (₹150 Offer)
                </button>
              </div>
            </div>

            {/* List of user reservations */}
            <div className="md:col-span-2 flex flex-col gap-4">
              {bookings.length === 0 ? (
                <div className="bg-white p-12 rounded-2xl border border-gray-100 text-center">
                  <p className="text-sm font-semibold text-gray-600">No appointments scheduled.</p>
                  <p className="text-xs text-gray-400 mt-1">Book services with certified stylists to see details here.</p>
                </div>
              ) : (
                bookings.map((book) => (
                  <div key={book.id} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs flex flex-col sm:flex-row justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="h-12 w-12 rounded-xl bg-pink-50 flex items-center justify-center text-pink-500 shrink-0 border border-pink-100">
                        <Scissors className="h-6 w-6" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                            book.status === 'confirmed' 
                              ? 'bg-green-50 text-green-700 border border-green-200' 
                              : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}>
                            {book.status}
                          </span>
                          <span className="text-[10px] text-gray-400 font-mono">ID: {book.id}</span>
                        </div>
                        <h4 className="font-sans text-sm font-extrabold text-gray-900 mt-1 leading-tight">{book.salonName}</h4>
                        <p className="text-xs text-gray-500 font-semibold mt-1">{book.service.name} • <span className="text-pink-600">₹{book.price}</span></p>
                        
                        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 text-[11px] text-gray-400 font-medium">
                          <span className="flex items-center gap-1"><CalendarIcon className="h-3.5 w-3.5" /> {book.date} at {book.time}</span>
                          <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" /> Stylist: {book.stylist.name}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex sm:flex-col justify-end items-end gap-2 shrink-0">
                      {book.status === 'confirmed' ? (
                        <>
                          <button
                            onClick={() => {
                              const newTime = prompt("Reschedule: Enter preferred new slot (e.g., 03:30 PM)", book.time);
                              if (newTime) {
                                handleUpdateBookingStatus(book.id, 'rescheduled');
                                alert(`Appointment successfully rescheduled to ${newTime}!`);
                              }
                            }}
                            className="px-3 py-1.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-700 text-xs font-bold rounded-lg transition-colors"
                          >
                            Reschedule
                          </button>
                          <button
                            onClick={() => {
                              if (confirm("Are you sure you want to cancel this booking?")) {
                                handleUpdateBookingStatus(book.id, 'cancelled');
                              }
                            }}
                            className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 text-xs font-bold rounded-lg transition-colors"
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <span className="text-xs font-semibold text-gray-400">Archived Appointment</span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'explore' && !selectedSalon && (
        <>
          {/* Main Hero & Search Discover panel */}
          <div className="bg-white border-b border-gray-100 py-10 md:py-14" id="explore-hero-panel">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-gray-900 font-sans max-w-3xl mx-auto leading-tight">
                Premium Beauty & Styling Services, <span className="text-pink-600">Reserved instantly.</span>
              </h2>
              <p className="mt-3.5 text-sm sm:text-base text-gray-500 max-w-xl mx-auto leading-relaxed font-sans">
                Book top-rated, certified stylists and wellness clinics in your city. Verified review ratings and instant mobile bookings guaranteed.
              </p>

              {/* Advanced Search bar */}
              <div className="mt-8 max-w-2xl mx-auto bg-white rounded-2xl shadow-lg border border-gray-100 p-2 flex flex-col sm:flex-row gap-2" id="main-search-input-box">
                <div ref={searchRef} className="flex-1 flex items-center gap-2 px-3 relative">
                  <Search className="h-4.5 w-4.5 text-gray-400 shrink-0" />
                  <input
                    type="text"
                    placeholder="Search by salon name, locality, or pincode..."
                    value={searchInputText}
                    onChange={(e) => {
                      const val = e.target.value;
                      setSearchInputText(val);
                      if (!val.trim()) {
                        setSearchQuery('');
                        setShowRecs(false);
                      } else {
                        setShowRecs(true);
                      }
                    }}
                    onFocus={() => {
                      if (searchInputText.trim()) {
                        setShowRecs(true);
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleSearch(searchInputText);
                        setShowRecs(false);
                      }
                    }}
                    className="w-full text-xs text-gray-700 bg-transparent focus:outline-none py-2"
                  />

                  {/* Recommendations dropdown */}
                  {showRecs && searchRecommendations.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-3 bg-white rounded-xl border border-gray-100 shadow-xl overflow-hidden z-50 text-left">
                      <div className="px-3 py-2 bg-gray-50 border-b border-gray-100 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                        Suggested Searches
                      </div>
                      <div className="divide-y divide-gray-50 max-h-60 overflow-y-auto">
                        {searchRecommendations.map((rec, idx) => (
                          <button
                            key={idx}
                            onClick={() => {
                              setSearchInputText(rec.label);
                              handleSearch(rec.value);
                              setShowRecs(false);
                            }}
                            className="w-full px-4 py-3 hover:bg-pink-50/50 transition-colors flex items-center justify-between text-left group"
                          >
                            <div className="flex items-center gap-2.5">
                              {rec.type === 'city' || rec.type === 'locality' ? (
                                <MapPin className="h-4 w-4 text-pink-500 bg-pink-50 p-0.5 rounded-md shrink-0" />
                              ) : rec.type === 'service' ? (
                                <Scissors className="h-4 w-4 text-purple-500 bg-purple-50 p-0.5 rounded-md shrink-0" />
                              ) : (
                                <Heart className="h-4 w-4 text-rose-500 bg-rose-50 p-0.5 rounded-md shrink-0" />
                              )}
                              <div>
                                <p className="text-xs font-bold text-gray-800 group-hover:text-pink-600 transition-colors">
                                  {rec.label}
                                </p>
                                {rec.subLabel && (
                                  <p className="text-[10px] text-gray-400 font-medium">
                                    {rec.subLabel}
                                  </p>
                                )}
                              </div>
                            </div>
                            <ChevronRight className="h-3.5 w-3.5 text-gray-300 group-hover:text-pink-500 transition-transform group-hover:translate-x-0.5" />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-1.5 sm:border-l border-gray-100 pl-3 pr-2">
                  <SlidersHorizontal className="h-4 w-4 text-pink-500" />
                  <button
                    onClick={() => setShowFiltersDrawer(true)}
                    className="text-xs font-bold text-gray-600 hover:text-gray-900"
                  >
                    All Filters
                  </button>
                </div>

                <button
                  onClick={() => handleSearch(searchInputText)}
                  className="bg-pink-500 hover:bg-pink-600 text-white font-sans text-xs font-bold px-5 py-3.5 rounded-xl shrink-0 shadow-md shadow-pink-100"
                >
                  Discover
                </button>
              </div>

              {/* Loyalty discount voucher quick cards */}
              <div className="mt-8 flex flex-wrap justify-center gap-3">
                {OFFERS.map((coupon) => (
                  <div 
                    key={coupon.code}
                    onClick={() => {
                      setCouponCodeInput(coupon.code);
                      alert(`Promo code "${coupon.code}" copied! Apply it during your service booking checkouts.`);
                    }}
                    className="cursor-pointer bg-amber-50 hover:bg-amber-100 border border-amber-200/40 px-3.5 py-1.5 rounded-xl text-left flex items-center gap-3 transition-all hover:scale-102"
                  >
                    <Tag className="h-4 w-4 text-amber-600 fill-amber-500/20" />
                    <div>
                      <span className="text-[10px] font-black text-amber-800 font-mono block leading-none">{coupon.code}</span>
                      <span className="text-[9px] text-amber-600 mt-1 block font-medium">{coupon.description}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* AI Styling Lab Highlight Banner */}
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-5 mb-2">
            <div className="relative overflow-hidden bg-gradient-to-r from-indigo-950 via-purple-900 to-pink-700 rounded-2xl py-3 px-5 text-white shadow-md flex flex-col sm:flex-row items-center justify-between gap-4 border border-white/10">
              <div className="absolute top-0 right-0 w-32 h-32 bg-pink-500/10 rounded-full blur-xl"></div>
              
              <div className="relative flex items-center gap-3">
                <div className="h-8 w-8 bg-white/10 rounded-xl flex items-center justify-center text-amber-300 shrink-0">
                  <Sparkles className="h-4 w-4 animate-pulse" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="bg-amber-400 text-purple-950 text-[8px] font-black tracking-wider px-2 py-0.5 rounded-md uppercase">NEW AI LAB</span>
                    <h3 className="text-xs font-black tracking-tight font-sans">Try AI Face Shape & Hairstyle Makeover!</h3>
                  </div>
                  <p className="text-[10px] text-pink-100/75 mt-0.5 leading-snug hidden md:block">
                    Get an instant virtual haircut analysis and personal recommendations using our smart styling vision models.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setActiveTab('ai_lab')}
                className="relative bg-white hover:bg-pink-50 text-indigo-950 font-sans font-extrabold text-[10px] px-4 py-2 rounded-xl shrink-0 shadow-xs transition-all hover:scale-102 flex items-center gap-1.5 group cursor-pointer"
              >
                <span>Launch AI Makeover</span>
                <ChevronRight className="h-3 w-3 text-pink-600 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          </div>

          {/* Quick categories navigation rail */}
          <div className="border-b border-gray-100 bg-white sticky top-16 z-30 py-3" id="category-scroller-rail">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex items-center gap-2 overflow-x-auto scrollbar-none">
              {categories.map((cat) => {
                const isAct = activeCategory === cat.id;
                const Icon = cat.icon;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shrink-0 transition-all ${
                      isAct
                        ? 'bg-pink-500 text-white shadow-xs'
                        : 'bg-gray-50 border border-gray-100 text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    <span>{cat.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Map Simulation Panel */}
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-8">
            <MapMock
              currentCity={currentCity}
              salons={salons}
              selectedSalon={null}
              onSelectSalon={(sal) => {
                setSelectedSalon(sal);
              }}
            />
          </div>

          {/* Salon Listing Area */}
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 flex-1" id="salon-listing-section">
            <div className="flex items-center justify-between mb-6">
              <div>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Verified Directory</span>
                <h3 className="text-sm font-extrabold text-gray-900 mt-0.5">
                  Salons in {currentCity} ({filteredSalons.length} found)
                </h3>
              </div>
              {searchQuery || activeCategory !== 'all' || selectedGender !== 'all' ? (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSearchInputText('');
                    setActiveCategory('all');
                    setSelectedGender('all');
                    setMinRating(0);
                    setMaxBudget(16000);
                  }}
                  className="text-xs text-pink-600 font-bold hover:underline"
                >
                  Clear all filters
                </button>
              ) : null}
            </div>

            {filteredSalons.length === 0 ? (
              <div className="bg-white p-12 rounded-3xl border border-gray-100 text-center">
                <span className="text-3xl block mb-2">🔍</span>
                <p className="text-sm font-semibold text-gray-700">No salons match your search criteria.</p>
                <p className="text-xs text-gray-400 mt-1">Try switching categories, clearing search terms, or looking in a different city.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredSalons.map((sal) => (
                  <div
                    key={sal.id}
                    id={`salon-card-${sal.id}`}
                    className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-xs hover:shadow-md transition-shadow group flex flex-col justify-between"
                  >
                    <div>
                      {/* Image header with quick tags */}
                      <div className="relative h-48 w-full overflow-hidden bg-gray-100">
                        <img
                          src={sal.image}
                          alt={sal.name}
                          className="h-full w-full object-cover group-hover:scale-102 transition-transform duration-300"
                        />
                        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                          <span className="px-2.5 py-1 rounded-md bg-black/70 backdrop-blur-xs text-white text-[9px] font-bold uppercase tracking-wider">
                            {sal.gender === 'unisex' ? 'Unisex Salon' : sal.gender === 'male' ? 'Men Only' : 'Women Only'}
                          </span>
                        </div>
                        <div className="absolute top-3 right-3">
                          <span className="px-2 py-1 bg-pink-500 text-white rounded-md text-[10px] font-black font-mono shadow-xs flex items-center gap-0.5">
                            ★ {sal.rating}
                          </span>
                        </div>
                      </div>

                      {/* Info body */}
                      <div className="p-5">
                        <div className="flex items-center gap-1.5 text-pink-600 text-[10px] font-bold uppercase tracking-wide">
                          <MapPin className="h-3 w-3" />
                          <span>{sal.locality}, {sal.city}</span>
                          <span className="text-gray-300">•</span>
                          <span>{sal.distance}</span>
                        </div>

                        <h4 className="font-sans text-base font-extrabold text-gray-900 mt-1.5 group-hover:text-pink-600 transition-colors">
                          {sal.name}
                        </h4>

                        <p className="text-xs text-gray-500 mt-2 line-clamp-2 leading-relaxed">
                          {sal.description}
                        </p>

                        {/* Top services showcase pills */}
                        <div className="mt-4 flex flex-wrap gap-1">
                          {sal.services.slice(0, 3).map((serv) => (
                            <span key={serv.id} className="px-2 py-1 bg-gray-50 border border-gray-100 rounded-md text-[10px] text-gray-600 font-medium">
                              {serv.name.split(' & ')[0]} • <strong className="font-mono text-gray-800">₹{serv.price}</strong>
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Book / view catalog button */}
                    <div className="px-5 pb-5 pt-2 border-t border-gray-50 flex gap-2">
                      <button
                        onClick={() => setSelectedSalon(sal)}
                        className="flex-1 py-2.5 bg-gray-50 hover:bg-gray-100 text-gray-700 font-sans text-xs font-bold rounded-xl transition-all"
                      >
                        View Catalog
                      </button>
                      <button
                        onClick={() => initiateBooking(sal, sal.services[0])}
                        className="flex-1 py-2.5 bg-pink-500 hover:bg-pink-600 text-white font-sans text-xs font-bold rounded-xl shadow-xs transition-all"
                      >
                        Book Appointment
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* DETAILED SALON PROFILE VIEW */}
      {selectedSalon && (
        <div className="mx-auto max-w-6xl px-4 py-8 w-full flex-1" id="detailed-salon-profile-container">
          {/* Back button */}
          <button
            onClick={() => setSelectedSalon(null)}
            className="mb-4 inline-flex items-center gap-1 text-xs font-bold text-gray-500 hover:text-pink-600 transition-colors"
          >
            ← Back to Discovery List
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* LEFT COLUMN: Images, Services Catalog, Reviews (8 cols) */}
            <div className="lg:col-span-8 flex flex-col gap-8">
              
              {/* Profile Image & Header section */}
              <div className="bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-xs p-6">
                <div className="h-64 sm:h-80 w-full overflow-hidden rounded-2xl bg-gray-100 mb-6">
                  <img src={selectedSalon.image} alt={selectedSalon.name} className="h-full w-full object-cover" />
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 bg-pink-50 border border-pink-100/50 text-pink-700 font-bold text-[10px] rounded-sm uppercase tracking-wide">
                        {selectedSalon.gender}
                      </span>
                      <span className="text-xs text-gray-400 font-medium">Pincode: {selectedSalon.pincode}</span>
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-black text-gray-900 mt-2 font-sans leading-tight">{selectedSalon.name}</h1>
                    <p className="text-xs text-pink-600 font-bold mt-1.5 flex items-center gap-1">
                      <MapPin className="h-4.5 w-4.5" />
                      {selectedSalon.address}
                    </p>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100/60 text-center sm:text-right shrink-0">
                    <span className="text-2xl font-black text-gray-900 font-mono">★ {selectedSalon.rating}</span>
                    <span className="text-[10px] font-bold text-gray-400 block mt-1 uppercase tracking-wide">Based on {selectedSalon.reviewsCount} reviews</span>
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-gray-500 leading-relaxed mt-4 pt-4 border-t border-gray-50">
                  {selectedSalon.description}
                </p>
              </div>

              {/* Before/After Portfolio showcases */}
              {selectedSalon.beforeAfter.length > 0 && (
                <div className="bg-white rounded-3xl border border-gray-100 shadow-xs p-6">
                  <h3 className="font-sans text-sm font-extrabold text-gray-900 border-b border-gray-50 pb-3 mb-4">
                    Before/After Transformation Gallery
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {selectedSalon.beforeAfter.map((item) => (
                      <div key={item.id} className="border border-gray-100 rounded-2xl overflow-hidden shadow-xs">
                        <div className="grid grid-cols-2">
                          <div className="relative">
                            <img src={item.before} alt="Before" className="h-32 w-full object-cover" />
                            <span className="absolute bottom-2 left-2 bg-black/60 text-white text-[9px] px-1.5 py-0.5 rounded-sm uppercase tracking-wider font-bold">Before</span>
                          </div>
                          <div className="relative border-l border-white">
                            <img src={item.after} alt="After" className="h-32 w-full object-cover" />
                            <span className="absolute bottom-2 left-2 bg-pink-600 text-white text-[9px] px-1.5 py-0.5 rounded-sm uppercase tracking-wider font-bold">After</span>
                          </div>
                        </div>
                        <div className="p-3 bg-gray-50 text-xs text-gray-600 font-medium">
                          {item.description}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Services Offered Catalog Card */}
              <div className="bg-white rounded-3xl border border-gray-100 shadow-xs p-6">
                <h3 className="font-sans text-sm font-extrabold text-gray-900 border-b border-gray-50 pb-3 mb-4">
                  Treatment Services Catalog ({selectedSalon.services.length})
                </h3>
                <div className="flex flex-col gap-4">
                  {selectedSalon.services.map((serv) => (
                    <div
                      key={serv.id}
                      className="p-4 rounded-2xl bg-gray-50/50 border border-gray-50 hover:border-pink-100 transition-colors flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 bg-pink-50 border border-pink-100/30 text-pink-700 text-[9px] font-bold rounded-sm uppercase tracking-wider capitalize">
                            {serv.category}
                          </span>
                          <span className="text-[10px] text-gray-400 font-medium">{serv.duration} session</span>
                        </div>
                        <h4 className="font-sans text-xs sm:text-sm font-extrabold text-gray-900 mt-1.5">{serv.name}</h4>
                        <p className="text-xs text-gray-500 mt-1 leading-relaxed">{serv.description}</p>
                      </div>

                      <div className="flex items-center gap-4 shrink-0 self-end sm:self-auto">
                        <span className="text-base font-black font-mono text-gray-900">₹{serv.price}</span>
                        <button
                          onClick={() => initiateBooking(selectedSalon, serv)}
                          className="px-4 py-2 bg-pink-500 hover:bg-pink-600 text-white font-sans text-xs font-bold rounded-xl shadow-xs"
                        >
                          Book Now
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Write review & verified customer reviews panel */}
              <div className="bg-white rounded-3xl border border-gray-100 shadow-xs p-6">
                <h3 className="font-sans text-sm font-extrabold text-gray-900 border-b border-gray-50 pb-3 mb-6">
                  Verified Reviews & Ratings
                </h3>

                {/* Post New Review Form */}
                <form onSubmit={handlePostReview} className="bg-gray-50/50 p-4 rounded-2xl border border-gray-100 mb-8 flex flex-col gap-4">
                  <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wide">Write a Verified Customer Review</h4>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Select Treatment Received</label>
                      <select
                        value={reviewService}
                        onChange={(e) => setReviewService(e.target.value)}
                        className="w-full text-xs bg-white border border-gray-200 rounded-xl px-2.5 py-2"
                        required
                      >
                        <option value="">-- Choose service --</option>
                        {selectedSalon.services.map(s => (
                          <option key={s.id} value={s.name}>{s.name}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Star Rating</label>
                      <div className="flex items-center gap-1.5 mt-1">
                        {[1, 2, 3, 4, 5].map((stars) => (
                          <button
                            type="button"
                            key={stars}
                            onClick={() => setReviewRating(stars)}
                            className="p-0.5 text-amber-400 hover:scale-110 transition-transform"
                          >
                            <Star className={`h-6 w-6 ${reviewRating >= stars ? 'fill-amber-400' : 'text-gray-300'}`} />
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Upload Result Photo (Optional)</label>
                    <div className="flex items-center gap-3">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="text-xs text-gray-500"
                      />
                      {reviewImage && (
                        <img src={reviewImage} alt="Post-review" className="h-10 w-10 object-cover rounded-md border border-gray-200" />
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Your Detailed Feedback</label>
                    <textarea
                      placeholder="Share details about the clean environment, stylist hospitality, and satisfaction rate..."
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      className="w-full text-xs bg-white border border-gray-200 rounded-xl p-3 h-20 focus:outline-none"
                      required
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    className="py-2.5 px-4 bg-pink-500 hover:bg-pink-600 text-white font-bold text-xs rounded-xl self-end"
                  >
                    Post Review
                  </button>
                </form>

                <div className="flex flex-col gap-6">
                  {selectedSalon.reviews.map((rev) => (
                    <div key={rev.id} className="border-b border-gray-50 pb-5 last:border-0 last:pb-0">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <img src={rev.userAvatar} alt={rev.userName} className="h-8 w-8 object-cover rounded-full" />
                          <div>
                            <h5 className="text-xs font-bold text-gray-900">{rev.userName}</h5>
                            <span className="text-[10px] text-gray-400 font-mono mt-0.5 block">{rev.date}</span>
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="flex items-center gap-0.5 justify-end">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star key={i} className={`h-3 w-3 ${i < rev.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-200'}`} />
                            ))}
                          </div>
                          <span className="text-[10px] font-bold text-pink-600 mt-0.5 block capitalize">{rev.service}</span>
                        </div>
                      </div>

                      <p className="text-xs text-gray-600 mt-3 leading-relaxed pl-1">
                        {rev.comment}
                      </p>

                      {rev.photos && rev.photos.length > 0 && (
                        <div className="mt-3 flex gap-2 pl-1">
                          {rev.photos.map((ph, idx) => (
                            <img key={idx} src={ph} alt="Customer result" className="h-16 w-16 object-cover rounded-xl border border-gray-100 shadow-xs" />
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* RIGHT COLUMN: Business contact card & hours (4 cols) */}
            <div className="lg:col-span-4 flex flex-col gap-6">
              
              {/* Contact info widget */}
              <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-xs flex flex-col gap-4">
                <h3 className="font-sans text-sm font-extrabold text-gray-900 border-b border-gray-50 pb-2.5">
                  Business Directory
                </h3>

                <div className="flex items-start gap-3 text-xs text-gray-600">
                  <Clock className="h-4 w-4 text-pink-500 shrink-0 mt-0.5" />
                  <div>
                    <strong>Operating Hours:</strong>
                    <span className="block text-gray-500 mt-1 font-semibold">{selectedSalon.openingHours}</span>
                  </div>
                </div>

                <div className="flex items-start gap-3 text-xs text-gray-600">
                  <Phone className="h-4 w-4 text-pink-500 shrink-0 mt-0.5" />
                  <div>
                    <strong>Direct Hotline:</strong>
                    <span className="block text-gray-500 mt-1 font-mono font-bold">{selectedSalon.contact}</span>
                  </div>
                </div>

                <div className="flex items-start gap-3 text-xs text-gray-600">
                  <Shield className="h-4 w-4 text-pink-500 shrink-0 mt-0.5" />
                  <div>
                    <strong>Safety & Hygiene:</strong>
                    <span className="block text-gray-500 mt-1">✓ 100% disposable tools, UV sanitized scissors, and temperature tracked staff members.</span>
                  </div>
                </div>
              </div>

              {/* Staff roster list */}
              <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-xs">
                <h3 className="font-sans text-sm font-extrabold text-gray-900 border-b border-gray-50 pb-2.5 mb-4">
                  Professional Stylists
                </h3>
                <div className="flex flex-col gap-3">
                  {selectedSalon.stylists.map((styl) => (
                    <div key={styl.id} className="flex items-center gap-3 p-2 bg-gray-50/50 rounded-xl border border-gray-50">
                      <img src={styl.image} alt={styl.name} className="h-10 w-10 object-cover rounded-full border border-pink-100 shadow-xs" />
                      <div>
                        <h4 className="text-xs font-bold text-gray-800 leading-none">{styl.name}</h4>
                        <span className="text-[10px] text-gray-400 block mt-1">{styl.role}</span>
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          {styl.specialties.map((spec, idx) => (
                            <span key={idx} className="text-[8px] bg-pink-50 border border-pink-100/30 text-pink-700 font-bold px-1 rounded-md">
                              {spec}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

          </div>
        </div>
      )}

      {/* FILTER ACCORDION SIDE DRAWER */}
      {showFiltersDrawer && (
        <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-xs" onClick={() => setShowFiltersDrawer(false)}></div>
          
          <div className="relative w-full max-w-sm bg-white h-full shadow-2xl p-6 flex flex-col justify-between overflow-y-auto">
            <div>
              <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-6">
                <h3 className="font-sans text-sm font-bold text-gray-900">Custom Filtering Controls</h3>
                <button onClick={() => setShowFiltersDrawer(false)} className="p-1 rounded-full hover:bg-gray-50">
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Gender filter */}
              <div className="mb-6">
                <label className="block text-xs font-semibold text-gray-600 mb-2">Service Target Audience</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'all', label: 'All Unisex' },
                    { id: 'female', label: 'Ladies only' },
                    { id: 'male', label: 'Gentlemen' }
                  ].map((g) => (
                    <button
                      key={g.id}
                      onClick={() => setSelectedGender(g.id)}
                      className={`py-1.5 text-xs font-medium rounded-lg border ${
                        selectedGender === g.id
                          ? 'bg-pink-50 border-pink-300 text-pink-700 font-semibold'
                          : 'bg-white border-gray-200 text-gray-600'
                      }`}
                    >
                      {g.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price range budget slider */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold text-gray-600">Max Budget Cap</label>
                  <span className="text-xs font-bold text-pink-600 font-mono">₹{maxBudget}</span>
                </div>
                <input
                  type="range"
                  min="300"
                  max="16000"
                  step="100"
                  value={maxBudget}
                  onChange={(e) => setMaxBudget(parseInt(e.target.value))}
                  className="w-full accent-pink-500 cursor-pointer"
                />
              </div>

              {/* Minimum star rating filter */}
              <div className="mb-6">
                <label className="block text-xs font-semibold text-gray-600 mb-2">Min Customer Rating</label>
                <div className="flex items-center gap-1">
                  {[0, 4.5, 4.7, 4.8].map((rating) => (
                    <button
                      key={rating}
                      onClick={() => setMinRating(rating)}
                      className={`px-3 py-1.5 text-[10px] font-bold rounded-lg border ${
                        minRating === rating
                          ? 'bg-pink-50 border-pink-300 text-pink-700'
                          : 'bg-white border-gray-200 text-gray-600'
                      }`}
                    >
                      {rating === 0 ? 'Any Star' : `★ ${rating}+`}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100 flex gap-2">
              <button
                onClick={() => {
                  setSelectedGender('all');
                  setMaxBudget(16000);
                  setMinRating(0);
                }}
                className="flex-1 py-3 border border-gray-200 rounded-xl text-xs font-bold text-gray-600"
              >
                Reset Default
              </button>
              <button
                onClick={() => setShowFiltersDrawer(false)}
                className="flex-1 py-3 bg-pink-500 hover:bg-pink-600 text-white rounded-xl text-xs font-bold"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ONLINE BOOKING WIZARD MODAL */}
      {bookingWizardOpen && bookingSalon && bookingService && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-xs" onClick={() => setBookingWizardOpen(false)}></div>
          
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="bg-pink-600 text-white p-4 sm:p-5 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-pink-100 uppercase tracking-widest leading-none">Instant Reservation</span>
                <h3 className="font-sans text-sm sm:text-base font-extrabold mt-1">Book: {bookingService.name}</h3>
              </div>
              <button onClick={() => setBookingWizardOpen(false)} className="text-white hover:bg-white/10 p-1.5 rounded-full">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Stepper indicator */}
            <div className="bg-pink-50 px-5 py-2.5 flex items-center justify-between border-b border-pink-100/30 text-[10px] font-bold text-pink-700 uppercase">
              <span className={checkoutStep >= 1 ? 'text-pink-700' : 'text-gray-400'}>1. Team & Schedule</span>
              <ChevronRight className="h-3.5 w-3.5 text-pink-400" />
              <span className={checkoutStep >= 2 ? 'text-pink-700' : 'text-gray-400'}>2. Coupons & Payment</span>
              <ChevronRight className="h-3.5 w-3.5 text-pink-400" />
              <span className={checkoutStep >= 3 ? 'text-pink-700' : 'text-gray-400'}>3. Verify Confirmation</span>
            </div>

            {/* Content box */}
            <div className="flex-1 overflow-y-auto p-5 sm:p-6 flex flex-col gap-5">
              
              {/* STEP 1: Select Stylist, Select Date & Time */}
              {checkoutStep === 1 && (
                <div className="flex flex-col gap-4">
                  {/* Select Stylist */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-2">Choose Stylist Specialist</label>
                    <div className="grid grid-cols-2 gap-3">
                      {bookingSalon.stylists.map((st) => (
                        <div
                          key={st.id}
                          onClick={() => setBookingStylist(st)}
                          className={`cursor-pointer p-3 rounded-2xl border transition-all flex items-center gap-3 ${
                            bookingStylist?.id === st.id
                              ? 'bg-pink-50 border-pink-300 ring-2 ring-pink-500/10'
                              : 'bg-white border-gray-100 hover:border-gray-200'
                          }`}
                        >
                          <img src={st.image} alt={st.name} className="h-8 w-8 object-cover rounded-full border border-pink-100" />
                          <div>
                            <h4 className="text-xs font-bold text-gray-800 leading-none">{st.name}</h4>
                            <span className="text-[9px] text-gray-400 block mt-1">{st.role.split(' ')[0]}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Choose date */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-2">Choose Appointment Date</label>
                    <input
                      type="date"
                      value={bookingDate}
                      onChange={(e) => setBookingDate(e.target.value)}
                      min="2026-06-24"
                      max="2026-07-10"
                      className="w-full text-xs bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 font-bold text-gray-700"
                    />
                  </div>

                  {/* Choose Time slot */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-2">Available Time Slots</label>
                    <div className="grid grid-cols-3 gap-2">
                      {['09:30 AM', '11:00 AM', '12:30 PM', '02:00 PM', '03:30 PM', '05:00 PM', '06:30 PM', '08:00 PM'].map((slot) => (
                        <button
                          key={slot}
                          onClick={() => setBookingTime(slot)}
                          className={`py-2 text-[10px] font-bold rounded-xl border ${
                            bookingTime === slot
                              ? 'bg-pink-500 border-pink-500 text-white'
                              : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                          }`}
                        >
                          {slot}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 2: Coupons & Secure Payment */}
              {checkoutStep === 2 && (
                <div className="flex flex-col gap-4">
                  
                  {/* Coupon Area */}
                  <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                    <label className="block text-xs font-semibold text-gray-600 mb-2">Have a Referral or Discount Coupon?</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="e.g. GLOWFIRST"
                        value={couponCodeInput}
                        onChange={(e) => setCouponCodeInput(e.target.value)}
                        className="flex-1 bg-white border border-gray-200 rounded-xl px-3 py-1.5 text-xs font-bold tracking-wide uppercase"
                      />
                      <button
                        onClick={() => applyCouponCode(couponCodeInput)}
                        className="px-3.5 py-1.5 bg-pink-500 hover:bg-pink-600 text-white font-bold text-xs rounded-xl"
                      >
                        Apply
                      </button>
                    </div>

                    {appliedCoupon && (
                      <span className="text-[10px] font-semibold text-green-600 block mt-2">
                        ✓ Promo code Applied: {appliedCoupon.discount}{appliedCoupon.type === 'percentage' ? '%' : '₹'} off discount!
                      </span>
                    )}
                  </div>

                  {/* Payment Method selector */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-2">Select Secure Checkout Payment Method</label>
                    <div className="flex flex-col gap-2">
                      {[
                        { id: 'upi', label: 'UPI (Paytm / GPay / PhonePe)', desc: 'Instant smartphone checkout' },
                        { id: 'card', label: 'Credit or Debit Card', desc: 'Securely routed terminal' },
                        { id: 'wallet', label: 'Digital Wallet', desc: 'Amazon Pay, MobiKwik' },
                        { id: 'cash', label: 'Pay Cash at Salon Desk', desc: 'Settle directly post-treatment' },
                      ].map((pay) => (
                        <div
                          key={pay.id}
                          onClick={() => setPaymentMethod(pay.id)}
                          className={`cursor-pointer p-3 rounded-2xl border transition-all flex items-center justify-between ${
                            paymentMethod === pay.id
                              ? 'bg-pink-50 border-pink-300'
                              : 'bg-white border-gray-100 hover:border-gray-200'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <CreditCard className="h-4.5 w-4.5 text-pink-500" />
                            <div>
                              <h4 className="text-xs font-bold text-gray-800 leading-none">{pay.label}</h4>
                              <span className="text-[9px] text-gray-400 block mt-1">{pay.desc}</span>
                            </div>
                          </div>
                          {paymentMethod === pay.id && (
                            <Check className="h-4.5 w-4.5 text-pink-500 shrink-0" />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              )}

              {/* STEP 3: Verify & Confirm Summary */}
              {checkoutStep === 3 && (
                <div className="flex flex-col gap-4">
                  <div className="bg-pink-50 p-4 rounded-2xl border border-pink-100/50 flex flex-col gap-3">
                    <span className="text-[10px] font-bold text-pink-700 uppercase tracking-wider block">Verification Summary</span>
                    
                    <div className="flex justify-between text-xs border-b border-pink-200/25 pb-2">
                      <span className="text-pink-600 font-semibold">Treatment Service:</span>
                      <span className="font-extrabold text-gray-800">{bookingService.name}</span>
                    </div>

                    <div className="flex justify-between text-xs border-b border-pink-200/25 pb-2">
                      <span className="text-pink-600 font-semibold">Assigned Specialist:</span>
                      <span className="font-extrabold text-gray-800">{bookingStylist.name}</span>
                    </div>

                    <div className="flex justify-between text-xs border-b border-pink-200/25 pb-2">
                      <span className="text-pink-600 font-semibold">Reservation Slot:</span>
                      <span className="font-extrabold text-gray-800">{bookingDate} at {bookingTime}</span>
                    </div>

                    <div className="flex justify-between text-xs pt-1 font-bold">
                      <span className="text-pink-700 font-black">Grand Total:</span>
                      <span className="text-lg font-black text-pink-700 font-mono">
                        ₹{appliedCoupon
                          ? appliedCoupon.type === 'percentage'
                            ? Math.round(bookingService.price * (1 - appliedCoupon.discount / 100))
                            : Math.max(0, bookingService.price - appliedCoupon.discount)
                          : bookingService.price}
                      </span>
                    </div>
                  </div>

                  {/* Client form detail validation */}
                  <div className="flex flex-col gap-3 bg-gray-50 p-4 rounded-2xl border border-gray-100">
                    <span className="text-[10px] font-bold text-gray-500 uppercase block">Recipient Details</span>
                    <div>
                      <label className="block text-[9px] font-bold text-gray-400 uppercase mb-1">Your Full Name</label>
                      <input
                        type="text"
                        value={userName}
                        onChange={(e) => setUserName(e.target.value)}
                        className="w-full bg-white border border-gray-200 rounded-xl px-2.5 py-1.5 text-xs font-bold text-gray-800"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] font-bold text-gray-400 uppercase mb-1">WhatsApp Mobile Contact</label>
                      <input
                        type="text"
                        value={userPhone}
                        onChange={(e) => setUserPhone(e.target.value)}
                        className="w-full bg-white border border-gray-200 rounded-xl px-2.5 py-1.5 text-xs font-bold text-gray-800"
                        required
                      />
                    </div>
                  </div>
                </div>
              )}

            </div>

            {/* Footer controls */}
            <div className="p-4 sm:p-5 border-t border-gray-100 bg-white flex gap-3">
              {checkoutStep > 1 ? (
                <button
                  onClick={() => setCheckoutStep((prev) => (prev - 1) as any)}
                  className="flex-1 py-3 bg-gray-50 hover:bg-gray-100 text-gray-600 font-bold text-xs rounded-xl"
                >
                  Previous Block
                </button>
              ) : (
                <button
                  onClick={() => setBookingWizardOpen(false)}
                  className="flex-1 py-3 bg-gray-50 hover:bg-gray-100 text-gray-600 font-bold text-xs rounded-xl"
                >
                  Dismiss
                </button>
              )}

              {checkoutStep < 3 ? (
                <button
                  onClick={() => setCheckoutStep((prev) => (prev + 1) as any)}
                  className="flex-1 py-3 bg-pink-500 hover:bg-pink-600 text-white font-bold text-xs rounded-xl"
                >
                  Continue Checkout
                </button>
              ) : (
                <button
                  onClick={handleConfirmBooking}
                  className="flex-1 py-3 bg-pink-500 hover:bg-pink-600 text-white font-bold text-xs rounded-xl shadow-md"
                >
                  Instant Book Appointment
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Floating AI GlamBot assistant toggle */}
      {!chatbotOpen && (
        <button
          onClick={() => setChatbotOpen(true)}
          className="fixed bottom-6 right-6 z-40 bg-pink-500 hover:bg-pink-600 text-white h-14 w-14 rounded-full shadow-2xl flex items-center justify-center transition-all hover:scale-105 active:scale-95 animate-bounce"
          title="Open AI Booking Assistant"
          id="global-floating-chatbot-trigger"
        >
          <Sparkles className="h-6 w-6 text-white fill-white/10" />
        </button>
      )}

      {/* Embedded Chatbot overlay */}
      <Chatbot
        currentCity={currentCity}
        isOpen={chatbotOpen}
        onClose={() => setChatbotOpen(false)}
        userName={userName}
      />

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 py-8 text-center text-xs text-gray-400 mt-auto">
        <div className="mx-auto max-w-7xl px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="h-6 w-6 bg-pink-500 rounded-lg flex items-center justify-center text-white text-[10px] font-black">G</span>
            <span className="font-sans font-extrabold text-gray-700">GlamSpot Marketplace</span>
          </div>
          <p>© 2026 GlamSpot India Salon Services Ltd. Fully automated smart city booking system.</p>
          <div className="flex items-center gap-4">
            <button onClick={() => setActiveTab('owner')} className="hover:text-pink-600">Register Salon</button>
            <button onClick={triggerReferralAlert} className="hover:text-pink-600">Refer & Earn</button>
          </div>
        </div>
      </footer>

    </div>
  );
}
