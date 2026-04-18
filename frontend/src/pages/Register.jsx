import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';

const Register = () => {
  const [formData, setFormData] = useState({ email: '', username: '', password: '' });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('users/register/', formData);
      alert('Registrasi berhasil! Silakan login.');
      navigate('/login');
    } catch (error) {
      alert('Registrasi gagal. Pastikan email belum terdaftar.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-6">
      <div className="max-w-md w-full bg-white p-8 rounded-3xl shadow-lg border border-gray-100">
        <h2 className="text-3xl font-extrabold text-[#0A1D3C] text-center mb-6">Daftar UnivStore</h2>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email Aktif</label>
            <input type="email" name="email" onChange={handleChange} required className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-600 outline-none" placeholder="mahasiswa@kampus.id" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
            <input type="text" name="username" onChange={handleChange} required className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-600 outline-none" placeholder="johndoe" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input type="password" name="password" onChange={handleChange} required className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-600 outline-none" placeholder="••••••••" />
          </div>
          <button type="submit" className="w-full py-3 bg-[#0A1D3C] text-white font-bold rounded-xl hover:bg-opacity-90 transition">
            Buat Akun
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-gray-600">
          Sudah punya akun? <Link to="/login" className="text-blue-600 font-semibold hover:underline">Masuk di sini</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;