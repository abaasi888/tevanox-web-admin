import React, { useState, useEffect } from 'react'
import { employeesApi } from '../api/employees'
import toast from 'react-hot-toast'
import './EmployeesManagement.css'

const EmployeesManagement = () => {
  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showPromoteModal, setShowPromoteModal] = useState(false)
  const [selectedEmployee, setSelectedEmployee] = useState(null)
  const [promoteData, setPromoteData] = useState({ baseSalary: 2000, commissionRate: 10 })

  useEffect(() => {
    loadEmployees()
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

  const approveKyc = async (employeeId) => {
    try {
      await employeesApi.approveKyc(employeeId)
      toast.success('Employee KYC approved')
      loadEmployees()
    } catch (error) {
      toast.error('Failed to approve')
    }
  }

  const promoteEmployee = async () => {
    try {
      await employeesApi.promoteToPermanent({
        employeeId: selectedEmployee.id,
        ...promoteData
      })
      toast.success('Employee promoted to permanent')
      setShowPromoteModal(false)
      loadEmployees()
    } catch (error) {
      toast.error('Failed to promote')
    }
  }

  const deleteEmployee = async (employeeId) => {
    if (confirm('Delete this employee?')) {
      try {
        await employeesApi.delete(employeeId)
        toast.success('Employee deleted')
        loadEmployees()
      } catch (error) {
        toast.error('Failed to delete')
      }
    }
  }

  const calculateMonthsEmployed = (joinDate) => {
    const join = new Date(joinDate)
    const now = new Date()
    let months = (now.getFullYear() - join.getFullYear()) * 12
    months += now.getMonth() - join.getMonth()
    return months
  }

  const filteredEmployees = employees.filter(emp =>
    emp.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.email?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return <div className="loading-spinner">Loading employees...</div>
  }

  return (
    <div className="employees-management">
      <h1 className="page-title">Employee Management</h1>
      
      <div className="search-bar">
        <input
          type="text"
          placeholder="Search by name or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Type</th>
              <th>Signups</th>
              <th>Commission</th>
              <th>Tenure</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredEmployees.map(emp => {
              const monthsEmployed = calculateMonthsEmployed(emp.joinDate)
              const eligible = emp.totalSignups >= 4000 && monthsEmployed >= 12
              return (
                <tr key={emp.id}>
                  <td><strong>{emp.fullName}</strong></td>
                  <td>{emp.email}</td>
                  <td>
                    <span className={`employment-badge ${emp.employmentType}`}>
                      {emp.employmentType === 'permanent' ? 'Permanent' : 'Contractor'}
                    </span>
                  </td>
                  <td>{emp.totalSignups}/4000</td>
                  <td>${emp.totalCommission?.toFixed(2) || '0'}</td>
                  <td>{monthsEmployed}/12 months</td>
                  <td>
                    <span className={`status-badge ${emp.status}`}>
                      {emp.status}
                    </span>
                  </td>
                  <td className="actions-cell">
                    {emp.kycStatus === 'pending' && (
                      <button className="approve-btn" onClick={() => approveKyc(emp.id)}>
                        Approve KYC
                      </button>
                    )}
                    {eligible && emp.employmentType === 'contractor' && (
                      <button className="promote-btn" onClick={() => {
                        setSelectedEmployee(emp)
                        setShowPromoteModal(true)
                      }}>
                        Promote
                      </button>
                    )}
                    <button className="delete-btn" onClick={() => deleteEmployee(emp.id)}>
                      Delete
                    </button>
                  </td>
                </tr>
              )
            })}
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
              <p>Promoting: <strong>{selectedEmployee.fullName}</strong></p>
              <div className="form-group">
                <label>Base Salary (monthly)</label>
                <input
                  type="number"
                  value={promoteData.baseSalary}
                  onChange={(e) => setPromoteData({ ...promoteData, baseSalary: parseFloat(e.target.value) })}
                />
              </div>
              <div className="form-group">
                <label>Commission Rate (%)</label>
                <input
                  type="number"
                  value={promoteData.commissionRate}
                  onChange={(e) => setPromoteData({ ...promoteData, commissionRate: parseInt(e.target.value) })}
                />
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