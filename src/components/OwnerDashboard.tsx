import React, { useState } from 'react';
import { Salon, Booking, Service } from '../types';
import { TrendingUp, Users, Calendar, DollarSign, Edit3, CheckCircle, XCircle, Plus, Star, Camera } from 'lucide-react';

interface OwnerDashboardProps {
  salons: Salon[];
  bookings: Booking[];
  onUpdateBookingStatus: (bookingId: string, status: 'confirmed' | 'rescheduled' | 'cancelled') => void;
  onUpdateServicePrice: (salonId: string, serviceId: string, newPrice: number) => void;
  onAddPortfolioPhoto: (salonId: string, beforeUrl: string, afterUrl: string, description: string) => void;
}

export default function OwnerDashboard({
  salons,
  bookings,
  onUpdateBookingStatus,
  onUpdateServicePrice,
  onAddPortfolioPhoto,
}: OwnerDashboardProps) {
  // Simulate owning the first salon by default, but let them choose if there are multiple.
  const [selectedSalonId, setSelectedSalonId] = useState<string>(salons[0]?.id || 'salon-1');
  const salon = salons.find((s) => s.id === selectedSalonId) || salons[0];

  // Portfolio form state
  const [beforePhoto, setBeforePhoto] = useState('');
  const [afterPhoto, setAfterPhoto] = useState('');
  const [photoDesc, setPhotoDesc] = useState('');
  const [showPhotoForm, setShowPhotoForm] = useState(false);

  // Price adjustment state
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null);
  const [newPriceVal, setNewPriceVal] = useState<number>(0);

  const salonBookings = bookings.filter((b) => b.salonId === salon.id);
  const activeBookings = salonBookings.filter((b) => b.status === 'confirmed');
  
  // Calculations
  const totalRevenue = salonBookings
    .filter((b) => b.status === 'confirmed')
    .reduce((sum, b) => sum + b.price, 0);

  const pendingRevenue = salonBookings
    .filter((b) => b.status === 'rescheduled')
    .reduce((sum, b) => sum + b.price, 0);

  const cancelCount = salonBookings.filter((b) => b.status === 'cancelled').length;

  const handlePriceSave = (serviceId: string) => {
    onUpdateServicePrice(salon.id, serviceId, newPriceVal);
    setEditingServiceId(null);
  };

  const handleAddPortfolioSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!beforePhoto || !afterPhoto || !photoDesc) return;
    onAddPortfolioPhoto(salon.id, beforePhoto, afterPhoto, photoDesc);
    setBeforePhoto('');
    setAfterPhoto('');
    setPhotoDesc('');
    setShowPhotoForm(false);
  };

  return (
    <div className="bg-gray-50/50 py-8 min-h-screen" id="owner-dashboard-container">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top bar with Salon Switcher */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <span className="text-[10px] font-bold text-pink-600 uppercase tracking-widest">Business Command Center</span>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-gray-900 font-sans mt-0.5">
              Salon Partner Hub
            </h1>
          </div>
          <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl border border-gray-100 shadow-xs">
            <span className="text-xs font-semibold text-gray-500">Managing:</span>
            <select
              value={selectedSalonId}
              onChange={(e) => setSelectedSalonId(e.target.value)}
              className="text-xs font-bold text-pink-600 bg-transparent focus:outline-none cursor-pointer"
            >
              {salons.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Analytics Bento Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
          
          {/* Card 1: Revenue */}
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Total Revenue</span>
              <h3 className="text-xl md:text-2xl font-black font-mono text-gray-900 mt-1">₹{totalRevenue}</h3>
              <span className="text-[10px] text-green-500 font-semibold flex items-center gap-1 mt-1">
                <TrendingUp className="h-3 w-3" /> +14.2% this week
              </span>
            </div>
            <div className="h-10 w-10 md:h-12 md:w-12 rounded-xl bg-pink-50 flex items-center justify-center text-pink-600">
              <DollarSign className="h-5 w-5 md:h-6 md:w-6" />
            </div>
          </div>

          {/* Card 2: Total Bookings */}
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Active Bookings</span>
              <h3 className="text-xl md:text-2xl font-black font-mono text-gray-900 mt-1">{activeBookings.length}</h3>
              <span className="text-[10px] text-gray-500 font-semibold block mt-1">
                {salonBookings.length} bookings lifetime
              </span>
            </div>
            <div className="h-10 w-10 md:h-12 md:w-12 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600">
              <Calendar className="h-5 w-5 md:h-6 md:w-6" />
            </div>
          </div>

          {/* Card 3: Rating */}
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Avg Rating</span>
              <h3 className="text-xl md:text-2xl font-black font-mono text-gray-900 mt-1">{salon.rating} / 5.0</h3>
              <span className="text-[10px] text-amber-500 font-semibold flex items-center gap-0.5 mt-1">
                <Star className="h-3 w-3 fill-amber-400 text-amber-400" /> {salon.reviewsCount} verified reviews
              </span>
            </div>
            <div className="h-10 w-10 md:h-12 md:w-12 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
              <Star className="h-5 w-5 md:h-6 md:w-6" />
            </div>
          </div>

          {/* Card 4: Cancellations */}
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Cancellations</span>
              <h3 className="text-xl md:text-2xl font-black font-mono text-gray-900 mt-1">{cancelCount}</h3>
              <span className="text-[10px] text-rose-500 font-semibold block mt-1">
                {cancelCount > 0 ? `${((cancelCount / salonBookings.length) * 100).toFixed(0)}% dropoff rate` : 'Perfect fulfillment!'}
              </span>
            </div>
            <div className="h-10 w-10 md:h-12 md:w-12 rounded-xl bg-rose-50 flex items-center justify-center text-rose-600">
              <XCircle className="h-5 w-5 md:h-6 md:w-6" />
            </div>
          </div>

        </div>

        {/* Dashboard Split Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* LEFT: Bookings list (8 cols) */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-xs p-6">
              <div className="flex items-center justify-between border-b border-gray-50 pb-3 mb-4">
                <h3 className="font-sans text-sm font-bold text-gray-900">Upcoming Appointments</h3>
                <span className="px-2.5 py-1 bg-pink-50 text-[10px] font-bold text-pink-700 rounded-full uppercase">Realtime Sync</span>
              </div>

              {salonBookings.length === 0 ? (
                <div className="text-center py-12">
                  <span className="text-2xl block mb-2">📅</span>
                  <p className="text-xs font-semibold text-gray-600">No client bookings yet.</p>
                  <p className="text-[11px] text-gray-400 mt-1">Bookings made in client portal will populate here instantly.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-gray-100 text-[10px] font-bold uppercase text-gray-400">
                        <th className="py-2.5">Client & Service</th>
                        <th className="py-2.5">Date & Time</th>
                        <th className="py-2.5">Stylist</th>
                        <th className="py-2.5">Amount</th>
                        <th className="py-2.5">Status</th>
                        <th className="py-2.5 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {salonBookings.map((b) => (
                        <tr key={b.id} className="text-xs">
                          <td className="py-3.5 pr-2">
                            <div className="font-bold text-gray-900">{b.clientName}</div>
                            <div className="text-[10px] text-pink-600 font-medium mt-0.5">{b.service.name}</div>
                            <div className="text-[10px] text-gray-400 font-mono mt-0.5">{b.clientPhone}</div>
                          </td>
                          <td className="py-3.5 pr-2">
                            <div className="font-semibold text-gray-700">{b.date}</div>
                            <div className="text-[10px] text-gray-400 mt-0.5">{b.time}</div>
                          </td>
                          <td className="py-3.5 text-gray-600">{b.stylist.name}</td>
                          <td className="py-3.5 font-bold font-mono text-gray-800">₹{b.price}</td>
                          <td className="py-3.5">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase inline-block ${
                              b.status === 'confirmed'
                                ? 'bg-green-50 text-green-700 border border-green-200/50'
                                : b.status === 'rescheduled'
                                ? 'bg-amber-50 text-amber-700 border border-amber-200/50'
                                : 'bg-rose-50 text-rose-700 border border-rose-200/50'
                            }`}>
                              {b.status}
                            </span>
                          </td>
                          <td className="py-3.5 text-right">
                            {b.status !== 'cancelled' && (
                              <div className="flex items-center justify-end gap-1.5">
                                {b.status !== 'confirmed' && (
                                  <button
                                    onClick={() => onUpdateBookingStatus(b.id, 'confirmed')}
                                    className="p-1 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                    title="Confirm"
                                  >
                                    <CheckCircle className="h-4 w-4" />
                                  </button>
                                )}
                                <button
                                  onClick={() => onUpdateBookingStatus(b.id, 'cancelled')}
                                  className="p-1 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                                  title="Cancel Appointment"
                                >
                                  <XCircle className="h-4 w-4" />
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Price list update Section */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-xs p-6">
              <h3 className="font-sans text-sm font-bold text-gray-900 border-b border-gray-50 pb-3 mb-4">
                Service Catalog & Price Updates
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {salon.services.map((serv) => (
                  <div key={serv.id} className="flex items-center justify-between p-3.5 rounded-xl border border-gray-50 hover:border-gray-100 bg-gray-50/50">
                    <div>
                      <h4 className="text-xs font-bold text-gray-800">{serv.name}</h4>
                      <span className="text-[10px] text-gray-400">{serv.duration} • Category: <span className="capitalize">{serv.category}</span></span>
                    </div>

                    <div className="flex items-center gap-2">
                      {editingServiceId === serv.id ? (
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-gray-500">₹</span>
                          <input
                            type="number"
                            value={newPriceVal}
                            onChange={(e) => setNewPriceVal(parseInt(e.target.value) || 0)}
                            className="w-16 bg-white border border-gray-200 text-xs text-gray-800 font-mono font-bold px-1.5 py-1 rounded-md focus:outline-none focus:border-pink-500"
                          />
                          <button
                            onClick={() => handlePriceSave(serv.id)}
                            className="px-2 py-1 bg-green-500 text-white text-[10px] font-bold rounded-md hover:bg-green-600"
                          >
                            Save
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black font-mono text-gray-800">₹{serv.price}</span>
                          <button
                            onClick={() => {
                              setEditingServiceId(serv.id);
                              setNewPriceVal(serv.price);
                            }}
                            className="p-1 text-gray-400 hover:text-pink-600 hover:bg-pink-50 rounded-md"
                          >
                            <Edit3 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT: Portfolio Upload and Analytics Detail (4 cols) */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            
            {/* Add Portfolio before/after work gallery */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-xs p-6">
              <div className="flex items-center justify-between border-b border-gray-50 pb-3 mb-4">
                <h3 className="font-sans text-sm font-bold text-gray-900 flex items-center gap-2">
                  <Camera className="h-4.5 w-4.5 text-pink-500" />
                  Portfolio Work Gallery
                </h3>
                <button
                  onClick={() => setShowPhotoForm(!showPhotoForm)}
                  className="p-1.5 bg-pink-50 hover:bg-pink-100 rounded-lg text-pink-600 transition-colors"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>

              {showPhotoForm && (
                <form onSubmit={handleAddPortfolioSubmit} className="flex flex-col gap-3 mb-4 bg-gray-50 p-3.5 rounded-xl border border-gray-100">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Before Image URL</label>
                    <input
                      type="url"
                      placeholder="https://..."
                      value={beforePhoto}
                      onChange={(e) => setBeforePhoto(e.target.value)}
                      className="w-full bg-white text-xs border border-gray-200 rounded-lg px-2.5 py-1.5 focus:outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">After Image URL</label>
                    <input
                      type="url"
                      placeholder="https://..."
                      value={afterPhoto}
                      onChange={(e) => setAfterPhoto(e.target.value)}
                      className="w-full bg-white text-xs border border-gray-200 rounded-lg px-2.5 py-1.5 focus:outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Work Description</label>
                    <input
                      type="text"
                      placeholder="e.g., Ice Blonde global color styling"
                      value={photoDesc}
                      onChange={(e) => setPhotoDesc(e.target.value)}
                      className="w-full bg-white text-xs border border-gray-200 rounded-lg px-2.5 py-1.5 focus:outline-none"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full py-1.5 bg-pink-500 hover:bg-pink-600 text-white font-bold text-xs rounded-lg shadow-sm"
                  >
                    Add to Showcase Gallery
                  </button>
                </form>
              )}

              <div className="flex flex-col gap-4">
                {salon.beforeAfter.length === 0 ? (
                  <p className="text-[11px] text-gray-400 text-center py-4">No before/after showpieces uploaded.</p>
                ) : (
                  salon.beforeAfter.map((work) => (
                    <div key={work.id} className="border border-gray-100 rounded-xl overflow-hidden shadow-xs">
                      <div className="grid grid-cols-2">
                        <div className="relative">
                          <img src={work.before} alt="Before" className="h-24 w-full object-cover" />
                          <span className="absolute bottom-1 left-1 bg-black/60 text-white text-[8px] px-1 rounded-sm uppercase tracking-wider">Before</span>
                        </div>
                        <div className="relative border-l border-white">
                          <img src={work.after} alt="After" className="h-24 w-full object-cover" />
                          <span className="absolute bottom-1 left-1 bg-pink-600 text-white text-[8px] px-1 rounded-sm uppercase tracking-wider">After</span>
                        </div>
                      </div>
                      <div className="p-2 bg-gray-50 text-[10px] text-gray-600 font-medium">
                        {work.description}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Staff list view */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-xs p-6">
              <h3 className="font-sans text-sm font-bold text-gray-900 border-b border-gray-50 pb-3 mb-3">
                Assigned Team Members ({salon.stylists.length})
              </h3>
              <div className="flex flex-col gap-3">
                {salon.stylists.map((styl) => (
                  <div key={styl.id} className="flex items-center gap-3 bg-gray-50/50 p-2.5 rounded-xl border border-gray-50">
                    <img src={styl.image} alt={styl.name} className="h-10 w-10 object-cover rounded-full border border-pink-100 shadow-xs" />
                    <div>
                      <h4 className="text-xs font-bold text-gray-800 leading-none">{styl.name}</h4>
                      <span className="text-[10px] text-gray-400 block mt-1">{styl.role}</span>
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {styl.specialties.map((spec, index) => (
                          <span key={index} className="text-[8px] bg-pink-50 border border-pink-100/30 text-pink-700 font-bold px-1 rounded-md">
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
    </div>
  );
}
