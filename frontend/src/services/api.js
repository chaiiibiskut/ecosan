import axios from 'axios';

const rawBase = import.meta.env.VITE_API_URL;
const baseURL = rawBase ? `${rawBase.replace(/\/$/, '')}/api` : '/api';

const api = axios.create({
  baseURL,
  timeout: 10000,
});

export const binsApi = {
  list: (params = {}) => api.get('/bins', { params }),
  getKpis: () => api.get('/bins/kpis'),
  get: (id) => api.get(`/bins/${id}`),
  getReadings: (id, params = {}) => api.get(`/bins/${id}/readings`, { params }),
  collect: (id) => api.post(`/bins/${id}/collect`),
};

export const alertsApi = {
  list: (params = {}) => api.get('/alerts', { params }),
  get: (id) => api.get(`/alerts/${id}`),
  resolve: (id) => api.patch(`/alerts/${id}`, { is_resolved: true }),
  check: () => api.post('/alerts/check'),
};

export const dashboardApi = {
  getSummary: () => api.get('/dashboard/summary'),
};

export const vehiclesApi = {
  list: (params = {}) => api.get('/vehicles', { params }),
  get: (id) => api.get(`/vehicles/${id}`),
  getRoutes: (id) => api.get(`/vehicles/${id}/routes`),
  updateLocation: (id, data) => api.patch(`/vehicles/${id}/location`, data),
};

export const routesApi = {
  list: (params = {}) => api.get('/routes', { params }),
  get: (id) => api.get(`/routes/${id}`),
  optimize: (data) => api.post('/routes/optimize', data),
  optimizeAll: (data) => api.post('/routes/optimize-all', data),
};

export const sanitizationApi = {
  getSites: (params = {}) => api.get('/sanitization/sites', { params }),
  getScores: () => api.get('/sanitization/scores'),
  getCoverage: () => api.get('/analytics/sanitization-coverage'),
  triggerSanitization: (siteId, data) => api.post(`/sanitization/sites/${siteId}/trigger`, data),
  getLogs: (siteId) => api.get(`/sanitization/sites/${siteId}/logs`),
  markClean: (siteId, data) => api.post(`/sanitization/sites/${siteId}/clean`, data),
};

export const aiApi = {
  classify: (data) => api.post('/ai/classify', data),
  simulate: (binId) => api.post(`/ai/simulate/${binId}`),
  getHistory: (params = {}) => api.get('/ai/classifications', { params }),
  getLatest: (binId) => api.get(`/ai/classifications/${binId}/latest`),
};

export const analyticsApi = {
  getKpis: () => api.get('/analytics/kpis'),
  getWasteTrends: (params = {}) => api.get('/analytics/waste-trends', { params }),
  getSegregationTrends: (params = {}) => api.get('/analytics/segregation-trends', { params }),
  getVehicleEfficiency: () => api.get('/analytics/vehicle-efficiency'),
  getBinFillDistribution: () => api.get('/analytics/bin-fill-distribution'),
  getWasteTypeBreakdown: (params = {}) => api.get('/analytics/waste-type-breakdown', { params }),
  getWasteTypeBreakdownCollected: (params = {}) => api.get('/analytics/waste-type-breakdown-collected', { params }),
  getSanitizationCoverage: () => api.get('/analytics/sanitization-coverage'),
};

export default api;