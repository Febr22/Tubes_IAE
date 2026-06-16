import React, { useState, useEffect } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { 
  CreditCard, ShoppingBag, ArrowLeft, Loader2, CheckCircle2, 
  AlertTriangle, XCircle, FileText, MapPin, X 
} from "lucide-react";
import pembayaranService from "../services/pembayaranService";
import userService from "../services/userService"; // Pastikan path ini benar
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

  // State untuk Alamat (Shopee Style)
  const [daftarAlamat, setDaftarAlamat] = useState([]);
  const [alamatDipilih, setAlamatDipilih] = useState(null);
  const [isModalAlamatOpen, setIsModalAlamatOpen] = useState(false);
  const [loadingAlamat, setLoadingAlamat] = useState(true);

  const [catatan, setCatatan] = useState("");
  const [loading, setLoading] = useState(false);
  const [statusTransaksi, setStatusTransaksi] = useState(null); // 'success' | 'pending' | 'error' | 'closed'
  const [detailBayar, setDetailBayar] = useState(null); // Data hasil pengecekan status dari backend
  const [orderId, setOrderId] = useState(null);

  // URL Dasar untuk Gambar
  const BASE_URL = "http://127.0.0.1:8000";

  // Load Midtrans Snap Script dan Data Alamat saat halaman dibuka
  useEffect(() => {
    // 1. Load Midtrans
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

    // 2. Load Data Alamat
    const token = localStorage.getItem("access_token");
    if (token) {
      const fetchAlamat = async () => {
        try {
          const data = await userService.getDaftarAlamat();
          setDaftarAlamat(data);
          // Auto-select alamat utama jika ada
          if (data && data.length > 0) {
            const utama = data.find(item => item.is_utama);
            setAlamatDipilih(utama || data[0]);
          }
        } catch (error) {
          console.error("Gagal mengambil data alamat:", error);
        } finally {
          setLoadingAlamat(false);
        }
      };
      fetchAlamat();
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
  const biayaLayanan = 5000;
  const total = subtotal - discount + biayaLayanan;

  const handleCheckout = async () => {
    if (!alamatDipilih) {
      alert("Silakan pilih alamat pengiriman terlebih dahulu.");
      return;
    }

    setLoading(true);
    setStatusTransaksi(null);
    setDetailBayar(null);

    try {
      const itemsInput = items.map(item => ({
        laptop_id: item.id,
        jumlah: item.qty
      }));

      // 1. Buat Order Baru di Backend
      const order = await pembayaranService.buatOrder({
        items_input: itemsInput,
        catatan: catatan,
        discount: discount,
        alamat_pengiriman_id: alamatDipilih.id // Mengirimkan ID alamat ke backend
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
            clearCart();
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
            clearCart();
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
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-800 transition mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Kembali
        </button>

        <h1 className="text-3xl font-extrabold text-[#0A1D3C] mb-8 tracking-tight">
          Checkout Pesanan
        </h1>

        {statusTransaksi && (
          <div className="mb-8 p-6 rounded-3xl border bg-white shadow-xl shadow-slate-100/50 animate-in fade-in slide-in-from-top-4 duration-300">
            {/* Status Transaksi UI - Tetap Sama */}
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
          <div className="lg:col-span-2 space-y-6">
            
            {/* BLOK ALAMAT PENGIRIMAN */}
            <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
              <div className="flex justify-between items-center border-b border-slate-50 pb-4 mb-4">
                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-blue-600" />
                  Alamat Pengiriman
                </h3>
                {!loadingAlamat && (
                  <button 
                    type="button"
                    onClick={() => setIsModalAlamatOpen(true)}
                    className="text-xs font-bold text-blue-600 hover:text-blue-700 transition"
                  >
                    {alamatDipilih ? "Ubah Alamat" : "Pilih Alamat"}
                  </button>
                )}
              </div>

              {loadingAlamat ? (
                <div className="flex items-center gap-2 text-slate-400 text-xs py-2">
                  <Loader2 className="w-4 h-4 animate-spin" /> Memuat alamat...
                </div>
              ) : alamatDipilih ? (
                <div className="text-xs text-slate-600 space-y-1">
                  <div className="flex items-center gap-2 text-slate-800 mb-1.5">
                    <strong className="font-bold">{alamatDipilih.nama_penerima}</strong>
                    <span className="text-slate-400">|</span>
                    <span>{alamatDipilih.no_telepon}</span>
                    {alamatDipilih.is_utama && (
                      <span className="px-1.5 py-0.5 bg-blue-50 text-blue-600 font-bold rounded text-[9px] uppercase tracking-wider">
                        Utama
                      </span>
                    )}
                  </div>
                  <p className="leading-relaxed">
                    {alamatDipilih.alamat_lengkap}, {alamatDipilih.kota_kabupaten}, {alamatDipilih.provinsi}, {alamatDipilih.kode_pos}
                  </p>
                </div>
              ) : (
                <div className="text-center py-4 bg-rose-50/50 rounded-xl border border-rose-100">
                  <p className="text-xs text-rose-500 mb-3 font-semibold">Kamu belum menentukan alamat pengiriman.</p>
                  <button
                    type="button"
                    onClick={() => setIsModalAlamatOpen(true)}
                    className="px-4 py-2 bg-white border border-rose-200 text-rose-600 hover:bg-rose-50 font-bold rounded-xl text-xs transition"
                  >
                    + Tambah / Pilih Alamat
                  </button>
                </div>
              )}
            </div>

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

              <button
                onClick={handleCheckout}
                disabled={loading || !alamatDipilih}
                className={`w-full mt-6 py-4 rounded-xl font-bold transition-all duration-300 flex items-center justify-center gap-2 shadow-lg ${
                  alamatDipilih 
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-slate-300 disabled:to-slate-400 text-white shadow-blue-600/10 hover:shadow-blue-600/25 transform active:scale-95 hover:scale-[1.02]' 
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                }`}
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
              {!alamatDipilih && (
                <p className="text-[10px] text-center text-rose-500 mt-2 font-semibold">
                  *Pilih alamat pengiriman terlebih dahulu
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* MODAL PILIH ALAMAT (Shopee Style) */}
      {isModalAlamatOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-xl max-h-[80vh] flex flex-col shadow-2xl animate-in fade-in zoom-in duration-200">
            
            {/* Header Modal */}
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h4 className="font-extrabold text-slate-900 text-base">Pilih Alamat Pengiriman</h4>
              <button onClick={() => setIsModalAlamatOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Konten Daftar Alamat */}
            <div className="p-6 overflow-y-auto flex-1 space-y-4">
              {daftarAlamat.length === 0 ? (
                <div className="text-center py-8 text-slate-500 text-sm">
                  Kamu belum memiliki alamat tersimpan.
                </div>
              ) : (
                daftarAlamat.map((item) => (
                  <div 
                    key={item.id}
                    onClick={() => {
                      setAlamatDipilih(item);
                      setIsModalAlamatOpen(false);
                    }}
                    className={`p-4 rounded-2xl border-2 text-xs text-slate-600 cursor-pointer transition flex items-start gap-3 ${
                      alamatDipilih?.id === item.id 
                        ? 'border-blue-500 bg-blue-50/20' 
                        : 'border-slate-100 hover:border-slate-200 bg-white'
                    }`}
                  >
                    <input 
                      type="radio" 
                      checked={alamatDipilih?.id === item.id}
                      onChange={() => {}} // Di-handle oleh onClick induk div
                      className="mt-0.5 text-blue-600 focus:ring-blue-500"
                    />
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2 text-slate-800">
                        <strong className="font-bold">{item.nama_penerima}</strong>
                        <span className="text-slate-400">|</span>
                        <span>{item.no_telepon}</span>
                        {item.is_utama && (
                          <span className="px-1.5 py-0.5 bg-blue-50 text-blue-700 font-bold rounded text-[9px]">UTAMA</span>
                        )}
                      </div>
                      <p className="leading-relaxed">
                        {item.alamat_lengkap}, {item.kota_kabupaten}, {item.provinsi}, {item.kode_pos}
                      </p>
                    </div>
                  </div>
                ))
              )}

              {/* Tombol Tambah Alamat Baru di Dalam Modal */}
              <button 
                onClick={() => navigate('/profil')} 
                className="w-full py-3 border-2 border-dashed border-slate-200 hover:border-blue-400 hover:bg-blue-50 hover:text-blue-600 rounded-2xl text-center text-xs font-bold text-slate-500 transition"
              >
                + Tambah Alamat Baru (Kelola di Profil)
              </button>
            </div>

            {/* Footer Modal */}
            <div className="p-6 border-t border-slate-100 flex justify-end gap-3 bg-slate-50 rounded-b-3xl">
              <button 
                onClick={() => setIsModalAlamatOpen(false)}
                className="px-5 py-2.5 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-xl transition"
              >
                Tutup
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default Pemesanan;