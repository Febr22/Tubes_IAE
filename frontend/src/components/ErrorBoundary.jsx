import React, { Component } from 'react';
import { AlertTriangle, Home, RotateCw } from 'lucide-react';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 font-sans">
          <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-xl max-w-md w-full text-center">
            <div className="w-16 h-16 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-600 mx-auto mb-6">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-extrabold text-[#0A1D3C] mb-2">Terjadi Kesalahan</h2>
            <p className="text-slate-500 text-xs mb-6 leading-relaxed">
              Mohon maaf, halaman ini gagal dimuat karena ada kesalahan sistem. Silakan kembali ke Beranda atau muat ulang halaman.
            </p>
            <div className="flex gap-4">
              <button 
                onClick={() => window.location.reload()} 
                className="flex-grow py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition flex items-center justify-center gap-1.5 shadow-lg shadow-blue-600/10 active:scale-95"
              >
                <RotateCw className="w-3.5 h-3.5" />
                Muat Ulang
              </button>
              <a 
                href="/" 
                className="flex-grow py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl text-xs transition flex items-center justify-center gap-1.5 active:scale-95"
              >
                <Home className="w-3.5 h-3.5" />
                Beranda
              </a>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
