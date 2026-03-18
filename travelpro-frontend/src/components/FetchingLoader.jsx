import { useEffect, useState } from "react";

const serviceConfig = {
  flights: {
    icon: "✈️",
    title: "Searching 500+ Airlines...",
    subtitle: (passengers) =>
      `Checking private consolidator fares for ${passengers} traveler${passengers > 1 ? "s" : ""}`,
    steps: ["Scanning Routes", "Checking Deals", "Finalizing"],
  },
  hotels: {
    icon: "🏨",
    title: "Searching Best Hotels...",
    subtitle: (guests) =>
      `Finding top-rated stays for ${guests} guest${guests > 1 ? "s" : ""}`,
    steps: ["Scanning Properties", "Comparing Rates", "Finalizing"],
  },
  cabs: {
    icon: "🚗",
    title: "Finding Available Cars...",
    subtitle: () => "Searching nearby car rental options",
    steps: ["Locating Cars", "Checking Availability", "Finalizing"],
  },
  cruises: {
    icon: "🚢",
    title: "Searching Cruise Lines...",
    subtitle: (passengers) =>
      `Looking for voyages for ${passengers} traveler${passengers > 1 ? "s" : ""}`,
    steps: ["Scanning Ports", "Checking Cabins", "Finalizing"],
  },
  insurance: {
    icon: "🛡️",
    title: "Finding Best Coverage...",
    subtitle: () => "Comparing travel insurance plans",
    steps: ["Scanning Plans", "Comparing Rates", "Finalizing"],
  },
  buses: {
    icon: "🚌",
    title: "Searching Bus Routes...",
    subtitle: (passengers) =>
      `Checking seats for ${passengers} traveler${passengers > 1 ? "s" : ""}`,
    steps: ["Scanning Routes", "Checking Seats", "Finalizing"],
  },
  default: {
    icon: "🔍",
    title: "Searching Results...",
    subtitle: () => "Finding the best options for you",
    steps: ["Scanning Options", "Checking Availability", "Finalizing"],
  },
};

export default function FetchingLoader({ service = "flights", passengers = 1 }) {
  const config = serviceConfig[service] || serviceConfig.default;
  const [progress, setProgress] = useState(0);
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    // Animate progress bar over ~8 seconds, stopping at ~90% to await real response
    const duration = 8000;
    const interval = 60;
    const totalSteps = duration / interval;
    const increment = 90 / totalSteps;

    let current = 0;
    const timer = setInterval(() => {
      current = Math.min(current + increment, 90);
      setProgress(current);

      // Advance steps at 30% and 60%
      if (current >= 60) setActiveStep(2);
      else if (current >= 30) setActiveStep(1);
      else setActiveStep(0);

      if (current >= 90) clearInterval(timer);
    }, interval);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex items-center justify-center py-24">
      <div
        style={{
          background: "#fff",
          borderRadius: "24px",
          boxShadow: "0 8px 40px rgba(15,41,77,0.12)",
          padding: "48px 56px",
          minWidth: "360px",
          maxWidth: "480px",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "0",
        }}
      >
        {/* Animated Icon */}
        <div
          style={{
            position: "relative",
            width: "100px",
            height: "100px",
            marginBottom: "28px",
          }}
        >
          {/* Spinning ring */}
          <svg
            style={{
              position: "absolute",
              inset: 0,
              animation: "spin 1.6s linear infinite",
            }}
            width="100"
            height="100"
            viewBox="0 0 100 100"
          >
            <circle
              cx="50"
              cy="50"
              r="44"
              fill="none"
              stroke="#dbeafe"
              strokeWidth="8"
            />
            <circle
              cx="50"
              cy="50"
              r="44"
              fill="none"
              stroke="#3b82f6"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray="276"
              strokeDashoffset="200"
            />
          </svg>

          {/* Center icon circle */}
          <div
            style={{
              position: "absolute",
              inset: "10px",
              borderRadius: "50%",
              background: "#eff6ff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "2rem",
            }}
          >
            {config.icon}
          </div>
        </div>

        {/* Title */}
        <h2
          style={{
            fontSize: "1.35rem",
            fontWeight: "700",
            color: "#0f172a",
            marginBottom: "8px",
            textAlign: "center",
            letterSpacing: "-0.01em",
          }}
        >
          {config.title}
        </h2>

        {/* Subtitle */}
        <p
          style={{
            fontSize: "0.92rem",
            color: "#64748b",
            marginBottom: "28px",
            textAlign: "center",
          }}
        >
          {config.subtitle(passengers)}
        </p>

        {/* Progress bar */}
        <div
          style={{
            width: "100%",
            height: "8px",
            background: "#e2e8f0",
            borderRadius: "99px",
            overflow: "hidden",
            marginBottom: "24px",
          }}
        >
          <div
            style={{
              height: "100%",
              width: `${progress}%`,
              background: "linear-gradient(90deg, #3b82f6, #2563eb)",
              borderRadius: "99px",
              transition: "width 0.1s linear",
            }}
          />
        </div>

        {/* Step indicators */}
        <div
          style={{
            display: "flex",
            gap: "28px",
            justifyContent: "center",
          }}
        >
          {config.steps.map((step, i) => (
            <span
              key={step}
              style={{
                fontSize: "0.82rem",
                fontWeight: i <= activeStep ? "700" : "500",
                color: i <= activeStep ? "#2563eb" : "#94a3b8",
                transition: "color 0.4s ease, font-weight 0.3s ease",
                letterSpacing: "0.01em",
              }}
            >
              {step}
            </span>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
