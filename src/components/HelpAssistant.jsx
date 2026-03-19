import { useState, useEffect } from "react";
import { Phone, X, Headset } from "lucide-react";

export default function HelpAssistant() {
  const [open, setOpen] = useState(false);
  const [visible, setVisible] = useState(false);

  // Show after slight delay (intentional)
  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(true);
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  if (!visible) return null;

  return (
    <>
      {/* Floating Concierge Card */}
      {!open && (
        <div
          onClick={() => setOpen(true)}
          className="fixed bottom-10 right-10 z-50 cursor-pointer bg-[#0f294d] text-white rounded-2xl shadow-2xl px-6 py-4 w-72 hover:scale-105 transition"
        >
          <div className="flex items-center gap-3">

            <div className="bg-white text-black p-2 rounded-full">
              <Headset className="w-5 h-5" />
            </div>

            <div>
              <p className="font-bold text-sm">
                Live Travel Desk Active
              </p>
              <p className="text-xs opacity-80">
                Speak with a travel expert now →
              </p>
            </div>

          </div>
        </div>
      )}

      {/* Expanded Glass Panel */}
      {open && (
        <div className="fixed bottom-10 right-10 z-50 w-80 bg-white border border-gray-200 rounded-3xl shadow-2xl p-6 text-gray-900 animate-fadeIn">

          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-lg text-black">
              Concierge Desk
            </h3>

            <button onClick={() => setOpen(false)} className="text-gray-600 hover:text-gray-900">
              <X className="w-5 h-5" />
            </button>
          </div>

          <p className="text-sm text-gray-600 mb-5">
            Our advisors are currently assisting premium clients.
            Get priority booking support instantly.
          </p>

          <div className="space-y-3">

            <button className="w-full bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl py-3 text-sm transition text-gray-700">
              Modify Booking
            </button>

            <button className="w-full bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl py-3 text-sm transition text-gray-700">
              Cancel Booking
            </button>

            <button className="w-full bg-[#FFCC00] hover:bg-[#f2c200] text-black rounded-xl py-3 text-sm font-semibold hover:scale-105 transition shadow-md">
              Request Priority Callback
            </button>

            <a
              href="tel:+18885550188"
              className="w-full flex items-center justify-center bg-green-600 hover:bg-green-500 text-white rounded-xl py-3 text-sm font-semibold transition shadow-md"
            >
              <Phone className="w-4 h-4 mr-2" />
              Call 1-888-555-0188
            </a>

          </div>

        </div>
      )}

      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }

          .animate-fadeIn {
            animation: fadeIn 0.3s ease-out;
          }
        `}
      </style>
    </>
  );
}
