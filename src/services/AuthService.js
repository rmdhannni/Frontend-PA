import { loginRequest, registerRequest } from '../api/authApi';

class AuthService {
    async login(email, password) {
        const response = await loginRequest({ email, password });
        const { token } = response.data;
        localStorage.setItem('token', token);

        // Decode token
        const decoded = JSON.parse(atob(token.split('.')[1]));

        // Ubah role jadi string yang cocok untuk ProtectedRoute
        let role = decoded.role;
        if (role === '1') role = 'admin';
        else if (role === '2') role = 'user';

        const user = { 
            ...decoded, 
            role, 
            username: decoded.username // pastikan token mengandung username
        };

        // Simpan user ke localStorage
        localStorage.setItem('user', JSON.stringify(user));

        return user;
    }

    async register(userData) {
        // pastikan userData mengandung username
        const response = await registerRequest({
            email: userData.email,
            password: userData.password,
            username: userData.username, // tambahkan ini
            role: userData.role // jika pakai role di pendaftaran
        });
        return response.data;
    }

    logout() {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
    }

    getCurrentUser() {
        return JSON.parse(localStorage.getItem('user'));
    }
}

export default new AuthService();
