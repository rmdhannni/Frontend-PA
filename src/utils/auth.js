export const getToken = () => localStorage.getItem('token');

export const getCurrentUser = () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
};

export const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
};
