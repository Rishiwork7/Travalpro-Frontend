import { useEffect, useRef, useState } from "react";
import { Phone, X, Shield, Clock, Tag, Star } from "lucide-react";
import { playNotificationSound } from "../utils/sounds";

const PHONE = "(800) 518-0250";
const PROMO_COUNT = Math.floor(Math.random() * 3) + 3; // 3–5

export default function CallPopup() {
  const [isVisible, setIsVisible] = useState(false);
  const [seconds, setSeconds] = useState(597); // ~10 min countdown
  const timerRef = useRef(null);
  const countdownRef = useRef(null);

  // Show after 15s, re-show after 60s on close
  useEffect(() => {
    timerRef.current = setTimeout(() => {
      setIsVisible(true);
      playNotificationSound();
    }, 15000);
    return () => clearTimeout(timerRef.current);
  }, []);

  // Countdown timer
  useEffect(() => {
    if (!isVisible) return;
    countdownRef.current = setInterval(() => {
      setSeconds((s) => (s > 0 ? s - 1 : 0));
    }, 1000);
    return () => clearInterval(countdownRef.current);
  }, [isVisible]);

  const handleClose = () => {
    setIsVisible(false);
    clearInterval(countdownRef.current);
    timerRef.current = setTimeout(() => {
      setIsVisible(true);
      setSeconds(597);
    }, 60000);
  };

  if (!isVisible) return null;

  const mins = String(Math.floor(seconds / 60)).padStart(2, "0");
  const secs = String(seconds % 60).padStart(2, "0");

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ background: "rgba(0,0,0,0.65)", backdropFilter: "blur(6px)" }}
    >
      <div
        className="relative w-full overflow-hidden"
        style={{
          maxWidth: "460px",
          borderRadius: "24px",
          boxShadow: "0 32px 80px rgba(0,0,0,0.4)",
          animation: "popupIn 0.35s cubic-bezier(0.34,1.56,0.64,1) both",
        }}
      >
        {/* ── TOP URGENCY STRIP ── */}
        <div
          style={{
            background: "linear-gradient(90deg, #b91c1c, #dc2626)",
            padding: "10px 20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "10px",
          }}
        >
          <Clock size={14} color="white" />
          <p style={{ color: "white", fontSize: "0.78rem", fontWeight: "800", letterSpacing: "0.06em" }}>
            DEAL EXPIRES IN&nbsp;
            <span style={{ color: "#FFCC00", fontVariantNumeric: "tabular-nums" }}>
              {mins}:{secs}
            </span>
            &nbsp;— ACT NOW
          </p>
        </div>

        {/* ── MAIN BODY ── */}
        <div style={{ background: "#fff" }}>
          {/* Header */}
          <div
            style={{
              background: "linear-gradient(160deg, #1a3a6e 0%, #0f294d 100%)",
              padding: "32px 28px 28px",
              textAlign: "center",
              position: "relative",
            }}
          >
            {/* Close */}
            <button
              onClick={handleClose}
              style={{
                position: "absolute",
                top: "14px",
                right: "14px",
                background: "rgba(255,255,255,0.12)",
                border: "none",
                borderRadius: "50%",
                width: "30px",
                height: "30px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
              }}
            >
              <X size={15} color="white" />
            </button>

            {/* Icon badge */}
            <div
              style={{
                width: "64px",
                height: "64px",
                borderRadius: "50%",
                background: "linear-gradient(135deg, #FFCC00, #f59e0b)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 16px",
                boxShadow: "0 8px 24px rgba(255,204,0,0.4)",
              }}
            >
              <Tag size={28} color="#0f294d" />
            </div>

            <p style={{ color: "#FFCC00", fontSize: "0.75rem", fontWeight: "900", letterSpacing: "0.12em", marginBottom: "8px" }}>
              🔒 EXCLUSIVE MEMBERS-ONLY RATE
            </p>
            <h2
              style={{
                color: "white",
                fontSize: "1.7rem",
                fontWeight: "900",
                lineHeight: 1.2,
                margin: 0,
              }}
            >
              Wait! Don't Overpay.
            </h2>
            <p style={{ color: "rgba(255,255,255,0.75)", marginTop: "8px", fontSize: "0.95rem" }}>
              We have one last secret deal for you.
            </p>
          </div>

          {/* Body */}
          <div style={{ padding: "24px 28px" }}>
            {/* Promo code banner */}
            <div
              style={{
                background: "linear-gradient(90deg, #fff7ed, #fef3c7)",
                border: "1.5px solid #f59e0b",
                borderRadius: "14px",
                padding: "14px 18px",
                textAlign: "center",
                marginBottom: "20px",
              }}
            >
              <p style={{ fontSize: "0.88rem", color: "#78350f", margin: 0, lineHeight: 1.5 }}>
                Our agents have{" "}
                <strong style={{ color: "#b45309" }}>{PROMO_COUNT} unpublished promo codes</strong>{" "}
                remaining for today. Call now to claim an extra{" "}
                <strong style={{ color: "#dc2626", fontSize: "1.05rem" }}>5% OFF</strong> our
                wholesale rates.
              </p>
            </div>

            {/* Trust pills */}
            <div style={{ display: "flex", gap: "8px", justifyContent: "center", marginBottom: "20px", flexWrap: "wrap" }}>
              {[
                { icon: <Shield size={12} />, text: "Price Match Guarantee" },
                { icon: <Star size={12} />, text: "4.7★ Trustpilot" },
              ].map((p) => (
                <div
                  key={p.text}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "5px",
                    background: "#f0fdf4",
                    border: "1px solid #bbf7d0",
                    borderRadius: "999px",
                    padding: "4px 12px",
                    fontSize: "0.75rem",
                    fontWeight: "700",
                    color: "#166534",
                  }}
                >
                  {p.icon} {p.text}
                </div>
              ))}
            </div>

            {/* CTA button */}
            <a
              href={`tel:+1${PHONE.replace(/\D/g, "")}`}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "12px",
                background: "linear-gradient(135deg, #1e3a8a, #1d4ed8)",
                color: "white",
                borderRadius: "14px",
                padding: "16px 20px",
                fontWeight: "800",
                fontSize: "1.2rem",
                textDecoration: "none",
                boxShadow: "0 8px 24px rgba(29,78,216,0.35)",
                transition: "transform 0.15s, box-shadow 0.15s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow = "0 12px 32px rgba(29,78,216,0.45)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 8px 24px rgba(29,78,216,0.35)";
              }}
            >
              <Phone size={20} fill="white" />
              Call {PHONE} Now
            </a>

            {/* Dismiss */}
            <button
              onClick={handleClose}
              style={{
                display: "block",
                width: "100%",
                background: "none",
                border: "none",
                marginTop: "14px",
                fontSize: "0.8rem",
                color: "#94a3b8",
                cursor: "pointer",
                textAlign: "center",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#64748b")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "#94a3b8")}
            >
              No thanks, I prefer paying full price
            </button>
          </div>
        </div>
      </div>

      {/* Keyframe animation */}
      <style>{`
        @keyframes popupIn {
          from { opacity: 0; transform: scale(0.88) translateY(20px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </div>
  );
}
