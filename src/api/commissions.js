import api from './client'

export const commissionsApi = {
  getPending: (params) => api.get('/commissions/admin/pending', { params }),
  getSummary: () => api.get('/commissions/admin/summary'),
  markPaid: (commissionIds) => api.post('/commissions/admin/mark-paid', commissionIds),
  getAgentDetails: (agentId, params) => api.get(`/commissions/admin/agent/${agentId}`, { params })
}