import React, { useState } from 'react';
import { Salon } from '../types';
import { MapPin, Navigation, Clock, Eye } from 'lucide-react';
import { motion } from 'motion/react';

interface MapMockProps {
  currentCity: string;
  salons: Salon[];
  selectedSalon: Salon | null;
  onSelectSalon: (salon: Salon) => void;
}

export default function MapMock({
  currentCity,
  salons,
  selectedSalon,
  onSelectSalon,
}: MapMockProps) {
  const [directionsActive, setDirectionsActive] = useState(false);
  const filteredSalons = salons.filter((s) => s.city.toLowerCase() === currentCity.toLowerCase());
  
  // Choose coordinates mapping inside our canvas frame
  // We will plot markers relative to a central grid coordinate.
  // Center is roughly 50,50 % inside a relative container.
  const plotX = (lat: number) => {
    // Generate simulated canvas X based on coordinates
    const baseVal = (lat % 1) * 1000;
    return Math.abs((baseVal * 17) % 80) + 10; // returns % coordinate between 10% and 90%
  };

  const plotY = (lng: number) => {
    const baseVal = (lng % 1) * 1000;
    return Math.abs((baseVal * 23) % 80) + 10;
  };

  const activeSalon = selectedSalon || filteredSalons[0] || null;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-xs p-6" id="map-simulation-container">
      <div className="flex items-center justify-between border-b border-gray-50 pb-3 mb-4">
        <div>
          <span className="text-[10px] font-bold text-pink-600 uppercase tracking-widest">Geolocation Services</span>
          <h3 className="font-sans text-sm font-bold text-gray-900 mt-0.5">Interactive Salon Radar</h3>
        </div>
        {activeSalon && (
          <span className="text-xs bg-pink-50 border border-pink-100/50 text-pink-700 px-2.5 py-1 rounded-full font-bold">
            Nearby: {activeSalon.distance} from your marker
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Map Canvas Side (8 cols) */}
        <div className="lg:col-span-8 flex flex-col gap-3">
          {/* Main Simulated Map Container */}
          <div className="relative h-[280px] w-full bg-slate-900 rounded-2xl overflow-hidden border border-slate-800 shadow-inner">
            
            {/* SVG Background Grid & Road Map effect */}
            <svg className="absolute inset-0 w-full h-full opacity-20 pointer-events-none">
              <defs>
                <pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse">
                  <path d="M 30 0 L 0 0 0 30" fill="none" stroke="rgba(244, 63, 94, 0.4)" strokeWidth="0.5" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
              
              {/* Fake main roads connecting markers */}
              <path d="M 10 50 Q 50 30 90 50" fill="none" stroke="#ec4899" strokeWidth="2" strokeDasharray="5,5" />
              <path d="M 50 10 L 50 90" fill="none" stroke="#ec4899" strokeWidth="1" />
              <path d="M 20 20 L 80 80" fill="none" stroke="#f43f5e" strokeWidth="1.5" />
            </svg>

            {/* Glowing User Location Center Marker */}
            <div className="absolute top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 z-10 flex flex-col items-center">
              <span className="relative flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-4 w-4 bg-blue-500 border-2 border-white shadow-sm"></span>
              </span>
              <span className="text-[9px] text-blue-200 font-bold bg-slate-900/90 border border-slate-700/50 px-1.5 py-0.5 rounded-sm mt-1 leading-none shadow-md">
                You (Default)
              </span>
            </div>

            {/* Simulated route overlay if directions is active */}
            {directionsActive && activeSalon && (
              <div className="absolute inset-0 pointer-events-none z-10">
                <svg className="w-full h-full">
                  <motion.path
                    d={`M 50 50 Q ${plotX(activeSalon.coordinates.lat) + 5} 40 ${plotX(activeSalon.coordinates.lat)} ${plotY(activeSalon.coordinates.lng)}`}
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    initial={{ strokeDasharray: "10, 100", strokeDashoffset: 0 }}
                    animate={{ strokeDashoffset: -100 }}
                    transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
                  />
                </svg>
              </div>
            )}

            {/* Salon Location Markers mapped relative to coords */}
            {filteredSalons.map((sal) => {
              const xPos = plotX(sal.coordinates.lat);
              const yPos = plotY(sal.coordinates.lng);
              const isSelected = activeSalon?.id === sal.id;

              return (
                <button
                  key={sal.id}
                  onClick={() => {
                    onSelectSalon(sal);
                    setDirectionsActive(false);
                  }}
                  style={{ left: `${xPos}%`, top: `${yPos}%` }}
                  className={`absolute -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center group transition-transform ${
                    isSelected ? 'scale-110' : 'hover:scale-105'
                  }`}
                  id={`map-marker-${sal.id}`}
                >
                  <div className={`p-1.5 rounded-full shadow-lg border transition-all ${
                    isSelected 
                      ? 'bg-pink-500 text-white border-pink-300 ring-4 ring-pink-500/20' 
                      : 'bg-white text-gray-800 border-gray-100 hover:border-pink-300'
                  }`}>
                    <MapPin className="h-4.5 w-4.5 fill-current" />
                  </div>
                  <span className={`text-[9px] font-sans font-bold px-1.5 py-0.5 rounded-md mt-1 shadow-sm border truncate max-w-[120px] ${
                    isSelected
                      ? 'bg-pink-500 text-white border-pink-400'
                      : 'bg-white text-gray-800 border-gray-100 group-hover:bg-pink-50'
                  }`}>
                    {sal.name.split(' ')[0]}
                  </span>
                </button>
              );
            })}

            {/* Map Legend */}
            <div className="absolute bottom-3 left-3 bg-slate-900/90 border border-slate-800 p-2 rounded-xl text-[9px] font-sans font-semibold text-slate-300 flex items-center gap-3 shadow-md">
              <div className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-blue-500"></span>
                <span>User</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-pink-500"></span>
                <span>Salons</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="h-1.5 w-5 bg-emerald-500 inline-block rounded-sm"></span>
                <span>Active Route</span>
              </div>
            </div>

            {/* Quick calibration helper */}
            <div className="absolute top-3 right-3 bg-slate-900/95 border border-slate-800 px-2.5 py-1 rounded-full text-[9px] text-pink-400 font-bold tracking-wider uppercase animate-pulse">
              📍 Local Map: {currentCity}
            </div>
          </div>

          {/* Quick Route Info display if directions active */}
          {directionsActive && activeSalon && (
            <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3.5 flex items-center justify-between text-emerald-800 animate-fadeIn">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
                  <Navigation className="h-4.5 w-4.5 animate-bounce" />
                </div>
                <div>
                  <h4 className="text-xs font-bold leading-none">Directions Calculated</h4>
                  <p className="text-[10px] text-emerald-600 font-medium mt-1">Take the main road towards {activeSalon.locality}. Speed-traffic average flow.</p>
                </div>
              </div>
              <div className="text-right shrink-0">
                <span className="text-[9px] uppercase font-bold text-emerald-500 block">Est. Travel</span>
                <span className="font-mono text-sm font-black text-emerald-800">8-12 mins</span>
              </div>
            </div>
          )}
        </div>

        {/* Selected Salon detail sidebar (4 cols) */}
        <div className="lg:col-span-4 bg-gray-50/50 p-4 rounded-2xl border border-gray-100 flex flex-col justify-between">
          {activeSalon ? (
            <div className="flex flex-col h-full justify-between gap-4">
              <div className="flex flex-col gap-2.5">
                <img src={activeSalon.image} alt={activeSalon.name} className="h-24 w-full object-cover rounded-xl border border-gray-100 shadow-xs" />
                
                <div>
                  <h4 className="font-sans text-xs font-bold text-gray-900 leading-none">{activeSalon.name}</h4>
                  <span className="text-[10px] text-pink-600 font-medium mt-1 block">{activeSalon.locality}, {activeSalon.city}</span>
                </div>

                <div className="bg-white p-2.5 rounded-xl border border-gray-100 text-[11px] text-gray-500 leading-normal">
                  <strong>Address: </strong>{activeSalon.address}
                </div>

                <div className="flex items-center gap-1.5 text-[11px] text-gray-600">
                  <Clock className="h-3.5 w-3.5 text-pink-500" />
                  <span>Hours: {activeSalon.openingHours}</span>
                </div>
              </div>

              <div className="flex flex-col gap-1.5 pt-2">
                <button
                  onClick={() => setDirectionsActive(true)}
                  className="w-full py-2 bg-pink-500 hover:bg-pink-600 text-white font-bold text-xs rounded-xl shadow-xs flex items-center justify-center gap-1.5 transition-all hover:scale-102"
                  id="get-directions-btn"
                >
                  <Navigation className="h-3.5 w-3.5" />
                  Get Directions ({activeSalon.distance})
                </button>
                <button
                  onClick={() => {
                    // Triggers focus on parent's detail tab
                    const el = document.getElementById(`salon-card-${activeSalon.id}`);
                    if (el) {
                      el.scrollIntoView({ behavior: 'smooth' });
                    }
                  }}
                  className="w-full py-2 bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5"
                >
                  <Eye className="h-3.5 w-3.5 text-gray-400" />
                  View Catalog List
                </button>
              </div>
            </div>
          ) : (
            <p className="text-xs text-gray-400 text-center py-12 font-medium">Select a marker on the radar to calculate travel routes.</p>
          )}
        </div>

      </div>
    </div>
  );
}
