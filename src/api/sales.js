import api from './client'

export const salesApi = {
  getAll: (params) => api.get('/sales/admin/all', { params }),
  getStats: (period) => api.get('/sales/admin/stats', { params: { period } }),
  getByProduct: (productId, params) => api.get(`/sales/admin/product/${productId}`, { params }),
  getByEmployee: (employeeId, params) => api.get(`/sales/admin/employee/${employeeId}`, { params }),
  exportReport: (params) => api.get('/sales/admin/export', { params, responseType: 'blob' })
}