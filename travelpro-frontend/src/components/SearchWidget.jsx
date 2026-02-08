import { MapPin, Calendar, Users, Search } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useLocation, useSearchParams } from "react-router-dom";
import airportsRaw from "../data/airports.json";

const AIRPORTS = Object.values(airportsRaw)
  .filter((a) => a.iata && a.name)
  .map((a) => ({
    code: String(a.iata).toUpperCase(),
    city: a.city || "",
    name: a.name,
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
  const [activeField, setActiveField] = useState(null);
  const fromTimerRef = useRef(null);
  const toTimerRef = useRef(null);

  const updateField = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const filterAirports = (query) => {
    const q = String(query || "").trim().toLowerCase();
    if (!q) return [];
    return AIRPORTS.filter(
      (a) =>
        a.code.toLowerCase().startsWith(q) ||
        a.city.toLowerCase().includes(q) ||
        a.name.toLowerCase().includes(q)
    ).slice(0, 12);
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

  const handleSearchClick = () => {
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

  useEffect(() => {
    if (!isResultsPage) return;
    const next = {
      from: searchParams.get("from") || formData.from || "",
      to: searchParams.get("to") || formData.to || "",
      date: searchParams.get("date") || formData.date || "",
      passengers: Number(searchParams.get("passengers") || formData.passengers || 1),
    };
    setFormData?.(next);
  }, [isResultsPage, searchParams, setFormData]);

  return (
    <div className={`${compact ? "py-2 px-0" : "py-6 px-0"}`}>
      <div className="w-full">
        <div
          className={`bg-white border border-gray-300 rounded-xl ${compact ? "p-4" : "p-6"} shadow-[0_18px_30px_rgba(15,41,77,0.18)] ${containerClassName}`}
        >

          <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 ${compact ? "gap-3" : "gap-4"}`}>

            {/* FLIGHTS / TRAINS / PACKAGES */}
            {(activeService === "flights" ||
              activeService === "trains" ||
              activeService === "packages") && (
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
            onClick={() => {
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
            onClick={() => {
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
        {[1,2,3,4,5].map((n) => (
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
                  <input
                    value={formData.city || ""}
                    onChange={(e) => updateField("city", e.target.value)}
                    placeholder="Mumbai"
                    className="input-style"
                  />
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
                    min={today}
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
                      <option key={n}>{n} Room</option>
                    ))}
                  </select>
                </Input>
              </>
            )}

            {/* INSURANCE */}
            {activeService === "insurance" && (
  <>
    {/* CATEGORY */}
    <Input label="Insurance Category" icon={Users}>
      <select
        value={formData.category || ""}
        onChange={(e) => updateField("category", e.target.value)}
        className="input-style"
      >
        <option value="">Select Category</option>
        <option>Travel Insurance</option>
        <option>Health Insurance</option>
        <option>Life Insurance</option>
        <option>Motor Insurance</option>
        <option>Home Insurance</option>
        <option>Business Insurance</option>
      </select>
    </Input>

    {/* SUB TYPE */}
    <Input label="Insurance Type" icon={Users}>
      <input
        value={formData.type || ""}
        onChange={(e) => updateField("type", e.target.value)}
        placeholder="e.g. Family Floater / Term Plan"
        className="input-style"
      />
    </Input>

    {/* START DATE */}
    <Input label="Start Date" icon={Calendar}>
      <input
        type="date"
        min={today}
        value={formData.startDate || ""}
        onChange={(e) => updateField("startDate", e.target.value)}
        className="input-style"
      />
    </Input>

    {/* SUM INSURED */}
    <Input label="Coverage Amount" icon={Users}>
      <input
        value={formData.coverage || ""}
        onChange={(e) => updateField("coverage", e.target.value)}
        placeholder="e.g. ₹10,00,000"
        className="input-style"
      />
    </Input>
  </>
)}


{activeService === "cabs" && (
  <>
    <Input label="Pickup Location" icon={MapPin}>
      <input
        value={formData.pickup || ""}
        onChange={(e) => updateField("pickup", e.target.value)}
        placeholder="Delhi"
        className="input-style"
      />
    </Input>

    <Input label="Drop Location" icon={MapPin}>
      <input
        value={formData.drop || ""}
        onChange={(e) => updateField("drop", e.target.value)}
        placeholder="Agra"
        className="input-style"
      />
    </Input>

    <Input label="Pickup Date" icon={Calendar}>
      <input
        type="date"
        min={today}
        value={formData.pickupDate || ""}
        onChange={(e) =>
          updateField("pickupDate", e.target.value)
        }
        className="input-style"
      />
    </Input>
  </>
)}

{activeService === "buses" && (
  <>
    <Input label="From" icon={MapPin}>
      <input
        value={formData.from || ""}
        onChange={(e) => updateField("from", e.target.value)}
        placeholder="Delhi"
        className="input-style"
      />
    </Input>

    <Input label="To" icon={MapPin}>
      <input
        value={formData.to || ""}
        onChange={(e) => updateField("to", e.target.value)}
        placeholder="Jaipur"
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

    <Input label="Seat Type" icon={Users}>
      <select
        value={formData.seatType || "Sleeper"}
        onChange={(e) => updateField("seatType", e.target.value)}
        className="input-style"
      >
        <option>Sleeper</option>
        <option>Seater</option>
        <option>AC</option>
        <option>Non-AC</option>
      </select>
    </Input>
  </>
)}
{activeService === "cruises" && (
  <>
    <Input label="Departure Port" icon={MapPin}>
      <input
        value={formData.port || ""}
        onChange={(e) => updateField("port", e.target.value)}
        placeholder="Mumbai Port"
        className="input-style"
      />
    </Input>

    <Input label="Departure Date" icon={Calendar}>
      <input
        type="date"
        min={today}
        value={formData.cruiseDate || ""}
        onChange={(e) =>
          updateField("cruiseDate", e.target.value)
        }
        className="input-style"
      />
    </Input>

    <Input label="Guests" icon={Users}>
      <select
        value={formData.passengers || 1}
        onChange={(e) =>
          updateField("passengers", Number(e.target.value))
        }
        className="input-style"
      >
        {[1,2,3,4,5].map((n) => (
          <option key={n}>{n}</option>
        ))}
      </select>
    </Input>
  </>
)}


          </div>

          <button
            type="button"
            onClick={handleSearchClick}
            className={`mt-6 w-full bg-[#FFCC00] text-black py-3 rounded-lg font-bold hover:bg-[#f2c200] transition flex items-center justify-center gap-2 shadow-sm ${
              compact ? "text-sm" : "text-base"
            }`}
          >
            <Search size={20} />
            {submitLabel || `SEARCH ${serviceLabels[activeService] || "FLIGHTS"}`}
          </button>
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
