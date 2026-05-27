import React, { useState, useEffect } from 'react'
import { devicesApi } from '../api/devices'
import toast from 'react-hot-toast'
import './DevicesManagement.css'

const DevicesManagement = () => {
  const [devices, setDevices] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showTrackModal, setShowTrackModal] = useState(false)
  const [selectedDevice, setSelectedDevice] = useState(null)

  useEffect(() => {
    loadDevices()
  }, [])

  const loadDevices = async () => {
    try {
      const response = await devicesApi.getAll()
      setDevices(response.data.devices || [])
    } catch (error) {
      toast.error('Failed to load devices')
    } finally {
      setLoading(false)
    }
  }

  const updateStatus = async (deviceId, status) => {
    try {
      await devicesApi.updateStatus(deviceId, status)
      toast.success(`Device marked as ${status}`)
      loadDevices()
    } catch (error) {
      toast.error('Failed to update status')
    }
  }

  const deleteDevice = async (deviceId) => {
    if (confirm('Delete this device?')) {
      try {
        await devicesApi.delete(deviceId)
        toast.success('Device deleted')
        loadDevices()
      } catch (error) {
        toast.error('Failed to delete device')
      }
    }
  }

  const trackDevice = async (device) => {
    setSelectedDevice(device)
    try {
      const response = await devicesApi.trackLocation(device.id)
      setSelectedDevice({ ...device, lastLocation: response.data.location })
      setShowTrackModal(true)
    } catch (error) {
      toast.error('Failed to get location')
    }
  }

  const filteredDevices = devices.filter(device =>
    device.deviceName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    device.deviceId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    device.owner?.email?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return <div className="loading-spinner">Loading devices...</div>
  }

  return (
    <div className="devices-management">
      <h1 className="page-title">Device Management</h1>
      
      <div className="search-bar">
        <input
          type="text"
          placeholder="Search by device name, ID, or owner..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Device Name</th>
              <th>Device ID</th>
              <th>Owner</th>
              <th>Status</th>
              <th>Battery</th>
              <th>Last Seen</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredDevices.map(device => (
              <tr key={device.id}>
                <td><strong>{device.deviceName}</strong></td>
                <td><code>{device.deviceId}</code></td>
                <td>{device.owner?.email || 'Unknown'}</td>
                <td>
                  <select
                    value={device.status}
                    onChange={(e) => updateStatus(device.id, e.target.value)}
                    className={`status-select ${device.status}`}
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="stolen">Stolen</option>
                  </select>
                </td>
                <td>{device.battery || '—'}%</td>
                <td>{device.lastSeen ? new Date(device.lastSeen).toLocaleString() : 'Never'}</td>
                <td className="actions-cell">
                  <button className="track-btn" onClick={() => trackDevice(device)}>Track</button>
                  <button className="delete-btn" onClick={() => deleteDevice(device.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showTrackModal && selectedDevice && (
        <div className="modal-overlay" onClick={() => setShowTrackModal(false)}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Track Device - {selectedDevice.deviceName}</h3>
              <button className="modal-close" onClick={() => setShowTrackModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="tracking-info">
                <p><strong>Device ID:</strong> {selectedDevice.deviceId}</p>
                <p><strong>Owner:</strong> {selectedDevice.owner?.email || 'Unknown'}</p>
                <p><strong>Status:</strong> <span className={`status-badge ${selectedDevice.status}`}>{selectedDevice.status}</span></p>
              </div>
              {selectedDevice.lastLocation ? (
                <div className="location-info">
                  <h4>Last Known Location</h4>
                  <p>📍 Latitude: {selectedDevice.lastLocation.lat}</p>
                  <p>📍 Longitude: {selectedDevice.lastLocation.lng}</p>
                  <p>🕐 {new Date(selectedDevice.lastSeen).toLocaleString()}</p>
                </div>
              ) : (
                <p>No location data available for this device.</p>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowTrackModal(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default DevicesManagement