import { useState } from "react";
import { Trash2 } from "lucide-react";
import { useSettings } from "../context/SettingsContext";

export default function Admin() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(false);
  const [authorized, setAuthorized] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const { formatPrice } = useSettings();

  const ADMIN_PASSWORD = "travelpro123";

  const handleLogin = () => {
    if (passwordInput === ADMIN_PASSWORD) {
      setAuthorized(true);
      fetchLeads();
    } else {
      alert("Incorrect password");
    }
  };

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const res = await fetch("https://travalpro-backend-1.onrender.com/api/leads", {
        headers: { "x-admin-token": passwordInput || ADMIN_PASSWORD },
      });
      if (!res.ok) throw new Error("Unauthorized");
      const data = await res.json();
      if (Array.isArray(data)) {
        setLeads(data);
      } else {
        console.error("Leads data is not an array:", data);
        setLeads([]);
      }
    } catch (err) {
      console.error(err);
      alert("Failed to fetch leads. Check password.");
      setAuthorized(false); // Logout if failed
    }
    setLoading(false);
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm("Delete this lead?");
    if (!confirmed) return;

    try {
      const res = await fetch(`https://travalpro-backend-1.onrender.com/api/leads/${id}`, {
        method: "DELETE",
        headers: { "x-admin-token": passwordInput || ADMIN_PASSWORD },
      });

      if (res.ok) {
        setLeads((prev) => prev.filter((lead) => lead._id !== id));
      } else {
        alert("Failed to delete from server.");
      }
    } catch (err) {
      alert("Failed to delete from server.");
      console.error("Delete error:", err);
    }
  };

  const handleClearAll = async () => {
    const confirmed = window.confirm(
      "WARNING: This will delete ALL data. Continue?"
    );
    if (!confirmed) return;

    try {
      const res = await fetch("https://travalpro-backend-1.onrender.com/api/leads/clear-all", {
        method: "DELETE",
        headers: { "x-admin-token": passwordInput || ADMIN_PASSWORD },
      });

      if (res.ok) {
        setLeads([]);
      } else {
        alert("Server failed to clear data.");
      }
    } catch (err) {
      alert("Server failed to clear data.");
      console.error("Clear all error:", err);
    }
  };

  const downloadCSV = () => {
    const headers = [
      "Service",
      "Email",
      "Phone",
      "Flight ID",
      "Passengers",
      "Total Amount",
      "Status",
      "Created At"
    ];

    const rows = leads.map((lead) => [
      lead.service,
      lead.email,
      lead.phone,
      lead.flightId || "",
      lead.passengers?.length || 0,
      lead.totalAmount || 0,
      lead.status,
      new Date(lead.createdAt).toLocaleString()
    ]);

    let csvContent =
      "data:text/csv;charset=utf-8," +
      [headers, ...rows]
        .map((row) => row.join(","))
        .join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "travelpro_leads.csv");
    document.body.appendChild(link);
    link.click();
  };

  if (!authorized) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-10 rounded-2xl w-96 shadow-xl border border-gray-200">
          <h2 className="text-xl font-bold mb-6 text-center text-[#0f294d]">
            TravelPro Admin Login
          </h2>

          <input
            type="password"
            placeholder="Enter admin password"
            value={passwordInput}
            onChange={(e) => setPasswordInput(e.target.value)}
            className="w-full border border-gray-300 p-3 rounded-lg mb-4 focus:border-[#0f294d] focus:ring-2 focus:ring-[#0f294d]/20 outline-none"
          />

          <button
            onClick={handleLogin}
            className="w-full bg-[#d13b1a] hover:bg-[#b93216] text-white py-3 rounded-lg font-semibold transition shadow-md"
          >
            Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">

      {/* Header */}
      <div className="max-w-7xl mx-auto px-6 py-10 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-[#0f294d]">TravelPro Admin Dashboard</h1>
          <p className="text-gray-600 text-sm">
            Total Leads: {leads.length}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleClearAll}
            className="bg-red-600 hover:bg-red-700 text-white px-5 py-3 rounded-xl font-semibold transition shadow-md"
          >
            Clear All Leads
          </button>
          <button
            onClick={downloadCSV}
            className="bg-[#d13b1a] hover:bg-[#b93216] text-white px-6 py-3 rounded-xl font-semibold hover:scale-105 transition shadow-md"
          >
            Download CSV
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 pb-10">
        {loading && <p className="text-gray-600">Loading leads...</p>}

        {!loading && leads.length === 0 && (
          <p className="text-gray-600">No leads yet.</p>
        )}

        <div className="grid gap-6">
          {leads.map((lead) => (
            <div
              key={lead._id}
              className="bg-white border border-gray-200 rounded-2xl p-6 shadow-md hover:shadow-lg transition"
            >
              <div className="flex justify-between items-center mb-4">

                <div>
                  <span className="text-[#d13b1a] font-semibold uppercase text-sm">
                    {lead.service}
                  </span>
                  <p className="text-xs text-gray-600">
                    {new Date(lead.createdAt).toLocaleString()}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold text-white ${String(lead.status || "").toLowerCase() === "new"
                        ? "bg-green-500"
                        : "bg-gray-500"
                      }`}
                  >
                    {lead.status}
                  </span>
                  <button
                    onClick={() => handleDelete(lead._id)}
                    className="text-red-600 hover:text-red-900 transition"
                    title="Delete lead"
                    aria-label="Delete lead"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>

              </div>

              <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-700">

                <div>
                  <p><strong className="text-[#0f294d]">Email:</strong> {lead.email}</p>
                  <p><strong className="text-[#0f294d]">Phone:</strong> {lead.phone}</p>
                </div>

                <div>
                  <p><strong className="text-[#0f294d]">Booking:</strong></p>
                  <p className="text-gray-600 text-xs mt-1">
                    {lead.bookingDetails?.title ||
                      lead.bookingDetails?.airline ||
                      lead.flightId ||
                      "Details Available"}
                  </p>
                  <p className="text-gray-600 text-xs mt-1">
                    Passengers: {lead.passengers?.length || 0}
                  </p>
                  <p className="text-gray-600 text-xs mt-1">
                    Total: <span className="text-[#0a821c] font-semibold">{formatPrice(lead.totalAmount || 0)}</span>
                  </p>
                </div>

              </div>

            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
