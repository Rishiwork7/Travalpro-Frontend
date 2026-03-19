import { useEffect, useRef, useState } from "react";
import { Phone, X, Zap, Clock, Star, CheckCircle } from "lucide-react";
import { playNotificationSound } from "../utils/sounds";

const PHONE = "(800) 518-0250";
const SAVINGS = Math.floor(Math.random() * 200 + 150); // $150–$349

export default function CallPopup() {
  const [isVisible, setIsVisible] = useState(false);
  const [seconds, setSeconds] = useState(597);
  const timerRef = useRef(null);
  const countdownRef = useRef(null);

  useEffect(() => {
    timerRef.current = setTimeout(() => {
      setIsVisible(true);
      playNotificationSound();
    }, 15000);
    return () => clearTimeout(timerRef.current);
  }, []);

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
      style={{ background: "rgba(0,0,0,0.70)", backdropFilter: "blur(8px)" }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "440px",
          borderRadius: "28px",
          overflow: "hidden",
          boxShadow: "0 40px 100px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.08)",
          animation: "popupIn 0.4s cubic-bezier(0.34,1.56,0.64,1) both",
          position: "relative",
        }}
      >
        {/* ── COUNTDOWN BANNER ── */}
        <div
          style={{
            background: "linear-gradient(90deg, #1d4ed8, #2563eb)",
            padding: "9px 20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
          }}
        >
          <Clock size={13} color="#FFDD00" strokeWidth={3} />
          <p style={{ color: "white", fontSize: "0.76rem", fontWeight: "800", letterSpacing: "0.07em", margin: 0 }}>
            LIMITED OFFER EXPIRES IN&nbsp;
            <span
              style={{
                color: "#FFDD00",
                background: "rgba(0,0,0,0.25)",
                borderRadius: "6px",
                padding: "1px 7px",
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {mins}:{secs}
            </span>
          </p>
        </div>

        {/* ── HEADER ── */}
        <div
          style={{
            background: "linear-gradient(145deg, #0c1f44 0%, #1a3a6e 60%, #0f2d58 100%)",
            padding: "36px 30px 30px",
            textAlign: "center",
            position: "relative",
          }}
        >
          {/* Close button */}
          <button
            onClick={handleClose}
            style={{
              position: "absolute",
              top: "14px",
              right: "14px",
              background: "rgba(255,255,255,0.1)",
              border: "1px solid rgba(255,255,255,0.15)",
              borderRadius: "50%",
              width: "32px",
              height: "32px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              transition: "background 0.2s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.2)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.1)")}
          >
            <X size={15} color="white" />
          </button>

          {/* Glow badge */}
          <div
            style={{
              width: "72px",
              height: "72px",
              borderRadius: "50%",
              background: "linear-gradient(135deg, #FFDD00, #f5c400)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 18px",
              boxShadow: "0 0 0 10px rgba(255,221,0,0.15), 0 8px 28px rgba(255,221,0,0.45)",
            }}
          >
            <Zap size={32} color="#0f294d" fill="#0f294d" />
          </div>

          <p
            style={{
              color: "#FFDD00",
              fontSize: "0.72rem",
              fontWeight: "900",
              letterSpacing: "0.14em",
              margin: "0 0 10px",
            }}
          >
            ✈️ &nbsp;FLASH DEAL — TODAY ONLY
          </p>
          <h2
            style={{
              color: "white",
              fontSize: "1.85rem",
              fontWeight: "900",
              lineHeight: 1.15,
              margin: "0 0 10px",
            }}
          >
            Save Up to&nbsp;
            <span style={{ color: "#FFDD00" }}>${SAVINGS}</span>
            <br />on Your Flight!
          </h2>
          <p style={{ color: "rgba(255,255,255,0.65)", fontSize: "0.92rem", margin: 0 }}>
            Speak to a live agent and unlock exclusive wholesale fares — not available online.
          </p>
        </div>

        {/* ── BODY ── */}
        <div style={{ background: "#fff", padding: "26px 28px" }}>

          {/* Trust checklist */}
          <div style={{ marginBottom: "22px", display: "flex", flexDirection: "column", gap: "9px" }}>
            {[
              "Unpublished wholesale fares not online",
              "No booking fees — ever",
              "Price match guarantee + 24/7 support",
            ].map((item) => (
              <div key={item} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <CheckCircle size={16} color="#1d4ed8" strokeWidth={2.5} />
                <span style={{ fontSize: "0.87rem", color: "#374151", fontWeight: "600" }}>{item}</span>
              </div>
            ))}
          </div>

          {/* Rating pill */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "6px",
              background: "#fefce8",
              border: "1.5px solid #FFDD00",
              borderRadius: "999px",
              padding: "6px 16px",
              width: "fit-content",
              margin: "0 auto 22px",
            }}
          >
            {[...Array(5)].map((_, i) => (
              <Star key={i} size={13} fill="#f5c400" color="#f5c400" />
            ))}
            <span style={{ fontSize: "0.78rem", fontWeight: "700", color: "#78350f" }}>
              4.8 / 5 — 12,000+ Happy Travelers
            </span>
          </div>

          {/* CTA Button */}
          <a
            href={`tel:+1${PHONE.replace(/\D/g, "")}`}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "12px",
              background: "linear-gradient(135deg, #1d4ed8, #2563eb)",
              color: "white",
              borderRadius: "16px",
              padding: "17px 20px",
              fontWeight: "900",
              fontSize: "1.25rem",
              textDecoration: "none",
              boxShadow: "0 8px 28px rgba(29,78,216,0.4)",
              transition: "transform 0.15s, box-shadow 0.15s",
              letterSpacing: "0.01em",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow = "0 14px 36px rgba(29,78,216,0.55)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 8px 28px rgba(29,78,216,0.4)";
            }}
          >
            <Phone size={22} fill="white" />
            Call {PHONE}
          </a>

          {/* Sub-label */}
          <p style={{ textAlign: "center", fontSize: "0.73rem", color: "#9ca3af", marginTop: "10px", marginBottom: "2px" }}>
            📞 Free to call &nbsp;·&nbsp; Available 24/7 &nbsp;·&nbsp; No hold music
          </p>

          {/* Dismiss */}
          <button
            onClick={handleClose}
            style={{
              display: "block",
              width: "100%",
              background: "none",
              border: "none",
              marginTop: "12px",
              fontSize: "0.78rem",
              color: "#c0c8d4",
              cursor: "pointer",
              textAlign: "center",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#6b7280")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#c0c8d4")}
          >
            No thanks, I'll pay full price
          </button>
        </div>
      </div>

      <style>{`
        @keyframes popupIn {
          from { opacity: 0; transform: scale(0.85) translateY(24px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </div>
  );
}
