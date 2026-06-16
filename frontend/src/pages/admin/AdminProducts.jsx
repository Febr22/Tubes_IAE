import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronRight, Laptop, Plus, Edit2, Trash2, Search, Loader2, X, Save, Image as ImageIcon } from 'lucide-react';
import adminService from '../../services/adminService';
import userService from '../../services/userService';
import api from '../../services/api'; // For getting base url or standard fetching
import axios from 'axios';

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState({
    kategori: '',
    nama: '',
    deskripsi: '',
    harga: '',
    stok: '',
    prosesor: '',
    ram: '',
    storage: '',
    is_available: true,
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [currentSlug, setCurrentSlug] = useState('');

  const navigate = useNavigate();

  const fetchData = async () => {
    try {
      setLoading(true);
      const prodRes = await api.get('katalog/produk/');
      setProducts(prodRes.data);
      
      const catRes = await api.get('katalog/kategori/');
      setCategories(catRes.data);
    } catch (err) {
      console.error(err);
      setError("Gagal memuat daftar produk.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const user = await userService.dapatkanProfil();
        if (user.role !== 'admin') {
          navigate('/');
        } else {
          fetchData();
        }
      } catch (err) {
        navigate('/');
      }
    };
    checkAdmin();
  }, [navigate]);

  const handleOpenAddModal = () => {
    setIsEditing(false);
    setFormData({
      kategori: categories.length > 0 ? categories[0].id : '',
      nama: '',
      deskripsi: '',
      harga: '',
      stok: '',
      prosesor: '',
      ram: '',
      storage: '',
      is_available: true,
    });
    setImageFile(null);
    setImagePreview(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (product) => {
    setIsEditing(true);
    setCurrentSlug(product.slug);
    setFormData({
      kategori: product.kategori?.id || '',
      nama: product.nama,
      deskripsi: product.deskripsi,
      harga: product.harga,
      stok: product.stok,
      prosesor: product.prosesor,
      ram: product.ram,
      storage: product.storage,
      is_available: product.is_available,
    });
    setImageFile(null);
    setImagePreview(product.gambar);
    setIsModalOpen(true);
  };

  const handleDelete = async (slug) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus produk ini?")) {
      try {
        await adminService.deleteProduct(slug);
        fetchData();
      } catch (err) {
        alert("Gagal menghapus produk.");
      }
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const form = new FormData();
      Object.keys(formData).forEach(key => {
        if (key === 'harga' || key === 'stok') {
          // ensure no commas
          form.append(key, formData[key].toString().replace(/,/g, ''));
        } else {
          form.append(key, formData[key]);
        }
      });
      if (imageFile) {
        form.append('gambar', imageFile);
      }

      if (isEditing) {
        await adminService.updateProduct(currentSlug, form);
      } else {
        await adminService.createProduct(form);
      }
      
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      alert("Gagal menyimpan produk. Pastikan semua field wajib terisi.");
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const filteredProducts = products.filter(p => 
    p.nama.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading && products.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
        <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
        <p className="text-sm font-semibold text-slate-500">Memuat Katalog...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-20 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-7xl mx-auto">
        
        {/* Breadcrumb */}
        <div className="flex items-center space-x-2 text-sm text-slate-500 mb-6">
          <Link to="/admin/dashboard" className="hover:text-blue-600 transition">Dashboard Admin</Link>
          <ChevronRight className="w-4 h-4 flex-shrink-0" />
          <span className="text-slate-800 font-semibold">Katalog Produk</span>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <h1 className="text-3xl font-extrabold text-[#0A1D3C] tracking-tight">
            Manajemen Katalog
          </h1>
          
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex-grow md:flex-grow-0">
              <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 transform -translate-y-1/2" />
              <input 
                type="text" 
                placeholder="Cari Laptop..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm w-full md:w-64"
              />
            </div>
            <button 
              onClick={handleOpenAddModal}
              className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-500/20 transition whitespace-nowrap"
            >
              <Plus className="w-5 h-5" /> Tambah Produk
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl text-sm font-semibold">
            {error}
          </div>
        )}

        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-100 text-xs uppercase tracking-wider text-slate-500 font-bold">
                  <th className="p-4 pl-6">Produk</th>
                  <th className="p-4">Kategori</th>
                  <th className="p-4">Harga</th>
                  <th className="p-4">Stok</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 pr-6 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="p-8 text-center text-slate-500">
                      Tidak ada produk ditemukan.
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map((product) => (
                    <tr key={product.id} className="hover:bg-slate-50/50 transition">
                      <td className="p-4 pl-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg overflow-hidden bg-slate-100 flex-shrink-0">
                            {product.gambar ? (
                              <img src={product.gambar} alt={product.nama} className="w-full h-full object-cover" />
                            ) : (
                              <Laptop className="w-5 h-5 text-slate-400 m-auto mt-2.5" />
                            )}
                          </div>
                          <span className="font-bold text-slate-800">{product.nama}</span>
                        </div>
                      </td>
                      <td className="p-4 text-slate-600">
                        {product.kategori?.nama || 'Uncategorized'}
                      </td>
                      <td className="p-4 font-bold text-slate-800">
                        Rp {parseFloat(product.harga).toLocaleString('id-ID')}
                      </td>
                      <td className="p-4">
                        <span className={`font-bold ${product.stok > 5 ? 'text-emerald-600' : 'text-rose-600'}`}>
                          {product.stok} unit
                        </span>
                      </td>
                      <td className="p-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${product.is_available ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                          {product.is_available ? 'Aktif' : 'Nonaktif'}
                        </span>
                      </td>
                      <td className="p-4 pr-6 text-right">
                        <div className="flex justify-end gap-2">
                          <button 
                            onClick={() => handleOpenEditModal(product)}
                            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDelete(product.slug)}
                            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto">
          <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden my-8">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50 sticky top-0 z-10">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <Laptop className="w-5 h-5 text-blue-600" />
                {isEditing ? 'Edit Produk' : 'Tambah Produk Baru'}
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-rose-500 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              
              {/* Image Upload Area */}
              <div className="flex justify-center mb-6">
                <div className="relative group w-32 h-32 rounded-2xl border-2 border-dashed border-slate-300 hover:border-blue-500 overflow-hidden flex flex-col items-center justify-center bg-slate-50 cursor-pointer transition">
                  {imagePreview ? (
                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover group-hover:opacity-50 transition" />
                  ) : (
                    <>
                      <ImageIcon className="w-8 h-8 text-slate-400 mb-2 group-hover:text-blue-500 transition" />
                      <span className="text-[10px] font-bold text-slate-400 group-hover:text-blue-500">Upload Gambar</span>
                    </>
                  )}
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleFileChange}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Nama Produk *</label>
                  <input 
                    type="text" 
                    value={formData.nama}
                    onChange={(e) => setFormData({...formData, nama: e.target.value})}
                    required
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-sm font-medium"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Kategori *</label>
                  <select 
                    value={formData.kategori}
                    onChange={(e) => setFormData({...formData, kategori: e.target.value})}
                    required
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-sm font-medium"
                  >
                    <option value="">-- Pilih Kategori --</option>
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.nama}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Harga (Rp) *</label>
                  <input 
                    type="number" 
                    value={formData.harga}
                    onChange={(e) => setFormData({...formData, harga: e.target.value})}
                    required
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-sm font-medium"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Stok *</label>
                  <input 
                    type="number" 
                    value={formData.stok}
                    onChange={(e) => setFormData({...formData, stok: e.target.value})}
                    required
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-sm font-medium"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Status Ketersediaan</label>
                  <select 
                    value={formData.is_available}
                    onChange={(e) => setFormData({...formData, is_available: e.target.value === 'true'})}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-sm font-medium"
                  >
                    <option value="true">Aktif</option>
                    <option value="false">Nonaktif</option>
                  </select>
                </div>
              </div>

              <div className="border-t border-slate-100 pt-4 mt-2">
                <h4 className="text-xs font-bold text-slate-800 mb-4">Spesifikasi</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Prosesor</label>
                    <input 
                      type="text" 
                      value={formData.prosesor}
                      onChange={(e) => setFormData({...formData, prosesor: e.target.value})}
                      className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-sm font-medium"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">RAM</label>
                    <input 
                      type="text" 
                      value={formData.ram}
                      onChange={(e) => setFormData({...formData, ram: e.target.value})}
                      className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-sm font-medium"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Storage</label>
                    <input 
                      type="text" 
                      value={formData.storage}
                      onChange={(e) => setFormData({...formData, storage: e.target.value})}
                      className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-sm font-medium"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Deskripsi</label>
                <textarea 
                  value={formData.deskripsi}
                  onChange={(e) => setFormData({...formData, deskripsi: e.target.value})}
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-sm font-medium"
                />
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-3 sticky bottom-0 bg-white pb-2">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition"
                >
                  Batal
                </button>
                <button 
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm font-bold rounded-xl transition shadow-lg shadow-blue-500/20 flex items-center gap-2"
                >
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  {isEditing ? 'Simpan Perubahan' : 'Tambah Produk'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminProducts;
