import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { 
  Trash2, 
  Plus, 
  Minus, 
  ShoppingBag, 
  ArrowRight, 
  ChevronRight, 
  Ticket, 
  Truck, 
  ShieldCheck, 
  ArrowLeft 
} from 'lucide-react';

const Cart = () => {
  const { cartItems, updateQty, removeFromCart, cartTotal } = useCart();
  const navigate = useNavigate();
  
  // State Voucher
  const [voucherCode, setVoucherCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [voucherError, setVoucherError] = useState('');
  const [voucherSuccess, setVoucherSuccess] = useState('');

  const BASE_URL = "http://127.0.0.1:8000";

  // Dummy Ongkir
  const ongkir = 0; // Free Shipping Promo
  const biayaLayanan = 5000;

  // Handle Voucher Apply
  const handleApplyVoucher = (e) => {
    e.preventDefault();
    setVoucherError('');
    setVoucherSuccess('');

    if (voucherCode.toUpperCase() === 'UNIVNEW') {
      // Diskon 5%
      const discVal = Math.floor(cartTotal * 0.05);
      setDiscount(discVal);
      setVoucherSuccess(`Voucher berhasil digunakan! Diskon 5% (Rp ${discVal.toLocaleString('id-ID')})`);
    } else if (voucherCode.trim() === '') {
      setVoucherError('Masukkan kode voucher terlebih dahulu.');
    } else {
      setVoucherError('Kode voucher tidak valid.');
      setDiscount(0);
    }
  };

  const handleRemoveVoucher = () => {
    setVoucherCode('');
    setDiscount(0);
    setVoucherSuccess('');
    setVoucherError('');
  };

  // Hitung total akhir
  const finalTotal = cartTotal - discount + ongkir + biayaLayanan;

  const handleCheckout = () => {
    // Arahkan ke halaman pemesanan dengan state berisi semua item dari cart
    navigate("/pemesanan", {
      state: {
        items: cartItems,
        discount: discount,
        voucherCode: discount > 0 ? 'UNIVNEW' : null
      }
    });
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50/50 pt-28 pb-16 px-4 flex flex-col items-center justify-center font-sans">
        <div className="max-w-md w-full bg-white rounded-3xl border border-slate-100 p-8 text-center shadow-xl shadow-slate-100/50 flex flex-col items-center">
          <div className="w-20 h-20 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 mb-6">
            <ShoppingBag className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-extrabold text-[#0A1D3C] mb-2">Keranjang Belanja Kosong</h2>
          <p className="text-slate-500 text-sm mb-8 max-w-sm">
            Wah, keranjang belanjamu masih kosong. Yuk temukan laptop impianmu di katalog produk kami!
          </p>
          <Link 
            to="/katalog"
            className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl shadow-lg shadow-blue-600/20 transition flex items-center justify-center gap-2 transform active:scale-95"
          >
            Mulai Belanja
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 pt-28 pb-20 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-7xl mx-auto">
        
        {/* Breadcrumb */}
        <div className="flex items-center space-x-2 text-sm text-slate-500 mb-6 overflow-x-auto whitespace-nowrap scrollbar-none">
          <Link to="/" className="hover:text-blue-600 transition">Beranda</Link>
          <ChevronRight className="w-4 h-4 flex-shrink-0" />
          <Link to="/katalog" className="hover:text-blue-600 transition">Katalog</Link>
          <ChevronRight className="w-4 h-4 flex-shrink-0" />
          <span className="text-slate-800 font-semibold">Keranjang Belanja</span>
        </div>

        <h1 className="text-3xl font-extrabold text-[#0A1D3C] tracking-tight mb-8">
          Keranjang Belanja ({cartItems.length} Produk)
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* List Produk (8 COLS) */}
          <div className="lg:col-span-8 space-y-4">
            {cartItems.map((item) => {
              const itemSubtotal = Number(item.harga) * item.qty;
              const imgUrl = item.gambar?.startsWith("http")
                ? item.gambar
                : `${BASE_URL}${item.gambar}`;

              return (
                <div 
                  key={item.id} 
                  className="bg-white rounded-3xl border border-slate-100 p-4 sm:p-6 shadow-sm hover:shadow-md transition duration-300 flex flex-col sm:flex-row gap-5 items-center relative group"
                >
                  {/* Gambar Produk */}
                  <div className="w-28 h-28 bg-slate-50 rounded-2xl flex items-center justify-center p-2 flex-shrink-0 border border-slate-100/50 overflow-hidden">
                    <img 
                      src={imgUrl} 
                      alt={item.nama}
                      className="w-full h-full object-contain rounded-xl transform transition duration-500 group-hover:scale-105"
                    />
                  </div>

                  {/* Info Produk */}
                  <div className="flex-grow text-center sm:text-left space-y-1">
                    <div className="inline-block px-2.5 py-0.5 bg-blue-50 text-blue-700 rounded-lg text-[10px] font-bold uppercase tracking-wider">
                      {item.prosesor || "Laptop"}
                    </div>
                    <h3 className="text-base font-extrabold text-slate-800 line-clamp-1 hover:text-blue-600 transition">
                      <Link to={`/katalog/${item.slug}`}>{item.nama}</Link>
                    </h3>
                    <p className="text-xs text-slate-400">
                      {item.ram} | {item.storage}
                    </p>
                    <p className="text-sm font-extrabold text-blue-600 pt-1">
                      Rp {Number(item.harga).toLocaleString('id-ID')}
                    </p>
                  </div>

                  {/* Quantity & Actions */}
                  <div className="flex flex-col sm:flex-row items-center gap-6 w-full sm:w-auto justify-between border-t sm:border-t-0 border-slate-100 pt-4 sm:pt-0">
                    
                    {/* Qty Selector */}
                    <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden bg-slate-50">
                      <button 
                        onClick={() => updateQty(item.id, item.qty - 1)}
                        disabled={item.qty <= 1}
                        className="p-2 hover:bg-slate-100 disabled:opacity-50 transition"
                      >
                        <Minus className="w-3.5 h-3.5 text-slate-600" />
                      </button>
                      <span className="w-10 text-center text-xs font-bold text-slate-800">{item.qty}</span>
                      <button 
                        onClick={() => updateQty(item.id, item.qty + 1)}
                        disabled={item.qty >= item.stok}
                        className="p-2 hover:bg-slate-100 disabled:opacity-50 transition"
                      >
                        <Plus className="w-3.5 h-3.5 text-slate-600" />
                      </button>
                    </div>

                    {/* Subtotal Item */}
                    <div className="text-center sm:text-right w-24">
                      <span className="text-[10px] text-slate-400 block sm:hidden">Subtotal</span>
                      <span className="text-sm font-extrabold text-slate-800">
                        Rp {itemSubtotal.toLocaleString('id-ID')}
                      </span>
                    </div>

                    {/* Hapus Button */}
                    <button 
                      onClick={() => removeFromCart(item.id)}
                      className="p-2.5 text-rose-500 hover:text-white hover:bg-rose-500 border border-rose-100 hover:border-rose-500 rounded-xl transition duration-200"
                      title="Hapus Produk"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                  </div>

                </div>
              );
            })}

            {/* Back Button */}
            <Link 
              to="/katalog"
              className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700 pt-2 transition"
            >
              <ArrowLeft className="w-4 h-4" />
              Kembali Belanja / Tambah Laptop Lain
            </Link>
          </div>

          {/* Ringkasan Belanja (4 COLS) - Sticky */}
          <div className="lg:col-span-4 lg:sticky lg:top-28 space-y-6">
            
            {/* Voucher Card */}
            <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm">
              <div className="flex items-center gap-2.5 mb-4 text-[#0A1D3C]">
                <Ticket className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-sm">Gunakan Voucher Belanja</h3>
              </div>
              
              {voucherSuccess ? (
                <div className="bg-green-50 border border-green-200 text-green-700 p-3 rounded-2xl text-xs space-y-2">
                  <p className="font-semibold">{voucherSuccess}</p>
                  <button 
                    onClick={handleRemoveVoucher} 
                    className="text-xs font-bold text-rose-600 hover:underline"
                  >
                    Batal Gunakan
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyVoucher} className="flex gap-2">
                  <input 
                    type="text" 
                    placeholder="Masukkan kode voucher..." 
                    value={voucherCode}
                    onChange={(e) => setVoucherCode(e.target.value)}
                    className="flex-grow px-4 py-2.5 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 rounded-xl text-xs text-slate-700 transition"
                  />
                  <button 
                    type="submit"
                    className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition"
                  >
                    Terapkan
                  </button>
                </form>
              )}
              {voucherError && (
                <p className="text-rose-500 text-[11px] font-semibold mt-2">{voucherError}</p>
              )}
              <p className="text-[10px] text-slate-400 mt-2">
                Tip: Coba gunakan kode voucher <span className="font-bold text-blue-500">UNIVNEW</span> untuk diskon 5%!
              </p>
            </div>

            {/* Order Summary Widget */}
            <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm space-y-6">
              <h3 className="font-extrabold text-[#0A1D3C] text-base border-b border-slate-100 pb-4">
                Ringkasan Belanja
              </h3>

              <div className="space-y-3.5 text-xs text-slate-600">
                <div className="flex justify-between">
                  <span>Total Harga ({cartItems.reduce((acc, item) => acc + item.qty, 0)} barang)</span>
                  <span className="font-semibold text-slate-800">Rp {cartTotal.toLocaleString('id-ID')}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-green-600 font-semibold">
                    <span>Diskon Voucher</span>
                    <span>- Rp {discount.toLocaleString('id-ID')}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Ongkos Kirim</span>
                  <span className="font-semibold text-green-600">Gratis (Promo)</span>
                </div>
                <div className="flex justify-between">
                  <span>Biaya Layanan</span>
                  <span className="font-semibold text-slate-800">Rp {biayaLayanan.toLocaleString('id-ID')}</span>
                </div>

                <div className="border-t border-slate-100 my-4 pt-4"></div>

                <div className="flex justify-between items-baseline text-slate-800">
                  <span className="text-sm font-bold">Total Pembayaran</span>
                  <span className="text-xl font-extrabold text-blue-600">
                    Rp {finalTotal.toLocaleString('id-ID')}
                  </span>
                </div>
              </div>

              {/* Delivery Info Dummy */}
              <div className="bg-slate-50 p-4 rounded-2xl text-[11px] text-slate-500 space-y-2">
                <div className="flex items-center gap-2 font-bold text-slate-700">
                  <Truck className="w-4 h-4 text-green-600" />
                  <span>Pengiriman Bebas Ongkir</span>
                </div>
                <p>Laptop akan dikemas aman menggunakan bubble wrap ekstra tebal dan dikirim hari ini juga.</p>
              </div>

              {/* Checkout Button */}
              <button
                onClick={handleCheckout}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-4 px-6 rounded-2xl shadow-lg shadow-blue-500/20 hover:shadow-blue-500/35 transition duration-300 flex items-center justify-center gap-2 transform active:scale-95"
              >
                Lanjut ke Checkout
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};

export default Cart;
