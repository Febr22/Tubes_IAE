import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { User, Mail, MapPin, Phone, Save } from 'lucide-react';

const Profil = () => {
  const [userData, setUserData] = useState({
    username: '',
    email: '',
    no_telepon: '',
    alamat_utama: '',
    role: ''
  });
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  // Fungsi mengambil data profil saat halaman pertama kali dibuka
  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await axios.get('http://127.0.0.1:8000/api/users/me/', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUserData(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching profile:', error);
      setLoading(false);
    }
  };

  // Fungsi untuk menangani perubahan ketikan pada form edit
  const handleChange = (e) => {
    setUserData({
      ...userData,
      [e.target.name]: e.target.value
    });
  };

  // Fungsi untuk menyimpan perubahan ke backend
  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('access_token');
      // Menggunakan PATCH karena kita hanya mengupdate sebagian data
      await axios.patch('http://127.0.0.1:8000/api/users/me/', userData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Profil berhasil diperbarui!');
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Gagal memperbarui profil.');
    }
  };

  if (loading) return <div className="pt-24 text-center">Memuat profil...</div>;

  return (
    <div className="pt-24 pb-12 max-w-3xl mx-auto px-4">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-extrabold text-[#0A1D3C]">Profil Saya</h1>
          <button 
            onClick={() => setIsEditing(!isEditing)}
            className="text-sm font-bold text-blue-600 hover:text-blue-700"
          >
            {isEditing ? 'Batal Edit' : 'Edit Profil'}
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Username (Hanya dibaca) */}
            <div>
              <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-2">
                <User className="w-4 h-4 text-slate-400" /> Username
              </label>
              <input 
                type="text" 
                value={userData.username}
                disabled 
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-500 cursor-not-allowed"
              />
            </div>

            {/* Email (Hanya dibaca) */}
            <div>
              <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-2">
                <Mail className="w-4 h-4 text-slate-400" /> Email
              </label>
              <input 
                type="email" 
                value={userData.email}
                disabled 
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-500 cursor-not-allowed"
              />
            </div>

            {/* Nomor Telepon (Bisa diedit) */}
            <div>
              <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-2">
                <Phone className="w-4 h-4 text-slate-400" /> Nomor Telepon
              </label>
              <input 
                type="text" 
                name="no_telepon"
                value={userData.no_telepon || ''}
                onChange={handleChange}
                disabled={!isEditing}
                className={`w-full px-4 py-2 rounded-xl transition ${isEditing ? 'bg-white border border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none' : 'bg-slate-50 border border-slate-200 text-slate-600'}`}
                placeholder="Masukkan nomor telepon"
              />
            </div>
            
            {/* Role (Hanya dibaca) */}
            <div>
              <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-2">
                Tipe Akun
              </label>
              <div className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-500 capitalize">
                {userData.role}
              </div>
            </div>
          </div>

          {/* Alamat Utama (Bisa diedit) */}
          <div>
            <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-2">
              <MapPin className="w-4 h-4 text-slate-400" /> Alamat Pengiriman Utama
            </label>
            <textarea 
              name="alamat_utama"
              value={userData.alamat_utama || ''}
              onChange={handleChange}
              disabled={!isEditing}
              rows="3"
              className={`w-full px-4 py-2 rounded-xl transition ${isEditing ? 'bg-white border border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none' : 'bg-slate-50 border border-slate-200 text-slate-600'}`}
              placeholder="Masukkan alamat lengkap pengiriman"
            ></textarea>
          </div>

          {isEditing && (
            <div className="flex justify-end pt-4">
              <button 
                type="submit"
                className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white font-bold rounded-xl shadow-md hover:bg-blue-700 transition"
              >
                <Save className="w-4 h-4" /> Simpan Perubahan
              </button>
            </div>
          )}

        </form>
      </div>
    </div>
  );
};

export default Profil;