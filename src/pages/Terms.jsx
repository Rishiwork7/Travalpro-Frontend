import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function Terms() {
  return (
    <div className="min-h-screen bg-white text-gray-900">
      <Navbar />

      <section className="bg-[#f2f7fd]">
        <div className="max-w-5xl mx-auto px-6 py-14">
          <h1 className="text-3xl md:text-4xl font-bold text-[#0f294d]">
            Terms of Service
          </h1>
          <p className="mt-4 text-gray-700">
            These terms govern your use of TravelPro services and bookings.
          </p>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-6 py-12 space-y-6">
        <div>
          <h2 className="text-xl font-semibold text-[#0f294d]">
            Bookings and Payments
          </h2>
          <p className="mt-2 text-gray-700">
            Prices and availability may change. Confirm all details before
            payment.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-[#0f294d]">
            Cancellations and Refunds
          </h2>
          <p className="mt-2 text-gray-700">
            Refunds depend on supplier policies. We will assist you with
            changes and cancellations.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-[#0f294d]">
            Liability
          </h2>
          <p className="mt-2 text-gray-700">
            TravelPro acts as an intermediary and is not liable for supplier
            performance.
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
}
