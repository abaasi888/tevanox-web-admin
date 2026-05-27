import React, { useState, useEffect } from 'react'
import { adminApi } from '../api/admin'
import toast from 'react-hot-toast'
import './ImeiBlacklist.css'

const ImeiBlacklist = () => {
  const [blacklist, setBlacklist] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [formData, setFormData] = useState({
    imei: '',
    reason: '',
    deviceModel: '',
    manufacturer: ''
  })

  useEffect(() => {
    loadBlacklist()
  }, [])

  const loadBlacklist = async () => {
    try {
      const response = await adminApi.getImeiBlacklist()
      setBlacklist(response.data.blacklist || [])
    } catch (error) {
      toast.error('Failed to load blacklist')
    } finally {
      setLoading(false)
    }
  }

  const addToBlacklist = async (e) => {
    e.preventDefault()
    if (!formData.imei || formData.imei.length !== 15) {
      toast.error('IMEI must be 15 digits')
      return
    }
    if (!formData.reason) {
      toast.error('Please provide a reason')
      return
    }

    try {
      await adminApi.addImeiToBlacklist(formData)
      toast.success('IMEI added to blacklist')
      setShowModal(false)
      setFormData({ imei: '', reason: '', deviceModel: '', manufacturer: '' })
      loadBlacklist()
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to add IMEI')
    }
  }

  const removeFromBlacklist = async (entryId) => {
    if (confirm('Remove this IMEI from blacklist?')) {
      try {
        await adminApi.removeImeiFromBlacklist(entryId)
        toast.success('IMEI removed from blacklist')
        loadBlacklist()
      } catch (error) {
        toast.error('Failed to remove IMEI')
      }
    }
  }

  if (loading) {
    return <div className="loading-spinner">Loading blacklist...</div>
  }

  return (
    <div className="imei-blacklist">
      <div className="page-header">
        <h1 className="page-title">IMEI Blacklist</h1>
        <button className="btn-primary" onClick={() => setShowModal(true)}>
          + Add IMEI
        </button>
      </div>

      <div className="info-box">
        <p>🔒 When a device is reported stolen, its IMEI is added to the blacklist. 
        The tracking app checks the IMEI against this list on startup and automatically locks the device.</p>
      </div>

      <div className="search-bar">
        <input
          type="text"
          placeholder="Search IMEI, reason, or reporter..."
          onChange={(e) => {
            const term = e.target.value.toLowerCase()
            // Filter logic can be added here
          }}
        />
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>IMEI Number</th>
              <th>Reason</th>
              <th>Reported By</th>
              <th>Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {blacklist.map(item => (
              <tr key={item.id}>
                <td><code>{item.imei}</code></td>
                <td>{item.reason}</td>
                <td>{item.reportedBy}</td>
                <td>{new Date(item.createdAt).toLocaleDateString()}</td>
                <td>
                  <span className={`status-badge ${item.status}`}>
                    {item.status}
                  </span>
                </td>
                <td className="actions-cell">
                  <button className="remove-btn" onClick={() => removeFromBlacklist(item.id)}>
                    Remove
                  </button>
                </td>
              </tr>
            ))}
            {blacklist.length === 0 && (
              <tr>
                <td colSpan="6" className="no-data">No IMEIs in blacklist</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Add IMEI to Blacklist</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            <form onSubmit={addToBlacklist}>
              <div className="modal-body">
                <div className="form-group">
                  <label>IMEI Number *</label>
                  <input
                    type="text"
                    placeholder="15-digit IMEI number"
                    value={formData.imei}
                    onChange={(e) => setFormData({ ...formData, imei: e.target.value })}
                    pattern="[0-9]{15}"
                    required
                  />
                  <small>Find IMEI by dialing *#06# on the device</small>
                </div>
                <div className="form-group">
                  <label>Reason *</label>
                  <select
                    value={formData.reason}
                    onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                    required
                  >
                    <option value="">Select reason...</option>
                    <option value="Reported stolen">Reported stolen</option>
                    <option value="Lost device">Lost device</option>
                    <option value="Fraudulent activity">Fraudulent activity</option>
                  </select>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Device Model</label>
                    <input
                      type="text"
                      placeholder="e.g., iPhone 14, Galaxy S23"
                      value={formData.deviceModel}
                      onChange={(e) => setFormData({ ...formData, deviceModel: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Manufacturer</label>
                    <input
                      type="text"
                      placeholder="e.g., Apple, Samsung"
                      value={formData.manufacturer}
                      onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
                    />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary">Add to Blacklist</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default ImeiBlacklist