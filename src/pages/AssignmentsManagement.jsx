import React, { useState, useEffect } from 'react'
import { assignmentsApi } from '../api/assignments'
import { usersApi } from '../api/users'
import { productsApi } from '../api/products'
import toast from 'react-hot-toast'
import './AssignmentsManagement.css'

const AssignmentsManagement = () => {
  const [assignments, setAssignments] = useState([])
  const [users, setUsers] = useState([])
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [selectedUser, setSelectedUser] = useState('')
  const [selectedProduct, setSelectedProduct] = useState('')
  const [durationDays, setDurationDays] = useState(30)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [assignmentsRes, usersRes, productsRes] = await Promise.all([
        assignmentsApi.getAll(),
        usersApi.getAll(),
        productsApi.getAll()
      ])
      setAssignments(assignmentsRes.data.assignments || [])
      setUsers(usersRes.data.users || [])
      setProducts(productsRes.data.products || [])
    } catch (error) {
      toast.error('Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  const assignProduct = async () => {
    if (!selectedUser || !selectedProduct) {
      toast.error('Select user and product')
      return
    }

    try {
      await assignmentsApi.assign({
        user_id: selectedUser,
        product_id: selectedProduct,
        duration_days: durationDays
      })
      toast.success('Product assigned successfully')
      setShowModal(false)
      setSelectedUser('')
      setSelectedProduct('')
      setDurationDays(30)
      loadData()
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Assignment failed')
    }
  }

  const revokeAssignment = async (assignmentId) => {
    if (confirm('Revoke this product access?')) {
      try {
        await assignmentsApi.revoke(assignmentId)
        toast.success('Access revoked')
        loadData()
      } catch (error) {
        toast.error('Failed to revoke')
      }
    }
  }

  if (loading) {
    return <div className="loading-spinner">Loading assignments...</div>
  }

  return (
    <div className="assignments-management">
      <h1 className="page-title">Product Assignments</h1>
      
      <div className="assignments-header">
        <p className="page-subtitle">Manage which users have access to which products</p>
        <button className="btn-primary" onClick={() => setShowModal(true)}>
          + Assign Product
        </button>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Product</th>
              <th>Assigned At</th>
              <th>Expires At</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {assignments.map(assignment => (
              <tr key={assignment.id}>
                <td>
                  <strong>{assignment.user?.fullName}</strong><br />
                  <small>{assignment.user?.email}</small>
                </                </td>
                <td className="product-cell">
                  <strong>{assignment.product?.name}</strong><br />
                  <small>{assignment.product?.product_type === 'silent_guardian' ? 'Silent Guardian' : 'Future Product'}</small>
                </td>
                <td>{new Date(assignment.assigned_at).toLocaleDateString()}</td>
                <td>{assignment.expires_at ? new Date(assignment.expires_at).toLocaleDateString() : 'Never'}</td>
                <td>
                  <span className={`status-badge ${assignment.status}`}>
                    {assignment.status}
                  </span>
                </td>
                <td className="actions-cell">
                  <button className="revoke-btn" onClick={() => revokeAssignment(assignment.id)}>
                    Revoke
                  </button>
                </td>
              </tr>
            ))}
            {assignments.length === 0 && (
              <tr>
                <td colSpan="6" className="no-data">No assignments found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Assign Product to User</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Select User</label>
                <select value={selectedUser} onChange={(e) => setSelectedUser(e.target.value)}>
                  <option value="">Choose a user...</option>
                  {users.map(user => (
                    <option key={user.id} value={user.id}>
                      {user.fullName} ({user.email})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Select Product</label>
                <select value={selectedProduct} onChange={(e) => setSelectedProduct(e.target.value)}>
                  <option value="">Choose a product...</option>
                  {products.map(product => (
                    <option key={product.id} value={product.id}>
                      {product.name} (${product.price_usd})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Access Duration (days)</label>
                <input
                  type="number"
                  value={durationDays}
                  onChange={(e) => setDurationDays(parseInt(e.target.value))}
                  min="1"
                  max="365"
                />
                <small>Leave as 0 for permanent access (not recommended)</small>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn-primary" onClick={assignProduct}>Assign Product</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AssignmentsManagement