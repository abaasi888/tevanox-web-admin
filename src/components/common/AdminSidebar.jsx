import React from 'react'
import { NavLink } from 'react-router-dom'
import './AdminSidebar.css'

const AdminSidebar = () => {
  return (
    <aside className="admin-sidebar">
      <div className="sidebar-header">
        <h2>Tevanox</h2>
        <span>Admin Portal</span>
      </div>
      
      <nav className="sidebar-nav">
        <div className="nav-section">
          <h3>Dashboard</h3>
          <NavLink to="/admin/dashboard" className="nav-item">
            📊 Overview
          </NavLink>
        </div>

        <div className="nav-section">
          <h3>Product Management</h3>
          <NavLink to="/admin/products" className="nav-item">
            🏷️ All Products
          </NavLink>
          <NavLink to="/admin/assignments" className="nav-item">
            📦 User Assignments
          </NavLink>
        </div>

        <div className="nav-section">
          <h3>User Management</h3>
          <NavLink to="/admin/users" className="nav-item">
            👥 Users
          </NavLink>
          <NavLink to="/admin/employees" className="nav-item">
            👔 Employees
          </NavLink>
          <NavLink to="/admin/devices" className="nav-item">
            📱 Devices
          </NavLink>
          <NavLink to="/admin/activity" className="nav-item">
            📋 Activity Monitor
          </NavLink>
        </div>

        <div className="nav-section">
          <h3>Sales & Revenue</h3>
          <NavLink to="/admin/sales" className="nav-item">
            📈 Sales Reports
          </NavLink>
          <NavLink to="/admin/revenue" className="nav-item">
            💰 Revenue Reports
          </NavLink>
        </div>

        <div className="nav-section">
          <h3>HR & Recruitment</h3>
          <NavLink to="/admin/jobs" className="nav-item">
            💼 Job Postings
          </NavLink>
          <NavLink to="/admin/applications" className="nav-item">
            📝 Applications
          </NavLink>
        </div>

        <div className="nav-section">
          <h3>Security</h3>
          <NavLink to="/admin/imei" className="nav-item">
            🔒 IMEI Blacklist
          </NavLink>
        </div>

        <div className="nav-section">
          <h3>Support</h3>
          <NavLink to="/admin/tickets" className="nav-item">
            🎫 Support Tickets
          </NavLink>
        </div>

        <div className="nav-section">
          <h3>System</h3>
          <NavLink to="/admin/settings" className="nav-item">
            ⚙️ Settings
          </NavLink>
          <NavLink to="/admin/profile" className="nav-item">
            👤 Profile
          </NavLink>
        </div>
      </nav>
    </aside>
  )
}

export default AdminSidebar