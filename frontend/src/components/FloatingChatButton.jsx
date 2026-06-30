import React, { useState } from 'react';
import { BsChatDotsFill } from 'react-icons/bs'; // Menggunakan ikon chat dari Bootstrap Icons
import IaeChatbot from './IaeChatbot'; // Sesuaikan dengan jalur file chatbot lo

const FloatingChatButton = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* 1. WADAH JENDELA CHATBOT (Muncul jika isOpen bernilai true) */}
      {isOpen && (
        <div style={{
          position: 'fixed',
          bottom: '90px', // Berada di atas tombol floating agar tidak tertutup
          right: '30px',
          zIndex: 1000,
          boxShadow: '0px 10px 25px rgba(0, 0, 0, 0.15)',
          borderRadius: '12px',
          backgroundColor: '#fff',
          overflow: 'hidden'
        }}>
          {/* Memanggil komponen utama chatbot FastAPI yang sudah kita buat */}
          <IaeChatbot />
        </div>
      )}

      {/* 2. TOMBOL FLOATING CHATBOT (KANAN BAWAH) */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: 'fixed',
          bottom: '30px', // Jarak dari bawah layar
          right: '30px',  // Jarak dari kanan layar
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          backgroundColor: '#0056b3', // Warna biru, sesuaikan dengan tema UniStore lo
          color: '#white',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.2)',
          zIndex: 1000,
          transition: 'transform 0.2s ease',
        }}
        // Efek hover sederhana
        onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
        onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
      >
        {/* Render Ikon Chat dengan ukuran 28px */}
        <BsChatDotsFill size={28} color="#fff" />
      </button>
    </>
  );
};

export default FloatingChatButton;