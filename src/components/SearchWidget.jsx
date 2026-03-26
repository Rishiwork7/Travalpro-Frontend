import { MapPin, Calendar, Users, Search, Phone } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useLocation, useSearchParams } from "react-router-dom";
import airportsRaw from "../data/airports.json";
import API_BASE from "../config/api";

const AIRPORTS = airportsRaw
  .filter((a) => a.iata_code && a.name)
  .map((a) => ({
    code: String(a.iata_code).toUpperCase(),
    city: a.city || "",
    name: a.name,
    country: a.country || "",
  }));

export default function SearchWidget({
  activeService,
  formData,
  setFormData,
  onSearch,
  onLeadCapture,
  compact = false,
  containerClassName = "",
  submitLabel = "",
}) {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const isResultsPage = location.pathname === "/results";
  const today = new Date().toISOString().split("T")[0];
  const [fromOptions, setFromOptions] = useState([]);
  const [toOptions, setToOptions] = useState([]);
  const [cityOptions, setCityOptions] = useState([]);
  const [activeField, setActiveField] = useState(null);
  const fromTimerRef = useRef(null);
  const toTimerRef = useRef(null);
  const cityTimerRef = useRef(null);

  const LEAD_SERVICES = ["cabs", "cruises", "insurance", "buses", "packages"];

  const updateField = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const filterAirports = (query) => {
    const q = String(query || "")
      .trim()
      .toLowerCase();
    if (!q) return [];
    return AIRPORTS.filter(
      (a) =>
        a.code.toLowerCase().includes(q) ||
        a.city.toLowerCase().includes(q) ||
        a.name.toLowerCase().includes(q),
    )
      .sort((a, b) => {
        const aCode = a.code.toLowerCase();
        const bCode = b.code.toLowerCase();
        const aCity = a.city.toLowerCase();
        const bCity = b.city.toLowerCase();
        if (aCode === q && bCode !== q) return -1;
        if (bCode === q && aCode !== q) return 1;
        if (aCode.startsWith(q) && !bCode.startsWith(q)) return -1;
        if (bCode.startsWith(q) && !aCode.startsWith(q)) return 1;
        if (aCity.startsWith(q) && !bCity.startsWith(q)) return -1;
        if (bCity.startsWith(q) && !aCity.startsWith(q)) return 1;
        return 0;
      })
      .slice(0, 8);
  };

  useEffect(() => {
    if (fromTimerRef.current) clearTimeout(fromTimerRef.current);
    fromTimerRef.current = setTimeout(() => {
      setFromOptions(filterAirports(formData.from || ""));
    }, 200);
    return () => {
      if (fromTimerRef.current) clearTimeout(fromTimerRef.current);
    };
  }, [formData.from]);

  useEffect(() => {
    if (toTimerRef.current) clearTimeout(toTimerRef.current);
    toTimerRef.current = setTimeout(() => {
      setToOptions(filterAirports(formData.to || ""));
    }, 200);
    return () => {
      if (toTimerRef.current) clearTimeout(toTimerRef.current);
    };
  }, [formData.to]);

  const fetchCitySuggestions = async (keyword) => {
    if (!keyword || keyword.length < 2) {
      setCityOptions([]);
      return;
    }
    try {
      const response = await fetch(
        `${API_BASE}/api/search/hotel-cities?keyword=${encodeURIComponent(keyword)}`,
      );
      const data = await response.json();
      setCityOptions(Array.isArray(data) ? data : []);
    } catch (error) {
      setCityOptions([]);
    }
  };

  useEffect(() => {
    if (cityTimerRef.current) clearTimeout(cityTimerRef.current);
    cityTimerRef.current = setTimeout(() => {
      fetchCitySuggestions(formData.city || "");
    }, 800);
    return () => {
      if (cityTimerRef.current) clearTimeout(cityTimerRef.current);
    };
  }, [formData.city]);

  const handleSearchClick = () => {
    // Lead services → validate then open BookingModal
    if (LEAD_SERVICES.includes(activeService)) {
      if (activeService === "cabs") {
        if (!formData.pickup?.trim()) {
          alert("Please enter a pickup location.");
          return;
        }
        if (!formData.drop?.trim()) {
          alert("Please enter a drop location.");
          return;
        }
        if (!formData.pickupDate) {
          alert("Please select a pickup date.");
          return;
        }
      }

      if (activeService === "buses") {
        if (!formData.from?.trim()) {
          alert("Please enter departure city.");
          return;
        }
        if (!formData.to?.trim()) {
          alert("Please enter destination city.");
          return;
        }
        if (!formData.date) {
          alert("Please select a travel date.");
          return;
        }
      }

      if (activeService === "cruises") {
        if (!formData.port?.trim()) {
          alert("Please enter departure port.");
          return;
        }
        if (!formData.destination?.trim()) {
          alert("Please enter destination.");
          return;
        }
        if (!formData.departureDate) {
          alert("Please select a departure date.");
          return;
        }
      }

      if (activeService === "insurance") {
        if (!formData.tripType) {
          alert("Please select a trip type.");
          return;
        }
        if (!formData.destination?.trim()) {
          alert("Please enter destination.");
          return;
        }
        if (!formData.startDate) {
          alert("Please select a start date.");
          return;
        }
      }

      if (activeService === "packages") {
        if (!formData.destination?.trim()) {
          alert("Please enter a destination.");
          return;
        }
        if (!formData.from?.trim()) {
          alert("Please enter your departure city.");
          return;
        }
        if (!formData.date) {
          alert("Please select a travel date.");
          return;
        }
      }

      const mockBooking = {
        title: serviceLabels[activeService] + " Request",
        from: formData.pickup || formData.port || formData.from || "",
        to: formData.drop || formData.destination || formData.to || "",
        date:
          formData.date ||
          formData.pickupDate ||
          formData.departureDate ||
          formData.startDate ||
          "",
        serviceType: activeService,
      };
      onLeadCapture?.(mockBooking);
      return;
    }

    // Flights / Hotels validation
    if (activeService === "flights" || activeService === "trains") {
      const isValidFrom =
        formData.from &&
        AIRPORTS.some(
          (a) => `${a.code} - ${a.city || a.name}` === formData.from,
        );
      const isValidTo =
        formData.to &&
        AIRPORTS.some((a) => `${a.code} - ${a.city || a.name}` === formData.to);
      if (!isValidFrom) {
        alert("Please select a valid 'From' city/airport from the dropdown.");
        return;
      }
      if (!isValidTo) {
        alert("Please select a valid 'To' city/airport from the dropdown.");
        return;
      }
      if (formData.from === formData.to) {
        alert("Source and Destination cannot be the same.");
        return;
      }
    }

    if (activeService === "hotels") {
      if (!formData.city || formData.city.trim() === "") {
        alert("Please select a valid City for your hotel search.");
        return;
      }
      if (!formData.checkIn || !formData.checkOut) {
        alert("Please select both Check-in and Check-out dates.");
        return;
      }
      if (new Date(formData.checkOut) <= new Date(formData.checkIn)) {
        alert("Check-out date must be after Check-in date.");
        return;
      }
    }

    onSearch?.(formData);
  };

  const serviceLabels = {
    flights: "Flights",
    hotels: "Hotels",
    cabs: "Car Rental",
    cruises: "Cruises",
    insurance: "Insurance",
    buses: "Bus",
    packages: "Packages",
  };

  return (
    <div className={`${compact ? "py-2 px-0" : "py-6 px-0"}`}>
      <div className="w-full">
        <div
          className={`bg-white border border-gray-300 rounded-xl ${compact ? "p-4" : "p-6"} shadow-[0_18px_30px_rgba(15,41,77,0.18)] ${containerClassName}`}
        >
          <div
            className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 ${compact ? "gap-3" : "gap-4"}`}
          >
            {/* ── FLIGHTS / TRAINS ── */}
            {(activeService === "flights" || activeService === "trains") && (
              <>
                <Input label="From" icon={MapPin}>
                  <div className="relative">
                    <input
                      value={formData.from || ""}
                      onChange={(e) => {
                        updateField("from", e.target.value);
                        setActiveField("from");
                      }}
                      onFocus={() => setActiveField("from")}
                      placeholder="Search city or airport"
                      className="input-style"
                    />
                    {activeField === "from" && fromOptions.length > 0 && (
                      <div className="absolute z-20 mt-1 w-full bg-white text-[#0f294d] rounded-xl shadow-xl max-h-60 overflow-y-auto border border-gray-200">
                        {fromOptions.map((a) => (
                          <div
                            key={`${a.code}-${a.name}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              updateField(
                                "from",
                                `${a.code} - ${a.city || a.name}`,
                              );
                              setActiveField(null);
                            }}
                            className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100"
                          >
                            <div className="font-semibold text-[#0f294d]">
                              {a.code} {a.city ? `- ${a.city}` : ""}
                            </div>
                            <div className="text-xs text-gray-600">
                              {a.name}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </Input>

                <Input label="To" icon={MapPin}>
                  <div className="relative">
                    <input
                      value={formData.to || ""}
                      onChange={(e) => {
                        updateField("to", e.target.value);
                        setActiveField("to");
                      }}
                      onFocus={() => setActiveField("to")}
                      placeholder="Search city or airport"
                      className="input-style"
                    />
                    {activeField === "to" && toOptions.length > 0 && (
                      <div className="absolute z-20 mt-1 w-full bg-white text-[#0f294d] rounded-xl shadow-xl max-h-60 overflow-y-auto border border-gray-200">
                        {toOptions.map((a) => (
                          <div
                            key={`${a.code}-${a.name}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              updateField(
                                "to",
                                `${a.code} - ${a.city || a.name}`,
                              );
                              setActiveField(null);
                            }}
                            className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100"
                          >
                            <div className="font-semibold text-[#0f294d]">
                              {a.code} {a.city ? `- ${a.city}` : ""}
                            </div>
                            <div className="text-xs text-gray-600">
                              {a.name}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </Input>

                <Input label="Date" icon={Calendar}>
                  <input
                    type="date"
                    min={today}
                    value={formData.date || ""}
                    onChange={(e) => updateField("date", e.target.value)}
                    className="input-style"
                  />
                </Input>

                <Input label="Passengers" icon={Users}>
                  <select
                    value={formData.passengers || 1}
                    onChange={(e) =>
                      updateField("passengers", Number(e.target.value))
                    }
                    className="input-style"
                  >
                    {[1, 2, 3, 4, 5].map((n) => (
                      <option key={n}>{n}</option>
                    ))}
                  </select>
                </Input>
              </>
            )}

            {/* ── HOTELS ── */}
            {activeService === "hotels" && (
              <>
                <Input label="City" icon={MapPin}>
                  <div className="relative">
                    <input
                      value={formData.city || ""}
                      onChange={(e) => {
                        updateField("city", e.target.value);
                        setActiveField("city");
                      }}
                      onFocus={() => setActiveField("city")}
                      placeholder="Search city..."
                      className="input-style"
                    />
                    {activeField === "city" && cityOptions.length > 0 && (
                      <div className="absolute z-20 mt-1 w-full bg-white text-[#0f294d] rounded-xl shadow-xl max-h-60 overflow-y-auto border border-gray-200">
                        {cityOptions.map((city, idx) => (
                          <div
                            key={idx}
                            onClick={(e) => {
                              e.stopPropagation();
                              updateField("city", city.name || city.label);
                              setActiveField(null);
                            }}
                            className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100"
                          >
                            <div className="font-semibold text-[#0f294d]">
                              {city.name || city.label}
                            </div>
                            {city.country && (
                              <div className="text-xs text-gray-600">
                                {city.country}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </Input>
                <Input label="Check-In" icon={Calendar}>
                  <input
                    type="date"
                    min={today}
                    value={formData.checkIn || ""}
                    onChange={(e) => updateField("checkIn", e.target.value)}
                    className="input-style"
                  />
                </Input>
                <Input label="Check-Out" icon={Calendar}>
                  <input
                    type="date"
                    min={
                      formData.checkIn
                        ? new Date(
                            new Date(formData.checkIn).getTime() + 86400000,
                          )
                            .toISOString()
                            .split("T")[0]
                        : today
                    }
                    value={formData.checkOut || ""}
                    onChange={(e) => updateField("checkOut", e.target.value)}
                    className="input-style"
                  />
                </Input>
                <Input label="Rooms" icon={Users}>
                  <select
                    value={formData.rooms || 1}
                    onChange={(e) =>
                      updateField("rooms", Number(e.target.value))
                    }
                    className="input-style"
                  >
                    {[1, 2, 3, 4].map((n) => (
                      <option key={n} value={n}>
                        {n} {n > 1 ? "Rooms" : "Room"}
                      </option>
                    ))}
                  </select>
                </Input>
              </>
            )}

            {/* ── CABS ── */}
            {activeService === "cabs" && (
              <>
                <Input label="Pickup Location" icon={MapPin}>
                  <input
                    value={formData.pickup || ""}
                    onChange={(e) => updateField("pickup", e.target.value)}
                    placeholder="City or address"
                    className="input-style"
                  />
                </Input>
                <Input label="Drop Location" icon={MapPin}>
                  <input
                    value={formData.drop || ""}
                    onChange={(e) => updateField("drop", e.target.value)}
                    placeholder="City or address"
                    className="input-style"
                  />
                </Input>
                <Input label="Pickup Date" icon={Calendar}>
                  <input
                    type="date"
                    min={today}
                    value={formData.pickupDate || ""}
                    onChange={(e) => updateField("pickupDate", e.target.value)}
                    className="input-style"
                  />
                </Input>
                <Input label="Passengers" icon={Users}>
                  <select
                    value={formData.passengers || 1}
                    onChange={(e) =>
                      updateField("passengers", Number(e.target.value))
                    }
                    className="input-style"
                  >
                    {[1, 2, 3, 4, 5, 6].map((n) => (
                      <option key={n}>{n}</option>
                    ))}
                  </select>
                </Input>
              </>
            )}

            {/* ── BUSES ── */}
            {activeService === "buses" && (
              <>
                <Input label="From" icon={MapPin}>
                  <input
                    value={formData.from || ""}
                    onChange={(e) => updateField("from", e.target.value)}
                    placeholder="Departure city"
                    className="input-style"
                  />
                </Input>
                <Input label="To" icon={MapPin}>
                  <input
                    value={formData.to || ""}
                    onChange={(e) => updateField("to", e.target.value)}
                    placeholder="Destination city"
                    className="input-style"
                  />
                </Input>
                <Input label="Date" icon={Calendar}>
                  <input
                    type="date"
                    min={today}
                    value={formData.date || ""}
                    onChange={(e) => updateField("date", e.target.value)}
                    className="input-style"
                  />
                </Input>
                <Input label="Passengers" icon={Users}>
                  <select
                    value={formData.passengers || 1}
                    onChange={(e) =>
                      updateField("passengers", Number(e.target.value))
                    }
                    className="input-style"
                  >
                    {[1, 2, 3, 4, 5].map((n) => (
                      <option key={n}>{n}</option>
                    ))}
                  </select>
                </Input>
              </>
            )}

            {/* ── CRUISES ── */}
            {activeService === "cruises" && (
              <>
                <Input label="Departure Port" icon={MapPin}>
                  <input
                    value={formData.port || ""}
                    onChange={(e) => updateField("port", e.target.value)}
                    placeholder="e.g. Miami, Dubai"
                    className="input-style"
                  />
                </Input>
                <Input label="Destination" icon={MapPin}>
                  <input
                    value={formData.destination || ""}
                    onChange={(e) => updateField("destination", e.target.value)}
                    placeholder="e.g. Caribbean, Mediterranean"
                    className="input-style"
                  />
                </Input>
                <Input label="Departure Date" icon={Calendar}>
                  <input
                    type="date"
                    min={today}
                    value={formData.departureDate || ""}
                    onChange={(e) =>
                      updateField("departureDate", e.target.value)
                    }
                    className="input-style"
                  />
                </Input>
                <Input label="Travelers" icon={Users}>
                  <select
                    value={formData.passengers || 1}
                    onChange={(e) =>
                      updateField("passengers", Number(e.target.value))
                    }
                    className="input-style"
                  >
                    {[1, 2, 3, 4, 5, 6].map((n) => (
                      <option key={n}>{n}</option>
                    ))}
                  </select>
                </Input>
              </>
            )}

            {/* ── INSURANCE ── */}
            {activeService === "insurance" && (
              <>
                <Input label="Trip Type" icon={MapPin}>
                  <select
                    value={formData.tripType || ""}
                    onChange={(e) => updateField("tripType", e.target.value)}
                    className="input-style"
                  >
                    <option value="">Select type</option>
                    <option>Single Trip</option>
                    <option>Multi Trip</option>
                    <option>Annual</option>
                  </select>
                </Input>
                <Input label="Destination" icon={MapPin}>
                  <input
                    value={formData.destination || ""}
                    onChange={(e) => updateField("destination", e.target.value)}
                    placeholder="Country or region"
                    className="input-style"
                  />
                </Input>
                <Input label="Start Date" icon={Calendar}>
                  <input
                    type="date"
                    min={today}
                    value={formData.startDate || ""}
                    onChange={(e) => updateField("startDate", e.target.value)}
                    className="input-style"
                  />
                </Input>
                <Input label="Travelers" icon={Users}>
                  <select
                    value={formData.passengers || 1}
                    onChange={(e) =>
                      updateField("passengers", Number(e.target.value))
                    }
                    className="input-style"
                  >
                    {[1, 2, 3, 4, 5].map((n) => (
                      <option key={n}>{n}</option>
                    ))}
                  </select>
                </Input>
              </>
            )}

            {/* ── PACKAGES ── */}
            {activeService === "packages" && (
              <>
                <Input label="Destination" icon={MapPin}>
                  <input
                    value={formData.destination || ""}
                    onChange={(e) => updateField("destination", e.target.value)}
                    placeholder="e.g. Bali, Dubai, Paris"
                    className="input-style"
                  />
                </Input>
                <Input label="Departure City" icon={MapPin}>
                  <input
                    value={formData.from || ""}
                    onChange={(e) => updateField("from", e.target.value)}
                    placeholder="Your city"
                    className="input-style"
                  />
                </Input>
                <Input label="Travel Date" icon={Calendar}>
                  <input
                    type="date"
                    min={today}
                    value={formData.date || ""}
                    onChange={(e) => updateField("date", e.target.value)}
                    className="input-style"
                  />
                </Input>
                <Input label="Travelers" icon={Users}>
                  <select
                    value={formData.passengers || 1}
                    onChange={(e) =>
                      updateField("passengers", Number(e.target.value))
                    }
                    className="input-style"
                  >
                    {[1, 2, 3, 4, 5, 6].map((n) => (
                      <option key={n}>{n}</option>
                    ))}
                  </select>
                </Input>
              </>
            )}
          </div>

          {/* ── SEARCH BUTTON ── */}
          <button
            type="button"
            onClick={handleSearchClick}
            className={`mt-6 w-full bg-[#FFCC00] text-black py-3 rounded-lg font-bold hover:bg-[#f2c200] transition flex items-center justify-center gap-2 shadow-sm ${compact ? "text-sm" : "text-base"}`}
          >
            <Search size={20} />
            {submitLabel ||
              `SEARCH ${serviceLabels[activeService] || "FLIGHTS"}`}
          </button>

          {/* ── Lead services note ── */}
          {LEAD_SERVICES.includes(activeService) && (
            <p className="text-center text-xs text-gray-400 mt-3 flex items-center justify-center gap-1">
              <Phone size={12} /> Our travel expert will contact you with the
              best available rates.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function Input({ label, icon: Icon, children }) {
  const IconComponent = Icon;
  return (
    <div>
      <label className="text-sm text-[#1e293b] font-semibold mb-2 block">
        {label}
      </label>
      <div
        className="relative"
        onClick={(e) => {
          const target = e.currentTarget.querySelector("input, select");
          target?.focus?.();
          target?.showPicker?.();
        }}
      >
        <IconComponent className="absolute left-3 top-3 w-5 h-5 text-[#0f294d] z-10 pointer-events-none" />
        {children}
      </div>
    </div>
  );
}
