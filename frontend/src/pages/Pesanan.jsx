import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  ShoppingBag, 
  ChevronRight, 
  Calendar, 
  CreditCard, 
  Loader2, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  ArrowRight,
  Clock
} from "lucide-react";
import pembayaranService from "../services/pembayaranService";

const Pesanan = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("semua"); // semua, pending, paid
  const navigate = useNavigate();

  const BASE_URL = "http://127.0.0.1:8000";

  // Fetch orders from API
  const fetchOrders = async () => {
    try {
      setLoading(true);
      const data = await pembayaranService.dapatkanDaftarPesanan();
      setOrders(Array.isArray(data) ? data : (data.results || []));
    } catch (error) {
      console.error("Gagal memuat daftar pesanan:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem("access_token");
    if (!token) {
      navigate("/login");
      return;
    }

    fetchOrders();

    // Load Midtrans Snap script if not loaded
    const snapScriptUrl = "https://app.sandbox.midtrans.com/snap/snap.js";
    const clientKey = import.meta.env.VITE_MIDTRANS_CLIENT_KEY || "SB-Mid-client-A1b2C3d4E5f6G7h8";
    let script = document.querySelector(`script[src="${snapScriptUrl}"]`);
    if (!script) {
      script = document.createElement("script");
      script.src = snapScriptUrl;
      script.setAttribute("data-client-key", clientKey);
      script.async = true;
      document.body.appendChild(script);
    }
  }, [navigate]);

  // Handle continuing payment for pending orders
  const handlePayPending = async (orderId, existingSnapToken) => {
    try {
      let snapToken = existingSnapToken;
      
      // Jika token belum ada di database lokal, minta token baru dari backend
      if (!snapToken) {
        const snapData = await pembayaranService.dapatkanSnapToken(orderId);
        snapToken = snapData.snap_token;
      }

      if (window.snap) {
        window.snap.pay(snapToken, {
          onSuccess: async (result) => {
            console.log("Success:", result);
            await pembayaranService.cekStatusPembayaran(orderId);
            fetchOrders();
          },
          onPending: async (result) => {
            console.log("Pending:", result);
            await pembayaranService.cekStatusPembayaran(orderId);
            fetchOrders();
          },
          onError: async (result) => {
            console.error("Error:", result);
            await pembayaranService.cekStatusPembayaran(orderId);
            fetchOrders();
          },
          onClose: () => {
            console.log("Popup closed");
            fetchOrders();
          },
        });
      } else {
        alert("Midtrans SDK gagal dimuat. Refresh halaman.");
      }
    } catch (error) {
      console.error("Gagal meluncurkan Midtrans Snap:", error);
      alert("Terjadi kesalahan saat memproses pembayaran.");
    }
  };

  // Filter orders based on active tab
  const filteredOrders = orders.filter((order) => {
    if (activeTab === "pending") {
      return order.status === "pending";
    }
    if (activeTab === "paid") {
      return ["diproses", "dikirim", "selesai"].includes(order.status);
    }
    return true; // semua
  });

  // Helper to format date
  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" };
    return new Date(dateString).toLocaleDateString("id-ID", options);
  };

  // Helper to render order status badge
  const renderStatusBadge = (status) => {
    switch (status) {
      case "pending":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-full text-xs font-bold uppercase tracking-wider">
            <Clock className="w-3.5 h-3.5" /> Menunggu Pembayaran
          </span>
        );
      case "diproses":
      case "dikirim":
      case "selesai":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-xs font-bold uppercase tracking-wider">
            <CheckCircle2 className="w-3.5 h-3.5" /> Sudah Dibayar
          </span>
        );
      case "dibatalkan":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-rose-50 text-rose-700 border border-rose-200 rounded-full text-xs font-bold uppercase tracking-wider">
            <XCircle className="w-3.5 h-3.5" /> Transaksi Gagal
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-50 text-slate-700 border border-slate-200 rounded-full text-xs font-bold uppercase tracking-wider">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 pt-28 pb-20 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-5xl mx-auto">
        {/* Breadcrumb */}
        <div className="flex items-center space-x-2 text-sm text-slate-500 mb-6">
          <Link to="/" className="hover:text-blue-600 transition">Beranda</Link>
          <ChevronRight className="w-4 h-4 flex-shrink-0" />
          <span className="text-slate-800 font-semibold">Pesanan Saya</span>
        </div>

        <h1 className="text-3xl font-extrabold text-[#0A1D3C] tracking-tight mb-8">
          Riwayat Pesanan Saya
        </h1>

        {/* Tab Controls */}
        <div className="flex border-b border-slate-200 mb-8 bg-white p-1 rounded-2xl shadow-sm max-w-md">
          <button
            onClick={() => setActiveTab("semua")}
            className={`flex-1 py-3 text-center text-xs font-bold rounded-xl transition ${
              activeTab === "semua"
                ? "bg-blue-600 text-white shadow-md shadow-blue-600/10"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
            }`}
          >
            Semua
          </button>
          <button
            onClick={() => setActiveTab("pending")}
            className={`flex-1 py-3 text-center text-xs font-bold rounded-xl transition ${
              activeTab === "pending"
                ? "bg-blue-600 text-white shadow-md shadow-blue-600/10"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
            }`}
          >
            Menunggu Pembayaran
          </button>
          <button
            onClick={() => setActiveTab("paid")}
            className={`flex-1 py-3 text-center text-xs font-bold rounded-xl transition ${
              activeTab === "paid"
                ? "bg-blue-600 text-white shadow-md shadow-blue-600/10"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
            }`}
          >
            Sudah Dibayar
          </button>
        </div>

        {/* Order Cards List */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
            <p className="text-sm font-semibold text-slate-500">Memuat daftar pesanan Anda...</p>
          </div>
        ) : filteredOrders.length > 0 ? (
          <div className="space-y-6">
            {filteredOrders.map((order) => {
              // Hitung total barang dibeli
              const totalItems = order.items?.reduce((acc, item) => acc + item.jumlah, 0) || 0;

              return (
                <div 
                  key={order.id} 
                  className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden hover:shadow-md transition duration-300"
                >
                  {/* Card Header */}
                  <div className="bg-slate-50/50 px-6 py-4 border-b border-slate-100 flex flex-wrap justify-between items-center gap-4">
                    <div className="flex items-center gap-3 text-sm text-slate-600">
                      <div className="flex items-center gap-1.5 font-semibold text-slate-900">
                        <ShoppingBag className="w-4 h-4 text-blue-600" />
                        <span>Pesanan #ORDER-{order.id}</span>
                      </div>
                      <span className="text-slate-300">|</span>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>{formatDate(order.tanggal_pesan)}</span>
                      </div>
                    </div>
                    <div>
                      {renderStatusBadge(order.status)}
                    </div>
                  </div>

                  {/* Card Body - Products List */}
                  <div className="p-6 divide-y divide-slate-100">
                    {order.items?.map((item) => {
                      const imgUrl = item.laptop_gambar?.startsWith("http")
                        ? item.laptop_gambar
                        : (item.laptop_gambar ? `${BASE_URL}${item.laptop_gambar}` : null);

                      return (
                        <div key={item.id} className="py-4 first:pt-0 last:pb-0 flex gap-5 items-center">
                          {imgUrl ? (
                            <div className="w-16 h-16 bg-slate-50 border border-slate-100 rounded-xl p-1 flex-shrink-0 flex items-center justify-center overflow-hidden">
                              <img src={imgUrl} alt={item.laptop_nama} className="w-full h-full object-contain" />
                            </div>
                          ) : (
                            <div className="w-16 h-16 bg-slate-100 rounded-xl flex-shrink-0 flex items-center justify-center text-slate-400">
                              <ShoppingBag className="w-6 h-6" />
                            </div>
                          )}
                          <div className="flex-grow">
                            <h4 className="text-sm font-extrabold text-slate-800 line-clamp-1 hover:text-blue-600 transition">
                              <Link to={`/katalog/${item.laptop_slug}`}>{item.laptop_nama}</Link>
                            </h4>
                            <p className="text-xs text-slate-400 mt-0.5">
                              {item.jumlah} unit x Rp {Number(item.harga_saat_beli).toLocaleString("id-ID")}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Card Footer - Payment & Actions */}
                  <div className="px-6 py-4 bg-slate-50/20 border-t border-slate-100 flex flex-wrap justify-between items-center gap-4">
                    <div>
                      <span className="text-xs text-slate-400 block font-medium">Total Pembayaran</span>
                      {/* total_harga di database tidak termasuk biaya admin Rp 5000, tapi Midtrans gross_amount menyertakannya */}
                      <span className="text-base font-extrabold text-blue-600">
                        Rp {Number(order.payment_info?.gross_amount || (Number(order.total_harga) + 5000)).toLocaleString("id-ID")}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      {order.status === "pending" && (
                        <button
                          onClick={() => handlePayPending(order.id, order.payment_info?.snap_token)}
                          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs shadow-md shadow-blue-600/10 hover:shadow-lg transition flex items-center gap-1.5 transform active:scale-95"
                        >
                          <CreditCard className="w-3.5 h-3.5" />
                          Bayar Sekarang
                        </button>
                      )}
                      <Link
                        to={`/katalog`}
                        className="px-4 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold rounded-xl text-xs transition"
                      >
                        Beli Lagi
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white border border-slate-100 rounded-3xl p-12 text-center shadow-xl shadow-slate-100/50 max-w-md mx-auto flex flex-col items-center">
            <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 mb-4">
              <ShoppingBag className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-extrabold text-[#0A1D3C] mb-1">Belum Ada Pesanan</h3>
            <p className="text-xs text-slate-500 mb-6 leading-relaxed">
              {activeTab === "semua" 
                ? "Anda belum pernah melakukan pemesanan di UniStore." 
                : activeTab === "pending" 
                  ? "Tidak ada transaksi menunggu pembayaran." 
                  : "Belum ada pesanan dengan status berhasil dibayar."}
            </p>
            <Link
              to="/katalog"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 transition"
            >
              Mulai Belanja Sekarang <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Pesanan;
