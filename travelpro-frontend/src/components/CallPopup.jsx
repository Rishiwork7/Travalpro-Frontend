import { useEffect, useRef, useState } from "react";
import { Phone, X } from "lucide-react";
import { playNotificationSound } from "../utils/sounds";

export default function CallPopup() {
  const [isVisible, setIsVisible] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    timerRef.current = setTimeout(() => {
      setIsVisible(true);
      playNotificationSound();
    }, 15000);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setIsVisible(true);
    }, 60000);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center px-4">
      <div className="w-full max-w-3xl overflow-hidden rounded-xl grid md:grid-cols-[2fr_3fr]">
        {/* Left Column */}
        <div className="bg-white p-6 flex flex-col justify-between">
          <div className="rounded-lg overflow-hidden border border-gray-200">
            <img
              src="https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=1200&auto=format&fit=crop"
              alt="Support agent"
              className="w-full h-64 object-cover"
            />
          </div>

          <div className="mt-6 space-y-3">
            <div className="bg-[#f2f7fd] border border-gray-200 rounded-lg px-4 py-3 text-sm font-semibold text-[#0f294d]">
              20+ Years in Business
            </div>
            <div className="bg-white border border-gray-200 rounded-lg px-4 py-3 text-sm text-gray-700 flex items-center justify-between">
              <span className="font-semibold text-[#0f294d]">Trustpilot</span>
              <span className="text-[#0a821c] font-semibold">
                Great | ★★★★☆
              </span>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="bg-[#0f294d] p-8 relative flex flex-col justify-between">
          <button
            onClick={handleClose}
            className="absolute right-4 top-4 text-gray-300 hover:text-white transition"
            aria-label="Close call assistance"
          >
            <X size={20} />
          </button>

          <div>
            <p className="text-[#FFCC00] text-xl font-bold">TravelPro</p>
            <h2 className="text-white text-3xl md:text-4xl font-bold leading-tight mt-4">
              Need a travel buddy for assistance?
            </h2>
            <p className="text-white/70 mt-3 text-lg">
              Let&apos;s find flights together!
            </p>
          </div>

          <div className="mt-8">
            <a
              href="tel:+18885550188"
              className="inline-flex items-center gap-3 bg-white text-[#0a821c] font-bold text-lg px-6 py-4 rounded-full shadow-md hover:shadow-lg transition"
            >
              <Phone size={20} className="text-[#0a821c]" />
              1-888-555-0188
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
