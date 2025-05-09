// Konfigurasi URL API
// Ubah nilai API_URL sesuai dengan endpoint backend Anda

// Development environment - gunakan port yang sesuai dengan backend Anda
export const API_URL = 'http://localhost:3001/api';

// Jika proses API request sedang gagal, Anda bisa mematikan sementara
// koneksi API dengan mengomentari baris di atas dan menggunakan mock API
// export const API_URL = 'mock';

// URL untuk asset/media jika diperlukan
export const ASSET_URL = `${API_URL}/assets`;

// Fungsi helper untuk memeriksa apakah API dalam mode mock
export const isMockMode = () => API_URL === 'mock';

// Fungsi helper untuk debugging
export const logAPIUrl = () => {
  console.log("Current API URL:", API_URL);
};