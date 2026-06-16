import axios from 'axios';
import api from './api';

// --- DEKLARASI YANG SEBELUMNYA HILANG ---
const API_URL = 'http://127.0.0.1:8000/api/users/';

const getAuthHeader = () => {
  const token = localStorage.getItem('access_token');
  return { Authorization: `Bearer ${token}` };
};
// ----------------------------------------

const userService = {
  /**
   * Mendapatkan detail profil user yang sedang login
   */
  dapatkanProfil: async () => {
    try {
      const response = await api.get('users/me/');
      return response.data; // { id, email, username, role, no_telepon, alamat_utama, first_name, last_name }
    } catch (error) {
      console.error("Gagal mengambil profil:", error);
      throw error.response?.data || error.message;
    }
  },

  /**
   * Memperbarui detail profil user (username, first_name, last_name, no_telepon, alamat_utama)
   * @param {Object} data 
   */
  perbaruiProfil: async (data) => {
    try {
      const response = await api.patch('users/me/', data);
      return response.data;
    } catch (error) {
      console.error("Gagal memperbarui profil:", error);
      throw error.response?.data || error.message;
    }
  },

  // ==========================================
  // FITUR ALAMAT (MULTI-ADDRESS)
  // ==========================================

  // 1. Mengambil semua daftar alamat milik user
  getDaftarAlamat: async () => {
    try {
      const response = await axios.get(`${API_URL}alamat/`, {
        headers: getAuthHeader()
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // 2. Menambah alamat baru
  tambahAlamat: async (dataAlamat) => {
    try {
      const response = await axios.post(`${API_URL}alamat/`, dataAlamat, {
        headers: getAuthHeader()
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // 3. Mengubah data alamat (termasuk mengubah status is_utama)
  updateAlamat: async (id, dataAlamat) => {
    try {
      const response = await axios.patch(`${API_URL}alamat/${id}/`, dataAlamat, {
        headers: getAuthHeader()
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // 4. Menghapus alamat
  hapusAlamat: async (id) => {
    try {
      const response = await axios.delete(`${API_URL}alamat/${id}/`, {
        headers: getAuthHeader()
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
};

export default userService;