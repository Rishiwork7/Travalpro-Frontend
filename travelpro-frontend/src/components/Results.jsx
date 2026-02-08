import { useSettings } from "../context/SettingsContext";

export default function Results({
  results,
  loading,
  error,
  activeService,
  onBook,
}) {
  const { formatPrice } = useSettings();
  if (loading)
    return (
      <p className="text-black text-center mt-6 font-semibold">
        Fetching best deals...
      </p>
    );

  if (error)
    return (
      <p className="text-red-600 text-center mt-6 font-semibold">
        {error}
      </p>
    );

  if (!results || results.length === 0) return null;

  const formatTime = (time) => {
    if (!time) return "--";
    return new Date(time).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDuration = (duration) => {
    if (!duration) return "--";
    return duration
      .replace("PT", "")
      .replace("H", "h ")
      .replace("M", "m");
  };

  return (
    <div className="max-w-6xl mx-auto px-6 pb-20 mt-10 space-y-6">

      {results.map((item) => (
        <div
          key={item.id}
          className="bg-white border border-gray-200 text-gray-900 p-6 rounded-2xl shadow-md hover:shadow-xl transition"
        >

          {/* ================= FLIGHTS ================= */}
          {activeService === "flights" && (
            <div className="flex justify-between items-center">

              <div className="flex items-center gap-8">
                
                <div>
                  <p className="font-bold text-lg text-black">
                    {item.airlineName} {item.flightNumber}
                  </p>  
                  <p className="text-xs text-gray-600">
                    {item.from} → {item.to}
                  </p>
                </div>

                <div className="text-center">
                  <p className="font-bold text-black">
                    {formatTime(item.departureTime)}
                  </p>
                  <p className="text-xs text-gray-600">{item.from}</p>
                </div>

                <div className="text-center">
                  <p className="text-xs text-gray-600">
                    {formatDuration(item.duration)}
                  </p>
                  <div className="w-20 h-px bg-gray-300 my-1"></div>
                  <p className="text-xs text-gray-600">Non-stop</p>
                </div>

                <div className="text-center">
                  <p className="font-bold text-black">
                    {formatTime(item.arrivalTime)}
                  </p>
                  <p className="text-xs text-gray-600">{item.to}</p>
                </div>

              </div>

              <div className="text-right">
                <p className="text-xl font-bold text-[#0a821c]">
                  {formatPrice(item.price)}
                </p>
                <button
                  onClick={() => onBook(item)}
                  className="mt-2 bg-[#FFCC00] hover:bg-[#f2c200] text-black px-6 py-2 rounded-full font-semibold transition shadow-md"
                >
                  Book Now
                </button>
              </div>
            </div>
          )}

          {/* ================= TRAINS ================= */}
          {activeService === "trains" && (
            <div className="flex justify-between items-center">
              <div>
                <p className="font-bold text-lg text-black">
                  {item.trainName || "Express Train"}
                </p>
                <p className="text-sm text-gray-600">
                  {item.from} → {item.to}
                </p>
                <p className="text-sm text-gray-500">
                  Departure: {item.departureTime || "--"}
                </p>
              </div>

              <div className="text-right">
                <p className="text-xl font-bold text-[#0a821c]">
                  {formatPrice(item.price)}
                </p>
                <button
                  onClick={() => onBook(item)}
                  className="mt-2 bg-[#FFCC00] hover:bg-[#f2c200] text-black px-6 py-2 rounded-full font-semibold shadow-md"
                >
                  Book Now
                </button>
              </div>
            </div>
          )}

          {/* ================= BUSES ================= */}
          {activeService === "buses" && (
            <div className="flex justify-between items-center">
              <div>
                <p className="font-bold text-lg text-black">
                  {item.operator || "Premium Bus"}
                </p>
                <p className="text-sm text-gray-600">
                  {item.from} → {item.to}
                </p>
                <p className="text-sm text-gray-500">
                  Departure: {item.departureTime || "--"}
                </p>
              </div>

              <div className="text-right">
                <p className="text-xl font-bold text-[#0a821c]">
                  {formatPrice(item.price)}
                </p>
                <button
                  onClick={() => onBook(item)}
                  className="mt-2 bg-[#FFCC00] hover:bg-[#f2c200] text-black px-6 py-2 rounded-full font-semibold shadow-md"
                >
                  Book Now
                </button>
              </div>
            </div>
          )}

          {/* ================= HOTELS ================= */}
          {activeService === "hotels" && (
            <div className="flex justify-between items-center">
              <div>
                <p className="font-bold text-lg text-black">{item.hotelName}</p>
                <p className="text-sm text-gray-600">{item.city}</p>
                <p className="text-sm text-gray-500">
                  {item.checkIn} - {item.checkOut}
                </p>
              </div>

              <div className="text-right">
                <p className="text-xl font-bold text-[#0a821c]">
                  {formatPrice(item.price)} / night
                </p>
                <button
                  onClick={() => onBook(item)}
                  className="mt-2 bg-[#FFCC00] hover:bg-[#f2c200] text-black px-6 py-2 rounded-full font-semibold shadow-md"
                >
                  Book Now
                </button>
              </div>
            </div>
          )}

          {/* ================= CABS ================= */}
          {activeService === "cabs" && (
            <div className="flex justify-between items-center">
              <div>
                <p className="font-bold text-lg text-black">
                  {item.vehicleType || "Sedan"}
                </p>
                <p className="text-sm text-gray-600">
                  {item.from} → {item.to}
                </p>
              </div>

              <div className="text-right">
                <p className="text-xl font-bold text-[#0a821c]">
                  {formatPrice(item.price)}
                </p>
                <button
                  onClick={() => onBook(item)}
                  className="mt-2 bg-[#FFCC00] hover:bg-[#f2c200] text-black px-6 py-2 rounded-full font-semibold shadow-md"
                >
                  Book Now
                </button>
              </div>
            </div>
          )}

          {/* ================= CRUISES ================= */}
          {activeService === "cruises" && (
            <div className="flex justify-between items-center">
              <div>
                <p className="font-bold text-lg text-black">{item.cruiseName}</p>
                <p className="text-sm text-gray-600">
                  Departure: {item.departurePort}
                </p>
              </div>

              <div className="text-right">
                <p className="text-xl font-bold text-[#0a821c]">
                  {formatPrice(item.price)}
                </p>
                <button
                  onClick={() => onBook(item)}
                  className="mt-2 bg-[#FFCC00] hover:bg-[#f2c200] text-black px-6 py-2 rounded-full font-semibold shadow-md"
                >
                  Book Now
                </button>
              </div>
            </div>
          )}

          {/* ================= INSURANCE ================= */}
          {activeService === "insurance" && (
            <div className="flex justify-between items-center">
              <div>
                <p className="font-bold text-lg text-black">
                  {item.category || "Insurance Plan"}
                </p>
                <p className="text-sm text-gray-600">
                  Coverage: {item.coverage}
                </p>
              </div>

              <div className="text-right">
                <p className="text-xl font-bold text-[#0a821c]">
                  {formatPrice(item.price)}
                </p>
                <button
                  onClick={() => onBook(item)}
                  className="mt-2 bg-[#FFCC00] hover:bg-[#f2c200] text-black px-6 py-2 rounded-full font-semibold shadow-md"
                >
                  Get Policy
                </button>
              </div>
            </div>
          )}

        </div>
      ))}

    </div>
  );
}
