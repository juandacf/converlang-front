import { Navigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { isTokenExpired } from '../../config/authFetch';

/**
 * Guard para rutas de usuario.
 * Si el token expiró, redirige al login.
 * Si el usuario tiene rol "admin", lo redirige a /adminDashboard.
 * Si no hay token, lo redirige al login ("/").
 */
export function UserRoute({ children }) {
    const token = localStorage.getItem('token');

    if (!token) {
        return <Navigate to="/" replace />;
    }

    if (isTokenExpired()) {
        localStorage.removeItem('token');
        return <Navigate to="/" replace />;
    }

    try {
        const decoded = jwtDecode(token);
        const role = decoded.roles?.[0];

        if (role === 'admin') {
            return <Navigate to="/adminDashboard" replace />;
        }

        return children;
    } catch {
        localStorage.removeItem('token');
        return <Navigate to="/" replace />;
    }
}
