import api from './api';

/**
 * Service untuk memproses pesanan dan pembayaran menggunakan Midtrans
 */
const pembayaranService = {
  /**
   * Membuat order baru di database
   * @param {Object} data - { laptop_id, jumlah, catatan }
   */
  buatOrder: async (data) => {
    try {
      const response = await api.post('pesanan/order/', data);
      return response.data;
    } catch (error) {
      console.error("Gagal membuat order:", error);
      throw error.response?.data || error.message;
    }
  },

  /**
   * Mencari destinasi pengiriman (kecamatan/kota) dari Komerce API
   * @param {string} keyword
   */
  cariLokasi: async (keyword) => {
    try {
      const response = await api.get('pengiriman/lokasi/', { params: { search: keyword } });
      return response.data; // { status, data }
    } catch (error) {
      console.error("Gagal mencari lokasi:", error);
      throw error.response?.data || error.message;
    }
  },

  /**
   * Mengecek ongkos kirim
   * @param {Object} data - { destination, courier }
   */
  cekOngkir: async (data) => {
    try {
      const response = await api.post('pengiriman/cek-ongkir/', data);
      return response.data; // { status, results }
    } catch (error) {
      console.error("Gagal mengecek ongkos kirim:", error);
      throw error.response?.data || error.message;
    }
  },

  /**
   * Mendapatkan Snap Token dari backend
   * @param {number} orderId - ID dari order yang baru dibuat
   */
  dapatkanSnapToken: async (orderId) => {
    try {
      const response = await api.post('pembayaran/create-transaction/', { order_id: orderId });
      return response.data; // Mengembalikan { snap_token, midtrans_order_id, amount }
    } catch (error) {
      console.error("Gagal mendapatkan Snap Token:", error);
      throw error.response?.data || error.message;
    }
  },

  /**
   * Mengecek status pembayaran terkini (terutama berguna saat running di localhost)
   * @param {number} orderId - ID dari order
   */
  cekStatusPembayaran: async (orderId) => {
    try {
      const response = await api.get(`pembayaran/check-status/${orderId}/`);
      return response.data; // Mengembalikan status terupdate dari model Pembayaran
    } catch (error) {
      console.error("Gagal mengecek status pembayaran:", error);
      throw error.response?.data || error.message;
    }
  },

  /**
   * Mendapatkan riwayat daftar pesanan milik user yang sedang login
   */
  dapatkanDaftarPesanan: async () => {
    try {
      const response = await api.get('pesanan/order/');
      return response.data; // Mengembalikan list pesanan user
    } catch (error) {
      console.error("Gagal mendapatkan daftar pesanan:", error);
      throw error.response?.data || error.message;
    }
  },

  /**
   * Mendapatkan detail pesanan tertentu berdasarkan ID
   */
  dapatkanDetailPesanan: async (orderId) => {
    try {
      const response = await api.get(`pesanan/order/${orderId}/`);
      return response.data;
    } catch (error) {
      console.error("Gagal mendapatkan detail pesanan:", error);
      throw error.response?.data || error.message;
    }
  },

  /**
   * Mengunggah bukti pembayaran manual
   * @param {number} orderId
   * @param {File} file
   */
  unggahBuktiBayar: async (orderId, file) => {
    try {
      const formData = new FormData();
      formData.append('order_id', orderId);
      formData.append('bukti_bayar', file);

      const response = await api.post('pembayaran/konfirmasi-manual/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error("Gagal mengunggah bukti bayar:", error);
      throw error.response?.data || error.message;
    }
  }
};

export default pembayaranService;
