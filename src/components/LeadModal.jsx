import { X, Mail, Phone } from "lucide-react";
import { useState } from "react";

export default function LeadModal({ isOpen, onClose, onContinue }) {
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (!email || !phone) return;

    console.log("====== LEAD CAPTURED ======");
    console.log("Email:", email);
    console.log("Phone:", phone);
    console.log("Timestamp:", new Date().toISOString());
    console.log("===========================");

    onContinue({ email, phone });
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white text-black rounded-2xl p-8 w-[90%] max-w-md shadow-2xl border border-gray-200">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-black">Enter Details to Continue</h2>
          <X className="cursor-pointer text-gray-600 hover:text-gray-900" onClick={onClose} />
        </div>

        <div className="space-y-4">
          <div className="relative">
            <Mail className="absolute left-3 top-3 text-gray-500" size={18} />
            <input
              type="email"
              placeholder="Email"
              className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:border-[#0f294d] focus:ring-2 focus:ring-[#0f294d]/20 outline-none"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="relative">
            <Phone className="absolute left-3 top-3 text-gray-500" size={18} />
            <input
              type="tel"
              placeholder="Phone Number"
              className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:border-[#0f294d] focus:ring-2 focus:ring-[#0f294d]/20 outline-none"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>

          <button
            onClick={handleSubmit}
            className="w-full bg-[#FFCC00] hover:bg-[#f2c200] text-black font-semibold py-3 rounded-lg transition shadow-md"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}
