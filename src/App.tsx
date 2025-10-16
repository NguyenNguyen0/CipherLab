import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import HomePage from "./pages/HomePage";
import CaesarCipherPage from "./pages/CaesarCipherPage";
import RsaPage from "./pages/RsaPage";
import PlayfairPage from "./pages/PlayfairPage";

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <Navbar />
        <div className="p-4 pt-6">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/caesar" element={<CaesarCipherPage />} />
            <Route path="/rsa" element={<RsaPage />} />
            <Route path="/playfair" element={<PlayfairPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
