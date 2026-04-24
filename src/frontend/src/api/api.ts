import axios from 'axios';

const API_URL = 'http://localhost:5100/api'; 

const api = axios.create({
    baseURL: API_URL,
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        const status = error.response ? error.response.status : null;

        if (status === 401) {
            localStorage.removeItem('token');
            window.location.replace('/login');
        }

        if (status >= 500) {
            console.error('SERVER_ERROR (500+):', error.message);
            alert("Server error. We are already working on it.");
        }

        return Promise.reject(error);
    }
);

export default api;