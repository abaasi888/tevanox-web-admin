import React, { useState, useEffect } from 'react'
import { productsApi } from '../api/products'
import ProductManager from '../components/admin/ProductManager'
import toast from 'react-hot-toast'
import './ProductsManagement.css'

const ProductsManagement = () => {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadProducts()
  }, [])

  const loadProducts = async () => {
    try {
      const response = await productsApi.getAll()
      setProducts(response.data.products || [])
    } catch (error) {
      toast.error('Failed to load products')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="loading-spinner">Loading products...</div>
  }

  return (
    <div>
      <h1 className="page-title">Product Management</h1>
      <p className="page-subtitle">Manage all Tevanox software products sold by sales agents</p>
      <ProductManager products={products} onProductChange={loadProducts} />
    </div>
  )
}

export default ProductsManagement