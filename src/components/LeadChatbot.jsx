import React, { useState, useEffect, useRef } from "react";
import { Send, User, Bot, Sparkles, Phone, CheckCircle, ArrowRight, Loader2, X } from "lucide-react";
import API_BASE from "../config/api";

const STEPS = {
  INTRO: 0,
  ASK_NAME: 1,
  ASK_DOB: 2,
  ASK_SERVICE: 3,
  ASK_CONTACT: 4,
  READY_TO_SUBMIT: 5,
  SAVING: 6,
  SAVED: 7,
};

const SERVICES = [
  { id: "bus", label: "Bus", icon: "🚌" },
  { id: "flights", label: "Flight", icon: "✈️" },
  { id: "car-rental", label: "Car Rental", icon: "🚗" },
  { id: "cruise", label: "Cruise", icon: "🛳️" },
  { id: "insurance", label: "Insurance", icon: "🛡️" },
];

export default function LeadChatbot({ onClose }) {
  const [step, setStep] = useState(STEPS.INTRO);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    dob: "",
    service: "",
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
      await botReply("What is your Date of Birth?");
      setStep(STEPS.ASK_DOB);
    }
    else if (step === STEPS.ASK_DOB) {
      setFormData((prev) => ({ ...prev, dob: userText }));
      await botReply("Which service can I help you with today?", { showServices: true });
      setStep(STEPS.ASK_SERVICE);
    }
    // handleServiceSelect routes ASK_SERVICE to ASK_CONTACT
    else if (step === STEPS.ASK_CONTACT) {
      setFormData((prev) => ({ ...prev, contact: userText }));
      await botReply("Thank you! Please click the button below to submit your details.", { showSubmit: true });
      setStep(STEPS.READY_TO_SUBMIT);
    }
  };

  const handleServiceSelect = async (service) => {
    setMessages((prev) => [...prev, { role: "user", text: `I'm interested in ${service.label}.` }]);
    setFormData((prev) => ({ ...prev, service: service.id }));
    await botReply("Please share your Email or Mobile Number.");
    setStep(STEPS.ASK_CONTACT);
  };

  const saveLead = async () => {
    setStep(STEPS.SAVING);
    setIsTyping(true);

    try {
      let email = undefined;
      let phone = undefined;
      const contactVal = formData.contact.trim();
      if (contactVal.includes('@')) {
        email = contactVal.split(' ').find(part => part.includes('@')) || contactVal;
        const phoneMatch = contactVal.replace(email, '').match(/\d{7,}/);
        if (phoneMatch) phone = phoneMatch[0];
      } else {
        phone = contactVal;
      }

      const res = await fetch(`${API_BASE}/api/leads`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          ...(email && { email }),
          ...(phone && { phone }),
          service: formData.service,
          source: "chatbot",
          bookingDetails: {
            query: `DOB: ${formData.dob}`,
            source: "chatbot"
          }
        }),
      });

      if (res.ok) {
        await botReply("Excellent! I've saved your request. ✅");
        await botReply("Our travel experts will contact you shortly with the best hand-picked options.", { showCall: true });
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
              Traval Pro Assistant <Sparkles size={14} className="text-[#FFCC00]" />
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
            <div className={`max-w-[85%] rounded-2xl p-4 shadow-sm ${msg.role === "user"
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

              {/* Submit Button */}
              {msg.showSubmit && step === STEPS.READY_TO_SUBMIT && (
                <div className="mt-4">
                  <button
                    onClick={saveLead}
                    className="w-full bg-[#d13b1a] text-white py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-[#b93216] transition shadow-md"
                  >
                    Submit Details <CheckCircle size={16} />
                  </button>
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
      {step !== STEPS.SAVING && step !== STEPS.SAVED && step !== STEPS.READY_TO_SUBMIT && step !== STEPS.ASK_SERVICE && (
        <div className="p-4 bg-white border-t border-gray-100 shadow-[0_-4px_15px_rgba(0,0,0,0.02)]">
          <div className="flex items-center gap-2 bg-gray-50 rounded-2xl px-4 py-2 border border-gray-100 focus-within:ring-2 focus-within:ring-[#0f294d]/10 transition-all">
            <input
              autoFocus
              type={step === STEPS.ASK_DOB ? "date" : "text"}
              className="flex-1 bg-transparent border-none focus:ring-0 text-sm py-2 px-2"
              placeholder={
                step === STEPS.ASK_NAME ? "Enter your name..." :
                  step === STEPS.ASK_DOB ? "Select your Date of Birth..." :
                    step === STEPS.ASK_CONTACT ? "Enter mobile or email..." :
                      "Type your message..."
              }
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
    </div>
  );
}
