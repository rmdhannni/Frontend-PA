import axios from 'axios';

const API_URL = 'http://localhost:3000/api/user';

export const loginRequest = (credentials) => axios.post(`${API_URL}/login`, credentials);
export const registerRequest = (data) => axios.post(`${API_URL}/register`, data);