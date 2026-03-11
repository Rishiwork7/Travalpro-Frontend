import React from "react";
import {
  Plane,
  Hotel,
  Car,
  Ship,
  Shield,
  Bus,
  Package,
  Clock,
  MapPin,
  Star,
  Wifi,
  ArrowRight,
  CheckCircle,
} from "lucide-react";

import { useSettings } from "../../context/SettingsContext";

const ServiceCard = ({ type, data, onBook }) => {
  const { formatPrice } = useSettings();
  // 1. CONFIGURATION: Colors & Icons per Service
  const getConfig = () => {
    switch (type) {
      case "flights":
        return {
          icon: <Plane className="w-4 h-4" />,
          color: "text-blue-600",
          bg: "bg-blue-50",
          label: "Flight",
          btn: "bg-blue-600",
        };
      case "hotels":
        return {
          icon: <Hotel className="w-4 h-4" />,
          color: "text-rose-600",
          bg: "bg-rose-50",
          label: "Hotel",
          btn: "bg-rose-600",
        };
      case "car_rental":
        return {
          icon: <Car className="w-4 h-4" />,
          color: "text-orange-600",
          bg: "bg-orange-50",
          label: "Car Rental",
          btn: "bg-orange-600",
        };
      case "cruises":
        return {
          icon: <Ship className="w-4 h-4" />,
          color: "text-cyan-600",
          bg: "bg-cyan-50",
          label: "Cruise",
          btn: "bg-cyan-600",
        };
      case "bus":
        return {
          icon: <Bus className="w-4 h-4" />,
          color: "text-green-600",
          bg: "bg-green-50",
          label: "Bus",
          btn: "bg-green-600",
        };
      case "packages":
        return {
          icon: <Package className="w-4 h-4" />,
          color: "text-purple-600",
          bg: "bg-purple-50",
          label: "Holiday",
          btn: "bg-purple-600",
        };
      case "insurance":
        return {
          icon: <Shield className="w-4 h-4" />,
          color: "text-indigo-600",
          bg: "bg-indigo-50",
          label: "Insurance",
          btn: "bg-indigo-600",
        };
      default:
        return {
          icon: <Star className="w-4 h-4" />,
          color: "text-gray-600",
          bg: "bg-gray-50",
          label: "Service",
          btn: "bg-gray-800",
        };
    }
  };

  const config = getConfig();
  const isTransport = ["flights", "bus", "train", "aircraft"].includes(type);

  // --- LAYOUT A: TRANSPORT STRIP (Flights, Bus) ---
  if (isTransport) {
    return (
      <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300 flex flex-col md:flex-row items-center justify-between gap-6 group">
        {/* Left: Operator Info */}
        <div className="flex items-center gap-4 w-full md:w-1/4">
          <div className="w-16 h-16 bg-white border border-gray-100 rounded-lg p-2 flex items-center justify-center shadow-sm">
            <img
              src={data.image || data.logo}
              alt={data.operatorName}
              className="object-contain w-full h-full"
              onError={(e) => (e.target.style.display = "none")}
            />
          </div>
          <div>
            <h3 className="font-bold text-[#0f294d] text-lg leading-tight">
              {data.operatorName}
            </h3>
            <span
              className={`text-xs font-bold px-2 py-0.5 rounded ${config.bg} ${config.color} flex items-center gap-1 w-fit mt-1`}
            >
              {config.icon} {config.label}
            </span>
          </div>
        </div>

        {/* Middle: Timeline/Route */}
        <div className="flex-1 w-full flex justify-center items-center gap-6 text-center">
          <div className="text-left">
            <p className="text-xl font-bold text-[#0f294d]">
              {data.departureTime?.split("T")[1]?.slice(0, 5) || "10:00"}
            </p>
            <p className="text-xs font-bold text-gray-400">
              {data.fromCode || "DEL"}
            </p>
          </div>

          <div className="flex flex-col items-center w-32">
            <p className="text-xs text-gray-400 mb-1">
              {data.duration || "2h 30m"}
            </p>
            <div className="w-full h-[2px] bg-gray-200 relative flex items-center justify-between">
              <div className="w-2 h-2 rounded-full bg-gray-300"></div>
              <Plane
                className={`w-4 h-4 text-gray-300 ${type === "bus" ? "" : "rotate-90"
                  }`}
              />
              <div className="w-2 h-2 rounded-full bg-gray-300"></div>
            </div>
            <p className="text-xs text-green-600 mt-1 font-medium">
              {data.stops === 0 ? "Non-stop" : `${data.stops} Stop`}
            </p>
          </div>

          <div className="text-right">
            <p className="text-xl font-bold text-[#0f294d]">
              {data.arrivalTime?.split("T")[1]?.slice(0, 5) || "12:30"}
            </p>
            <p className="text-xs font-bold text-gray-400">
              {data.toCode || "DXB"}
            </p>
          </div>
        </div>

        {/* Right: Price & CTA */}
        <div className="w-full md:w-1/4 text-right border-l border-gray-100 pl-6 border-dashed flex flex-col justify-center">
          <p className="text-xs text-gray-400">Total Fare</p>
          <h3 className="text-2xl font-bold text-[#0f294d] mb-3">
            {formatPrice(data.price)}
          </h3>
          <button
            onClick={() => onBook(data)}
            className="w-full bg-[#0a821c] hover:bg-[#086a16] text-white font-bold py-2.5 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 shadow-sm hover:shadow-md"
          >
            Book Now <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  // --- LAYOUT B: VISUAL CARD (Hotels, Cars, Packages) ---
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col md:flex-row h-auto md:h-56 group">
      {/* Image Section */}
      <div className="w-full md:w-72 h-48 md:h-full relative overflow-hidden bg-gray-100">
        <img
          src={data.image}
          alt={data.title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
          onError={(e) =>
            (e.target.src = "https://placehold.co/600x400?text=No+Image")
          }
        />
        <div
          className={`absolute top-3 left-3 ${config.bg} ${config.color} px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-sm backdrop-blur-sm bg-opacity-90`}
        >
          {config.icon} {config.label}
        </div>
      </div>

      {/* Content Section */}
      <div className="flex-1 p-5 flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-xl font-bold text-[#0f294d] mb-1 group-hover:text-blue-600 transition-colors line-clamp-1">
                {data.title || data.operatorName || data.name}
              </h3>
              <p className="text-sm text-gray-500 flex items-center gap-1">
                <MapPin className="w-3 h-3" />{" "}
                {data.subtitle || data.address || "City Center"}
              </p>
            </div>
            {data.rating && (
              <div className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs font-bold flex items-center gap-1 whitespace-nowrap">
                <Star className="w-3 h-3 fill-current" /> {data.rating}
              </div>
            )}
          </div>

          {/* Features Tags */}
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="text-xs bg-gray-50 text-gray-600 px-2 py-1 rounded border border-gray-100 flex items-center gap-1">
              {type === "hotels" ? (
                <Wifi className="w-3 h-3" />
              ) : (
                <Clock className="w-3 h-3" />
              )}
              {data.details || "Instant Confirmation"}
            </span>
            {type === "car_rental" && (
              <span className="text-xs bg-gray-50 text-gray-600 px-2 py-1 rounded border border-gray-100">
                Unlimited Mileage
              </span>
            )}
            <span className="text-xs bg-green-50 text-green-700 px-2 py-1 rounded border border-green-100 flex items-center gap-1">
              <CheckCircle className="w-3 h-3" /> Free Cancellation
            </span>
          </div>
        </div>

        {/* Footer: Price & Button */}
        <div className="flex justify-between items-end mt-4 pt-4 border-t border-gray-50">
          <div>
            <p className="text-xs text-gray-400">
              {type === "hotels" ? "Per Night" : "Total Price"}
            </p>
            <p className="text-2xl font-bold text-[#0f294d]">
              {formatPrice(data.price)}
            </p>
          </div>
          <button
            onClick={() => onBook(data)}
            className="bg-white border-2 border-[#0a821c] text-[#0a821c] hover:bg-[#0a821c] hover:text-white font-bold py-2 px-6 rounded-lg transition-all shadow-sm hover:shadow-md"
          >
            {type === "insurance" ? "Get Quote" : "View Deal"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ServiceCard;
