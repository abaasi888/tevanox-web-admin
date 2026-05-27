import api from './client'

export const usersApi = {
  getAll: (params) => api.get('/admin/users', { params }),
  getOne: (userId) => api.get(`/admin/users/${userId}`),
  approveKyc: (userId) => api.post('/admin/users/approve', { user_id: userId }),
  delete: (userId) => api.delete(`/admin/users/${userId}`),
  getActivity: (userId, params) => api.get(`/admin/users/${userId}/activity`, { params })
}