import api from './client'

export const activityApi = {
  getStats: (days) => api.get('/admin/activity/stats', { params: { days } }),
  getUserActivity: (userId, params) => api.get(`/admin/activity/user/${userId}`, { params }),
  getProductActivity: (productId, params) => api.get(`/admin/activity/product/${productId}`, { params }),
  exportLogs: (params) => api.get('/admin/activity/export', { params, responseType: 'blob' })
}