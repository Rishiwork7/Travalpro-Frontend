import ScrollingTicker from "./ScrollingTicker";
import Navbar from "./Navbar";
import Footer from "./Footer";
import HelpAssistant from "./HelpAssistant";

export default function Layout({ children }) {
  return (
    <div className="min-h-screen bg-white text-gray-900 flex flex-col">
      <ScrollingTicker />
      <Navbar />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
      <HelpAssistant />
    </div>
  );
}
