import React, { useState, useEffect } from 'react'
import { adminApi } from '../api/admin'
import StatsCards from '../components/common/StatsCards'
import toast from 'react-hot-toast'
import './AdminDashboard.css'

const AdminDashboard = () => {
  const [stats, setStats] = useState({})
  const [recentActivity, setRecentActivity] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      const [statsRes, activityRes] = await Promise.all([
        adminApi.getStats(),
        adminApi.getRecentActivity(10)
      ])
      setStats(statsRes.data)
      setRecentActivity(activityRes.data)
    } catch (error) {
      toast.error('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="loading-spinner">Loading dashboard...</div>
  }

  return (
    <div className="admin-dashboard">
      <h1 className="page-title">Dashboard</h1>
      <StatsCards stats={stats} />

      <div className="recent-activity">
        <h3>Recent Activity</h3>
        <div className="activity-list">
          {recentActivity.recentUsers?.map((user, idx) => (
            <div key={idx} className="activity-item">
              <span className="activity-icon">👤</span>
              <div className="activity-details">
                <p>New user registered: <strong>{user.name}</strong> ({user.email})</p>
                <small>{new Date(user.createdAt).toLocaleString()}</small>
              </div>
            </div>
          ))}
          {recentActivity.recentSales?.map((sale, idx) => (
            <div key={idx} className="activity-item">
              <span className="activity-icon">💰</span>
              <div className="activity-details">
                <p>Sale: <strong>{sale.product}</strong> for ${sale.amount} by {sale.employee}</p>
                <small>{new Date(sale.createdAt).toLocaleString()}</small>
              </div>
            </div>
          ))}
          {(!recentActivity.recentUsers?.length && !recentActivity.recentSales?.length) && (
            <div className="activity-item">
              <p>No recent activity</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard