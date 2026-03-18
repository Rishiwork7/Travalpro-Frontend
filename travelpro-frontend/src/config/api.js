// Central API base URL config
// Falls back to production Render URL if VITE_API_URL env var is not set
const API_BASE =
  import.meta.env.VITE_API_URL?.trim() ||
  "https://travalpro-backend-1.onrender.com";

export default API_BASE;
