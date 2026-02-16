import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function Contact() {
  return (
    <div className="min-h-screen bg-white text-gray-900">
      <Navbar />

      <section className="bg-[#f2f7fd]">
        <div className="max-w-5xl mx-auto px-6 py-14">
          <h1 className="text-3xl md:text-4xl font-bold text-[#0f294d]">
            Contact Us
          </h1>
          <p className="mt-4 text-gray-700">
            Need help with a booking or have a question? We are here 24/7.
          </p>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-6 py-12 grid md:grid-cols-2 gap-8">
        <div className="glass-card rounded-xl p-6">
          <h2 className="text-xl font-semibold text-[#0f294d]">Call</h2>
          <p className="mt-2 text-gray-700">24/7 Support</p>
          <p className="mt-2 text-[#0f294d] font-bold">1-888-555-0188</p>
        </div>

        <div className="glass-card rounded-xl p-6">
          <h2 className="text-xl font-semibold text-[#0f294d]">Email</h2>
          <p className="mt-2 text-gray-700">support@travelpro.com</p>
          <p className="mt-2 text-gray-600 text-sm">
            We respond within 24 hours.
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
}
