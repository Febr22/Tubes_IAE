import React, { useState, useEffect } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { CreditCard, ShoppingBag, ArrowLeft, Loader2, CheckCircle2, AlertTriangle, XCircle, FileText } from "lucide-react";
import pembayaranService from "../services/pembayaranService";
import { useCart } from "../context/CartContext";

const Pemesanan = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { clearCart } = useCart();

  // Normalisasi data: support baik single-product (DetailProduk) maupun multi-product (Cart)
  const items = state?.items 
    ? state.items 
    : (state?.produk ? [{ ...state.produk, qty: state.qty }] : []);

  const discount = state?.discount || 0;
  const voucherCode = state?.voucherCode || null;

  const [catatan, setCatatan] = useState("");
  const [loading, setLoading] = useState(false);
  const [statusTransaksi, setStatusTransaksi] = useState(null); // 'success' | 'pending' | 'error' | 'closed'
  const [detailBayar, setDetailBayar] = useState(null); // Data hasil pengecekan status dari backend
  const [orderId, setOrderId] = useState(null);


  // URL Dasar untuk Gambar
  const BASE_URL = "http://127.0.0.1:8000";

  // Load Midtrans Snap Script secara dinamis saat halaman dibuka
  useEffect(() => {
    const snapScriptUrl = "https://app.sandbox.midtrans.com/snap/snap.js";
    const clientKey = import.meta.env.VITE_MIDTRANS_CLIENT_KEY || "SB-Mid-client-A1b2C3d4E5f6G7h8";

    // Cek apakah script sudah ada
    let script = document.querySelector(`script[src="${snapScriptUrl}"]`);
    if (!script) {
      script = document.createElement("script");
      script.src = snapScriptUrl;
      script.setAttribute("data-client-key", clientKey);
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  // Cek apakah user sudah login
  const token = localStorage.getItem("access_token");
  if (!token) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 font-sans">
        <div className="bg-white p-8 rounded-2xl shadow-md text-center max-w-md w-full">
          <AlertTriangle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Akses Terbatas</h2>
          <p className="text-gray-600 mb-6">
            Anda harus login terlebih dahulu untuk melakukan pemesanan produk laptop.
          </p>
          <button
            onClick={() => navigate("/login")}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition duration-200"
          >
            Login Sekarang
          </button>
        </div>
      </div>
    );
  }

  // Cek apakah data produk tersedia
  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 font-sans">
        <div className="bg-white p-8 rounded-2xl shadow-md text-center max-w-md w-full">
          <ShoppingBag className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Keranjang Kosong</h2>
          <p className="text-gray-600 mb-6">
            Tidak ada produk yang dipilih. Silakan kembali ke katalog untuk berbelanja.
          </p>
          <Link
            to="/katalog"
            className="inline-block w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition duration-200"
          >
            Lihat Katalog
          </Link>
        </div>
      </div>
    );
  }

  const subtotal = items.reduce((acc, item) => acc + Number(item.harga) * item.qty, 0);
  const biayaLayanan = 5000; // Contoh biaya administrasi
  const total = subtotal - discount + biayaLayanan;

  const handleCheckout = async () => {
    setLoading(true);
    setStatusTransaksi(null);
    setDetailBayar(null);

    try {
      // Format items_input sesuai spesifikasi serializer baru
      const itemsInput = items.map(item => ({
        laptop_id: item.id,
        jumlah: item.qty
      }));

      // 1. Buat Order Baru di Backend
      const order = await pembayaranService.buatOrder({
        items_input: itemsInput,
        catatan: catatan,
        discount: discount // Kirim nominal diskon voucher
      });

      const newOrderId = order.id;
      setOrderId(newOrderId);

      // 2. Minta Token Snap dari Backend berdasarkan orderId
      const snapData = await pembayaranService.dapatkanSnapToken(newOrderId);
      const snapToken = snapData.snap_token;

      // 3. Panggil Popup Midtrans Snap
      if (window.snap) {
        window.snap.pay(snapToken, {
          onSuccess: async (result) => {
            console.log("Success:", result);
            setStatusTransaksi("success");
            clearCart(); // Kosongkan keranjang belanja
            // Sinkronisasi status ke backend
            try {
              const res = await pembayaranService.cekStatusPembayaran(newOrderId);
              setDetailBayar(res);
            } catch (err) {
              console.error("Gagal update status lokal:", err);
            }
          },
          onPending: async (result) => {
            console.log("Pending:", result);
            setStatusTransaksi("pending");
            clearCart(); // Kosongkan keranjang belanja
            try {
              const res = await pembayaranService.cekStatusPembayaran(newOrderId);
              setDetailBayar(res);
            } catch (err) {
              console.error("Gagal update status lokal:", err);
            }
          },
          onError: async (result) => {
            console.error("Error:", result);
            setStatusTransaksi("error");
            try {
              const res = await pembayaranService.cekStatusPembayaran(newOrderId);
              setDetailBayar(res);
            } catch (err) {
              console.error("Gagal update status lokal:", err);
            }
          },
          onClose: () => {
            console.log("Customer closed the popup without finishing the payment");
            setStatusTransaksi("closed");
          },
        });
      } else {
        alert("Midtrans SDK gagal dimuat. Coba refresh halaman.");
      }
    } catch (error) {
      console.error("Proses checkout gagal:", error);
      alert(error.error || "Gagal memproses checkout. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 py-28 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-5xl mx-auto">
        {/* Header/Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-800 transition mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Kembali
        </button>

        <h1 className="text-3xl font-extrabold text-[#0A1D3C] mb-8 tracking-tight">
          Checkout Pesanan
        </h1>

        {/* Tampilan Status Pembayaran jika sudah interaksi dengan Midtrans */}
        {statusTransaksi && (
          <div className="mb-8 p-6 rounded-3xl border bg-white shadow-xl shadow-slate-100/50 animate-in fade-in slide-in-from-top-4 duration-300">
            {statusTransaksi === "success" && (
              <div className="flex flex-col items-center text-center">
                <CheckCircle2 className="w-16 h-16 text-emerald-500 mb-4 animate-bounce" />
                <h3 className="text-2xl font-bold text-slate-900 mb-2">Pembayaran Berhasil!</h3>
                <p className="text-slate-600 max-w-md mb-4">
                  Terima kasih, pembayaran Anda telah kami terima. Status pesanan Anda saat ini adalah:
                  <span className="font-semibold text-emerald-600"> Lunas / Sedang Diproses</span>.
                </p>
                {detailBayar && (
                  <div className="w-full max-w-sm bg-slate-50 p-4 rounded-xl text-left text-sm text-slate-600 space-y-2 border border-slate-100">
                    <p className="flex justify-between">
                      <span>Order ID Midtrans:</span>
                      <strong className="text-slate-800">{detailBayar.midtrans_order_id}</strong>
                    </p>
                    <p className="flex justify-between">
                      <span>Metode Bayar:</span>
                      <strong className="text-slate-800 uppercase">{detailBayar.metode_pembayaran_midtrans}</strong>
                    </p>
                    <p className="flex justify-between">
                      <span>Total Bayar:</span>
                      <strong className="text-slate-800">Rp {Number(detailBayar.gross_amount).toLocaleString("id-ID")}</strong>
                    </p>
                  </div>
                )}
                <div className="flex gap-4 mt-6">
                  <Link to="/pesanan" className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition shadow-lg shadow-blue-600/15">
                    Lihat Pesanan Saya
                  </Link>
                  <Link to="/katalog" className="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl font-bold transition">
                    Belanja Lagi
                  </Link>
                </div>
              </div>
            )}

            {statusTransaksi === "pending" && (
              <div className="flex flex-col items-center text-center">
                <AlertTriangle className="w-16 h-16 text-amber-500 mb-4" />
                <h3 className="text-2xl font-bold text-slate-900 mb-2">Menunggu Pembayaran</h3>
                <p className="text-slate-600 max-w-md mb-4">
                  Selesaikan pembayaran Anda sesuai dengan instruksi yang tertera di aplikasi Midtrans.
                </p>
                {detailBayar && (
                  <div className="w-full max-w-sm bg-slate-50 p-4 rounded-xl text-left text-sm text-slate-600 space-y-2 border border-slate-100">
                    <p className="flex justify-between">
                      <span>Order ID:</span>
                      <strong className="text-slate-800">#ORDER-{orderId}</strong>
                    </p>
                    <p className="flex justify-between">
                      <span>Status:</span>
                      <strong className="text-amber-600 uppercase font-bold">{detailBayar.status_transaksi}</strong>
                    </p>
                  </div>
                )}
                <div className="flex gap-4 mt-6">
                  <Link to="/pesanan" className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition shadow-lg shadow-blue-600/15">
                    Lihat Status Pembayaran
                  </Link>
                </div>
              </div>
            )}

            {statusTransaksi === "error" && (
              <div className="flex flex-col items-center text-center">
                <XCircle className="w-16 h-16 text-rose-500 mb-4" />
                <h3 className="text-2xl font-bold text-slate-900 mb-2">Pembayaran Gagal</h3>
                <p className="text-slate-600 max-w-md mb-6">
                  Mohon maaf, transaksi Anda gagal diproses oleh sistem. Silakan coba checkout kembali.
                </p>
                <button
                  onClick={handleCheckout}
                  className="px-6 py-2.5 bg-rose-600 text-white rounded-xl font-bold hover:bg-rose-700 transition shadow-lg shadow-rose-600/15"
                >
                  Coba Lagi
                </button>
              </div>
            )}

            {statusTransaksi === "closed" && (
              <div className="flex flex-col items-center text-center">
                <AlertTriangle className="w-16 h-16 text-slate-400 mb-4" />
                <h3 className="text-2xl font-bold text-slate-900 mb-2">Transaksi Tertutup</h3>
                <p className="text-slate-600 max-w-md mb-6">
                  Anda menutup popup pembayaran sebelum menyelesaikan transaksi. Tekan tombol di bawah untuk melanjutkan pembayaran.
                </p>
                <button
                  onClick={handleCheckout}
                  className="px-6 py-2.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-600/15"
                >
                  Lanjutkan Pembayaran
                </button>
              </div>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Bagian Kiri: List Produk & Catatan */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Kartu Daftar Produk */}
            <div className="space-y-4">
              {items.map((item) => (
                <div 
                  key={item.id} 
                  className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm hover:shadow-md transition duration-200 flex gap-5 items-center"
                >
                  <div className="w-20 h-20 bg-slate-50 border border-slate-100/50 p-1.5 rounded-xl flex-shrink-0 flex items-center justify-center overflow-hidden">
                    <img
                      src={
                        item.gambar?.startsWith("http")
                          ? item.gambar
                          : `${BASE_URL}${item.gambar}`
                      }
                      alt={item.nama}
                      className="w-full h-full object-contain rounded-lg"
                    />
                  </div>

                  <div className="flex-grow min-w-0">
                    <span className="inline-block px-2 py-0.5 bg-blue-50 text-blue-700 rounded-lg text-[9px] font-bold uppercase tracking-wider mb-1">
                      {item.prosesor || "Laptop"}
                    </span>
                    <h2 className="text-sm font-extrabold text-slate-800 truncate mb-0.5">{item.nama}</h2>
                    <p className="text-slate-400 text-xs truncate">
                      {item.ram} | {item.storage}
                    </p>

                    <div className="flex justify-between items-baseline mt-2.5 pt-2 border-t border-slate-50 text-xs">
                      <div className="text-slate-500">
                        <span>{item.qty} unit</span>
                        <span className="mx-2 text-slate-200">|</span>
                        <span>Rp {Number(item.harga).toLocaleString("id-ID")}</span>
                      </div>
                      <span className="font-extrabold text-slate-800">
                        Rp {(Number(item.harga) * item.qty).toLocaleString("id-ID")}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Form Catatan */}
            <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <FileText className="w-5 h-5 text-slate-500" />
                <h3 className="text-sm font-bold text-slate-800">Catatan untuk Penjual (Opsional)</h3>
              </div>
              <textarea
                value={catatan}
                onChange={(e) => setCatatan(e.target.value)}
                placeholder="Contoh: Tolong packing kayu + bubble wrap ekstra ya min..."
                rows={3}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-xs text-slate-600 transition placeholder:text-slate-400"
              />
            </div>
          </div>

          {/* Bagian Kanan: Ringkasan Belanja & Tombol Bayar (Sticky) */}
          <div className="lg:col-span-1 lg:sticky lg:top-28 space-y-6">
            <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
              <h2 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-4 mb-4">
                Ringkasan Belanja
              </h2>

              <div className="space-y-3.5 text-xs text-slate-600">
                <div className="flex justify-between">
                  <span>Total Harga ({items.reduce((acc, item) => acc + item.qty, 0)} barang)</span>
                  <span className="font-semibold text-slate-800">Rp {subtotal.toLocaleString("id-ID")}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-green-600 font-semibold">
                    <span>Diskon Voucher</span>
                    <span>- Rp {discount.toLocaleString("id-ID")}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Biaya Layanan</span>
                  <span className="font-semibold text-slate-800">Rp {biayaLayanan.toLocaleString("id-ID")}</span>
                </div>

                <div className="border-t border-slate-100 my-4 pt-4"></div>

                <div className="flex justify-between items-baseline text-slate-800">
                  <span className="text-xs font-bold">Total Pembayaran</span>
                  <span className="text-xl font-extrabold text-blue-600">
                    Rp {total.toLocaleString("id-ID")}
                  </span>
                </div>
              </div>

              {/* Tombol Aksi */}
              <button
                onClick={handleCheckout}
                disabled={loading}
                className="w-full mt-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-slate-300 disabled:to-slate-400 text-white py-4 rounded-xl font-bold transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-blue-600/10 hover:shadow-blue-600/25 transform active:scale-95 hover:scale-[1.02]"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Memproses...
                  </>
                ) : (
                  <>
                    <CreditCard className="w-4 h-4" />
                    Bayar Sekarang
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Pemesanan;