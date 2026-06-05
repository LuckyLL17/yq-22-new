import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "@/pages/Home";
import History from "@/pages/History";
import Favorites from "@/pages/Favorites";
import Blacklist from "@/pages/Blacklist";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/history" element={<History />} />
        <Route path="/favorites" element={<Favorites />} />
        <Route path="/blacklist" element={<Blacklist />} />
      </Routes>
    </Router>
  );
}
