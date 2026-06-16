import api from './api';

/**
 * Service untuk halaman Admin / Penjual
 */
const adminService = {
  /**
   * Mengambil semua pesanan
   */
  getAllOrders: async () => {
    try {
      const response = await api.get('pesanan/admin/orders/');
      return response.data;
    } catch (error) {
      console.error("Gagal mendapatkan daftar pesanan admin:", error);
      throw error.response?.data || error.message;
    }
  },

  /**
   * Mengupdate status pesanan atau resi pengiriman
   */
  updateOrder: async (orderId, data) => {
    try {
      const response = await api.patch(`pesanan/admin/orders/${orderId}/`, data);
      return response.data;
    } catch (error) {
      console.error(`Gagal mengupdate pesanan ${orderId}:`, error);
      throw error.response?.data || error.message;
    }
  },

  /**
   * Menambahkan produk baru (mendukung FormData untuk gambar)
   */
  createProduct: async (formData) => {
    try {
      const response = await api.post('katalog/produk/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error("Gagal menambahkan produk:", error);
      throw error.response?.data || error.message;
    }
  },

  /**
   * Mengupdate produk
   */
  updateProduct: async (slug, formData) => {
    try {
      const response = await api.patch(`katalog/produk/${slug}/`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error(`Gagal mengupdate produk ${slug}:`, error);
      throw error.response?.data || error.message;
    }
  },

  /**
   * Menghapus produk
   */
  deleteProduct: async (slug) => {
    try {
      const response = await api.delete(`katalog/produk/${slug}/`);
      return response.data;
    } catch (error) {
      console.error(`Gagal menghapus produk ${slug}:`, error);
      throw error.response?.data || error.message;
    }
  }
};

export default adminService;
