import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Import semua halaman kamu
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import KatalogProduk from './pages/Katalog.jsx'; // Sesuaikan dengan nama file katalog kamu
import DetailProduk from './pages/DetailProduk';
import Pemesanan from "./pages/Pemesanan";

function App() {
  return (
    <Router>
      <Routes>
        {/* Halaman Landing/Home */}
        <Route path="/" element={<Home />} />
        
        {/* Halaman Auth */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Halaman Daftar Katalog */}
        <Route path="/katalog" element={<KatalogProduk />} />
        
        {/* Halaman Detail Laptop (Dinamis) */}
        <Route path="/katalog/:slug" element={<DetailProduk />} />

        {/* Hamalam Pemesanan */}
        <Route path="/pemesanan" element={<Pemesanan />} />        
      </Routes>
    </Router>
  );
}

export default App;