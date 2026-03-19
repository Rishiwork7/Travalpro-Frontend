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
          className="bg-white border border-gray-200 text-gray-900 overflow-hidden rounded-2xl shadow-md hover:shadow-xl transition"
        >
          <div className="flex flex-col md:flex-row min-h-[160px]">
            {/* Image Section */}
            {(item.image || activeService === "hotels" || activeService === "flights") && (
              <div className="w-full md:w-64 h-48 md:h-auto flex-shrink-0">
                <img
                  src={item.image || "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=600"}
                  alt={item.title || item.hotelName || "Deal"}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=600";
                  }}
                />
              </div>
            )}

            {/* Content Section */}
            <div className="flex-1 p-6 flex flex-col justify-between">
              
              {/* Service Specific Info */}
              <div>
                {activeService === "flights" && (
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
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
                        <p className="font-bold text-black">{formatTime(item.departureTime)}</p>
                        <p className="text-xs text-gray-600">{item.from}</p>
                      </div>
                      <div className="text-center hidden sm:block">
                        <p className="text-xs text-gray-600">{formatDuration(item.duration)}</p>
                        <div className="w-16 h-px bg-gray-300 my-1"></div>
                        <p className="text-xs text-gray-600">Non-stop</p>
                      </div>
                      <div className="text-center">
                        <p className="font-bold text-black">{formatTime(item.arrivalTime)}</p>
                        <p className="text-xs text-gray-600">{item.to}</p>
                      </div>
                    </div>
                  </div>
                )}

                {activeService === "hotels" && (
                  <div>
                    <p className="font-bold text-xl text-black">{item.hotelName}</p>
                    <p className="text-sm text-gray-600 mt-1">{item.city}</p>
                    <p className="text-sm text-gray-500 mt-2">
                       Check-in: {item.checkIn} | Check-out: {item.checkOut}
                    </p>
                  </div>
                )}

                {(activeService === "trains" || activeService === "buses") && (
                  <div>
                    <p className="font-bold text-lg text-black">{item.trainName || item.operator || "Express Service"}</p>
                    <p className="text-sm text-gray-600">{item.from} → {item.to}</p>
                    <p className="text-sm text-gray-500 mt-1">Departure: {item.departureTime || "--"}</p>
                  </div>
                )}

                {activeService === "cabs" && (
                  <div>
                    <p className="font-bold text-lg text-black">{item.vehicleType || "Sedan"}</p>
                    <p className="text-sm text-gray-600">{item.from} → {item.to}</p>
                  </div>
                )}

                {activeService === "cruises" && (
                  <div>
                    <p className="font-bold text-lg text-black">{item.cruiseName}</p>
                    <p className="text-sm text-gray-600 font-medium">Departure Port: {item.departurePort}</p>
                  </div>
                )}

                {activeService === "insurance" && (
                  <div>
                    <p className="font-bold text-lg text-black">{item.category || "Insurance Plan"}</p>
                    <p className="text-sm text-gray-600">Coverage: {item.coverage}</p>
                  </div>
                )}
              </div>

              {/* Price and Action */}
              <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100">
                <div>
                  <p className="text-2xl font-bold text-[#0a821c]">
                    {formatPrice(item.price)}
                    {activeService === "hotels" && <span className="text-xs text-gray-500 ml-1">/ night</span>}
                  </p>
                  <p className="text-[10px] text-gray-400">Taxes & Fees included</p>
                </div>
                <button
                  onClick={() => onBook(item)}
                  className="bg-[#FFCC00] hover:bg-[#f2c200] text-black px-8 py-2.5 rounded-full font-bold transition shadow-md hover:scale-105"
                >
                  Book Now
                </button>
              </div>

            </div>
          </div>
        </div>
      ))}

    </div>
  );
}
