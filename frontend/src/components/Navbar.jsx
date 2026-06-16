import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingCart, User, Search, Menu, X, LogOut, Laptop, ShoppingBag } from 'lucide-react';
import { useCart } from '../context/CartContext';

const Navbar = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { cartCount } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    setIsLoggedIn(!!token);
  }, [location]);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setIsLoggedIn(false);
    setIsMenuOpen(false);
    alert('Anda telah berhasil keluar.');
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  const navLinks = [
    { name: 'Beranda', path: '/' },
    { name: 'Katalog', path: '/katalog' },
  ];

  return (
    <nav className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
      isScrolled 
        ? 'bg-white/90 backdrop-blur-md shadow-md py-3' 
        : 'bg-white/40 backdrop-blur-sm py-4 border-b border-slate-100/50'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-12">
          
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-500/20 group-hover:scale-105 transition duration-300">
              <Laptop className="w-5 h-5" />
            </div>
            <span className="text-xl font-extrabold text-[#0A1D3C] tracking-tight group-hover:text-blue-600 transition">
              UniStore.
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link 
                key={link.name} 
                to={link.path}
                className={`relative py-1 text-sm font-semibold transition duration-200 ${
                  isActive(link.path) 
                    ? 'text-blue-600' 
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {link.name}
                {isActive(link.path) && (
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 rounded-full animate-in fade-in zoom-in duration-300" />
                )}
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-4">
            <div className="relative group">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 transform -translate-y-1/2 group-focus-within:text-blue-500 transition" />
              <input 
                type="text" 
                placeholder="Cari..." 
                onClick={() => navigate('/katalog')}
                className="pl-9 pr-3 py-1.5 w-36 focus:w-48 bg-slate-100/80 hover:bg-slate-100 focus:bg-white border border-transparent focus:border-slate-200 rounded-xl text-xs text-slate-700 outline-none transition-all duration-300"
              />
            </div>

            <Link 
              to="/keranjang" 
              className="p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition relative"
              title="Keranjang Belanja"
            >
              <ShoppingCart className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white ring-2 ring-white">
                  {cartCount}
                </span>
              )}
            </Link>

            {isLoggedIn ? (
              <div 
                className="relative border-l border-slate-200 pl-4"
                onMouseLeave={() => setIsDropdownOpen(false)}
              >
                <button 
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-100 rounded-xl transition"
                >
                  <User className="w-4 h-4 text-slate-500" />
                  <span className="text-xs font-bold text-slate-700">Akun Saya</span>
                </button>
                
                {isDropdownOpen && (
                  <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-slate-100 rounded-2xl shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                    <Link 
                      to="/profil" 
                      onClick={() => setIsDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 hover:text-blue-600 transition"
                    >
                      <User className="w-4 h-4 text-slate-500" />
                      Profil Saya
                    </Link>
                    
                    <Link 
                      to="/pesanan" 
                      onClick={() => setIsDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 hover:text-blue-600 transition border-t border-slate-50"
                    >
                      <ShoppingBag className="w-4 h-4 text-slate-500" />
                      Pesanan Saya
                    </Link>
                    
                    <button 
                      onClick={() => { setIsDropdownOpen(false); handleLogout(); }}
                      className="w-full flex items-center gap-2 text-left px-4 py-2.5 text-xs font-bold text-rose-600 hover:bg-rose-50 transition border-t border-slate-50"
                    >
                      <LogOut className="w-4 h-4 text-rose-500" />
                      Keluar
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2 border-l border-slate-200 pl-4">
                <Link 
                  to="/login" 
                  className="px-4 py-2 text-sm font-bold text-slate-700 hover:text-blue-600 transition"
                >
                  Masuk
                </Link>
                <Link 
                  to="/register" 
                  className="px-4 py-2 text-sm font-bold bg-blue-600 text-white rounded-xl shadow-md shadow-blue-600/10 hover:bg-blue-700 transition"
                >
                  Daftar
                </Link>
              </div>
            )}
          </div>

          <div className="md:hidden flex items-center gap-3">
            <Link 
              to="/keranjang" 
              className="p-2 text-slate-600 hover:text-blue-600 rounded-xl transition relative"
              title="Keranjang Belanja"
            >
              <ShoppingCart className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white ring-2 ring-white">
                  {cartCount}
                </span>
              )}
            </Link>
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 text-slate-600 hover:text-slate-900 rounded-xl transition focus:outline-none"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {isMenuOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-white border-b border-slate-100 shadow-lg py-4 px-6 space-y-4 animate-in slide-in-from-top-2 duration-200">
          <div className="space-y-2">
            {navLinks.map((link) => (
              <Link 
                key={link.name} 
                to={link.path}
                onClick={() => setIsMenuOpen(false)}
                className={`block py-2.5 px-4 rounded-xl text-sm font-bold transition ${
                  isActive(link.path) 
                    ? 'bg-blue-50 text-blue-600' 
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                {link.name}
              </Link>
            ))}
            {isLoggedIn && (
              <>
                <Link 
                  to="/profil"
                  onClick={() => setIsMenuOpen(false)}
                  className={`block py-2.5 px-4 rounded-xl text-sm font-bold transition ${
                    isActive('/profil') 
                      ? 'bg-blue-50 text-blue-600' 
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  Profil Saya
                </Link>
                <Link 
                  to="/pesanan"
                  onClick={() => setIsMenuOpen(false)}
                  className={`block py-2.5 px-4 rounded-xl text-sm font-bold transition ${
                    isActive('/pesanan') 
                      ? 'bg-blue-50 text-blue-600' 
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  Pesanan Saya
                </Link>
              </>
            )}
          </div>

          <div className="border-t border-slate-100 pt-4 space-y-3">
            {isLoggedIn ? (
              <button 
                onClick={handleLogout} 
                className="w-full flex items-center justify-center gap-2 py-3 border border-rose-200 text-rose-600 font-bold rounded-xl hover:bg-rose-50 transition"
              >
                <LogOut className="w-4 h-4" /> Keluar
              </button>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <Link 
                  to="/login" 
                  onClick={() => setIsMenuOpen(false)}
                  className="w-full text-center py-2.5 border border-slate-200 text-slate-700 font-bold rounded-xl"
                >
                  Masuk
                </Link>
                <Link 
                  to="/register" 
                  onClick={() => setIsMenuOpen(false)}
                  className="w-full text-center py-2.5 bg-blue-600 text-white font-bold rounded-xl"
                >
                  Daftar
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;