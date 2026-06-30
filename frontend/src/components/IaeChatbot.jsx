import React, { useState, useRef, useEffect } from 'react';

const IaeChatbot = () => {
  const [input, setInput] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Ref untuk otomatis melakukan scroll ke pesan paling bawah setiap ada chat baru
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory, loading]);

  // FUNGSI UTAMA UNTUK MENGIRIM PESAN
  const sendMessage = async () => {
    if (!input.trim()) return;

    // Memetakan chat history sesuai kebutuhan array terformat di FastAPI backend
    const newUserMessage = { role: 'user', text: input };
    const currentHistory = [...chatHistory, newUserMessage];
    setChatHistory(currentHistory);
    setInput('');
    setLoading(true);

    try {
      // 1. Ambil token JWT dari localStorage
      const tokenDariDjango = localStorage.getItem('access_token').replace(/"/g, '');

      // 2. Tembak ke URL FastAPI Microservice (Port 8080)
      const response = await fetch('http://localhost:8080/api/v1/ai-chat/', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${tokenDariDjango}` 
        },
        body: JSON.stringify({
          pesan_baru: input,
          // Mengirim riwayat chat yang lama saja (tanpa pesan user baru yang belum diproses AI)
          riwayat_chat: chatHistory 
        })
      });

      const data = await response.json();

      if (data.status === 'success') {
        // Gabungkan pesan user sebelumnya dengan jawaban baru dari model AI
        setChatHistory([
          ...currentHistory, 
          { role: 'model', text: data.jawaban }
        ]);
      } else {
        alert("Gagal memproses pesan: " + (data.detail || "Terjadi kesalahan sistem"));
      }
    } catch (error) {
      console.error("Error fetching AI response:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      width: '380px',
      height: '480px',
      display: 'flex',
      flexDirection: 'column',
      fontFamily: 'Segoe UI, Roboto, Helvetica, Arial, sans-serif',
      backgroundColor: '#ffffff'
    }}>
      {/* HEADER CHATBOX */}
      <div style={{
        padding: '15px 20px',
        backgroundColor: '#0056b3', // Biru gelap UniStore
        color: '#ffffff',
        display: 'flex',
        alignItems: 'center',
        fontWeight: '600',
        fontSize: '15px',
        borderBottom: '1px solid #e0e0e0'
      }}>
        <div style={{
          width: '8px',
          height: '8px',
          backgroundColor: '#28a745', // Titik hijau penanda AI online
          borderRadius: '50%',
          marginRight: '10px'
        }}></div>
        UniStore AI Assistant
      </div>

      {/* AREA UTAMA DAFTAR PESAN (CHAT BODY) */}
      <div style={{
        flex: 1,
        padding: '20px',
        overflowY: 'auto',
        backgroundColor: '#f8f9fa',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
      }}>
        {/* Pesan Selamat Datang Default */}
        {chatHistory.length === 0 && (
          <div style={{
            alignSelf: 'flex-start',
            backgroundColor: '#ffffff',
            color: '#333333',
            padding: '10px 14px',
            borderRadius: '4px 12px 12px 12px',
            maxWidth: '85%',
            fontSize: '14px',
            boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
            lineHeight: '1.4'
          }}>
            Halo! Ada yang bisa saya bantu seputar produk laptop di UniStore hari ini?
          </div>
        )}

        {/* Looping Merender Pesan dari State */}
        {chatHistory.map((msg, index) => (
          <div 
            key={index} 
            style={{
              alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
              backgroundColor: msg.role === 'user' ? '#0056b3' : '#ffffff',
              color: msg.role === 'user' ? '#ffffff' : '#333333',
              padding: '10px 14px',
              // Efek melengkung balon chat modern bergaya kanan-kiri
              borderRadius: msg.role === 'user' ? '12px 12px 4px 12px' : '4px 12px 12px 12px',
              maxWidth: '85%',
              fontSize: '14px',
              boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
              wordBreak: 'break-word',
              lineHeight: '1.4'
            }}
          >
            {msg.text}
          </div>
        ))}

        {/* Indikator Loading Saat Menunggu Respon FastAPI */}
        {loading && (
          <div style={{
            alignSelf: 'flex-start',
            backgroundColor: '#ffffff',
            color: '#888888',
            padding: '10px 14px',
            borderRadius: '4px 12px 12px 12px',
            maxWidth: '85%',
            fontSize: '13px',
            fontStyle: 'italic',
            boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
          }}>
            Sedang mengetik...
          </div>
        )}
        
        {/* Elemen jangkar penanda batas bawah scroll */}
        <div ref={messagesEndRef} />
      </div>

      {/* FORM INPUT PESAN (CHAT FOOTER) */}
      <div style={{
        padding: '12px 15px',
        backgroundColor: '#ffffff',
        borderTop: '1px solid #eeeeee',
        display: 'flex',
        alignItems: 'center',
        gap: '10px'
      }}>
        <input 
          type="text" 
          placeholder="Ketik pertanyaan Anda..."
          value={input} 
          onChange={(e) => setInput(e.target.value)} 
          // Mengizinkan kirim pesan secara cepat dengan menekan tombol Enter di keyboard
          onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
          disabled={loading}
          style={{
            flex: 1,
            padding: '10px 14px',
            borderRadius: '20px',
            border: '1px solid #cccccc',
            outline: 'none',
            fontSize: '14px',
            transition: 'border-color 0.2s',
            backgroundColor: loading ? '#f1f3f4' : '#ffffff'
          }}
        />
        <button 
          onClick={sendMessage} 
          disabled={loading || !input.trim()} 
          style={{
            padding: '10px 18px',
            backgroundColor: (loading || !input.trim()) ? '#cccccc' : '#0056b3',
            color: '#ffffff',
            border: 'none',
            borderRadius: '20px',
            cursor: (loading || !input.trim()) ? 'default' : 'pointer',
            fontWeight: '600',
            fontSize: '13px',
            transition: 'background-color 0.2s'
          }}
        >
          Kirim
        </button>
      </div>
    </div>
  );
};

export default IaeChatbot;