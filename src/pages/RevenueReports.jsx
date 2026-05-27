import React, { useState, useEffect } from 'react'
import { salesApi } from '../api/sales'
import { productsApi } from '../api/products'
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts'
import toast from 'react-hot-toast'
import './RevenueReports.css'

const RevenueReports = () => {
  const [stats, setStats] = useState(null)
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState('monthly')
  const [chartData, setChartData] = useState([])

  const COLORS = ['#9c27b0', '#ff9800', '#4caf50', '#2196f3', '#f44336']

  useEffect(() => {
    loadData()
  }, [period])

  const loadData = async () => {
    try {
      const [statsRes, productsRes] = await Promise.all([
        salesApi.getStats(period),
        productsApi.getAll()
      ])
      setStats(statsRes.data)
      setProducts(productsRes.data.products || [])
      
      // Generate chart data
      const monthlyData = statsRes.data.by_product?.map((p, index) => ({
        name: p.product_name,
        revenue: p.total_revenue,
        commission: p.total_commission,
        sales: p.total_sales
      })) || []
      setChartData(monthlyData)
    } catch (error) {
      toast.error('Failed to load revenue data')
    } finally {
      setLoading(false)
    }
  }

  const exportReport = async () => {
    try {
      const response = await salesApi.exportReport({
        period,
        format: 'csv'
      })
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `revenue_report_${period}_${new Date().toISOString().split('T')[0]}.csv`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      toast.success('Export started')
    } catch (error) {
      toast.error('Failed to export report')
    }
  }

  if (loading) {
    return <div className="loading-spinner">Loading revenue data...</div>
  }

  return (
    <div className="revenue-reports">
      <h1 className="page-title">Revenue Reports</h1>

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
        <div className="summary-cards">
          <div className="summary-card">
            <div className="summary-icon">💰</div>
            <div className="summary-info">
              <h3>${stats.total_revenue?.toFixed(2) || '0'}</h3>
              <p>Total Revenue</p>
            </div>
          </div>
          <div className="summary-card">
            <div className="summary-icon">💸</div>
            <div className="summary-info">
              <h3>${stats.total_commission?.toFixed(2) || '0'}</h3>
              <p>Commissions Paid</p>
            </div>
          </div>
          <div className="summary-card">
            <div className="summary-icon">📈</div>
            <div className="summary-info">
              <h3>${((stats.total_revenue || 0) - (stats.total_commission || 0)).toFixed(2)}</h3>
              <p>Net Revenue</p>
            </div>
          </div>
        </div>
      )}

      <div className="charts-section">
        <div className="chart-card">
          <h3>Revenue by Product</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="revenue" fill="#9c27b0" name="Revenue ($)" />
              <Bar dataKey="commission" fill="#ff9800" name="Commission ($)" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <h3>Revenue Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={chartData}
                dataKey="revenue"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <h3>Sales Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="sales" stroke="#4caf50" name="Units Sold" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="breakdown-table">
        <h3>Revenue Breakdown by Product</h3>
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Units Sold</th>
                <th>Revenue</th>
                <th>Commission</th>
                <th>Net Revenue</th>
                <th>Commission Rate</th>
              </tr>
            </thead>
            <tbody>
              {stats?.by_product?.map(product => (
                <tr key={product.product_id}>
                  <td><strong>{product.product_name}</strong></td>
                  <td>{product.total_sales}</td>
                  <td>${product.total_revenue?.toFixed(2)}</td>
                  <td>${product.total_commission?.toFixed(2)}</td>
                  <td>${(product.total_revenue - product.total_commission).toFixed(2)}</td>
                  <td>{((product.total_commission / product.total_revenue) * 100).toFixed(1)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="employee-leaderboard">
        <h3>Top Performing Employees</h3>
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Sales</th>
                <th>Revenue Generated</th>
                <th>Commission Earned</th>
              </tr>
            </thead>
            <tbody>
              {stats?.employee_leaderboard?.map(emp => (
                <tr key={emp.employee_id}>
                  <td><strong>{emp.employee_name}</strong><br/><small>{emp.employee_email}</small></td>
                  <td>{emp.total_sales}</td>
                  <td>${emp.total_revenue?.toFixed(2)}</td>
                  <td>${emp.total_commission?.toFixed(2)}</td>
                </tr>
              ))}
              {(!stats?.employee_leaderboard || stats.employee_leaderboard.length === 0) && (
                <tr>
                  <td colSpan="4" className="no-data">No sales data available</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default RevenueReports