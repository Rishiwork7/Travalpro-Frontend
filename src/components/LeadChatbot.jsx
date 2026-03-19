import React, { useState, useEffect, useRef } from "react";
import { Send, User, Bot, Sparkles, Phone, CheckCircle, ArrowRight, Loader2, X } from "lucide-react";
import API_BASE from "../config/api";

const STEPS = {
  INTRO: 0,
  ASK_NAME: 1,
  ASK_SERVICE: 2,
  ASK_DETAILS: 3,
  ASK_CONTACT: 4,
  SAVING: 5,
  SAVED: 6,
};

const SERVICES = [
  { id: "flights", label: "Flights", icon: "✈️" },
  { id: "hotels", label: "Hotels", icon: "🏨" },
  { id: "cabs", label: "Car Rentals", icon: "🚗" },
  { id: "packages", label: "Holidays", icon: "🏝️" },
];

export default function LeadChatbot({ onClose }) {
  const [step, setStep] = useState(STEPS.INTRO);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    service: "",
    details: "",
    contact: "",
  });
  
  const scrollRef = useRef(null);

  const scrollToBottom = () => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // Bot response helper with typing simulation
  const botReply = async (text, options = {}) => {
    setIsTyping(true);
    await new Promise((r) => setTimeout(r, 1200 + Math.random() * 800)); // Human-like delay
    setIsTyping(false);
    setMessages((prev) => [...prev, { role: "bot", text, ...options }]);
  };

  // Initial greeting
  useEffect(() => {
    const init = async () => {
      await botReply("Hi there! 👋 I'm your Travel Assistant.");
      await botReply("I can help you unlock secret discounted rates that aren't available online.");
      await botReply("To get started, may I know your name?");
      setStep(STEPS.ASK_NAME);
    };
    init();
  }, []);

  const handleSend = async () => {
    if (!inputValue.trim()) return;

    const userText = inputValue.trim();
    setMessages((prev) => [...prev, { role: "user", text: userText }]);
    setInputValue("");

    if (step === STEPS.ASK_NAME) {
      setFormData((prev) => ({ ...prev, name: userText }));
      await botReply(`Nice to meet you, ${userText}! 😊`);
      await botReply("Which service can I help you with today?", { showServices: true });
      setStep(STEPS.ASK_SERVICE);
    } 
    else if (step === STEPS.ASK_DETAILS) {
      setFormData((prev) => ({ ...prev, details: userText }));
      await botReply("Perfect. Lastly, please share your Email or Phone Number so our expert can send you the best quotes.");
      setStep(STEPS.ASK_CONTACT);
    }
    else if (step === STEPS.ASK_CONTACT) {
      setFormData((prev) => ({ ...prev, contact: userText }));
      saveLead({ ...formData, contact: userText });
    }
  };

  const handleServiceSelect = async (service) => {
    setMessages((prev) => [...prev, { role: "user", text: `I'm interested in ${service.label}.` }]);
    setFormData((prev) => ({ ...prev, service: service.id }));
    
    let detailAsk = "Great! Where are you planning to go?";
    if (service.id === "flights") detailAsk = "Excellent choice. Where are you flying from and to?";
    if (service.id === "hotels") detailAsk = "Nice! Which city are you looking to stay in?";
    
    await botReply(detailAsk);
    setStep(STEPS.ASK_DETAILS);
  };

  const saveLead = async (data) => {
    setStep(STEPS.SAVING);
    setIsTyping(true);
    
    try {
      const email = data.contact.includes("@") ? data.contact : `chat_${Date.now()}@temp.com`;
      let validPhone = data.contact.replace(/\D/g, "");
      if (validPhone.length < 10) validPhone = "0000000000";

      const res = await fetch(`${API_BASE}/api/leads`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.name,
          email: email,
          phone: validPhone,
          service: data.service,
          bookingDetails: {
            query: data.details,
            source: "chatbot"
          }
        }),
      });

      if (res.ok) {
        await botReply("Excellent! I've saved your request. ✅");
        await botReply("Our agents have special wholesale fares ready for you right now.", { showCall: true });
        setStep(STEPS.SAVED);
      } else {
        throw new Error("Failed to save");
      }
    } catch (err) {
      await botReply("Something went wrong, but don't worry! You can call us directly for the best rates.");
      setStep(STEPS.SAVED);
    }
    setIsTyping(false);
  };

  return (
    <div className="flex flex-col h-full bg-white relative">
      {/* Header */}
      <div className="bg-[#0f294d] p-5 text-white flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#FFCC00]/20 flex items-center justify-center border border-white/20 relative">
            <Bot size={22} className="text-[#FFCC00]" />
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-[#0f294d]"></span>
          </div>
          <div>
            <h3 className="font-bold text-base flex items-center gap-1.5">
              Travel Pro Assistant <Sparkles size={14} className="text-[#FFCC00]" />
            </h3>
            <p className="text-[10px] text-white/60 font-medium uppercase tracking-wider">Expert Support • 24/7</p>
          </div>
        </div>
        <button onClick={onClose} className="hover:bg-white/10 p-2 rounded-full transition-colors">
          <X size={20} />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-gray-50/50">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} animate-in fade-in slide-in-from-bottom-2`}>
            <div className={`max-w-[85%] rounded-2xl p-4 shadow-sm ${
              msg.role === "user" 
                ? "bg-[#0f294d] text-white rounded-tr-none" 
                : "bg-white text-[#0f294d] border border-gray-100 rounded-tl-none"
            }`}>
              <p className="text-sm leading-relaxed">{msg.text}</p>
              
              {/* Service Buttons */}
              {msg.showServices && (
                <div className="grid grid-cols-2 gap-2 mt-4">
                  {SERVICES.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => handleServiceSelect(s)}
                      className="px-3 py-2.5 bg-gray-50 hover:bg-[#FFCC00]/10 border border-gray-100 rounded-xl text-xs font-bold transition-all text-[#0f294d] flex items-center gap-2"
                    >
                      <span>{s.icon}</span> {s.label}
                    </button>
                  ))}
                </div>
              )}

              {/* Call Button */}
              {msg.showCall && (
                <div className="mt-5 space-y-3">
                  <a
                    href="tel:855-668-7787"
                    className="flex items-center justify-center gap-2 w-full bg-[#0a821c] text-white py-3 rounded-xl font-black text-lg shadow-[0_4px_15px_rgba(10,130,28,0.3)] hover:scale-[1.02] transition-transform"
                  >
                    <Phone size={20} fill="currentColor" /> Call Agent Now
                  </a>
                  <p className="text-[10px] text-center text-gray-400 font-bold uppercase tracking-wider">Talk to a human · Zero hold time</p>
                </div>
              )}
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-white border border-gray-100 rounded-2xl rounded-tl-none p-4 shadow-sm flex gap-1">
              <span className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce"></span>
              <span className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce [animation-delay:0.2s]"></span>
              <span className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce [animation-delay:0.4s]"></span>
            </div>
          </div>
        )}
        <div ref={scrollRef} />
      </div>

      {/* Input */}
      {step !== STEPS.SAVING && step !== STEPS.SAVED && step !== STEPS.ASK_SERVICE && (
        <div className="p-4 bg-white border-t border-gray-100 shadow-[0_-4px_15px_rgba(0,0,0,0.02)]">
          <div className="flex items-center gap-2 bg-gray-50 rounded-2xl px-4 py-2 border border-gray-100 focus-within:ring-2 focus-within:ring-[#0f294d]/10 transition-all">
            <input
              autoFocus
              className="flex-1 bg-transparent border-none focus:ring-0 text-sm py-2"
              placeholder="Type your message..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSend()}
            />
            <button
              onClick={handleSend}
              disabled={!inputValue.trim()}
              className="w-10 h-10 rounded-full bg-[#0f294d] text-white flex items-center justify-center disabled:opacity-30 transition-opacity"
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      )}

      {/* Saving Overlay */}
      {step === STEPS.SAVING && (
        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center z-10 p-10 text-center">
          <Loader2 className="w-12 h-12 text-[#0f294d] animate-spin mb-4" />
          <h3 className="font-bold text-xl text-[#0f294d]">Securing Your Rates</h3>
          <p className="text-sm text-gray-500 mt-2">Just a moment while we contact our travel specialists...</p>
        </div>
      )}
    </div>
  );
}
