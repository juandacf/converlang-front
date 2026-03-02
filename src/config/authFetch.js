import { jwtDecode } from 'jwt-decode';
import { API_URL } from './api';

/**
 * Verifica si el token JWT ha expirado.
 * @returns {boolean} true si el token es inválido o ha expirado
 */
export function isTokenExpired() {
    const token = localStorage.getItem('token');
    if (!token) return true;

    try {
        const decoded = jwtDecode(token);
        // exp está en segundos, Date.now() en milisegundos
        return decoded.exp * 1000 < Date.now();
    } catch {
        return true;
    }
}

/**
 * Wrapper de fetch que intercepta respuestas 401 y tokens expirados.
 * Si el token está vencido o el servidor responde 401, limpia el token
 * y redirige al login.
 * 
 * Uso: reemplazar fetch() por authFetch() en todos los componentes.
 */
export async function authFetch(url, options = {}) {
    // Verificar si el token ya expiró antes de hacer la llamada
    if (isTokenExpired()) {
        localStorage.removeItem('token');
        window.location.href = '/';
        return;
    }

    const response = await fetch(url, options);

    // Si el servidor responde 401 (Unauthorized), el token venció
    if (response.status === 401) {
        localStorage.removeItem('token');
        window.location.href = '/';
        return;
    }

    return response;
}

/**
 * Cierra sesión del usuario:
 * 1. Notifica al backend para eliminar el heartbeat inmediatamente.
 * 2. Limpia localStorage.
 * 3. Redirige al login.
 */
export async function logoutUser() {
    const token = localStorage.getItem('token');
    if (token) {
        try {
            await fetch(`${API_URL}/auth/logout`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` },
            });
        } catch {
            // silencioso — continuar con el logout aunque falle la red
        }
    }
    localStorage.clear();
    window.location.href = '/';
}
