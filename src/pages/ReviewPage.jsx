import { useLocation, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { useState } from "react";
import MaintenanceModal from "../components/MaintenanceModal";
import { useSettings } from "../context/SettingsContext";

export default function ReviewPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { booking, leadData, service, searchData } = location.state || {};
  const passengerCount = Number(searchData?.passengers || 1);
  const [maintenanceOpen, setMaintenanceOpen] = useState(false);
  const passengers = leadData?.passengers || [];
  const primaryContact = leadData?.primaryContact;
  const { formatPrice } = useSettings();
  const basePrice = Number(booking?.price || 0);
  const totalPrice = basePrice * passengerCount + 500;
  const normalizedService = String(service || "flights").toLowerCase();
  const personLabels = (() => {
    switch (normalizedService) {
      case "hotels":
        return { singular: "Guest", plural: "Guests" };
      case "car_rental":
        return { singular: "Driver", plural: "Drivers" };
      case "packages":
      case "insurance":
      case "cruises":
        return { singular: "Traveler", plural: "Travelers" };
      case "bus":
      case "train":
      case "flights":
      default:
        return { singular: "Passenger", plural: "Passengers" };
    }
  })();

  if (!booking) {
    navigate("/");
    return null;
  }

  const handleProceed = async () => {
    try {
      const payload = {
        service,
        flightId: booking?.id,
        primaryContact: primaryContact || {},
        passengers: passengers.map((p) => ({
          type: p.type || "Adult",
          firstName: p.firstName,
          lastName: p.lastName,
          dob: p.dob,
          gender: p.gender,
        })),
        totalAmount: totalPrice,
        bookingDetails: booking,
      };
      console.log("Submitting Lead Payload:", payload);

      const res = await fetch("https://travalpro-backend-1.onrender.com/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errData = await res.json();
        console.error("Lead API Error:", errData);
      }
      setMaintenanceOpen(true);
    } catch (error) {
      console.error("Lead Save Error:", error);
    }
  };

  return (
    <div className="min-h-screen bg-white text-[#1e293b] page-fade-in">
      <Navbar />

      <div className="max-w-7xl mx-auto px-6 py-12 grid lg:grid-cols-3 gap-10">
        {/* LEFT - BOOKING + FORM */}
        <div className="lg:col-span-2 space-y-8">
          <div className="glass-card rounded-2xl p-8">
            <h2 className="text-2xl font-bold mb-6 text-[#0f294d] tracking-wide uppercase">
              Review Your {service?.toUpperCase()} Booking
            </h2>

            {service === "flights" && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    <img
                      src={`https://images.kiwi.com/airlines/64/${booking.airlineCode}.png`}
                      alt={booking.airlineName || booking.airline}
                      className="w-10 h-10 object-contain bg-white rounded-full p-1 border border-gray-200"
                      onError={(e) => {
                        e.target.src = "https://via.placeholder.com/48?text=✈";
                      }}
                    />
                    <div>
                      <p className="text-lg font-semibold text-[#0f294d]">
                        {booking.airlineName || booking.airline}
                      </p>
                      <p className="text-sm text-gray-600">Flight {booking.flightNumber || booking.flight}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Duration: {booking.duration}</p>
                  </div>
                </div>

                <div className="glass-card border border-gray-200 p-6 rounded-xl">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-xl font-bold text-[#0f294d]">{booking.departure}</p>
                      <p className="text-sm text-gray-600">{booking.from}</p>
                    </div>
                    <div className="text-center">
                      <div className="w-24 h-px bg-gray-300"></div>
                      <p className="text-xs mt-1 text-gray-600">Non-stop</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-[#0f294d]">{booking.arrival}</p>
                      <p className="text-sm text-gray-600">{booking.to}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="mt-8">
              <h3 className="font-semibold text-lg mb-4 text-[#0f294d]">
                Contact Information
              </h3>

              <div className="glass-card border border-gray-200 p-6 rounded-xl space-y-2">
                <p className="text-gray-700">
                  Email: <span className="font-medium">{primaryContact?.email}</span>
                </p>
                <p className="text-gray-700">
                  Phone: <span className="font-medium">{primaryContact?.phone}</span>
                </p>
              </div>
            </div>
          </div>

          <div className="glass-card rounded-2xl p-8">
            <h3 className="text-xl font-bold text-[#0f294d] mb-4 tracking-wide uppercase">
              {personLabels.plural} Details
            </h3>
            <div className="space-y-3 text-sm text-gray-700">
              {(passengers.length
                ? passengers
                : Array.from({ length: passengerCount }, (_, i) => ({
                  firstName: `${personLabels.singular} ${i + 1}`,
                }))
              ).map((p, idx) => (
                <div key={idx} className="flex justify-between border-b border-gray-200 pb-2">
                  <span>
                    {personLabels.singular} {idx + 1}: {p.firstName || personLabels.singular} {p.lastName || ""}
                  </span>
                  <span className="text-gray-500">{p.gender || "—"}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT - SUMMARY */}
        <div className="space-y-6">
          <div className="glass-card rounded-2xl p-8 border border-gray-200">
            <h3 className="font-semibold text-lg mb-6 text-[#0f294d] tracking-wide uppercase">
              Review Your Itinerary
            </h3>

            <div className="space-y-4 text-sm text-gray-800">
              <div className="flex justify-between">
                <span className="font-semibold text-[#0f294d]">Flight</span>
                <span>{booking?.airlineName || booking?.airline}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>{booking?.from} → {booking?.to}</span>
                <span>{booking?.duration}</span>
              </div>
              <div className="border-t border-gray-200 pt-3">
                <p className="font-semibold text-[#0f294d] mb-2">{personLabels.plural}</p>
                <div className="space-y-1">
                  {(passengers.length
                    ? passengers
                    : Array.from({ length: passengerCount }, (_, i) => ({
                      firstName: `${personLabels.singular} ${i + 1}`,
                    })))
                    .map((p, idx) => (
                      <p key={idx} className="text-gray-700">
                        {(p.firstName || personLabels.singular)} {p.lastName || ""} {idx === 0 && "(Contact)"}
                      </p>
                    ))}
                </div>
                <div className="mt-3 text-xs text-gray-600">
                  Primary Contact: {primaryContact?.email || "—"} • {primaryContact?.phone || "—"}
                </div>
              </div>
            </div>

          </div>

          <div className="glass-card rounded-2xl p-8 border border-gray-200 h-fit">
            <h3 className="font-semibold text-lg mb-6 text-[#0f294d]">
              Fare Summary
            </h3>

            <div className="space-y-4 text-sm text-gray-700">
              <div className="flex justify-between">
                <span>Base Fare</span>
                <span className="font-medium text-[#0a821c]">{formatPrice(basePrice)}</span>
              </div>

              <div className="flex justify-between">
                <span>Taxes & Fees</span>
                <span className="font-medium text-[#0a821c]">{formatPrice(500)}</span>
              </div>

              <div className="border-t border-gray-200 pt-4 flex justify-between text-lg font-bold text-[#0f294d]">
                <span>Total</span>
                <span className="text-[#0a821c]">{formatPrice(basePrice + 500)}</span>
              </div>
            </div>

            <div className="mt-6 border border-gray-200 rounded-xl p-4 bg-[#f2f7fd]">
              <p className="text-sm font-semibold text-[#0f294d] mb-2">Review Summary</p>
              <div className="text-sm text-gray-700 space-y-1">
                {(passengers.length
                  ? passengers
                  : Array.from({ length: passengerCount }, (_, i) => ({
                    firstName: `${personLabels.singular} ${i + 1}`,
                  })))
                  .map((p, idx) => (
                    <p key={idx}>
                      {personLabels.singular} {idx + 1}: {(p.firstName || personLabels.singular)} {p.lastName || ""}
                    </p>
                  ))}
                <p className="font-bold text-[#0a821c] mt-2">
                  Total Price: {formatPrice(totalPrice)}
                </p>
              </div>
            </div>

            <button
              onClick={handleProceed}
              className="mt-6 w-full bg-[#FFCC00] hover:bg-[#f2c200] text-black py-3 rounded-lg font-semibold transition shadow-md"
            >
              Confirm & Pay
            </button>
          </div>
        </div>
      </div>

      <MaintenanceModal
        isOpen={maintenanceOpen}
        onClose={() => setMaintenanceOpen(false)}
        booking={booking}
      />
    </div>
  );
}
