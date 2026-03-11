import { createContext, useContext, useMemo, useState } from "react";

const SettingsContext = createContext(null);

// Exchange rates relative to USD (Mock)
const CURRENCY_RATES = {
  USD: 1,
  INR: 83, // Kept for reference if needed, but UI will default to USD
  AED: 3.67,
  EUR: 0.92,
};

const CURRENCY_SYMBOLS = {
  INR: "₹",
  USD: "$",
  EUR: "€",
  AED: "د.إ",
};

const formatNumber = (value, currency) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency,
    maximumFractionDigits: 0,
  }).format(value);
};

export function SettingsProvider({ children }) {
  const [currency, setCurrency] = useState("USD");
  const [language, setLanguage] = useState("ENG");

  const formatPrice = useMemo(
    () => (amountInINR) => {
      const rate = CURRENCY_RATES[currency] || 1;
      const converted = Math.round(Number(amountInINR || 0) * rate);
      return formatNumber(converted, currency);
    },
    [currency]
  );

  const value = useMemo(
    () => ({
      currency,
      language,
      setCurrency,
      setLanguage,
      formatPrice,
      rates: CURRENCY_RATES,
    }),
    [currency, language, formatPrice]
  );

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) {
    throw new Error("useSettings must be used within SettingsProvider");
  }
  return ctx;
}
