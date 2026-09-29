import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const message = error.response.data?.detail || error.message
      return Promise.reject(new Error(message))
    }
    return Promise.reject(error)
  }
)

export const binsApi = {
  list: (params = {}) => api.get('/bins', { params }),
  get: (id) => api.get(`/bins/${id}`),
  updateFill: (id, data) => api.post(`/bins/${id}/fill`, data),
  getKpis: () => api.get('/bins/kpis'),
  getReadings: (id, params = {}) => api.get(`/bins/${id}/readings`, { params }),
  collect: (id) => api.post(`/bins/${id}/collect`),
}

export const vehiclesApi = {
  list: (params = {}) => api.get('/vehicles', { params }),
  get: (id) => api.get(`/vehicles/${id}`),
  update: (id, data) => api.patch(`/vehicles/${id}`, data),
  getRoutes: (id) => api.get(`/vehicles/${id}/routes`),
}

export const routesApi = {
  list: (params = {}) => api.get('/routes', { params }),
  get: (id) => api.get(`/routes/${id}`),
  optimize: (data) => api.post('/routes/optimize', data),
  optimizeAll: (data) => api.post('/routes/optimize-all', data),
}

export const sanitizationApi = {
  listSites: (params = {}) => api.get('/sanitization/sites', { params }),
  getSite: (id) => api.get(`/sanitization/sites/${id}`),
  updateSite: (id, data) => api.patch(`/sanitization/sites/${id}`, data),
  trigger: (siteId, data) => api.post(`/sanitization/sites/${siteId}/trigger`, data),
  getLogs: (siteId, limit = 50) => api.get(`/sanitization/sites/${siteId}/logs`, { params: { limit } }),
  getScore: (siteId) => api.get(`/sanitization/sites/${siteId}/score`),
  getAllScores: () => api.get('/sanitization/scores'),
  markCleaned: (siteId, data) => api.post(`/sanitization/sites/${siteId}/clean`, data),
}

export const aiApi = {
  classify: (data) => api.post('/ai/classify', data),
  getClassifications: (params = {}) => api.get('/ai/classifications', { params }),
  getLatest: (binId) => api.get(`/ai/classifications/${binId}/latest`),
  simulate: (binId) => api.post(`/ai/simulate/${binId}`),
}

export const analyticsApi = {
  getKpis: () => api.get('/analytics/kpis'),
  getWasteTrends: (days = 7) => api.get('/analytics/waste-trends', { params: { days } }),
  getSegregationTrends: (days = 7) => api.get('/analytics/segregation-trends', { params: { days } }),
  getVehicleEfficiency: () => api.get('/analytics/vehicle-efficiency'),
  getBinFillDistribution: () => api.get('/analytics/bin-fill-distribution'),
  getWasteTypeBreakdown: () => api.get('/analytics/waste-type-breakdown'),
  getSanitizationCoverage: () => api.get('/analytics/sanitization-coverage'),
}

export const alertsApi = {
  list: (params = {}) => api.get('/alerts', { params }),
  get: (id) => api.get(`/alerts/${id}`),
  create: (data) => api.post('/alerts', data),
  update: (id, data) => api.patch(`/alerts/${id}`, data),
  check: () => api.post('/alerts/check'),
}

export const dashboardApi = {
  getSummary: () => api.get('/dashboard/summary'),
}

export function formatValue(value, unit = '') {
  if (value === null || value === undefined) return 'N/A'
  if (typeof value === 'number') {
    return `${value.toLocaleString()}${unit ? ` ${unit}` : ''}`
  }
  return `${value}${unit ? ` ${unit}` : ''}`
}

export function formatPercent(value) {
  if (value === null || value === undefined) return 'N/A'
  return `${value.toFixed(1)}%`
}

export default api