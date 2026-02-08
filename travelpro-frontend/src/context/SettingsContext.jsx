import { createContext, useContext, useMemo, useState } from "react";

const SettingsContext = createContext(null);

const CURRENCY_RATES = {
  INR: 1,
  USD: 0.012,
  EUR: 0.011,
  AED: 0.044,
};

const CURRENCY_SYMBOLS = {
  INR: "₹",
  USD: "$",
  EUR: "€",
  AED: "د.إ",
};

const formatNumber = (value, currency) => {
  if (currency === "INR") {
    return new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(
      value
    );
  }
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(
    value
  );
};

export function SettingsProvider({ children }) {
  const [currency, setCurrency] = useState("INR");
  const [language, setLanguage] = useState("ENG");

  const formatPrice = useMemo(
    () => (amountInINR) => {
      const rate = CURRENCY_RATES[currency] || 1;
      const converted = Math.round(Number(amountInINR || 0) * rate);
      const symbol = CURRENCY_SYMBOLS[currency] || "₹";
      return `${symbol} ${formatNumber(converted, currency)}`;
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
