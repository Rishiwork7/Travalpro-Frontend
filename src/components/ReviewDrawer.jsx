import { X, ArrowRight } from "lucide-react";
import { useSettings } from "../context/SettingsContext";

export default function ReviewDrawer({
  isOpen,
  onClose,
  booking,
  leadData,
  onProceed,
}) {
  const { formatPrice } = useSettings();
  if (!isOpen || !booking) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white text-black rounded-2xl w-[95%] max-w-2xl p-8 shadow-2xl border border-gray-200 animate-fade-in">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-black">Review Your Booking</h2>
          <X className="cursor-pointer text-gray-600 hover:text-gray-900" onClick={onClose} />
        </div>

        {/* Lead Info */}
        <div className="bg-gray-50 border border-gray-200 p-4 rounded-xl mb-6">
          <h3 className="font-semibold mb-2 text-black">Contact Details</h3>
          <p className="text-gray-700">Email: <span className="font-medium">{leadData?.email}</span></p>
          <p className="text-gray-700">Phone: <span className="font-medium">{leadData?.phone}</span></p>
        </div>

        {/* Booking Info */}
        <div className="bg-gray-50 border border-gray-200 p-4 rounded-xl mb-6">
          <h3 className="font-semibold mb-2 text-black">Booking Details</h3>
          <p className="text-gray-700">{booking.title}</p>
          {booking.from && (
            <p className="text-gray-700">
              {booking.from} → {booking.to}
            </p>
          )}
          {booking.city && <p className="text-gray-700">City: {booking.city}</p>}
          <p className="text-[#0a821c] font-bold text-xl mt-2">
            {formatPrice(booking.price)}
          </p>
        </div>

        <button
          onClick={onProceed}
          className="w-full bg-[#FFCC00] hover:bg-[#f2c200] text-black py-4 rounded-xl font-bold flex items-center justify-center gap-2 shadow-md transition"
        >
          Proceed to Pay
          <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
}
