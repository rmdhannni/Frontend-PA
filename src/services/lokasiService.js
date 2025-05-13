import axios from 'axios';

// Base URL untuk API
const API_URL = 'http://localhost:3000/api';

/**
 * Mengambil semua data lokasi dari API
 */
export const getAllLokasi = async () => {
  try {
    const response = await axios.get(`${API_URL}/lokasi`);
    return response.data;
  } catch (error) {
    console.error('Error fetching lokasi data:', error);
    throw error;
  }
};

/**
 * Mengambil data lokasi berdasarkan ID
 * @param {number} id - ID lokasi yang akan diambil
 */
export const getLokasiById = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/lokasi/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching lokasi with ID ${id}:`, error);
    throw error;
  }
};

/**
 * Menambahkan data lokasi baru
 * @param {Object} lokasiData - Data lokasi yang akan ditambahkan
 */
export const addLokasi = async (lokasiData) => {
  try {
    const response = await axios.post(`${API_URL}/lokasi`, lokasiData);
    return response.data;
  } catch (error) {
    console.error('Error adding lokasi:', error);
    throw error;
  }
};

/**
 * Memperbarui data lokasi
 * @param {number} id - ID lokasi yang akan diperbarui
 * @param {Object} lokasiData - Data lokasi yang baru
 */
export const updateLokasi = async (id, lokasiData) => {
  try {
    const response = await axios.put(`${API_URL}/lokasi/${id}`, lokasiData);
    return response.data;
  } catch (error) {
    console.error(`Error updating lokasi with ID ${id}:`, error);
    throw error;
  }
};

/**
 * Menghapus data lokasi
 * @param {number} id - ID lokasi yang akan dihapus
 */
export const deleteLokasi = async (id) => {
  try {
    const response = await axios.delete(`${API_URL}/lokasi/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting lokasi with ID ${id}:`, error);
    throw error;
  }
};