import React, { useState, useEffect } from 'react'
import { jobsApi } from '../api/jobs'
import toast from 'react-hot-toast'
import './JobsManagement.css'

const JobsManagement = () => {
  const [jobs, setJobs] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingJob, setEditingJob] = useState(null)
  const [formData, setFormData] = useState({
    title: '',
    department: '',
    location: '',
    employment_type: 'full-time',
    description: '',
    requirements: [],
    salary_range: '',
    is_active: true,
    application_deadline: ''
  })
  const [reqInput, setReqInput] = useState('')

  useEffect(() => {
    loadJobs()
    loadStats()
  }, [])

  const loadJobs = async () => {
    try {
      const res = await jobsApi.getAllJobs({ include_inactive: true })
      setJobs(res.data.jobs)
    } catch (error) {
      toast.error('Failed to load jobs')
    } finally {
      setLoading(false)
    }
  }

  const loadStats = async () => {
    try {
      const res = await jobsApi.getJobStats()
      setStats(res.data)
    } catch (error) {
      console.error('Failed to load stats')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editingJob) {
        await jobsApi.updateJob(editingJob.id, formData)
        toast.success('Job updated successfully')
      } else {
        await jobsApi.createJob(formData)
        toast.success('Job created successfully')
      }
      setShowModal(false)
      resetForm()
      loadJobs()
      loadStats()
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Operation failed')
    }
  }

  const handleDelete = async (job) => {
    if (confirm(`Delete "${job.title}"? This will also delete all applications for this job.`)) {
      try {
        await jobsApi.deleteJob(job.id)
        toast.success('Job deleted')
        loadJobs()
        loadStats()
      } catch (error) {
        toast.error('Failed to delete job')
      }
    }
  }

  const resetForm = () => {
    setEditingJob(null)
    setFormData({
      title: '',
      department: '',
      location: '',
      employment_type: 'full-time',
      description: '',
      requirements: [],
      salary_range: '',
      is_active: true,
      application_deadline: ''
    })
    setReqInput('')
  }

  const addRequirement = () => {
    if (reqInput.trim()) {
      setFormData({ ...formData, requirements: [...formData.requirements, reqInput.trim()] })
      setReqInput('')
    }
  }

  const removeRequirement = (idx) => {
    setFormData({ ...formData, requirements: formData.requirements.filter((_, i) => i !== idx) })
  }

  const toggleJobStatus = async (job) => {
    try {
      await jobsApi.updateJob(job.id, { is_active: !job.is_active })
      toast.success(`Job ${!job.is_active ? 'activated' : 'deactivated'}`)
      loadJobs()
      loadStats()
    } catch (error) {
      toast.error('Failed to update status')
    }
  }

  if (loading) {
    return <div className="loading-spinner">Loading jobs...</div>
  }

  return (
    <div className="jobs-management">
      <div className="page-header">
        <h1 className="page-title">Job Postings</h1>
        <button className="btn-primary" onClick={() => { resetForm(); setShowModal(true) }}>
          + New Job
        </button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="job-stats-grid">
          <div className="stat-card-small">
            <div className="stat-value">{stats.total_jobs}</div>
            <div className="stat-label">Total Jobs</div>
          </div>
          <div className="stat-card-small">
            <div className="stat-value">{stats.active_jobs}</div>
            <div className="stat-label">Active Jobs</div>
          </div>
          <div className="stat-card-small">
            <div className="stat-value">{stats.total_applications}</div>
            <div className="stat-label">Total Applications</div>
          </div>
          <div className="stat-card-small">
            <div className="stat-value">{stats.pending_applications}</div>
            <div className="stat-label">Pending Review</div>
          </div>
        </div>
      )}

      {/* Jobs Table */}
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Department</th>
              <th>Location</th>
              <th>Type</th>
              <th>Applications</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {jobs.map(job => (
              <tr key={job.id}>
                <td><strong>{job.title}</strong></td>
                <td>{job.department}</td>
                <td>{job.location}</td>
                <td>
                  <span className={`employment-badge ${job.employment_type}`}>
                    {job.employment_type}
                  </span>
                </td>
                <td>{job.applications_count || 0}</td>
                <td>
                  <button 
                    className={`status-toggle ${job.is_active ? 'active' : 'inactive'}`}
                    onClick={() => toggleJobStatus(job)}
                  >
                    {job.is_active ? 'Active' : 'Inactive'}
                  </button>
                </td>
                <td className="actions-cell">
                  <button 
                    className="view-btn" 
                    onClick={() => window.location.href = `/admin/applications?job=${job.id}`}
                  >
                    View Apps
                  </button>
                  <button 
                    className="edit-btn" 
                    onClick={() => { setEditingJob(job); setFormData(job); setShowModal(true) }}
                  >
                    Edit
                  </button>
                  <button 
                    className="delete-btn" 
                    onClick={() => handleDelete(job)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {jobs.length === 0 && (
              <tr>
                <td colSpan="7" className="no-data">No job postings created yet</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-container modal-large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingJob ? 'Edit Job' : 'Create New Job'}</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-row">
                  <div className="form-group">
                    <label>Job Title *</label>
                    <input 
                      type="text" 
                      value={formData.title} 
                      onChange={e => setFormData({ ...formData, title: e.target.value })} 
                      required 
                    />
                  </div>
                  <div className="form-group">
                    <label>Department *</label>
                    <input 
                      type="text" 
                      value={formData.department} 
                      onChange={e => setFormData({ ...formData, department: e.target.value })} 
                      required 
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Location *</label>
                    <input 
                      type="text" 
                      value={formData.location} 
                      onChange={e => setFormData({ ...formData, location: e.target.value })} 
                      required 
                    />
                  </div>
                  <div className="form-group">
                    <label>Employment Type *</label>
                    <select 
                      value={formData.employment_type} 
                      onChange={e => setFormData({ ...formData, employment_type: e.target.value })}
                    >
                      <option value="full-time">Full-time</option>
                      <option value="part-time">Part-time</option>
                      <option value="contract">Contract</option>
                      <option value="remote">Remote</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label>Description *</label>
                  <textarea 
                    rows="4" 
                    value={formData.description} 
                    onChange={e => setFormData({ ...formData, description: e.target.value })} 
                    required 
                  />
                </div>

                <div className="form-group">
                  <label>Requirements</label>
                  <div className="feature-input-group">
                    <input 
                      type="text" 
                      value={reqInput} 
                      onChange={e => setReqInput(e.target.value)} 
                      placeholder="Add a requirement"
                    />
                    <button type="button" onClick={addRequirement}>Add</button>
                  </div>
                  <div className="features-list">
                    {formData.requirements.map((req, idx) => (
                      <span key={idx} className="feature-tag">
                        {req}
                        <button type="button" onClick={() => removeRequirement(idx)}>×</button>
                      </span>
                    ))}
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Salary Range</label>
                    <input 
                      type="text" 
                      value={formData.salary_range} 
                      onChange={e => setFormData({ ...formData, salary_range: e.target.value })} 
                      placeholder="e.g., $50k - $70k"
                    />
                  </div>
                  <div className="form-group">
                    <label>Application Deadline</label>
                    <input 
                      type="date" 
                      value={formData.application_deadline?.split('T')[0] || ''} 
                      onChange={e => setFormData({ ...formData, application_deadline: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-group checkbox">
                  <label>
                    <input 
                      type="checkbox" 
                      checked={formData.is_active} 
                      onChange={e => setFormData({ ...formData, is_active: e.target.checked })}
                    />
                    Active (visible on careers page)
                  </label>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary">Save Job</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default JobsManagement