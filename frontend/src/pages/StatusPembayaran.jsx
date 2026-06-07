import React, { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { 
  CheckCircle2, 
  Clock, 
  XCircle, 
  ShoppingBag, 
  ArrowRight, 
  Loader2, 
  AlertTriangle, 
  ChevronRight, 
  Calendar, 
  CreditCard,
  Laptop,
  Truck,
  Package
} from "lucide-react";
import pembayaranService from "../services/pembayaranService";

const StatusPembayaran = () => {
  const [searchParams] = useSearchParams();
  const rawOrderId = searchParams.get("order_id");
  const transactionStatusParam = searchParams.get("transaction_status");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [orderData, setOrderData] = useState(null);
  const [paymentData, setPaymentData] = useState(null);

  const BASE_URL = "http://127.0.0.1:8000";

  // Parse numeric order ID safely
  let orderId = null;
  if (rawOrderId) {
    const parts = rawOrderId.split("-");
    if (parts.length >= 2 && parts[0] === "ORDER") {
      orderId = parseInt(parts[1], 10);
    } else {
      orderId = parseInt(rawOrderId, 10);
    }
  }

  useEffect(() => {
    if (!orderId || isNaN(orderId)) {
      setError("ID Pesanan tidak valid atau tidak ditemukan dalam parameter.");
      setLoading(false);
      return;
    }

    const syncAndFetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // 1. Sinkronisasi status pembayaran dengan backend (memanggil Midtrans & update DB lokal)
        let payRes = null;
        try {
          payRes = await pembayaranService.cekStatusPembayaran(orderId);
          setPaymentData(payRes);
        } catch (payErr) {
          console.error("Gagal sinkronisasi status pembayaran lokal:", payErr);
          // Don't fail the whole load if only status check fails (fallback to order model status)
        }

        // 2. Ambil detail order (untuk item-item, nama produk, dll)
        const orderRes = await pembayaranService.dapatkanDetailPesanan(orderId);
        setOrderData(orderRes);
      } catch (err) {
        console.error("Gagal memuat detail transaksi:", err);
        setError("Gagal memuat detail transaksi pesanan Anda. Silakan periksa koneksi Anda.");
      } finally {
        setLoading(false);
      }
    };

    syncAndFetchData();
  }, [orderId]);

  // Determine status (combining Midtrans status and DB order status)
  const getTransactionStatus = () => {
    // Priority 1: Payment data status dari backend
    const status = paymentData?.status_transaksi?.toLowerCase() || transactionStatusParam?.toLowerCase() || orderData?.status?.toLowerCase();
    
    if (["settlement", "capture", "success", "paid"].includes(status) || paymentData?.is_lunas) {
      return "success";
    }
    if (paymentData?.metode === 'transfer' && paymentData?.bukti_bayar) {
      return "waiting_confirmation";
    }
    if (["pending"].includes(status)) {
      return "pending";
    }
    if (["deny", "cancel", "expire", "failed", "dibatalkan"].includes(status)) {
      return "failed";
    }
    return "pending"; // fallback
  };

  const status = getTransactionStatus();

  // Helper to format date
  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const options = { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" };
    return new Date(dateString).toLocaleDateString("id-ID", options);
  };

  const getOrderStep = (status) => {
    switch (status) {
      case "pending":
        return 1;
      case "konfirmasi":
      case "waiting_confirmation":
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

  const renderOrderTracking = () => {
    const orderStatus = orderData.status;
    if (orderStatus === "dibatalkan") {
      return null;
    }

    const currentStep = getOrderStep(orderStatus);
    const steps = [
      { id: 1, label: "Pesanan Dibuat", icon: ShoppingBag },
      { id: 2, label: "Menunggu Konfirmasi", icon: Clock },
      { id: 3, label: "Laptop Disiapkan", icon: Package },
      { id: 4, label: "Sedang Dikirim", icon: Truck },
      { id: 5, label: "Laptop Diterima", icon: CheckCircle2 },
    ];

    return (
      <div className="p-6 bg-slate-50/30 border-b border-slate-100">
        <h3 className="font-extrabold text-slate-800 text-sm mb-6 flex items-center gap-1.5 justify-center">
          Status Pelacakan Pesanan
        </h3>
        <div className="relative flex items-center justify-between w-full max-w-lg mx-auto px-2">
          
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

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 font-sans">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto" />
          <p className="text-sm font-semibold text-slate-500">Memeriksa status pembayaran Anda...</p>
        </div>
      </div>
    );
  }

  if (error || !orderData) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 font-sans">
        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-xl text-center max-w-md w-full">
          <AlertTriangle className="w-16 h-16 text-rose-500 mx-auto mb-4 animate-pulse" />
          <h2 className="text-2xl font-extrabold text-[#0A1D3C] mb-2 font-sans">Verifikasi Gagal</h2>
          <p className="text-slate-500 text-xs mb-8 leading-relaxed">
            {error || "Data pesanan tidak dapat ditemukan. Silakan hubungi customer service kami jika dana Anda sudah terpotong."}
          </p>
          <div className="flex flex-col gap-3">
            <Link
              to="/pesanan"
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl text-xs shadow-md shadow-blue-600/10 transition text-center"
            >
              Lihat Pesanan Saya
            </Link>
            <Link
              to="/katalog"
              className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-2xl text-xs transition text-center"
            >
              Kembali ke Katalog
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 pt-28 pb-20 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-2xl mx-auto">
        
        {/* Breadcrumb */}
        <div className="flex items-center space-x-2 text-sm text-slate-500 mb-6">
          <Link to="/" className="hover:text-blue-600 transition">Beranda</Link>
          <ChevronRight className="w-4 h-4 flex-shrink-0" />
          <Link to="/pesanan" className="hover:text-blue-600 transition">Pesanan</Link>
          <ChevronRight className="w-4 h-4 flex-shrink-0" />
          <span className="text-slate-800 font-semibold">Status Pembayaran</span>
        </div>

        {/* Status Card */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden">
          
          {/* Status Header Block */}
          <div className="p-8 text-center border-b border-slate-100">
            {status === "success" && (
              <>
                <CheckCircle2 className="w-20 h-20 text-emerald-500 mx-auto mb-4 animate-bounce" />
                <h2 className="text-2xl font-extrabold text-slate-900 mb-1">Pembayaran Berhasil!</h2>
                <p className="text-sm text-slate-500 max-w-sm mx-auto">
                  Terima kasih, dana Anda telah dikonfirmasi. Pesanan sedang kami siapkan untuk dikirim.
                </p>
              </>
            )}

            {status === "waiting_confirmation" && (
              <>
                <Clock className="w-20 h-20 text-amber-500 mx-auto mb-4 animate-pulse" />
                <h2 className="text-2xl font-extrabold text-slate-900 mb-1">Menunggu Konfirmasi Admin</h2>
                <p className="text-sm text-slate-500 max-w-sm mx-auto">
                  Bukti pembayaran manual Anda telah kami terima dan sedang diverifikasi oleh admin. Kami akan segera memperbarui status pesanan Anda.
                </p>
              </>
            )}

            {status === "pending" && (
              <>
                <Clock className="w-20 h-20 text-amber-500 mx-auto mb-4 animate-pulse" />
                <h2 className="text-2xl font-extrabold text-slate-900 mb-1">Menunggu Pembayaran</h2>
                <p className="text-sm text-slate-500 max-w-sm mx-auto">
                  Silakan selesaikan pembayaran Anda di gerai/aplikasi bank sesuai instruksi Midtrans.
                </p>
              </>
            )}

            {status === "failed" && (
              <>
                <XCircle className="w-20 h-20 text-rose-500 mx-auto mb-4" />
                <h2 className="text-2xl font-extrabold text-slate-900 mb-1">Pembayaran Gagal</h2>
                <p className="text-sm text-slate-500 max-w-sm mx-auto">
                  Transaksi Anda gagal diselesaikan atau telah kedaluwarsa. Silakan lakukan checkout kembali.
                </p>
              </>
            )}
          </div>

          {renderOrderTracking()}

          {/* Invoice Info */}
          <div className="p-6 bg-slate-50/50 border-b border-slate-100 text-xs text-slate-600 space-y-3">
            <h3 className="font-extrabold text-slate-800 text-sm mb-4 flex items-center gap-1.5">
              <CreditCard className="w-4 h-4 text-blue-600" />
              Detail Pembayaran
            </h3>
            <div className="grid grid-cols-2 gap-y-2.5">
              <span>Order ID:</span>
              <strong className="text-slate-800 text-right">#ORDER-{orderData.id}</strong>

              <span>ID Transaksi Midtrans:</span>
              <span className="text-slate-800 text-right font-medium truncate pl-4">
                {paymentData?.transaction_id || "-"}
              </span>

              <span>Tanggal Transaksi:</span>
              <span className="text-slate-800 text-right font-medium">
                {formatDate(orderData.tanggal_pesan)}
              </span>

              <span>Metode Pembayaran:</span>
              <span className="text-slate-800 text-right font-bold uppercase">
                {paymentData?.metode_pembayaran_midtrans || "Midtrans Snap"}
              </span>

              <span>Biaya Layanan:</span>
              <span className="text-slate-800 text-right font-medium">Rp 5.000</span>
            </div>
          </div>

          {/* Items Purchased */}
          <div className="p-6 divide-y divide-slate-100 border-b border-slate-100">
            <h3 className="font-extrabold text-slate-800 text-sm mb-4 flex items-center gap-1.5">
              <ShoppingBag className="w-4 h-4 text-blue-600" />
              Barang yang Dibeli
            </h3>
            {orderData.items?.map((item) => {
              const imgUrl = item.laptop_gambar?.startsWith("http")
                ? item.laptop_gambar
                : (item.laptop_gambar ? `${BASE_URL}${item.laptop_gambar}` : null);

              return (
                <div key={item.id} className="py-4 first:pt-0 last:pb-0 flex gap-4 items-center">
                  {imgUrl ? (
                    <div className="w-14 h-14 bg-slate-50 border border-slate-100 rounded-xl p-1 flex-shrink-0 flex items-center justify-center overflow-hidden">
                      <img src={imgUrl} alt={item.laptop_nama} className="w-full h-full object-contain" />
                    </div>
                  ) : (
                    <div className="w-14 h-14 bg-slate-100 rounded-xl flex-shrink-0 flex items-center justify-center text-slate-400">
                      <Laptop className="w-6 h-6" />
                    </div>
                  )}
                  <div className="flex-grow min-w-0">
                    <h4 className="text-xs font-extrabold text-slate-800 truncate">{item.laptop_nama}</h4>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      {item.jumlah} unit x Rp {Number(item.harga_saat_beli).toLocaleString("id-ID")}
                    </p>
                  </div>
                  <span className="text-xs font-extrabold text-slate-800">
                    Rp {(item.jumlah * Number(item.harga_saat_beli)).toLocaleString("id-ID")}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Grand Total */}
          <div className="p-6 bg-slate-50/20 flex justify-between items-center">
            <span className="text-xs font-bold text-slate-500">Total Pembayaran</span>
            <span className="text-xl font-extrabold text-blue-600">
              Rp {Number(paymentData?.gross_amount || (Number(orderData.total_harga) + 5000)).toLocaleString("id-ID")}
            </span>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="flex gap-4 mt-8">
          <Link
            to="/pesanan"
            className="flex-1 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl shadow-lg shadow-blue-600/10 hover:shadow-blue-600/20 text-center text-xs transition active:scale-95 flex items-center justify-center gap-1.5"
          >
            Lihat Pesanan Saya
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to="/katalog"
            className="flex-1 py-4 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold rounded-2xl text-center text-xs transition active:scale-95"
          >
            Kembali ke Katalog
          </Link>
        </div>

      </div>
    </div>
  );
};

export default StatusPembayaran;
