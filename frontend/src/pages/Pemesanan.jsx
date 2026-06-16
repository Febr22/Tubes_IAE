import React, { useState, useEffect } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { CreditCard, ShoppingBag, ArrowLeft, Loader2, CheckCircle2, AlertTriangle, XCircle, FileText, Truck } from "lucide-react";
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

  // State Pengiriman
  const [lokasiData, setLokasiData] = useState([]);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [lokasiTerpilih, setLokasiTerpilih] = useState(null);
  
  const [alamatLengkap, setAlamatLengkap] = useState("");
  const [kurir, setKurir] = useState("");
  const [layananList, setLayananList] = useState([]);
  const [layananPilih, setLayananPilih] = useState(null);
  const [ongkir, setOngkir] = useState(0);
  const [loadingOngkir, setLoadingOngkir] = useState(false);

  // URL Dasar untuk Gambar
  const BASE_URL = "http://127.0.0.1:8000";

  // Load Midtrans Snap Script
  useEffect(() => {
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
  }, []);

  // Debounce search lokasi
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchKeyword.length >= 3) {
        setSearchLoading(true);
        setSearchError("");
        try {
          const res = await pembayaranService.cariLokasi(searchKeyword);
          if(res.data) setLokasiData(res.data);
        } catch (err) {
          console.error("Gagal load lokasi", err);
          setSearchError(err.error || err.detail || err.message || "Gagal menghubungi server");
        } finally {
          setSearchLoading(false);
        }
      } else {
        setLokasiData([]);
        setSearchError("");
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchKeyword]);

  // Fetch Ongkir ketika lokasi dan kurir berubah
  useEffect(() => {
    if (lokasiTerpilih && kurir) {
      const fetchOngkir = async () => {
        setLoadingOngkir(true);
        setLayananList([]);
        setLayananPilih(null);
        setOngkir(0);
        try {
          const res = await pembayaranService.cekOngkir({
            destination: lokasiTerpilih.id,
            courier: kurir
          });
          if (res.results && res.results.length > 0) {
            // Komerce mereturn response sedikit berbeda
            // Misalnya results: [{cost: 15000, service: 'REG', ...}]
            // Tapi kita akan handle jika bentuknya mirip
            const costsData = res.results[0].costs || res.results;
            setLayananList(costsData);
          }
        } catch (err) {
          console.error("Gagal cek ongkir", err);
        } finally {
          setLoadingOngkir(false);
        }
      };
      fetchOngkir();
    }
  }, [lokasiTerpilih, kurir]);

  const handleLayananChange = (e) => {
    const selected = layananList.find(l => l.service === e.target.value);
    setLayananPilih(selected);
    if (selected) {
      // Struktur Komerce mungkin langsung di selected.cost atau di array
      if (selected.cost !== undefined && !Array.isArray(selected.cost)) {
        setOngkir(selected.cost);
      } else if (selected.cost && selected.cost.length > 0) {
        setOngkir(selected.cost[0].value);
      } else {
        setOngkir(0);
      }
    } else {
      setOngkir(0);
    }
  };

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
  const total = subtotal - discount + biayaLayanan + ongkir;

  const handleCheckout = async () => {
    if (!lokasiTerpilih || !alamatLengkap || !kurir || !layananPilih) {
      alert("Mohon lengkapi data alamat pengiriman dan pilih kurir.");
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

      // Memisah nama lokasi jika formatnya "Kecamatan, Kota, Provinsi"
      const lokasiNames = lokasiTerpilih.name ? lokasiTerpilih.name.split(', ') : ["", ""];
      const kotaName = lokasiNames.length > 1 ? lokasiNames[1] : lokasiTerpilih.name;
      const provinsiName = lokasiNames.length > 2 ? lokasiNames[2] : "";

      const order = await pembayaranService.buatOrder({
        items_input: itemsInput,
        catatan: catatan,
        discount: discount,
        alamat_pengiriman: alamatLengkap,
        provinsi: provinsiName,
        kota: kotaName,
        kurir: kurir,
        layanan: layananPilih.service,
        ongkos_kirim: ongkir
      });

      const newOrderId = order.id;
      setOrderId(newOrderId);

      const snapData = await pembayaranService.dapatkanSnapToken(newOrderId);
      const snapToken = snapData.snap_token;

      if (window.snap) {
        window.snap.pay(snapToken, {
          onSuccess: async (result) => {
            setStatusTransaksi("success");
            clearCart();
            try {
              const res = await pembayaranService.cekStatusPembayaran(newOrderId);
              setDetailBayar(res);
            } catch (err) { console.error(err); }
          },
          onPending: async (result) => {
            setStatusTransaksi("pending");
            clearCart();
            try {
              const res = await pembayaranService.cekStatusPembayaran(newOrderId);
              setDetailBayar(res);
            } catch (err) { console.error(err); }
          },
          onError: async (result) => {
            setStatusTransaksi("error");
            try {
              const res = await pembayaranService.cekStatusPembayaran(newOrderId);
              setDetailBayar(res);
            } catch (err) { console.error(err); }
          },
          onClose: () => {
            setStatusTransaksi("closed");
          },
        });
      } else {
        alert("Midtrans SDK gagal dimuat. Coba refresh halaman.");
      }
    } catch (error) {
      console.error("Proses checkout gagal:", error);
      let errorMsg = "Gagal memproses checkout. Silakan coba lagi.";
      if (typeof error === 'string') {
          errorMsg = error;
      } else if (error && typeof error === 'object') {
          if (error.error) errorMsg = error.error;
          else if (error.detail) errorMsg = error.detail;
          else if (Object.keys(error).length > 0) {
              // Extract validation errors
              const firstKey = Object.keys(error)[0];
              errorMsg = `${firstKey}: ${error[firstKey]}`;
          }
      }
      alert(errorMsg);
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

            {/* Form Pengiriman */}
            <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <Truck className="w-5 h-5 text-slate-500" />
                <h3 className="text-sm font-bold text-slate-800">Alamat Pengiriman & Kurir</h3>
              </div>
              <div className="space-y-4">
                <textarea
                  value={alamatLengkap}
                  onChange={(e) => setAlamatLengkap(e.target.value)}
                  placeholder="Alamat lengkap (Nama jalan, RT/RW, Patokan)..."
                  rows={2}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-xs text-slate-600 transition placeholder:text-slate-400"
                />
                
                <div className="relative">
                  <div className="flex gap-2 items-center w-full px-4 py-3 rounded-xl border border-slate-200 bg-white">
                    <input 
                      type="text"
                      placeholder="Cari Kecamatan atau Kota..."
                      value={lokasiTerpilih ? lokasiTerpilih.name : searchKeyword}
                      onChange={(e) => {
                        setLokasiTerpilih(null);
                        setSearchKeyword(e.target.value);
                      }}
                      className="w-full focus:outline-none text-xs text-slate-600"
                    />
                    {searchLoading && <Loader2 className="w-4 h-4 text-slate-400 animate-spin" />}
                  </div>
                  
                  {!lokasiTerpilih && searchKeyword.length >= 3 && lokasiData.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg max-h-48 overflow-y-auto">
                      {lokasiData.map((lokasi) => (
                        <div 
                          key={lokasi.id}
                          className="px-4 py-3 text-xs text-slate-700 hover:bg-slate-50 cursor-pointer border-b border-slate-50 last:border-0"
                          onClick={() => {
                            setLokasiTerpilih(lokasi);
                            setSearchKeyword("");
                            setLokasiData([]);
                            setOngkir(0);
                            setLayananPilih(null);
                          }}
                        >
                          {lokasi.name}
                        </div>
                      ))}
                    </div>
                  )}
                  {!lokasiTerpilih && searchKeyword.length >= 3 && !searchLoading && lokasiData.length === 0 && !searchError && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg p-3 text-xs text-slate-500 text-center">
                      Tidak ada hasil ditemukan
                    </div>
                  )}
                  {searchError && (
                    <div className="absolute z-10 w-full mt-1 bg-rose-50 border border-rose-200 rounded-xl shadow-lg p-3 text-xs font-bold text-rose-600 text-center">
                      {searchError}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <select 
                    value={kurir} 
                    onChange={(e) => { setKurir(e.target.value); setOngkir(0); }}
                    disabled={!lokasiTerpilih}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-xs text-slate-600 disabled:opacity-50"
                  >
                    <option value="">-- Pilih Kurir --</option>
                    <option value="jne">JNE</option>
                    <option value="sicepat">SiCepat</option>
                    <option value="jnt">J&T Express</option>
                  </select>

                  <select 
                    value={layananPilih?.service || ""} 
                    onChange={handleLayananChange}
                    disabled={!kurir || loadingOngkir || layananList.length === 0}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-xs text-slate-600 disabled:opacity-50"
                  >
                    <option value="">{loadingOngkir ? "Memuat..." : "-- Pilih Layanan --"}</option>
                    {layananList.map(l => (
                      <option key={l.service} value={l.service}>
                        {l.service} - Rp {l.cost !== undefined && !Array.isArray(l.cost) ? l.cost.toLocaleString("id-ID") : (l.cost && l.cost.length > 0 ? l.cost[0].value.toLocaleString("id-ID") : 0)} 
                        {l.estimation || l.etd ? ` (${l.estimation || l.etd})` : (l.cost && l.cost.length > 0 && l.cost[0].etd ? ` (${l.cost[0].etd})` : "")}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

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
                
                {ongkir > 0 && (
                  <div className="flex justify-between">
                    <span>Ongkos Kirim ({kurir.toUpperCase()} {layananPilih?.service})</span>
                    <span className="font-semibold text-slate-800">Rp {ongkir.toLocaleString("id-ID")}</span>
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