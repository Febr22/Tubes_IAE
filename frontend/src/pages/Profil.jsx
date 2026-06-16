import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Save, 
  Loader2, 
  Shield, 
  ChevronRight,
  Check,
  X 
} from "lucide-react";
import userService from "../services/userService";

const Profil = () => {
  const [profile, setProfile] = useState({
    username: "",
    email: "",
    first_name: "",
    last_name: "",
    no_telepon: "",
    alamat_utama: "",
    role: ""
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const navigate = useNavigate();

  // Fetch user profile on mount
  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      navigate("/login");
      return;
    }

    const fetchProfile = async () => {
      try {
        setLoading(true);
        const data = await userService.dapatkanProfil();
        setProfile({
          username: data.username || "",
          email: data.email || "",
          first_name: data.first_name || "",
          last_name: data.last_name || "",
          no_telepon: data.no_telepon || "",
          alamat_utama: data.alamat_utama || "",
          role: data.role || ""
        });
      } catch (err) {
        console.error("Gagal mengambil data profil:", err);
        setErrorMsg("Gagal memuat profil Anda. Silakan coba masuk kembali.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg("");
    setErrorMsg("");

    try {
      const updatedData = {
        username: profile.username,
        first_name: profile.first_name,
        last_name: profile.last_name,
        no_telepon: profile.no_telepon,
        alamat_utama: profile.alamat_utama
      };
      
      const res = await userService.perbaruiProfil(updatedData);
      setProfile((prev) => ({
        ...prev,
        username: res.username || "",
        first_name: res.first_name || "",
        last_name: res.last_name || "",
        no_telepon: res.no_telepon || "",
        alamat_utama: res.alamat_utama || ""
      }));
      setSuccessMsg("Profil dan alamat pengiriman berhasil diperbarui!");
      
      // Auto dismiss success banner
      setTimeout(() => setSuccessMsg(""), 5000);
    } catch (err) {
      console.error("Gagal update profil:", err);
      setErrorMsg(err.detail || err.error || "Gagal menyimpan perubahan. Periksa kembali input Anda.");
    } finally {
      setSaving(false);
    }
  };

  // Helper for initials
  const getInitials = () => {
    if (profile.first_name) {
      return `${profile.first_name[0]}${profile.last_name ? profile.last_name[0] : ""}`.toUpperCase();
    }
    return profile.username ? profile.username.substring(0, 2).toUpperCase() : "US";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 font-sans">
        <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
        <p className="text-sm font-semibold text-slate-500">Memuat profil akun Anda...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 pt-28 pb-20 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-4xl mx-auto">
        
        {/* Breadcrumb */}
        <div className="flex items-center space-x-2 text-sm text-slate-500 mb-6">
          <Link to="/" className="hover:text-blue-600 transition">Beranda</Link>
          <ChevronRight className="w-4 h-4 flex-shrink-0" />
          <span className="text-slate-800 font-semibold">Profil Saya</span>
        </div>

        <h1 className="text-3xl font-extrabold text-[#0A1D3C] tracking-tight mb-8">
          Pengaturan Akun & Alamat
        </h1>

        {/* Notifications */}
        {successMsg && (
          <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3 text-emerald-800 text-sm animate-in fade-in duration-300">
            <div className="w-6 h-6 bg-emerald-500 text-white rounded-full flex items-center justify-center flex-shrink-0">
              <Check className="w-4 h-4" />
            </div>
            <span className="font-semibold">{successMsg}</span>
          </div>
        )}

        {errorMsg && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-3 text-rose-800 text-sm animate-in fade-in duration-300">
            <div className="w-6 h-6 bg-rose-500 text-white rounded-full flex items-center justify-center flex-shrink-0">
              <X className="w-4 h-4" />
            </div>
            <span className="font-semibold">{errorMsg}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
          
          {/* Left Block: Summary Profile */}
          <div className="md:col-span-1 bg-white rounded-3xl border border-slate-100 p-6 shadow-sm flex flex-col items-center text-center">
            <div className="w-24 h-24 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-full flex items-center justify-center text-white text-3xl font-black shadow-lg shadow-blue-500/25 mb-4">
              {getInitials()}
            </div>
            
            <h3 className="text-lg font-bold text-slate-900 leading-tight">
              {profile.first_name ? `${profile.first_name} ${profile.last_name}`.trim() : profile.username}
            </h3>
            <p className="text-xs text-slate-400 mt-1 font-medium">{profile.email}</p>
            
            <div className="w-full border-t border-slate-100 my-5"></div>
            
            <div className="w-full space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400 font-medium">Role Pengguna</span>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full font-bold uppercase tracking-wider text-[9px]">
                  <Shield className="w-3 h-3" /> {profile.role === 'admin' ? 'Admin' : 'Pelanggan'}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400 font-medium">Username</span>
                <strong className="text-slate-700 font-bold">@{profile.username}</strong>
              </div>
            </div>
          </div>

          {/* Right Block: Forms details and address */}
          <form onSubmit={handleSubmit} className="md:col-span-2 space-y-6">
            
            {/* Personal Info Card */}
            <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm space-y-5">
              <h4 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-4 flex items-center gap-2">
                <User className="w-4 h-4 text-blue-600" />
                Informasi Personal Akun
              </h4>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Username</label>
                  <input 
                    type="text" 
                    name="username" 
                    value={profile.username} 
                    onChange={handleChange}
                    required
                    placeholder="Masukkan username"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-xs text-slate-700 transition font-medium"
                  />
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Email (Read Only)</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 transform -translate-y-1/2" />
                    <input 
                      type="email" 
                      value={profile.email} 
                      disabled
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-100 bg-slate-50 text-xs text-slate-400 transition font-medium cursor-not-allowed"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Nama Depan</label>
                  <input 
                    type="text" 
                    name="first_name" 
                    value={profile.first_name} 
                    onChange={handleChange}
                    placeholder="Nama Depan"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-xs text-slate-700 transition font-medium"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Nama Belakang</label>
                  <input 
                    type="text" 
                    name="last_name" 
                    value={profile.last_name} 
                    onChange={handleChange}
                    placeholder="Nama Belakang"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-xs text-slate-700 transition font-medium"
                  />
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Nomor Telepon</label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 transform -translate-y-1/2" />
                    <input 
                      type="text" 
                      name="no_telepon" 
                      value={profile.no_telepon} 
                      onChange={handleChange}
                      placeholder="Contoh: 081234567890"
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-xs text-slate-700 transition font-medium"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Shipping Address Card */}
            <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm space-y-5">
              <h4 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-4 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-blue-600" />
                Alamat Pengiriman Utama
              </h4>
              
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Alamat Pengiriman Lengkap</label>
                <textarea 
                  name="alamat_utama" 
                  value={profile.alamat_utama} 
                  onChange={handleChange}
                  placeholder="Masukkan nama penerima, nomor HP penerima, jalan, nomor rumah, RT/RW, kecamatan, kabupaten, kota, provinsi, dan kode pos"
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-xs text-slate-700 transition font-medium leading-relaxed placeholder:text-slate-400"
                />
              </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end pt-2">
              <button 
                type="submit" 
                disabled={saving}
                className="px-6 py-3.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white font-bold rounded-2xl text-xs transition flex items-center gap-2 shadow-lg shadow-blue-600/10 hover:shadow-blue-600/20 transform active:scale-95 duration-200"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Menyimpan...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Simpan Perubahan
                  </>
                )}
              </button>
            </div>
            
          </form>
        </div>

      </div>
    </div>
  );
};

export default Profil;