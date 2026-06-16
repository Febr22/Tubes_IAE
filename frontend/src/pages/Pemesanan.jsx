import React, { useState, useEffect } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { 
  CreditCard, ShoppingBag, ArrowLeft, Loader2, CheckCircle2, 
  AlertTriangle, XCircle, FileText, MapPin, X, Truck 
} from "lucide-react";
import pembayaranService from "../services/pembayaranService";
import userService from "../services/userService";
import { useCart } from "../context/CartContext";

const Pemesanan = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { clearCart } = useCart();

  const items = state?.items ? state.items : (state?.produk ? [{ ...state.produk, qty: state.qty }] : []);
  const discount = state?.discount || 0;

  // State untuk Alamat (Shopee Style)
  const [daftarAlamat, setDaftarAlamat] = useState([]);
  const [alamatDipilih, setAlamatDipilih] = useState(null);
  const [isModalAlamatOpen, setIsModalAlamatOpen] = useState(false);
  const [loadingAlamat, setLoadingAlamat] = useState(true);

  // State Checkout & Midtrans
  const [catatan, setCatatan] = useState("");
  const [loading, setLoading] = useState(false);
  const [statusTransaksi, setStatusTransaksi] = useState(null);
  const [detailBayar, setDetailBayar] = useState(null);
  const [orderId, setOrderId] = useState(null);

  // State Pengiriman & Logistik (Otomatis)
  const [lokasiTerpilih, setLokasiTerpilih] = useState(null);
  const [kurir, setKurir] = useState("");
  const [layananList, setLayananList] = useState([]);
  const [layananPilih, setLayananPilih] = useState(null);
  const [ongkir, setOngkir] = useState(0);
  const [loadingOngkir, setLoadingOngkir] = useState(false);
  const [lokasiError, setLokasiError] = useState("");

  const BASE_URL = "http://127.0.0.1:8000";

  // 1. Load Midtrans & Daftar Alamat saat halaman dibuka
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

    const token = localStorage.getItem("access_token");
    if (token) {
      const fetchAlamat = async () => {
        try {
          const data = await userService.getDaftarAlamat();
          setDaftarAlamat(data);
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

  // 2. AUTO-SEARCH RAJAONGKIR ID Latar Belakang (Triggers ketika alamatDipilih berubah)
  useEffect(() => {
    const autoSetLokasiRajaOngkir = async () => {
      if (alamatDipilih && alamatDipilih.kota_kabupaten) {
        setLokasiError("");
        setKurir("");
        setLayananList([]);
        setLayananPilih(null);
        setOngkir(0);
        
        try {
          // Cari kota berdasarkan nama kota dari profil user
          const res = await pembayaranService.cariLokasi(alamatDipilih.kota_kabupaten);
          if (res.data && res.data.length > 0) {
            setLokasiTerpilih(res.data[0]); // Ambil kecocokan pertama
          } else {
            setLokasiTerpilih(null);
            setLokasiError(`Sistem tidak dapat menemukan kota "${alamatDipilih.kota_kabupaten}" di layanan kurir. Pastikan penulisan kota di profil Anda sudah benar.`);
          }
        } catch (err) {
          setLokasiTerpilih(null);
          setLokasiError("Gagal menghubungi server logistik.");
        }
      } else {
        setLokasiTerpilih(null);
      }
    };
    autoSetLokasiRajaOngkir();
  }, [alamatDipilih]);

  // 3. Fetch Ongkir ketika Lokasi Valid & Kurir berubah
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

  const token = localStorage.getItem("access_token");
  if (!token) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 font-sans">
        <div className="bg-white p-8 rounded-2xl shadow-md text-center max-w-md w-full">
          <AlertTriangle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Akses Terbatas</h2>
          <p className="text-gray-600 mb-6">Anda harus login terlebih dahulu.</p>
          <button onClick={() => navigate("/login")} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition duration-200">
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
          <Link to="/katalog" className="inline-block w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition duration-200">
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
    if (!alamatDipilih) {
      alert("Silakan pilih alamat pengiriman terlebih dahulu.");
      return;
    }
    if (!kurir || !layananPilih) {
      alert("Mohon pilih layanan kurir pengiriman.");
      return;
    }

    setLoading(true);
    setStatusTransaksi(null);
    setDetailBayar(null);

    try {
      const itemsInput = items.map(item => ({ laptop_id: item.id, jumlah: item.qty }));

      const order = await pembayaranService.buatOrder({
        items_input: itemsInput,
        catatan: catatan,
        discount: discount,
        alamat_pengiriman_id: alamatDipilih.id, 
        provinsi: alamatDipilih.provinsi,
        kota: alamatDipilih.kota_kabupaten,
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
            setStatusTransaksi("success"); clearCart();
            try { setDetailBayar(await pembayaranService.cekStatusPembayaran(newOrderId)); } catch (err) {}
          },
          onPending: async (result) => {
            setStatusTransaksi("pending"); clearCart();
            try { setDetailBayar(await pembayaranService.cekStatusPembayaran(newOrderId)); } catch (err) {}
          },
          onError: async (result) => {
            setStatusTransaksi("error");
            try { setDetailBayar(await pembayaranService.cekStatusPembayaran(newOrderId)); } catch (err) {}
          },
          onClose: () => setStatusTransaksi("closed"),
        });
      }
    } catch (error) {
      let errorMsg = "Gagal memproses checkout. Silakan coba lagi.";
      if (typeof error === 'string') errorMsg = error;
      else if (error && typeof error === 'object') {
          if (error.error) errorMsg = error.error;
          else if (error.detail) errorMsg = error.detail;
          else if (Object.keys(error).length > 0) errorMsg = `${Object.keys(error)[0]}: ${error[Object.keys(error)[0]]}`;
      }
      alert(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 py-28 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-5xl mx-auto">
        <button onClick={() => navigate(-1)} className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-800 transition mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" /> Kembali
        </button>

        <h1 className="text-3xl font-extrabold text-[#0A1D3C] mb-8 tracking-tight">Checkout Pesanan</h1>

        {statusTransaksi && (
          <div className="mb-8 p-6 rounded-3xl border bg-white shadow-xl shadow-slate-100/50 animate-in fade-in slide-in-from-top-4 duration-300">
            {statusTransaksi === "success" && (
              <div className="flex flex-col items-center text-center">
                <CheckCircle2 className="w-16 h-16 text-emerald-500 mb-4 animate-bounce" />
                <h3 className="text-2xl font-bold text-slate-900 mb-2">Pembayaran Berhasil!</h3>
                <p className="text-slate-600 max-w-md mb-4">Terima kasih, pembayaran Anda telah kami terima.</p>
                <div className="flex gap-4 mt-6">
                  <Link to="/pesanan" className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition">Lihat Pesanan</Link>
                </div>
              </div>
            )}
            {/* ... Block Pending, Error, Closed dibiarkan default ... */}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          <div className="lg:col-span-2 space-y-6">
            
            {/* BLOK ALAMAT PENGIRIMAN (Shopee Style) */}
            <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
              <div className="flex justify-between items-center border-b border-slate-50 pb-4 mb-4">
                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-blue-600" /> Alamat Pengiriman
                </h3>
                {!loadingAlamat && (
                  <button onClick={() => setIsModalAlamatOpen(true)} className="text-xs font-bold text-blue-600 hover:text-blue-700 transition">
                    {alamatDipilih ? "Ubah Alamat" : "Pilih Alamat"}
                  </button>
                )}
              </div>

              {loadingAlamat ? (
                <div className="flex items-center gap-2 text-slate-400 text-xs py-2"><Loader2 className="w-4 h-4 animate-spin" /> Memuat alamat...</div>
              ) : alamatDipilih ? (
                <div className="text-xs text-slate-600 space-y-1">
                  <div className="flex items-center gap-2 text-slate-800 mb-1.5">
                    <strong className="font-bold">{alamatDipilih.nama_penerima}</strong>
                    <span className="text-slate-400">|</span><span>{alamatDipilih.no_telepon}</span>
                    {alamatDipilih.is_utama && (<span className="px-1.5 py-0.5 bg-blue-50 text-blue-600 font-bold rounded text-[9px] uppercase tracking-wider">Utama</span>)}
                  </div>
                  <p className="leading-relaxed">{alamatDipilih.alamat_lengkap}, {alamatDipilih.kota_kabupaten}, {alamatDipilih.provinsi}, {alamatDipilih.kode_pos}</p>
                </div>
              ) : (
                <div className="text-center py-4 bg-rose-50/50 rounded-xl border border-rose-100">
                  <p className="text-xs text-rose-500 mb-3 font-semibold">Kamu belum menentukan alamat pengiriman.</p>
                  <button onClick={() => setIsModalAlamatOpen(true)} className="px-4 py-2 bg-white border border-rose-200 text-rose-600 hover:bg-rose-50 font-bold rounded-xl text-xs transition">+ Tambah / Pilih Alamat</button>
                </div>
              )}
            </div>

            {/* DAFTAR PRODUK */}
            <div className="space-y-4">
              {items.map((item) => (
                <div key={item.id} className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm flex gap-5 items-center">
                  <div className="w-20 h-20 bg-slate-50 border border-slate-100/50 p-1.5 rounded-xl flex-shrink-0 flex items-center justify-center overflow-hidden">
                    <img src={item.gambar?.startsWith("http") ? item.gambar : `${BASE_URL}${item.gambar}`} alt={item.nama} className="w-full h-full object-contain rounded-lg"/>
                  </div>
                  <div className="flex-grow min-w-0">
                    <span className="inline-block px-2 py-0.5 bg-blue-50 text-blue-700 rounded-lg text-[9px] font-bold uppercase mb-1">{item.prosesor || "Laptop"}</span>
                    <h2 className="text-sm font-extrabold text-slate-800 truncate mb-0.5">{item.nama}</h2>
                    <p className="text-slate-400 text-xs truncate">{item.ram} | {item.storage}</p>
                    <div className="flex justify-between items-baseline mt-2.5 pt-2 border-t border-slate-50 text-xs">
                      <div className="text-slate-500"><span>{item.qty} unit</span><span className="mx-2 text-slate-200">|</span><span>Rp {Number(item.harga).toLocaleString("id-ID")}</span></div>
                      <span className="font-extrabold text-slate-800">Rp {(Number(item.harga) * item.qty).toLocaleString("id-ID")}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* BLOK KURIR PENGIRIMAN (Menggantikan Form Alamat Manual) */}
            <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <Truck className="w-5 h-5 text-slate-500" />
                <h3 className="text-sm font-bold text-slate-800">Layanan Kurir Pengiriman</h3>
              </div>
              
              {lokasiError ? (
                <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-600 font-medium">
                  <AlertTriangle className="w-4 h-4 inline mr-1 mb-0.5" /> {lokasiError}
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  <select 
                    value={kurir} 
                    onChange={(e) => { setKurir(e.target.value); setOngkir(0); }}
                    disabled={!lokasiTerpilih}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-xs text-slate-600 disabled:opacity-50 disabled:bg-slate-50"
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
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-xs text-slate-600 disabled:opacity-50 disabled:bg-slate-50"
                  >
                    <option value="">{loadingOngkir ? "Menghitung ongkir..." : "-- Pilih Layanan --"}</option>
                    {layananList.map(l => {
                       const costVal = l.cost !== undefined && !Array.isArray(l.cost) ? l.cost : (l.cost && l.cost.length > 0 ? l.cost[0].value : 0);
                       const estVal = l.estimation || l.etd ? ` (${l.estimation || l.etd} Hari)` : (l.cost && l.cost.length > 0 && l.cost[0].etd ? ` (${l.cost[0].etd} Hari)` : "");
                       return (
                         <option key={l.service} value={l.service}>
                           {l.service} - Rp {costVal.toLocaleString("id-ID")} {estVal}
                         </option>
                       );
                    })}
                  </select>
                </div>
              )}
            </div>

            <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <FileText className="w-5 h-5 text-slate-500" />
                <h3 className="text-sm font-bold text-slate-800">Catatan (Opsional)</h3>
              </div>
              <textarea
                value={catatan} onChange={(e) => setCatatan(e.target.value)}
                placeholder="Contoh: Tolong packing kayu ekstra ya..." rows={2}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-xs text-slate-600 transition placeholder:text-slate-400"
              />
            </div>
          </div>

          <div className="lg:col-span-1 lg:sticky lg:top-28 space-y-6">
            <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
              <h2 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-4 mb-4">Ringkasan Belanja</h2>
              <div className="space-y-3.5 text-xs text-slate-600">
                <div className="flex justify-between">
                  <span>Total Harga</span><span className="font-semibold text-slate-800">Rp {subtotal.toLocaleString("id-ID")}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-green-600 font-semibold"><span>Diskon Voucher</span><span>- Rp {discount.toLocaleString("id-ID")}</span></div>
                )}
                {ongkir > 0 && (
                  <div className="flex justify-between">
                    <span>Ongkos Kirim ({kurir.toUpperCase()})</span><span className="font-semibold text-slate-800">Rp {ongkir.toLocaleString("id-ID")}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Biaya Layanan</span><span className="font-semibold text-slate-800">Rp {biayaLayanan.toLocaleString("id-ID")}</span>
                </div>
                <div className="border-t border-slate-100 my-4 pt-4"></div>
                <div className="flex justify-between items-baseline text-slate-800">
                  <span className="text-xs font-bold">Total</span>
                  <span className="text-xl font-extrabold text-blue-600">Rp {total.toLocaleString("id-ID")}</span>
                </div>
              </div>

              <button
                onClick={handleCheckout}
                disabled={loading || !alamatDipilih || !layananPilih}
                className={`w-full mt-6 py-4 rounded-xl font-bold transition-all duration-300 flex items-center justify-center gap-2 shadow-lg ${
                  (alamatDipilih && layananPilih) ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 text-white shadow-blue-600/10' : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
              >
                {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Memproses...</> : <><CreditCard className="w-4 h-4" /> Bayar Sekarang</>}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL PILIH ALAMAT */}
      {isModalAlamatOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-xl max-h-[80vh] flex flex-col shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h4 className="font-extrabold text-slate-900 text-base">Pilih Alamat Pengiriman</h4>
              <button onClick={() => setIsModalAlamatOpen(false)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 overflow-y-auto flex-1 space-y-4">
              {daftarAlamat.map((item) => (
                <div 
                  key={item.id} onClick={() => { setAlamatDipilih(item); setIsModalAlamatOpen(false); }}
                  className={`p-4 rounded-2xl border-2 text-xs text-slate-600 cursor-pointer transition flex items-start gap-3 ${alamatDipilih?.id === item.id ? 'border-blue-500 bg-blue-50/20' : 'border-slate-100 hover:border-slate-200 bg-white'}`}
                >
                  <input type="radio" checked={alamatDipilih?.id === item.id} readOnly className="mt-0.5 text-blue-600 focus:ring-blue-500" />
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2 text-slate-800">
                      <strong className="font-bold">{item.nama_penerima}</strong><span>|</span><span>{item.no_telepon}</span>
                    </div>
                    <p>{item.alamat_lengkap}, {item.kota_kabupaten}, {item.provinsi}</p>
                  </div>
                </div>
              ))}
              <button onClick={() => navigate('/profil')} className="w-full py-3 border-2 border-dashed border-slate-200 hover:border-blue-400 hover:bg-blue-50 hover:text-blue-600 rounded-2xl text-center text-xs font-bold text-slate-500">+ Tambah Alamat Baru di Profil</button>
            </div>
            <div className="p-6 border-t border-slate-100 flex justify-end gap-3 bg-slate-50 rounded-b-3xl">
              <button onClick={() => setIsModalAlamatOpen(false)} className="px-5 py-2.5 bg-white border border-slate-200 text-slate-700 text-xs font-bold rounded-xl">Tutup</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Pemesanan;