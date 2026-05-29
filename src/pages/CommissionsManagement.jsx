import React, { useState, useEffect } from 'react'
import { commissionsApi, COMMISSION_RATES } from '../api/commissions'
import { productsApi } from '../api/products'
import { employeesApi, calculateEmployeeCommission } from '../api/employees'
import toast from 'react-hot-toast'
import './CommissionsManagement.css'

const CommissionsManagement = () => {
  const [pendingCommissions, setPendingCommissions] = useState([])
  const [summary, setSummary] = useState(null)
  const [byProduct, setByProduct] = useState([])
  const [topAgents, setTopAgents] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedIds, setSelectedIds] = useState([])
  const [selectedAgent, setSelectedAgent] = useState('')
  const [agentDetails, setAgentDetails] = useState(null)
  const [products, setProducts] = useState([])
  const [employees, setEmployees] = useState([])
  const [commissionRates, setCommissionRates] = useState(COMMISSION_RATES)

  useEffect(() => {
    loadData()
    loadProducts()
    loadEmployees()
  }, [])

  const loadData = async () => {
    try {
      const [pendingRes, summaryRes] = await Promise.all([
        commissionsApi.getPending(),
        commissionsApi.getSummary()
      ])
      setPendingCommissions(pendingRes.data.commissions || [])
      setSummary(summaryRes.data.summary)
      setByProduct(summaryRes.data.by_product || [])
      setTopAgents(summaryRes.data.top_agents || [])
    } catch (error) {
      toast.error('Failed to load commission data')
    } finally {
      setLoading(false)
    }
  }

  const loadProducts = async () => {
    try {
      const res = await productsApi.getAllAdmin()
      setProducts(res.data.products || [])
    } catch (error) {
      console.error('Failed to load products')
    }
  }

  const loadEmployees = async () => {
    try {
      const res = await employeesApi.getAll()
      setEmployees(res.data.employees || [])
    } catch (error) {
      console.error('Failed to load employees')
    }
  }

  const loadAgentDetails = async (agentId) => {
    if (!agentId) {
      setAgentDetails(null)
      return
    }
    try {
      const res = await commissionsApi.getAgentDetails(agentId)
      setAgentDetails(res.data)
    } catch (error) {
      toast.error('Failed to load agent details')
    }
  }

  const handleSelectAll = () => {
    if (selectedIds.length === pendingCommissions.length) {
      setSelectedIds([])
    } else {
      setSelectedIds(pendingCommissions.map(c => c.id))
    }
  }

  const handleSelect = (id) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(i => i !== id))
    } else {
      setSelectedIds([...selectedIds, id])
    }
  }

  const handleMarkPaid = async () => {
    if (selectedIds.length === 0) {
      toast.error('Select commissions to mark as paid')
      return
    }
    if (confirm(`Mark ${selectedIds.length} commission(s) as paid?`)) {
      try {
        await commissionsApi.markPaid(selectedIds)
        toast.success(`${selectedIds.length} commissions marked as paid`)
        setSelectedIds([])
        loadData()
      } catch (error) {
        toast.error('Failed to mark as paid')
      }
    }
  }

  const formatCurrencyUGX = (amount) => {
    return new Intl.NumberFormat('en-UG', { 
      style: 'currency', 
      currency: 'UGX',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  const getCommissionRateDisplay = (commission) => {
    if (commission.role === 'sales_agent') {
      return `${(commissionRates.SALES_AGENT.ONE_TIME * 100)}% + ${(commissionRates.SALES_AGENT.RECURRING * 100)}% recurring`
    } else if (commission.role === 'technical_agent') {
      if (commission.type === 'self_referred') {
        return `${(commissionRates.TECHNICAL_AGENT.SELF_REFERRED_FLASHED.ONE_TIME * 100)}% + ${(commissionRates.TECHNICAL_AGENT.SELF_REFERRED_FLASHED.RECURRING * 100)}% recurring`
      } else {
        return `${(commissionRates.TECHNICAL_AGENT.FLASH_ONLY.ONE_TIME * 100)}% (no recurring)`
      }
    }
    return `${commission.percentage}%`
  }

  if (loading) return <div className="loading-spinner">Loading commissions...</div>

  return (
    <div className="commissions-management">
      <h1 className="page-title">Commission Management</h1>
      
      {/* Commission Rate Info Banner */}
      <div className="rate-info-banner">
        <div className="rate-info-content">
          <h4>💰 Tevanox Commission Structure</h4>
          <div className="rate-grid">
            <div className="rate-card sales">
              <span className="rate-icon">📱</span>
              <div className="rate-details">
                <strong>Sales Agent</strong>
                <span>20% one-time + 2% recurring</span>
                <small>Requirements: Android phone + Internet</small>
              </div>
            </div>
            <div className="rate-card technical-self">
              <span className="rate-icon">💻</span>
              <div className="rate-details">
                <strong>Technical Agent (Self-referred + flashed)</strong>
                <span>30% one-time + 5% recurring</span>
                <small>Requirements: Android + Computer + Internet</small>
              </div>
            </div>
            <div className="rate-card technical-flash">
              <span className="rate-icon">⚡</span>
              <div className="rate-details">
                <strong>Technical Agent (Flash only)</strong>
                <span>10% one-time (no recurring)</span>
                <small>For flashing customers referred by other agents</small>
              </div>
            </div>
          </div>
          <div className="payout-info">
            💵 Minimum payout: {formatCurrencyUGX(COMMISSION_RATES.MIN_PAYOUT_UGX)}
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="summary-cards">
          <div className="summary-card">
            <div className="summary-icon">💰</div>
            <div className="summary-info">
              <h3>{formatCurrencyUGX(summary.total_one_time)}</h3>
              <p>One-time Commissions (20-30%)</p>
            </div>
          </div>
          <div className="summary-card">
            <div className="summary-icon">🔄</div>
            <div className="summary-info">
              <h3>{formatCurrencyUGX(summary.total_recurring)}</h3>
              <p>Recurring Commissions (2-5%)</p>
            </div>
          </div>
          <div className="summary-card">
            <div className="summary-icon">💸</div>
            <div className="summary-info">
              <h3>{formatCurrencyUGX(summary.total_commissions)}</h3>
              <p>Total All Time</p>
            </div>
          </div>
          <div className="summary-card">
            <div className="summary-icon">⏳</div>
            <div className="summary-info">
              <h3>{formatCurrencyUGX(summary.pending_amount)}</h3>
              <p>Pending Payout</p>
              <small>{summary.pending_count} commissions waiting</small>
            </div>
          </div>
        </div>
      )}

      {/* By Product Breakdown */}
      <div className="section">
        <h3>Commissions by Product</h3>
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Number of Commissions</th>
                <th>Total Amount</th>
              </tr>
            </thead>
            <tbody>
              {byProduct.map(p => (
                <tr key={p.product}>
                  <td><strong>{p.product}</strong></td>
                  <td>{p.count}</td>
                  <td>{formatCurrencyUGX(p.amount)}</td>
                </tr>
              ))}
              {byProduct.length === 0 && (
                <tr><td colSpan="3" className="no-data">No commission data</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Top Agents */}
      <div className="section">
        <h3>Top Earning Agents</h3>
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Agent</th>
                <th>Role</th>
                <th>Total Commission</th>
                <th>Number of Commissions</th>
                <th>Commission Rate</th>
              </tr>
            </thead>
            <tbody>
              {topAgents.map(a => (
                <tr key={a.agent_id}>
                  <td><strong>{a.agent_name}</strong></td>
                  <td>
                    <span className={`role-badge ${a.role}`}>
                      {a.role === 'technical_agent' ? '🔧 Technical' : '📱 Sales'}
                    </span>
                  </td>
                  <td>{formatCurrencyUGX(a.total_amount)}</td>
                  <td>{a.count}</td>
                  <td className="rate-cell">
                    {a.role === 'sales_agent' ? '20% + 2%' : 
                     a.type === 'self_referred' ? '30% + 5%' : '10%'}
                  </td>
                </tr>
              ))}
              {topAgents.length === 0 && (
                <tr><td colSpan="5" className="no-data">No agent data</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pending Commissions */}
      <div className="section">
        <div className="section-header">
          <h3>Pending Commissions</h3>
          <button className="btn-primary" onClick={handleMarkPaid} disabled={selectedIds.length === 0}>
            Mark Selected as Paid ({selectedIds.length})
          </button>
        </div>
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th><input type="checkbox" checked={selectedIds.length === pendingCommissions.length && pendingCommissions.length > 0} onChange={handleSelectAll} /></th>
                <th>Date</th>
                <th>Agent</th>
                <th>Role</th>
                <th>Product</th>
                <th>Customer</th>
                <th>Type</th>
                <th>Rate</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              {pendingCommissions.map(c => (
                <tr key={c.id}>
                  <td><input type="checkbox" checked={selectedIds.includes(c.id)} onChange={() => handleSelect(c.id)} /></td>
                  <td>{new Date(c.created_at).toLocaleDateString()}</td>
                  <td>{c.agent_name}</td>
                  <td>
                    <span className={`role-badge ${c.role}`}>
                      {c.role === 'technical_agent' ? '🔧 Technical' : '📱 Sales'}
                    </span>
                  </td>
                  <td>{c.product_name}</td>
                  <td>{c.customer_email}</td>
                  <td>
                    <span className={`type-badge ${c.type}`}>
                      {c.type === 'one_time' ? 'One-time' : 'Recurring'}
                    </span>
                  </td>
                  <td className="rate-cell">{getCommissionRateDisplay(c)}</td>
                  <td className="amount-cell">{formatCurrencyUGX(c.amount)}</td>
                </tr>
              ))}
              {pendingCommissions.length === 0 && (
                <tr><td colSpan="9" className="no-data">No pending commissions</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Agent Filter */}
      <div className="section">
        <h3>Filter by Agent</h3>
        <div className="filter-row">
          <select 
            value={selectedAgent} 
            onChange={(e) => { 
              setSelectedAgent(e.target.value)
              loadAgentDetails(e.target.value)
            }}
          >
            <option value="">Select an agent...</option>
            {employees.map(emp => (
              <option key={emp.id} value={emp.id}>
                {emp.fullName} ({emp.role === 'technical_agent' ? 'Technical' : 'Sales'})
              </option>
            ))}
          </select>
        </div>

        {agentDetails && (
          <div className="agent-details">
            <h4>Commission Details for {agentDetails.agent_name}</h4>
            <div className="agent-summary">
              <div className="agent-summary-card">
                <span>🎯 Role</span>
                <strong>{agentDetails.role === 'technical_agent' ? 'Technical Agent' : 'Sales Agent'}</strong>
              </div>
              <div className="agent-summary-card">
                <span>💰 Total Commission</span>
                <strong>{formatCurrencyUGX(agentDetails.total_commission)}</strong>
              </div>
              <div className="agent-summary-card">
                <span>📊 One-time (20-30%)</span>
                <strong>{formatCurrencyUGX(agentDetails.total_one_time)}</strong>
              </div>
              <div className="agent-summary-card">
                <span>🔄 Recurring (2-5%)</span>
                <strong>{formatCurrencyUGX(agentDetails.total_recurring)}</strong>
              </div>
            </div>
            
            <h5>Commission Breakdown by Product</h5>
            <div className="product-stats">
              {agentDetails.product_stats?.map(stat => (
                <div key={stat.product_name} className="product-stat-card">
                  <h5>{stat.product_name}</h5>
                  <div className="stat-row">
                    <span>📱 Referred customers:</span>
                    <span>{stat.total_signups_referred}</span>
                  </div>
                  <div className="stat-row">
                    <span>⚡ Flashed customers:</span>
                    <span>{stat.total_signups_flashed}</span>
                  </div>
                  <div className="stat-row">
                    <span>📊 Total customers:</span>
                    <span><strong>{stat.total_signups_combined}</strong></span>
                  </div>
                  <div className="stat-divider"></div>
                  <div className="stat-row">
                    <span>💰 One-time commission (20-30%):</span>
                    <span>{formatCurrencyUGX(stat.total_one_time_commission)}</span>
                  </div>
                  <div className="stat-row">
                    <span>🔄 Recurring commission (2-5%):</span>
                    <span>{formatCurrencyUGX(stat.total_recurring_commission)}</span>
                  </div>
                  {stat.permanent_eligible && (
                    <div className="eligible-badge">
                      ✅ Eligible for Permanent Salary - ${stat.base_salary}/month
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default CommissionsManagement