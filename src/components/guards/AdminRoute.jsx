import { Navigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

/**
 * Guard para rutas de administrador.
 * Si el usuario NO tiene rol "admin", lo redirige a /dashboard.
 * Si no hay token, lo redirige al login ("/").
 */
export function AdminRoute({ children }) {
    const token = localStorage.getItem('token');

    if (!token) {
        return <Navigate to="/" replace />;
    }

    try {
        const decoded = jwtDecode(token);
        const role = decoded.roles?.[0];

        if (role !== 'admin') {
            return <Navigate to="/dashboard" replace />;
        }

        return children;
    } catch {
        localStorage.removeItem('token');
        return <Navigate to="/" replace />;
    }
}
