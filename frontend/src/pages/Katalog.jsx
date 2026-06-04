import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { 
  Search, 
  SlidersHorizontal, 
  ArrowUpDown, 
  Laptop, 
  Award, 
  Truck, 
  ShieldCheck, 
  ShoppingCart, 
  ArrowRight,
  Inbox,
  Star
} from 'lucide-react';
import { useCart } from '../context/CartContext';

const KatalogProduk = () => {
    const [produks, setProduks] = useState([]);
    const [filteredProduks, setFilteredProduks] = useState([]);
    const [loading, setLoading] = useState(true);
    
    const { addToCart } = useCart();
    const [showToast, setShowToast] = useState(false);
    const [toastProduct, setToastProduct] = useState('');

    useEffect(() => {
        if (showToast) {
            const timer = setTimeout(() => setShowToast(false), 3000);
            return () => clearTimeout(timer);
        }
    }, [showToast]);

    const handleAddToCart = (produk) => {
        addToCart(produk, 1);
        setToastProduct(produk.nama);
        setShowToast(true);
    };

    
    // State Filter & Search
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedKategori, setSelectedKategori] = useState('All');
    const [sortBy, setSortBy] = useState('latest'); // latest, price-asc, price-desc

    const BASE_URL = "http://127.0.0.1:8000";

    // Mapping Kategori ID ke Nama
    const kategoriMap = {
        1: "Asus",
        2: "Lenovo",
        3: "Samsung"
    };

    useEffect(() => {
        const fetchProduk = async () => {
            try {
                const response = await axios.get(`${BASE_URL}/api/katalog/produk/`);
                const data = Array.isArray(response.data) ? response.data : (response.data.results || []);
                setProduks(data);
                setFilteredProduks(data);
            } catch (error) {
                console.error("Gagal mengambil data produk:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchProduk();
    }, []);

    // Filter & Sort Logic
    useEffect(() => {
        let temp = [...produks];

        // 1. Search Query
        if (searchQuery) {
            temp = temp.filter(p => 
                p.nama.toLowerCase().includes(searchQuery.toLowerCase()) || 
                (p.deskripsi && p.deskripsi.toLowerCase().includes(searchQuery.toLowerCase()))
            );
        }

        // 2. Kategori Filter
        if (selectedKategori !== 'All') {
            temp = temp.filter(p => kategoriMap[p.kategori] === selectedKategori);
        }

        // 3. Sorting
        if (sortBy === 'price-asc') {
            temp.sort((a, b) => Number(a.harga) - Number(b.harga));
        } else if (sortBy === 'price-desc') {
            temp.sort((a, b) => Number(b.harga) - Number(a.harga));
        } else if (sortBy === 'latest') {
            temp.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        }

        setFilteredProduks(temp);
    }, [searchQuery, selectedKategori, sortBy, produks]);

    const handleResetFilters = () => {
        setSearchQuery('');
        setSelectedKategori('All');
        setSortBy('latest');
    };

    // Skeleton Loader Component
    const SkeletonCard = () => (
        <div className="bg-white rounded-3xl border border-slate-100 p-4 shadow-sm animate-pulse space-y-4">
            <div className="bg-slate-200 h-48 w-full rounded-2xl"></div>
            <div className="space-y-2">
                <div className="h-4 bg-slate-200 rounded w-1/3"></div>
                <div className="h-6 bg-slate-200 rounded w-3/4"></div>
                <div className="h-4 bg-slate-200 rounded w-1/2"></div>
                <div className="h-8 bg-slate-200 rounded w-full pt-4"></div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-50/50 pb-20 font-sans">
            
            {/* 1. HERO SECTION */}
            <div className="relative overflow-hidden bg-gradient-to-br from-[#0A1D3C] via-[#122e5c] to-[#1e427d] text-white pt-32 pb-24 px-6 sm:px-8 lg:px-12">
                {/* Background decorative circles */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl -ml-20 -mb-20"></div>

                <div className="max-w-7xl mx-auto grid md:grid-cols-12 gap-8 items-center relative z-10">
                    <div className="md:col-span-7 space-y-6">
                        <div className="inline-flex items-center gap-2 px-3 py-1 text-xs font-semibold rounded-full border border-blue-400/30 bg-blue-500/10 text-blue-300">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-ping"></span>
                            PROMO BULAN INI
                        </div>
                        <h1 className="text-4xl sm:text-5xl font-extrabold leading-tight tracking-tight">
                            Temukan Laptop Terbaik <br/>
                            <span className="bg-gradient-to-r from-blue-400 to-indigo-300 bg-clip-text text-transparent">
                                untuk Kebutuhan Anda
                            </span>
                        </h1>
                        <p className="text-slate-300 text-sm sm:text-base max-w-xl leading-relaxed">
                            Mulai dari produktivitas harian, editing profesional, hingga gaming kelas berat. 
                            Temukan laptop impian Anda dengan jaminan garansi resmi 2 tahun dan cicilan 0%.
                        </p>
                        <div className="flex flex-wrap gap-4 pt-2">
                            <a 
                                href="#katalog-list"
                                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-600/20 transition-all duration-200 transform hover:scale-[1.02] active:scale-95 flex items-center gap-2"
                            >
                                Belanja Sekarang
                                <ArrowRight className="w-4 h-4" />
                            </a>
                        </div>
                    </div>

                    {/* Right Hero side - Stats Cards */}
                    <div className="md:col-span-5 grid grid-cols-2 gap-4">
                        <div className="p-5 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl hover:bg-white/10 transition">
                            <Award className="w-8 h-8 text-blue-400 mb-3" />
                            <h3 className="font-bold text-base text-white">Garansi Resmi</h3>
                            <p className="text-xs text-slate-300 mt-1">Jaminan garansi 2 tahun distributor resmi.</p>
                        </div>
                        <div className="p-5 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl hover:bg-white/10 transition">
                            <Truck className="w-8 h-8 text-emerald-400 mb-3" />
                            <h3 className="font-bold text-base text-white">Gratis Ongkir</h3>
                            <p className="text-xs text-slate-300 mt-1">Bebas ongkos kirim ke seluruh kota Indonesia.</p>
                        </div>
                        <div className="p-5 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl hover:bg-white/10 transition">
                            <ShieldCheck className="w-8 h-8 text-indigo-400 mb-3" />
                            <h3 className="font-bold text-base text-white">100% Original</h3>
                            <p className="text-xs text-slate-300 mt-1">Produk segel resmi langsung dari brand ternama.</p>
                        </div>
                        <div className="p-5 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl hover:bg-white/10 transition-all flex flex-col justify-center items-center text-center">
                            <span className="text-3xl font-extrabold text-blue-400">100+</span>
                            <span className="text-xs font-semibold text-slate-200 mt-1">Laptop Pilihan</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Promo Banner Kecil */}
            <div className="max-w-7xl mx-auto px-6 mt-8">
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100/50 rounded-2xl p-4 flex items-center justify-between flex-wrap gap-4 shadow-sm">
                    <div className="flex items-center gap-3">
                        <span className="px-2.5 py-1 bg-blue-600 text-white rounded-lg text-xs font-bold">INFO PROMO</span>
                        <p className="text-sm font-medium text-slate-700">Dapatkan diskon tambahan 5% dengan menggunakan kode voucher <span className="font-bold text-blue-600">UNIVNEW</span></p>
                    </div>
                </div>
            </div>

            {/* 2. SEARCH & FILTER BAR SECTION */}
            <div id="katalog-list" className="max-w-7xl mx-auto px-6 mt-12">
                <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm flex flex-col lg:flex-row gap-4 items-center justify-between sticky top-20 z-40 bg-white/95 backdrop-blur-md">
                    {/* Search Input */}
                    <div className="relative w-full lg:w-96">
                        <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 transform -translate-y-1/2" />
                        <input
                            type="text"
                            placeholder="Cari laptop impianmu..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm transition placeholder:text-slate-400"
                        />
                    </div>

                    {/* Category Filter Buttons */}
                    <div className="flex items-center gap-2 overflow-x-auto w-full lg:w-auto py-1 scrollbar-none">
                        <button
                            onClick={() => setSelectedKategori('All')}
                            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${selectedKategori === 'All' ? 'bg-blue-600 text-white shadow-md shadow-blue-600/10' : 'bg-slate-50 hover:bg-slate-100 text-slate-600'}`}
                        >
                            Semua Laptop
                        </button>
                        {Object.values(kategoriMap).map((kat) => (
                            <button
                                key={kat}
                                onClick={() => setSelectedKategori(kat)}
                                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${selectedKategori === kat ? 'bg-blue-600 text-white shadow-md shadow-blue-600/10' : 'bg-slate-50 hover:bg-slate-100 text-slate-600'}`}
                            >
                                {kat}
                            </button>
                        ))}
                    </div>

                    {/* Sorting Select */}
                    <div className="flex items-center gap-2 w-full lg:w-auto flex-shrink-0">
                        <ArrowUpDown className="w-4 h-4 text-slate-400" />
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="w-full lg:w-44 py-3 px-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-sm text-slate-600 bg-white"
                        >
                            <option value="latest">Terbaru</option>
                            <option value="price-asc">Harga Terendah</option>
                            <option value="price-desc">Harga Tertinggi</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* 3. PRODUCTS GRID */}
            <div className="max-w-7xl mx-auto px-6 mt-8">
                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {[...Array(4)].map((_, i) => (
                            <SkeletonCard key={i} />
                        ))}
                    </div>
                ) : filteredProduks.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {filteredProduks.map((produk) => {
                            const isAvailable = produk.stok > 0;
                            const imageSrc = produk.gambar?.startsWith("http")
                                ? produk.gambar
                                : `${BASE_URL}${produk.gambar}`;
                            
                            return (
                                <div 
                                    key={produk.id} 
                                    className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col h-full group"
                                >
                                    {/* Image Wrapper */}
                                    <div className="relative bg-slate-50/50 p-4 aspect-video flex items-center justify-center overflow-hidden border-b border-slate-100/50">
                                        <img 
                                            src={imageSrc} 
                                            alt={produk.nama} 
                                            className="w-auto h-36 object-contain transform transition-transform duration-500 group-hover:scale-105"
                                        />
                                        
                                        {/* Badges on top of Image */}
                                        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                                            <span className="px-2.5 py-0.5 bg-blue-600/90 backdrop-blur-sm text-white text-[10px] font-bold rounded-lg uppercase tracking-wider">
                                                {kategoriMap[produk.kategori] || "Laptop"}
                                            </span>
                                            <span className={`px-2.5 py-0.5 text-[10px] font-bold rounded-lg border backdrop-blur-sm ${isAvailable ? 'bg-emerald-50/90 text-emerald-700 border-emerald-100' : 'bg-rose-50/90 text-rose-700 border-rose-100'}`}>
                                                {isAvailable ? `Stok: ${produk.stok}` : 'Habis'}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Card Content */}
                                    <div className="p-5 flex-grow flex flex-col justify-between">
                                        <div>
                                            <h2 className="text-base font-bold text-slate-800 line-clamp-1 group-hover:text-blue-600 transition">
                                                {produk.nama || "Tanpa Nama"}
                                            </h2>
                                            
                                            {/* Specs mini list */}
                                            <p className="text-xs text-slate-400 mt-1 line-clamp-1">
                                                {produk.prosesor} | {produk.ram} | {produk.storage}
                                            </p>

                                            {/* Dummy Star Rating */}
                                            <div className="flex items-center gap-1 mt-2 text-amber-400">
                                                <Star className="w-3.5 h-3.5 fill-current" />
                                                <span className="text-xs font-semibold text-slate-600">4.9</span>
                                                <span className="text-[10px] text-slate-400">(120+)</span>
                                            </div>
                                        </div>

                                        <div className="mt-5">
                                            <div className="flex flex-col mb-4">
                                                <span className="text-[10px] text-slate-400 block font-medium">Harga Terbaik</span>
                                                <span className="text-lg font-extrabold text-blue-600">
                                                    Rp {produk.harga ? Number(produk.harga).toLocaleString('id-ID') : '0'}
                                                </span>
                                            </div>

                                            {/* Button CTA */}
                                            <div className="flex flex-col gap-2">
                                                <button
                                                    onClick={() => handleAddToCart(produk)}
                                                    disabled={!isAvailable}
                                                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-xl text-xs font-bold transition-all duration-300 flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-blue-500/10"
                                                >
                                                    <ShoppingCart className="w-3.5 h-3.5" />
                                                    Tambah ke Keranjang
                                                </button>
                                                <Link 
                                                    to={`/katalog/${produk.slug}`} 
                                                    className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-all duration-300 flex items-center justify-center gap-2"
                                                >
                                                    Lihat Detail
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    // Empty State
                    <div className="text-center py-20 bg-white rounded-3xl border border-slate-100 shadow-sm max-w-xl mx-auto">
                        <Inbox className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-slate-700">Laptop Tidak Ditemukan</h3>
                        <p className="text-slate-500 text-sm mt-1 mb-6 px-6">
                            Kami tidak dapat menemukan laptop dengan kata kunci atau filter tersebut. Silakan atur ulang filter pencarian Anda.
                        </p>
                        <button
                            onClick={handleResetFilters}
                            className="px-6 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition"
                        >
                            Reset Semua Filter
                        </button>
                    </div>
                )}
            </div>

            {/* Toast Notification */}
            {showToast && (
                <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-4 rounded-2xl shadow-2xl flex items-center gap-3 border border-slate-800 animate-in slide-in-from-bottom-5 fade-in duration-300">
                    <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white">
                        <ShoppingCart className="w-4 h-4" />
                    </div>
                    <div>
                        <p className="text-xs text-slate-400 font-medium">Berhasil ditambahkan</p>
                        <p className="text-sm font-bold text-white line-clamp-1">{toastProduct}</p>
                    </div>
                    <button onClick={() => setShowToast(false)} className="ml-4 text-slate-400 hover:text-white transition">
                        ✕
                    </button>
                </div>
            )}
        </div>
    );
};


export default KatalogProduk;