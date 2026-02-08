import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function About() {
  return (
    <div className="min-h-screen bg-white text-gray-900">
      <Navbar />

      <section className="bg-[#f2f7fd]">
        <div className="max-w-5xl mx-auto px-6 py-14">
          <h1 className="text-3xl md:text-4xl font-bold text-[#0f294d]">
            About TravelPro
          </h1>
          <p className="mt-4 text-gray-700">
            TravelPro helps travelers book flights, hotels, and trips with speed,
            clarity, and reliable support. We focus on transparent pricing,
            premium partners, and a smooth end-to-end experience.
          </p>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-6 py-12 space-y-8">
        <div>
          <h2 className="text-xl font-semibold text-[#0f294d]">
            Our Mission
          </h2>
          <p className="mt-2 text-gray-700">
            Make travel planning effortless with verified inventory, real-time
            availability, and trusted customer care.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-[#0f294d]">
            What We Offer
          </h2>
          <ul className="mt-3 text-gray-700 list-disc pl-5 space-y-2">
            <li>Global flight search with flexible options.</li>
            <li>Handpicked hotels and curated packages.</li>
            <li>24/7 support with trained travel specialists.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-[#0f294d]">
            Why TravelPro
          </h2>
          <p className="mt-2 text-gray-700">
            We combine modern booking tech with human support so you can travel
            with confidence.
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
}
