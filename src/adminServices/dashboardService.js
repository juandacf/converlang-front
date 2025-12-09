import { api } from './api';

// --- DATOS MOCK (RESPALDO) ---
// Estos se usarán si el Backend está apagado o falla la conexión.
const mockStats = {
  total_users: 0,
  active_users: 0,
  total_matches: 0,
  total_sessions: 0,
  visitors_count: 0,
  logged_in_count: 0,
  growth_users: 0,
  growth_active: 0
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

export const dashboardService = {
  // 1. Obtener contadores principales
  getStats: async () => {
    try {
      // Intenta llamar al backend real
      const response = await api.get('/admin/stats');
      console.log("✅ Stats cargados del Backend:", response);
      return response;
    } catch (error) {
      // Si falla, muestra el error en consola y usa datos falsos
      console.error("❌ ERROR CONECTANDO AL BACKEND (STATS):", error);
      return mockStats;
    }
  },

  // 2. Obtener datos para gráficas
  getActivity: async () => {
    try {
      const response = await api.get('/admin/activity');
      return response;
    } catch (error) {
      console.error("❌ ERROR CONECTANDO AL BACKEND (ACTIVITY):", error);
      return mockActivity;
    }
  },

  // 3. Obtener reseñas recientes
  getRecentReviews: async () => {
    try {
      const response = await api.get('/admin/reviews');
      return response;
    } catch (error) {
      console.error("❌ ERROR CONECTANDO AL BACKEND (REVIEWS):", error);
      return []; // Retorna array vacío si falla
    }
  }
};