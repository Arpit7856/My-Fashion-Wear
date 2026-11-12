import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import TryOutfit from "./pages/TryOutfit";
import Men from "./pages/Men";
import Women from "./pages/Women";
import Upload from "./pages/Upload";
import ClothingDesigns from "./pages/ClothingDesigns";

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/try" element={<TryOutfit />} />
        <Route path="/men" element={<Men />} />
        <Route path="/men/designs/:category" element={<ClothingDesigns />} />
        <Route path="/women" element={<Women />} />
        <Route path="/women/designs/:category" element={<ClothingDesigns />} />
        <Route path="/upload" element={<Upload />} />
      </Routes>
      <Footer />
    </BrowserRouter>
  );
}