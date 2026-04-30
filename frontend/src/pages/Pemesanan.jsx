import { useLocation } from "react-router-dom";

const Pemesanan = () => {
  const { state } = useLocation();
  const { produk, qty } = state || {};

  if (!produk) return <p className="text-center mt-10">Data tidak ditemukan</p>;

  const total = produk.harga * qty;
  const BASE_URL = "http://127.0.0.1:8000";

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      
      <h1 className="text-3xl font-bold mb-8 text-center">
        Checkout Pesanan
      </h1>

      <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-6">
        
        {/* LEFT: PRODUK */}
        <div className="md:col-span-2 bg-white rounded-2xl shadow p-6 flex gap-4">
          
          <img
            src={
              produk.gambar?.startsWith("http")
                ? produk.gambar
                : `${BASE_URL}${produk.gambar}`
            }
            alt={produk.nama}
            className="w-32 h-32 object-cover rounded-xl"
          />

          <div className="flex flex-col justify-between">
            <div>
              <h2 className="text-xl font-semibold">{produk.nama}</h2>
              <p className="text-gray-500 text-sm mt-1">
                {produk.deskripsi || "Tidak ada deskripsi"}
              </p>
            </div>

            <div className="mt-3">
              <p className="text-sm text-gray-500">Harga</p>
              <p className="text-lg font-bold text-blue-600">
                Rp {Number(produk.harga).toLocaleString("id-ID")}
              </p>
            </div>
          </div>
        </div>

        {/* RIGHT: SUMMARY */}
        <div className="bg-white rounded-2xl shadow p-6 h-fit">
          <h2 className="text-lg font-semibold mb-4">Ringkasan Belanja</h2>

          <div className="flex justify-between mb-2">
            <span>Jumlah</span>
            <span>{qty}</span>
          </div>

          <div className="flex justify-between mb-2">
            <span>Subtotal</span>
            <span>Rp {total.toLocaleString("id-ID")}</span>
          </div>

          <div className="border-t my-4"></div>

          <div className="flex justify-between text-lg font-bold">
            <span>Total</span>
            <span className="text-green-600">
              Rp {total.toLocaleString("id-ID")}
            </span>
          </div>

          <button className="w-full mt-6 bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-semibold transition">
            Checkout
          </button>
        </div>
      </div>
    </div>
  );
};

export default Pemesanan;