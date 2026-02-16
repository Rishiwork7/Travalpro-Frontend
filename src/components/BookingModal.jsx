import { X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import BookingForm from "./BookingForm";
import { useSettings } from "../context/SettingsContext";

const normalizeType = (type) => {
  const t = String(type || "").toLowerCase().trim();
  if (t === "hotel") return "hotels";
  if (t === "car" || t === "cars") return "car_rental";
  return t || "flights";
};

const getPersonLabels = (type) => {
  const serviceType = normalizeType(type);
  switch (serviceType) {
    case "hotels":
      return { singular: "Guest", plural: "Guests", heading: "Guest Information" };
    case "car_rental":
      return { singular: "Driver", plural: "Drivers", heading: "Driver Information" };
    case "packages":
    case "insurance":
    case "cruises":
      return { singular: "Traveler", plural: "Travelers", heading: "Traveler Information" };
    case "flights":
    case "bus":
    case "train":
    default:
      return { singular: "Passenger", plural: "Passengers", heading: "Passenger Information" };
  }
};

const getFormRules = (type) => {
  const serviceType = normalizeType(type);
  switch (serviceType) {
    case "hotels":
    case "packages":
    case "insurance":
      return { showAgeGender: false, showContact: true };
    case "car_rental":
      return { showAgeGender: false, showContact: true };
    case "flights":
    case "bus":
    case "train":
    default:
      return { showAgeGender: true, showContact: true };
  }
};

const splitName = (fullName) => {
  const parts = String(fullName || "").trim().split(/\s+/);
  return {
    firstName: parts[0] || "",
    lastName: parts.slice(1).join(" "),
  };
};

const isComplete = (entry, index, rules) => {
  if (!String(entry?.name || "").trim()) return false;
  if (rules.showAgeGender) {
    if (!String(entry?.age || "").trim()) return false;
    if (!String(entry?.gender || "").trim()) return false;
  }
  if (rules.showContact && index === 0) {
    if (!String(entry?.email || "").trim()) return false;
    if (!String(entry?.phone || "").trim()) return false;
  }
  return true;
};

export default function BookingModal({
  isOpen,
  onClose,
  onContinue,
  booking,
  passengerCount = 1,
  serviceType,
}) {
  const [passengers, setPassengers] = useState([]);
  const { formatPrice } = useSettings();
  const type = normalizeType(serviceType || booking?.serviceType || booking?.type);
  const personLabels = getPersonLabels(type);
  const formRules = getFormRules(type);

  const safeCount = Number(passengerCount) > 0 ? Number(passengerCount) : 1;
  const basePrice = Number(booking?.price || 0);
  const taxes = 500;
  const totalPrice = basePrice * safeCount + taxes;

  const primary = passengers[0];
  const isReady = useMemo(() => {
    if (!passengers.length) return false;
    return passengers.every((p, idx) => isComplete(p, idx, formRules));
  }, [passengers, formRules]);

  useEffect(() => {
    if (isOpen) {
      setPassengers([]);
    }
  }, [isOpen, booking, safeCount]);

  if (!isOpen) return null;

  const handleContinue = () => {
    if (formRules.showContact && (!primary?.email || !primary?.phone)) return;
    const normalizedPassengers = passengers.map((p, idx) => {
      const { firstName, lastName } = splitName(p.name);
      return {
        type: p.type || "Adult",
        firstName,
        lastName,
        dob: p.dob,
        gender: p.gender,
        email: idx === 0 ? p.email : undefined,
        phone: idx === 0 ? p.phone : undefined,
      };
    });
    onContinue?.({
      primaryContact: formRules.showContact
        ? { email: primary.email, phone: primary.phone }
        : {},
      passengers: normalizedPassengers,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white text-[#0f294d] rounded-2xl p-6 w-[92%] max-w-5xl shadow-2xl border border-gray-200 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-gray-500">
              Booking Details
            </p>
            <h2 className="text-2xl font-bold text-[#0f294d]">
              {personLabels.heading}
            </h2>
          </div>
          <X className="cursor-pointer text-gray-600 hover:text-gray-900" onClick={onClose} />
        </div>

        <div className="grid lg:grid-cols-[2fr_1fr] gap-8">
          <div>
            <BookingForm
              key={safeCount}
              passengerCount={safeCount}
              onChange={setPassengers}
              serviceType={type}
              bookingData={booking}
              totalAmount={totalPrice}
            />
          </div>

          <div className="glass-card rounded-xl p-6 border border-gray-200 h-fit">
            <h3 className="text-lg font-bold text-[#0f294d]">Trip Summary</h3>
            <div className="mt-4 space-y-4 text-sm text-[#1e293b]">
              <div className="border-b border-gray-200 pb-4">
                <p className="font-semibold text-[#0f294d]">
                  {booking?.airlineName || booking?.airline}
                </p>
                <p className="text-gray-600">
                  {booking?.from} → {booking?.to}
                </p>
                <p className="text-gray-600">
                  {booking?.departure} • {booking?.arrival}
                </p>
                <p className="text-gray-600">{booking?.duration}</p>
              </div>

              <div>
                <p className="font-semibold text-[#0f294d] mb-2">
                  {personLabels.plural}
                </p>
                <div className="space-y-1">
                  {(passengers.length
                    ? passengers
                    : Array.from({ length: safeCount }, (_, i) => ({
                      name: `${personLabels.singular} ${i + 1}`,
                    }))
                  ).map((p, idx) => (
                    <p key={idx} className="text-gray-700">
                      {idx + 1}. {p.name || personLabels.singular}{" "}
                      {idx === 0 ? "(Primary)" : ""}
                    </p>
                  ))}
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4">
                <div className="flex justify-between text-sm">
                  <span>Base Fare</span>
                  <span className="font-semibold text-[#0a821c]">{formatPrice(basePrice)}</span>
                </div>
                <div className="flex justify-between text-sm mt-2">
                  <span>Taxes & Fees</span>
                  <span className="font-semibold text-[#0a821c]">{formatPrice(taxes)}</span>
                </div>
                <div className="flex justify-between text-base font-bold text-[#0f294d] mt-3">
                  <span>Total</span>
                  <span className="text-[#0a821c]">{formatPrice(totalPrice)}</span>
                </div>
              </div>
            </div>

            <button
              onClick={handleContinue}
              disabled={!isReady}
              className={`mt-6 w-full py-3 rounded-lg font-semibold transition shadow-md ${isReady
                  ? "bg-[#FFCC00] text-black hover:bg-[#f2c200]"
                  : "bg-gray-200 text-gray-400 cursor-not-allowed"
                }`}
            >
              Continue
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
