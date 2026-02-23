/**
 * AdminDashboard - Panel de Administración Completo
 * 
 * Características principales:
 * - CRUD completo de usuarios con modales
 * - Estadísticas en tiempo real
 * - Gráficos interactivos (Recharts)
 * - Diseño profesional estilo Power BI
 * - Responsive design
 * - Integración con servicios del backend
 * - Sistema de notificaciones Toast
 * - Validaciones de formularios
 * - Manejo robusto de errores
 * 
 * Seguridad:
 * - Verificación de autenticación
 * - Validación de rol de administrador
 * - Protección de rutas
 * 
 * @author ConverLang Team
 * @version 2.0
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import {
  Users,
  Activity,
  MessageSquare,
  TrendingUp,
  Eye,
  LogIn,
  Clock,
  Star,
  Search,
  Edit2,
  Trash2,
  Plus,
  Filter,
  Download,
  RefreshCw,
  Globe,
  Menu,
  Bell,
  BarChart2,
  User,
  Settings,
  LogOut,
  ChevronDown,
  Lock
} from 'lucide-react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

// Importar servicios actualizados
import {
  dashboardService,
  usersService,
  constants
} from '../../adminServices';

// Importar componentes de modales
import { CreateUserModal } from './modals/CreateUserModal';
import { EditUserModal } from './modals/EditUserModal';
import { ChangePasswordModal } from './modals/ChangePasswordModal';
import { DeleteConfirmModal } from './modals/DeleteConfirmModal';
import { ActivateConfirmModal } from './modals/ActivateConfirmModal';
import { Toast } from './components/Toast';

/**
 * Paleta de colores estilo Power BI
 */
const COLORS = {
  primary: '#0078D4',
  secondary: '#2B88D8',
  success: '#107C10',
  warning: '#FFB900',
  danger: '#D13438',
  purple: '#8764B8',
  teal: '#00BCF2',
  pink: '#E3008C'
};

// ========================================
// COMPONENTES VISUALES
// ========================================

/**
 * Tarjeta de estadística con gradiente y animación
 */
const StatCard = ({ title, value, icon: Icon, trend, color = "blue", subtitle }) => {
  const colorClasses = {
    blue: { bg: 'from-blue-500 to-blue-600', icon: 'bg-blue-100 text-blue-600' },
    green: { bg: 'from-green-500 to-green-600', icon: 'bg-green-100 text-green-600' },
    purple: { bg: 'from-purple-500 to-purple-600', icon: 'bg-purple-100 text-purple-600' },
    orange: { bg: 'from-orange-500 to-orange-600', icon: 'bg-orange-100 text-orange-600' },
    pink: { bg: 'from-pink-500 to-pink-600', icon: 'bg-pink-100 text-pink-600' },
    teal: { bg: 'from-teal-500 to-teal-600', icon: 'bg-teal-100 text-teal-600' }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden border border-slate-100 group" style={{ userSelect: 'none' }}>
      <div className={`h-1 bg-gradient-to-r ${colorClasses[color].bg}`}></div>
      <div className="p-5">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">{title}</p>
            <p className="text-3xl font-bold text-slate-800 mb-1">{value?.toLocaleString()}</p>
            {subtitle && (
              <p className="text-xs text-slate-400">{subtitle}</p>
            )}

          </div>
          <div className={`${colorClasses[color].icon} p-3 rounded-lg group-hover:scale-110 transition-transform duration-300`}>
            <Icon size={24} />
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Componente contenedor seguro para gráficos Recharts
 * Renderiza el gráfico solo cuando el contenedor tiene dimensiones válidas
 * Soluciona el error "width(-1)" monitoreando el tamaño real del DOM
 */
const SafeChartContainer = ({ children, height = 300, className = "" }) => {
  const containerRef = React.useRef(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (!containerRef.current) return;

    const resizeObserver = new ResizeObserver((entries) => {
      // Usar requestAnimationFrame para suavidad y evitar loops
      requestAnimationFrame(() => {
        if (!Array.isArray(entries) || !entries.length) return;

        const entry = entries[0];
        const { width, height } = entry.contentRect;

        // Solo actualizar si las dimensiones son válidas y han cambiado
        if (width > 0 && height > 0) {
          setDimensions(prev => {
            if (Math.abs(prev.width - width) < 1 && Math.abs(prev.height - height) < 1) {
              return prev;
            }
            return { width, height };
          });
        }
      });
    });

    resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  // Preparar hijos con dimensiones explícitas
  const childrenWithProps = React.Children.map(children, child => {
    if (React.isValidElement(child) && dimensions.width > 0) {
      return React.cloneElement(child, {
        width: dimensions.width,
        height: dimensions.height
      });
    }
    return null;
  });

  return (
    <div
      ref={containerRef}
      style={{ width: '100%', height: `${height}px`, minHeight: `${height}px`, userSelect: 'none' }}
      className={`relative ${className}`}
    >
      {dimensions.width > 0 ? (
        childrenWithProps
      ) : (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-50 rounded-lg">
          <div className="w-8 h-8 border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
        </div>
      )}
    </div>
  );
};

/**
 * Gráfico de área para actividad semanal
 */
const ActivityLineChart = ({ data, onRefresh }) => {
  // Validar que hay datos antes de renderizar
  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-bold text-slate-800">Actividad en Tiempo Real</h3>
            <p className="text-sm text-slate-500 mt-1">Matches y sesiones de los últimos 7 días</p>
          </div>
        </div>
        <div className="h-[300px] flex items-center justify-center">
          <p className="text-slate-400">No hay datos de actividad disponibles</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6" style={{ userSelect: 'none' }}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-slate-800">Actividad en Tiempo Real</h3>
          <p className="text-sm text-slate-500 mt-1">Matches y sesiones de los últimos 7 días</p>
        </div>
        <button
          onClick={onRefresh}
          className="flex items-center gap-2 px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors"
        >
          <RefreshCw size={14} />
          <span className="text-xs font-semibold">Actualizar</span>
        </button>
      </div>
      <SafeChartContainer height={300}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorMatches" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#0078D4" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#0078D4" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorSesiones" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#107C10" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#107C10" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
          <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} axisLine={false} tickLine={false} />
          <YAxis stroke="#94a3b8" fontSize={12} axisLine={false} tickLine={false} />
          <Tooltip
            contentStyle={{
              backgroundColor: '#fff',
              border: 'none',
              borderRadius: '8px',
              boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
            }}
          />
          <Legend wrapperStyle={{ fontSize: '12px', fontWeight: '500' }} />
          <Area
            type="monotone"
            dataKey="matches"
            stroke="#0078D4"
            strokeWidth={3}
            fillOpacity={1}
            fill="url(#colorMatches)"
            name="Matches"
          />
          <Area
            type="monotone"
            dataKey="sesiones"
            stroke="#107C10"
            strokeWidth={3}
            fillOpacity={1}
            fill="url(#colorSesiones)"
            name="Sesiones"
          />
        </AreaChart>
      </SafeChartContainer>
    </div>
  );
};

/**
 * Gráfico de barras para crecimiento de usuarios
 */
const UserGrowthChart = ({ data }) => {
  // Validar que hay datos antes de renderizar
  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6" style={{ userSelect: 'none' }}>
        <h3 className="text-lg font-bold text-slate-800 mb-2">Crecimiento de Usuarios</h3>
        <p className="text-sm text-slate-500 mb-6">Nuevos registros por día</p>
        <div className="h-[280px] flex items-center justify-center">
          <p className="text-slate-400">No hay datos de crecimiento disponibles</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6" style={{ userSelect: 'none' }}>
      <h3 className="text-lg font-bold text-slate-800 mb-2">Crecimiento de Usuarios</h3>
      <p className="text-sm text-slate-500 mb-6">Nuevos registros por día</p>
      <SafeChartContainer height={280}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
          <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} axisLine={false} tickLine={false} />
          <YAxis stroke="#94a3b8" fontSize={12} axisLine={false} tickLine={false} />
          <Tooltip
            contentStyle={{
              backgroundColor: '#fff',
              border: 'none',
              borderRadius: '8px',
              boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
            }}
          />
          <Legend wrapperStyle={{ fontSize: '12px', fontWeight: '500' }} />
          <Bar dataKey="nuevos_usuarios" fill="#8764B8" radius={[4, 4, 0, 0]} name="Nuevos Usuarios" />
        </BarChart>
      </SafeChartContainer>
    </div>
  );
};

/**
 * Gráfico de dona para distribución de usuarios
 */
const UserDistributionChart = ({ data }) => {
  // Configuración de colores por defecto
  const COLORS = {
    'Usuarios Activos': '#107C10',
    'Usuarios Inactivos': '#D13438',
    'Administradores': '#8764B8'
  };

  // Si no hay datos, mostrar estado vacío o loading
  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 flex flex-col items-center justify-center h-[380px]">
        <p className="text-slate-400">No hay datos de distribución disponibles</p>
      </div>
    );
  }

  // Asegurar que cada entrada tenga su color
  const processedData = data.map(entry => ({
    ...entry,
    color: entry.color || COLORS[entry.name] || '#8884d8'
  }));

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6" style={{ userSelect: 'none' }}>
      <h3 className="text-lg font-bold text-slate-800 mb-2">Distribución</h3>
      <p className="text-sm text-slate-500 mb-6">Por rol y estado</p>
      <SafeChartContainer height={280}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={5}
            dataKey="value"
          >
            {processedData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: '#fff',
              border: 'none',
              borderRadius: '8px',
              boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
            }}
          />
          <Legend
            verticalAlign="bottom"
            height={36}
            wrapperStyle={{ fontSize: '12px', fontWeight: '500' }}
          />
        </PieChart>
      </SafeChartContainer>
    </div>
  );
};



/**
 * Tabla de usuarios con filtros y búsqueda
 */
const UsersTable = ({ users, onEdit, onDelete, onActivate, onCreate }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('active'); // 'active', 'inactive', 'all'

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || user.role_code === filterRole;
    const matchesStatus = filterStatus === 'all' ||
      (filterStatus === 'active' && user.is_active) ||
      (filterStatus === 'inactive' && !user.is_active);
    return matchesSearch && matchesRole && matchesStatus;
  });

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
      <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-slate-800">Directorio de Usuarios</h3>
          <p className="text-sm text-slate-500 mt-1">{filteredUsers.length} registros encontrados</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {/* Filtro de Estado */}
          <div className="flex bg-slate-100 rounded-lg p-1">
            <button
              onClick={() => setFilterStatus('active')}
              className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${filterStatus === 'active'
                ? 'bg-green-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
                }`}
            >
              Activos
            </button>
            <button
              onClick={() => setFilterStatus('inactive')}
              className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${filterStatus === 'inactive'
                ? 'bg-red-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
                }`}
            >
              Inactivos
            </button>
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${filterStatus === 'all'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
                }`}
            >
              Todos
            </button>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Buscar..."
              className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 w-48"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-600"
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
          >
            <option value="all">Todos</option>
            <option value="admin">Admins</option>
            <option value="user">Users</option>
          </select>
          <button
            onClick={onCreate}
            className="flex items-center gap-2 px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
          >
            <Plus size={16} />
            <span className="hidden sm:inline">Nuevo</span>
          </button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-600">
          <thead className="bg-slate-50 text-slate-700 font-semibold uppercase text-xs">
            <tr>
              <th className="px-6 py-4">Usuario</th>
              <th className="px-6 py-4">Email</th>
              <th className="px-6 py-4">Rol</th>
              <th className="px-6 py-4">Estado</th>
              <th className="px-6 py-4">Último Login</th>
              <th className="px-6 py-4 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-6 py-12 text-center text-slate-400">
                  No se encontraron usuarios
                </td>
              </tr>
            ) : (
              filteredUsers.map((user) => (
                <tr key={user.id_user} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-xs">
                        {user.first_name?.charAt(0)}{user.last_name?.charAt(0)}
                      </div>
                      <div>
                        <div className="font-medium text-slate-900">{user.first_name} {user.last_name}</div>
                        <div className="text-xs text-slate-400">ID: {user.id_user}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-xs font-mono">{user.email}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${user.role_code === 'admin' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                      user.role_code === 'teacher' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                        'bg-slate-50 text-slate-700 border-slate-200'
                      }`}>
                      {constants.ROLE_LABELS[user.role_code] || user.role_code}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${user.is_active ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                      }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${user.is_active ? 'bg-green-500' : 'bg-red-500'}`}></span>
                      {user.is_active ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs">
                    {user.last_login ? new Date(user.last_login).toLocaleDateString() : 'Nunca'}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {user.role_code !== 'admin' && (
                        <>
                          <button
                            onClick={() => onEdit(user)}
                            className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
                            title="Editar"
                          >
                            <Edit2 size={16} />
                          </button>
                          {user.is_active ? (
                            <button
                              onClick={() => onDelete(user)}
                              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                              title="Inactivar"
                            >
                              <Trash2 size={16} />
                            </button>
                          ) : (
                            <button
                              onClick={() => onActivate(user)}
                              className="p-1.5 text-slate-400 hover:text-green-600 hover:bg-green-50 rounded transition-colors"
                              title="Reactivar"
                            >
                              <RefreshCw size={16} />
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

/**
 * Panel de métricas adicionales
 */
const MetricsPanel = ({ metrics }) => {
  // Si no hay métricas, mostrar estado de carga
  if (!metrics) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 h-full" style={{ userSelect: 'none' }}>
        <h3 className="text-lg font-bold text-slate-800 mb-6">Métricas Clave</h3>
        <div className="flex items-center justify-center h-32">
          <div className="w-8 h-8 border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  // Convertir el objeto de métricas a un array para mapear
  const metricsArray = [
    metrics.total_matches,
    metrics.online_users,
    metrics.completed_sessions,
    metrics.average_time
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 h-full" style={{ userSelect: 'none' }}>
      <h3 className="text-lg font-bold text-slate-800 mb-6">Métricas Clave</h3>
      <div className="space-y-6">
        {metricsArray.map((metric, index) => (
          <div key={index} className="flex items-center justify-between p-2 hover:bg-slate-50 rounded-lg transition-colors">
            <div>
              <span className="text-slate-600 font-medium text-sm">{metric.label}</span>
              {metric.description && (
                <p className="text-xs text-slate-400 mt-0.5">{metric.description}</p>
              )}
            </div>
            <span className={`text-xl font-bold ${metric.color}`}>{metric.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// ========================================
// COMPONENTE PRINCIPAL
// ========================================

/**
 * AdminDashboard - Componente principal del panel de administración
 */
export function AdminDashboard() {
  // ========================================
  // ESTADO DE LA APLICACIÓN
  // ========================================

  // Layout
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');

  // Datos del dashboard
  const [stats, setStats] = useState(null);
  const [activityData, setActivityData] = useState([]);
  const [userDistribution, setUserDistribution] = useState([]);
  const [userGrowthData, setUserGrowthData] = useState([]);

  const [users, setUsers] = useState([]);
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  // Modales
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showActivateModal, setShowActivateModal] = useState(false);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  // Notificaciones
  const [toast, setToast] = useState(null);

  // ========================================
  // SEGURIDAD Y AUTENTICACIÓN
  // ========================================

  /**
   * Verifica que el usuario esté autenticado y sea administrador
   */
  useEffect(() => {
    const checkAuth = () => {
      const user = JSON.parse(localStorage.getItem('user') || 'null');
      const token = localStorage.getItem('token');

      // Verificar si hay sesión activa
      if (!user || !token) {
        console.warn('⚠️ No hay sesión activa. Redirigir a login.');
        // TODO: Descomentar para producción
        // navigate('/');
        return false;
      }

      // Verificar si es administrador
      if (user.role_code !== 'admin') {
        console.error('❌ Usuario no tiene permisos de administrador');
        showToast('No tienes permisos para acceder a esta sección', 'error');
        // TODO: Redirigir a página de error o dashboard de usuario
        return false;
      }


      return true;
    };

    checkAuth();
  }, []);

  // ========================================
  // CARGA DE DATOS
  // ========================================

  /**
   * Carga todos los datos del dashboard desde el backend
   * @param {boolean} isBackgroundUpdate - Si es true, no muestra el spinner de carga general
   */
  const loadDashboardData = async (isBackgroundUpdate = false) => {
    try {
      if (!isBackgroundUpdate) {
        setLoading(true);
      }

      // Cargar datos en paralelo para mejor rendimiento
      const [statsData, activityData, usersData, distributionData, metricsData, userGrowthData] = await Promise.all([
        dashboardService.getStats(),
        dashboardService.getActivity(),
        usersService.getAllUsers({ includeInactive: true }),
        dashboardService.getUserDistribution(),
        dashboardService.getMetrics(),
        dashboardService.getUserGrowth()
      ]);

      // Actualizar estado con los datos recibidos
      setStats(statsData);
      setActivityData(activityData);
      setUsers(usersData);
      setUserDistribution(distributionData);
      setMetrics(metricsData);
      setUserGrowthData(userGrowthData);


    } catch (error) {
      console.error('❌ Error cargando datos del dashboard:', error);
      showToast('Error al cargar datos del dashboard', 'error');
    } finally {
      if (!isBackgroundUpdate) {
        setLoading(false);
      }
    }
  };

  /**
   * Carga inicial y actualización periódica cada 30 segundos
   */
  useEffect(() => {
    loadDashboardData();

    // Actualizar datos cada 30 segundos de forma silenciosa
    const interval = setInterval(() => {
      loadDashboardData(true);
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  // ── Heartbeat: reportar que el admin está activo en su dashboard ──
  useEffect(() => {
    const sendHeartbeat = async () => {
      const t = localStorage.getItem('token');
      if (!t) return;
      try {
        const API_BASE = import.meta.env.VITE_BACKEND_API_URL;
        await fetch(`${API_BASE}/auth/heartbeat`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${t}` }
        });
      } catch (e) { /* silencioso */ }
    };
    sendHeartbeat();
    const interval = setInterval(sendHeartbeat, 60000);
    return () => clearInterval(interval);
  }, []);

  // ========================================
  // HANDLERS DE MODALES Y CRUD
  // ========================================

  /**
   * Muestra notificación toast
   */
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  /**
   * Abre modal de creación de usuario
   */
  const handleCreateClick = () => {
    setShowCreateModal(true);
  };

  /**
   * Callback después de crear usuario exitosamente
   */
  const handleCreateSuccess = (newUser) => {
    showToast(`Usuario ${newUser.first_name} ${newUser.last_name} creado exitosamente`, 'success');
    loadDashboardData(); // Recargar datos
  };

  /**
   * Abre modal de edición con el usuario seleccionado
   */
  const handleEditClick = (user) => {
    setSelectedUser(user);
    setShowEditModal(true);
  };

  /**
   * Callback después de actualizar usuario exitosamente
   */
  const handleEditSuccess = () => {
    showToast('Usuario actualizado exitosamente', 'success');
    setSelectedUser(null);
    loadDashboardData(); // Recargar datos
  };

  /**
   * Abre modal de confirmación de eliminación
   */
  const handleDeleteClick = (user) => {
    setSelectedUser(user);
    setShowDeleteModal(true);
  };

  /**
   * Callback después de eliminar usuario exitosamente
   */
  const handleDeleteSuccess = () => {
    showToast('Usuario inactivado exitosamente', 'success');
    setSelectedUser(null);
    loadDashboardData(); // Recargar datos
  };

  /**
   * Callback después de cambiar contraseña exitosamente
   */
  const handleChangePasswordSuccess = () => {
    showToast('Contraseña actualizada exitosamente', 'success');
  };

  /**
   * Abre modal de confirmación de reactivación
   */
  const handleActivateClick = (user) => {
    setSelectedUser(user);
    setShowActivateModal(true);
  };

  /**
   * Callback después de reactivar usuario exitosamente
   */
  const handleActivateSuccess = () => {
    showToast('Usuario reactivado exitosamente', 'success');
    setSelectedUser(null);
    loadDashboardData(); // Recargar datos
  };

  /**
   * Cerrar sesión
   */
  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    navigate('/');
  };

  // ========================================
  // RENDERIZADO CONDICIONAL POR TAB
  // ========================================

  /**
   * Renderiza el contenido según la tab activa
   */
  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex h-full items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto"></div>
            <p className="mt-4 text-slate-600 font-medium">Cargando datos...</p>
          </div>
        </div>
      );
    }

    switch (activeTab) {
      case 'dashboard':
        return (
          <div className="space-y-6">
            {/* Grid de Estadísticas */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
              <StatCard title="Total Usuarios" value={stats?.total_users} icon={Users} trend={12} color="blue" subtitle="Registrados" />
              <StatCard title="Usuarios Activos" value={stats?.active_users} icon={Activity} trend={8} color="green" subtitle="Últimas 24h" />
              <StatCard title="Total Matches" value={stats?.total_matches} icon={MessageSquare} trend={-3} color="purple" subtitle="Conexiones" />
              <StatCard title="Sesiones Totales" value={stats?.total_sessions} icon={Clock} trend={15} color="orange" subtitle="Completadas" />
              <StatCard title="Mensajes Hoy" value={stats?.messages_today} icon={MessageSquare} trend={0} color="pink" subtitle="Enviados hoy" />
              <StatCard title="Logueados" value={stats?.logged_in_count} icon={LogIn} trend={5} color="teal" subtitle="En este momento" />
            </div>

            {/* Gráficos Principales */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              <div className="xl:col-span-2">
                <ActivityLineChart data={activityData} onRefresh={loadDashboardData} />
              </div>
              <div>
                <UserDistributionChart data={userDistribution} />
              </div>
            </div>

            {/* Segunda Fila */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <UserGrowthChart data={userGrowthData} />
              <MetricsPanel metrics={metrics} />
            </div>
          </div>
        );

      case 'users':
        return (
          <UsersTable
            users={users}
            onEdit={handleEditClick}
            onDelete={handleDeleteClick}
            onActivate={handleActivateClick}
            onCreate={handleCreateClick}
          />
        );

      case 'analytics':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ActivityLineChart data={activityData} />
              <UserGrowthChart data={userGrowthData} />
            </div>
            <MetricsPanel metrics={metrics} />
          </div>
        );

      default:
        return null;
    }
  };

  // ========================================
  // RENDERIZADO PRINCIPAL
  // ========================================

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-800 overflow-hidden" style={{ userSelect: 'none' }}>

      {/* SIDEBAR */}
      <aside className={`bg-white border-r border-slate-200 transition-all duration-300 flex flex-col ${sidebarOpen ? 'w-64' : 'w-20'}`}>
        <div className="h-16 flex items-center justify-center border-b border-slate-100">
          <div className="flex items-center justify-center w-full px-4">
            {sidebarOpen ? (
              <img
                src="/assets/img/converlang_horizontal.png"
                alt="ConverLang Logo"
                className="h-64 w-auto object-contain"
              />
            ) : (
              <Globe className="w-8 h-8 text-indigo-600" />
            )}
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`w-full flex items-center gap-3 p-3 rounded-lg transition ${activeTab === 'dashboard' ? 'bg-indigo-50 text-indigo-600' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            <Activity size={20} />
            {sidebarOpen && <span>Dashboard</span>}
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`w-full flex items-center gap-3 p-3 rounded-lg transition ${activeTab === 'users' ? 'bg-indigo-50 text-indigo-600' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            <Users size={20} />
            {sidebarOpen && <span>Usuarios</span>}
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`w-full flex items-center gap-3 p-3 rounded-lg transition ${activeTab === 'analytics' ? 'bg-indigo-50 text-indigo-600' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            <BarChart2 size={20} />
            {sidebarOpen && <span>Analíticas</span>}
          </button>
        </nav>

        <div className="p-4 border-t border-slate-100">
          <div className={`flex items-center gap-3 ${!sidebarOpen && 'justify-center'}`}>
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold flex-shrink-0">
              A
            </div>
            {sidebarOpen && (
              <div className="flex-1 overflow-hidden">
                <p className="text-sm font-bold truncate">Admin User</p>
                <p className="text-xs text-slate-500 truncate">admin@converlang.com</p>
              </div>
            )}

            {sidebarOpen && (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="p-1 hover:bg-slate-100 rounded-lg transition-colors text-slate-400 hover:text-slate-600"
                >
                  <Settings size={20} />
                </button>

                {/* Dropdown Menu */}
                {showUserMenu && (
                  <div className="absolute bottom-full left-0 mb-2 w-48 bg-white rounded-xl shadow-lg border border-slate-100 overflow-hidden z-50 animate-in fade-in slide-in-from-bottom-2 duration-200">
                    <div className="p-1">
                      <button
                        onClick={() => {
                          setShowUserMenu(false);
                          setShowChangePasswordModal(true);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
                      >
                        <Lock size={16} />
                        <span>Cambiar Contraseña</span>
                      </button>
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <LogOut size={16} />
                        <span>Cerrar Sesión</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col h-full overflow-hidden">
        {/* HEADER */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 hover:bg-slate-100 rounded-lg text-slate-500">
            <Menu size={20} />
          </button>
        </header>

        {/* CONTENIDO SCROLLABLE */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-slate-900 capitalize">
                {activeTab === 'dashboard' ? 'Dashboard General' : activeTab}
              </h1>
            </div>
            {renderContent()}
          </div>
        </div>
      </main>

      {/* MODALES */}
      <CreateUserModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={handleCreateSuccess}
      />

      <EditUserModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedUser(null);
        }}
        onSuccess={handleEditSuccess}
        userId={selectedUser?.id_user}
      />

      <DeleteConfirmModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedUser(null);
        }}
        onSuccess={handleDeleteSuccess}
        user={selectedUser}
      />

      <ActivateConfirmModal
        isOpen={showActivateModal}
        onClose={() => {
          setShowActivateModal(false);
          setSelectedUser(null);
        }}
        onSuccess={handleActivateSuccess}
        user={selectedUser}
      />

      <ChangePasswordModal
        isOpen={showChangePasswordModal}
        onClose={() => setShowChangePasswordModal(false)}
        onSuccess={handleChangePasswordSuccess}
        userId={(() => {
          try {
            const token = localStorage.getItem('token');
            if (!token) return null;
            const decoded = jwtDecode(token);
            return decoded.sub;
          } catch (e) {
            return null;
          }
        })()}
      />

      {/* TOAST NOTIFICATIONS */}
      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}