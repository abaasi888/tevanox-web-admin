import React, { useState, useEffect } from 'react'
import { commissionsApi } from '../api/commissions'
import { productsApi } from '../api/products'
import { employeesApi } from '../api/employees'
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

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount)
  }

  if (loading) return <div className="loading-spinner">Loading commissions...</div>

  return (
    <div className="commissions-management">
      <h1 className="page-title">Commission Management</h1>

      {/* Summary Cards */}
      {summary && (
        <div className="summary-cards">
          <div className="summary-card">
            <div className="summary-icon">💰</div>
            <div className="summary-info">
              <h3>{formatCurrency(summary.total_one_time)}</h3>
              <p>One-time Commissions</p>
            </div>
          </div>
          <div className="summary-card">
            <div className="summary-icon">🔄</div>
            <div className="summary-info">
              <h3>{formatCurrency(summary.total_recurring)}</h3>
              <p>Recurring Commissions</p>
            </div>
          </div>
          <div className="summary-card">
            <div className="summary-icon">💸</div>
            <div className="summary-info">
              <h3>{formatCurrency(summary.total_commissions)}</h3>
              <p>Total All Time</p>
            </div>
          </div>
          <div className="summary-card">
            <div className="summary-icon">⏳</div>
            <div className="summary-info">
              <h3>{formatCurrency(summary.pending_amount)}</h3>
              <p>Pending Payout</p>
              <small>{summary.pending_count} commissions</small>
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
                  <td>{formatCurrency(p.amount)}</td>
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
                <th>Email</th>
                <th>Total Commission</th>
                <th>Number of Commissions</th>
              </tr>
            </thead>
            <tbody>
              {topAgents.map(a => (
                <tr key={a.agent_id}>
                  <td><strong>{a.agent_name}</strong></td>
                  <td>{a.agent_email}</td>
                  <td>{formatCurrency(a.total_amount)}</td>
                  <td>{a.count}</td>
                </tr>
              ))}
              {topAgents.length === 0 && (
                <tr><td colSpan="4" className="no-data">No agent data</td></tr>
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
                <th>Product</th>
                <th>Customer</th>
                <th>Type</th>
                <th>Role</th>
                <th>Amount</th>
                <th>%</th>
              </tr>
            </thead>
            <tbody>
              {pendingCommissions.map(c => (
                <tr key={c.id}>
                  <td><input type="checkbox" checked={selectedIds.includes(c.id)} onChange={() => handleSelect(c.id)} /></td>
                  <td>{new Date(c.created_at).toLocaleDateString()}</td>
                  <td>{c.agent_name}</td>
                  <td>{c.product_name}</td>
                  <td>{c.customer_email}</td>
                  <td><span className={`type-badge ${c.type}`}>{c.type}</span></td>
                  <td><span className={`role-badge ${c.role}`}>{c.role}</span></td>
                  <td>{formatCurrency(c.amount)}</td>
                  <td>{c.percentage}%</td>
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
          <select value={selectedAgent} onChange={(e) => { setSelectedAgent(e.target.value); loadAgentDetails(e.target.value) }}>
            <option value="">Select an agent...</option>
            {employees.map(emp => (
              <option key={emp.id} value={emp.id}>{emp.fullName} ({emp.email})</option>
            ))}
          </select>
        </div>

        {agentDetails && (
          <div className="agent-details">
            <h4>Commission Details for {agentDetails.agent_name}</h4>
            <div className="product-stats">
              {agentDetails.product_stats?.map(stat => (
                <div key={stat.product_name} className="product-stat-card">
                  <h5>{stat.product_name}</h5>
                  <div className="stat-row">
                    <span>Signups: {stat.total_signups_referred} referred / {stat.total_signups_flashed} flashed</span>
                    <span>Total: {stat.total_signups_combined}</span>
                  </div>
                  <div className="stat-row">
                    <span>One-time: {formatCurrency(stat.total_one_time_commission)}</span>
                    <span>Recurring: {formatCurrency(stat.total_recurring_commission)}</span>
                  </div>
                  {stat.permanent_eligible && <div className="eligible-badge">✅ Permanent Salary Eligible - ${stat.base_salary}/month</div>}
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