import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { 
  User, Mail, Phone, MapPin, Save, Loader2, Shield, ChevronRight, Check, X, Plus, Trash2, Star, Camera
} from "lucide-react";
import userService from "../services/userService";

const Profil = () => {
  const [profile, setProfile] = useState({
    username: "",
    email: "",
    first_name: "",
    last_name: "",
    no_telepon: "",
    role: "",
    foto_profil: null, // URL foto dari backend
    fotoFile: null,    // File fisik yang dipilih user
    previewFoto: null  // URL sementara untuk preview di browser
  });
  
  // State untuk fitur Alamat
  const [alamatList, setAlamatList] = useState([]);
  const [isModalAlamatOpen, setIsModalAlamatOpen] = useState(false);
  const [formAlamat, setFormAlamat] = useState({
    nama_penerima: "", no_telepon: "", alamat_lengkap: "", kota_kabupaten: "", provinsi: "", kode_pos: "", is_utama: false
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const navigate = useNavigate();

  // URL Dasar untuk Gambar (Sesuaikan jika backend beda port)
  const BASE_URL = "http://127.0.0.1:8000";

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      navigate("/login");
      return;
    }
    fetchData();
  }, [navigate]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const userData = await userService.dapatkanProfil();
      
      // Jika url foto tidak pakai http (relatif), tambahkan BASE_URL
      let fotoUrl = userData.foto_profil;
      if (fotoUrl && !fotoUrl.startsWith("http")) {
          fotoUrl = `${BASE_URL}${fotoUrl}`;
      }

      setProfile({
        username: userData.username || "",
        email: userData.email || "",
        first_name: userData.first_name || "",
        last_name: userData.last_name || "",
        no_telepon: userData.no_telepon || "",
        role: userData.role || "",
        foto_profil: fotoUrl,
        fotoFile: null,
        previewFoto: null
      });

      const alamatData = await userService.getDaftarAlamat();
      setAlamatList(alamatData);
    } catch (err) {
      console.error("Gagal mengambil data:", err);
      const errorMessage = typeof err === 'object' ? JSON.stringify(err) : err;
      setErrorMsg(`Gagal memuat data. Silakan coba masuk kembali. (${errorMessage})`);
    } finally {
      setLoading(false);
    }
  };

  // --- HANDLE PROFIL UTAMA ---
  const handleProfileChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  // Menangani saat user memilih file gambar
  const handleFotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfile({
        ...profile,
        fotoFile: file,
        previewFoto: URL.createObjectURL(file) // Membuat link preview sementara
      });
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg(""); setErrorMsg("");

    try {
      // WAJIB menggunakan FormData karena kita mengirim file (gambar)
      const formData = new FormData();
      formData.append('username', profile.username);
      formData.append('first_name', profile.first_name);
      formData.append('last_name', profile.last_name);
      formData.append('no_telepon', profile.no_telepon);
      
      // Lampirkan file foto jika user memilih foto baru
      if (profile.fotoFile) {
        formData.append('foto_profil', profile.fotoFile);
      }

      await userService.perbaruiProfil(formData);
      
      setSuccessMsg("Informasi profil dan foto berhasil diperbarui!");
      fetchData(); // Refresh data untuk mendapatkan URL gambar permanen dari backend
      setTimeout(() => setSuccessMsg(""), 5000);
    } catch (err) {
      const errorMessage = typeof err === 'object' ? JSON.stringify(err) : err;
      setErrorMsg(`Gagal menyimpan perubahan profil: ${errorMessage}`);
    } finally {
      setSaving(false);
    }
  };

  // --- HANDLE ALAMAT (Dibiarkan sama persis) ---
  const handleAlamatChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormAlamat({ ...formAlamat, [e.target.name]: value });
  };

  const handleAlamatSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg(""); setErrorMsg("");

    try {
      await userService.tambahAlamat(formAlamat);
      setIsModalAlamatOpen(false);
      setFormAlamat({ nama_penerima: "", no_telepon: "", alamat_lengkap: "", kota_kabupaten: "", provinsi: "", kode_pos: "", is_utama: false });
      setSuccessMsg("Alamat baru berhasil ditambahkan!");
      fetchData(); 
      setTimeout(() => setSuccessMsg(""), 5000);
    } catch (err) {
      const errorMessage = typeof err === 'object' ? JSON.stringify(err) : err;
      setErrorMsg(`Gagal menambahkan alamat: ${errorMessage}`);
    } finally {
      setSaving(false);
    }
  };

  const hapusAlamat = async (id) => {
    if (window.confirm("Apakah kamu yakin ingin menghapus alamat ini?")) {
      setSuccessMsg(""); setErrorMsg("");
      try {
        await userService.hapusAlamat(id);
        fetchData();
        setSuccessMsg("Alamat berhasil dihapus!");
        setTimeout(() => setSuccessMsg(""), 5000);
      } catch (err) {
        const errorMessage = typeof err === 'object' ? JSON.stringify(err) : err;
        setErrorMsg(`Gagal menghapus alamat: ${errorMessage}`);
      }
    }
  };

  const jadikanUtama = async (id) => {
    setSuccessMsg(""); setErrorMsg("");
    try {
      await userService.updateAlamat(id, { is_utama: true });
      fetchData();
      setSuccessMsg("Alamat utama berhasil diubah!");
      setTimeout(() => setSuccessMsg(""), 5000);
    } catch (err) {
      const errorMessage = typeof err === 'object' ? JSON.stringify(err) : err;
      setErrorMsg(`Gagal mengubah alamat utama: ${errorMessage}`);
    }
  };

  const getInitials = () => {
    if (profile.first_name) return `${profile.first_name[0]}${profile.last_name ? profile.last_name[0] : ""}`.toUpperCase();
    return profile.username ? profile.username.substring(0, 2).toUpperCase() : "US";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
        <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
        <p className="text-sm font-semibold text-slate-500">Memuat data Anda...</p>
      </div>
    );
  }

  // Menentukan gambar mana yang akan ditampilkan (Preview lokal > Foto DB > Inisial)
  const displayImage = profile.previewFoto || profile.foto_profil;

  return (
    <div className="min-h-screen bg-slate-50/50 pt-28 pb-20 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-5xl mx-auto">
        
        <div className="flex items-center space-x-2 text-sm text-slate-500 mb-6">
          <Link to="/" className="hover:text-blue-600 transition">Beranda</Link>
          <ChevronRight className="w-4 h-4 flex-shrink-0" />
          <span className="text-slate-800 font-semibold">Profil Saya</span>
        </div>

        <h1 className="text-3xl font-extrabold text-[#0A1D3C] tracking-tight mb-8">
          Pengaturan Akun & Alamat
        </h1>

        {successMsg && (
          <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3 text-emerald-800 text-sm animate-in fade-in duration-300">
            <div className="w-6 h-6 bg-emerald-500 text-white rounded-full flex items-center justify-center flex-shrink-0"><Check className="w-4 h-4" /></div>
            <span className="font-semibold">{successMsg}</span>
          </div>
        )}

        {errorMsg && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-3 text-rose-800 text-sm animate-in fade-in duration-300">
            <div className="w-6 h-6 bg-rose-500 text-white rounded-full flex items-center justify-center flex-shrink-0"><X className="w-4 h-4" /></div>
            <span className="font-semibold">{errorMsg}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* Kolom Kiri: Info Profil & Avatar */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm flex flex-col items-center text-center">
              
              {/* AREA AVATAR INTERAKTIF */}
              <div 
                className="relative w-28 h-28 mb-4 group cursor-pointer"
                onClick={() => document.getElementById('fotoUpload').click()}
                title="Klik untuk mengubah foto profil"
              >
                {displayImage ? (
                  <img src={displayImage} alt="Profil" className="w-full h-full rounded-full object-cover shadow-lg border-4 border-white" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-full flex items-center justify-center text-white text-3xl font-black shadow-lg border-4 border-white">
                    {getInitials()}
                  </div>
                )}
                
                {/* Overlay gelap saat di-hover */}
                <div className="absolute inset-0 bg-black/40 rounded-full flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <Camera className="w-6 h-6 text-white mb-1" />
                  <span className="text-white text-[10px] font-bold tracking-wider">Ubah Foto</span>
                </div>
                
                {/* Input File Tersembunyi */}
                <input 
                  type="file" 
                  id="fotoUpload" 
                  className="hidden" 
                  accept="image/jpeg, image/png, image/jpg" 
                  onChange={handleFotoChange} 
                />
              </div>

              <h3 className="text-lg font-bold text-slate-900 leading-tight">
                {profile.first_name ? `${profile.first_name} ${profile.last_name}`.trim() : profile.username}
              </h3>
              <p className="text-xs text-slate-400 mt-1 font-medium">{profile.email}</p>
              
              {profile.fotoFile && (
                <p className="text-[10px] text-amber-500 font-bold mt-2 bg-amber-50 px-2 py-1 rounded-md">
                  *Klik 'Simpan Profil' untuk menerapkan foto
                </p>
              )}

              <div className="w-full border-t border-slate-100 my-5"></div>
              <div className="w-full space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400 font-medium">Role Pengguna</span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full font-bold uppercase tracking-wider text-[9px]">
                    <Shield className="w-3 h-3" /> {profile.role === 'admin' ? 'Admin' : 'Pelanggan'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Kolom Kanan: Form User & Daftar Alamat */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Form Edit Profil */}
            <form onSubmit={handleProfileSubmit} className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm space-y-5">
              <h4 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-4 flex items-center gap-2">
                <User className="w-4 h-4 text-blue-600" /> Informasi Personal Akun
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Username</label>
                  <input type="text" name="username" value={profile.username} onChange={handleProfileChange} required className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-xs text-slate-700 transition" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Email (Read Only)</label>
                  <input type="email" value={profile.email} disabled className="w-full px-4 py-3 rounded-xl border border-slate-100 bg-slate-50 text-xs text-slate-400 transition cursor-not-allowed" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Nama Depan</label>
                  <input type="text" name="first_name" value={profile.first_name} onChange={handleProfileChange} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-xs text-slate-700 transition" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Nama Belakang</label>
                  <input type="text" name="last_name" value={profile.last_name} onChange={handleProfileChange} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-xs text-slate-700 transition" />
                </div>
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Nomor Telepon</label>
                  <input type="text" name="no_telepon" value={profile.no_telepon} onChange={handleProfileChange} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-xs text-slate-700 transition" />
                </div>
              </div>
              <div className="flex justify-end pt-2">
                <button type="submit" disabled={saving} className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white font-bold rounded-xl text-xs transition flex items-center gap-2">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Simpan Profil
                </button>
              </div>
            </form>

            {/* Bagian Manajemen Alamat */}
            <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm space-y-5">
              <div className="flex justify-between items-center border-b border-slate-100 pb-4">
                <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-blue-600" /> Daftar Alamat
                </h4>
                <button onClick={() => setIsModalAlamatOpen(true)} className="flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 font-bold rounded-lg text-xs transition">
                  <Plus className="w-4 h-4" /> Tambah Alamat
                </button>
              </div>

              <div className="space-y-4">
                {alamatList.length === 0 ? (
                  <div className="text-center py-8 text-slate-400 text-sm">Belum ada alamat yang ditambahkan.</div>
                ) : (
                  alamatList.map((alamat) => (
                    <div key={alamat.id} className={`p-4 rounded-2xl border ${alamat.is_utama ? 'border-blue-400 bg-blue-50/30' : 'border-slate-200'} transition`}>
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-800 text-sm">{alamat.nama_penerima}</span>
                          <span className="text-slate-400 text-xs">|</span>
                          <span className="text-slate-600 text-xs">{alamat.no_telepon}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {alamat.is_utama ? (
                            <span className="px-2 py-1 bg-blue-100 text-blue-700 text-[10px] font-bold rounded-md uppercase tracking-wider flex items-center gap-1">
                              <Star className="w-3 h-3 fill-current" /> Utama
                            </span>
                          ) : (
                            <button onClick={() => jadikanUtama(alamat.id)} className="text-xs font-semibold text-slate-500 hover:text-blue-600 px-2 py-1 border border-slate-200 rounded-md bg-white">
                              Jadikan Utama
                            </button>
                          )}
                        </div>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed max-w-lg">
                        {alamat.alamat_lengkap}, {alamat.kota_kabupaten}, {alamat.provinsi}, {alamat.kode_pos}
                      </p>
                      {!alamat.is_utama && (
                        <div className="mt-3 flex justify-end">
                          <button onClick={() => hapusAlamat(alamat.id)} className="text-rose-500 hover:text-rose-600 text-xs flex items-center gap-1 font-semibold">
                            <Trash2 className="w-3.5 h-3.5" /> Hapus
                          </button>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>
        </div>

        {/* Modal Tambah Alamat (Tetap Sama) */}
        {isModalAlamatOpen && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            {/* Konten modal alamat sama seperti sebelumnya... */}
            <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl animate-in fade-in zoom-in duration-200 flex flex-col max-h-[90vh]">
              <div className="p-5 border-b border-slate-100 flex justify-between items-center">
                <h4 className="font-extrabold text-slate-900 text-base">Tambah Alamat Baru</h4>
                <button onClick={() => setIsModalAlamatOpen(false)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
              </div>
              <div className="p-5 overflow-y-auto">
                <form id="form-alamat" onSubmit={handleAlamatSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2 sm:col-span-1 space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Nama Penerima</label>
                      <input type="text" name="nama_penerima" value={formAlamat.nama_penerima} onChange={handleAlamatChange} required className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-xs" />
                    </div>
                    <div className="col-span-2 sm:col-span-1 space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">No. Telepon</label>
                      <input type="text" name="no_telepon" value={formAlamat.no_telepon} onChange={handleAlamatChange} required className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-xs" />
                    </div>
                    <div className="col-span-2 space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Kota / Kabupaten</label>
                      <input type="text" name="kota_kabupaten" value={formAlamat.kota_kabupaten} onChange={handleAlamatChange} required className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-xs" />
                    </div>
                    <div className="col-span-2 sm:col-span-1 space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Provinsi</label>
                      <input type="text" name="provinsi" value={formAlamat.provinsi} onChange={handleAlamatChange} required className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-xs" />
                    </div>
                    <div className="col-span-2 sm:col-span-1 space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Kode Pos</label>
                      <input type="text" name="kode_pos" value={formAlamat.kode_pos} onChange={handleAlamatChange} required className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-xs" />
                    </div>
                    <div className="col-span-2 space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Alamat Lengkap (Jalan, RT/RW, Blok)</label>
                      <textarea name="alamat_lengkap" value={formAlamat.alamat_lengkap} onChange={handleAlamatChange} required rows="3" className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-xs leading-relaxed"></textarea>
                    </div>
                    <div className="col-span-2 flex items-center gap-2 mt-2">
                      <input type="checkbox" id="is_utama" name="is_utama" checked={formAlamat.is_utama} onChange={handleAlamatChange} className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500" />
                      <label htmlFor="is_utama" className="text-xs text-slate-700 font-semibold cursor-pointer">Jadikan sebagai alamat utama</label>
                    </div>
                  </div>
                </form>
              </div>
              <div className="p-5 border-t border-slate-100 flex justify-end gap-3 bg-slate-50 rounded-b-3xl">
                <button type="button" onClick={() => setIsModalAlamatOpen(false)} className="px-5 py-2.5 text-slate-600 font-bold text-xs hover:bg-slate-200 rounded-xl transition">Batal</button>
                <button type="submit" form="form-alamat" disabled={saving} className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-md">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Simpan Alamat
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default Profil;