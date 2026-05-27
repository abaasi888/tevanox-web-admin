import api from './client'

export const devicesApi = {
  getAll: (params) => api.get('/devices/admin/all', { params }),
  getOne: (deviceId) => api.get(`/devices/${deviceId}`),
  updateStatus: (deviceId, status) => api.put(`/devices/${deviceId}/status`, { status }),
  delete: (deviceId) => api.delete(`/devices/${deviceId}`),
  trackLocation: (deviceId) => api.get(`/devices/${deviceId}/location`)
}