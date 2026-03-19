import { useState, useEffect } from "react";
import { Bot, Sparkles, MessageSquare } from "lucide-react";
import LeadChatbot from "./LeadChatbot";

export default function HelpAssistant() {
  const [visible, setVisible] = useState(false);
  const [showChat, setShowChat] = useState(false);

  // Show after slight delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(true);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  if (!visible) return null;

  if (showChat) {
    return <LeadChatbot onClose={() => setShowChat(false)} />;
  }

  return (
    <>
      {/* Animated Circular Trigger */}
      <button
        onClick={() => setShowChat(true)}
        className="fixed bottom-10 right-10 z-50 flex items-center justify-center w-16 h-16 bg-[#0f294d] text-[#FFDD00] rounded-full shadow-[0_8px_32px_rgba(15,41,77,0.3)] hover:scale-110 transition-all duration-300 border-2 border-[#FFDD00]/20 group active:scale-95 animate-fadeIn"
        aria-label="Chat with Travel Assistant"
      >
        <div className="absolute inset-0 rounded-full bg-[#FFDD00]/20 animate-ping opacity-75 group-hover:hidden"></div>
        
        {/* Main Bot Icon */}
        <div className="relative">
          <Bot className="w-8 h-8" strokeWidth={2.5} />
          {/* Small Sparkle Aura */}
          <Sparkles className="absolute -top-1 -right-1 w-4 h-4 text-white animate-pulse" />
        </div>
        
        {/* Tooltip */}
        <div className="absolute right-20 bg-[#0f294d] text-white text-[10px] font-bold px-3 py-2 rounded-xl whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0 duration-300 shadow-xl border border-white/10 uppercase tracking-tighter pointer-events-none">
          Start Inquiry Bot
        </div>
      </button>

      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; transform: scale(0.8); }
            to { opacity: 1; transform: scale(1); }
          }
          .animate-fadeIn { animation: fadeIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
        `}
      </style>
    </>
  );
}
