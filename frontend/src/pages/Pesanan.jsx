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
  Clock,
  Upload,
  X,
  Image,
  Truck,
  Package
} from "lucide-react";
import pembayaranService from "../services/pembayaranService";

const Pesanan = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("semua"); // semua, pending, paid
  const navigate = useNavigate();

  const BASE_URL = "http://127.0.0.1:8000";

  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [selectedOrderForUpload, setSelectedOrderForUpload] = useState(null);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [filePreview, setFilePreview] = useState(null);

  const openUploadModal = (order) => {
    setSelectedOrderForUpload(order);
    setUploadModalOpen(true);
    if (order.payment_info?.bukti_bayar) {
      const imgUrl = order.payment_info.bukti_bayar.startsWith("http")
        ? order.payment_info.bukti_bayar
        : `${BASE_URL}${order.payment_info.bukti_bayar}`;
      setFilePreview(imgUrl);
    }
  };

  const closeUploadModal = () => {
    setUploadModalOpen(false);
    setSelectedOrderForUpload(null);
    setUploadedFile(null);
    setFilePreview(null);
    setUploading(false);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploadedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setFilePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeFile = () => {
    setUploadedFile(null);
    setFilePreview(null);
  };

  const handleUploadSubmit = async () => {
    if (!uploadedFile || !selectedOrderForUpload) return;
    try {
      setUploading(true);
      await pembayaranService.unggahBuktiBayar(selectedOrderForUpload.id, uploadedFile);
      alert("Bukti pembayaran berhasil dikirim. Menunggu verifikasi dari admin.");
      closeUploadModal();
      fetchOrders();
    } catch (error) {
      console.error(error);
      alert(error.error || "Gagal mengunggah bukti pembayaran.");
    } finally {
      setUploading(false);
    }
  };

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
    const clientKey = import.meta.env.VITE_MIDTRANS_CLIENT_KEY || "Mid-client-So7Wzz5nA-YQFaaG";
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
      return order.status === "pending" || order.status === "konfirmasi";
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
  const renderStatusBadge = (order) => {
    if (order.status === "konfirmasi" || (order.status === "pending" && order.payment_info?.bukti_bayar)) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-full text-xs font-bold uppercase tracking-wider">
          <Clock className="w-3.5 h-3.5 animate-pulse" /> Menunggu Konfirmasi
        </span>
      );
    }
    switch (order.status) {
      case "pending":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-full text-xs font-bold uppercase tracking-wider">
            <ShoppingBag className="w-3.5 h-3.5" /> Pesanan Dibuat
          </span>
        );
      case "diproses":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-full text-xs font-bold uppercase tracking-wider">
            <Loader2 className="w-3.5 h-3.5 animate-spin" /> Laptop Disiapkan
          </span>
        );
      case "dikirim":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-full text-xs font-bold uppercase tracking-wider">
            <Truck className="w-3.5 h-3.5" /> Sedang Dikirim
          </span>
        );
      case "selesai":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-xs font-bold uppercase tracking-wider">
            <CheckCircle2 className="w-3.5 h-3.5" /> Laptop Diterima
          </span>
        );
      case "dibatalkan":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-rose-50 text-rose-700 border border-rose-200 rounded-full text-xs font-bold uppercase tracking-wider">
            <XCircle className="w-3.5 h-3.5" /> Dibatalkan
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-50 text-slate-700 border border-slate-200 rounded-full text-xs font-bold uppercase tracking-wider">
            {order.status}
          </span>
        );
    }
  };

  const getOrderStep = (status) => {
    switch (status) {
      case "pending":
        return 1;
      case "konfirmasi":
        return 2;
      case "diproses":
        return 3;
      case "dikirim":
        return 4;
      case "selesai":
        return 5;
      default:
        return 1;
    }
  };

  const renderOrderTracking = (order) => {
    if (order.status === "dibatalkan") {
      return (
        <div className="bg-rose-50/50 border border-rose-100 rounded-2xl p-4 text-center mt-4 mx-6">
          <p className="text-xs font-bold text-rose-700">Pesanan Ini Telah Dibatalkan</p>
        </div>
      );
    }

    const currentStep = getOrderStep(order.status);
    const steps = [
      { id: 1, label: "Pesanan Dibuat", icon: ShoppingBag },
      { id: 2, label: "Menunggu Konfirmasi", icon: Clock },
      { id: 3, label: "Laptop Disiapkan", icon: Package },
      { id: 4, label: "Sedang Dikirim", icon: Truck },
      { id: 5, label: "Laptop Diterima", icon: CheckCircle2 },
    ];

    return (
      <div className="mt-6 pt-6 border-t border-slate-100 px-6 pb-2">
        <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-5">Status Pelacakan Pesanan</h5>
        <div className="relative flex items-center justify-between w-full max-w-xl mx-auto px-2">
          
          {/* Progress bar line */}
          <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-slate-200 -translate-y-1/2 z-0" />
          
          {/* Active progress line */}
          <div 
            className="absolute top-1/2 left-0 h-0.5 bg-blue-600 -translate-y-1/2 z-0 transition-all duration-500" 
            style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
          />

          {steps.map((step) => {
            const Icon = step.icon;
            const isCompleted = step.id < currentStep;
            const isActive = step.id === currentStep;
            
            return (
              <div key={step.id} className="relative z-10 flex flex-col items-center">
                <div 
                  className={`w-9 h-9 rounded-full flex items-center justify-center transition duration-300 relative ${
                    isCompleted 
                      ? "bg-blue-600 text-white shadow-md shadow-blue-600/10" 
                      : isActive 
                        ? "bg-blue-600 text-white shadow-md shadow-blue-600/20 ring-4 ring-blue-50" 
                        : "bg-slate-100 text-slate-400 border border-slate-200"
                  }`}
                >
                  {isActive && (
                    <span className="absolute inset-0 rounded-full bg-blue-600/30 animate-ping z-[-1]" />
                  )}
                  <Icon className="w-4 h-4" />
                </div>
                <span 
                  className={`text-[9px] font-bold mt-2 text-center max-w-[80px] leading-tight ${
                    isActive 
                      ? "text-blue-600 font-extrabold" 
                      : isCompleted 
                        ? "text-slate-800" 
                        : "text-slate-400"
                  }`}
                >
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
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
                      {renderStatusBadge(order)}
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
                    {renderOrderTracking(order)}
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
                        <>
                          {order.payment_info?.bukti_bayar ? (
                            <button
                              onClick={() => openUploadModal(order)}
                              className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl text-xs shadow-md shadow-amber-500/10 hover:shadow-lg transition flex items-center gap-1.5 transform active:scale-95 animate-pulse"
                            >
                              <Image className="w-3.5 h-3.5" />
                              Ubah Bukti Bayar
                            </button>
                          ) : (
                            <>
                              <button
                                onClick={() => handlePayPending(order.id, order.payment_info?.snap_token)}
                                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs shadow-md shadow-blue-600/10 hover:shadow-lg transition flex items-center gap-1.5 transform active:scale-95"
                              >
                                <CreditCard className="w-3.5 h-3.5" />
                                Bayar Sekarang
                              </button>
                              <button
                                onClick={() => openUploadModal(order)}
                                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl text-xs transition flex items-center gap-1.5 transform active:scale-95"
                              >
                                <Upload className="w-3.5 h-3.5" />
                                Transfer Manual
                              </button>
                            </>
                          )}
                        </>
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

      {/* Modern & Premium Upload Modal for Manual Bank Transfer */}
      {uploadModalOpen && selectedOrderForUpload && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-100 flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div>
                <h3 className="text-lg font-extrabold text-slate-900">Konfirmasi Transfer Manual</h3>
                <p className="text-xs text-slate-500 mt-1">Pesanan #ORDER-{selectedOrderForUpload.id}</p>
              </div>
              <button 
                onClick={closeUploadModal}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto space-y-6 flex-grow">
              {/* Rekening Bank */}
              <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-5 space-y-3.5">
                <h4 className="text-xs font-bold text-blue-800 uppercase tracking-wider">Rekening Pembayaran</h4>
                <div className="space-y-2.5">
                  <div className="flex justify-between items-center bg-white p-3 rounded-xl border border-blue-50/50">
                    <div>
                      <span className="text-[10px] text-slate-400 block font-medium">BANK BCA</span>
                      <span className="text-sm font-bold text-slate-800 tracking-wide">1234567890</span>
                    </div>
                    <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-1 rounded-lg font-bold uppercase">a/n UniStore</span>
                  </div>
                  <div className="flex justify-between items-center bg-white p-3 rounded-xl border border-blue-50/50">
                    <div>
                      <span className="text-[10px] text-slate-400 block font-medium">BANK MANDIRI</span>
                      <span className="text-sm font-bold text-slate-800 tracking-wide">9876543210</span>
                    </div>
                    <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-1 rounded-lg font-bold uppercase">a/n UniStore</span>
                  </div>
                </div>
                <div className="pt-2 border-t border-blue-100 flex justify-between items-center text-xs text-slate-600">
                  <span>Jumlah Transfer:</span>
                  <strong className="text-blue-700 text-sm font-extrabold">
                    Rp {Number(selectedOrderForUpload.payment_info?.gross_amount || (Number(selectedOrderForUpload.total_harga) + 5000)).toLocaleString("id-ID")}
                  </strong>
                </div>
              </div>

              {/* Upload Form */}
              <div className="space-y-3">
                <label className="text-xs font-bold text-slate-700 block">Unggah Bukti Transfer (Format Gambar)</label>
                
                {!filePreview ? (
                  <div className="border-2 border-dashed border-slate-200 hover:border-blue-500 rounded-2xl p-8 text-center transition cursor-pointer bg-slate-50/50 flex flex-col items-center justify-center relative min-h-[160px]">
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleFileChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <Upload className="w-10 h-10 text-slate-400 mb-3" />
                    <p className="text-xs font-bold text-slate-700 mb-1">Pilih Berkas atau Tarik ke Sini</p>
                    <p className="text-[10px] text-slate-400">Mendukung file PNG, JPG, JPEG (Max. 5MB)</p>
                  </div>
                ) : (
                  <div className="relative rounded-2xl border border-slate-200 overflow-hidden bg-slate-50 flex items-center justify-center p-2 group min-h-[160px]">
                    <img 
                      src={filePreview} 
                      alt="Pratinjau bukti bayar" 
                      className="max-h-56 object-contain rounded-xl"
                    />
                    <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition duration-200">
                      <button
                        onClick={removeFile}
                        className="bg-white/95 hover:bg-white text-rose-600 px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-1.5 shadow transition"
                      >
                        <X className="w-4 h-4" /> Hapus Gambar
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-slate-100 flex gap-4 bg-slate-50/50">
              <button 
                onClick={closeUploadModal}
                disabled={uploading}
                className="flex-1 py-3 border border-slate-200 hover:bg-slate-50 disabled:bg-slate-100 disabled:text-slate-400 text-slate-700 font-bold rounded-2xl text-xs transition"
              >
                Batal
              </button>
              <button 
                onClick={handleUploadSubmit}
                disabled={uploading || !uploadedFile}
                className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white font-bold rounded-2xl text-xs transition flex items-center justify-center gap-1.5 shadow-md shadow-blue-600/10"
              >
                {uploading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Mengirim...
                  </>
                ) : (
                  "Kirim Bukti Pembayaran"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Pesanan;
