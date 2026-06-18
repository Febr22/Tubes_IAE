import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Home = () => {
  const navigate = useNavigate();
  const laptopHeroImg = "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=600&auto=format&fit=crop"; 
  const studentGridImgs = [
    "https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=200&h=200&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1531973576160-7125cd663d86?q=80&w=200&h=200&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?q=80&w=200&h=200&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1543269865-cbf427effbad?q=80&w=200&h=200&auto=format&fit=crop"
  ];

  const navyColor = "bg-[#0A1D3C]"; 
  const navyTextColor = "text-[#0A1D3C]";

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 font-sans">
      {/* 2. HERO SECTION */}
      <header className="pt-32 pb-20 px-6 bg-white">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className={`inline-flex items-center gap-2 px-3 py-1 text-xs font-semibold rounded-full border border-gray-200 bg-gray-50 ${navyTextColor}`}>
              <span>[⭐]</span> OFFICIAL PREMIUM STORE
            </div>
            <h2 className={`text-5xl font-extrabold leading-tight ${navyTextColor}`}>
              Performa Maksimal,<br/>Kualitas Terjamin.
            </h2>
            <p className="text-gray-600 max-w-lg">
              UnivStore adalah ritel resmi penyedia perangkat komputasi premium. Dapatkan laptop original dengan garansi resmi dan dukungan teknis khusus untuk produktivitas Anda.
            </p>
            <div className="flex gap-4 pt-4">
              <Link
                to="/katalog"
                className={`px-8 py-3 ${navyColor} text-white font-bold rounded-lg hover:bg-opacity-90 transition rounded-lg`}
              >
                Belanja Sekarang
              </Link>
            </div>
          </div>
          <div className="relative p-6">
            <div className="absolute inset-0 bg-white rounded-3xl blur-2xl opacity-50"></div>
            <img src={laptopHeroImg} alt="Premium Laptop" className="relative rounded-3xl object-cover shadow-2xl rotate-3" />
          </div>
        </div>
      </header>

      {/* 3. LAYANAN KAMI SECTION (Direvisi menjadi Fitur Toko) */}
      <section className="py-24 px-6 bg-gray-50">
        <div className="max-w-7xl mx-auto text-center">
          <h3 className={`text-3xl font-extrabold ${navyTextColor} relative inline-block`}>
            Keunggulan Belanja di UnivStore
            <span className="absolute left-0 right-0 -bottom-3 h-1 bg-blue-600 rounded"></span>
          </h3>
          
          <div className="mt-20 grid md:grid-cols-2 gap-8 text-left">
            {/* KARTU 1: Kualitas Original */}
            <div className="bg-white p-10 rounded-3xl shadow-lg border border-gray-100">
              <div className="w-16 h-16 mb-8 flex items-center justify-center bg-blue-50 text-blue-600 rounded-2xl text-2xl">
                <span>[📦]</span>
              </div>
              <h4 className={`text-2xl font-bold ${navyTextColor} mb-3`}>100% Produk Original</h4>
              <p className="text-gray-600 text-sm mb-6 leading-relaxed">
                Setiap unit yang kami jual didatangkan langsung dari distributor resmi. Segel pabrik utuh dengan jaminan keaslian perangkat keras dan lunak.
              </p>
              <ul className="space-y-3 text-sm text-gray-700 mb-8">
                <li className="flex items-center gap-3"><span className={`${navyTextColor}`}>[✓]</span> Segel Resmi BNIB</li>
                <li className="flex items-center gap-3"><span className={`${navyTextColor}`}>[✓]</span> Lisensi Windows Original</li>
              </ul>
              <Link to="/katalog" className="font-semibold text-blue-600 flex items-center gap-2 transition-all">
                Lihat Katalog Produk <span>→</span>
              </Link>
            </div>

            {/* KARTU 2: Garansi & Dukungan (Menggantikan 'Jual Laptop') */}
            <div className="bg-white p-10 rounded-3xl shadow-lg border border-gray-100">
              <div className="w-16 h-16 mb-8 flex items-center justify-center bg-green-50 text-green-600 rounded-2xl text-2xl">
                <span>[🛡️]</span>
              </div>
              <h4 className={`text-2xl font-bold ${navyTextColor} mb-3`}>Garansi Resmi 2 Tahun</h4>
              <p className="text-gray-600 text-sm mb-6 leading-relaxed">
                Ketenangan pikiran Anda adalah prioritas kami. Nikmati layanan purna jual yang komprehensif dan klaim garansi yang mudah langsung melalui toko kami.
              </p>
              <ul className="space-y-3 text-sm text-gray-700 mb-8">
                <li className="flex items-center gap-3"><span className="text-green-700">[✓]</span> Penggantian Suku Cadang Gratis</li>
                <li className="flex items-center gap-3"><span className="text-green-700">[✓]</span> Dukungan Teknis 24/7</li>
              </ul>
              <Link to="/support" className="font-semibold text-green-700 flex items-center gap-2 transition-all">
                Pusat Klaim Garansi <span>→</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 4. FOOTER SECTION (Dipersingkat untuk contoh, biarkan sisa kode Anda sama) */}
      <footer className="py-16 px-6 bg-gray-100 text-sm text-gray-600">
        <div className="max-w-7xl mx-auto text-center">
          <h5 className={`text-xl font-bold ${navyTextColor}`}>UnivStore.</h5>
          <p className="mt-2 text-xs">&copy; 2026 UnivStore Official. Hak Cipta Dilindungi.</p>
        </div>
      </footer>

    </div>
  );
};

export default Home;