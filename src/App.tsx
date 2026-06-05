import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "@/pages/Home";
import History from "@/pages/History";
import Favorites from "@/pages/Favorites";
import Blacklist from "@/pages/Blacklist";
import VoteManager from "@/pages/VoteManager";
import VoteParticipant from "@/pages/VoteParticipant";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/history" element={<History />} />
        <Route path="/favorites" element={<Favorites />} />
        <Route path="/blacklist" element={<Blacklist />} />
        <Route path="/vote-manager" element={<VoteManager />} />
        <Route path="/vote/:voteId" element={<VoteParticipant />} />
      </Routes>
    </Router>
  );
}
