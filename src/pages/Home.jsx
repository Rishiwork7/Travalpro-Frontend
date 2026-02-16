import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import ServiceTabs from "../components/ServiceTabs";
import SearchWidget from "../components/SearchWidget";
import { Shield, Headset, Wallet, Star, ArrowUpRight, Quote, BadgeCheck } from "lucide-react";
import { useSettings } from "../context/SettingsContext";

export default function Home() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeService, setActiveService] = useState(searchParams.get("service") || "flights");

  const handleServiceChange = (serviceId) => {
    setActiveService(serviceId);
    setSearchParams(prev => {
      const newParams = new URLSearchParams(prev);
      newParams.set("service", serviceId);
      return newParams;
    });
  };

  const [formData, setFormData] = useState({});
  const [email, setEmail] = useState("");
  const [toast, setToast] = useState("");
  const { formatPrice } = useSettings();
  const navigate = useNavigate();
  const statsRef = useRef(null);
  const [statsVisible, setStatsVisible] = useState(false);
  const [counts, setCounts] = useState({
    travelers: 0,
    rating: 0,
    years: 0,
    searches: 0,
  });

  const deals = [
    {
      from: "DEL",
      to: "DXB",
      city: "Dubai",
      date: "2026-12-01",
      price: 295,
      tags: ["Direct Flight", "Refundable"],
      image:
        "https://images.unsplash.com/photo-1512453979798-5ea90b2009f4?q=80&w=1200&auto=format&fit=crop",
    },
    {
      from: "BOM",
      to: "LHR",
      city: "London",
      date: "2026-12-05",
      price: 700,
      tags: ["All Inclusive", "Best Seller"],
      image:
        "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?q=80&w=1200&auto=format&fit=crop",
    },
    {
      from: "BLR",
      to: "SIN",
      city: "Singapore",
      date: "2026-12-10",
      price: 260,
      tags: ["Direct Flight", "Flexible"],
      image:
        "https://images.unsplash.com/photo-1525625293386-3f8f99389edd?q=80&w=1200&auto=format&fit=crop",
    },
    {
      from: "MAA",
      to: "BKK",
      city: "Bangkok",
      date: "2026-12-15",
      price: 230,
      tags: ["Refundable", "Limited Time"],
      image:
        "https://images.unsplash.com/photo-1508009603885-50cf7c579365?q=80&w=1200&auto=format&fit=crop",
    },
  ];

  const handleSearch = () => {
    let from = formData.from;
    let to = formData.to;
    let date = formData.date;

    if (activeService === "hotels") {
      if (!formData.city || !formData.checkIn || !formData.checkOut) {
        alert("Fill all fields");
        return;
      }
      to = formData.city;
      date = formData.checkIn;
      if (!formData.rooms) formData.rooms = 1;
      if (!formData.adults) formData.adults = 1;
    } else if (activeService === "cabs") {
      if (!formData.pickup || !formData.drop || !formData.pickupDate) {
        alert("Fill all fields");
        return;
      }
      from = formData.pickup;
      to = formData.drop;
      date = formData.pickupDate;
    } else if (activeService === "cruises") {
      if (!formData.port || !formData.cruiseDate) {
        alert("Fill all fields");
        return;
      }
      from = formData.port;
      to = formData.port;
      date = formData.cruiseDate;
    } else if (activeService === "insurance") {
      if (!formData.category || !formData.type || !formData.startDate) {
        alert("Fill all fields");
        return;
      }
      from = formData.category;
      to = formData.type;
      date = formData.startDate;
    } else if (!from || !to || !date) {
      alert("Fill all fields");
      return;
    }

    const passengers = formData.passengers || 1;
    const params = new URLSearchParams({
      from: from || "",
      to: to || "",
      date: date || "",
      passengers: String(passengers),
      service: activeService,
      rooms: formData.rooms || "1",
      adults: formData.adults || "1",
    }).toString();

    navigate(`/results?${params}`, {
      state: {
        searchData: { ...formData, from, to, date, passengers, adults: formData.adults || 1 },
        activeService,
      },
    });
  };

  const handleSubscribe = () => {
    const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (!isValid) {
      setToast("Please enter a valid email address.");
      return;
    }
    setToast("Subscribed! You will receive secret deals soon.");
    setEmail("");
    setTimeout(() => setToast(""), 3000);
  };

  useEffect(() => {
    const service = searchParams.get("service");
    if (service) {
      setActiveService(service);
    }
  }, [searchParams]);

  useEffect(() => {
    if (!statsRef.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setStatsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.35 }
    );
    observer.observe(statsRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!statsVisible) return;
    const duration = 2000;
    const start = performance.now();
    const targets = {
      travelers: 12,
      rating: 4.7,
      years: 12,
      searches: 35,
    };

    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      setCounts({
        travelers: Math.floor(targets.travelers * progress),
        rating: Number((targets.rating * progress).toFixed(1)),
        years: Math.floor(targets.years * progress),
        searches: Math.floor(targets.searches * progress),
      });
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [statsVisible]);

  const stats = useMemo(
    () => [
      { key: "travelers", label: "Verified Travelers", suffix: "M+" },
      { key: "rating", label: "Trustpilot Rating", suffix: "/5", stars: true },
      { key: "years", label: "Years of Excellence", suffix: "+" },
      { key: "searches", label: "Daily Flight Searches", suffix: "K+" },
    ],
    []
  );

  return (
    <div className="min-h-screen bg-white text-gray-900 page-fade-in">
      <Navbar />

      {/* Hero with Search (Full-Width) */}
      <section
        className="relative isolate bg-white"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=2000&auto=format&fit=crop')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-[#0f294d]/18 via-[#0f294d]/06 to-transparent"></div>
        <div className="relative max-w-7xl mx-auto px-6 py-12 lg:py-16">
          <div className="max-w-2xl text-white">
            <h1 className="text-3xl md:text-4xl font-bold leading-tight">
              Book Smarter. Travel Better.
            </h1>
            <p className="mt-3 text-white/90">
              Compare top airlines and hotel partners with confidence.
            </p>
          </div>

          <div className="mt-8">
            <div className="bg-white rounded-2xl border border-gray-200">
              <ServiceTabs
                activeService={activeService}
                setActiveService={handleServiceChange}
              />
              <div id="search-widget" className="px-4 pb-6">
                <SearchWidget
                  activeService={activeService}
                  formData={formData}
                  setFormData={setFormData}
                  onSearch={handleSearch}
                  containerClassName="rounded-t-none border-t-0 shadow-none"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Bar */}
      <section className="bg-slate-50/80 py-14">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold text-[#0f294d] mb-3">
              Book with Confidence
            </h2>
            <p className="text-[#64748b] text-base md:text-lg max-w-2xl mx-auto">
              A refined booking experience built for trust, clarity, and peace of mind.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Wallet,
                title: "Best Price Guarantee",
                desc: "We match any lower price found.",
              },
              {
                icon: Headset,
                title: "24/7 Support",
                desc: "Expert help available day and night.",
              },
              {
                icon: Shield,
                title: "100% Secure",
                desc: "Bank-level security for your data.",
              },
              {
                icon: Star,
                title: "Trusted Brand",
                desc: "40M+ travelers trust our service.",
              },
            ].map((item, index) => (
              <div
                key={index}
                className="group bg-white p-7 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1"
              >
                <div className="w-14 h-14 bg-[#FFCC00] rounded-full flex items-center justify-center mb-5 shadow-[0_0_16px_rgba(255,204,0,0.25)]">
                  <item.icon className="w-7 h-7 text-[#0f294d]" strokeWidth={2} />
                </div>
                <h3 className="text-lg font-bold text-[#0f294d] mb-2">{item.title}</h3>
                <p className="text-[#64748b] text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Deals Grid */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-2xl font-bold text-[#0f294d]">Recommended for your trip</h2>
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {deals.map((deal) => (
              <Link
                key={`${deal.from}-${deal.to}`}
                to={`/results?from=${deal.from}&to=${deal.to}&date=${deal.date}&passengers=1&service=flights`}
                className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-md hover:shadow-lg transition hover:-translate-y-1 group"
              >
                <img
                  src={deal.image}
                  alt={`${deal.city} deal`}
                  className="h-36 w-full object-cover"
                />
                <div className="p-4 space-y-3">
                  <div>
                    <p className="text-[#0f294d] font-semibold">{deal.city}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      <span className="font-semibold text-[#0f294d]">{deal.from}</span> ⇄{" "}
                      <span className="font-semibold text-[#0f294d]">{deal.to}</span>
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {deal.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-[10px] uppercase tracking-wide bg-slate-100 text-slate-600 px-2 py-1 rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-[#0a821c] font-bold">{formatPrice(deal.price)}</p>
                    <span className="text-[#0f294d] font-semibold flex items-center gap-1 text-sm">
                      Book Now
                      <ArrowUpRight size={16} />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Metrics */}
      <section
        ref={statsRef}
        className="bg-gradient-to-r from-[#0f294d] to-[#1a3b66] py-12 relative overflow-hidden"
      >
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {stats.map((stat, index) => (
              <div
                key={stat.key}
                className={`flex flex-col items-center justify-center p-4 ${index > 0 ? "md:border-l md:border-white/10" : ""
                  }`}
              >
                <h3 className="text-4xl md:text-5xl font-extrabold text-[#FFCC00] mb-2 font-mono drop-shadow-lg">
                  {stat.key === "rating" ? counts[stat.key].toFixed(1) : counts[stat.key]}
                  {stat.suffix}
                </h3>
                {stat.stars && (
                  <div className="flex gap-1 text-[#FFCC00] text-sm mb-1">
                    {"★★★★★"}
                  </div>
                )}
                <p className="text-white text-sm md:text-base font-medium tracking-wider uppercase opacity-90">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-[#0f294d]">Loved by Millions</h2>
              <p className="text-sm text-gray-600 mt-2">
                Verified reviews from travelers who booked with TravelPro.
              </p>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <BadgeCheck size={16} className="text-[#0a821c]" />
              4.7 average rating across verified bookings
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                name: "Amelia R.",
                route: "DEL → DXB",
                date: "Dec 2026",
                text: "Seamless booking flow. The fare matched what I saw on the airline site, and support followed up within minutes.",
              },
              {
                name: "Marcus L.",
                route: "BOM → LHR",
                date: "Jan 2027",
                text: "Got a better deal over the phone and the agent handled seat selection and meals in one call.",
              },
              {
                name: "Sofia P.",
                route: "BLR → SIN",
                date: "Nov 2026",
                text: "Clear pricing, no surprises. Refund policy was explained before I confirmed the booking.",
              },
            ].map((t) => (
              <div
                key={t.name}
                className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition hover:-translate-y-1"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#f2f7fd] flex items-center justify-center text-[#0f294d] font-semibold">
                      {t.name.slice(0, 1)}
                    </div>
                    <div>
                      <p className="font-semibold text-[#0f294d]">{t.name}</p>
                      <p className="text-xs text-gray-500">{t.route} • {t.date}</p>
                    </div>
                  </div>
                  <Quote size={18} className="text-[#FFCC00]" />
                </div>

                <div className="mt-4 flex items-center gap-1 text-[#FFCC00]">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} size={16} fill="#FFCC00" stroke="#FFCC00" />
                  ))}
                </div>

                <p className="mt-4 text-gray-700 text-sm leading-relaxed">{t.text}</p>

                <div className="mt-4 inline-flex items-center gap-2 text-xs text-[#0f294d] bg-[#f8fafc] px-3 py-1 rounded-full border border-gray-100">
                  <BadgeCheck size={14} className="text-[#0a821c]" />
                  Verified Booking
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-10 bg-gradient-to-r from-[#0f294d] to-[#153a6b]">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="text-white">
            <h3 className="text-2xl font-bold">Get Secret Deals</h3>
            <p className="text-white/80 text-sm mt-1">Exclusive fares sent directly to your inbox.</p>
          </div>
          <div className="flex w-full md:w-auto gap-3">
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter email address"
              className="w-full md:w-80 bg-white text-[#0f294d] px-4 py-3 rounded-lg outline-none"
            />
            <button
              onClick={handleSubscribe}
              className="bg-[#FFCC00] text-black font-semibold px-6 py-3 rounded-lg hover:bg-[#f2c200] transition"
            >
              Subscribe
            </button>
          </div>
        </div>
      </section>

      {toast && (
        <div className="fixed right-6 bottom-6 bg-white border border-gray-200 shadow-lg rounded-lg px-4 py-3 text-sm text-[#0f294d]">
          {toast}
        </div>
      )}

      <Footer />
    </div>
  );
}
