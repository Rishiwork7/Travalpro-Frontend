import { useMemo, useState } from "react";
import {
  CheckCircle,
  User,
  Mail,
  Phone,
  IdCard,
  Calendar,
  Users,
} from "lucide-react";

const normalizeType = (type) => {
  const t = String(type || "").toLowerCase().trim();
  if (t === "hotel") return "hotels";
  if (t === "car" || t === "cars") return "car_rental";
  return t || "flights";
};

const getFormConfig = (type) => {
  const serviceType = normalizeType(type);
  switch (serviceType) {
    case "hotels":
      return {
        title: "Guest Details",
        nameLabel: "Primary Guest Name",
        showAgeGender: false,
        showContact: true,
        showLicense: false,
      };
    case "car_rental":
      return {
        title: "Driver Details",
        nameLabel: "Main Driver Name",
        showAgeGender: false,
        showContact: true,
        showLicense: true,
      };
    case "packages":
    case "insurance":
      return {
        title: "Booker Details",
        nameLabel: "Lead Traveler Name",
        showAgeGender: false,
        showContact: true,
        showLicense: false,
      };
    case "flights":
    case "bus":
    case "train":
    default:
      return {
        title: "Passenger Details",
        nameLabel: "Passenger Name",
        showAgeGender: true,
        showContact: true,
        showLicense: false,
      };
  }
};

const buildEntry = () => ({
  name: "",
  age: "",
  gender: "Male",
  email: "",
  phone: "",
  license: "",
});

import { useSettings } from "../context/SettingsContext";

export default function BookingForm({
  passengerCount = 1,
  onChange,
  serviceType = "flights",
  bookingData,
  totalAmount,
  onSubmit,
}) {
  const { formatPrice } = useSettings();
  const safeCount = Number(passengerCount) > 0 ? Number(passengerCount) : 1;
  const [entries, setEntries] = useState(
    Array.from({ length: safeCount }, () => buildEntry())
  );
  const [success, setSuccess] = useState(false);

  const config = useMemo(() => getFormConfig(serviceType), [serviceType]);

  const updateEntry = (index, field, value) => {
    const updated = entries.map((p, i) =>
      i === index ? { ...p, [field]: value } : p
    );
    setEntries(updated);
    onChange?.(updated);
  };

  const isComplete = (entry, index) => {
    if (!String(entry.name || "").trim()) return false;
    if (config.showAgeGender) {
      if (!String(entry.age || "").trim()) return false;
      if (!String(entry.gender || "").trim()) return false;
    }
    if (config.showContact && index === 0) {
      if (!String(entry.email || "").trim()) return false;
      if (!String(entry.phone || "").trim()) return false;
    }
    return true;
  };

  const canSubmit = entries.every((entry, idx) => isComplete(entry, idx));

  const handlePay = () => {
    if (!canSubmit) return;
    onSubmit?.(entries);
    setSuccess(true);
  };

  if (success) {
    return (
      <div className="glass-card rounded-2xl p-8 text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
        <h3 className="text-xl font-bold text-[#0f294d]">Booking Confirmed</h3>
        <p className="text-gray-600 mt-2">
          Your booking has been successfully processed.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="glass-card rounded-xl p-4 border border-gray-200">
        <p className="text-xs uppercase tracking-wide text-gray-500">
          Booking Summary
        </p>
        <div className="mt-3 flex items-center gap-4">
          {bookingData?.image && (
            <img
              src={bookingData.image}
              alt={bookingData.title || bookingData.operatorName || "Booking"}
              className="w-16 h-16 rounded-lg object-cover"
            />
          )}
          <div className="flex-1">
            <p className="font-semibold text-[#0f294d]">
              {bookingData?.title || bookingData?.operatorName || "Your Booking"}
            </p>
            <p className="text-sm text-gray-500">
              {bookingData?.subtitle || "Review your details below."}
            </p>
          </div>
          {typeof totalAmount !== "undefined" && (
            <div className="text-right">
              <p className="text-xs text-gray-500">Total</p>
              <p className="font-bold text-[#0f294d]">
                {formatPrice(totalAmount)}
              </p>
            </div>
          )}
        </div>
      </div>

      <div>
        <h3 className="font-bold text-lg text-[#0f294d] mb-4 flex items-center gap-2">
          <Users className="w-5 h-5 text-[#0f294d]" />
          {config.title}
        </h3>
        <div className="space-y-4">
          {entries.map((entry, idx) => (
            <div key={idx} className="glass-card rounded-xl p-4">
              <p className="text-sm font-semibold text-[#0f294d] mb-4">
                {config.title} {idx + 1}
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                <div className={config.showContact ? "md:col-span-2" : ""}>
                  <label className="text-sm text-gray-700 font-medium mb-1 block">
                    {config.nameLabel}
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      className="input-style pl-9"
                      placeholder={`Enter ${config.nameLabel}`}
                      value={entry.name}
                      onChange={(e) => updateEntry(idx, "name", e.target.value)}
                      required
                    />
                  </div>
                </div>

                {config.showAgeGender && (
                  <>
                    <div>
                      <label className="text-sm text-gray-700 font-medium mb-1 block">
                        Age
                      </label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="number"
                          className="input-style pl-9"
                          placeholder="Enter age"
                          value={entry.age}
                          onChange={(e) =>
                            updateEntry(idx, "age", e.target.value)
                          }
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-sm text-gray-700 font-medium mb-1 block">
                        Gender
                      </label>
                      <select
                        className="input-style"
                        value={entry.gender}
                        onChange={(e) =>
                          updateEntry(idx, "gender", e.target.value)
                        }
                        required
                      >
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </>
                )}

                {config.showContact && idx === 0 && (
                  <>
                    <div>
                      <label className="text-sm text-gray-700 font-medium mb-1 block">
                        Email
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="email"
                          className="input-style pl-9"
                          placeholder="name@example.com"
                          value={entry.email}
                          onChange={(e) =>
                            updateEntry(idx, "email", e.target.value)
                          }
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-sm text-gray-700 font-medium mb-1 block">
                        Mobile Number
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="tel"
                          className="input-style pl-9"
                          placeholder="Enter mobile number"
                          value={entry.phone}
                          onChange={(e) =>
                            updateEntry(idx, "phone", e.target.value)
                          }
                          required
                        />
                      </div>
                    </div>
                  </>
                )}

                {config.showLicense && (
                  <div className="md:col-span-2">
                    <label className="text-sm text-gray-700 font-medium mb-1 block">
                      Driving License (Optional)
                    </label>
                    <div className="relative">
                      <IdCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        className="input-style pl-9"
                        placeholder="Enter license number"
                        value={entry.license}
                        onChange={(e) =>
                          updateEntry(idx, "license", e.target.value)
                        }
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <button
        onClick={handlePay}
        disabled={!canSubmit}
        className={`w-full py-3 rounded-lg font-semibold transition ${canSubmit
          ? "bg-[#0a821c] text-white hover:bg-[#086a16]"
          : "bg-gray-200 text-gray-400 cursor-not-allowed"
          }`}
      >
        {normalizeType(serviceType) === "insurance" ? "Get Quote" : "Pay / Book Now"}
      </button>
    </div>
  );
}
