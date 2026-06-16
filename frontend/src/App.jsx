import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Import semua halaman kamu
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import KatalogProduk from './pages/Katalog.jsx'; // Sesuaikan dengan nama file katalog kamu
import DetailProduk from './pages/DetailProduk';
import Pemesanan from "./pages/Pemesanan";
import Cart from "./pages/Cart";
import Pesanan from "./pages/Pesanan";
import StatusPembayaran from "./pages/StatusPembayaran";
import Profil from "./pages/Profil";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminOrders from "./pages/admin/AdminOrders";
import AdminProducts from "./pages/admin/AdminProducts";
import Navbar from "./components/Navbar";
import ErrorBoundary from "./components/ErrorBoundary";
import { CartProvider } from "./context/CartContext";

function App() {
  return (
    <Router>
      <CartProvider>
        <ErrorBoundary>
          <Navbar />
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

            {/* Halaman Pemesanan */}
            <Route path="/pemesanan" element={<Pemesanan />} />        

            {/* Halaman Keranjang Belanja */}
            <Route path="/keranjang" element={<Cart />} />

            {/* Halaman Riwayat Pesanan Saya */}
            <Route path="/pesanan" element={<Pesanan />} />

            {/* Halaman Status Pembayaran Redirect Midtrans */}
            <Route path="/status-pembayaran" element={<StatusPembayaran />} />
            
            {/* Halaman Profil & Alamat Pengiriman */}
            <Route path="/profil" element={<Profil />} />

            {/* Halaman Khusus Admin */}
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/orders" element={<AdminOrders />} />
            <Route path="/admin/products" element={<AdminProducts />} />
          </Routes>
        </ErrorBoundary>
      </CartProvider>
    </Router>
  );
}

export default App;