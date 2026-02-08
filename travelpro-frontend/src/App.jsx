import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Admin from "./pages/Admin";
import ResultsPage from "./pages/ResultsPage";
import ReviewPage from "./pages/ReviewPage";
import CallPopup from "./components/CallPopup";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";


function App() {
  return (
    <Router>
      <CallPopup />
      <Routes>
  <Route path="/" element={<Home />} />
  <Route path="/results" element={<ResultsPage />} />
  <Route path="/admin" element={<Admin />} />
  <Route path="/review" element={<ReviewPage />} />
  <Route path="/about" element={<About />} />
  <Route path="/contact" element={<Contact />} />
  <Route path="/privacy" element={<Privacy />} />
  <Route path="/terms" element={<Terms />} />
</Routes>
    </Router>
  );
}

export default App;
