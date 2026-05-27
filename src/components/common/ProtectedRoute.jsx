import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import LoadingSpinner from './LoadingSpinner'

const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const { isAuthenticated, loading, user } = useAuth()

  if (loading) {
    return <LoadingSpinner />
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />
  }

  if (requireAdmin && user?.role !== 'admin') {
    return <Navigate to="/admin/login" replace />
  }

  return children
}

export default ProtectedRoute