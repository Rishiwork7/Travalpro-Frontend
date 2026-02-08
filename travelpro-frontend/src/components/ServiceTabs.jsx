import { Plane, Hotel, Car, Ship, ShieldCheck, Bus, Package } from "lucide-react";

const SERVICES = [
  { id: "flights", name: "Flights", icon: Plane },
  { id: "hotels", name: "Hotels", icon: Hotel },
  { id: "cabs", name: "Car Rental", icon: Car },
  { id: "cruises", name: "Cruises", icon: Ship },
  { id: "insurance", name: "Insurance", icon: ShieldCheck },
  { id: "buses", name: "Bus", icon: Bus },
  { id: "packages", name: "Packages", icon: Package },
];

export default function ServiceTabs({ activeService, setActiveService }) {
  return (
    <div className="bg-white border border-gray-200 rounded-t-xl">
      <div className="px-4">
        <div className="flex overflow-x-auto">
          {SERVICES.map((service) => {
            const Icon = service.icon;

            return (
              <button
                key={service.id}
                onClick={() => setActiveService(service.id)}
                className={`flex items-center gap-2 px-5 py-3 border-b-2 transition whitespace-nowrap text-sm ${
                  activeService === service.id
                    ? "border-[#0f294d] text-white font-semibold bg-[#0f294d]"
                    : "border-transparent text-[#0f294d] hover:bg-gray-50"
                }`}
              >
                <Icon size={18} />
                <span className="font-semibold">{service.name}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
