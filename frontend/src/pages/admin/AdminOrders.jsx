import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronRight, Package, Clock, CheckCircle, XCircle, Search, Edit2, Save, Loader2, X } from 'lucide-react';
import adminService from '../../services/adminService';
import userService from '../../services/userService';

const statusColors = {
  pending: "bg-slate-100 text-slate-700 border-slate-200",
  konfirmasi: "bg-amber-100 text-amber-700 border-amber-200",
  diproses: "bg-blue-100 text-blue-700 border-blue-200",
  dikirim: "bg-indigo-100 text-indigo-700 border-indigo-200",
  selesai: "bg-emerald-100 text-emerald-700 border-emerald-200",
  dibatalkan: "bg-rose-100 text-rose-700 border-rose-200",
};

const statusLabels = {
  pending: "Belum Dibayar",
  konfirmasi: "Menunggu Konfirmasi",
  diproses: "Diproses / Packing",
  dikirim: "Dalam Pengiriman",
  selesai: "Selesai",
  dibatalkan: "Dibatalkan"
};

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal State
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [updateStatus, setUpdateStatus] = useState('');
  const [updateResi, setUpdateResi] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  const navigate = useNavigate();

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const data = await adminService.getAllOrders();
      setOrders(data);
    } catch (err) {
      console.error(err);
      setError("Gagal memuat daftar pesanan.");
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
          fetchOrders();
        }
      } catch (err) {
        navigate('/');
      }
    };
    checkAdmin();
  }, [navigate]);

  const handleOpenModal = (order) => {
    setSelectedOrder(order);
    setUpdateStatus(order.status);
    setUpdateResi(order.resi || '');
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    setIsUpdating(true);
    try {
      await adminService.updateOrder(selectedOrder.id, {
        status: updateStatus,
        resi: updateResi
      });
      // Refresh list
      await fetchOrders();
      setSelectedOrder(null);
    } catch (err) {
      alert("Gagal mengupdate pesanan.");
    } finally {
      setIsUpdating(false);
    }
  };

  const filteredOrders = orders.filter(o => 
    o.id.toString().includes(searchTerm) || 
    (o.resi && o.resi.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading && orders.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
        <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
        <p className="text-sm font-semibold text-slate-500">Memuat Pesanan...</p>
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
          <span className="text-slate-800 font-semibold">Manajemen Pesanan</span>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <h1 className="text-3xl font-extrabold text-[#0A1D3C] tracking-tight">
            Daftar Pesanan Masuk
          </h1>
          
          <div className="relative">
            <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 transform -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Cari Order ID atau Resi..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm w-full md:w-64"
            />
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
                  <th className="p-4 pl-6">Order ID</th>
                  <th className="p-4">Tanggal</th>
                  <th className="p-4">Total Harga</th>
                  <th className="p-4">Kurir & Resi</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 pr-6 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="p-8 text-center text-slate-500">
                      Tidak ada pesanan ditemukan.
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-slate-50/50 transition">
                      <td className="p-4 pl-6 font-bold text-slate-800">#{order.id}</td>
                      <td className="p-4 text-slate-600">
                        {new Date(order.tanggal_pesan).toLocaleDateString("id-ID", {
                          day: "numeric", month: "short", year: "numeric", hour: '2-digit', minute:'2-digit'
                        })}
                      </td>
                      <td className="p-4 font-bold text-blue-600">
                        Rp {parseFloat(order.total_harga).toLocaleString('id-ID')}
                      </td>
                      <td className="p-4">
                        <div className="flex flex-col">
                          <span className="font-semibold text-slate-700 uppercase">{order.kurir || '-'}</span>
                          <span className="text-xs text-slate-500">{order.resi ? `Resi: ${order.resi}` : 'Resi belum diinput'}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold border ${statusColors[order.status] || statusColors.pending}`}>
                          {statusLabels[order.status] || order.status}
                        </span>
                      </td>
                      <td className="p-4 pr-6 text-right">
                        <button 
                          onClick={() => handleOpenModal(order)}
                          className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white rounded-lg text-xs font-bold transition"
                        >
                          <Edit2 className="w-3.5 h-3.5" /> Proses
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <Package className="w-5 h-5 text-blue-600" />
                Proses Order #{selectedOrder.id}
              </h3>
              <button 
                onClick={() => setSelectedOrder(null)}
                className="text-slate-400 hover:text-rose-500 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleUpdateSubmit} className="p-6 space-y-5">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Ubah Status</label>
                <select 
                  value={updateStatus}
                  onChange={(e) => setUpdateStatus(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-sm text-slate-700 font-medium"
                >
                  <option value="pending">Belum Dibayar</option>
                  <option value="konfirmasi">Menunggu Konfirmasi (Manual)</option>
                  <option value="diproses">Diproses / Packing (Lunas)</option>
                  <option value="dikirim">Sedang Dikirim</option>
                  <option value="selesai">Selesai (Diterima)</option>
                  <option value="dibatalkan">Dibatalkan</option>
                </select>
              </div>

              {(updateStatus === 'diproses' || updateStatus === 'dikirim' || updateStatus === 'selesai') && (
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Nomor Resi Pengiriman</label>
                  <input 
                    type="text" 
                    value={updateResi}
                    onChange={(e) => setUpdateResi(e.target.value)}
                    placeholder="Masukkan No Resi Ekspedisi"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-sm text-slate-700 font-medium"
                  />
                </div>
              )}

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
                <button 
                  type="button"
                  onClick={() => setSelectedOrder(null)}
                  className="px-4 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition"
                >
                  Batal
                </button>
                <button 
                  type="submit"
                  disabled={isUpdating}
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm font-bold rounded-xl transition shadow-lg shadow-blue-500/20 flex items-center gap-2"
                >
                  {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminOrders;
