import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post('users/login/', formData);
      localStorage.setItem('access_token', response.data.access);
      localStorage.setItem('refresh_token', response.data.refresh);
      alert('Berhasil masuk!');
      navigate('/'); // Kembali ke Home setelah berhasil login
    } catch (error) {
      alert('Email atau Password salah!');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-6">
      <div className="max-w-md w-full bg-white p-8 rounded-3xl shadow-lg border border-gray-100">
        <h2 className="text-3xl font-extrabold text-[#0A1D3C] text-center mb-6">Selamat Datang</h2>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input type="email" name="email" onChange={handleChange} required className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-600 outline-none" placeholder="Email Anda" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input type="password" name="password" onChange={handleChange} required className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-600 outline-none" placeholder="••••••••" />
          </div>
          <button type="submit" className="w-full py-3 bg-[#0A1D3C] text-white font-bold rounded-xl hover:bg-opacity-90 transition">
            Masuk
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-gray-600">
          Belum punya akun? <Link to="/register" className="text-blue-600 font-semibold hover:underline">Daftar sekarang</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;