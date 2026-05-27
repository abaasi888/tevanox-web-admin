import React, { useState, useEffect } from 'react'
import { usersApi } from '../api/users'
import toast from 'react-hot-toast'
import './UsersManagement.css'

const UsersManagement = () => {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    try {
      const response = await usersApi.getAll()
      setUsers(response.data.users || [])
    } catch (error) {
      toast.error('Failed to load users')
    } finally {
      setLoading(false)
    }
  }

  const approveKyc = async (userId) => {
    try {
      await usersApi.approveKyc(userId)
      toast.success('KYC approved')
      loadUsers()
    } catch (error) {
      toast.error('Failed to approve KYC')
    }
  }

  const deleteUser = async (userId) => {
    if (confirm('Delete this user? This action cannot be undone.')) {
      try {
        await usersApi.delete(userId)
        toast.success('User deleted')
        loadUsers()
      } catch (error) {
        toast.error('Failed to delete user')
      }
    }
  }

  const filteredUsers = users.filter(user =>
    user.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return <div className="loading-spinner">Loading users...</div>
  }

  return (
    <div className="users-management">
      <h1 className="page-title">User Management</h1>
      
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
              <th>Phone</th>
              <th>Account Type</th>
              <th>KYC Status</th>
              <th>Joined</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map(user => (
              <tr key={user.id}>
                <td><strong>{user.fullName}</strong></td>
                <td>{user.email}</td>
                <td>{user.phone || '—'}</td>
                <td>{user.accountType === 'corporate' ? 'Corporate' : 'Individual'}</td>
                <td>
                  <span className={`status-badge ${user.kycStatus}`}>
                    {user.kycStatus}
                  </span>
                </td>
                <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                <td className="actions-cell">
                  {user.kycStatus !== 'approved' && (
                    <button className="approve-btn" onClick={() => approveKyc(user.id)}>
                      Approve KYC
                    </button>
                  )}
                  <button className="delete-btn" onClick={() => deleteUser(user.id)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default UsersManagement