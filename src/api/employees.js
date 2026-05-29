import api from './client'

export const employeesApi = {
  getAll: (params) => api.get('/employees/admin/all', { params }),
  getOne: (employeeId) => api.get(`/employees/admin/${employeeId}`),
  approveKyc: (employeeId) => api.post(`/employees/admin/${employeeId}/approve`),
  promoteToPermanent: (data) => api.post('/employees/admin/promote', data),
  delete: (employeeId) => api.delete(`/employees/admin/${employeeId}`),
  getCommissions: (employeeId, params) => api.get(`/employees/admin/${employeeId}/commissions`, { params })
}