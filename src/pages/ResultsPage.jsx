import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { useEffect, useState, useMemo } from "react";
import Navbar from "../components/Navbar";
import SearchWidget from "../components/SearchWidget";
import BookingModal from "../components/BookingModal";
import ServiceCard from "../components/cards/ServiceCard";
import SortDropdown from "../components/SortDropdown";
import { Loader2, AlertCircle } from "lucide-react"; // Icons add kiye
import { useSettings } from "../context/SettingsContext";
import { sortFlights } from "../utils/flightSort";

export default function ResultsPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const { activeService: stateService } = location.state || {};
  const queryService = searchParams.get("service");
  const activeService = stateService || queryService || "flights";

  const buildSearchFromParams = useMemo(
    () => () => {
      const base = {
        from:
          searchParams.get("from") ||
          location.state?.searchData?.from ||
          "",
        to:
          searchParams.get("to") ||
          location.state?.searchData?.to ||
          "",
        date:
          searchParams.get("date") ||
          location.state?.searchData?.date ||
          "",
        passengers: Number(
          searchParams.get("passengers") ||
          location.state?.searchData?.passengers ||
          1
        ),
      };

      if (activeService === "hotels") {
        return {
          ...base,
          city:
            searchParams.get("city") ||
            location.state?.searchData?.city ||
            base.to ||
            "",
          checkIn:
            searchParams.get("checkIn") ||
            location.state?.searchData?.checkIn ||
            base.date ||
            "",
          checkOut:
            searchParams.get("checkOut") ||
            location.state?.searchData?.checkOut ||
            "",
          rooms: Number(
            searchParams.get("rooms") ||
            location.state?.searchData?.rooms ||
            1
          ),
        };
      }

      if (activeService === "cabs") {
        return {
          ...base,
          pickup:
            searchParams.get("pickup") ||
            location.state?.searchData?.pickup ||
            base.from ||
            "",
          drop:
            searchParams.get("drop") ||
            location.state?.searchData?.drop ||
            base.to ||
            "",
          pickupDate:
            searchParams.get("pickupDate") ||
            location.state?.searchData?.pickupDate ||
            base.date ||
            "",
        };
      }

      if (activeService === "cruises") {
        return {
          ...base,
          port:
            searchParams.get("port") ||
            location.state?.searchData?.port ||
            base.from ||
            "",
          cruiseDate:
            searchParams.get("cruiseDate") ||
            location.state?.searchData?.cruiseDate ||
            base.date ||
            "",
        };
      }

      if (activeService === "insurance") {
        return {
          ...base,
          category:
            searchParams.get("category") ||
            location.state?.searchData?.category ||
            base.from ||
            "",
          type:
            searchParams.get("type") ||
            location.state?.searchData?.type ||
            base.to ||
            "",
          startDate:
            searchParams.get("startDate") ||
            location.state?.searchData?.startDate ||
            base.date ||
            "",
          coverage:
            searchParams.get("coverage") ||
            location.state?.searchData?.coverage ||
            "",
        };
      }

      if (activeService === "buses") {
        return {
          ...base,
          seatType:
            searchParams.get("seatType") ||
            location.state?.searchData?.seatType ||
            "Sleeper",
        };
      }

      return base;
    },
    [location.state, searchParams, activeService]
  );

  const [searchForm, setSearchForm] = useState(buildSearchFromParams);
  const [draftForm, setDraftForm] = useState(buildSearchFromParams);

  // Initialize loading to true if we have a valid search to perform
  const [loading, setLoading] = useState(() => {
    const params = buildSearchFromParams();
    if (activeService === "flights") {
      return !!(params.from && params.to && params.date);
    }
    // For other services, we might need stricter checks, but generally if we have params we are loading
    return !!(params.to || params.city || params.pickup);
  });

  const [results, setResults] = useState([]);
  const [error, setError] = useState(null);

  const [selectedBooking, setSelectedBooking] = useState(null);
  const [leadOpen, setLeadOpen] = useState(false);
  const { formatPrice } = useSettings();
  const [stopsFilter, setStopsFilter] = useState({
    nonstop: false,
    oneStop: false,
    twoPlus: false,
  });
  const [selectedAirlines, setSelectedAirlines] = useState({});
  const [priceRange, setPriceRange] = useState({ min: "", max: "" });
  const [sortType, setSortType] = useState("relevant");

  // --- FETCH LOGIC (Moved INSIDE useEffect to fix errors) ---
  // Sync state when URL params change
  useEffect(() => {
    const next = buildSearchFromParams();
    setSearchForm((prev) => {
      if (JSON.stringify(prev) === JSON.stringify(next)) return prev;
      return next;
    });
    setDraftForm((prev) => {
      if (JSON.stringify(prev) === JSON.stringify(next)) return prev;
      return next;
    });
  }, [buildSearchFromParams]);

  const serviceLabels = {
    flights: "Flights",
    hotels: "Hotels",
    cabs: "Car Rental",
    cruises: "Cruises",
    insurance: "Insurance",
    buses: "Bus",
    packages: "Packages",
  };

  const mapServiceType = (service) => {
    if (service === "cabs") return "car_rental";
    if (service === "buses") return "bus";
    if (service === "trains") return "train";
    return service;
  };

  const mapSearchFields = (data) => {
    let from = data.from;
    let to = data.to;
    let date = data.date;

    if (activeService === "hotels") {
      from = "";
      to = data.city || data.to;
      date = data.checkIn || data.date;
    } else if (activeService === "cabs") {
      from = data.pickup || data.from;
      to = data.drop || data.to;
      date = data.pickupDate || data.date;
    } else if (activeService === "cruises") {
      from = data.port || data.from;
      to = data.port || data.to;
      date = data.cruiseDate || data.date;
    } else if (activeService === "insurance") {
      from = data.category || data.from;
      to = data.type || data.to;
      date = data.startDate || data.date;
    }

    return { from, to, date };
  };

  const parseTimes = (subtitle) => {
    if (!subtitle) return {};
    const match = subtitle.match(
      /Departs\s+(\d{1,2}):(\d{2})\s*(AM|PM).*Arrives\s+(\d{1,2}):(\d{2})\s*(AM|PM)/i
    );
    if (!match) return {};
    const to24 = (h, m, mer) => {
      let hour = Number(h);
      if (mer.toUpperCase() === "PM" && hour < 12) hour += 12;
      if (mer.toUpperCase() === "AM" && hour === 12) hour = 0;
      return `${String(hour).padStart(2, "0")}:${m}`;
    };
    return {
      departureTime: to24(match[1], match[2], match[3]),
      arrivalTime: to24(match[4], match[5], match[6]),
    };
  };

  // Fetch when search form changes
  useEffect(() => {
    if (activeService === "flights") {
      if (!searchForm?.from || !searchForm?.to || !searchForm?.date) {
        navigate("/");
        return;
      }
    }

    const fetchResults = async () => {
      setLoading(true);
      setError(null);

      try {
        const cleanFrom = searchForm.from
          ? searchForm.from.split(" - ")[0].trim()
          : "";
        const cleanTo = searchForm.to
          ? searchForm.to.split(" - ")[0].trim()
          : "";

        if (activeService === "flights") {
          console.time("Frontend Fetch Flights");
          const res = await fetch("https://travalpro-backend-1.onrender.com/api/flights/search", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              from: cleanFrom,
              to: cleanTo,
              date: searchForm.date,
            }),
          });
          const data = await res.json();
          console.timeEnd("Frontend Fetch Flights");

          if (res.ok) {
            if (Array.isArray(data) && data.length > 0) {
              setResults(data);
            } else {
              setResults([]);
              setError("No flights found for this route.");
            }
          } else {
            console.error("API Error:", data);
            const msg =
              data.error?.errors?.[0]?.detail ||
              data.message ||
              "Server Error";
            setError(`API Error: ${msg}`);
            setResults([]);
          }
          return;
        }

        if (activeService === "hotels") {
          const params = new URLSearchParams({
            city: searchForm.city || searchForm.to,
            checkIn: searchForm.checkIn || searchForm.date,
            checkOut: searchForm.checkOut || "",
            rooms: searchForm.rooms || 1,
            guests: searchForm.passengers || 1, // sending guests too just in case
          }).toString();

          console.time("Frontend Fetch Hotels");
          const res = await fetch(`https://travalpro-backend-1.onrender.com/api/hotels/search?${params}`);
          const data = await res.json();
          console.timeEnd("Frontend Fetch Hotels");

          if (res.ok) {
            if (Array.isArray(data) && data.length > 0) {
              setResults(data);
            } else {
              setResults([]);
              setError("No hotels found for this city/dates.");
            }
          } else {
            console.error("API Error:", data);
            const msg = data.message || "Server Error";
            setError(`API Error: ${msg}`);
            setResults([]);
          }
          setLoading(false);
          return;
        }

        const serviceType = mapServiceType(activeService);
        const params = new URLSearchParams({
          from: cleanFrom,
          to: cleanTo,
          date: searchForm.date || "",
          type: serviceType,
        }).toString();

        console.time("Frontend Fetch");
        const res = await fetch(
          `https://travalpro-backend-1.onrender.com/api/transport/search?${params}`
        );
        const data = await res.json();
        console.timeEnd("Frontend Fetch");

        if (res.ok) {
          const payload = data?.data || [];
          if (Array.isArray(payload) && payload.length > 0) {
            setResults(payload);
          } else {
            setResults([]);
            setError("No results found for this route.");
          }
        } else {
          console.error("API Error:", data);
          const msg = data.message || "Server Error";
          setError(`API Error: ${msg}`);
          setResults([]);
        }
      } catch (err) {
        console.error("Fetch error:", err);
        setError("Failed to connect to backend.");
        setResults([]);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [searchForm, navigate, activeService]);

  const handleSearchSubmit = (data) => {
    const mapped = mapSearchFields(data);
    if (!mapped.from && activeService !== "hotels" && activeService !== "insurance") {
      // For non-flight services, allow empty origin if not applicable
    }
    if (!mapped.to || !mapped.date) {
      alert("Fill all fields");
      return;
    }
    const passengers = data.passengers || 1;
    const next = {
      ...data,
      from: mapped.from || "",
      to: mapped.to || "",
      date: mapped.date || "",
      passengers,
      service: activeService,
    };

    // Force update local state so useEffect sees the change immediately if params are same but user wants refresh
    setSearchForm(next);
    setDraftForm(next);
    setSearchParams(next);
  };

  // --- LEAD HANDLING ---
  const handleLeadContinue = (data) => {
    setLeadOpen(false);
    navigate("/review", {
      state: {
        booking: selectedBooking,
        leadData: data,
        service: activeService,
        searchData: searchForm,
      },
    });
  };

  const airlines = useMemo(() => {
    const names = results.map((r) => r.airlineName).filter(Boolean);
    return Array.from(new Set(names));
  }, [results]);

  const priceStats = useMemo(() => {
    if (!results.length) return { min: 0, max: 0 };
    const prices = results.map((r) => Number(r.price || 0));
    return {
      min: Math.min(...prices),
      max: Math.max(...prices),
    };
  }, [results]);

  const pricePlaceholders = useMemo(
    () => ({
      min: formatPrice(priceStats.min),
      max: formatPrice(priceStats.max),
    }),
    [formatPrice, priceStats]
  );

  const filteredResults = useMemo(() => {
    if (activeService !== "flights") {
      return results;
    }
    const selectedStops = Object.entries(stopsFilter)
      .filter(([, v]) => v)
      .map(([k]) => k);
    const activeAirlines = Object.entries(selectedAirlines)
      .filter(([, v]) => v)
      .map(([k]) => k);

    // First filter the results
    const filtered = results.filter((item) => {
      const stopsMatch =
        selectedStops.length === 0 ||
        selectedStops.some((key) => {
          if (key === "nonstop") return item.stops === 0;
          if (key === "oneStop") return item.stops === 1;
          return item.stops >= 2;
        });

      const airlineMatch =
        activeAirlines.length === 0 || activeAirlines.includes(item.airlineName);

      const min = priceRange.min !== "" ? Number(priceRange.min) : null;
      const max = priceRange.max !== "" ? Number(priceRange.max) : null;
      const price = Number(item.price || 0);
      const minOk = min === null || price >= min;
      const maxOk = max === null || price <= max;

      return stopsMatch && airlineMatch && minOk && maxOk;
    });

    // Then apply sorting
    return sortFlights(filtered, sortType);
  }, [results, stopsFilter, selectedAirlines, priceRange, sortType, activeService]);

  return (
    <div className="min-h-screen bg-white text-[#1e293b] font-sans">
      <Navbar />

      {/* Sticky Search Header */}
      <div className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-gray-200 shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <SearchWidget
            activeService={activeService || "flights"}
            formData={draftForm}
            setFormData={setDraftForm}
            onSearch={handleSearchSubmit}
            compact
            submitLabel="Search"
          />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 flex gap-8">

        {/* Sidebar Filters */}
        {activeService === "flights" && (
          <div className="hidden lg:block w-1/4 h-fit sticky top-32 space-y-4">
            {/* Sort Dropdown */}
            <SortDropdown
              sortType={sortType}
              setSortType={setSortType}
              disabled={loading || results.length === 0}
            />

            {/* Filters */}
            <div className="glass-card rounded-xl p-6">
              <h3 className="font-bold text-lg mb-4 text-[#0f294d]">Filters</h3>

              <div className="space-y-4 text-sm text-gray-700">
                <details open className="border border-gray-200 rounded-lg p-3">
                  <summary className="cursor-pointer font-semibold text-[#0f294d]">Stops</summary>
                  <div className="mt-3 space-y-2">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        className="accent-[#0f294d] w-4 h-4"
                        checked={stopsFilter.nonstop}
                        onChange={(e) =>
                          setStopsFilter((prev) => ({ ...prev, nonstop: e.target.checked }))
                        }
                      />
                      Non-stop
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        className="accent-[#0f294d] w-4 h-4"
                        checked={stopsFilter.oneStop}
                        onChange={(e) =>
                          setStopsFilter((prev) => ({ ...prev, oneStop: e.target.checked }))
                        }
                      />
                      1 Stop
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        className="accent-[#0f294d] w-4 h-4"
                        checked={stopsFilter.twoPlus}
                        onChange={(e) =>
                          setStopsFilter((prev) => ({ ...prev, twoPlus: e.target.checked }))
                        }
                      />
                      2+ Stops
                    </label>
                  </div>
                </details>

                <details open className="border border-gray-200 rounded-lg p-3">
                  <summary className="cursor-pointer font-semibold text-[#0f294d]">Airlines</summary>
                  <div className="mt-3 space-y-2 max-h-56 overflow-y-auto">
                    {airlines.length === 0 && (
                      <p className="text-xs text-gray-500">Airlines will appear after search.</p>
                    )}
                    {airlines.map((airline) => (
                      <label key={airline} className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          className="accent-[#0f294d] w-4 h-4"
                          checked={!!selectedAirlines[airline]}
                          onChange={(e) =>
                            setSelectedAirlines((prev) => ({
                              ...prev,
                              [airline]: e.target.checked,
                            }))
                          }
                        />
                        {airline}
                      </label>
                    ))}
                  </div>
                </details>

                <details open className="border border-gray-200 rounded-lg p-3">
                  <summary className="cursor-pointer font-semibold text-[#0f294d]">Price Range</summary>
                  <div className="mt-3 space-y-3">
                    <div className="flex gap-2">
                      <input
                        type="number"
                        min={0}
                        placeholder={`Min (${pricePlaceholders.min})`}
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-[#1e293b] focus:border-[#0f294d] focus:ring-2 focus:ring-[#0f294d]/20 outline-none"
                        value={priceRange.min}
                        onChange={(e) =>
                          setPriceRange((prev) => ({ ...prev, min: e.target.value }))
                        }
                      />
                      <input
                        type="number"
                        min={0}
                        placeholder={`Max (${pricePlaceholders.max})`}
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-[#1e293b] focus:border-[#0f294d] focus:ring-2 focus:ring-[#0f294d]/20 outline-none"
                        value={priceRange.max}
                        onChange={(e) =>
                          setPriceRange((prev) => ({ ...prev, max: e.target.value }))
                        }
                      />
                    </div>
                    <input
                      type="range"
                      min={priceStats.min}
                      max={priceStats.max}
                      value={priceRange.max || priceStats.max}
                      onChange={(e) =>
                        setPriceRange((prev) => ({ ...prev, max: e.target.value }))
                      }
                      className="w-full accent-[#0f294d]"
                    />
                  </div>
                </details>
              </div>
            </div>
          </div>
        )}

        {/* Results Area */}
        <div className="flex-1">

          {/* Header */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-[#0f294d]">
              {activeService === "hotels" ? (
                <>
                  Hotels in <span className="text-[#0f294d]">{searchForm?.to || searchForm?.city}</span>
                </>
              ) : (
                <>
                  {serviceLabels[activeService] || "Results"} from{" "}
                  <span className="text-[#0f294d]">{searchForm?.from}</span> to{" "}
                  <span className="text-[#0f294d]">{searchForm?.to}</span>
                </>
              )}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {loading ? "Searching..." : `${filteredResults.length} results found`}
            </p>
          </div>

          {/* 1. LOADING STATE */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="w-10 h-10 text-[#0f294d] animate-spin mb-4" />
              <p className="text-gray-600 animate-pulse">Fetching best rates...</p>
            </div>
          )}

          {/* 2. ERROR / EMPTY STATE (Ye pehle missing tha) */}
          {!loading && (error || results.length === 0) && (
            <div className="glass-card rounded-xl p-10 text-center">
              <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <h3 className="text-xl font-bold text-[#0f294d] mb-2">
                No {serviceLabels[activeService] || "Results"} Found
              </h3>
              <p className="text-gray-600">{error || "Try changing your date or route."}</p>
            </div>
          )}

          {!loading && results.length > 0 && filteredResults.length === 0 && !error && (
            <div className="glass-card rounded-xl p-10 text-center">
              <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <h3 className="text-xl font-bold text-[#0f294d] mb-2">No Matches</h3>
              <p className="text-gray-600">Try adjusting filters to see more options.</p>
            </div>
          )}

          {/* 3. SUCCESS RESULTS */}
          {!loading && activeService !== "flights" && (
            <div className="space-y-4">
              {filteredResults.map((item, index) => {
                const times = parseTimes(item.subtitle);
                const cardType = mapServiceType(activeService);
                const cardData = {
                  ...item,
                  departureTime: item.departureTime
                    ? item.departureTime
                    : times.departureTime
                      ? `${searchForm.date}T${times.departureTime}:00`
                      : "",
                  arrivalTime: item.arrivalTime
                    ? item.arrivalTime
                    : times.arrivalTime
                      ? `${searchForm.date}T${times.arrivalTime}:00`
                      : "",
                  fromCode: searchForm.from
                    ? searchForm.from.split(" - ")[0].trim()
                    : "ORG",
                  toCode: searchForm.to
                    ? searchForm.to.split(" - ")[0].trim()
                    : "DST",
                };
                return (
                  <ServiceCard
                    key={item.id || index}
                    type={cardType}
                    data={cardData}
                    onBook={(selected) => {
                      setSelectedBooking(selected);
                      setLeadOpen(true);
                    }}
                  />
                );
              })}
            </div>
          )}

          {!loading && activeService === "flights" && filteredResults.map((item, index) => (
            <div
              key={item.id || index}
              className="group relative glass-card hover:border-[#0f294d] rounded-xl p-5 transition-all hover:-translate-y-1 flex flex-col md:flex-row justify-between items-center gap-6 mb-4"
            >
              {/* Airline + Logo */}
              <div className="flex items-center gap-6 flex-1">

                {/* Airline Logo (dynamic using airlineCode) */}
                <img
                  src={`https://images.kiwi.com/airlines/64/${item.airlineCode}.png`}
                  alt={item.airlineName}
                  className="w-12 h-12 object-contain bg-white rounded-full p-1 border border-gray-200"
                  onError={(e) => {
                    e.target.src = "https://via.placeholder.com/48?text=✈";
                  }}
                />

                <div className="flex-1 grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="font-bold text-lg text-[#0f294d]">{item.departure}</p>
                    <p className="text-xs text-gray-600 font-bold">{item.from}</p>
                  </div>

                  <div className="flex flex-col items-center justify-center">
                    <p className="text-[10px] text-gray-600 mb-1">{item.duration}</p>
                    <div className="w-full h-[1px] bg-gray-300 relative flex items-center justify-center">
                      <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                    </div>
                    <p className="text-[10px] text-green-600 mt-1 font-medium">
                      {item.stops === 0 ? "Non-stop" : `${item.stops} Stop`}
                    </p>
                  </div>

                  <div>
                    <p className="font-bold text-lg text-[#0f294d]">{item.arrival}</p>
                    <p className="text-xs text-gray-600 font-bold">{item.to}</p>
                  </div>
                </div>
              </div>

              {/* Price + Airline Name */}
              <div className="text-right pl-6 border-l border-gray-200 min-w-[180px]">
                <p className="text-sm text-gray-600">{item.airlineName}</p>
                <p className="text-2xl font-bold text-[#0a821c] my-1">
                  {formatPrice(item.price)}
                </p>
                <button
                  onClick={() => {
                    setSelectedBooking(item);
                    setLeadOpen(true);
                  }}
                  className="bg-[#FFCC00] hover:bg-[#f2c200] text-black font-bold py-2 px-6 rounded-lg shadow-md hover:shadow-lg transition w-full"
                >
                  Book Now
                </button>
              </div>
            </div>
          ))}


        </div>
      </div>

      {leadOpen && (
        <BookingModal
          isOpen={leadOpen}
          onClose={() => setLeadOpen(false)}
          onContinue={handleLeadContinue}
          booking={selectedBooking}
          passengerCount={searchForm?.passengers || 1}
          serviceType={activeService}
        />
      )}
    </div>
  );
}
