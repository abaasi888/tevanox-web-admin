import api from './client'

export const jobsApi = {
  // Public endpoints (for landing page)
  getActiveJobs: () => api.get('/jobs/'),
  getJob: (jobId) => api.get(`/jobs/${jobId}`),
  
  // Admin endpoints
  getAllJobs: (params) => api.get('/jobs/admin/all', { params }),
  getJobAdmin: (jobId) => api.get(`/jobs/admin/${jobId}`),
  createJob: (data) => api.post('/jobs/admin', data),
  updateJob: (jobId, data) => api.put(`/jobs/admin/${jobId}`, data),
  deleteJob: (jobId) => api.delete(`/jobs/admin/${jobId}`),
  
  // Applications
  getApplications: (params) => api.get('/jobs/admin/applications', { params }),
  getApplication: (appId) => api.get(`/jobs/admin/applications/${appId}`),
  updateApplicationStatus: (appId, status) => api.put(`/jobs/admin/applications/${appId}/status`, null, { params: { status } }),
  
  // Stats
  getJobStats: () => api.get('/jobs/admin/stats')
}