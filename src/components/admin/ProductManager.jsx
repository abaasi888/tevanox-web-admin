import React, { useState } from 'react'
import { productsApi } from '../../api/products'
import toast from 'react-hot-toast'
import './ProductManager.css'

const ProductManager = ({ products, onProductChange }) => {
  const [showModal, setShowModal] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    short_description: '',
    price_usd: 0,
    commission_rate: 30,
    features: [],
    download_link: '',
    play_store_link: '',
    product_type: 'silent_guardian',
    is_active: true,
    display_order: 0
  })
  const [featureInput, setFeatureInput] = useState('')

  const resetForm = () => {
    setEditingProduct(null)
    setFormData({
      name: '', slug: '', description: '', short_description: '',
      price_usd: 0, commission_rate: 30, features: [], download_link: '',
      play_store_link: '', product_type: 'silent_guardian', is_active: true, display_order: 0
    })
    setFeatureInput('')
  }

  const handleEdit = (product) => {
    setEditingProduct(product)
    setFormData({
      name: product.name,
      slug: product.slug,
      description: product.description,
      short_description: product.short_description || '',
      price_usd: product.price_usd,
      commission_rate: product.commission_rate,
      features: product.features || [],
      download_link: product.download_link || '',
      play_store_link: product.play_store_link || '',
      product_type: product.product_type,
      is_active: product.is_active,
      display_order: product.display_order || 0
    })
    setShowModal(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      if (editingProduct) {
        await productsApi.update(editingProduct.id, formData)
        toast.success('Product updated successfully')
      } else {
        await productsApi.create(formData)
        toast.success('Product created successfully')
      }
      setShowModal(false)
      resetForm()
      onProductChange()
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Operation failed')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (product) => {
    if (confirm(`Delete "${product.name}"? This will also remove access for all users.`)) {
      try {
        await productsApi.delete(product.id)
        toast.success('Product deleted')
        onProductChange()
      } catch (error) {
        toast.error('Failed to delete product')
      }
    }
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

  return (
    <div className="product-manager">
      <div className="product-manager-header">
        <h2>Products</h2>
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
              <th>Commission</th>
              <th>Type</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map(product => (
              <tr key={product.id}>
                <td><strong>{product.name}</strong></td>
                <td><code>{product.slug}</code></td>
                <td>${product.price_usd}</td>
                <td>{product.commission_rate}%</td>
                <td>
                  <span className={`product-type ${product.product_type}`}>
                    {product.product_type === 'silent_guardian' ? 'Silent Guardian' : 'Future Product'}
                  </span>
                </td>
                <td>
                  <span className={`status-badge ${product.is_active ? 'active' : 'inactive'}`}>
                    {product.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="actions-cell">
                  <button className="edit-btn" onClick={() => handleEdit(product)}>Edit</button>
                  <button className="delete-btn" onClick={() => handleDelete(product)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => { setShowModal(false); resetForm() }}>
          <div className="modal-container modal-large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingProduct ? 'Edit Product' : 'Create New Product'}</h3>
              <button className="modal-close" onClick={() => { setShowModal(false); resetForm() }}>×</button>
            </div>
            <form onSubmit={handleSubmit} className="product-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Product Name *</label>
                  <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label>Slug *</label>
                  <input type="text" value={formData.slug} onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/\s/g, '-') })} required />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Price (USD) *</label>
                  <input type="number" step="0.01" value={formData.price_usd} onChange={(e) => setFormData({ ...formData, price_usd: parseFloat(e.target.value) })} required />
                </div>
                <div className="form-group">
                  <label>Commission Rate (%)</label>
                  <input type="number" value={formData.commission_rate} onChange={(e) => setFormData({ ...formData, commission_rate: parseInt(e.target.value) })} />
                </div>
                <div className="form-group">
                  <label>Display Order</label>
                  <input type="number" value={formData.display_order} onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) })} />
                </div>
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows="3" />
              </div>

              <div className="form-group">
                <label>Short Description</label>
                <input type="text" value={formData.short_description} onChange={(e) => setFormData({ ...formData, short_description: e.target.value })} />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Download Link (APK)</label>
                  <input type="url" value={formData.download_link} onChange={(e) => setFormData({ ...formData, download_link: e.target.value })} placeholder="https://..." />
                </div>
                <div className="form-group">
                  <label>Play Store Link</label>
                  <input type="url" value={formData.play_store_link} onChange={(e) => setFormData({ ...formData, play_store_link: e.target.value })} />
                </div>
              </div>

              <div className="form-group">
                <label>Features</label>
                <div className="feature-input-group">
                  <input type="text" placeholder="Add a feature..." value={featureInput} onChange={(e) => setFeatureInput(e.target.value)} />
                  <button type="button" onClick={addFeature}>Add</button>
                </div>
                <div className="features-list">
                  {formData.features.map((feature, idx) => (
                    <span key={idx} className="feature-tag">
                      {feature} <button type="button" onClick={() => removeFeature(idx)}>×</button>
                    </span>
                  ))}
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Product Type</label>
                  <select value={formData.product_type} onChange={(e) => setFormData({ ...formData, product_type: e.target.value })}>
                    <option value="silent_guardian">Silent Guardian</option>
                    <option value="future_product">Future Product</option>
                  </select>
                </div>
                <div className="form-group checkbox">
                  <label>
                    <input type="checkbox" checked={formData.is_active} onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })} />
                    Active (visible to customers)
                  </label>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => { setShowModal(false); resetForm() }}>Cancel</button>
                <button type="submit" className="btn-primary" disabled={loading}>
                  {loading ? 'Saving...' : 'Save Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default ProductManager