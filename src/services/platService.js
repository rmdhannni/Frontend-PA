import axios from 'axios';

// Base URL untuk API
const API_URL = 'http://localhost:3000/api';
 // Disesuaikan dengan port yang benar untuk API

/**
 * Mengambil semua data plat dari API
 */
export const getAllPlat = async () => {
  try {
    const response = await axios.get(`${API_URL}/plat`);
    return response.data;
  } catch (error) {
    console.error('Error fetching plat data:', error);
    throw error;
  }
};

/**
 * Mengambil data plat berdasarkan ID
 * @param {number} id - ID plat yang akan diambil
 */
export const getPlatById = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/plat/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching plat with ID ${id}:`, error);
    throw error;
  }
};

/**
 * Menambahkan data plat baru
 * @param {Object} platData - Data plat yang akan ditambahkan
 */
export const addPlat = async (platData) => {
  try {
    const response = await axios.post(`${API_URL}/plat`, platData);
    return response.data;
  } catch (error) {
    console.error('Error adding plat:', error);
    throw error;
  }
};

/**
 * Memperbarui data plat
 * @param {number} id - ID plat yang akan diperbarui
 * @param {Object} platData - Data plat yang baru
 */
export const updatePlat = async (id, platData) => {
  try {
    const response = await axios.put(`${API_URL}/plat/${id}`, platData);
    return response.data;
  } catch (error) {
    console.error(`Error updating plat with ID ${id}:`, error);
    throw error;
  }
};

/**
 * Menghapus data plat
 * @param {number} id - ID plat yang akan dihapus
 */
export const deletePlat = async (id) => {
  try {
    const response = await axios.delete(`${API_URL}/plat/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting plat with ID ${id}:`, error);
    throw error;
  }
};