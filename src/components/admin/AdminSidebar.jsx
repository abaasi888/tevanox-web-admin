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
        {/* Dashboard Section */}
        <div className="nav-section">
          <h3>Dashboard</h3>
          <NavLink to="/admin/dashboard" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
            📊 Overview
          </NavLink>
        </div>

        {/* Product Management Section */}
        <div className="nav-section">
          <h3>Product Management</h3>
          <NavLink to="/admin/products" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
            🏷️ All Products
          </NavLink>
          <NavLink to="/admin/assignments" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
            📦 User Assignments
          </NavLink>
        </div>

        {/* User Management Section */}
        <div className="nav-section">
          <h3>User Management</h3>
          <NavLink to="/admin/users" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
            👥 Users
          </NavLink>
          <NavLink to="/admin/employees" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
            👔 Employees
          </NavLink>
          <NavLink to="/admin/devices" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
            📱 Devices
          </NavLink>
          <NavLink to="/admin/activity" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
            📋 Activity Monitor
          </NavLink>
        </div>

        {/* Commissions Section */}
        <div className="nav-section">
          <h3>Commissions</h3>
          <NavLink to="/admin/commissions" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
            💰 Commission Management
          </NavLink>
        </div>

        {/* Sales & Revenue Section */}
        <div className="nav-section">
          <h3>Sales & Revenue</h3>
          <NavLink to="/admin/sales" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
            📈 Sales Reports
          </NavLink>
          <NavLink to="/admin/revenue" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
            💰 Revenue Reports
          </NavLink>
        </div>

        {/* Security Section */}
        <div className="nav-section">
          <h3>Security</h3>
          <NavLink to="/admin/imei" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
            🔒 IMEI Blacklist
          </NavLink>
        </div>

        {/* Support Section */}
        <div className="nav-section">
          <h3>Support</h3>
          <NavLink to="/admin/tickets" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
            🎫 Support Tickets
          </NavLink>
        </div>

        {/* System Section */}
        <div className="nav-section">
          <h3>System</h3>
          <NavLink to="/admin/settings" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
            ⚙️ Settings
          </NavLink>
          <NavLink to="/admin/profile" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
            👤 Profile
          </NavLink>
        </div>
      </nav>
    </aside>
  )
}

export default AdminSidebar