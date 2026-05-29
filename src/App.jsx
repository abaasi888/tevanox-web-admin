import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import LoadingSpinner from './components/common/LoadingSpinner'
import ProtectedRoute from './components/common/ProtectedRoute'

// Auth
import AdminLogin from './pages/AdminLogin'

// Admin Layout
import AdminLayout from './components/common/AdminLayout'

// Pages
import AdminDashboard from './pages/AdminDashboard'
import ProductsManagement from './pages/ProductsManagement'
import UsersManagement from './pages/UsersManagement'
import EmployeesManagement from './pages/EmployeesManagement'
import DevicesManagement from './pages/DevicesManagement'
import AssignmentsManagement from './pages/AssignmentsManagement'
import ActivityMonitor from './pages/ActivityMonitor'
import SalesReports from './pages/SalesReports'
import RevenueReports from './pages/RevenueReports'
import ImeiBlacklist from './pages/ImeiBlacklist'
import SupportTickets from './pages/SupportTickets'
import SystemSettings from './pages/SystemSettings'
import AdminProfile from './pages/AdminProfile'

// Commission Management (NEW)
import CommissionsManagement from './pages/CommissionsManagement'

import './App.css'

function App() {
  const { loading } = useAuth()

  if (loading) {
    return <LoadingSpinner />
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/admin/login" element={<AdminLogin />} />
        
        <Route path="/admin" element={
          <ProtectedRoute requireAdmin={true}>
            <AdminLayout />
          </ProtectedRoute>
        }>
          <Route index element={<Navigate to="/admin/dashboard" />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="products" element={<ProductsManagement />} />
          <Route path="users" element={<UsersManagement />} />
          <Route path="employees" element={<EmployeesManagement />} />
          <Route path="devices" element={<DevicesManagement />} />
          <Route path="assignments" element={<AssignmentsManagement />} />
          <Route path="activity" element={<ActivityMonitor />} />
          <Route path="sales" element={<SalesReports />} />
          <Route path="revenue" element={<RevenueReports />} />
          <Route path="imei" element={<ImeiBlacklist />} />
          <Route path="tickets" element={<SupportTickets />} />
          <Route path="settings" element={<SystemSettings />} />
          <Route path="profile" element={<AdminProfile />} />
          
          {/* Commission Management Route (NEW) */}
          <Route path="commissions" element={<CommissionsManagement />} />
        </Route>
        
        <Route path="*" element={<Navigate to="/admin/login" />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App