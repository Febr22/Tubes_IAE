import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
// 1. IMPORT file Katalog kamu di sini
import Katalog from './pages/Katalog'; 

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* 2. TAMBAHKAN baris ini agar alamat /katalog bisa diakses */}
        <Route path="/katalog" element={<Katalog />} />
      </Routes>
    </Router>
  );
}

export default App;