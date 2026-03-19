import { useState } from "react";
import { Headset, Tag, Clock, ShieldCheck, UserCheck, Phone } from "lucide-react";

export default function CallDropdown() {
  const [open, setOpen] = useState(false);

  const items = [
    {
      icon: Tag,
      title: "Unlock Phone-Only Deals",
      desc: "Get up to 40% off secret fares.",
      iconClass: "text-[#FFCC00]",
    },
    {
      icon: Clock,
      title: "24/7 Priority Support",
      desc: "Zero wait time. Call anytime.",
      iconClass: "text-[#0f294d]",
    },
    {
      icon: ShieldCheck,
      title: "Risk-Free Bookings",
      desc: "Easy cancellations & refunds.",
      iconClass: "text-[#0f294d]",
    },
    {
      icon: UserCheck,
      title: "Personalized Assistance",
      desc: "Speak to a real human, not a bot.",
      iconClass: "text-[#0f294d]",
    },
  ];

  return (
    <div
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        className="flex items-center gap-3 text-[#0f294d] hover:text-[#FFCC00] transition"
        onClick={() => setOpen((v) => !v)}
      >
        <span className="relative flex items-center justify-center w-9 h-9 rounded-full bg-[#FFCC00]/20">
          <Headset className="text-[#0f294d]" size={18} />
          <span className="absolute inline-flex h-full w-full rounded-full bg-[#FFCC00]/30 animate-ping"></span>
        </span>
        <span className="text-left">
          <span className="block font-semibold leading-tight">24/7 Support</span>
          <span className="block text-xs text-gray-500">Call & Save</span>
        </span>
      </button>

      {open && (
        <div className="absolute right-0 mt-3 w-80 bg-white shadow-2xl rounded-xl border border-gray-200 overflow-hidden z-50">
          <div className="bg-[#0f294d] px-4 py-3 text-white text-sm font-semibold">
            Need Help? Talk to an Expert.
          </div>
          <div className="p-4 space-y-3">
            {items.map((item, index) => {
              const Icon = item.icon;
              return (
                <div key={index} className="flex gap-3">
                  <div className="w-9 h-9 rounded-full bg-[#FFCC00]/15 flex items-center justify-center">
                    <Icon size={18} className={item.iconClass} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#0f294d]">{item.title}</p>
                    <p className="text-xs text-gray-500">{item.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="px-4 pb-4">
            <a
              href="tel:000-800-050-3540"
              className="w-full bg-[#0a821c] text-white font-bold text-center py-3 rounded-lg flex items-center justify-center gap-2 hover:bg-[#0a6f18] transition"
            >
              <Phone size={18} />
              000-800-050-3540
            </a>
            <p className="text-xs text-gray-500 text-center mt-2">
              Call now to lock these rates!
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
