import React, { useState, useEffect } from 'react'
import { employeesApi, calculateEmployeeCommission } from '../api/employees'
import { productsApi } from '../api/products'
import { COMMISSION_RATES } from '../api/commissions'
import toast from 'react-hot-toast'
import './EmployeesManagement.css'

const EmployeesManagement = () => {
  const [employees, setEmployees] = useState([])
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('')
  const [showPromoteModal, setShowPromoteModal] = useState(false)
  const [selectedEmployee, setSelectedEmployee] = useState(null)
  const [selectedProduct, setSelectedProduct] = useState('')
  const [promoteData, setPromoteData] = useState({ baseSalary: 2000 })
  const [showCommissionModal, setShowCommissionModal] = useState(false)
  const [selectedEmployeeCommissions, setSelectedEmployeeCommissions] = useState(null)

  useEffect(() => {
    loadEmployees()
    loadProducts()
  }, [])

  const loadEmployees = async () => {
    try {
      const response = await employeesApi.getAll()
      setEmployees(response.data.employees || [])
    } catch (error) {
      toast.error('Failed to load employees')
    } finally {
      setLoading(false)
    }
  }

  const loadProducts = async () => {
    try {
      const response = await productsApi.getAllAdmin()
      setProducts(response.data.products || [])
    } catch (error) {
      console.error('Failed to load products')
    }
  }

  const approveKyc = async (employeeId) => {
    try {
      await employeesApi.approveKyc(employeeId)
      toast.success('Employee approved')
      loadEmployees()
    } catch (error) {
      toast.error('Failed to approve')
    }
  }

  const promoteEmployee = async () => {
    if (!selectedProduct) {
      toast.error('Select a product')
      return
    }
    try {
      await employeesApi.promoteToPermanent({
        employee_id: selectedEmployee.id,
        product_id: selectedProduct,
        base_salary: promoteData.baseSalary
      })
      toast.success('Employee promoted to permanent for this product')
      setShowPromoteModal(false)
      loadEmployees()
    } catch (error) {
      toast.error('Failed to promote')
    }
  }

  const deleteEmployee = async (employeeId) => {
    if (confirm('Delete this employee? This action cannot be undone.')) {
      try {
        await employeesApi.delete(employeeId)
        toast.success('Employee deleted')
        loadEmployees()
      } catch (error) {
        toast.error('Failed to delete')
      }
    }
  }

  const viewCommissions = async (employeeId) => {
    try {
      const res = await employeesApi.getCommissionSummary(employeeId)
      setSelectedEmployeeCommissions(res.data)
      setShowCommissionModal(true)
    } catch (error) {
      toast.error('Failed to load commission details')
    }
  }

  const calculateMonthsEmployed = (joinDate) => {
    const join = new Date(joinDate)
    const now = new Date()
    let months = (now.getFullYear() - join.getFullYear()) * 12
    months += now.getMonth() - join.getMonth()
    return months
  }

  const getCommissionRateForEmployee = (employee) => {
    if (employee.agentType === 'sales_agent') {
      return `20% + 2% recurring`
    } else if (employee.agentType === 'technical') {
      return `30% + 5% recurring (self) / 10% (flash only)`
    }
    return 'N/A'
  }

  const filteredEmployees = employees.filter(emp => {
    const matchesSearch = emp.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          emp.email?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = !filterType || emp.agentType === filterType
    return matchesSearch && matchesType
  })

  if (loading) return <div className="loading-spinner">Loading employees...</div>

  return (
    <div className="employees-management">
      <div className="page-header">
        <h1 className="page-title">Employee Management</h1>
        <div className="commission-info-badge">
          💰 Commission: Sales (20%+2%) | Technical (30%+5% / 10%)
        </div>
      </div>

      <div className="filters-section">
        <input
          type="text"
          placeholder="Search by name or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
        <select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
          <option value="">All Types</option>
          <option value="sales_agent">Sales Agent (20% + 2%)</option>
          <option value="technical">Technical Agent (30% + 5% / 10%)</option>
        </select>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role & Rate</th>
              <th>Signups (Referred/Flashed)</th>
              <th>Total Commission</th>
              <th>Tenure</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredEmployees.map(emp => {
              const monthsEmployed = calculateMonthsEmployed(emp.joinDate)
              const eligibleProducts = products.filter(p => 
                emp.totalSignupsCombined >= p.commission_rules?.permanent_salary_threshold && 
                monthsEmployed >= p.commission_rules?.permanent_salary_months
              )
              return (
                <tr key={emp.id}>
                  <td><strong>{emp.fullName}</strong></td>
                  <td>{emp.email}</td>
                  <td>
                    <div className="role-rate-info">
                      <span className={`agent-badge ${emp.agentType}`}>
                        {emp.agentType === 'technical' ? '🔧 Technical' : '📱 Sales'}
                      </span>
                      <small className="rate-info">{getCommissionRateForEmployee(emp)}</small>
                    </div>
                  </td>
                  <td>
                    <div className="signup-stats">
                      <span className="referred">📱 {emp.totalSignupsReferred || 0}</span>
                      <span className="flashed">⚡ {emp.totalSignupsFlashed || 0}</span>
                      <span className="total">= {emp.totalSignupsCombined || 0} total</span>
                    </div>
                  </td>
                  <td className="commission-cell">
                    UGX {((emp.totalCommission || 0)).toLocaleString()}
                    <small className="commission-breakdown">
                      {emp.agentType === 'technical' ? '30%/10% rates' : '20% rate'}
                    </small>
                  </td>
                  <td>{monthsEmployed} months</td>
                  <td><span className={`status-badge ${emp.status}`}>{emp.status}</span></td>
                  <td className="actions-cell">
                    {emp.status === 'pending' && (
                      <button className="approve-btn" onClick={() => approveKyc(emp.id)}>Approve</button>
                    )}
                    {eligibleProducts.length > 0 && emp.employmentType !== 'permanent' && (
                      <button className="promote-btn" onClick={() => {
                        setSelectedEmployee(emp)
                        setShowPromoteModal(true)
                      }}>Promote</button>
                    )}
                    <button className="view-btn" onClick={() => viewCommissions(emp.id)}>Commissions</button>
                    <button className="delete-btn" onClick={() => deleteEmployee(emp.id)}>Delete</button>
                  </td>
                </tr>
              )
            })}
            {filteredEmployees.length === 0 && (
              <tr><td colSpan="8" className="no-data">No employees found</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Promote Modal */}
      {showPromoteModal && selectedEmployee && (
        <div className="modal-overlay" onClick={() => setShowPromoteModal(false)}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Promote to Permanent</h3>
              <button className="modal-close" onClick={() => setShowPromoteModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <p>Employee: <strong>{selectedEmployee.fullName}</strong></p>
              <p>Current rate: {getCommissionRateForEmployee(selectedEmployee)}</p>
              <div className="form-group">
                <label>Product</label>
                <select value={selectedProduct} onChange={(e) => setSelectedProduct(e.target.value)}>
                  <option value="">Select a product...</option>
                  {products.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Base Salary (monthly - USD)</label>
                <input type="number" value={promoteData.baseSalary} onChange={(e) => setPromoteData({ ...promoteData, baseSalary: parseFloat(e.target.value) })} />
              </div>
              <div className="info-note">
                💡 Promoted employees keep their commission rates + receive base salary
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowPromoteModal(false)}>Cancel</button>
              <button className="btn-primary" onClick={promoteEmployee}>Confirm Promotion</button>
            </div>
          </div>
        </div>
      )}

      {/* Commission Details Modal */}
      {showCommissionModal && selectedEmployeeCommissions && (
        <div className="modal-overlay" onClick={() => setShowCommissionModal(false)}>
          <div className="modal-container large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Commission Details - {selectedEmployeeCommissions.agent_name}</h3>
              <button className="modal-close" onClick={() => setShowCommissionModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="commission-summary-modal">
                <div className="summary-item">
                  <span>💰 Total Commission</span>
                  <strong>UGX {selectedEmployeeCommissions.total_commission?.toLocaleString()}</strong>
                </div>
                <div className="summary-item">
                  <span>📊 One-time (20-30%)</span>
                  <strong>UGX {selectedEmployeeCommissions.total_one_time?.toLocaleString()}</strong>
                </div>
                <div className="summary-item">
                  <span>🔄 Recurring (2-5%)</span>
                  <strong>UGX {selectedEmployeeCommissions.total_recurring?.toLocaleString()}</strong>
                </div>
              </div>
              
              <h4>Commission Breakdown by Product</h4>
              <div className="product-stats-modal">
                {selectedEmployeeCommissions.product_stats?.map(stat => (
                  <div key={stat.product_name} className="product-stat-modal">
                    <h5>{stat.product_name}</h5>
                    <div className="stat-row">
                      <span>Referred customers:</span>
                      <span>{stat.total_signups_referred}</span>
                    </div>
                    <div className="stat-row">
                      <span>Flashed customers:</span>
                      <span>{stat.total_signups_flashed}</span>
                    </div>
                    <div className="stat-row highlight">
                      <span>One-time commission:</span>
                      <span>UGX {stat.total_one_time_commission?.toLocaleString()}</span>
                    </div>
                    <div className="stat-row highlight">
                      <span>Recurring commission:</span>
                      <span>UGX {stat.total_recurring_commission?.toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowCommissionModal(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default EmployeesManagement