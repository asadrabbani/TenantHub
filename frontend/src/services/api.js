import axios from 'axios';

const configuredBase = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/+$/, '');
const api = axios.create({ baseURL: configuredBase, timeout: 12000, headers: { 'Content-Type': 'application/json' } });

api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(response => response, error => {
  const message = error.response?.data?.message || (error.code === 'ECONNABORTED' ? 'The server took too long to respond.' : error.message);
  return Promise.reject(Object.assign(error, { userMessage: message }));
});

export const authAPI = {
  register: data => api.post('/api/auth/register', data),
  login: data => api.post('/api/auth/login', data),
  me: () => api.get('/api/auth/me'),
  updateProfile: data => api.put('/api/auth/profile', data),
};
export const propertiesAPI = {
  getAll: params => api.get('/api/properties', { params }),
  getById: id => api.get(`/api/properties/${id}`),
  create: data => api.post('/api/properties', data),
  update: (id, data) => api.put(`/api/properties/${id}`, data),
  remove: id => api.delete(`/api/properties/${id}`),
  recommendations: () => api.get('/api/properties/user/recommendations'),
  getRecommendations: () => api.get('/api/properties/user/recommendations'),
};
export const bookingsAPI = {
  create: data => api.post('/api/bookings', data),
  myBookings: () => api.get('/api/bookings/my-bookings'),
  getMyBookings: () => api.get('/api/bookings/my-bookings'),
  getById: id => api.get(`/api/bookings/${id}`),
  pay: (id, data) => api.post(`/api/bookings/${id}/payment`, data),
  adminAll: params => api.get('/api/bookings/admin/all', { params }),
  getAllAdmin: params => api.get('/api/bookings/admin/all', { params }),
  adminAction: (id, data) => api.put(`/api/bookings/${id}/admin-action`, data),
  processPayment: (id, data) => api.post(`/api/bookings/${id}/payment`, data),
};
export const notificationsAPI = {
  list: params => api.get('/api/notifications', { params }),
  markRead: id => api.put(`/api/notifications/${id}/read`),
  markAllRead: () => api.put('/api/notifications/mark-all-read'),
  remove: id => api.delete(`/api/notifications/${id}`),
};
export const dashboardAPI = {
  owner: () => api.get('/api/dashboard/owner'),
  getOwnerDashboard: () => api.get('/api/dashboard/owner'),
  updateOwner: data => api.put('/api/dashboard/owner', data),
  ownerFinancials: params => api.get('/api/dashboard/owner/financials', { params }),
  generateMonthlyReport: params => api.get('/api/dashboard/owner/financials', { params }),
  admin: () => api.get('/api/dashboard/admin'),
  adminRecs: params => api.get('/api/dashboard/admin/recommendations', { params }),
};
export const commuteAPI = {
  nearbyMosques: params => api.get('/api/commute/nearby-mosques', { params }),
  propertiesWithCommute: params => api.get('/api/commute/properties-with-commute', { params }),
  listRoutes: params => api.get('/api/commute/routes', { params }),
  createRoute: data => api.post('/api/commute/routes', data),
  getRoute: id => api.get(`/api/commute/routes/${id}`),
  updateRoute: (id, data) => api.put(`/api/commute/routes/${id}`, data),
  deleteRoute: id => api.delete(`/api/commute/routes/${id}`),
  toggleFavorite: id => api.put(`/api/commute/routes/${id}/favorite`),
  addAlert: (id, data) => api.post(`/api/commute/routes/${id}/alerts`, data),
};

export default api;
