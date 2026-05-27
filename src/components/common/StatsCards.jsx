import React from 'react'
import './StatsCards.css'

const StatsCards = ({ stats }) => {
  const cards = [
    { title: 'Total Revenue', value: `$${stats.totalRevenue?.toFixed(2) || '0'}`, icon: '💰', color: '#4caf50' },
    { title: 'Total Users', value: stats.totalUsers || 0, icon: '👥', color: '#2196f3' },
    { title: 'Active Devices', value: stats.activeDevices || 0, icon: '📱', color: '#9c27b0' },
    { title: 'Pending KYC', value: stats.pendingKyc || 0, icon: '⏳', color: '#ff9800' },
    { title: 'Total Employees', value: stats.totalEmployees || 0, icon: '👔', color: '#00bcd4' },
    { title: 'Active Products', value: stats.activeProducts || 0, icon: '🏷️', color: '#8bc34a' }
  ]

  return (
    <div className="stats-grid">
      {cards.map((card, index) => (
        <div key={index} className="stat-card" style={{ borderLeftColor: card.color }}>
          <div className="stat-icon">{card.icon}</div>
          <div className="stat-info">
            <h3>{card.value}</h3>
            <p>{card.title}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

export default StatsCards