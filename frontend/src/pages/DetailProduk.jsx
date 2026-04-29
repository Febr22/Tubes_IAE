import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const DetailProduk = () => {
    const { slug } = useParams(); // Mengambil slug dari URL
    const navigate = useNavigate();
    const [produk, setProduk] = useState(null);

    useEffect(() => {
        const fetchDetail = async () => {
            try {
                const response = await axios.get(`http://127.0.0.1:8001/api/katalog/produk/${slug}/`);
                setProduk(response.data);
            } catch (error) {
                console.error("Gagal memuat detail produk:", error);
            }
        };
        fetchDetail();
    }, [slug]);

    if (!produk) return <p className="text-center mt-10">Memuat detail laptop...</p>;

    return (
        <div className="max-w-4xl mx-auto p-6">
            <button onClick={() => navigate(-1)} className="mb-4 text-blue-600">← Kembali</button>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <img src={produk.gambar} alt={produk.nama} className="rounded-2xl shadow-lg" />
                <div>
                    <h1 className="text-3xl font-bold">{produk.nama}</h1>
                    <p className="text-2xl text-blue-600 font-bold mt-2">Rp {Number(produk.harga).toLocaleString('id-ID')}</p>
                    <div className="mt-6">
                        <h3 className="font-semibold">Deskripsi:</h3>
                        <p className="text-gray-600">{produk.deskripsi || "Tidak ada deskripsi."}</p>
                    </div>
                    <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
                        <p><strong>Prosesor:</strong> {produk.prosesor}</p>
                        <p><strong>RAM:</strong> {produk.ram}</p>
                        <p><strong>Storage:</strong> {produk.storage}</p>
                        <p><strong>Stok:</strong> {produk.stok}</p>
                    </div>
                    <button className="w-full mt-8 bg-green-600 text-white py-3 rounded-xl font-bold hover:bg-green-700">
                        Beli Sekarang
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DetailProduk;