import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
  changePassword: (data) => api.put('/auth/change-password', data),
};

export const accountsAPI = {
  getAll: (params) => api.get('/accounts', { params }),
  get: (id) => api.get(`/accounts/${id}`),
  create: (data) => api.post('/accounts', data),
  update: (id, data) => api.put(`/accounts/${id}`, data),
  delete: (id) => api.delete(`/accounts/${id}`),
  getStats: () => api.get('/accounts/stats'),
  sync: (id) => api.post(`/accounts/${id}/sync`),
};

export const campaignsAPI = {
  getAll: () => api.get('/campaigns'),
  get: (id) => api.get(`/campaigns/${id}`),
  getByAccount: (accountId) => api.get(`/campaigns/account/${accountId}`),
  create: (data) => api.post('/campaigns', data),
  update: (id, data) => api.put(`/campaigns/${id}`, data),
};

export const performanceAPI = {
  getByAccount: (accountId, params) => api.get(`/performance/${accountId}`, { params }),
  getSummary: (accountId) => api.get(`/performance/${accountId}/summary`),
  getOverall: (params) => api.get('/performance/overall', { params }),
};

export const reportsAPI = {
  getAll: () => api.get('/reports'),
  get: (id) => api.get(`/reports/${id}`),
  getByAccount: (accountId) => api.get(`/reports/account/${accountId}`),
  generate: (data) => api.post('/reports', data),
  exportCSV: () => api.get('/reports/export/csv', { responseType: 'blob' }),
  exportPDF: () => api.get('/reports/export/pdf', { responseType: 'blob' }),
};

export const settingsAPI = {
  get: () => api.get('/settings'),
  update: (data) => api.put('/settings', data),
  getOAuthUrl: () => api.get('/settings/oauth-url'),
};

export default api;
