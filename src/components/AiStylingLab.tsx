import React, { useState } from 'react';
import { Sparkles, Upload, Smile, RefreshCw, Scissors, Heart, DollarSign, ArrowLeft } from 'lucide-react';

interface AiStylingLabProps {
  currentCity: string;
  onBack?: () => void;
}

export default function AiStylingLab({ currentCity, onBack }: AiStylingLabProps) {
  const [activeTab, setActiveTab] = useState<'hair' | 'skin'>('hair');
  
  // Hairstyle AI State
  const [hairImage, setHairImage] = useState<string | null>(null);
  const [selectedStyle, setSelectedStyle] = useState<string>('Classic Modern Bob');
  const [gender, setGender] = useState<'unisex' | 'male' | 'female'>('unisex');
  const [isHairLoading, setIsHairLoading] = useState<boolean>(false);
  const [hairResult, setHairResult] = useState<any | null>(null);

  // Skincare AI State
  const [skinType, setSkinType] = useState<string>('Combination');
  const [selectedConcerns, setSelectedConcerns] = useState<string[]>([]);
  const [skinImage, setSkinImage] = useState<string | null>(null);
  const [skinBudget, setSkinBudget] = useState<string>('mid');
  const [isSkinLoading, setIsSkinLoading] = useState<boolean>(false);
  const [skinResult, setSkinResult] = useState<any | null>(null);

  const hairStyles = [
    { name: 'Classic Modern Bob', description: 'Clean chin-length cut with subtle layers.' },
    { name: 'French Balayage Bob', description: 'Sun-kissed hand-painted layers.' },
    { name: 'High Fade Pompadour', description: 'Sharp clean sides with voluminous top.' },
    { name: 'Pixie Feather Cut', description: 'Bold and ultra-low maintenance crop.' },
    { name: 'Wolf Shag Cut', description: 'Messy retro layered style with bangs.' },
    { name: 'Gentleman Taper Crop', description: 'Polished corporate side part.' }
  ];

  const skinConcernsList = [
    'Dryness / Dehydration',
    'Acne / Breakouts',
    'Fine Lines / Wrinkles',
    'Dark Circles / Puffiness',
    'Uneven Texture',
    'Sun damage & Melasma'
  ];

  // Helper to handle image uploads to Base64
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'hair' | 'skin') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (type === 'hair') {
          setHairImage(reader.result as string);
        } else {
          setSkinImage(reader.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const analyzeHairstyle = async () => {
    setIsHairLoading(true);
    setHairResult(null);
    try {
      const response = await fetch('/api/gemini/hairstyle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: hairImage,
          selectedStyle,
          gender
        })
      });
      const data = await response.json();
      setHairResult(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsHairLoading(false);
    }
  };

  const analyzeSkincare = async () => {
    setIsSkinLoading(true);
    setSkinResult(null);
    try {
      const response = await fetch('/api/gemini/skincare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          skinType,
          concerns: selectedConcerns,
          budget: skinBudget,
          imageBase64: skinImage
        })
      });
      const data = await response.json();
      setSkinResult(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSkinLoading(false);
    }
  };

  const toggleConcern = (concern: string) => {
    if (selectedConcerns.includes(concern)) {
      setSelectedConcerns(selectedConcerns.filter(c => c !== concern));
    } else {
      setSelectedConcerns([...selectedConcerns, concern]);
    }
  };

  return (
    <div className="bg-gray-50/50 py-8 min-h-screen" id="ai-styling-lab-container">
      <div className="max-w-4xl mx-auto px-4">
        
        {/* Back navigation */}
        {onBack && (
          <button
            onClick={onBack}
            className="mb-5 inline-flex items-center gap-2 text-xs font-bold text-gray-600 hover:text-pink-600 transition-colors cursor-pointer group"
          >
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
            <span>Back to Salon Discovery</span>
          </button>
        )}

        {/* Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-linear-to-r from-purple-900 via-pink-800 to-rose-700 text-white p-8 md:p-12 shadow-xl mb-8">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-pink-500/20 rounded-full blur-2xl -ml-10 -mb-10"></div>
          
          <div className="relative z-10 max-w-lg">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 text-xs font-semibold tracking-wider uppercase mb-4">
              <Sparkles className="h-3 w-3 text-amber-300 fill-amber-300 animate-pulse" />
              GlamAI Virtual Consultant
            </span>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight font-sans">
              AI Beauty & Styling Lab
            </h1>
            <p className="mt-3 text-sm md:text-base text-pink-100 leading-relaxed font-sans">
              Discover your perfect look with state-of-the-art vision models. Upload a selfie for instant face shape hairstyle suitability, or formulate an esthetician-grade daily skincare routine.
            </p>
          </div>
        </div>

        {/* Tab Toggle */}
        <div className="flex border border-gray-100 bg-white p-1 rounded-2xl shadow-xs mb-8">
          <button
            onClick={() => setActiveTab('hair')}
            className={`flex-1 py-3 text-center rounded-xl font-sans text-xs font-bold tracking-wide transition-all ${
              activeTab === 'hair'
                ? 'bg-pink-500 text-white shadow-md'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
            id="tab-hair-ai"
          >
            <span className="flex items-center justify-center gap-2">
              <Scissors className="h-4 w-4" />
              AI Hairstyle Suitability
            </span>
          </button>
          <button
            onClick={() => setActiveTab('skin')}
            className={`flex-1 py-3 text-center rounded-xl font-sans text-xs font-bold tracking-wide transition-all ${
              activeTab === 'skin'
                ? 'bg-pink-500 text-white shadow-md'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
            id="tab-skin-ai"
          >
            <span className="flex items-center justify-center gap-2">
              <Smile className="h-4 w-4" />
              AI Skincare Specialist
            </span>
          </button>
        </div>

        {/* Content Area */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          
          {/* Controls Column (Left) */}
          <div className="md:col-span-5 flex flex-col gap-6">
            {activeTab === 'hair' ? (
              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs flex flex-col gap-4">
                <h3 className="font-sans text-sm font-bold text-gray-900 border-b border-gray-50 pb-2">Style Preferences</h3>
                
                {/* Image Upload Area */}
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Upload Your Selfie (Optional)</label>
                  <div className="relative border-2 border-dashed border-gray-200 hover:border-pink-400 rounded-xl p-4 transition-colors text-center cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageChange(e, 'hair')}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    {hairImage ? (
                      <div className="flex flex-col items-center gap-2">
                        <img src={hairImage} alt="Selfie" className="h-28 w-28 object-cover rounded-full mx-auto border-4 border-pink-100 shadow-md" />
                        <span className="text-[10px] font-semibold text-green-600">✓ Image attached successfully</span>
                      </div>
                    ) : (
                      <div className="py-2">
                        <Upload className="h-6 w-6 text-gray-400 mx-auto mb-2" />
                        <span className="text-xs text-gray-500 block">Drag & drop or click to upload</span>
                        <span className="text-[10px] text-gray-400 mt-1 block">Supported format: JPG, PNG (Max 5MB)</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Gender select */}
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Gender Preference</label>
                  <div className="grid grid-cols-3 gap-2">
                    {['unisex', 'female', 'male'].map((g) => (
                      <button
                        key={g}
                        onClick={() => setGender(g as any)}
                        className={`py-1.5 text-xs font-medium rounded-lg capitalize border ${
                          gender === g
                            ? 'bg-pink-50 border-pink-300 text-pink-700 font-semibold'
                            : 'bg-white border-gray-200 text-gray-600'
                        }`}
                      >
                        {g}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Dropdown Style Picker */}
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Target Haircut Trend</label>
                  <select
                    value={selectedStyle}
                    onChange={(e) => setSelectedStyle(e.target.value)}
                    className="w-full text-xs bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 font-medium text-gray-700 focus:outline-none focus:border-pink-500"
                  >
                    {hairStyles.map((style) => (
                      <option key={style.name} value={style.name}>
                        {style.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Submit */}
                <button
                  onClick={analyzeHairstyle}
                  disabled={isHairLoading}
                  className="w-full mt-2 py-3 bg-pink-500 hover:bg-pink-600 disabled:bg-gray-300 text-white font-sans text-xs font-bold tracking-wide rounded-xl flex items-center justify-center gap-2 shadow-md shadow-pink-100"
                >
                  {isHairLoading ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      Analyzing Facial Geometry...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      Evaluate My Look
                    </>
                  )}
                </button>
              </div>
            ) : (
              // Skincare Controls
              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs flex flex-col gap-4">
                <h3 className="font-sans text-sm font-bold text-gray-900 border-b border-gray-50 pb-2">Skin Consultation Form</h3>

                {/* Image Upload Area */}
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Face Skin Snapshot (Optional)</label>
                  <div className="relative border-2 border-dashed border-gray-200 hover:border-pink-400 rounded-xl p-4 transition-colors text-center cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageChange(e, 'skin')}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    {skinImage ? (
                      <div className="flex flex-col items-center gap-2">
                        <img src={skinImage} alt="Skin" className="h-28 w-28 object-cover rounded-full mx-auto border-4 border-pink-100 shadow-md" />
                        <span className="text-[10px] font-semibold text-green-600">✓ Snapshot added successfully</span>
                      </div>
                    ) : (
                      <div className="py-2">
                        <Upload className="h-6 w-6 text-gray-400 mx-auto mb-2" />
                        <span className="text-xs text-gray-500 block">Upload close-up selfie</span>
                        <span className="text-[10px] text-gray-400 mt-1 block">Helps evaluate redness or sebum</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Skin Type selector */}
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">My Skin Type</label>
                  <div className="grid grid-cols-2 gap-2">
                    {['Dry', 'Oily', 'Combination', 'Sensitive', 'Normal'].map((type) => (
                      <button
                        key={type}
                        onClick={() => setSkinType(type)}
                        className={`py-1.5 text-xs font-medium rounded-lg border ${
                          skinType === type
                            ? 'bg-pink-50 border-pink-300 text-pink-700 font-semibold'
                            : 'bg-white border-gray-200 text-gray-600'
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Concerns Checklist */}
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Active Skincare Concerns</label>
                  <div className="flex flex-wrap gap-1.5">
                    {skinConcernsList.map((concern) => {
                      const isSelected = selectedConcerns.includes(concern);
                      return (
                        <button
                          key={concern}
                          onClick={() => toggleConcern(concern)}
                          className={`px-2.5 py-1 text-[10px] font-medium rounded-full border transition-colors ${
                            isSelected
                              ? 'bg-pink-500 border-pink-500 text-white'
                              : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                          }`}
                        >
                          {concern}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Budget tier */}
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Product Budget Range</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'low', label: 'Budget-friendly' },
                      { id: 'mid', label: 'Mid-range Luxe' },
                      { id: 'high', label: 'Clinical-grade' },
                    ].map((tier) => (
                      <button
                        key={tier.id}
                        onClick={() => setSkinBudget(tier.id)}
                        className={`py-1.5 px-1 text-[10px] font-medium rounded-lg border text-center ${
                          skinBudget === tier.id
                            ? 'bg-pink-50 border-pink-300 text-pink-700 font-semibold'
                            : 'bg-white border-gray-200 text-gray-600'
                        }`}
                      >
                        {tier.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Submit */}
                <button
                  onClick={analyzeSkincare}
                  disabled={isSkinLoading}
                  className="w-full mt-2 py-3 bg-pink-500 hover:bg-pink-600 disabled:bg-gray-300 text-white font-sans text-xs font-bold tracking-wide rounded-xl flex items-center justify-center gap-2 shadow-md shadow-pink-100"
                >
                  {isSkinLoading ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      Analyzing Skin Elements...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      Generate Routine
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Results Column (Right) */}
          <div className="md:col-span-7">
            {activeTab === 'hair' ? (
              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs h-full min-h-[350px] flex flex-col justify-center">
                {isHairLoading ? (
                  <div className="text-center py-12 flex flex-col items-center justify-center">
                    <div className="relative mb-4">
                      <div className="w-16 h-16 rounded-full border-4 border-pink-100 border-t-pink-500 animate-spin"></div>
                      <Sparkles className="h-6 w-6 text-pink-500 absolute inset-0 m-auto animate-pulse" />
                    </div>
                    <h4 className="font-sans text-sm font-bold text-gray-900">Virtual Hair Stylist processing...</h4>
                    <p className="text-xs text-gray-500 mt-1 max-w-xs mx-auto">Evaluating symmetry, hairline ratio, and desired style compatibility vectors.</p>
                  </div>
                ) : hairResult ? (
                  <div className="flex flex-col gap-5">
                    <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                      <div>
                        <span className="text-[10px] font-bold text-pink-600 uppercase tracking-widest">Analysis Result</span>
                        <h4 className="font-sans text-base font-extrabold text-gray-900 mt-0.5">Style Match Summary</h4>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] font-bold text-gray-400 block uppercase">Compatibility Score</span>
                        <span className="text-2xl font-black text-pink-600 font-mono">{hairResult.suitabilityScore}%</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-purple-50/50 p-3.5 rounded-xl border border-purple-100/30">
                        <span className="text-[10px] font-bold text-purple-700 uppercase tracking-wide block">Identified Face Shape</span>
                        <span className="font-sans text-sm font-black text-gray-800 mt-1 block">{hairResult.faceShape}</span>
                      </div>
                      <div className="bg-pink-50/50 p-3.5 rounded-xl border border-pink-100/30">
                        <span className="text-[10px] font-bold text-pink-700 uppercase tracking-wide block">Target Look</span>
                        <span className="font-sans text-sm font-black text-gray-800 mt-1 block truncate">{selectedStyle}</span>
                      </div>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wide block mb-1">Stylist Analysis</span>
                      <p className="font-sans text-xs text-gray-700 leading-relaxed bg-gray-50 p-3.5 rounded-xl border border-gray-100">
                        {hairResult.stylingAnalysis}
                      </p>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wide block mb-1">Morning Styling Hack</span>
                      <p className="font-sans text-xs text-gray-700 leading-relaxed bg-gray-50 p-3.5 rounded-xl border border-gray-100">
                        💡 {hairResult.morningRoutine}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-2">
                      <div>
                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wide block mb-1.5">Recommended Products</span>
                        <ul className="flex flex-col gap-1">
                          {hairResult.recommendedProducts?.map((p: string, i: number) => (
                            <li key={i} className="text-xs text-gray-700 font-medium flex items-center gap-1.5">
                              <span className="h-1.5 w-1.5 rounded-full bg-pink-500"></span>
                              {p}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wide block mb-1.5">Matching Local Salons</span>
                        <div className="flex flex-col gap-1">
                          {hairResult.matchingSalons?.map((s: string, i: number) => (
                            <span key={i} className="text-xs text-gray-800 font-bold flex items-center gap-1.5 bg-pink-50 px-2 py-1 rounded-lg w-fit border border-pink-100/30">
                              <span className="h-1.5 w-1.5 rounded-full bg-pink-500 animate-pulse"></span>
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
                      <Scissors className="h-6 w-6 text-gray-400" />
                    </div>
                    <h4 className="font-sans text-sm font-bold text-gray-800">Your AI Analysis Awaits</h4>
                    <p className="text-xs text-gray-500 max-w-xs mx-auto mt-1">Select a hairstyle from the left dropdown, upload a portrait photo (optional), and click evaluate to see our model recommend your best aesthetic cut.</p>
                  </div>
                )}
              </div>
            ) : (
              // Skincare Result Tab
              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs h-full min-h-[350px] flex flex-col justify-center">
                {isSkinLoading ? (
                  <div className="text-center py-12 flex flex-col items-center justify-center">
                    <div className="relative mb-4">
                      <div className="w-16 h-16 rounded-full border-4 border-pink-100 border-t-pink-500 animate-spin"></div>
                      <Sparkles className="h-6 w-6 text-pink-500 absolute inset-0 m-auto animate-pulse" />
                    </div>
                    <h4 className="font-sans text-sm font-bold text-gray-900">Virtual Esthetician diagnosing...</h4>
                    <p className="text-xs text-gray-500 mt-1 max-w-xs mx-auto">Evaluating epidermal moisture, hydration requirements, and active concern balancing.</p>
                  </div>
                ) : skinResult ? (
                  <div className="flex flex-col gap-5">
                    <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                      <div>
                        <span className="text-[10px] font-bold text-pink-600 uppercase tracking-widest">Personalized Routine</span>
                        <h4 className="font-sans text-base font-extrabold text-gray-900 mt-0.5">DermAI Skin Strategy</h4>
                      </div>
                      <span className="px-3 py-1 bg-pink-50 border border-pink-100 text-pink-700 font-sans text-xs font-bold rounded-full">
                        {skinType} Skin
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wide block mb-1">Dermal Assessment</span>
                      <p className="font-sans text-xs text-gray-700 leading-relaxed bg-gray-50 p-3.5 rounded-xl border border-gray-100">
                        {skinResult.skinAnalysis}
                      </p>
                    </div>

                    {/* AM / PM Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* AM Routine */}
                      <div className="bg-amber-50/30 p-4 rounded-xl border border-amber-200/20">
                        <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wide block mb-2">☀️ Morning Routine (AM)</span>
                        <div className="flex flex-col gap-2.5">
                          {skinResult.morningRoutine?.map((r: any, i: number) => (
                            <div key={i} className="text-xs">
                              <span className="font-bold text-gray-800 block">{r.step}: <span className="font-medium text-gray-600">{r.product}</span></span>
                              <span className="text-[10px] text-gray-500">{r.benefit}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* PM Routine */}
                      <div className="bg-indigo-50/20 p-4 rounded-xl border border-indigo-200/20">
                        <span className="text-[10px] font-bold text-indigo-800 uppercase tracking-wide block mb-2">🌙 Night Routine (PM)</span>
                        <div className="flex flex-col gap-2.5">
                          {skinResult.nightRoutine?.map((r: any, i: number) => (
                            <div key={i} className="text-xs">
                              <span className="font-bold text-gray-800 block">{r.step}: <span className="font-medium text-gray-600">{r.product}</span></span>
                              <span className="text-[10px] text-gray-500">{r.benefit}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="border-t border-gray-100 pt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                      <div>
                        <span className="font-semibold text-gray-800">Clinic Treatment Recommendation:</span>
                        <p className="text-pink-600 font-bold mt-0.5">{skinResult.salonTreatment}</p>
                      </div>
                      <div className="bg-pink-50 p-2.5 rounded-xl border border-pink-100/30 text-[11px] text-pink-700 leading-relaxed max-w-xs">
                        <strong>Esthetician Tip:</strong> {skinResult.lifestyleTip}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
                      <Smile className="h-6 w-6 text-gray-400" />
                    </div>
                    <h4 className="font-sans text-sm font-bold text-gray-800">Your Skincare Prescription</h4>
                    <p className="text-xs text-gray-500 max-w-xs mx-auto mt-1">Specify your skin type and select active skin concerns. Our AI engine will output a precise, targeted morning and evening product formulation plan customized to your biology.</p>
                  </div>
                )}
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
