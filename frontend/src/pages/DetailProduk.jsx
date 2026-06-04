import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { 
  ChevronRight, 
  Star, 
  Cpu, 
  Layers, 
  HardDrive, 
  Package, 
  ShieldCheck, 
  Truck, 
  Heart, 
  Share2, 
  Plus, 
  Minus, 
  ShoppingCart,
  MessageSquare,
  BadgeAlert
} from 'lucide-react';
import { useCart } from '../context/CartContext';


const DetailProduk = () => {
    const { slug } = useParams();
    const navigate = useNavigate();

    const [produk, setProduk] = useState(null);
    const [qty, setQty] = useState(1);
    const [activeTab, setActiveTab] = useState('deskripsi');
    const [loading, setLoading] = useState(true);
    const [isLiked, setIsLiked] = useState(false);
    
    const { addToCart } = useCart();
    const [showToast, setShowToast] = useState(false);

    useEffect(() => {
        if (showToast) {
            const timer = setTimeout(() => setShowToast(false), 3000);
            return () => clearTimeout(timer);
        }
    }, [showToast]);

    const handleAddToCart = () => {
        if (produk) {
            addToCart(produk, qty);
            setShowToast(true);
        }
    };


    const BASE_URL = "http://127.0.0.1:8000";

    useEffect(() => {
        const fetchDetail = async () => {
            try {
                const response = await axios.get(`${BASE_URL}/api/katalog/produk/${slug}/`);
                setProduk(response.data);
            } catch (error) {
                console.error("Gagal memuat detail produk:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchDetail();
    }, [slug]);

    if (loading) {
        return (
            <div className="max-w-7xl mx-auto p-6 space-y-6 animate-pulse pt-24">
                <div className="h-4 bg-slate-200 rounded w-1/4 mb-8"></div>
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    <div className="lg:col-span-5 h-[400px] bg-slate-200 rounded-2xl"></div>
                    <div className="lg:col-span-4 space-y-4">
                        <div className="h-8 bg-slate-200 rounded w-3/4"></div>
                        <div className="h-4 bg-slate-200 rounded w-1/2"></div>
                        <div className="h-10 bg-slate-200 rounded w-1/3"></div>
                        <div className="h-32 bg-slate-200 rounded"></div>
                    </div>
                    <div className="lg:col-span-3 h-64 bg-slate-200 rounded-2xl"></div>
                </div>
            </div>
        );
    }

    if (!produk) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
                <BadgeAlert className="w-16 h-16 text-rose-500 mb-4" />
                <h2 className="text-2xl font-bold text-slate-800 mb-2">Produk Tidak Ditemukan</h2>
                <p className="text-slate-600 mb-6">Laptop yang Anda cari tidak tersedia atau telah dihapus.</p>
                <Link to="/katalog" className="bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition">
                    Kembali ke Katalog
                </Link>
            </div>
        );
    }

    const imgUrl = produk.gambar?.startsWith("http")
        ? produk.gambar
        : `${BASE_URL}${produk.gambar}`;

    const handleIncrement = () => {
        if (qty < produk.stok) {
            setQty(qty + 1);
        }
    };

    const handleDecrement = () => {
        if (qty > 1) {
            setQty(qty - 1);
        }
    };

    const handleCheckout = () => {
        navigate("/pemesanan", {
            state: {
                produk: produk,
                qty: qty
            }
        });
    };

    return (
        <div className="min-h-screen bg-slate-50 pt-24 pb-16 px-4 sm:px-6 lg:px-8 font-sans">
            <div className="max-w-7xl mx-auto">
                {/* 1. BREADCRUMB */}
                <div className="flex items-center space-x-2 text-sm text-slate-500 mb-6 overflow-x-auto whitespace-nowrap scrollbar-none">
                    <Link to="/" className="hover:text-blue-600 transition">Beranda</Link>
                    <ChevronRight className="w-4 h-4 flex-shrink-0" />
                    <Link to="/katalog" className="hover:text-blue-600 transition">Katalog</Link>
                    <ChevronRight className="w-4 h-4 flex-shrink-0" />
                    <span className="text-slate-800 font-medium truncate">{produk.nama}</span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    {/* 2. IMAGE SECTION (5 COLS) */}
                    <div className="lg:col-span-5 space-y-4">
                        <div className="bg-white rounded-3xl p-4 border border-slate-100 shadow-sm flex items-center justify-center overflow-hidden relative group">
                            <img 
                                src={imgUrl}
                                alt={produk.nama} 
                                className="w-full h-auto max-h-[450px] object-contain rounded-2xl transform transition-transform duration-500 group-hover:scale-105"
                            />
                            <div className="absolute top-4 right-4 space-y-2">
                                <button 
                                    onClick={() => setIsLiked(!isLiked)}
                                    className="p-2.5 bg-white/80 backdrop-blur-md rounded-full shadow border border-slate-100 text-rose-500 hover:scale-110 active:scale-95 transition"
                                >
                                    <Heart className="w-5 h-5" fill={isLiked ? "#f43f5e" : "none"} />
                                </button>
                                <button className="p-2.5 bg-white/80 backdrop-blur-md rounded-full shadow border border-slate-100 text-slate-600 hover:scale-110 active:scale-95 transition">
                                    <Share2 className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        {/* Thumbnail dummy preview */}
                        <div className="flex gap-3 justify-center">
                            <div className="w-16 h-16 rounded-xl border-2 border-blue-500 p-1 bg-white cursor-pointer flex-shrink-0">
                                <img src={imgUrl} className="w-full h-full object-contain" alt="thumbnail-1" />
                            </div>
                            <div className="w-16 h-16 rounded-xl border border-slate-200 p-1 bg-white hover:border-slate-400 cursor-pointer opacity-60 hover:opacity-100 transition flex-shrink-0">
                                <img src={imgUrl} className="w-full h-full object-contain filter grayscale" alt="thumbnail-2" />
                            </div>
                            <div className="w-16 h-16 rounded-xl border border-slate-200 p-1 bg-white hover:border-slate-400 cursor-pointer opacity-60 hover:opacity-100 transition flex-shrink-0">
                                <img src={imgUrl} className="w-full h-full object-contain filter hue-rotate-90" alt="thumbnail-3" />
                            </div>
                        </div>
                    </div>

                    {/* 3. PRODUCT INFO SECTION (4 COLS) */}
                    <div className="lg:col-span-4 space-y-6 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                        <div>
                            <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-semibold uppercase tracking-wider">
                                {produk.kategori?.nama || "Laptop"}
                            </span>
                            <h1 className="text-3xl font-extrabold text-slate-800 mt-3 leading-tight">
                                {produk.nama}
                            </h1>
                            
                            {/* Rating & Ulasan Dummy */}
                            <div className="flex items-center gap-2 mt-3">
                                <div className="flex text-amber-400">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} className="w-4 h-4 fill-current" />
                                    ))}
                                </div>
                                <span className="text-sm font-semibold text-slate-700">4.9</span>
                                <span className="text-slate-300">|</span>
                                <span className="text-xs text-slate-500 hover:text-blue-600 cursor-pointer">120+ Ulasan</span>
                            </div>
                        </div>

                        {/* Harga */}
                        <div className="py-4 border-y border-slate-100">
                            <span className="text-sm text-slate-400 block">Harga</span>
                            <span className="text-3xl font-extrabold text-blue-600 tracking-tight">
                                Rp {Number(produk.harga).toLocaleString('id-ID')}
                            </span>
                        </div>

                        {/* Specs Grid */}
                        <div>
                            <h3 className="text-sm font-bold text-slate-800 mb-3">Spesifikasi Kunci</h3>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center gap-3">
                                    <Cpu className="w-5 h-5 text-blue-500 flex-shrink-0" />
                                    <div>
                                        <span className="text-[10px] text-slate-400 block">Prosesor</span>
                                        <span className="text-xs font-bold text-slate-700 truncate block max-w-[100px]">{produk.prosesor || "-"}</span>
                                    </div>
                                </div>
                                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center gap-3">
                                    <Layers className="w-5 h-5 text-indigo-500 flex-shrink-0" />
                                    <div>
                                        <span className="text-[10px] text-slate-400 block">RAM</span>
                                        <span className="text-xs font-bold text-slate-700 truncate block max-w-[100px]">{produk.ram || "-"}</span>
                                    </div>
                                </div>
                                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center gap-3">
                                    <HardDrive className="w-5 h-5 text-purple-500 flex-shrink-0" />
                                    <div>
                                        <span className="text-[10px] text-slate-400 block">Storage</span>
                                        <span className="text-xs font-bold text-slate-700 truncate block max-w-[100px]">{produk.storage || "-"}</span>
                                    </div>
                                </div>
                                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center gap-3">
                                    <Package className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                                    <div>
                                        <span className="text-[10px] text-slate-400 block">Stok</span>
                                        <span className={`text-xs font-bold ${produk.stok > 0 ? 'text-emerald-600' : 'text-rose-500'}`}>
                                            {produk.stok > 0 ? `${produk.stok} unit` : "Habis"}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Tabs (Deskripsi / Specs Lengkap) */}
                        <div className="space-y-3">
                            <div className="flex border-b border-slate-100">
                                <button 
                                    onClick={() => setActiveTab('deskripsi')}
                                    className={`pb-2 px-4 text-sm font-semibold transition ${activeTab === 'deskripsi' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
                                >
                                    Deskripsi
                                </button>
                                <button 
                                    onClick={() => setActiveTab('layanan')}
                                    className={`pb-2 px-4 text-sm font-semibold transition ${activeTab === 'layanan' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
                                >
                                    Layanan & Garansi
                                </button>
                            </div>

                            {activeTab === 'deskripsi' ? (
                                <p className="text-sm text-slate-600 leading-relaxed pt-2">
                                    {produk.deskripsi || "Tidak ada deskripsi lengkap untuk produk ini."}
                                </p>
                            ) : (
                                <div className="space-y-2 pt-2 text-sm text-slate-600">
                                    <div className="flex items-center gap-2">
                                        <ShieldCheck className="w-4 h-4 text-emerald-500" />
                                        <span>Garansi Resmi Toko & Distributor 2 Tahun</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Truck className="w-4 h-4 text-blue-500" />
                                        <span>Bebas Ongkir ke Seluruh Indonesia</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* 4. STICKY BUY CARD (3 COLS) */}
                    <div className="lg:col-span-3 lg:sticky lg:top-28 space-y-4">
                        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-6">
                            <h3 className="font-bold text-slate-800 text-base">Atur Jumlah</h3>
                            
                            {/* Quantity Selector */}
                            <div className="flex items-center justify-between">
                                <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden">
                                    <button 
                                        onClick={handleDecrement}
                                        disabled={qty <= 1}
                                        className="p-2.5 bg-slate-50 hover:bg-slate-100 disabled:opacity-50 transition"
                                    >
                                        <Minus className="w-4 h-4 text-slate-600" />
                                    </button>
                                    <span className="w-12 text-center text-sm font-bold text-slate-800">{qty}</span>
                                    <button 
                                        onClick={handleIncrement}
                                        disabled={qty >= produk.stok}
                                        className="p-2.5 bg-slate-50 hover:bg-slate-100 disabled:opacity-50 transition"
                                    >
                                        <Plus className="w-4 h-4 text-slate-600" />
                                    </button>
                                </div>
                                <span className="text-xs text-slate-400">Stok: {produk.stok}</span>
                            </div>

                            {/* Estimasi Pengiriman */}
                            <div className="bg-slate-50 p-4 rounded-2xl text-xs text-slate-500 space-y-2.5">
                                <div className="flex justify-between">
                                    <span>Ongkos Kirim:</span>
                                    <span className="font-bold text-green-600">Gratis (Promo)</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Estimasi Tiba:</span>
                                    <span className="font-medium text-slate-700">1 - 3 Hari Kerja</span>
                                </div>
                            </div>

                            {/* Subtotal */}
                            <div className="flex justify-between items-baseline pt-4 border-t border-slate-100">
                                <span className="text-sm text-slate-500 font-medium">Subtotal</span>
                                <span className="text-lg font-extrabold text-blue-600">
                                    Rp {(produk.harga * qty).toLocaleString('id-ID')}
                                </span>
                            </div>

                            {/* Button CTA */}
                            <div className="flex flex-col gap-3">
                                <button
                                    onClick={handleAddToCart}
                                    disabled={produk.stok <= 0}
                                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:from-slate-300 disabled:to-slate-400 text-white font-bold py-3.5 px-6 rounded-2xl shadow-lg shadow-blue-500/10 hover:shadow-blue-500/20 transition duration-300 flex items-center justify-center gap-2 transform active:scale-95"
                                >
                                    <ShoppingCart className="w-5 h-5" />
                                    Tambah ke Keranjang
                                </button>
                                <button
                                    onClick={handleCheckout}
                                    disabled={produk.stok <= 0}
                                    className="w-full bg-slate-900 hover:bg-slate-800 disabled:from-slate-300 disabled:to-slate-400 text-white font-bold py-3.5 px-6 rounded-2xl shadow-lg shadow-slate-900/10 hover:shadow-slate-900/20 transition duration-300 flex items-center justify-center gap-2 transform active:scale-95"
                                >
                                    Beli Sekarang
                                </button>
                            </div>

                        </div>
                    </div>
                </div>
            </div>

            {/* Toast Notification */}
            {showToast && (
                <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-4 rounded-2xl shadow-2xl flex items-center gap-3 border border-slate-800 animate-in slide-in-from-bottom-5 fade-in duration-300">
                    <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white">
                        <ShoppingCart className="w-4 h-4" />
                    </div>
                    <div>
                        <p className="text-xs text-slate-400 font-medium">Berhasil ditambahkan</p>
                        <p className="text-sm font-bold text-white line-clamp-1">{produk.nama}</p>
                    </div>
                    <button onClick={() => setShowToast(false)} className="ml-4 text-slate-400 hover:text-white transition">
                        ✕
                    </button>
                </div>
            )}
        </div>
    );
};


export default DetailProduk;