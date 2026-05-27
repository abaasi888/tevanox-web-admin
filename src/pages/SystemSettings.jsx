import React, { useState, useEffect } from 'react'
import { adminApi } from '../api/admin'
import toast from 'react-hot-toast'
import './SystemSettings.css'

const SystemSettings = () => {
  const [settings, setSettings] = useState({
    maintenanceMode: false,
    allowNewRegistrations: true,
    pushNotificationsEnabled: true,
    requireKYC: true,
    defaultCommissionRate: 30
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      const response = await adminApi.getSettings()
      setSettings(response.data)
    } catch (error) {
      toast.error('Failed to load settings')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await adminApi.updateSettings(settings)
      toast.success('Settings saved successfully')
    } catch (error) {
      toast.error('Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  const handleChange = (key, value) => {
    setSettings({ ...settings, [key]: value })
  }

  if (loading) {
    return <div className="loading-spinner">Loading settings...</div>
  }

  return (
    <div className="system-settings">
      <h1 className="page-title">System Settings</h1>

      <div className="settings-form">
        <div className="settings-section">
          <h3>General Settings</h3>
          
          <div className="setting-item">
            <div className="setting-info">
              <label>Maintenance Mode</label>
              <p>When enabled, users cannot access the platform</p>
            </div>
            <div className="setting-control">
              <label className="switch">
                <input
                  type="checkbox"
                  checked={settings.maintenanceMode}
                  onChange={(e) => handleChange('maintenanceMode', e.target.checked)}
                />
                <span className="slider"></span>
              </label>
            </div>
          </div>

          <div className="setting-item">
            <div className="setting-info">
              <label>Allow New Registrations</label>
              <p>Allow new users to register on the platform</p>
            </div>
            <div className="setting-control">
              <label className="switch">
                <input
                  type="checkbox"
                  checked={settings.allowNewRegistrations}
                  onChange={(e) => handleChange('allowNewRegistrations', e.target.checked)}
                />
                <span className="slider"></span>
              </label>
            </div>
          </div>

          <div className="setting-item">
            <div className="setting-info">
              <label>Require KYC Verification</label>
              <p>Users must complete KYC before accessing full features</p>
            </div>
            <div className="setting-control">
              <label className="switch">
                <input
                  type="checkbox"
                  checked={settings.requireKYC}
                  onChange={(e) => handleChange('requireKYC', e.target.checked)}
                />
                <span className="slider"></span>
              </label>
            </div>
          </div>
        </div>

        <div className="settings-section">
          <h3>Notification Settings</h3>
          
          <div className="setting-item">
            <div className="setting-info">
              <label>Push Notifications</label>
              <p>Send push notifications to users and employees</p>
            </div>
            <div className="setting-control">
              <label className="switch">
                <input
                  type="checkbox"
                  checked={settings.pushNotificationsEnabled}
                  onChange={(e) => handleChange('pushNotificationsEnabled', e.target.checked)}
                />
                <span className="slider"></span>
              </label>
            </div>
          </div>
        </div>

        <div className="settings-section">
          <h3>Commission Settings</h3>
          
          <div className="setting-item">
            <div className="setting-info">
              <label>Default Commission Rate (%)</label>
              <p>Default commission rate for new products and employees</p>
            </div>
            <div className="setting-control">
              <input
                type="number"
                value={settings.defaultCommissionRate}
                onChange={(e) => handleChange('defaultCommissionRate', parseInt(e.target.value))}
                min="0"
                max="100"
                className="number-input"
              />
            </div>
          </div>
        </div>

        <div className="form-actions">
          <button className="btn-primary" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default SystemSettings