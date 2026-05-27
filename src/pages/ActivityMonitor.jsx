import React, { useState, useEffect } from 'react'
import { activityApi } from '../api/activity'
import { usersApi } from '../api/users'
import { productsApi } from '../api/products'
import toast from 'react-hot-toast'
import './ActivityMonitor.css'

const ActivityMonitor = () => {
  const [stats, setStats] = useState(null)
  const [users, setUsers] = useState([])
  const [products, setProducts] = useState([])
  const [selectedUser, setSelectedUser] = useState('')
  const [selectedProduct, setSelectedProduct] = useState('')
  const [activities, setActivities] = useState([])
  const [loading, setLoading] = useState(true)
  const [filterDays, setFilterDays] = useState(30)

  useEffect(() => {
    loadInitialData()
  }, [])

  useEffect(() => {
    if (selectedUser) {
      loadUserActivity()
    }
  }, [selectedUser, filterDays])

  const loadInitialData = async () => {
    try {
      const [statsRes, usersRes, productsRes] = await Promise.all([
        activityApi.getStats(filterDays),
        usersApi.getAll(),
        productsApi.getAll()
      ])
      setStats(statsRes.data)
      setUsers(usersRes.data.users || [])
      setProducts(productsRes.data.products || [])
    } catch (error) {
      toast.error('Failed to load activity data')
    } finally {
      setLoading(false)
    }
  }

  const loadUserActivity = async () => {
    if (!selectedUser) return
    try {
      const response = await activityApi.getUserActivity(selectedUser, {
        days: filterDays,
        product_id: selectedProduct || undefined
      })
      setActivities(response.data.logs || [])
    } catch (error) {
      toast.error('Failed to load user activity')
    }
  }

  const exportLogs = async () => {
    try {
      const response = await activityApi.exportLogs({
        user_id: selectedUser || undefined,
        product_id: selectedProduct || undefined,
        days: filterDays,
        format: 'csv'
      })
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `activity_logs_${new Date().toISOString().split('T')[0]}.csv`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      toast.success('Export started')
    } catch (error) {
      toast.error('Failed to export logs')
    }
  }

  if (loading) {
    return <div className="loading-spinner">Loading activity data...</div>
  }

  return (
    <div className="activity-monitor">
      <h1 className="page-title">Activity Monitor</h1>

      <div className="stats-section">
        <h3>Platform Activity (Last {filterDays} Days)</h3>
        <div className="stats-grid-small">
          <div className="stat-card-small">
            <div className="stat-value">{stats?.total_activities || 0}</div>
            <div className="stat-label">Total Activities</div>
          </div>
          {stats?.by_product?.map(product => (
            <div key={product.product_id} className="stat-card-small">
              <div className="stat-value">{product.total_actions}</div>
              <div className="stat-label">{product.product_name}</div>
              <div className="stat-sub">{product.unique_users} users</div>
            </div>
          ))}
        </div>
      </div>

      <div className="filters-section">
        <div className="filter-group">
          <label>Days</label>
          <select value={filterDays} onChange={(e) => setFilterDays(parseInt(e.target.value))}>
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
          </select>
        </div>
        <div className="filter-group">
          <label>User</label>
          <select value={selectedUser} onChange={(e) => setSelectedUser(e.target.value)}>
            <option value="">All Users</option>
            {users.map(user => (
              <option key={user.id} value={user.id}>
                {user.fullName} ({user.email})
              </option>
            ))}
          </select>
        </div>
        <div className="filter-group">
          <label>Product</label>
          <select value={selectedProduct} onChange={(e) => setSelectedProduct(e.target.value)}>
            <option value="">All Products</option>
            {products.map(product => (
              <option key={product.id} value={product.id}>
                {product.name}
              </option>
            ))}
          </select>
        </div>
        <button className="btn-outline" onClick={exportLogs}>Export CSV</button>
      </div>

      {selectedUser && (
        <div className="activity-table-container">
          <h3>User Activity Logs</h3>
          {activities.length === 0 ? (
            <div className="empty-state">No activity recorded for this user</div>
          ) : (
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Date/Time</th>
                    <th>Product</th>
                    <th>Action</th>
                    <th>Details</th>
                    <th>IP Address</th>
                  </tr>
                </thead>
                <tbody>
                  {activities.map(activity => (
                    <tr key={activity.id}>
                      <td>{new Date(activity.created_at).toLocaleString()}</td>
                      <td>{activity.product_name}</td>
                      <td><span className="action-badge">{activity.action}</span></td>
                      <td>
                        {activity.details?.page && <span>Page: {activity.details.page}</span>}
                        {activity.details?.feature && <span> Feature: {activity.details.feature}</span>}
                      </td>
                      <td><code>{activity.ip_address || 'N/A'}</code></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default ActivityMonitor