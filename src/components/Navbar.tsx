import React from 'react';
import { Scissors, MapPin, User, Building, Heart, Sparkles, MessageCircle } from 'lucide-react';
import { motion } from 'motion/react';

interface NavbarProps {
  currentCity: string;
  onCityChange: (city: string) => void;
  isOwnerMode: boolean;
  onToggleMode: () => void;
  loyaltyPoints: number;
  userName: string;
  onShowAiTab: () => void;
  onHomeClick: () => void;
  onOpenChat: () => void;
  favoriteSalonsCount: number;
}

export default function Navbar({
  currentCity,
  onCityChange,
  isOwnerMode,
  onToggleMode,
  loyaltyPoints,
  userName,
  onShowAiTab,
  onHomeClick,
  onOpenChat,
  favoriteSalonsCount,
}: NavbarProps) {
  return (
    <nav className="sticky top-0 z-40 w-full bg-white border-b border-gray-100 shadow-xs">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo and Brand */}
          <div className="flex items-center gap-8">
            <div 
              onClick={onHomeClick}
              className="flex cursor-pointer items-center gap-2"
              id="brand-logo-container"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-pink-500 text-white shadow-md shadow-pink-100">
                <Scissors className="h-5 w-5" />
              </div>
              <div className="flex flex-col">
                <span className="font-sans text-lg font-bold tracking-tight text-gray-900 leading-none">GlamSpot</span>
                <span className="font-sans text-[10px] font-medium tracking-widest text-pink-500 uppercase mt-0.5">Marketplace</span>
              </div>
            </div>

            {/* City Selector */}
            <div className="hidden sm:flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100" id="city-selector">
              <MapPin className="h-4 w-4 text-pink-500" />
              <select
                value={currentCity}
                onChange={(e) => onCityChange(e.target.value)}
                className="bg-transparent font-sans text-xs font-semibold text-gray-700 focus:outline-none cursor-pointer pr-1"
              >
                <option value="Mumbai">Mumbai, MH</option>
                <option value="Bangalore">Bangalore, KA</option>
                <option value="Delhi">Delhi, DL</option>
                <option value="Pune">Pune, MH</option>
              </select>
            </div>
          </div>

          {/* Right Side Navigation Controls */}
          <div className="flex items-center gap-3">
            {/* Loyalty Points display */}
            {!isOwnerMode && (
              <div 
                className="flex items-center gap-1 bg-amber-50 border border-amber-200/50 px-3 py-1.5 rounded-full text-amber-800"
                title="Your Loyalty Rewards Points"
                id="loyalty-points-tag"
              >
                <Sparkles className="h-3.5 w-3.5 text-amber-500 fill-amber-500 animate-pulse" />
                <span className="font-mono text-xs font-bold leading-none">{loyaltyPoints} pts</span>
              </div>
            )}

            {/* AI Lab Tab - Highlighted Option */}
            <div className="relative group">
              <span className="absolute -top-3.5 right-1 bg-amber-500 text-[8px] font-black tracking-widest text-white px-1.5 py-0.5 rounded-full uppercase shadow-xs animate-bounce z-50 flex items-center gap-0.5">
                <Sparkles className="h-2 w-2 text-white fill-white" /> POPULAR
              </span>
              <button
                onClick={onShowAiTab}
                className="relative flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-pink-600 via-rose-500 to-amber-500 hover:from-pink-700 hover:to-amber-600 text-white font-sans text-xs font-bold shadow-md shadow-pink-200 hover:shadow-lg transition-all hover:scale-105 animate-pulse-slow border-2 border-white/50"
                id="nav-ai-lab-btn"
              >
                <Sparkles className="h-4 w-4 text-white fill-white animate-spin-slow" />
                <span>AI STYLING LAB</span>
              </button>
            </div>

            {/* AI Assistant Chat Button */}
            <button
              onClick={onOpenChat}
              className="relative p-2 rounded-full text-gray-500 hover:bg-gray-50 hover:text-gray-900 transition-colors"
              title="Open Booking Assistant"
              id="nav-chat-btn"
            >
              <MessageCircle className="h-5 w-5" />
              <span className="absolute -top-0.5 -right-0.5 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pink-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-pink-500"></span>
              </span>
            </button>

            {/* Toggle User / Business Mode */}
            <button
              onClick={onToggleMode}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors font-sans text-xs font-medium"
              id="mode-toggle-btn"
            >
              {isOwnerMode ? (
                <>
                  <User className="h-3.5 w-3.5 text-gray-500" />
                  <span>Customer Portal</span>
                </>
              ) : (
                <>
                  <Building className="h-3.5 w-3.5 text-gray-500" />
                  <span>Salon Owner Hub</span>
                </>
              )}
            </button>

            {/* User Profile Card */}
            <div className="hidden md:flex items-center gap-2 pl-2 border-l border-gray-100" id="user-profile-widget">
              <div className="h-8 w-8 rounded-full bg-pink-100 flex items-center justify-center font-bold text-pink-700 text-xs shadow-inner">
                {userName.substring(0, 2).toUpperCase()}
              </div>
              <div className="flex flex-col">
                <span className="font-sans text-[11px] text-gray-400 font-medium leading-none">Logged in as</span>
                <span className="font-sans text-xs font-bold text-gray-800 mt-0.5">{userName}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
