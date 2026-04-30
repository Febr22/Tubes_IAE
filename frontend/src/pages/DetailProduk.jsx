import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const DetailProduk = () => {
    const { slug } = useParams();
    const navigate = useNavigate();

    const [produk, setProduk] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [qty, setQty] = useState(1);

    useEffect(() => {
        const fetchDetail = async () => {
            try {
                const response = await axios.get(`http://127.0.0.1:8000/api/katalog/produk/${slug}/`);
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
            <button 
                onClick={() => navigate(-1)} 
                className="mb-4 text-blue-600"
            >
                ← Kembali
            </button>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                
                {/* Gambar */}
                <img 
                    img src={produk.gambar}
                    alt={produk.nama} 
                    className="rounded-2xl shadow-lg"
                />

                {/* Detail */}
                <div>
                    <h1 className="text-3xl font-bold">{produk.nama}</h1>

                    <p className="text-2xl text-blue-600 font-bold mt-2">
                        Rp {Number(produk.harga).toLocaleString('id-ID')}
                    </p>

                    <div className="mt-6">
                        <h3 className="font-semibold">Deskripsi:</h3>
                        <p className="text-gray-600">
                            {produk.deskripsi || "Tidak ada deskripsi."}
                        </p>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
                        <p><strong>Prosesor:</strong> {produk.prosesor}</p>
                        <p><strong>RAM:</strong> {produk.ram}</p>
                        <p><strong>Storage:</strong> {produk.storage}</p>
                        <p><strong>Stok:</strong> {produk.stok}</p>
                    </div>

                    {/* BUTTON BELI */}
                    <button 
                        onClick={() => setShowModal(true)}
                        className="w-full mt-8 bg-green-600 text-white py-3 rounded-xl font-bold hover:bg-green-700"
                    >
                        Beli Sekarang
                    </button>
                </div>
            </div>

            {/* MODAL PILIH JUMLAH */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                    <div className="bg-white p-6 rounded-xl w-80 shadow-lg">
                        <h2 className="text-lg font-semibold mb-4">
                            Jumlah Pembelian
                        </h2>

                        <input
                            type="number"
                            min="1"
                            max={produk.stok}
                            value={qty}
                            onChange={(e) => setQty(Number(e.target.value))}
                            className="w-full border p-2 rounded mb-4"
                        />

                        <div className="flex justify-between">
                            <button 
                                onClick={() => setShowModal(false)}
                                className="px-4 py-2 bg-gray-300 rounded"
                            >
                                Batal
                            </button>

                            <button 
                                onClick={() => {
                                    navigate("/pemesanan", {
                                        state: {
                                            produk: produk,
                                            qty: qty
                                        }
                                    });
                                }}
                                className="px-4 py-2 bg-green-600 text-white rounded"
                            >
                                Lanjut
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DetailProduk;