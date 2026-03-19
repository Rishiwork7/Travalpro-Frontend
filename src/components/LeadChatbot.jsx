import { useState, useEffect, useRef } from "react";
import { Phone, X, Send, User, Mail, Calendar, Plane, Hotel, Gift, CheckCircle } from "lucide-react";
import API_BASE from "../config/api";

const SUPPORT_PHONE = "(800) 518-0250";

export default function LeadChatbot({ onClose }) {
  const [messages, setMessages] = useState([
    { role: "bot", text: "Hi! I'm your TravalPro Assistant. What's your name?" },
  ]);
  const [input, setInput] = useState("");
  const [step, setStep] = useState(1);
  const [leadData, setLeadData] = useState({
    name: "",
    email: "",
    dob: "",
    service: "",
    details: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDone, setIsDone] = useState(false);
  
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const addBotMessage = (text) => {
    setMessages((prev) => [...prev, { role: "bot", text }]);
  };

  const addUserMessage = (text) => {
    setMessages((prev) => [...prev, { role: "user", text }]);
  };

  const handleSend = async (val) => {
    const text = val || input;
    if (!text && !val) return;

    addUserMessage(text);
    setInput("");

    // Identify field for validation
    let field = "";
    if (step === 1) field = "name";
    else if (step === 2) field = "email";
    else if (step === 3) field = "DOB";
    else if (step === 5) field = "service details";

    if (field) {
      setIsSubmitting(true);
      try {
        const res = await fetch(`${API_BASE}/api/chat/validate`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ field, value: text }),
        });
        const data = await res.json();

        if (data.valid) {
          const cleanedText = data.formattedValue || text;
          processValidatedStep(cleanedText);
        } else {
          addBotMessage(data.suggestion || `That doesn't look like a valid ${field}. Please try again.`);
        }
      } catch (err) {
        // Fallback if AI fail
        processValidatedStep(text);
      }
      setIsSubmitting(false);
    } else {
      processValidatedStep(text);
    }
  };

  const processValidatedStep = (text) => {
    if (step === 1) {
      setLeadData((prev) => ({ ...prev, name: text }));
      addBotMessage(`Nice to meet you, ${text}! What's your email address?`);
      setStep(2);
    } else if (step === 2) {
      setLeadData((prev) => ({ ...prev, email: text }));
      addBotMessage("Got it. And when is your birthday? (DD/MM/YYYY)");
      setStep(3);
    } else if (step === 3) {
      setLeadData((prev) => ({ ...prev, dob: text }));
      addBotMessage("Perfect. Which service are you interested in?");
      setStep(4);
    } else if (step === 5) {
      setLeadData((prev) => ({ ...prev, details: text }));
      submitLead({ ...leadData, details: text });
    }
  };

  const handleServiceSelect = (service) => {
    addUserMessage(service);
    setLeadData((prev) => ({ ...prev, service }));
    
    if (service === "Flights") {
      addBotMessage("Where are you flying to, and when?");
    } else if (service === "Hotels") {
      addBotMessage("Which city and how many nights?");
    } else {
      addBotMessage("Tell us more about your travel plans!");
    }
    setStep(5);
  };

  const submitLead = async (finalData) => {
    setIsSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/api/leads`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: finalData.name,
          email: finalData.email,
          dob: finalData.dob,
          service: finalData.service,
          bookingDetails: { query: finalData.details },
          status: "new",
        }),
      });

      if (res.ok) {
        addBotMessage("Thank you! Your request has been saved.");
        setIsDone(true);
      } else {
        addBotMessage("Something went wrong, but don't worry. You can call us directly!");
      }
    } catch (err) {
      addBotMessage("Connection error. Please call our support line.");
    }
    setIsSubmitting(false);
  };

  return (
    <div className="fixed bottom-10 right-10 z-50 w-96 bg-white border border-gray-200 rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-fadeIn h-[550px]">
      {/* Header */}
      <div className="bg-[#0f294d] p-5 flex justify-between items-center text-white">
        <div className="flex items-center gap-3">
          <div className="bg-[#FFDD00] p-2 rounded-full text-[#0f294d]">
            <CheckCircle size={20} />
          </div>
          <div>
            <h3 className="font-bold text-sm">TravalPro Assistant</h3>
            <p className="text-[10px] opacity-70">Online now</p>
          </div>
        </div>
        <button onClick={onClose} className="hover:bg-white/10 p-2 rounded-full transition">
          <X size={20} />
        </button>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-5 space-y-4 bg-gray-50">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[80%] p-3 rounded-2xl text-sm ${
                msg.role === "user"
                  ? "bg-[#1d4ed8] text-white rounded-br-none"
                  : "bg-white text-gray-800 shadow-sm border border-gray-100 rounded-bl-none"
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}

        {step === 4 && !isDone && (
          <div className="grid grid-cols-2 gap-2 mt-4">
            {["Flights", "Hotels", "Packages", "Other"].map((s) => (
              <button
                key={s}
                onClick={() => handleServiceSelect(s)}
                className="bg-white border border-blue-200 text-blue-700 hover:bg-blue-50 py-2 px-3 rounded-xl text-sm font-semibold transition flex items-center justify-center gap-2"
              >
                {s === "Flights" && <Plane size={14} />}
                {s === "Hotels" && <Hotel size={14} />}
                {s === "Packages" && <Gift size={14} />}
                {s}
              </button>
            ))}
          </div>
        )}

        {isDone && (
          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-2xl text-center">
            <p className="text-green-800 font-bold text-sm mb-3">Our agents are notified!</p>
            <a
              href={`tel:+1${SUPPORT_PHONE.replace(/\D/g, "")}`}
              className="flex items-center justify-center gap-2 bg-[#1d4ed8] text-white py-3 rounded-xl font-bold hover:scale-105 transition shadow-lg w-full"
            >
              <Phone size={18} fill="white" />
              Call {SUPPORT_PHONE}
            </a>
          </div>
        )}
      </div>

      {/* Input */}
      {!isDone && (
        <div className="p-4 border-t border-gray-100 bg-white shadow-inner">
          <div className="relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder={step === 4 ? "Select a service above..." : "Type your message..."}
              disabled={step === 4 || isSubmitting}
              className="w-full pl-4 pr-12 py-3 bg-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1d4ed8] transition"
            />
            <button
              onClick={() => handleSend()}
              disabled={step === 4 || isSubmitting || !input.trim()}
              className="absolute right-2 top-1.5 p-2 bg-[#1d4ed8] text-white rounded-lg hover:bg-[#1e40af] disabled:bg-gray-300 transition"
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
