import React, { useState, useEffect } from 'react'
import { employeesApi } from '../api/employees'
import { productsApi } from '../api/products'
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

  const viewCommissions = (employeeId) => {
    window.open(`/admin/commissions?agent=${employeeId}`, '_blank')
  }

  const calculateMonthsEmployed = (joinDate) => {
    const join = new Date(joinDate)
    const now = new Date()
    let months = (now.getFullYear() - join.getFullYear()) * 12
    months += now.getMonth() - join.getMonth()
    return months
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
          <option value="basic">Basic (Android only)</option>
          <option value="technical">Technical (Computer + Internet)</option>
        </select>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Type</th>
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
                    <span className={`agent-badge ${emp.agentType}`}>
                      {emp.agentType === 'technical' ? '🔧 Technical' : '📱 Basic'}
                    </span>
                  </td>
                  <td>{emp.totalSignupsReferred} / {emp.totalSignupsFlashed} = {emp.totalSignupsCombined} total</td>
                  <td>${emp.totalCommission?.toFixed(2) || '0'}</td>
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

      {showPromoteModal && selectedEmployee && (
        <div className="modal-overlay" onClick={() => setShowPromoteModal(false)}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Promote to Permanent</h3>
              <button className="modal-close" onClick={() => setShowPromoteModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <p>Employee: <strong>{selectedEmployee.fullName}</strong></p>
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
                <label>Base Salary (monthly)</label>
                <input type="number" value={promoteData.baseSalary} onChange={(e) => setPromoteData({ ...promoteData, baseSalary: parseFloat(e.target.value) })} />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowPromoteModal(false)}>Cancel</button>
              <button className="btn-primary" onClick={promoteEmployee}>Confirm Promotion</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default EmployeesManagement