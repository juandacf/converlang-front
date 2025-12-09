import { api } from './api';

export const usersService = {
  // Obtener lista de usuarios (con filtro opcional por rol)
  getAllUsers: async (role = 'all') => {
    const endpoint = role !== 'all' ? `/admin/users?role=${role}` : '/admin/users';
    return await api.get(endpoint);
  },

  // Actualizar estado (Activo/Inactivo) o editar info
  updateUser: async (userId, data) => {
    return await api.patch(`/admin/users/${userId}`, data);
  },

  // Eliminar usuario
  deleteUser: async (userId) => {
    return await api.delete(`/admin/users/${userId}`);
  }
};