import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import {
  Shield,
  Globe,
  Headset,
  Award,
  Heart,
  CheckCircle,
  TrendingDown,
  Users,
  Phone,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";

export default function About() {
  const [showSticky, setShowSticky] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrolled =
        window.scrollY /
        (document.documentElement.scrollHeight - window.innerHeight);
      setShowSticky(scrolled > 0.5);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-white text-[#1e293b] page-fade-in font-sans">
      <Navbar />

      {/* ── HERO SECTION ── */}
      <section
        className="relative h-[60vh] flex items-center justify-center text-center px-6 overflow-hidden"
        style={{
          background:
            "linear-gradient(rgba(15,41,77,0.7), rgba(15,41,77,0.7)), url('https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=2000&auto=format&fit=crop')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="relative z-10 max-w-4xl">
          <h1 className="text-4xl md:text-6xl font-black text-white mb-6 drop-shadow-2xl tracking-tight leading-tight">
            Wholesale Fares. Real People. No Markups.
          </h1>
          <p className="text-white/90 text-lg md:text-xl font-medium max-w-2xl mx-auto leading-relaxed">
            At Travalpro, we bridge the gap between premium travel and wholesale
            prices, ensuring every journey is as affordable as it is
            unforgettable.
          </p>
        </div>
      </section>

      {/* ── OUR STORY SECTION ── */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <div className="inline-flex items-center gap-2 bg-[#FFCC00]/10 border border-[#FFCC00]/30 text-[#0f294d] px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest mb-6">
              <Award size={14} className="text-[#0f294d]" /> Our Journey
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-[#0f294d] mb-8 leading-tight">
              Started with a Mission to Make <br /> Travel Accessible for All
            </h2>
            <div className="space-y-6 text-gray-600 leading-relaxed text-lg">
              <p>
                Travalpro was founded by a team of travel enthusiasts and
                industry veterans who noticed a growing gap in the market. While
                major booking sites offered convenience, they often came with
                high markups and impersonal service.
              </p>
              <p>
                We decided to do things differently. By building direct
                relationships with global carriers and consolidators, we secured
                access to "wholesale" inventory—private rates that aren't
                advertised to the general public.
              </p>
              <p>
                Today, Travalpro is a trusted partner for thousands of
                travelers, offering prices that are typically 30-50% lower than
                standard online rates, backed by 24/7 human expertise.
              </p>
            </div>
          </div>
          <div className="relative">
            <div className="aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl">
              <img
                src="https://images.unsplash.com/photo-1527631746610-bca00a040d60?q=80&w=1200&auto=format&fit=crop"
                alt="Travalpro Travel Experts"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute -bottom-8 -left-8 bg-white p-8 rounded-2xl shadow-xl border border-slate-100 hidden md:block max-w-[280px]">
              <div className="flex items-center gap-4 mb-3">
                <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center text-green-600">
                  <TrendingDown size={20} />
                </div>
                <p className="font-bold text-[#0f294d] leading-tight">
                  Real-Time Savings
                </p>
              </div>
              <p className="text-sm text-slate-500">
                We save our clients an average of $350 per international booking
                vs public sites.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── WHY CHOOSE US GRID ── */}
      <section className="py-24 bg-[#0f294d] text-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Why Travelers Trust Travalpro
            </h2>
            <p className="text-white/70 text-lg">
              We combine direct wholesale access with a personalized touch to
              deliver a booking experience you won't find anywhere else.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: <Shield className="w-8 h-8 text-[#FFCC00]" />,
                title: "Bank-Level Security",
                desc: "Your data and transactions are protected with the highest 256-bit SSL encryption standards.",
              },
              {
                icon: <Globe className="w-8 h-8 text-[#FFCC00]" />,
                title: "Global Inventory",
                desc: "Access private rates for 500+ airlines and 1M+ hotels across 200 countries worldwide.",
              },
              {
                icon: <Headset className="w-8 h-8 text-[#FFCC00]" />,
                title: "24/7 Expert Help",
                desc: "No robots. Real human travel consultants are available round-the-clock via phone or chat.",
              },
              {
                icon: <Award className="w-8 h-8 text-[#FFCC00]" />,
                title: "Price Match",
                desc: "Find a lower public price for the exact same itinerary and we'll beat it, guaranteed.",
              },
            ].map((feature, idx) => (
              <div
                key={idx}
                className="bg-white/5 border border-white/10 p-8 rounded-3xl hover:bg-white/10 transition duration-300"
              >
                <div className="mb-6">{feature.icon}</div>
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-white/60 text-sm leading-relaxed">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>

          {/* ── Inline CTA after trust section ── */}
          <div className="mt-14 text-center">
            <p className="text-white/70 text-base mb-4">
              Ready to book at wholesale rates?
            </p>
            <a
              href="tel:+17472469545"
              className="inline-flex items-center gap-3 bg-[#FFCC00] text-[#0f294d] font-black py-4 px-10 rounded-2xl hover:bg-[#ffd633] transition text-lg"
            >
              <Phone size={20} /> Call Our Team Now — +1-747-246-9545
            </a>
          </div>
        </div>
      </section>

      {/* ── CORE VALUES ── */}
      <section className="py-24 px-6 bg-slate-50/50">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row gap-16 items-center">
            <div className="lg:w-1/3">
              <h2 className="text-3xl md:text-4xl font-extrabold text-[#0f294d] mb-6">
                Our Core Values
              </h2>
              <p className="text-slate-600 text-lg leading-relaxed mb-8">
                Integrity and transparency are at the heart of everything we do.
                We believe travel should be inclusive, not a luxury.
              </p>
              <div className="space-y-4">
                {[
                  "Honesty in Pricing",
                  "Expert Service Always",
                  "Human-First Support",
                ].map((v) => (
                  <div
                    key={v}
                    className="flex items-center gap-3 font-bold text-[#0f294d]"
                  >
                    <CheckCircle className="text-green-500 w-5 h-5" /> {v}
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:w-2/3 grid md:grid-cols-2 gap-6">
              <div className="bg-white p-10 rounded-3xl shadow-sm border border-slate-100 flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 mb-6 font-bold">
                  <Heart size={32} />
                </div>
                <h4 className="text-xl font-bold text-[#0f294d] mb-4">
                  Customer Obsessed
                </h4>
                <p className="text-slate-500 text-sm leading-relaxed">
                  We don't just sell tickets; we solve travel problems. Our team
                  is dedicated to your safety and satisfaction 24/7.
                </p>
              </div>
              <div className="bg-white p-10 rounded-3xl shadow-sm border border-slate-100 flex flex-col items-center text-center translate-y-6 hidden md:flex">
                <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 mb-6 font-bold">
                  <Users size={32} />
                </div>
                <h4 className="text-xl font-bold text-[#0f294d] mb-4">
                  Community Focused
                </h4>
                <p className="text-slate-500 text-sm leading-relaxed">
                  We believe in building lasting relationships with our
                  travelers, helping them see more of the world for less.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="py-24 bg-white px-6">
        <div className="max-w-5xl mx-auto bg-gradient-to-r from-[#0f294d] to-[#1a3b66] rounded-[40px] p-10 md:p-16 text-center text-white relative overflow-hidden shadow-2xl">
          <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
          <div className="relative z-10">
            <h2 className="text-3xl md:text-5xl font-black mb-8 italic tracking-tight uppercase">
              Ready to Start Your Adventure?
            </h2>
            <p className="text-white/80 text-lg md:text-xl mb-10 max-w-2xl mx-auto font-medium">
              Join thousands of smart travelers who save hundreds on every
              booking. Your dream journey is just one search away.
            </p>
            <div className="flex flex-col md:flex-row gap-4 justify-center">
              <Link
                to="/"
                className="bg-[#FFCC00] hover:bg-[#ffd633] text-[#0f294d] font-black py-5 px-12 rounded-2xl shadow-lg transition duration-300 transform hover:-translate-y-1 inline-flex items-center gap-2"
              >
                Search Flights Now <TrendingDown size={20} />
              </Link>
              <Link
                to="/contact"
                className="bg-white/10 hover:bg-white/20 text-white font-bold py-5 px-10 rounded-2xl border border-white/20 transition duration-300"
              >
                Contact Our Experts
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />

      {/* ── STICKY BOTTOM BAR (appears after 50% scroll) ── */}
      {showSticky && (
        <div
          className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-between gap-4 px-6 py-4"
          style={{ background: "#0f294d", borderTop: "2px solid #FFCC00" }}
        >
          <p className="text-white font-semibold text-sm hidden sm:block">
            Ready to book at wholesale rates?
          </p>
          <a
            href="tel:+17472469545"
            className="flex items-center gap-2 bg-[#FFCC00] text-[#0f294d] font-black px-6 py-3 rounded-xl hover:bg-[#ffd633] transition text-sm whitespace-nowrap"
          >
            <Phone size={16} /> Call Now — +1-747-246-9545
          </a>
          <a
            href="https://wa.me/919973607304?text=I%20want%20to%20book%20a%20flight%2C%20please%20help"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 bg-[#25D366] text-white font-bold px-5 py-3 rounded-xl hover:bg-[#1ebe5d] transition text-sm whitespace-nowrap"
          >
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg"
              width="16"
              height="16"
              alt="WhatsApp"
            />
            WhatsApp
          </a>
        </div>
      )}
    </div>
  );
}
