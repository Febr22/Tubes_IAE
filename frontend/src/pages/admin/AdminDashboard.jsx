import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LayoutDashboard, ShoppingBag, Package, TrendingUp, Users, DollarSign, Loader2, ChevronRight, Laptop } from 'lucide-react';
import adminService from '../../services/adminService';
import userService from '../../services/userService';

const AdminDashboard = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const initDashboard = async () => {
      try {
        const user = await userService.dapatkanProfil();
        if (user.role !== 'admin') {
          navigate('/');
          return;
        }
        
        const ordersData = await adminService.getAllOrders();
        setOrders(ordersData);
      } catch (err) {
        console.error("Error init dashboard:", err);
        setError("Gagal memuat data dashboard.");
      } finally {
        setLoading(false);
      }
    };
    initDashboard();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
        <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
        <p className="text-sm font-semibold text-slate-500">Memuat Dashboard...</p>
      </div>
    );
  }

  // Calculate metrics
  const totalRevenue = orders
    .filter(o => o.status !== 'dibatalkan' && o.status !== 'pending')
    .reduce((acc, curr) => acc + parseFloat(curr.total_harga || 0), 0);
  
  const pendingOrders = orders.filter(o => o.status === 'konfirmasi' || o.status === 'diproses').length;

  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-20 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center space-x-2 text-sm text-slate-500 mb-6">
          <Link to="/" className="hover:text-blue-600 transition">Beranda</Link>
          <ChevronRight className="w-4 h-4 flex-shrink-0" />
          <span className="text-slate-800 font-semibold">Dashboard Penjual</span>
        </div>

        <h1 className="text-3xl font-extrabold text-[#0A1D3C] tracking-tight mb-8">
          Ringkasan Toko
        </h1>

        {error && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl text-sm font-semibold">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Card 1: Revenue */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex items-center gap-4">
            <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center">
              <DollarSign className="w-7 h-7" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Pendapatan</p>
              <h3 className="text-2xl font-black text-slate-800 mt-1">
                Rp {totalRevenue.toLocaleString("id-ID")}
              </h3>
            </div>
          </div>

          {/* Card 2: Orders */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex items-center gap-4">
            <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
              <ShoppingBag className="w-7 h-7" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Pesanan</p>
              <h3 className="text-2xl font-black text-slate-800 mt-1">{orders.length}</h3>
            </div>
          </div>

          {/* Card 3: Pending */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex items-center gap-4">
            <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center">
              <Package className="w-7 h-7" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Perlu Diproses</p>
              <h3 className="text-2xl font-black text-slate-800 mt-1">{pendingOrders}</h3>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <h2 className="text-xl font-bold text-slate-800 mb-4">Aksi Cepat</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link 
            to="/admin/orders" 
            className="group bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:border-blue-500 hover:shadow-md transition flex items-center justify-between"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition duration-300">
                <ShoppingBag className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-slate-800">Manajemen Pesanan</h4>
                <p className="text-xs text-slate-500 mt-0.5">Kelola resi pengiriman dan status order</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-blue-500 transition" />
          </Link>

          <Link 
            to="/admin/products" 
            className="group bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:border-blue-500 hover:shadow-md transition flex items-center justify-between"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition duration-300">
                <Laptop className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-slate-800">Katalog Produk</h4>
                <p className="text-xs text-slate-500 mt-0.5">Tambah, ubah, atau hapus laptop</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-blue-500 transition" />
          </Link>
        </div>

      </div>
    </div>
  );
};

export default AdminDashboard;
