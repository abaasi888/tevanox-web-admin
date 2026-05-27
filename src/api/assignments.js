import api from './client'

export const assignmentsApi = {
  getAll: (params) => api.get('/admin/assignments', { params }),
  assign: (data) => api.post('/admin/assignments/assign', data),
  revoke: (assignmentId) => api.delete(`/admin/assignments/${assignmentId}`),
  getUserAssignments: (userId) => api.get(`/admin/assignments/user/${userId}`),
  getProductAssignments: (productId) => api.get(`/admin/assignments/product/${productId}`)
}