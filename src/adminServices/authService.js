import { api } from './api';

/**
 * Servicio de autenticación
 * Maneja login, logout y estado de la sesión
 */
export const authService = {
    /**
     * Iniciar sesión
     * @param {string} email 
     * @param {string} password 
     * @returns {Promise<Object>} Datos del usuario y token
     */
    async login(email, password) {
        try {
            // Nota: Ajusta el endpoint según tu backend si es diferente
            const response = await api.post('/auth/login', { email, password });

            if (response.token && response.user) {
                localStorage.setItem('token', response.token);
                localStorage.setItem('user', JSON.stringify(response.user));
            }

            return response;
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    },

    /**
     * Cerrar sesión
     */
    logout() {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
    },

    /**
     * Obtener usuario actual de la sesión
     * @returns {Object|null}
     */
    getCurrentUser() {
        const userStr = localStorage.getItem('user');
        if (!userStr) return null;
        try {
            return JSON.parse(userStr);
        } catch {
            return null;
        }
    },

    /**
     * Obtener token actual
     * @returns {string|null}
     */
    getToken() {
        return localStorage.getItem('token');
    },

    /**
     * Verificar si hay una sesión activa
     * @returns {boolean}
     */
    isAuthenticated() {
        const token = this.getToken();
        const user = this.getCurrentUser();
        return !!(token && user);
    },

    /**
     * Verificar si el usuario actual es administrador
     * @returns {boolean}
     */
    isAdmin() {
        const user = this.getCurrentUser();
        return user?.role_code === 'admin';
    }
};
