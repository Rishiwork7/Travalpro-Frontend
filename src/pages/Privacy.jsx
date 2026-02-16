import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function Privacy() {
  return (
    <div className="min-h-screen bg-white text-gray-900">
      <Navbar />

      <section className="bg-[#f2f7fd]">
        <div className="max-w-5xl mx-auto px-6 py-14">
          <h1 className="text-3xl md:text-4xl font-bold text-[#0f294d]">
            Privacy Policy
          </h1>
          <p className="mt-4 text-gray-700">
            This policy explains how we collect, use, and protect your personal
            data.
          </p>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-6 py-12 space-y-6">
        <div>
          <h2 className="text-xl font-semibold text-[#0f294d]">
            Information We Collect
          </h2>
          <p className="mt-2 text-gray-700">
            We collect information you provide during bookings, support requests,
            and account interactions.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-[#0f294d]">
            How We Use Information
          </h2>
          <p className="mt-2 text-gray-700">
            We use data to process bookings, improve services, and provide support.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-[#0f294d]">
            Your Choices
          </h2>
          <p className="mt-2 text-gray-700">
            You can request data access, corrections, or deletion by contacting
            support.
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
}
