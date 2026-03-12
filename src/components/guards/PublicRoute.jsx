import { Navigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { isTokenExpired } from '../../config/authFetch';

/**
 * Guard para rutas públicas (login, signup, auth).
 * Si el usuario ya está autenticado, lo redirige al dashboard correspondiente.
 */
export function PublicRoute({ children }) {
    const token = localStorage.getItem('token');

    if (!token || isTokenExpired()) {
        if (isTokenExpired()) {
            localStorage.removeItem('token');
        }
        return children;
    }

    try {
        const decoded = jwtDecode(token);
        const role = decoded.roles?.[0];

        if (role === 'admin') {
            return <Navigate to="/adminDashboard" replace />;
        }

        return <Navigate to="/dashboard" replace />;
    } catch {
        localStorage.removeItem('token');
        return children;
    }
}
