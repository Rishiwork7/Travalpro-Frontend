import React, { useState } from "react";
import { MessageCircle, X, Sparkles } from "lucide-react";
import LeadChatbot from "./LeadChatbot";

export default function HelpAssistant() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end gap-4">
      {/* Bot Chat Window */}
      {isOpen && (
        <div className="fixed inset-0 w-full h-[100dvh] max-h-none z-[10000] rounded-none md:absolute md:inset-auto md:bottom-20 md:right-0 md:w-[400px] md:h-[600px] md:max-h-[80vh] md:rounded-3xl bg-white md:shadow-[0_20px_60px_rgba(15,41,77,0.3)] md:border md:border-gray-100 overflow-hidden flex flex-col animate-in fade-in slide-in-from-bottom-5 duration-300">
          <LeadChatbot onClose={() => setIsOpen(false)} />
        </div>
      )}

      {/* Trigger Button (Circle) */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-16 h-16 rounded-full bg-[#0f294d] text-white items-center justify-center shadow-2xl hover:scale-110 transition-transform duration-200 group relative ${isOpen ? 'hidden md:flex' : 'flex'}`}
      >
        {isOpen ? (
          <X size={28} />
        ) : (
          <>
            <MessageCircle size={30} fill="currentColor" className="opacity-90" />
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full border-4 border-white animate-pulse"></span>
            
            {/* Tooltip-like Badge */}
            <div className="absolute right-20 bg-white text-[#0f294d] px-4 py-2 rounded-2xl shadow-xl w-max opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none flex items-center gap-2 border border-gray-100 font-bold text-sm">
              <Sparkles size={14} className="text-[#FFCC00]" />
              How can I help you save?
            </div>
          </>
        )}
      </button>
    </div>
  );
}
