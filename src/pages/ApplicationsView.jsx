import React, { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { jobsApi } from '../api/jobs'
import toast from 'react-hot-toast'
import './ApplicationsView.css'

const ApplicationsView = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const jobIdFilter = searchParams.get('job')
  
  const [applications, setApplications] = useState([])
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('')
  const [selectedJobFilter, setSelectedJobFilter] = useState(jobIdFilter || '')
  const [selectedApplication, setSelectedApplication] = useState(null)
  const [showDetailModal, setShowDetailModal] = useState(false)

  useEffect(() => {
    loadJobs()
    loadApplications()
  }, [statusFilter, selectedJobFilter])

  const loadJobs = async () => {
    try {
      const res = await jobsApi.getAllJobs({ include_inactive: true })
      setJobs(res.data.jobs)
    } catch (error) {
      console.error('Failed to load jobs')
    }
  }

  const loadApplications = async () => {
    try {
      const params = {}
      if (selectedJobFilter) params.job_id = selectedJobFilter
      if (statusFilter) params.status = statusFilter
      const res = await jobsApi.getApplications(params)
      setApplications(res.data.applications)
    } catch (error) {
      toast.error('Failed to load applications')
    } finally {
      setLoading(false)
    }
  }

  const updateStatus = async (appId, newStatus) => {
    try {
      await jobsApi.updateApplicationStatus(appId, newStatus)
      toast.success(`Status updated to ${newStatus}`)
      loadApplications()
      if (selectedApplication?.id === appId) {
        setSelectedApplication({ ...selectedApplication, status: newStatus })
      }
    } catch (error) {
      toast.error('Failed to update status')
    }
  }

  const viewApplication = async (appId) => {
    try {
      const res = await jobsApi.getApplication(appId)
      setSelectedApplication(res.data)
      setShowDetailModal(true)
    } catch (error) {
      toast.error('Failed to load application details')
    }
  }

  const downloadResume = (resumeUrl) => {
    window.open(resumeUrl, '_blank')
  }

  if (loading) {
    return <div className="loading-spinner">Loading applications...</div>
  }

  return (
    <div className="applications-view">
      <div className="page-header">
        <h1 className="page-title">Job Applications</h1>
        <button className="btn-outline" onClick={() => navigate('/admin/jobs')}>
          ← Back to Jobs
        </button>
      </div>

      <div className="filters-section">
        <div className="filter-group">
          <label>Job</label>
          <select value={selectedJobFilter} onChange={(e) => setSelectedJobFilter(e.target.value)}>
            <option value="">All Jobs</option>
            {jobs.map(job => (
              <option key={job.id} value={job.id}>{job.title}</option>
            ))}
          </select>
        </div>
        <div className="filter-group">
          <label>Status</label>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="reviewed">Reviewed</option>
            <option value="rejected">Rejected</option>
            <option value="hired">Hired</option>
          </select>
        </div>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Job Title</th>
              <th>Applicant</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Applied At</th>
              <th>Status</th>
              <th>Resume</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {applications.map(app => (
              <tr key={app.id}>
                <td><strong>{app.job_title}</strong></td>
                <td>{app.full_name}</td>
                <td>{app.email}</td>
                <td>{app.phone}</td>
                <td>{new Date(app.applied_at).toLocaleDateString()}</td>
                <td>
                  <span className={`status-badge ${app.status}`}>
                    {app.status}
                  </span>
                </td>
                <td>
                  <button 
                    className="resume-btn" 
                    onClick={() => downloadResume(app.resume_url)}
                  >
                    View CV
                  </button>
                </td>
                <td className="actions-cell">
                  <button 
                    className="view-details-btn" 
                    onClick={() => viewApplication(app.id)}
                  >
                    Details
                  </button>
                  <select 
                    className="status-select"
                    value={app.status} 
                    onChange={(e) => updateStatus(app.id, e.target.value)}
                  >
                    <option value="pending">Pending</option>
                    <option value="reviewed">Reviewed</option>
                    <option value="rejected">Rejected</option>
                    <option value="hired">Hired</option>
                  </select>
                </td>
              </tr>
            ))}
            {applications.length === 0 && (
              <tr>
                <td colSpan="8" className="no-data">No applications found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Application Detail Modal */}
      {showDetailModal && selectedApplication && (
        <div className="modal-overlay" onClick={() => setShowDetailModal(false)}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Application Details</h3>
              <button className="modal-close" onClick={() => setShowDetailModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="detail-section">
                <h4>Job Information</h4>
                <p><strong>Position:</strong> {selectedApplication.job_title}</p>
                <p><strong>Applied:</strong> {new Date(selectedApplication.applied_at).toLocaleString()}</p>
              </div>
              <div className="detail-section">
                <h4>Applicant Information</h4>
                <p><strong>Full Name:</strong> {selectedApplication.full_name}</p>
                <p><strong>Email:</strong> {selectedApplication.email}</p>
                <p><strong>Phone:</strong> {selectedApplication.phone}</p>
              </div>
              {selectedApplication.cover_letter && (
                <div className="detail-section">
                  <h4>Cover Letter</h4>
                  <p className="cover-letter">{selectedApplication.cover_letter}</p>
                </div>
              )}
              <div className="detail-section">
                <h4>Resume</h4>
                <button className="btn-outline-small" onClick={() => downloadResume(selectedApplication.resume_url)}>
                  Download Resume
                </button>
              </div>
              <div className="detail-section">
                <h4>Update Status</h4>
                <select 
                  value={selectedApplication.status} 
                  onChange={(e) => {
                    updateStatus(selectedApplication.id, e.target.value)
                    setSelectedApplication({ ...selectedApplication, status: e.target.value })
                  }}
                >
                  <option value="pending">Pending</option>
                  <option value="reviewed">Reviewed</option>
                  <option value="rejected">Rejected</option>
                  <option value="hired">Hired</option>
                </select>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowDetailModal(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ApplicationsView