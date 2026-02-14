import { jwtDecode } from 'jwt-decode';

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
