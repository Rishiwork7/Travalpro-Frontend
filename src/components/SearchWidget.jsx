import { MapPin, Calendar, Users, Search, Headset } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useLocation, useSearchParams } from "react-router-dom";
import airportsRaw from "../data/airports.json";

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

  const updateField = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const filterAirports = (query) => {
    const q = String(query || "").trim().toLowerCase();
    if (!q) return [];

    // Sort logic: 
    // 1. Exact Code Match
    // 2. Starts with Code
    // 3. Starts with City
    // 4. Includes Name/City
    return AIRPORTS.filter(
      (a) =>
        a.code.toLowerCase().includes(q) ||
        a.city.toLowerCase().includes(q) ||
        a.name.toLowerCase().includes(q)
    )
      .sort((a, b) => {
        const aCode = a.code.toLowerCase();
        const bCode = b.code.toLowerCase();
        const aCity = a.city.toLowerCase();
        const bCity = b.city.toLowerCase();

        // Exact code match priority
        if (aCode === q && bCode !== q) return -1;
        if (bCode === q && aCode !== q) return 1;

        // Starts with code priority
        if (aCode.startsWith(q) && !bCode.startsWith(q)) return -1;
        if (bCode.startsWith(q) && !aCode.startsWith(q)) return 1;

        // Starts with city priority
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
        `https://travalpro-backend-1.onrender.com/api/search/hotel-cities?keyword=${encodeURIComponent(keyword)}`
      );
      const data = await response.json();
      setCityOptions(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching cities:", error);
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
    console.log("[SearchWidget] Search clicked. Service:", activeService, "Data:", formData);
    // --- VALIDATION START ---
    if (activeService === "hotels") {
      if (!formData.checkIn || !formData.checkOut) {
        alert("Please select both Check-in and Check-out dates.");
        return;
      }
      if (new Date(formData.checkOut) <= new Date(formData.checkIn)) {
        alert("Check-out date must be after Check-in date.");
        return;
      }
    }
    // --- VALIDATION END ---

    if (isResultsPage) {
      onSearch?.(formData);
      return;
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

          <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 ${compact ? "gap-3" : "gap-4"}`}>

            {/* FLIGHTS / TRAINS */}
            {(activeService === "flights" ||
              activeService === "trains") && (
                <>
                  {/* FROM */}
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
                                e.stopPropagation(); // Prevent bubbling to Input container
                                updateField("from", `${a.code} - ${a.city || a.name}`);
                                setActiveField(null);
                              }}
                              className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 transition-colors"
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


                  {/* TO */}
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
                                e.stopPropagation(); // Prevent bubbling to Input container
                                updateField("to", `${a.code} - ${a.city || a.name}`);
                                setActiveField(null);
                              }}
                              className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 transition-colors"
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

                  <Input
                    label={
                      activeService === "packages" ? "Travelers" : "Passengers"
                    }
                    icon={Users}
                  >
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

            {/* HOTELS */}
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
                              e.stopPropagation(); // Prevent bubbling to Input container
                              updateField("city", city.name || city.label);
                              setActiveField(null);
                            }}
                            className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 transition-colors"
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
                    min={formData.checkIn ? new Date(new Date(formData.checkIn).getTime() + 86400000).toISOString().split('T')[0] : today}
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
                <Input label="Adults" icon={Users}>
                  <select
                    value={formData.adults || 1}
                    onChange={(e) =>
                      updateField("adults", Number(e.target.value))
                    }
                    className="input-style"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
                      <option key={n} value={n}>
                        {n} {n > 1 ? "Adults" : "Adult"}
                      </option>
                    ))}
                  </select>
                </Input>
              </>
            )}

            {/* COMING SOON / SUPPORT SERVICES */}
            {["cabs", "cruises", "insurance", "buses", "packages"].includes(activeService) && (
              <div className="col-span-full flex flex-col items-center justify-center py-8 text-center bg-gray-50 rounded-lg border border-dashed border-gray-300">
                <div className="bg-[#FFCC00]/20 p-4 rounded-full mb-3">
                  <Headset size={32} className="text-[#0f294d]" />
                </div>
                <h3 className="text-lg font-bold text-[#0f294d]">Coming Soon</h3>
                <p className="text-sm text-gray-500 max-w-sm mt-1 mb-4">
                  This service is currently available via phone booking only.
                </p>
                <div className="flex flex-col gap-1">
                  <span className="text-xs uppercase tracking-wide font-semibold text-gray-400">
                    24/7 Support Line
                  </span>
                  <a
                    href="tel:18885550188"
                    className="text-2xl font-bold text-[#0f294d] hover:text-[#d13b1a] transition"
                  >
                    1-888-555-0188
                  </a>
                </div>
              </div>
            )}


          </div>

          {/* HIDE BUTTON IF COMING SOON */}
          {!["cabs", "cruises", "insurance", "buses", "packages"].includes(activeService) && (
            <button
              type="button"
              onClick={handleSearchClick}
              className={`mt-6 w-full bg-[#FFCC00] text-black py-3 rounded-lg font-bold hover:bg-[#f2c200] transition flex items-center justify-center gap-2 shadow-sm ${compact ? "text-sm" : "text-base"
                }`}
            >
              <Search size={20} />
              {submitLabel || `SEARCH ${serviceLabels[activeService] || "FLIGHTS"}`}
            </button>
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
      <label className="text-sm text-[#1e293b] font-semibold mb-2 block">{label}</label>
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
