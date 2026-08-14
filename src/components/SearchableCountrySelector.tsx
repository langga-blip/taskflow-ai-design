import React, { useState } from 'react';
import { COUNTRIES_DATA, CountryData } from '../data/countriesData';
import { Search, Globe, Check, X, ChevronDown } from 'lucide-react';

interface SearchableCountrySelectorProps {
  selectedCountry: CountryData;
  onSelectCountry: (country: CountryData) => void;
  isLightMode?: boolean;
}

export const SearchableCountrySelector: React.FC<SearchableCountrySelectorProps> = ({
  selectedCountry,
  onSelectCountry,
  isLightMode = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCountries = COUNTRIES_DATA.filter((c) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      c.name.toLowerCase().includes(q) ||
      c.code.toLowerCase().includes(q) ||
      c.dialCode.includes(q) ||
      c.currencyCode.toLowerCase().includes(q)
    );
  });

  const handleSelect = (country: CountryData) => {
    onSelectCountry(country);
    setIsOpen(false);
    setSearchQuery('');
  };

  return (
    <div className="relative w-full">
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className={`w-full flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-xl border text-left transition-all cursor-pointer ${
          isLightMode
            ? 'bg-slate-100 border-slate-300 text-slate-900 hover:border-[#7C3AED]'
            : 'bg-[#0A0C14] border-[#2E3552] text-white hover:border-[#7C3AED]'
        }`}
      >
        <div className="flex items-center gap-2.5 truncate">
          <span className="text-xl leading-none">{selectedCountry.flag}</span>
          <div className="truncate">
            <span className="font-semibold text-xs sm:text-sm block truncate">
              {selectedCountry.name}
            </span>
            <span
              className={`text-[10px] font-medium block truncate ${
                isLightMode ? 'text-slate-500' : 'text-slate-400'
              }`}
            >
              Dial: {selectedCountry.dialCode} • {selectedCountry.currencyCode} ({selectedCountry.currencySymbol})
            </span>
          </div>
        </div>
        <ChevronDown
          className={`w-4 h-4 shrink-0 ${
            isLightMode ? 'text-slate-500' : 'text-slate-400'
          }`}
        />
      </button>

      {/* Modal / Search Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div
            className={`w-full max-w-md rounded-2xl border p-5 shadow-2xl flex flex-col max-h-[85vh] animate-scale-up ${
              isLightMode
                ? 'bg-white border-slate-200 text-slate-900'
                : 'bg-[#131726] border-[#2E3552] text-white'
            }`}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-[#2E3552]">
              <div className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-[#06B6D4]" />
                <div>
                  <h3 className="font-bold text-sm">Select Your Country</h3>
                  <p
                    className={`text-[11px] ${
                      isLightMode ? 'text-slate-500' : 'text-slate-400'
                    }`}
                  >
                    Auto-configures Currency, Timezone & Dial Code
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  isLightMode
                    ? 'hover:bg-slate-100 text-slate-500'
                    : 'hover:bg-[#1E2338] text-slate-400'
                }`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Search Input Box */}
            <div className="my-3 relative">
              <Search
                className={`w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 ${
                  isLightMode ? 'text-slate-400' : 'text-slate-500'
                }`}
              />
              <input
                type="text"
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search country, dial code (+234), currency..."
                className={`w-full pl-9 pr-8 py-2.5 rounded-xl border text-xs focus:outline-none focus:border-[#7C3AED] ${
                  isLightMode
                    ? 'bg-slate-100 border-slate-300 text-slate-900 placeholder-slate-400'
                    : 'bg-[#0A0C14] border-[#2E3552] text-white placeholder-slate-500'
                }`}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Country List */}
            <div className="flex-1 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
              {filteredCountries.length > 0 ? (
                filteredCountries.map((c) => {
                  const isSelected = selectedCountry.code === c.code;
                  return (
                    <button
                      key={c.code}
                      type="button"
                      onClick={() => handleSelect(c)}
                      className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${
                        isSelected
                          ? isLightMode
                            ? 'bg-[#7C3AED]/10 border-[#7C3AED] text-slate-900'
                            : 'bg-[#7C3AED]/20 border-[#7C3AED] text-white'
                          : isLightMode
                          ? 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                          : 'bg-[#0A0C14] border-[#2E3552] hover:border-slate-400'
                      }`}
                    >
                      <div className="flex items-center gap-3 text-left">
                        <span className="text-2xl">{c.flag}</span>
                        <div>
                          <div className="font-bold text-xs flex items-center gap-1.5">
                            {c.name}
                            <span
                              className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                                isLightMode
                                  ? 'bg-slate-200 text-slate-700'
                                  : 'bg-[#1E2338] text-slate-300'
                              }`}
                            >
                              {c.code}
                            </span>
                          </div>
                          <div
                            className={`text-[10px] ${
                              isLightMode ? 'text-slate-500' : 'text-slate-400'
                            }`}
                          >
                            Dial: <span className="font-semibold">{c.dialCode}</span> • Currency:{' '}
                            <span className="font-semibold text-[#00E676]">{c.currencyCode} ({c.currencySymbol})</span>
                          </div>
                        </div>
                      </div>

                      {isSelected && (
                        <Check className="w-4 h-4 text-[#7C3AED] shrink-0" />
                      )}
                    </button>
                  );
                })
              ) : (
                <div
                  className={`text-center py-8 text-xs ${
                    isLightMode ? 'text-slate-500' : 'text-slate-400'
                  }`}
                >
                  No country found matching &quot;{searchQuery}&quot;
                </div>
              )}
            </div>

            <div
              className={`pt-3 border-t text-[11px] text-center ${
                isLightMode ? 'border-slate-200 text-slate-500' : 'border-[#2E3552] text-slate-400'
              }`}
            >
              Showing {filteredCountries.length} of {COUNTRIES_DATA.length} countries
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
