import api from './api';

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
  }
};

export default userService;
