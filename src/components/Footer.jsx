import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="bg-[#0f294d] text-white py-12 px-6 border-t border-[#0f294d]">
      <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-10">
        <div>
          <h2 className="text-2xl font-bold">
            Travel<span className="text-[#FFCC00]">Pro</span>
          </h2>
          <p className="text-white/70 mt-3 text-sm">
            Enterprise-grade travel booking for flights, hotels, and premium packages.
          </p>
        </div>

        <div>
          <h3 className="font-semibold mb-3">Support</h3>
          <ul className="space-y-2 text-sm text-white/80">
            <li className="hover:text-[#FFCC00] transition">
              <Link to="/contact">Contact Us</Link>
            </li>
            <li className="hover:text-[#FFCC00] transition">
              <Link to="/about">About Us</Link>
            </li>
            <li className="hover:text-[#FFCC00] transition">
              <Link to="/privacy">Privacy Policy</Link>
            </li>
            <li className="hover:text-[#FFCC00] transition">
              <Link to="/terms">Terms of Service</Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="font-semibold mb-3">Services</h3>
          <ul className="space-y-2 text-sm text-white/80">
            <li className="hover:text-[#FFCC00] transition">Flights</li>
            <li className="hover:text-[#FFCC00] transition">Hotels</li>
            <li className="hover:text-[#FFCC00] transition">Car Rental</li>
            <li className="hover:text-[#FFCC00] transition">Packages</li>
          </ul>
        </div>

        <div>
          <h3 className="font-semibold mb-3">Legal</h3>
          <ul className="space-y-2 text-sm text-white/80">
            <li className="hover:text-[#FFCC00] transition">
              <Link to="/privacy">Privacy Policy</Link>
            </li>
            <li className="hover:text-[#FFCC00] transition">
              <Link to="/terms">Terms of Service</Link>
            </li>
            <li className="hover:text-[#FFCC00] transition">Cookie Policy</li>
            <li className="hover:text-[#FFCC00] transition">Security</li>
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto border-t border-white/20 mt-10 pt-6 flex flex-col md:flex-row items-center justify-between text-sm text-white/70 gap-4">
        <div>© {new Date().getFullYear()} TravelPro. All rights reserved.</div>
        <div className="flex items-center gap-3 text-white/70">
          <span className="px-3 py-1 border border-white/30 rounded">VISA</span>
          <span className="px-3 py-1 border border-white/30 rounded">Mastercard</span>
          <span className="px-3 py-1 border border-white/30 rounded">AMEX</span>
          <span className="px-3 py-1 border border-white/30 rounded">UPI</span>
        </div>
      </div>
    </footer>
  );
}
