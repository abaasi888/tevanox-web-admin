import api from './client'

export const employeesApi = {
  getAll: (params) => api.get('/employees/admin/all', { params }),
  getOne: (employeeId) => api.get(`/employees/admin/${employeeId}`),
  approveKyc: (employeeId) => api.post(`/employees/admin/${employeeId}/approve-kyc`),
  promoteToPermanent: (data) => api.post('/employees/admin/promote', data),
  delete: (employeeId) => api.delete(`/employees/admin/${employeeId}`),
  getCommission: (employeeId, params) => api.get(`/employees/admin/${employeeId}/commission`, { params })
}