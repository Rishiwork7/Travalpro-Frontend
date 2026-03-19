import { Zap } from "lucide-react";

const deals = [
  { from: "NYC", to: "London", original: 598, current: 340, time: "52m left" },
  { from: "CHI", to: "Dubai", original: 1120, current: 687, time: "25m left" },
  { from: "SFO", to: "Singapore", original: 1302, current: 759, time: "19m left" },
  { from: "MIA", to: "Paris", original: 824, current: 460, time: "10m left" },
  { from: "LAX", to: "Tokyo", original: 1183, current: 672, time: "44m left" },
  { from: "BOS", to: "Rome", original: 645, current: 392, time: "42m left" },
];

export default function ScrollingTicker() {
  return (
    <div className="bg-[#0f294d] overflow-hidden whitespace-nowrap py-2 border-b border-white/10 relative">
      <div className="flex items-center animate-ticker">
        {/* We repeat the deals to create a seamless loop */}
        {[...deals, ...deals].map((deal, idx) => (
          <div
            key={idx}
            className="inline-flex items-center gap-4 px-8 border-r border-white/10 last:border-r-0"
          >
            <div className="flex items-center gap-2">
              {idx % deals.length === 0 && (
                <div className="bg-[#dc2626] text-white text-[10px] font-black px-2 py-0.5 rounded flex items-center gap-1 uppercase tracking-tighter mr-2">
                  <Zap size={10} fill="white" /> LIVE DEALS
                </div>
              )}
              <span className="text-white text-sm font-bold opacity-90">
                {deal.from} to {deal.to}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-white/40 text-[10px] line-through decoration-red-500">
                ${deal.original}
              </span>
              <span className="text-[#FFCC00] text-sm font-black">
                ${deal.current}
              </span>
            </div>
            <div className="bg-blue-900/40 border border-blue-400/20 text-blue-200 text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1">
              <span className="opacity-70">🕒</span> {deal.time}
            </div>
          </div>
        ))}
      </div>

      <style>{`
        @keyframes ticker {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-ticker {
          display: inline-flex;
          animation: ticker 30s linear infinite;
          width: max-content;
        }
        .animate-ticker:hover {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  );
}
