import { api } from './api';

/**
 * Servicio para gestión de usuarios desde el panel de administración
 * Conecta con los endpoints del backend definidos en admin.controller.ts
 */
export const usersService = {

  // ========================================
  // CRUD DE USUARIOS
  // ========================================

  /**
   * Crear un nuevo usuario
   * POST /admin/users
   * @param {Object} userData - Datos del usuario a crear
   * @returns {Promise<Object>} Usuario creado
   */
  createUser: async (userData) => {
    try {
      const response = await api.post('/admin/users', userData);
      console.log('✅ Usuario creado exitosamente:', response);
      return response;
    } catch (error) {
      console.error('❌ Error al crear usuario:', error.message);
      throw new Error(error.message || 'Error al crear usuario');
    }
  },

  /**
   * Obtener todos los usuarios
   * GET /admin/users?includeInactive=false&role=all
   * @param {Object} options - Opciones de filtrado
   * @param {boolean} options.includeInactive - Incluir usuarios inactivos
   * @param {string} options.role - Filtrar por rol ('admin', 'teacher', 'user', 'all')
   * @returns {Promise<Array>} Lista de usuarios
   */
  getAllUsers: async ({ includeInactive = false, role = 'all' } = {}) => {
    try {
      // Construir query params
      const params = new URLSearchParams();

      if (includeInactive) {
        params.append('includeInactive', 'true');
      }

      if (role && role !== 'all') {
        params.append('role', role);
      }

      const queryString = params.toString();
      const endpoint = queryString ? `/admin/users?${queryString}` : '/admin/users';

      const response = await api.get(endpoint);
      console.log(`✅ Usuarios obtenidos (${response.length}):`, response);
      return response;
    } catch (error) {
      console.error('❌ Error al obtener usuarios:', error.message);
      // Retornar array vacío en caso de error para evitar crashes en el frontend
      return [];
    }
  },

  /**
   * Obtener un usuario específico por ID
   * GET /admin/users/:id
   * @param {number} userId - ID del usuario
   * @returns {Promise<Object>} Datos del usuario
   */
  getUserById: async (userId) => {
    try {
      const response = await api.get(`/admin/users/${userId}`);
      console.log('✅ Usuario obtenido:', response);
      return response;
    } catch (error) {
      console.error(`❌ Error al obtener usuario ${userId}:`, error.message);
      throw new Error(error.message || 'Usuario no encontrado');
    }
  },

  /**
   * Actualizar un usuario existente
   * PUT /admin/users/:id
   * @param {number} userId - ID del usuario a actualizar
   * @param {Object} userData - Datos a actualizar
   * @returns {Promise<Object>} Confirmación de actualización
   */
  updateUser: async (userId, userData) => {
    try {
      const response = await api.put(`/admin/users/${userId}`, userData);
      console.log('✅ Usuario actualizado:', response);
      return response;
    } catch (error) {
      console.error(`❌ Error al actualizar usuario ${userId}:`, error.message);
      throw new Error(error.message || 'Error al actualizar usuario');
    }
  },

  /**
   * Cambiar contraseña de usuario (solo admin)
   * PATCH /admin/users/:id/password
   * @param {number} userId - ID del usuario
   * @param {string} password - Nueva contraseña
   * @returns {Promise<Object>} Confirmación de cambio de contraseña
   */
  changePassword: async (userId, password) => {
    try {
      const response = await api.patch(`/admin/users/${userId}/password`, { password });
      console.log('✅ Contraseña de usuario cambiada:', response);
      return response;
    } catch (error) {
      console.error(`❌ Error al cambiar contraseña del usuario ${userId}:`, error.message);
      throw new Error(error.message || 'Error al cambiar contraseña');
    }
  },

  /**
   * Inactivar un usuario (soft delete)
   * DELETE /admin/users/:id
   * @param {number} userId - ID del usuario a inactivar
   * @returns {Promise<Object>} Confirmación de inactivación
   */
  deleteUser: async (userId) => {
    try {
      const response = await api.delete(`/admin/users/${userId}`);
      console.log('✅ Usuario inactivado:', response);
      return response;
    } catch (error) {
      console.error(`❌ Error al inactivar usuario ${userId}:`, error.message);
      throw new Error(error.message || 'Error al inactivar usuario');
    }
  },

  /**
   * Reactivar un usuario inactivo
   * PATCH /admin/users/:id/activate
   * @param {number} userId - ID del usuario a reactivar
   * @returns {Promise<Object>} Confirmación de reactivación
   */
  activateUser: async (userId) => {
    try {
      const response = await api.patch(`/admin/users/${userId}/activate`);
      console.log('✅ Usuario reactivado:', response);
      return response;
    } catch (error) {
      console.error(`❌ Error al reactivar usuario ${userId}:`, error.message);
      throw new Error(error.message || 'Error al reactivar usuario');
    }
  },

  // ========================================
  // MÉTODOS LEGACY (para compatibilidad)
  // ========================================

  /**
   * @deprecated Usar getAllUsers({ role }) en su lugar
   * Obtener usuarios filtrados por rol
   */
  getUsersByRole: async (role = 'all') => {
    console.warn('⚠️ getUsersByRole está deprecado, usar getAllUsers({ role }) en su lugar');
    return await usersService.getAllUsers({ role });
  },

  /**
   * Reportar un usuario por comportamiento inapropiado
   * POST /users/report/:id
   * @param {number} userId - ID del usuario a reportar
   * @returns {Promise<Object>} Datos del reporte
   */
  reportUser: async (userId) => {
    try {
      const response = await api.post(`/users/report/${userId}`);
      console.log('✅ Usuario reportado:', response);
      return response;
    } catch (error) {
      console.error(`❌ Error al reportar usuario ${userId}:`, error.message);
      throw new Error(error.message || 'Error al reportar usuario');
    }
  },
};