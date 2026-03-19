import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { useEffect, useState, useMemo } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import SearchWidget from "../components/SearchWidget";
import BookingModal from "../components/BookingModal";
import ServiceCard from "../components/cards/ServiceCard";
import SortDropdown from "../components/SortDropdown";
import { AlertCircle, TrendingUp, ArrowRight } from "lucide-react";
import FetchingLoader from "../components/FetchingLoader";
import { useSettings } from "../context/SettingsContext";
import { sortFlights } from "../utils/flightSort";
import API_BASE from "../config/api";

// ── FRONTEND MOCK FALLBACK ─────────────────────────────────────────────────
const AIRLINES = [
  { name: "IndiGo", code: "6E", base: 4200 },
  { name: "Air India", code: "AI", base: 5100 },
  { name: "SpiceJet", code: "SG", base: 3800 },
  { name: "Vistara", code: "UK", base: 5800 },
  { name: "GoFirst", code: "G8", base: 3500 },
  { name: "Akasa Air", code: "QP", base: 4000 },
];

const generateFrontendMock = (type, from, to) => {
  const f = (from || "DEL").split(" - ")[0].trim();
  const t = (to || "BOM").split(" - ")[0].trim();

  if (type === "flights") {
    return AIRLINES.map((airline, i) => ({
      id: `mock_flight_${i + 1}`,
      airlineName: airline.name,
      airlineCode: airline.code,
      flightNumber: `${airline.code}-${200 + i * 11}`,
      from: f,
      to: t,
      departure: `${(6 + i * 2).toString().padStart(2, "0")}:${i % 2 === 0 ? "00" : "30"}`,
      arrival: `${(9 + i * 2).toString().padStart(2, "0")}:${i % 2 === 0 ? "45" : "15"}`,
      duration: `${2 + (i % 3)}h ${i % 2 === 0 ? "45" : "15"}m`,
      stops: i % 3 === 2 ? 1 : 0,
      price: Math.round(airline.base * (1 + i * 0.08)),
      currency: "INR",
      isMock: true,
    }));
  }

  // Generic fallback for other services
  const brands = { hotels: ["Grand Hyatt", "Marriott", "Radisson Blu", "Taj Palace", "The Oberoi", "Ibis"],
    car_rental: ["Swift Dzire", "Honda City", "Toyota Innova", "Hyundai Creta", "BMW 3 Series", "Tesla Model 3"],
    bus: ["ZingBus AC Sleeper", "IntrCity SmartBus", "Raj Travels", "SRS Travels", "Orange Travels", "Parveen Travels"],
    train: ["Shatabdi Express", "Rajdhani Express", "Vande Bharat", "Duronto Express", "Jan Shatabdi", "Humsafar Express"],
    cruises: ["Royal Caribbean", "Costa Cruises", "Norwegian Cruise", "MSC Cruises", "Celebrity Cruises", "Carnival"],
    insurance: ["Acko Travel Shield", "Tata AIG Globe", "HDFC Ergo", "ICICI Lombard", "Bajaj Allianz", "Star Health"],
    packages: [`Best of ${t} - 3D/2N`, `${t} Explorer - 5D/4N`, `${t} Luxury - 7D/6N`, `Budget ${t} - 4D/3N`, `${t} Family Pkg`, `Honeymoon ${t}`],
  };
  const prices = { hotels: 4500, car_rental: 2000, bus: 900, train: 1200, cruises: 35000, insurance: 600, packages: 22000 };

  return Array.from({ length: 6 }, (_, i) => ({
    id: `mock_${type}_${i + 1}`,
    title: (brands[type] || brands.packages)[i],
    subtitle: `Available for ${t} • From ${f}`,
    price: Math.round((prices[type] || 5000) * (1 + i * 0.12)),
    currency: "INR",
    isMock: true,
  }));
};
// ──────────────────────────────────────────────────────────────────────────


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
          const res = await fetch(`${API_BASE}/api/flights/search`, {
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
              const mock = generateFrontendMock("flights", cleanFrom, cleanTo);
              setResults(mock);
            }
          } else {
            console.error("API Error:", data);
            const mock = generateFrontendMock("flights", cleanFrom, cleanTo);
            setResults(mock);
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
          const res = await fetch(`${API_BASE}/api/hotels/search?${params}`);
          const data = await res.json();
          console.timeEnd("Frontend Fetch Hotels");

          if (res.ok) {
            if (Array.isArray(data) && data.length > 0) {
              setResults(data);
            } else {
              const mock = generateFrontendMock("hotels", cleanFrom, cleanTo);
              setResults(mock);
            }
          } else {
            console.error("API Error:", data);
            const mock = generateFrontendMock("hotels", cleanFrom, cleanTo);
            setResults(mock);
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
          `${API_BASE}/api/transport/search?${params}`
        );
        const data = await res.json();
        console.timeEnd("Frontend Fetch");

        if (res.ok) {
          const payload = data?.data || [];
          if (Array.isArray(payload) && payload.length > 0) {
            setResults(payload);
          } else {
            const mock = generateFrontendMock(serviceType, cleanFrom, cleanTo);
            setResults(mock);
          }
        } else {
          console.error("API Error:", data);
          const mock = generateFrontendMock(serviceType, cleanFrom, cleanTo);
          setResults(mock);
        }
      } catch (err) {
        console.error("Fetch error:", err);
        // API is down — show mock data so user still sees results
        const svcType = activeService === "flights" ? "flights" : activeService;
        const mock = generateFrontendMock(svcType, searchForm.from, searchForm.to);
        setResults(mock);
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

      <div className="w-full px-4 md:px-8 py-8 flex gap-8">

        {/* Sidebar Filters - Hidden for this focused dashboard flow */}
        {activeService === "flights" && false && (
          <div className="hidden lg:block w-1/4 h-fit sticky top-32 space-y-4">
            {/* ... */}
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

          {/* 1. LOADING STATE - Fixed centered overlay */}
          {loading && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/90 backdrop-blur-sm">
              <FetchingLoader
                service={activeService}
                passengers={searchForm?.passengers || 1}
              />
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

          {/* 3. SUCCESS DASHBOARD (Found X Flights) */}
          {!loading && filteredResults.length > 0 && (
            <div className="w-full">
              {/* Success Banner */}
              <div 
                className="rounded-3xl p-8 md:p-12 mb-8 text-center"
                style={{
                  background: "linear-gradient(rgba(15,41,77,0.85), rgba(15,41,77,0.7)), url('https://images.unsplash.com/photo-1436491865332-7a61a109cc05?q=80&w=1200') center/cover",
                  boxShadow: "0 20px 50px rgba(0,0,0,0.15)",
                }}
              >
                <div className="inline-flex items-center gap-2 bg-[#FFCC00]/20 border border-[#FFCC00]/40 text-[#FFCC00] px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest mb-6">
                  <TrendingUp size={14} /> Great news! We found unpublished rates.
                </div>
                <h3 className="text-3xl md:text-5xl font-black text-white mb-4 leading-tight">
                  Found {results.length} Exclusive Deals for {searchForm?.to || "your trip"}!
                </h3>
                <p className="text-white/80 text-lg md:text-xl font-medium max-w-2xl mx-auto mb-8">
                  We have identified {Math.min(3, results.length)} unsold {serviceLabels[activeService]?.toLowerCase() || "deals"} seats specifically for your dates.
                </p>
                
                {/* Primary Button */}
                <button
                  onClick={() => {
                    setSelectedBooking(filteredResults[0]);
                    setLeadOpen(true);
                  }}
                  className="bg-[#FFCC00] hover:bg-[#ffd633] text-[#0f294d] text-xl font-black py-5 px-12 rounded-2xl shadow-[0_12px_40px_rgba(255,204,0,0.4)] transition-all hover:-translate-y-1 flex items-center justify-center gap-3 mx-auto"
                >
                  Reveal Secret Discounted Price <ArrowRight size={24} />
                </button>
              </div>

              {/* Best Value Card Highlight */}
              <div className="glass-card rounded-2xl overflow-hidden border-[#FFCC00]/30 border-2">
                <div className="bg-[#FFCC00]/10 px-6 py-3 border-b border-[#FFCC00]/20 flex items-center justify-between">
                  <span className="text-[#0f294d] font-bold text-sm uppercase tracking-wider">Top Recommended Deal</span>
                  <span className="bg-green-600 text-white text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-tighter italic">Cheapest</span>
                </div>
                <div className="p-6">
                   {/* We reuse a simplified version of the list card here */}
                   <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                      <div className="flex items-center gap-6 flex-1">
                        <img
                          src={`https://images.kiwi.com/airlines/64/${filteredResults[0].airlineCode}.png`}
                          alt={filteredResults[0].airlineName}
                          className="w-16 h-16 object-contain bg-white rounded-2xl p-2 border border-gray-100 shadow-sm"
                        />
                        <div className="flex-1 grid grid-cols-3 gap-6 text-center">
                          <div>
                            <p className="font-black text-2xl text-[#0f294d]">{filteredResults[0].departure}</p>
                            <p className="text-xs text-gray-500 font-bold uppercase">{filteredResults[0].from}</p>
                          </div>
                          <div className="flex flex-col items-center justify-center py-2">
                            <p className="text-[10px] text-gray-400 font-bold mb-1">{filteredResults[0].duration}</p>
                            <div className="w-full h-[2px] bg-gray-200 relative flex items-center justify-center">
                              <div className="w-2.5 h-2.5 bg-gray-300 rounded-full border-2 border-white"></div>
                            </div>
                            <p className="text-[10px] text-green-600 mt-1 font-black uppercase tracking-tighter">
                              {filteredResults[0].stops === 0 ? "Non-stop" : `${filteredResults[0].stops} Stop`}
                            </p>
                          </div>
                          <div>
                            <p className="font-black text-2xl text-[#0f294d]">{filteredResults[0].arrival}</p>
                            <p className="text-xs text-gray-500 font-bold uppercase">{filteredResults[0].to}</p>
                          </div>
                        </div>
                      </div>
                      <div className="text-center md:text-right md:pl-8 md:border-l md:border-gray-100 min-w-[200px]">
                        <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-1">{filteredResults[0].airlineName}</p>
                        <p className="text-4xl font-black text-[#0a821c] mb-4">
                          {formatPrice(filteredResults[0].price)}
                        </p>
                        <button
                          onClick={() => {
                            setSelectedBooking(filteredResults[0]);
                            setLeadOpen(true);
                          }}
                          className="bg-[#0f294d] text-white font-bold py-3 px-8 rounded-xl hover:bg-[#1a3b66] transition w-full"
                        >
                          Unlock My Rate
                        </button>
                      </div>
                   </div>
                </div>
              </div>
            </div>
          )}


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
          resultsCount={results.length}
        />
      )}
      <Footer />
    </div>
  );
}
