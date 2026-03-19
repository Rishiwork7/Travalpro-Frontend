import { AlertTriangle, Phone } from "lucide-react";

export default function MaintenanceModal({
  isOpen,
  onClose,
  booking,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50">
      <div className="bg-white text-black w-[95%] max-w-lg rounded-2xl p-8 shadow-2xl">

        <div className="text-center mb-6">
          <div className="flex justify-center mb-4">
            <div className="bg-[#f2f7fd] p-4 rounded-full">
              <AlertTriangle size={28} className="text-black" />
            </div>
          </div>

          <h2 className="text-2xl font-bold mb-2">
            Payment Gateway Under Maintenance
          </h2>

          <p className="text-gray-600 text-sm">
            Online payments are temporarily disabled due to scheduled maintenance.
          </p>
        </div>

        <div className="bg-gray-100 p-4 rounded-xl mb-6 text-sm">
          <p className="font-semibold mb-2">Your Booking Reference:</p>
          <p>{booking?.id || "TP-REF-001"}</p>
        </div>

        <div className="bg-[#f2f7fd] border border-gray-200 p-5 rounded-xl mb-6 text-center">
          <p className="mb-3 font-semibold">
            To confirm immediately, contact our travel desk:
          </p>

          <p className="text-2xl font-bold text-black mb-1">
            1-888-555-0188
          </p>

          <p className="text-xs text-gray-500">
            Available 24/7 for instant confirmation
          </p>
        </div>

        <a
          href="tel:+18885550188"
          className="w-full bg-[#FFCC00] text-black py-4 rounded-xl font-bold flex items-center justify-center gap-2 mb-3 hover:bg-[#f2c200] transition"
        >
          <Phone size={18} />
          Call Now to Confirm
        </a>

        <button
          onClick={onClose}
          className="w-full bg-gray-200 text-gray-700 py-3 rounded-xl font-semibold"
        >
          Back to Search
        </button>
      </div>
    </div>
  );
}
