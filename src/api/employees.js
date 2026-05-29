import api from './client'
import { COMMISSION_RATES } from './commissions'

export const employeesApi = {
  getAll: (params) => api.get('/employees/admin/all', { params }),
  getOne: (employeeId) => api.get(`/employees/admin/${employeeId}`),
  approveKyc: (employeeId) => api.post(`/employees/admin/${employeeId}/approve`),
  promoteToPermanent: (data) => api.post('/employees/admin/promote', data),
  delete: (employeeId) => api.delete(`/employees/admin/${employeeId}`),
  getCommissions: (employeeId, params) => api.get(`/employees/admin/${employeeId}/commissions`, { params }),
  
  // Get commission summary for an employee
  getCommissionSummary: (employeeId) => api.get(`/employees/admin/${employeeId}/commission-summary`),
  
  // Check if employee qualifies for permanent position
  checkPermanentEligibility: (employeeId) => api.get(`/employees/admin/${employeeId}/permanent-eligibility`),
  
  // Get commission breakdown by product
  getCommissionsByProduct: (employeeId) => api.get(`/employees/admin/${employeeId}/commissions-by-product`)
}

// Helper function to calculate commission based on Tevanox rates
export const calculateEmployeeCommission = (employeeRole, transactionType, isSelfReferred = false) => {
  if (employeeRole === 'sales_agent') {
    return {
      oneTimeRate: COMMISSION_RATES.SALES_AGENT.ONE_TIME,
      recurringRate: COMMISSION_RATES.SALES_AGENT.RECURRING,
      description: 'Sales Agent Commission: 20% one-time + 2% recurring'
    }
  } else if (employeeRole === 'technical_agent') {
    if (isSelfReferred) {
      return {
        oneTimeRate: COMMISSION_RATES.TECHNICAL_AGENT.SELF_REFERRED_FLASHED.ONE_TIME,
        recurringRate: COMMISSION_RATES.TECHNICAL_AGENT.SELF_REFERRED_FLASHED.RECURRING,
        description: 'Technical Agent (Self-referred + flashed): 30% one-time + 5% recurring'
      }
    } else {
      return {
        oneTimeRate: COMMISSION_RATES.TECHNICAL_AGENT.FLASH_ONLY.ONE_TIME,
        recurringRate: COMMISSION_RATES.TECHNICAL_AGENT.FLASH_ONLY.RECURRING,
        description: 'Technical Agent (Flash only): 10% one-time (no recurring)'
      }
    }
  }
  return null
}