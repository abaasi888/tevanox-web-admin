import api from './client'

export const productsApi = {
  getAll: (params) => api.get('/admin/products/all', { params }),
  getOne: (productId) => api.get(`/admin/products/${productId}`),
  create: (data) => api.post('/admin/products/create', data),
  update: (productId, data) => api.put(`/admin/products/${productId}`, data),
  delete: (productId) => api.delete(`/admin/products/${productId}`),
  getStats: (productId) => api.get(`/admin/products/${productId}/stats`)
}