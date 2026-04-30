import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const KatalogProduk = () => {
    const [produks, setProduks] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProduk = async () => {
            try {
                const response = await axios.get('http://127.0.0.1:8000/api/katalog/produk/');
                // Pastikan data yang masuk adalah array
                const data = Array.isArray(response.data) ? response.data : (response.data.results || []);
                setProduks(data);
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
                    <div key={produk.id} className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl border border-gray-100">
                        <img src={produk.gambar} alt={produk.nama} className="w-full h-48 object-cover" />
                        <div className="p-4">
                            <h2 className="text-lg font-semibold text-gray-800">{produk.nama || "Tanpa Nama"}</h2>
                            <p className="text-blue-600 font-bold mt-2">
                                Rp {produk.harga ? Number(produk.harga).toLocaleString('id-ID') : '0'}
                            </p>
                            <p className="text-sm text-gray-500 mt-1">Stok: {produk.stok || 0}</p>
                            
                            <Link to={`/katalog/${produk.slug}`} className="block text-center w-full mt-4 bg-slate-900 text-white py-2 rounded-xl">
                                Lihat Detail
                            </Link>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default KatalogProduk;