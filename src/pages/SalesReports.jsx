import React, { useState, useEffect } from 'react'
import { salesApi } from '../api/sales'
import toast from 'react-hot-toast'
import './SalesReports.css'

const SalesReports = () => {
  const [sales, setSales] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState('monthly')
  const [employeeId, setEmployeeId] = useState('')
  const [productId, setProductId] = useState('')

  useEffect(() => {
    loadData()
  }, [period, employeeId, productId])

  const loadData = async () => {
    try {
      const [statsRes, salesRes] = await Promise.all([
        salesApi.getStats(period),
        salesApi.getAll({ employee_id: employeeId || undefined, product_id: productId || undefined })
      ])
      setStats(statsRes.data)
      setSales(salesRes.data.sales || [])
    } catch (error) {
      toast.error('Failed to load sales data')
    } finally {
      setLoading(false)
    }
  }

  const exportReport = async () => {
    try {
      const response = await salesApi.exportReport({
        period,
        employee_id: employeeId || undefined,
        product_id: productId || undefined,
        format: 'csv'
      })
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `sales_report_${period}_${new Date().toISOString().split('T')[0]}.csv`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      toast.success('Export started')
    } catch (error) {
      toast.error('Failed to export report')
    }
  }

  if (loading) {
    return <div className="loading-spinner">Loading sales data...</div>
  }

  return (
    <div className="sales-reports">
      <h1 className="page-title">Sales Reports</h1>

      <div className="filters-section">
        <div className="filter-group">
          <label>Period</label>
          <select value={period} onChange={(e) => setPeriod(e.target.value)}>
            <option value="daily">Daily</option>
            <option value="monthly">Monthly</option>
            <option value="yearly">Yearly</option>
          </select>
        </div>
        <button className="btn-outline" onClick={exportReport}>Export Report</button>
      </div>

      {stats && (
        <div className="stats-cards">
          <div className="stat-card-sales">
            <div className="stat-icon">💰</div>
            <div className="stat-info">
              <h3>${stats.total_revenue?.toFixed(2) || '0'}</h3>
              <p>Total Revenue</p>
            </div>
          </div>
          <div className="stat-card-sales">
            <div className="stat-icon">💸</div>
            <div className="stat-info">
              <h3>${stats.total_commission?.toFixed(2) || '0'}</h3>
              <p>Total Commission</p>
            </div>
          </div>
        </div>
      )}

      {stats?.by_product && (
        <div className="product-breakdown">
          <h3>Sales by Product</h3>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Units Sold</th>
                  <th>Revenue</th>
                  <th>Commission</th>
                </tr>
              </thead>
              <tbody>
                {stats.by_product.map(product => (
                  <tr key={product.product_id}>
                    <td>{product.product_name}</td>
                    <td>{product.total_sales}</td>
                    <td>${product.total_revenue?.toFixed(2)}</td>
                    <td>${product.total_commission?.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="sales-list">
        <h3>Recent Sales</h3>
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Product</th>
                <th>Customer</th>
                <th>Employee</th>
                <th>Amount</th>
                <th>Commission</th>
              </tr>
            </thead>
            <tbody>
              {sales.map(sale => (
                <tr key={sale.id}>
                  <td>{new Date(sale.created_at).toLocaleDateString()}</td>
                  <td>{sale.product_name}</td>
                  <td>{sale.customer_name}<br/><small>{sale.customer_email}</small></td>
                  <td>{sale.employee?.name || sale.employee?.email}</td>
                  <td>${sale.amount?.toFixed(2)}</td>
                  <td>${sale.commission_amount?.toFixed(2)}</td>
                </tr>
              ))}
              {sales.length === 0 && (
                <tr>
                  <td colSpan="6" className="no-data">No sales records found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default SalesReports