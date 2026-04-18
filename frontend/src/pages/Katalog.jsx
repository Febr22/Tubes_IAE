import React, { useEffect, useState } from 'react';
import axios from 'axios';

const KatalogProduk = () => {
    const [produks, setProduks] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Fungsi untuk mengambil data dari API Django
        const fetchProduk = async () => {
            try {
                const response = await axios.get('http://127.0.0.1:8000/api/katalog/produk/');
                setProduks(response.data);
                setLoading(false);
            } catch (error) {
                console.error("Gagal mengambil data produk:", error);
                setLoading(false);
            }
        };

        fetchProduk();
    }, []);

    if (loading) return <p className="text-center mt-10">Memuat katalog laptop...</p>;

    return (
        <div className="max-w-7xl mx-auto p-6">
            <h1 className="text-3xl font-bold mb-8 text-center">Katalog Laptop UnivStore</h1>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {produks.map((produk) => (
                    <div key={produk.id} className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition-shadow border border-gray-100">
                        {/* Tampilan Gambar */}
                        <img 
                            src={produk.gambar} 
                            alt={produk.nama} 
                            className="w-full h-48 object-cover"
                        />
                        
                        <div className="p-4">
                            <h2 className="text-lg font-semibold text-gray-800">{produk.nama}</h2>
                            <p className="text-blue-600 font-bold mt-2">
                                Rp {Number(produk.harga).toLocaleString('id-ID')}
                            </p>
                            <p className="text-sm text-gray-500 mt-1">Stok: {produk.stok}</p>
                            
                            <button className="w-full mt-4 bg-slate-900 text-white py-2 rounded-xl hover:bg-slate-800 transition-colors">
                                Lihat Detail
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default KatalogProduk;