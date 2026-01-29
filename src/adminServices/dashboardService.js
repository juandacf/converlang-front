import { api } from './api';

/**
 * Servicio para obtener estadísticas y datos del dashboard de administración
 * Conecta con los endpoints del backend definidos en admin.controller.ts
 */

// ========================================
// DATOS MOCK (RESPALDO)
// ========================================
// Estos se usarán si el Backend está apagado o falla la conexión.

const mockStats = {
  total_users: 0,
  active_users: 0,
  total_matches: 0,
  total_sessions: 0,
  visitors_count: 0,
  logged_in_count: 0,
  growth_users: 0,
  growth_active: 0,
  sessions_breakdown: {
    teaching: 0,
    exchange: 0
  }
};

const mockActivity = [
  { name: 'Lun', matches: 0, sesiones: 0 },
  { name: 'Mar', matches: 0, sesiones: 0 },
  { name: 'Mie', matches: 0, sesiones: 0 },
  { name: 'Jue', matches: 0, sesiones: 0 },
  { name: 'Vie', matches: 0, sesiones: 0 },
  { name: 'Sab', matches: 0, sesiones: 0 },
  { name: 'Dom', matches: 0, sesiones: 0 },
];

const mockUserDistribution = [
  { name: 'Usuarios Activos', value: 0, color: '#107C10' },
  { name: 'Usuarios Inactivos', value: 0, color: '#D13438' },
  { name: 'Teachers', value: 0, color: '#0078D4' },
  { name: 'Administradores', value: 0, color: '#8764B8' }
];

const mockReviews = [];

// ========================================
// SERVICIO DE DASHBOARD
// ========================================

export const dashboardService = {

  /**
   * Obtener estadísticas generales del dashboard
   * GET /admin/stats
   * @returns {Promise<Object>} Estadísticas de usuarios, matches y sesiones
   */
  getStats: async () => {
    try {
      const response = await api.get('/admin/stats');
      console.log('✅ Estadísticas cargadas del backend:', response);

      // Validar que la respuesta tenga la estructura esperada
      if (!response || typeof response !== 'object') {
        console.warn('⚠️ Respuesta de stats tiene formato inesperado, usando mock');
        return mockStats;
      }

      return response;
    } catch (error) {
      console.error('❌ ERROR al conectar con el backend (STATS):', error.message);
      console.warn('🔄 Usando datos mock para estadísticas');
      return mockStats;
    }
  },

  /**
   * Obtener actividad semanal (matches y sesiones)
   * GET /admin/activity
   * @returns {Promise<Array>} Datos de actividad de los últimos 7 días
   */
  getActivity: async () => {
    try {
      const response = await api.get('/admin/activity');
      console.log('✅ Actividad semanal cargada del backend:', response);

      // Validar que sea un array
      if (!Array.isArray(response)) {
        console.warn('⚠️ Respuesta de activity no es un array, usando mock');
        return mockActivity;
      }

      return response;
    } catch (error) {
      console.error('❌ ERROR al conectar con el backend (ACTIVITY):', error.message);
      console.warn('🔄 Usando datos mock para actividad');
      return mockActivity;
    }
  },

  /**
   * Obtener reseñas recientes de sesiones completadas
   * GET /admin/reviews
   * @returns {Promise<Array>} Últimas reseñas
   */
  getRecentReviews: async () => {
    try {
      const response = await api.get('/admin/reviews');
      console.log('✅ Reseñas recientes cargadas del backend:', response);

      // Validar que sea un array
      if (!Array.isArray(response)) {
        console.warn('⚠️ Respuesta de reviews no es un array, usando mock');
        return mockReviews;
      }

      return response;
    } catch (error) {
      console.error('❌ ERROR al conectar con el backend (REVIEWS):', error.message);
      console.warn('🔄 Usando datos mock para reseñas');
      return mockReviews;
    }
  },

  /**
   * Obtener distribución de usuarios por rol y estado
   * GET /admin/user-distribution
   * @returns {Promise<Array>} Distribución de usuarios
   */
  getUserDistribution: async () => {
    try {
      const response = await api.get('/admin/user-distribution');
      console.log('✅ Distribución usuarios cargada del backend:', response);

      if (!Array.isArray(response)) {
        console.warn('⚠️ Respuesta de user-distribution no es un array, usando mock');
        return mockUserDistribution;
      }
      return response;
    } catch (error) {
      console.error('❌ ERROR al conectar con el backend (USER_DISTRIBUTION):', error.message);
      console.warn('🔄 Usando datos mock para distribución de usuarios');
      return mockUserDistribution;
    }
  },

  /**
   * Obtener métricas clave del dashboard
   * GET /admin/metrics
   * @returns {Promise<Object>} Métricas calculadas con tendencias
   */
  getMetrics: async () => {
    try {
      const response = await api.get('/admin/metrics');
      console.log('✅ Métricas cargadas del backend:', response);

      if (!response || typeof response !== 'object') {
        console.warn('⚠️ Respuesta de metrics tiene formato inesperado');
        return null;
      }

      return response;
    } catch (error) {
      console.error('❌ ERROR al conectar con el backend (METRICS):', error.message);
      console.warn('🔄 Métricas no disponibles');
      return null;
    }
  },

  /**
   * Obtener crecimiento de usuarios (nuevos registros por día)
   * GET /admin/user-growth
   * @returns {Promise<Array>} Datos de nuevos usuarios de los últimos 7 días
   */
  getUserGrowth: async () => {
    try {
      const response = await api.get('/admin/user-growth');
      console.log('✅ Crecimiento de usuarios cargado del backend:', response);

      if (!Array.isArray(response)) {
        console.warn('⚠️ Respuesta de user-growth no es un array');
        return [];
      }

      return response;
    } catch (error) {
      console.error('❌ ERROR al conectar con el backend (USER_GROWTH):', error.message);
      return [];
    }
  },

  /**
   * Obtener todos los datos del dashboard en una sola llamada
   * Útil para cargar el dashboard completo de una vez
   * @returns {Promise<Object>} Objeto con stats, activity y reviews
   */
  getDashboardData: async () => {
    try {
      console.log('📊 Cargando datos completos del dashboard...');

      // Ejecutar todas las peticiones en paralelo para mejor rendimiento
      const [stats, activity, reviews, userDistribution] = await Promise.all([
        dashboardService.getStats(),
        dashboardService.getActivity(),
        dashboardService.getRecentReviews(),
        dashboardService.getUserDistribution()
      ]);

      console.log('✅ Datos del dashboard cargados exitosamente');

      return {
        stats,
        activity,
        reviews,
        userDistribution
      };
    } catch (error) {
      console.error('❌ ERROR al cargar datos del dashboard:', error.message);

      // Retornar datos mock en caso de error total
      return {
        stats: mockStats,
        activity: mockActivity,
        reviews: mockReviews,
        userDistribution: mockUserDistribution
      };
    }
  },

  /**
   * Verificar la conexión con el backend
   * @returns {Promise<boolean>} true si el backend está disponible
   */
  checkBackendConnection: async () => {
    try {
      await api.get('/admin/stats');
      console.log('✅ Conexión con el backend establecida');
      return true;
    } catch (error) {
      console.error('❌ No se pudo conectar con el backend:', error.message);
      return false;
    }
  }
};

// ========================================
// EXPORTAR TAMBIÉN LOS MOCKS (para testing)
// ========================================

export const mocks = {
  mockStats,
  mockActivity,
  mockReviews,
  mockUserDistribution
};