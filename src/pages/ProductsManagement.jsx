import React, { useState, useEffect } from 'react'
import { productsApi } from '../api/products'
import toast from 'react-hot-toast'
import './ProductsManagement.css'

const ProductsManagement = () => {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    short_description: '',
    price_usd: 0,
    commission_rules: {
      one_time_percentage: 30,
      recurring_percentage_referrer: 2,
      recurring_percentage_flasher: 5,
      requires_flash: true,
      flash_commission: 10,
      recurring_duration_months: null,
      permanent_salary_threshold: 10000,
      permanent_salary_months: 18
    },
    is_active: true,
    product_type: 'silent_guardian',
    display_order: 0,
    features: [],
    download_link: '',
    play_store_link: ''
  })
  const [featureInput, setFeatureInput] = useState('')

  useEffect(() => {
    loadProducts()
  }, [])

  const loadProducts = async () => {
    try {
      const response = await productsApi.getAllAdmin()
      setProducts(response.data.products || [])
    } catch (error) {
      toast.error('Failed to load products')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editingProduct) {
        await productsApi.update(editingProduct.id, formData)
        toast.success('Product updated')
      } else {
        await productsApi.create(formData)
        toast.success('Product created')
      }
      setShowModal(false)
      resetForm()
      loadProducts()
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Operation failed')
    }
  }

  const handleDelete = async (product) => {
    if (confirm(`Delete "${product.name}"? This will also delete all related data.`)) {
      try {
        await productsApi.delete(product.id)
        toast.success('Product deleted')
        loadProducts()
      } catch (error) {
        toast.error('Failed to delete')
      }
    }
  }

  const resetForm = () => {
    setEditingProduct(null)
    setFormData({
      name: '', slug: '', description: '', short_description: '',
      price_usd: 0,
      commission_rules: {
        one_time_percentage: 30,
        recurring_percentage_referrer: 2,
        recurring_percentage_flasher: 5,
        requires_flash: true,
        flash_commission: 10,
        recurring_duration_months: null,
        permanent_salary_threshold: 10000,
        permanent_salary_months: 18
      },
      is_active: true, product_type: 'silent_guardian', display_order: 0, features: [],
      download_link: '', play_store_link: ''
    })
    setFeatureInput('')
  }

  const addFeature = () => {
    if (featureInput.trim()) {
      setFormData({ ...formData, features: [...formData.features, featureInput.trim()] })
      setFeatureInput('')
    }
  }

  const removeFeature = (index) => {
    setFormData({ ...formData, features: formData.features.filter((_, i) => i !== index) })
  }

  const updateCommissionRule = (key, value) => {
    setFormData({
      ...formData,
      commission_rules: { ...formData.commission_rules, [key]: value }
    })
  }

  if (loading) return <div className="loading-spinner">Loading products...</div>

  return (
    <div className="products-management">
      <div className="page-header">
        <h1 className="page-title">Product Management</h1>
        <button className="btn-primary" onClick={() => { resetForm(); setShowModal(true) }}>
          + Add Product
        </button>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Slug</th>
              <th>Price</th>
              <th>Flash Required</th>
              <th>One-time %</th>
              <th>Recurring %</th>
              <th>Sales</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map(product => (
              <tr key={product.id}>
                <td><strong>{product.name}</strong>
                <td><code>{product.slug}</code></td>
                <td>${product.price_usd}</td>
                <td>{product.commission_rules?.requires_flash ? '✅ Yes' : '❌ No'}</td>
                <td>{product.commission_rules?.one_time_percentage || 30}%</td>
                <td>{product.commission_rules?.recurring_percentage_referrer || 2}% / {product.commission_rules?.recurring_percentage_flasher || 5}%</td>
                <td>{product.total_sales || 0}</td>
                <td><span className={`status-badge ${product.is_active ? 'active' : 'inactive'}`}>{product.is_active ? 'Active' : 'Inactive'}</span></td>
                <td className="actions-cell">
                  <button className="edit-btn" onClick={() => { setEditingProduct(product); setFormData(product); setShowModal(true) }}>Edit</button>
                  <button className="delete-btn" onClick={() => handleDelete(product)}>Delete</button>
                  <button className="view-btn" onClick={() => window.open(`/admin/products/${product.id}`, '_blank')}>View</button>
                </td>
              </tr>
            ))}
            {products.length === 0 && (
              <tr><td colSpan="9" className="no-data">No products found</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-container modal-large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingProduct ? 'Edit Product' : 'Create New Product'}</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                {/* Basic Information */}
                <div className="form-section-title">Basic Information</div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Product Name *</label>
                    <input type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required />
                  </div>
                  <div className="form-group">
                    <label>Slug *</label>
                    <input type="text" value={formData.slug} onChange={e => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/\s/g, '-') })} required />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Price (USD) *</label>
                    <input type="number" step="0.01" value={formData.price_usd} onChange={e => setFormData({ ...formData, price_usd: parseFloat(e.target.value) })} required />
                  </div>
                  <div className="form-group">
                    <label>Display Order</label>
                    <input type="number" value={formData.display_order} onChange={e => setFormData({ ...formData, display_order: parseInt(e.target.value) })} />
                  </div>
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <textarea value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} rows="3" placeholder="Full product description" />
                </div>
                <div className="form-group">
                  <label>Short Description</label>
                  <input type="text" value={formData.short_description} onChange={e => setFormData({ ...formData, short_description: e.target.value })} placeholder="Brief description for cards" />
                </div>

                {/* Commission Rules */}
                <div className="form-section-title">Commission Rules</div>
                <div className="form-row">
                  <div className="form-group">
                    <label>One-time Commission (%)</label>
                    <input type="number" value={formData.commission_rules.one_time_percentage} onChange={e => updateCommissionRule('one_time_percentage', parseInt(e.target.value))} min="0" max="100" />
                    <small>Percentage of first payment</small>
                  </div>
                  <div className="form-group">
                    <label>Flash Commission (%)</label>
                    <input type="number" value={formData.commission_rules.flash_commission} onChange={e => updateCommissionRule('flash_commission', parseInt(e.target.value))} min="0" max="100" />
                    <small>For technical agents who flash</small>
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Recurring (Referrer) %</label>
                    <input type="number" value={formData.commission_rules.recurring_percentage_referrer} onChange={e => updateCommissionRule('recurring_percentage_referrer', parseInt(e.target.value))} min="0" max="100" />
                    <small>Monthly for referring agent</small>
                  </div>
                  <div className="form-group">
                    <label>Recurring (Flasher) %</label>
                    <input type="number" value={formData.commission_rules.recurring_percentage_flasher} onChange={e => updateCommissionRule('recurring_percentage_flasher', parseInt(e.target.value))} min="0" max="100" />
                    <small>Monthly for flashing agent</small>
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Recurring Duration (months)</label>
                    <input type="number" value={formData.commission_rules.recurring_duration_months || ''} onChange={e => updateCommissionRule('recurring_duration_months', e.target.value ? parseInt(e.target.value) : null)} placeholder="null = forever" />
                    <small>Leave empty for unlimited recurring</small>
                  </div>
                  <div className="form-group checkbox">
                    <label>
                      <input type="checkbox" checked={formData.commission_rules.requires_flash} onChange={e => updateCommissionRule('requires_flash', e.target.checked)} />
                      Requires Device Flashing
                    </label>
                  </div>
                </div>

                {/* Permanent Salary Eligibility */}
                <div className="form-section-title">Permanent Salary Eligibility</div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Signup Threshold</label>
                    <input type="number" value={formData.commission_rules.permanent_salary_threshold} onChange={e => updateCommissionRule('permanent_salary_threshold', parseInt(e.target.value))} />
                    <small>Number of signups required</small>
                  </div>
                  <div className="form-group">
                    <label>Months Employed Threshold</label>
                    <input type="number" value={formData.commission_rules.permanent_salary_months} onChange={e => updateCommissionRule('permanent_salary_months', parseInt(e.target.value))} />
                    <small>Months of service required</small>
                  </div>
                </div>

                {/* Features */}
                <div className="form-section-title">Features</div>
                <div className="form-group">
                  <div className="feature-input-group">
                    <input type="text" value={featureInput} onChange={e => setFeatureInput(e.target.value)} placeholder="Add a feature..." />
                    <button type="button" onClick={addFeature}>Add</button>
                  </div>
                  <div className="features-list">
                    {formData.features.map((feature, idx) => (
                      <span key={idx} className="feature-tag">
                        {feature}
                        <button type="button" onClick={() => removeFeature(idx)}>×</button>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Download Links */}
                <div className="form-section-title">Download Links</div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Download Link (APK)</label>
                    <input type="url" value={formData.download_link} onChange={e => setFormData({ ...formData, download_link: e.target.value })} placeholder="https://..." />
                  </div>
                  <div className="form-group">
                    <label>Play Store Link</label>
                    <input type="url" value={formData.play_store_link} onChange={e => setFormData({ ...formData, play_store_link: e.target.value })} placeholder="https://play.google.com/..." />
                  </div>
                </div>

                {/* Status */}
                <div className="form-group checkbox">
                  <label>
                    <input type="checkbox" checked={formData.is_active} onChange={e => setFormData({ ...formData, is_active: e.target.checked })} />
                    Active (visible to sales agents)
                  </label>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary">Save Product</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default ProductsManagement