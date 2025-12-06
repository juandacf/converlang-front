import React, { useState, useEffect } from 'react';
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
  BarChart2
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

// --- CONFIGURACIÓN Y CONSTANTES (Del código nuevo) ---

const COLORS = {
  primary: '#0078D4',
  secondary: '#2B88D8',
  success: '#107C10',
  warning: '#FFB900',
  danger: '#D13438',
  purple: '#8764B8',
  teal: '#00BCF2',
  pink: '#E3008C',
  gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
};

// --- COMPONENTES DEL CÓDIGO PROPORCIONADO (Adaptados al Layout) ---

// 1. COMPONENTE DE TARJETA DE ESTADÍSTICA MEJORADO
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
    <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden border border-slate-100 group">
      <div className={`h-1 bg-gradient-to-r ${colorClasses[color].bg}`}></div>
      <div className="p-5">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">{title}</p>
            <p className="text-3xl font-bold text-slate-800 mb-1">{value?.toLocaleString()}</p>
            {subtitle && (
              <p className="text-xs text-slate-400">{subtitle}</p>
            )}
            {trend && (
              <div className={`flex items-center gap-1 mt-3 ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
                <TrendingUp size={14} className={trend < 0 ? 'rotate-180' : ''} />
                <span className="text-xs font-semibold">
                  {Math.abs(trend)}% vs mes anterior
                </span>
              </div>
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

// 2. GRÁFICO DE LÍNEAS ESTILO POWER BI
const ActivityLineChart = ({ data }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-slate-800">Actividad en Tiempo Real</h3>
          <p className="text-sm text-slate-500 mt-1">Matches y sesiones de los últimos 7 días</p>
        </div>
        <button className="flex items-center gap-2 px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors">
          <RefreshCw size={14} />
          <span className="text-xs font-semibold">Actualizar</span>
        </button>
      </div>
      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorMatches" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0078D4" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#0078D4" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorSesiones" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#107C10" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#107C10" stopOpacity={0}/>
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
        </ResponsiveContainer>
      </div>
    </div>
  );
};

// 3. GRÁFICO DE BARRAS COMPARATIVO
const ComparisonBarChart = ({ data }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
      <h3 className="text-lg font-bold text-slate-800 mb-2">Comparación Semanal</h3>
      <p className="text-sm text-slate-500 mb-6">Actividad por tipo de sesión</p>
      <div className="h-[280px] w-full">
        <ResponsiveContainer width="100%" height="100%">
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
            <Bar dataKey="matches" fill="#0078D4" radius={[4, 4, 0, 0]} name="Matches" />
            <Bar dataKey="sesiones" fill="#107C10" radius={[4, 4, 0, 0]} name="Sesiones" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

// 4. GRÁFICO DE DONA (PIE CHART)
const UserDistributionChart = () => {
  const data = [
    { name: 'Usuarios Activos', value: 89, color: '#107C10' },
    { name: 'Usuarios Inactivos', value: 34, color: '#D13438' },
    { name: 'Teachers', value: 23, color: '#0078D4' },
    { name: 'Administradores', value: 10, color: '#8764B8' }
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
      <h3 className="text-lg font-bold text-slate-800 mb-2">Distribución</h3>
      <p className="text-sm text-slate-500 mb-6">Por rol y estado</p>
      <div className="h-[280px] w-full">
        <ResponsiveContainer width="100%" height="100%">
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
              {data.map((entry, index) => (
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
        </ResponsiveContainer>
      </div>
    </div>
  );
};

// 5. COMPONENTE DE RESEÑAS MEJORADO
const ReviewsSection = ({ reviews }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 h-full">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-slate-800">Reseñas Recientes</h3>
          <p className="text-sm text-slate-500 mt-1">Últimas calificaciones</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1 bg-yellow-50 rounded-lg border border-yellow-100">
          <Star size={16} className="fill-yellow-400 text-yellow-400" />
          <span className="text-sm font-bold text-yellow-700">4.8</span>
        </div>
      </div>
      <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
        {reviews.map((review, index) => (
          <div key={index} className="border border-slate-100 rounded-lg p-4 hover:bg-slate-50 transition-colors">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white text-xs font-bold">
                  {review.user_name.charAt(0)}
                </div>
                <div>
                  <span className="font-semibold text-slate-800 text-sm block">{review.user_name}</span>
                  <span className="text-xs text-slate-400">ID: {review.session_id}</span>
                </div>
              </div>
              <div className="flex items-center gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    size={12} 
                    className={i < review.rating ? "fill-yellow-400 text-yellow-400" : "text-slate-200"}
                  />
                ))}
              </div>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed italic">"{review.comment || "Sin comentarios"}"</p>
          </div>
        ))}
      </div>
    </div>
  );
};

// 6. TABLA DE USUARIOS MEJORADA (Con Filtros)
const UsersTable = ({ users, onEdit, onDelete }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
   
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          user.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || user.role_code === filterRole;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
      <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-slate-800">Directorio de Usuarios</h3>
          <p className="text-sm text-slate-500 mt-1">{filteredUsers.length} registros encontrados</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
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
            <option value="teacher">Teachers</option>
            <option value="user">Users</option>
          </select>
          <button className="flex items-center gap-2 px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium">
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
            {filteredUsers.map((user) => (
              <tr key={user.id_user} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-xs">
                      {user.first_name.charAt(0)}{user.last_name.charAt(0)}
                    </div>
                    <div>
                      <div className="font-medium text-slate-900">{user.first_name} {user.last_name}</div>
                      <div className="text-xs text-slate-400">ID: {user.id_user}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-xs font-mono">{user.email}</td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                    user.role_code === 'admin' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                    user.role_code === 'teacher' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                    'bg-slate-50 text-slate-700 border-slate-200'
                  }`}>
                    {user.role_code}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    user.is_active ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
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
                    <button
                      onClick={() => onEdit(user)}
                      className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
                      title="Editar"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => onDelete(user.id_user)}
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                      title="Eliminar"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// 7. SECCIÓN DE MÉTRICAS ADICIONALES
const MetricsPanel = () => {
  const metrics = [
    { label: 'Tasa de Conversión', value: '7.1%', trend: '+2.3%', color: 'text-green-600' },
    { label: 'Usuarios Verificados', value: '92%', trend: '+5.1%', color: 'text-blue-600' },
    { label: 'Sesiones Completadas', value: '456', trend: '+12.4%', color: 'text-purple-600' },
    { label: 'Tiempo Promedio', value: '45min', trend: '-3.2%', color: 'text-orange-600' }
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 h-full">
      <h3 className="text-lg font-bold text-slate-800 mb-6">Métricas Clave</h3>
      <div className="space-y-6">
        {metrics.map((metric, index) => (
          <div key={index} className="flex items-center justify-between p-2 hover:bg-slate-50 rounded-lg transition-colors">
            <span className="text-slate-600 font-medium text-sm">{metric.label}</span>
            <div className="flex items-center gap-3">
              <span className={`text-xl font-bold ${metric.color}`}>{metric.value}</span>
              <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                metric.trend.startsWith('+') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
              }`}>
                {metric.trend}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// --- APP PRINCIPAL (Combina Layout Anterior + Lógica Nueva) ---

export function AdminDashboard() {
  // ESTADO DEL LAYOUT (Sidebar)
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');

  // ESTADO DE DATOS (Del código nuevo)
  const [stats, setStats] = useState(null);
  const [activityData, setActivityData] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // LÓGICA DE CARGA (Del código nuevo)
  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Simulación de Fetch
      const statsResponse = {
        total_users: 156,
        active_users: 89,
        total_matches: 234,
        total_sessions: 567,
        visitors_count: 1250,
        logged_in_count: 89
      };
      setStats(statsResponse);

      const activityResponse = [
        { name: 'Lun', matches: 12, sesiones: 25 },
        { name: 'Mar', matches: 19, sesiones: 32 },
        { name: 'Mié', matches: 15, sesiones: 28 },
        { name: 'Jue', matches: 22, sesiones: 35 },
        { name: 'Vie', matches: 28, sesiones: 42 },
        { name: 'Sáb', matches: 17, sesiones: 30 },
        { name: 'Dom', matches: 14, sesiones: 22 }
      ];
      setActivityData(activityResponse);

      const reviewsResponse = [
        { session_id: 'SES_001', user_name: 'Carlos Ramírez', rating: 5, comment: 'Excelente experiencia de aprendizaje.' },
        { session_id: 'SES_002', user_name: 'María López', rating: 4, comment: 'Muy buena clase, aprendí mucho.' },
        { session_id: 'SES_003', user_name: 'John Smith', rating: 5, comment: 'Great teacher! Very patient.' },
        { session_id: 'SES_004', user_name: 'Ana Pereira', rating: 5, comment: 'Adorei a aula!' },
        { session_id: 'SES_005', user_name: 'Luc Dubois', rating: 4, comment: 'Bonne session, merci beaucoup!' }
      ];
      setReviews(reviewsResponse);

      const usersResponse = [
        { id_user: 1, first_name: 'Carlos', last_name: 'Ramírez', email: 'carlos@gmail.com', role_code: 'user', is_active: true, last_login: '2025-12-05T10:30:00' },
        { id_user: 2, first_name: 'María', last_name: 'López', email: 'maria@gmail.com', role_code: 'teacher', is_active: true, last_login: '2025-12-05T09:15:00' },
        { id_user: 3, first_name: 'John', last_name: 'Smith', email: 'john@gmail.com', role_code: 'user', is_active: true, last_login: '2025-12-04T16:45:00' },
        { id_user: 4, first_name: 'Ana', last_name: 'Pereira', email: 'ana@outlook.com', role_code: 'teacher', is_active: true, last_login: '2025-12-05T11:20:00' },
        { id_user: 5, first_name: 'Luc', last_name: 'Dubois', email: 'luc@protonmail.com', role_code: 'admin', is_active: true, last_login: '2025-12-05T08:00:00' }
      ];
      setUsers(usersResponse);

    } catch (error) {
      console.error('Error cargando datos:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
    const interval = setInterval(() => {
      loadDashboardData();
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleEditUser = (user) => {
    alert(`Editar usuario: ${user.first_name} ${user.last_name}`);
  };

  const handleDeleteUser = (userId) => {
    if (window.confirm('¿Estás seguro de eliminar este usuario?')) {
      setUsers(users.filter(u => u.id_user !== userId));
    }
  };

  // Renderizado Condicional del Contenido Principal
  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex h-full items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      );
    }

    switch (activeTab) {
      case 'dashboard':
        return (
          <div className="space-y-6">
            {/* Grid de Estadísticas */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
              <StatCard title="Total Usuarios" value={stats.total_users} icon={Users} trend={12} color="blue" subtitle="Registrados" />
              <StatCard title="Usuarios Activos" value={stats.active_users} icon={Activity} trend={8} color="green" subtitle="Últimas 24h" />
              <StatCard title="Total Matches" value={stats.total_matches} icon={MessageSquare} trend={-3} color="purple" subtitle="Conexiones" />
              <StatCard title="Sesiones Totales" value={stats.total_sessions} icon={Clock} trend={15} color="orange" subtitle="Completadas" />
              <StatCard title="Visitantes" value={stats.visitors_count} icon={Eye} trend={22} color="pink" subtitle="Visitas únicas" />
              <StatCard title="Logueados" value={stats.logged_in_count} icon={LogIn} trend={5} color="teal" subtitle="En este momento" />
            </div>

            {/* Gráficos Principales */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              <div className="xl:col-span-2">
                <ActivityLineChart data={activityData} />
              </div>
              <div>
                <UserDistributionChart />
              </div>
            </div>

            {/* Segunda Fila */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <ComparisonBarChart data={activityData} />
              <div className="grid grid-cols-1 gap-6">
                 <MetricsPanel />
                 <ReviewsSection reviews={reviews} />
              </div>
            </div>
            
            {/* Tabla en Dashboard también (resumen o completa) */}
            <div className="mt-6">
               <UsersTable users={users} onEdit={handleEditUser} onDelete={handleDeleteUser} />
            </div>
          </div>
        );
      case 'users':
        return <UsersTable users={users} onEdit={handleEditUser} onDelete={handleDeleteUser} />;
      case 'analytics':
        return (
          <div className="space-y-6">
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ActivityLineChart data={activityData} />
                <ComparisonBarChart data={activityData} />
             </div>
             <MetricsPanel />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-800 overflow-hidden">
      
      {/* SIDEBAR (Layout original) */}
      <aside className={`bg-white border-r border-slate-200 transition-all duration-300 flex flex-col ${sidebarOpen ? 'w-64' : 'w-20'}`}>
        <div className="h-16 flex items-center justify-center border-b border-slate-100">
          <div className="flex items-center gap-2 font-bold text-xl text-indigo-600">
            <Globe className="w-8 h-8" />
            {sidebarOpen && <span>ConverLang</span>}
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
             <div className="w-10 h-10 rounded-full bg-slate-200 flex-shrink-0" />
             {sidebarOpen && (
               <div className="overflow-hidden">
                 <p className="text-sm font-bold truncate">Admin User</p>
                 <p className="text-xs text-slate-500 truncate">admin@converlang.com</p>
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
          
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-3 mr-4">
               <button className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-lg shadow-sm hover:bg-slate-50 transition text-xs font-medium text-slate-600">
                 <Download size={14} />
                 <span>Exportar</span>
               </button>
               <button className="flex items-center gap-2 px-3 py-1.5 bg-indigo-50 border border-indigo-100 rounded-lg shadow-sm hover:bg-indigo-100 transition text-xs font-medium text-indigo-600">
                 <Filter size={14} />
                 <span>Filtros</span>
               </button>
            </div>
            <button className="relative p-2 hover:bg-slate-100 rounded-full text-slate-500">
              <Bell size={20} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
            </button>
          </div>
        </header>

        {/* CONTENIDO SCROLLABLE */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50">
          <div className="max-w-7xl mx-auto">
             <div className="mb-8">
                <h1 className="text-2xl font-bold text-slate-900 capitalize">
                  {activeTab === 'dashboard' ? 'Dashboard General' : activeTab}
                </h1>
                <p className="text-slate-500 text-sm mt-1">
                  Resumen de actividad y métricas clave de ConverLang.
                </p>
             </div>
             {renderContent()}
          </div>
        </div>
      </main>
    </div>
  );
}