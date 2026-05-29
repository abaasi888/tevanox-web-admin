import api from './client'

// Commission rates based on Tevanox landing page
export const COMMISSION_RATES = {
  // Sales Agent Rates
  SALES_AGENT: {
    ONE_TIME: 0.20,      // 20% one-time commission
    RECURRING: 0.02,     // 2% recurring monthly commission
    ROLE: 'sales_agent',
    REQUIREMENTS: ['android_phone', 'internet']
  },
  
  // Technical Agent Rates
  TECHNICAL_AGENT: {
    SELF_REFERRED_FLASHED: {
      ONE_TIME: 0.30,    // 30% one-time (self-referred + self-flashed)
      RECURRING: 0.05,   // 5% recurring monthly
      TYPE: 'self'
    },
    FLASH_ONLY: {
      ONE_TIME: 0.10,    // 10% one-time only (flashing for other agents)
      RECURRING: 0.00,   // No recurring
      TYPE: 'flash_only'
    },
    ROLE: 'technical_agent',
    REQUIREMENTS: ['android_phone', 'computer', 'internet']
  },
  
  // Minimum payout threshold
  MIN_PAYOUT_UGX: 50000,  // UGX 50,000
  
  // Permanent promotion thresholds
  PERMANENT_THRESHOLD_MONTHS: 3,
  PERMANENT_MIN_SIGNUPS: 50
}

export const commissionsApi = {
  // Get pending commissions for admin
  getPending: (params) => api.get('/commissions/admin/pending', { params }),
  
  // Get commission summary
  getSummary: () => api.get('/commissions/admin/summary'),
  
  // Mark commissions as paid
  markPaid: (commissionIds) => api.post('/commissions/admin/mark-paid', { commission_ids: commissionIds }),
  
  // Get agent details with commission breakdown
  getAgentDetails: (agentId, params) => api.get(`/commissions/admin/agent/${agentId}`, { params }),
  
  // Calculate commission for a transaction
  calculateCommission: (data) => api.post('/commissions/calculate', data),
  
  // Get agent's commission history
  getAgentCommissionHistory: (agentId, params) => api.get(`/commissions/agent/${agentId}`, { params }),
  
  // Request payout
  requestPayout: (data) => api.post('/commissions/request-payout', data),
  
  // Get payout history
  getPayoutHistory: (params) => api.get('/commissions/payouts', { params })
}