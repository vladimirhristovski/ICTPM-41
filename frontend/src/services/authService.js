import api from './api';

const authService = {
    login: async (username, password) => {
        const response = await api.post('/auth/login', {username, password});
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify({
            username: response.data.username,
            role: response.data.role,
        }));
        return response.data;
    },

    register: async (username, email, password) => {
        const response = await api.post('/auth/register', {username, email, password});
        return response.data;
    },

    logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
    },

    getUser: () => {
        const user = localStorage.getItem('user');
        return user ? JSON.parse(user) : null;
    },

    isLoggedIn: () => {
        return !!localStorage.getItem('token');
    },
};

export default authService;