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
import { MapPin, Star, CheckCircle } from "lucide-react";

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

  const brands = {
    hotels: [
      "Grand Hyatt",
      "Marriott",
      "Radisson Blu",
      "Taj Palace",
      "The Oberoi",
      "Ibis",
    ],
    car_rental: [
      "Swift Dzire",
      "Honda City",
      "Toyota Innova",
      "Hyundai Creta",
      "BMW 3 Series",
      "Tesla Model 3",
    ],
    bus: [
      "ZingBus AC Sleeper",
      "IntrCity SmartBus",
      "Raj Travels",
      "SRS Travels",
      "Orange Travels",
      "Parveen Travels",
    ],
    train: [
      "Shatabdi Express",
      "Rajdhani Express",
      "Vande Bharat",
      "Duronto Express",
      "Jan Shatabdi",
      "Humsafar Express",
    ],
    cruises: [
      "Royal Caribbean",
      "Costa Cruises",
      "Norwegian Cruise",
      "MSC Cruises",
      "Celebrity Cruises",
      "Carnival",
    ],
    insurance: [
      "Acko Travel Shield",
      "Tata AIG Globe",
      "HDFC Ergo",
      "ICICI Lombard",
      "Bajaj Allianz",
      "Star Health",
    ],
    packages: [
      `Best of ${t} - 3D/2N`,
      `${t} Explorer - 5D/4N`,
      `${t} Luxury - 7D/6N`,
      `Budget ${t} - 4D/3N`,
      `${t} Family Pkg`,
      `Honeymoon ${t}`,
    ],
  };
  const prices = {
    hotels: 4500,
    car_rental: 2000,
    bus: 900,
    train: 1200,
    cruises: 35000,
    insurance: 600,
    packages: 22000,
  };

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
          searchParams.get("from") || location.state?.searchData?.from || "",
        to: searchParams.get("to") || location.state?.searchData?.to || "",
        date:
          searchParams.get("date") || location.state?.searchData?.date || "",
        passengers: Number(
          searchParams.get("passengers") ||
            location.state?.searchData?.passengers ||
            1,
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
            searchParams.get("rooms") || location.state?.searchData?.rooms || 1,
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
    [location.state, searchParams, activeService],
  );

  const [searchForm, setSearchForm] = useState(buildSearchFromParams);
  const [draftForm, setDraftForm] = useState(buildSearchFromParams);

  const [loading, setLoading] = useState(() => {
    const params = buildSearchFromParams();
    if (activeService === "flights")
      return !!(params.from && params.to && params.date);
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
  // ── NEW: active filter chip ──────────────────────────────────────────────
  const [activeChip, setActiveChip] = useState(null);

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
          const res = await fetch(`${API_BASE}/api/flights/search`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              from: cleanFrom,
              to: cleanTo,
              date: searchForm.date,
            }),
          });
          const data = await res.json();
          if (res.ok) {
            setResults(
              Array.isArray(data) && data.length > 0
                ? data
                : generateFrontendMock("flights", cleanFrom, cleanTo),
            );
          } else {
            setResults(generateFrontendMock("flights", cleanFrom, cleanTo));
          }
          return;
        }

        if (activeService === "hotels") {
          const params = new URLSearchParams({
            city: searchForm.city || searchForm.to,
            checkIn: searchForm.checkIn || searchForm.date,
            checkOut: searchForm.checkOut || "",
            rooms: searchForm.rooms || 1,
            guests: searchForm.passengers || 1,
          }).toString();
          const res = await fetch(`${API_BASE}/api/hotels/search?${params}`);
          const data = await res.json();
          setResults(
            res.ok && Array.isArray(data) && data.length > 0
              ? data
              : generateFrontendMock("hotels", cleanFrom, cleanTo),
          );
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
        const res = await fetch(`${API_BASE}/api/transport/search?${params}`);
        const data = await res.json();
        if (res.ok) {
          const payload = data?.data || [];
          setResults(
            Array.isArray(payload) && payload.length > 0
              ? payload
              : generateFrontendMock(serviceType, cleanFrom, cleanTo),
          );
        } else {
          setResults(generateFrontendMock(serviceType, cleanFrom, cleanTo));
        }
      } catch (err) {
        const svcType = activeService === "flights" ? "flights" : activeService;
        setResults(
          generateFrontendMock(svcType, searchForm.from, searchForm.to),
        );
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [searchForm, navigate, activeService]);

  const handleSearchSubmit = (data) => {
    const mapped = mapSearchFields(data);
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
    setSearchForm(next);
    setDraftForm(next);
    setSearchParams(next);
  };

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
    return { min: Math.min(...prices), max: Math.max(...prices) };
  }, [results]);

  const pricePlaceholders = useMemo(
    () => ({
      min: formatPrice(priceStats.min),
      max: formatPrice(priceStats.max),
    }),
    [formatPrice, priceStats],
  );

  // ── Apply filter chip to results ─────────────────────────────────────────
  const filteredResults = useMemo(() => {
    if (activeService !== "flights") return results;

    const selectedStops = Object.entries(stopsFilter)
      .filter(([, v]) => v)
      .map(([k]) => k);
    const activeAirlines = Object.entries(selectedAirlines)
      .filter(([, v]) => v)
      .map(([k]) => k);

    let filtered = results.filter((item) => {
      const stopsMatch =
        selectedStops.length === 0 ||
        selectedStops.some((key) => {
          if (key === "nonstop") return item.stops === 0;
          if (key === "oneStop") return item.stops === 1;
          return item.stops >= 2;
        });
      const airlineMatch =
        activeAirlines.length === 0 ||
        activeAirlines.includes(item.airlineName);
      const min = priceRange.min !== "" ? Number(priceRange.min) : null;
      const max = priceRange.max !== "" ? Number(priceRange.max) : null;
      const price = Number(item.price || 0);
      return (
        stopsMatch &&
        airlineMatch &&
        (min === null || price >= min) &&
        (max === null || price <= max)
      );
    });

    // Apply quick filter chips
    if (activeChip === "nonstop")
      filtered = filtered.filter((r) => r.stops === 0);
    else if (activeChip === "morning")
      filtered = filtered.filter((r) => {
        const h = parseInt(r.departure?.split(":")[0] || "0");
        return h >= 6 && h < 12;
      });
    else if (activeChip === "cheapest")
      filtered = [...filtered].sort((a, b) => a.price - b.price);

    return sortFlights(filtered, sortType);
  }, [
    results,
    stopsFilter,
    selectedAirlines,
    priceRange,
    sortType,
    activeService,
    activeChip,
  ]);

  return (
    <div className="min-h-screen bg-white text-[#1e293b] font-sans">
      <Navbar />

      <div className="w-full px-4 md:px-8 py-8 flex gap-8">
        <div className="flex-1">
          {/* Header */}
          <div className="mb-4">
            <h2 className="text-2xl font-bold text-[#0f294d]">
              {activeService === "hotels" ? (
                <>
                  Hotels in <span>{searchForm?.to || searchForm?.city}</span>
                </>
              ) : (
                <>
                  {serviceLabels[activeService] || "Results"} from{" "}
                  <span>{searchForm?.from}</span> to{" "}
                  <span>{searchForm?.to}</span>
                </>
              )}
            </h2>
          </div>

          {/* Loading */}
          {loading && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/90 backdrop-blur-sm">
              <FetchingLoader
                service={activeService}
                passengers={searchForm?.passengers || 1}
              />
            </div>
          )}

          {/* Error / Empty */}
          {!loading && (error || results.length === 0) && (
            <div className="glass-card rounded-xl p-10 text-center">
              <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <h3 className="text-xl font-bold text-[#0f294d] mb-2">
                No {serviceLabels[activeService] || "Results"} Found
              </h3>
              <p className="text-gray-600">
                {error || "Try changing your date or route."}
              </p>
            </div>
          )}

          {!loading &&
            results.length > 0 &&
            filteredResults.length === 0 &&
            !error && (
              <div className="glass-card rounded-xl p-10 text-center">
                <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <h3 className="text-xl font-bold text-[#0f294d] mb-2">
                  No Matches
                </h3>
                <p className="text-gray-600">
                  Try adjusting filters to see more options.
                </p>
              </div>
            )}

          {/* Results */}
          {!loading && filteredResults.length > 0 && (
            <div className="w-full">
              {/* ── SLIM NOTIFICATION BAR (replaces big banner) ── */}
              <div
                className="rounded-xl px-5 py-4 mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                style={{
                  background: "linear-gradient(90deg, #0f294d, #1a3b66)",
                }}
              >
                <div className="flex items-center gap-3">
                  <TrendingUp
                    size={18}
                    className="text-[#FFCC00] flex-shrink-0"
                  />
                  <p className="text-white text-sm font-semibold">
                    We found{" "}
                    <span className="text-[#FFCC00] font-black">
                      {results.length} unpublished rates
                    </span>{" "}
                    for this route — not available on public booking sites.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setSelectedBooking(filteredResults[0]);
                    setLeadOpen(true);
                  }}
                  className="flex-shrink-0 bg-[#FFCC00] text-[#0f294d] text-sm font-black px-5 py-2 rounded-lg hover:bg-[#ffd633] transition whitespace-nowrap"
                >
                  Reveal Rates →
                </button>
              </div>

              {/* ── FILTER CHIPS (flights only) ── */}
              {activeService === "flights" && (
                <div className="flex gap-2 mb-5 flex-wrap">
                  {[
                    { id: "nonstop", label: "Non-stop" },
                    { id: "morning", label: "Morning departure" },
                    { id: "cheapest", label: "Best value" },
                  ].map((chip) => (
                    <button
                      key={chip.id}
                      onClick={() =>
                        setActiveChip(activeChip === chip.id ? null : chip.id)
                      }
                      className={`px-4 py-2 rounded-full text-sm font-semibold border transition ${
                        activeChip === chip.id
                          ? "bg-[#0f294d] text-white border-[#0f294d]"
                          : "bg-white text-[#0f294d] border-gray-200 hover:border-[#0f294d]"
                      }`}
                    >
                      {chip.label}
                    </button>
                  ))}
                  <span className="ml-auto text-xs text-gray-400 self-center">
                    More options available by phone — call our team
                  </span>
                </div>
              )}

              {/* ── TOP RESULT CARD ── */}
              <div className="glass-card rounded-2xl overflow-hidden border-[#FFCC00]/30 border-2">
                <div className="bg-[#FFCC00]/10 px-6 py-3 border-b border-[#FFCC00]/20 flex items-center justify-between">
                  <span className="text-[#0f294d] font-bold text-sm uppercase tracking-wider">
                    Top Recommended {serviceLabels[activeService] || "Deal"}
                  </span>
                  <span className="bg-green-600 text-white text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-tighter italic">
                    Cheapest
                  </span>
                </div>
                <div className="p-6">
                  <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="flex flex-col md:flex-row items-center gap-6 flex-1">
                      <div className="w-full md:w-48 h-32 relative rounded-2xl overflow-hidden bg-gray-100 flex-shrink-0">
                        <img
                          src={
                            activeService === "flights"
                              ? `https://images.kiwi.com/airlines/64/${filteredResults[0].airlineCode}.png`
                              : filteredResults[0].image ||
                                "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600"
                          }
                          alt={
                            filteredResults[0].airlineName ||
                            filteredResults[0].title
                          }
                          className={`w-full h-full ${activeService === "flights" ? "object-contain p-4" : "object-cover"}`}
                        />
                      </div>

                      {activeService === "flights" ? (
                        <div className="flex-1 w-full">
                          {/* ── Airline name prominently shown ── */}
                          <p className="text-[#0f294d] font-bold text-base mb-3">
                            {filteredResults[0].airlineName} &nbsp;·&nbsp;
                            <span className="text-gray-500 font-normal text-sm">
                              {filteredResults[0].flightNumber}
                            </span>
                          </p>
                          <div className="grid grid-cols-3 gap-6 text-center">
                            <div>
                              <p className="font-black text-2xl text-[#0f294d]">
                                {filteredResults[0].departure}
                              </p>
                              <p className="text-xs text-gray-500 font-bold uppercase">
                                {filteredResults[0].from}
                              </p>
                            </div>
                            <div className="flex flex-col items-center justify-center py-2">
                              <p className="text-[10px] text-gray-400 font-bold mb-1">
                                {filteredResults[0].duration}
                              </p>
                              <div className="w-full h-[2px] bg-gray-200 relative flex items-center justify-center">
                                <div className="w-2.5 h-2.5 bg-gray-300 rounded-full border-2 border-white"></div>
                              </div>
                              <p className="text-[10px] text-green-600 mt-1 font-black uppercase tracking-tighter">
                                {filteredResults[0].stops === 0
                                  ? "Non-stop"
                                  : `${filteredResults[0].stops} Stop`}
                              </p>
                            </div>
                            <div>
                              <p className="font-black text-2xl text-[#0f294d]">
                                {filteredResults[0].arrival}
                              </p>
                              <p className="text-xs text-gray-500 font-bold uppercase">
                                {filteredResults[0].to}
                              </p>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="flex-1 text-center md:text-left">
                          <h4 className="text-2xl font-black text-[#0f294d] mb-1">
                            {filteredResults[0].title ||
                              filteredResults[0].operatorName}
                          </h4>
                          <p className="text-sm text-gray-500 font-bold flex items-center justify-center md:justify-start gap-1">
                            <MapPin size={14} />{" "}
                            {filteredResults[0].subtitle ||
                              filteredResults[0].address ||
                              "City Center Location"}
                          </p>
                          <div className="mt-3 flex items-center justify-center md:justify-start gap-4">
                            {filteredResults[0].rating && (
                              <div className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-black flex items-center gap-1">
                                <Star size={12} fill="currentColor" />{" "}
                                {filteredResults[0].rating}
                              </div>
                            )}
                            <div className="bg-green-50 text-green-700 px-3 py-1 rounded-full text-xs font-black flex items-center gap-1">
                              <CheckCircle size={12} /> Instant Confirmation
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* ── Price + CTA ── */}
                    <div className="text-center md:text-right md:pl-8 md:border-l md:border-gray-100 min-w-[200px]">
                      <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-1">
                        Our Rate
                      </p>
                      <div className="mb-4">
                        <p className="text-4xl font-black text-[#0a821c]">
                          {formatPrice(filteredResults[0].price)}
                        </p>
                        <p className="text-[10px] text-gray-400 font-bold uppercase">
                          {activeService === "hotels"
                            ? "Per Night"
                            : "Total for All Travelers"}
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          setSelectedBooking(filteredResults[0]);
                          setLeadOpen(true);
                        }}
                        className="bg-[#0f294d] text-white font-bold py-3 px-8 rounded-xl hover:bg-[#1a3b66] transition w-full"
                      >
                        Book This Rate
                      </button>
                      <p className="text-xs text-gray-400 mt-3">
                        Showing top result — {results.length - 1} more available
                        via our team
                      </p>
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
