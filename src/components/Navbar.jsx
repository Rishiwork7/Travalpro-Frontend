import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { Link, useSearchParams, useLocation } from "react-router-dom";
import { useSettings } from "../context/SettingsContext";
import CallDropdown from "./CallDropdown";
import { playHoverSound } from "../utils/sounds";

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { currency, language, setCurrency, setLanguage } = useSettings();

  const [searchParams] = useSearchParams();
  const location = useLocation();
  const activeService = searchParams.get("service") || "flights";
  const isHome = location.pathname === "/";

  const getLinkClass = (service) => {
    const isActive = isHome && activeService === service;
    return `text-[#0f294d] font-semibold cursor-pointer transition ${isActive ? "text-[#FFCC00]" : "hover:text-[#FFCC00]"
      }`;
  };

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-6 py-3 flex justify-between items-center">

        <Link to="/" className="text-2xl font-bold text-[#0f294d]">
          Traval<span className="text-[#FFCC00]">Pro</span>
        </Link>


        <div className="hidden md:flex gap-8 items-center text-sm">
          <div className="flex gap-6 items-center">
            <Link to="/?service=flights" className={getLinkClass("flights")}>
              Flights
            </Link>
            <Link to="/?service=hotels" className={getLinkClass("hotels")}>
              Hotels
            </Link>
            <Link to="/?service=packages" className={getLinkClass("packages")}>
              Packages
            </Link>
          </div>
          <div className="border-l border-gray-200 pl-6" onMouseEnter={playHoverSound}>
            <CallDropdown />
          </div>
          <div className="relative">
            <button
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              className="text-[#0f294d] font-semibold flex items-center gap-2 hover:text-[#FFCC00] transition"
            >
              {language} | {currency}
              <ChevronDown size={16} />
            </button>
            {menuOpen && (
              <div className="absolute right-0 mt-2 w-44 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                <div className="px-4 py-2 text-xs uppercase tracking-wide text-gray-400">
                  Language
                </div>
                {["ENG", "HIN"].map((lang) => (
                  <button
                    key={lang}
                    onClick={() => {
                      setLanguage(lang);
                      setMenuOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 ${language === lang ? "text-[#0f294d] font-semibold" : "text-gray-700"
                      }`}
                  >
                    {lang}
                  </button>
                ))}
                <div className="px-4 py-2 text-xs uppercase tracking-wide text-gray-400 border-t border-gray-100">
                  Currency
                </div>
                {["USD", "AED", "EUR"].map((cur) => (
                  <button
                    key={cur}
                    onClick={() => {
                      setCurrency(cur);
                      setMenuOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 ${currency === cur ? "text-[#0f294d] font-semibold" : "text-gray-700"
                      }`}
                  >
                    {cur}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-gray-700"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {mobileMenuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200">
          <div className="px-6 py-4 space-y-4">
            <span className="block text-[#0f294d] font-semibold">Flights</span>
            <span className="block text-[#0f294d] font-semibold">Hotels</span>
            <span className="block text-[#0f294d] font-semibold">Packages</span>
            <a href="tel:+18885550188" className="block text-[#0f294d] hover:text-[#FFCC00] transition">
              24/7 Support: 1-888-555-0188
            </a>
            <div className="text-[#0f294d] font-semibold">
              {language} | {currency}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
