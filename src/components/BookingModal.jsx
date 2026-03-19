import { X, Phone, Shield, TrendingUp, ArrowRight, User, Mail } from "lucide-react";
import { useEffect, useState } from "react";
import { useSettings } from "../context/SettingsContext";

const normalizeType = (type) => {
  const t = String(type || "").toLowerCase().trim();
  if (t === "hotel") return "hotels";
  if (t === "car" || t === "cars") return "car_rental";
  return t || "flights";
};

const splitName = (fullName) => {
  const parts = String(fullName || "").trim().split(/\s+/);
  return {
    firstName: parts[0] || "",
    lastName: parts.slice(1).join(" "),
  };
};

// Fake competitor prices for live price check
const getFakePrices = (ourPrice) => {
  const base = Number(ourPrice || 400);
  return [
    { label: "Major Carrier", price: Math.round(base * 1.45 + 80) },
    { label: "Expedia / Kayak", price: Math.round(base * 1.38 + 55) },
  ];
};

const serviceLabels = {
  flights: { noun: "Flight", seats: "economy class seats" },
  hotels: { noun: "Hotel", seats: "rooms" },
  car_rental: { noun: "Car", seats: "vehicles" },
  cruises: { noun: "Cruise", seats: "cabins" },
  bus: { noun: "Bus", seats: "seats" },
  train: { noun: "Train", seats: "seats" },
  insurance: { noun: "Plan", seats: "plans" },
};

export default function BookingModal({
  isOpen,
  onClose,
  onContinue,
  booking,
  passengerCount = 1,
  serviceType,
  resultsCount = 1,
}) {
  const { formatPrice } = useSettings();
  const type = normalizeType(serviceType || booking?.serviceType || booking?.type);
  const safeCount = Number(passengerCount) > 0 ? Number(passengerCount) : 1;
  const basePrice = Number(booking?.price || 0);
  const taxes = 500;
  const totalPrice = basePrice * safeCount + taxes;
  const competitors = getFakePrices(totalPrice);
  const svcLabel = serviceLabels[type] || serviceLabels.flights;

  const [form, setForm] = useState({ name: "", email: "", phone: "" });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) setForm({ name: "", email: "", phone: "" });
  }, [isOpen]);

  if (!isOpen) return null;

  const isReady = form.name.trim() && form.email.trim() && form.phone.trim();

  const handleSubmit = async () => {
    if (!isReady || loading) return;
    setLoading(true);
    const { firstName, lastName } = splitName(form.name);
    await new Promise((r) => setTimeout(r, 300)); // small UX delay
    onContinue?.({
      primaryContact: { email: form.email, phone: form.phone },
      passengers: [
        {
          type: "Adult",
          firstName,
          lastName,
          gender: "Male",
          email: form.email,
          phone: form.phone,
        },
        ...Array.from({ length: safeCount - 1 }, (_, i) => ({
          type: "Adult",
          firstName: `Passenger`,
          lastName: `${i + 2}`,
        })),
      ],
    });
    setLoading(false);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
    >
      <div
        className="relative w-full flex overflow-hidden"
        style={{
          maxWidth: "900px",
          borderRadius: "20px",
          boxShadow: "0 24px 80px rgba(0,0,0,0.3)",
          maxHeight: "90vh",
        }}
      >
        {/* ── LEFT PANEL ──────────────────────────────── */}
        <div
          className="hidden md:flex flex-col justify-between p-10"
          style={{
            width: "42%",
            background: "linear-gradient(155deg, #1a3a6e 0%, #0f294d 60%, #0a1e3d 100%)",
            color: "#fff",
            flexShrink: 0,
          }}
        >
          {/* Top badge */}
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              background: "#FFCC00",
              color: "#0f294d",
              borderRadius: "4px",
              padding: "4px 10px",
              fontSize: "0.75rem",
              fontWeight: "900",
              letterSpacing: "0.02em",
              width: "fit-content",
              marginBottom: "16px",
            }}
          >
            {resultsCount} OFFERS FOUND
          </div>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              background: "rgba(255,255,255,0.12)",
              borderRadius: "99px",
              padding: "6px 14px",
              fontSize: "0.78rem",
              fontWeight: "600",
              letterSpacing: "0.04em",
              width: "fit-content",
              marginBottom: "28px",
            }}
          >
            ✈ TRAVALPRO EXCLUSIVE
          </div>

          {/* Headline */}
          <div style={{ flex: 1 }}>
            <h2
              style={{
                fontSize: "1.75rem",
                fontWeight: "800",
                lineHeight: 1.2,
                marginBottom: "16px",
              }}
            >
              Great news! We found unpublished rates.
            </h2>
            <div
              style={{
                width: "40px",
                height: "3px",
                background: "#FFCC00",
                borderRadius: "2px",
                marginBottom: "20px",
              }}
            />
            <p style={{ fontSize: "0.95rem", color: "rgba(255,255,255,0.8)", lineHeight: 1.6 }}>
              We have identified {safeCount} unsold {svcLabel.seats} for your trip
              {booking?.to ? ` to ${booking.to}` : ""}. These rates are time-sensitive.
            </p>
          </div>

          {/* Live price check */}
          <div
            style={{
              background: "rgba(255,255,255,0.08)",
              border: "1px solid rgba(255,255,255,0.15)",
              borderRadius: "16px",
              padding: "20px",
              marginTop: "32px",
            }}
          >
            <p
              style={{
                fontSize: "0.72rem",
                fontWeight: "700",
                letterSpacing: "0.1em",
                color: "#FFCC00",
                marginBottom: "14px",
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              <TrendingUp size={14} /> LIVE PRICE CHECK
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {competitors.map((c) => (
                <div
                  key={c.label}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: "0.88rem",
                    color: "rgba(255,255,255,0.75)",
                  }}
                >
                  <span>{c.label}</span>
                  <span style={{ textDecoration: "line-through", color: "rgba(255,255,255,0.5)" }}>
                    {formatPrice(c.price)}
                  </span>
                </div>
              ))}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginTop: "8px",
                  paddingTop: "10px",
                  borderTop: "1px solid rgba(255,255,255,0.15)",
                  fontWeight: "800",
                  fontSize: "1rem",
                }}
              >
                <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <Shield size={14} color="#FFCC00" /> Our Rate
                </span>
                <span style={{ color: "#FFCC00" }}>{formatPrice(totalPrice)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── RIGHT PANEL ──────────────────────────────────── */}
        <div
          style={{
            flex: 1,
            background: "#fff",
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* Close button */}
          <button
            onClick={onClose}
            style={{
              position: "absolute",
              top: "16px",
              right: "16px",
              background: "rgba(0,0,0,0.08)",
              border: "none",
              borderRadius: "50%",
              width: "32px",
              height: "32px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              zIndex: 10,
            }}
          >
            <X size={16} color="#444" />
          </button>

          {/* Flight summary card */}
          <div
            style={{
              background: "#f0f6ff",
              borderBottom: "1px solid #dbeafe",
              padding: "20px 28px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              {booking?.airlineCode && (
                <img
                  src={`https://images.kiwi.com/airlines/64/${booking.airlineCode}.png`}
                  alt={booking.airlineName}
                  onError={(e) => { e.target.src = "https://via.placeholder.com/40?text=✈"; }}
                  style={{ width: "40px", height: "40px", objectFit: "contain", borderRadius: "8px", background: "#fff", padding: "4px" }}
                />
              )}
              <div>
                <p style={{ fontWeight: "700", color: "#0f294d", fontSize: "0.95rem" }}>
                  {booking?.airlineName || booking?.title || `${svcLabel.noun} Booking`}
                  {booking?.flightNumber ? ` • ${booking.flightNumber}` : ""}
                </p>
                <p style={{ fontSize: "0.8rem", color: "#64748b" }}>
                  {booking?.from && booking?.to
                    ? `${booking.from?.split(" - ")[0]} → ${booking.to?.split(" - ")[0]}`
                    : booking?.subtitle || "Your selected option"}
                  {booking?.date ? ` • ${booking.date}` : ""}
                </p>
              </div>
            </div>
          </div>

          {/* Phone CTA */}
          <div
            style={{
              background: "#fff5f5",
              border: "1px solid #fecaca",
              margin: "20px 28px 0",
              borderRadius: "12px",
              padding: "14px 18px",
              textAlign: "center",
            }}
          >
            <p style={{ fontSize: "0.72rem", fontWeight: "800", color: "#dc2626", letterSpacing: "0.08em", marginBottom: "4px" }}>
              BOOK THIS DEAL WITH AN EXPERT
            </p>
            <p style={{ fontSize: "0.78rem", color: "#ef4444", marginBottom: "10px" }}>
              Skip the form and lock in this rate instantly.
            </p>
            <a
              href="tel:+18005180250"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "10px",
                background: "#dc2626",
                color: "#fff",
                borderRadius: "10px",
                padding: "13px 20px",
                fontWeight: "800",
                fontSize: "1.25rem",
                textDecoration: "none",
                letterSpacing: "0.02em",
              }}
            >
              <Phone size={20} fill="white" />
              +1-855-668-7787
            </a>
          </div>

          {/* Lead form */}
          <div style={{ padding: "24px 28px 28px", flex: 1 }}>
            <h3 style={{ fontWeight: "800", fontSize: "1.2rem", color: "#0f172a", marginBottom: "4px" }}>
              Unlock Your {svcLabel.noun} Deal
            </h3>
            <p style={{ fontSize: "0.85rem", color: "#64748b", marginBottom: "20px" }}>
              Enter your details to reveal the discounted price and itinerary.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {/* Full Name */}
              <div>
                <label style={{ fontSize: "0.85rem", fontWeight: "600", color: "#334155", display: "block", marginBottom: "6px" }}>
                  Full Name
                </label>
                <div style={{ position: "relative" }}>
                  <User size={16} color="#94a3b8" style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)" }} />
                  <input
                    type="text"
                    placeholder="e.g. John Doe"
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                    style={{
                      width: "100%",
                      padding: "12px 14px 12px 40px",
                      border: "1.5px solid #e2e8f0",
                      borderRadius: "10px",
                      fontSize: "0.9rem",
                      outline: "none",
                      boxSizing: "border-box",
                      fontFamily: "inherit",
                    }}
                    onFocus={(e) => (e.target.style.borderColor = "#3b82f6")}
                    onBlur={(e) => (e.target.style.borderColor = "#e2e8f0")}
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label style={{ fontSize: "0.85rem", fontWeight: "600", color: "#334155", display: "block", marginBottom: "6px" }}>
                  Email Address
                </label>
                <div style={{ position: "relative" }}>
                  <Mail size={16} color="#94a3b8" style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)" }} />
                  <input
                    type="email"
                    placeholder="john@example.com"
                    value={form.email}
                    onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                    style={{
                      width: "100%",
                      padding: "12px 14px 12px 40px",
                      border: "1.5px solid #e2e8f0",
                      borderRadius: "10px",
                      fontSize: "0.9rem",
                      outline: "none",
                      boxSizing: "border-box",
                      fontFamily: "inherit",
                    }}
                    onFocus={(e) => (e.target.style.borderColor = "#3b82f6")}
                    onBlur={(e) => (e.target.style.borderColor = "#e2e8f0")}
                  />
                </div>
              </div>

              {/* Phone */}
              <div>
                <label style={{ fontSize: "0.85rem", fontWeight: "600", color: "#334155", display: "block", marginBottom: "6px" }}>
                  Phone Number
                </label>
                <div style={{ position: "relative" }}>
                  <Phone size={16} color="#94a3b8" style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)" }} />
                  <input
                    type="tel"
                    placeholder="(555) 123-4567"
                    value={form.phone}
                    onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                    style={{
                      width: "100%",
                      padding: "12px 14px 12px 40px",
                      border: "1.5px solid #e2e8f0",
                      borderRadius: "10px",
                      fontSize: "0.9rem",
                      outline: "none",
                      boxSizing: "border-box",
                      fontFamily: "inherit",
                    }}
                    onFocus={(e) => (e.target.style.borderColor = "#3b82f6")}
                    onBlur={(e) => (e.target.style.borderColor = "#e2e8f0")}
                  />
                </div>
                <p style={{ fontSize: "0.75rem", color: "#64748b", marginTop: "6px", display: "flex", alignItems: "center", gap: "5px" }}>
                  <span style={{ color: "#22c55e", fontSize: "0.85rem" }}>●</span>
                  Your privacy is protected. No spam.
                </p>
              </div>

              {/* Submit */}
              <button
                onClick={handleSubmit}
                disabled={!isReady || loading}
                style={{
                  width: "100%",
                  padding: "14px",
                  borderRadius: "10px",
                  background: isReady ? "#dc2626" : "#e2e8f0",
                  color: isReady ? "#fff" : "#94a3b8",
                  fontWeight: "700",
                  fontSize: "1rem",
                  border: "none",
                  cursor: isReady ? "pointer" : "not-allowed",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  transition: "background 0.2s, transform 0.1s",
                }}
                onMouseEnter={(e) => { if (isReady) e.target.style.background = "#b91c1c"; }}
                onMouseLeave={(e) => { if (isReady) e.target.style.background = "#dc2626"; }}
              >
                {loading ? "Processing..." : <>Reveal Discounted Price <ArrowRight size={18} /></>}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
