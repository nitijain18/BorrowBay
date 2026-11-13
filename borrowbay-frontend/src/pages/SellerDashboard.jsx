import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/axiosConfig'
import { useAuth } from '../context/AuthContext'
import ImageUploader from '../components/ImageUploader'

export default function SellerDashboard() {
  const navigate = useNavigate()
  const { isLoggedIn } = useAuth()

  const [activeTab, setActiveTab]         = useState('overview')
  const [items, setItems]                 = useState([])
  const [sellerProfile, setSellerProfile] = useState(null)
  const [orders, setOrders]               = useState([])
  const [loading, setLoading]             = useState(true)
  const [showAddItem, setShowAddItem]     = useState(false)
  const [categories, setCategories]       = useState([])
  const [subCategories, setSubCategories] = useState([])
  const [itemForm, setItemForm] = useState({
    title: '', description: '',
    rentPricePerDay: '', securityDeposit: '',
    condition: 'GOOD', subCategoryId: ''
  })
  const [savingItem, setSavingItem]   = useState(false)
  const [itemError, setItemError]     = useState('')
  const [itemSuccess, setItemSuccess] = useState('')

  const [selectedFiles, setSelectedFiles] = useState([])
  const [previewUrls, setPreviewUrls]     = useState([])
  const fileInputRef = useRef()

  const [editingProfile, setEditingProfile] = useState(false)
  const [savingProfile, setSavingProfile]   = useState(false)
  const [profileSuccess, setProfileSuccess] = useState('')
  const [profileForm, setProfileForm]       = useState({
    businessName: '', city: '', profileDescription: '', gstin: ''
  })

  useEffect(() => {
    if (!isLoggedIn) { navigate('/login'); return }
    fetchData()
  }, [])

  useEffect(() => {
    if (sellerProfile) {
      setProfileForm({
        businessName:       sellerProfile.businessName || '',
        city:               sellerProfile.city || '',
        profileDescription: sellerProfile.profileDescription || '',
        gstin:              sellerProfile.gstin || ''
      })
    }
  }, [sellerProfile])

  const fetchData = async () => {
    try {
      const userData = JSON.parse(localStorage.getItem('user'))
      try {
        const profileRes = await api.get(`/seller-profiles/user/${userData.id}`)
        setSellerProfile(profileRes.data)
      } catch { setSellerProfile(null) }
      const itemsRes = await api.get(`/items/seller/${userData.id}`)
      setItems(itemsRes.data)
      const catRes = await api.get('/categories')
      setCategories(catRes.data)
      try {
       const ordersRes = await api.get(`/orders/seller/${userData.id}`)
const sorted = (ordersRes.data || []).sort(
  (a, b) => new Date(b.orderDate) - new Date(a.orderDate))
setOrders(sorted)
      } catch { setOrders([]) }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleCategoryChange = async (categoryId) => {
    setItemForm({ ...itemForm, subCategoryId: '' })
    try {
      const res = await api.get(`/subcategories/category/${categoryId}`)
      setSubCategories(res.data)
    } catch (err) { console.error(err) }
  }

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files)
    setSelectedFiles(files)
    setPreviewUrls(files.map(file => URL.createObjectURL(file)))
  }

  const handleAddItem = async (e) => {
    e.preventDefault()
    setSavingItem(true)
    setItemError('')
    try {
      const userData = JSON.parse(localStorage.getItem('user'))
      const res = await api.post('/items', {
        title:           itemForm.title,
        description:     itemForm.description,
        rentPricePerDay: parseFloat(itemForm.rentPricePerDay),
        securityDeposit: parseFloat(itemForm.securityDeposit),
        condition:       itemForm.condition,
        images:          [],
        seller:          { id: userData.id },
        subCategory:     { id: parseInt(itemForm.subCategoryId) }
      })
      const newItem = res.data
      if (selectedFiles.length > 0 && newItem?.id) {
        try {
          const formData = new FormData()
          selectedFiles.forEach(file => formData.append('files', file))
          await api.post(`/upload/item/${newItem.id}/images`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
          })
        } catch (uploadErr) {
          setItemError('Item created, but photo upload failed.')
        }
      }
      setItemSuccess('Item listed successfully!')
      setShowAddItem(false)
      setItemForm({ title: '', description: '', rentPricePerDay: '',
        securityDeposit: '', condition: 'GOOD', subCategoryId: '' })
      setSelectedFiles([])
      setPreviewUrls([])
      if (fileInputRef.current) fileInputRef.current.value = ''
      setActiveTab('listings')
      fetchData()
      setTimeout(() => setItemSuccess(''), 5000)
    } catch (err) {
      setItemError(err.response?.data || 'Failed to add item')
    } finally {
      setSavingItem(false)
    }
  }

  const handleToggleAvailability = async (itemId, currentStatus) => {
    try {
      await api.patch(`/items/${itemId}/availability?isAvailable=${!currentStatus}`)
      fetchData()
    } catch (err) { console.error(err) }
  }

  const handleDeleteItem = async (itemId) => {
    if (!window.confirm('Delete this item?')) return
    try {
      await api.delete(`/items/${itemId}`)
      fetchData()
    } catch (err) { console.error(err) }
  }

  const handleUpdateSellerProfile = async (e) => {
    e.preventDefault()
    setSavingProfile(true)
    try {
      const res = await api.put(`/seller-profiles/${sellerProfile.id}`, {
        ...sellerProfile,
        businessName:       profileForm.businessName,
        city:               profileForm.city,
        profileDescription: profileForm.profileDescription,
        gstin:              profileForm.gstin,
      })
      setSellerProfile(res.data)
      setEditingProfile(false)
      setProfileSuccess('Profile updated successfully!')
      setTimeout(() => setProfileSuccess(''), 3000)
    } catch (err) {
      console.error(err)
    } finally {
      setSavingProfile(false)
    }
  }

  // Calculate earnings from orders
  const calculateEarnings = () => {
    // Earned = item delivered to customer (seller's job done)
    const earnedOrders = orders.filter(o =>
      o.status === 'DELIVERED_TO_CUSTOMER' ||
      o.status === 'RETURN_REQUESTED' ||
      o.status === 'PICKED_UP_FROM_CUSTOMER' ||
      o.status === 'RETURNED_TO_SELLER' ||
      o.status === 'COMPLETED')

    // Upcoming = order confirmed but item not yet delivered
    const upcomingOrders = orders.filter(o =>
      o.status === 'CONFIRMED' ||
      o.status === 'PICKED_UP_FROM_SELLER')

    const totalEarned = earnedOrders.reduce(
      (sum, o) => sum + (o.totalRentAmount * 0.90), 0)

    const upcoming = upcomingOrders.reduce(
      (sum, o) => sum + (o.totalRentAmount * 0.90), 0)

    const thisMonth = earnedOrders.filter(o => {
      const date = new Date(o.orderDate)
      const now = new Date()
      return date.getMonth() === now.getMonth() &&
             date.getFullYear() === now.getFullYear()
    }).reduce((sum, o) => sum + (o.totalRentAmount * 0.90), 0)

    return {
      total:    Math.round(totalEarned),
      month:    Math.round(thisMonth),
      upcoming: Math.round(upcoming),
    }
  }

  const orderStatusLabel = {
    PENDING:                 { label: 'Payment Pending',   color: 'badge-yellow' },
    CONFIRMED:               { label: 'Order Confirmed',   color: 'badge-blue'   },
    PICKED_UP_FROM_SELLER:   { label: 'Out for Delivery',  color: 'badge-blue'   },
    DELIVERED_TO_CUSTOMER:   { label: 'Delivered',         color: 'badge-green'  },
    RETURN_REQUESTED:        { label: 'Return Requested',  color: 'badge-yellow' },
    PICKED_UP_FROM_CUSTOMER: { label: 'Return In Transit', color: 'badge-blue'   },
    RETURNED_TO_SELLER:      { label: 'Rental Complete',   color: 'badge-green'  },
    COMPLETED:               { label: 'Complete',          color: 'badge-green'  },
    CANCELLED:               { label: 'Cancelled',         color: 'badge-red'    },
  }

  if (loading) return (
    <div className="page-container">
      <div className="animate-pulse space-y-4">
        <div className="h-32 bg-gray-200 rounded-2xl" />
        <div className="h-64 bg-gray-200 rounded-2xl" />
      </div>
    </div>
  )

  if (!sellerProfile) return (
    <div className="page-container animate-fade-in">
      <div className="max-w-lg mx-auto text-center py-20">
        <p className="text-6xl mb-6">🏪</p>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Become a Seller</h1>
        <p className="text-gray-500 mb-8">List your items and start earning.</p>
        <button onClick={() => navigate('/seller/apply')}
                className="btn-primary text-lg px-8 py-4">Apply to Sell →</button>
      </div>
    </div>
  )

  if (sellerProfile.accountStatus === 'PENDING') return (
    <div className="page-container animate-fade-in">
      <div className="max-w-lg mx-auto text-center py-20">
        <p className="text-6xl mb-6">⏳</p>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Application Under Review</h1>
        <p className="text-gray-500 mb-4">We'll notify you once approved.</p>
        <span className="badge-yellow text-sm">Pending Approval</span>
      </div>
    </div>
  )

  if (sellerProfile.accountStatus === 'REJECTED') return (
    <div className="page-container animate-fade-in">
      <div className="max-w-lg mx-auto text-center py-20">
        <p className="text-6xl mb-6">❌</p>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Application Rejected</h1>
        <p className="text-red-500 mb-8">{sellerProfile.rejectionReason}</p>
        <button onClick={() => navigate('/seller/apply')} className="btn-primary">Reapply</button>
      </div>
    </div>
  )

  const availableItems   = items.filter(i => i.isAvailable)
  const unavailableItems = items.filter(i => !i.isAvailable)
  const earningsData     = calculateEarnings()
  const activeOrders     = orders.filter(o =>
    ['CONFIRMED','PICKED_UP_FROM_SELLER','DELIVERED_TO_CUSTOMER',
     'RETURN_REQUESTED','PICKED_UP_FROM_CUSTOMER'].includes(o.status))
  const completedOrders  = orders.filter(o =>
    ['COMPLETED','RETURNED_TO_SELLER'].includes(o.status))

  return (
    <div className="page-container animate-fade-in">

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="section-title">🏪 Seller Dashboard</h1>
          <p className="text-gray-500 mt-1">{sellerProfile.businessName}</p>
        </div>
        <span className="badge-green">✅ Approved Seller</span>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Listings',  value: items.length,            icon: '📦', color: 'text-blue-500' },
          { label: 'Available',       value: availableItems.length,   icon: '✅', color: 'text-green-500' },
          { label: 'Rented Out',      value: unavailableItems.length, icon: '🚚', color: 'text-orange-500' },
          { label: 'Total Earned',    value: `₹${earningsData.total}`,icon: '💰', color: 'text-primary-500' },
        ].map((stat, i) => (
          <div key={i} className="card p-4 animate-slide-up"
               style={{ animationDelay: `${i * 0.1}s` }}>
            <p className="text-2xl mb-1">{stat.icon}</p>
            <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
            <p className="text-gray-500 text-sm">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {[
          { id: 'overview',  label: '📊 Overview' },
          { id: 'orders',    label: `📋 Orders (${activeOrders.length} active)` },
          { id: 'earnings',  label: '💰 Earnings' },
          { id: 'listings',  label: '📦 My Listings' },
          { id: 'profile',   label: '👤 Profile' },
        ].map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                    activeTab === tab.id
                      ? 'bg-primary-500 text-white'
                      : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                  }`}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* OVERVIEW TAB */}
      {activeTab === 'overview' && (
        <div className="animate-fade-in space-y-4">

          {/* Earnings overview — 3 metrics */}
          <div className="bg-gradient-to-r from-primary-500 to-primary-700
                          rounded-2xl p-6 text-white">
            <h3 className="font-bold text-lg mb-4">💰 Earnings Overview</h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-primary-200 text-xs mb-1">Total Earned</p>
                <p className="text-3xl font-bold">₹{earningsData.total}</p>
                <p className="text-primary-200 text-xs">From delivered orders</p>
              </div>
              <div>
                <p className="text-primary-200 text-xs mb-1">This Month</p>
                <p className="text-3xl font-bold">₹{earningsData.month}</p>
                <p className="text-primary-200 text-xs">Month earnings</p>
              </div>
              <div>
                <p className="text-primary-200 text-xs mb-1">Upcoming</p>
                <p className="text-3xl font-bold">₹{earningsData.upcoming}</p>
                <p className="text-primary-200 text-xs">Orders being delivered</p>
              </div>
            </div>
            <p className="text-primary-200 text-xs mt-3">
              * You earn 90% of rent once item is delivered to customer.
              BorrowBay keeps 10% as platform fee.
            </p>
          </div>

          {/* Active orders alert */}
          {activeOrders.length > 0 && (
            <div className="card p-5 border-l-4 border-primary-400">
              <h3 className="font-bold text-gray-900 mb-2">
                📋 {activeOrders.length} Active Order(s)
              </h3>
              <div className="space-y-2 mb-3">
                {activeOrders.slice(0, 2).map(order => (
                  <div key={order.id} className="flex items-center
                                                  justify-between text-sm">
                    <span className="text-gray-600">Order #{order.id}</span>
                    <span className={`${orderStatusLabel[order.status]?.color} text-xs`}>
                      {orderStatusLabel[order.status]?.label}
                    </span>
                  </div>
                ))}
              </div>
              <button onClick={() => setActiveTab('orders')}
                      className="btn-primary text-sm py-2">
                View All Orders →
              </button>
            </div>
          )}

          {/* Quick actions */}
          <div className="card p-6">
            <h3 className="font-bold text-gray-900 mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <button onClick={() => { setActiveTab('listings'); setShowAddItem(true) }}
                      className="btn-primary text-sm py-3">+ Add New Item</button>
              <button onClick={() => setActiveTab('listings')}
                      className="btn-secondary text-sm py-3">View Listings</button>
              <button onClick={() => navigate('/items')}
                      className="btn-ghost text-sm py-3 border border-gray-200">
                Browse Marketplace
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ORDERS TAB */}
      {activeTab === 'orders' && (
        <div className="animate-fade-in">
          <h2 className="font-bold text-gray-900 mb-4">
            All Orders ({orders.length})
          </h2>

          {orders.length === 0 ? (
            <div className="card p-8 text-center">
              <p className="text-3xl mb-3">📋</p>
              <p className="text-gray-500">No orders yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order, i) => {
                const statusInfo = orderStatusLabel[order.status] ||
                  { label: order.status, color: 'badge-blue' }
                const earning = order.totalRentAmount * 0.90

                return (
                  <div key={order.id}
                       className="card p-5 animate-slide-up"
                       style={{ animationDelay: `${i * 0.05}s` }}>

                    {/* Header */}
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className="font-bold text-gray-900">
                          Order #{order.id}
                        </p>
                        <p className="text-gray-400 text-xs">
                          📅 {new Date(order.orderDate)
                                .toLocaleDateString('en-IN', {
                                  day: 'numeric', month: 'short',
                                  year: 'numeric'
                                })}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className={`${statusInfo.color} text-xs block mb-1`}>
                          {statusInfo.label}
                        </span>
                        <p className="text-primary-500 font-bold text-sm">
                          ₹{Math.round(earning)} earned
                        </p>
                      </div>
                    </div>

                    {/* Items */}
                    <div className="bg-gray-50 rounded-xl p-3 mb-3">
                      <p className="text-xs text-gray-400 mb-1">Items</p>
                      {order.items?.map(oi => (
                        <div key={oi.id}
                             className="flex items-center justify-between text-sm">
                          <span className="text-gray-700">
                            📦 {oi.item?.title || 'Item'}
                          </span>
                          <span className="text-gray-500 text-xs">
                            {oi.rentalStartDate} → {oi.rentalEndDate}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Customer */}
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">
                        👤 {order.customer?.firstName} {order.customer?.lastName}
                      </span>
                      <span className="text-gray-500">
                        ₹{order.totalRentAmount} rent +
                        ₹{order.totalDeposit} deposit
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* EARNINGS TAB */}
      {activeTab === 'earnings' && (
        <div className="animate-fade-in space-y-4">

          {/* Summary cards — 3 metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              {
                label: 'Total Earned',
                value: `₹${earningsData.total}`,
                icon: '💰',
                color: 'bg-green-50 text-green-700',
                desc: 'Earnings from delivered orders'
              },
              {
                label: 'This Month',
                value: `₹${earningsData.month}`,
                icon: '📅',
                color: 'bg-blue-50 text-blue-700',
                desc: 'Earned this month'
              },
              {
                label: 'Upcoming',
                value: `₹${earningsData.upcoming}`,
                icon: '⏳',
                color: 'bg-yellow-50 text-yellow-700',
                desc: 'Orders confirmed/in transit'
              },
            ].map((card, i) => (
              <div key={i} className={`rounded-2xl p-5 ${card.color}`}>
                <p className="text-3xl mb-1">{card.icon}</p>
                <p className="text-3xl font-bold">{card.value}</p>
                <p className="font-semibold text-sm mt-1">{card.label}</p>
                <p className="text-xs opacity-70 mt-1">{card.desc}</p>
              </div>
            ))}
          </div>

          {/* Earnings breakdown */}
          <div className="card p-6">
            <h3 className="font-bold text-gray-900 mb-4">
              How Earnings Work
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm py-2
                              border-b border-gray-100">
                <span className="text-gray-600">Customer pays rent</span>
                <span className="font-medium">100%</span>
              </div>
              <div className="flex justify-between text-sm py-2
                              border-b border-gray-100">
                <span className="text-gray-600">Platform fee</span>
                <span className="text-red-500 font-medium">- 10%</span>
              </div>
              <div className="flex justify-between text-sm py-2
                              border-b border-gray-100">
                <span className="text-gray-600">You receive</span>
                <span className="text-green-600 font-bold">90%</span>
              </div>
              <div className="flex justify-between text-sm py-2">
                <span className="text-gray-600">Security deposit</span>
                <span className="text-gray-500">
                  Returned to customer after item return
                </span>
              </div>
            </div>
          </div>

          {/* Completed orders earnings */}
          <div className="card p-6">
            <h3 className="font-bold text-gray-900 mb-4">
              Completed Rentals ({completedOrders.length})
            </h3>
            {completedOrders.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-4">
                No completed rentals yet
              </p>
            ) : (
              <div className="space-y-3">
                {completedOrders.map(order => (
                  <div key={order.id}
                       className="flex items-center justify-between
                                  py-3 border-b border-gray-100 last:border-0">
                    <div>
                      <p className="font-medium text-gray-900 text-sm">
                        Order #{order.id}
                      </p>
                      <p className="text-gray-400 text-xs">
                        {new Date(order.orderDate).toLocaleDateString('en-IN')}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-green-600 font-bold">
                        +₹{Math.round(order.totalRentAmount * 0.90)}
                      </p>
                      <p className="text-gray-400 text-xs">
                        90% of ₹{order.totalRentAmount}
                      </p>
                    </div>
                  </div>
                ))}
                <div className="flex justify-between pt-2 font-bold">
                  <span>Total</span>
                  <span className="text-green-600">₹{earningsData.total}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* LISTINGS TAB */}
      {activeTab === 'listings' && (
        <div className="animate-fade-in">

          {itemSuccess && (
            <div className="bg-green-50 border border-green-200 text-green-600
                            rounded-xl px-4 py-3 mb-4 text-sm animate-fade-in">
              ✅ {itemSuccess}
            </div>
          )}

          <div className="flex justify-between items-center mb-4">
            <h2 className="font-bold text-gray-900">My Listings ({items.length})</h2>
            <button onClick={() => setShowAddItem(!showAddItem)}
                    className="btn-primary text-sm py-2">+ Add Item</button>
          </div>

          {showAddItem && (
            <div className="card p-6 mb-6 animate-scale-in">
              <h3 className="font-semibold text-gray-900 mb-4">New Listing</h3>
              {itemError && (
                <div className="bg-red-50 border border-red-200 text-red-600
                                rounded-xl px-4 py-3 mb-4 text-sm">
                  ⚠️ {itemError}
                </div>
              )}
              <form onSubmit={handleAddItem} className="space-y-3">
                <input type="text" placeholder="Item title"
                       value={itemForm.title}
                       onChange={e => setItemForm({...itemForm, title: e.target.value})}
                       className="input-field" required />
                <textarea placeholder="Description"
                          value={itemForm.description}
                          onChange={e => setItemForm({...itemForm, description: e.target.value})}
                          className="input-field h-24 resize-none" required />
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Rent per day (₹)</label>
                    <input type="number" placeholder="500"
                           value={itemForm.rentPricePerDay}
                           onChange={e => setItemForm({...itemForm, rentPricePerDay: e.target.value})}
                           className="input-field" required />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Security deposit (₹)</label>
                    <input type="number" placeholder="2000"
                           value={itemForm.securityDeposit}
                           onChange={e => setItemForm({...itemForm, securityDeposit: e.target.value})}
                           className="input-field" required />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Condition</label>
                    <select value={itemForm.condition}
                            onChange={e => setItemForm({...itemForm, condition: e.target.value})}
                            className="input-field">
                      <option value="NEW">New</option>
                      <option value="LIKE_NEW">Like New</option>
                      <option value="GOOD">Good</option>
                      <option value="FAIR">Fair</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Category</label>
                    <select onChange={e => handleCategoryChange(e.target.value)}
                            className="input-field">
                      <option value="">Select category</option>
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
                {subCategories.length > 0 && (
                  <select value={itemForm.subCategoryId}
                          onChange={e => setItemForm({...itemForm, subCategoryId: e.target.value})}
                          className="input-field" required>
                    <option value="">Select subcategory</option>
                    {subCategories.map(sub => (
                      <option key={sub.id} value={sub.id}>{sub.name}</option>
                    ))}
                  </select>
                )}
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">📸 Photos (optional)</label>
                  <div onClick={() => fileInputRef.current?.click()}
                       className="border-2 border-dashed border-gray-300 rounded-xl
                                  p-6 text-center cursor-pointer hover:border-primary-400
                                  hover:bg-primary-50 transition-all duration-200">
                    <p className="text-3xl mb-2">📸</p>
                    <p className="text-gray-600 font-medium text-sm">Click to select photos</p>
                    {selectedFiles.length > 0 && (
                      <p className="text-primary-500 text-xs mt-2 font-medium">
                        {selectedFiles.length} photo(s) selected
                      </p>
                    )}
                  </div>
                  <input ref={fileInputRef} type="file" accept="image/*"
                         multiple onChange={handleFileSelect} className="hidden" />
                  {previewUrls.length > 0 && (
                    <div className="flex gap-2 mt-3 flex-wrap">
                      {previewUrls.map((url, idx) => (
                        <div key={idx} className="w-16 h-16 rounded-xl overflow-hidden border border-gray-200">
                          <img src={url} alt="" className="w-full h-full object-cover" />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex gap-3">
                  <button type="submit" disabled={savingItem} className="btn-primary flex-1">
                    {savingItem ? 'Saving...' : 'List Item'}
                  </button>
                  <button type="button" onClick={() => {
                    setShowAddItem(false)
                    setSelectedFiles([])
                    setPreviewUrls([])
                  }} className="btn-secondary flex-1">Cancel</button>
                </div>
              </form>
            </div>
          )}

          {items.length === 0 ? (
            <div className="card p-8 text-center">
              <p className="text-3xl mb-3">📦</p>
              <p className="text-gray-500 mb-4">No listings yet</p>
              <button onClick={() => setShowAddItem(true)} className="btn-primary text-sm">
                Add Your First Item
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item, i) => (
                <div key={item.id} className="card p-5 animate-slide-up"
                     style={{ animationDelay: `${i * 0.1}s` }}>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-16 h-16 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0">
                      {item.images?.[0] ? (
                        <img src={item.images[0]} alt={item.title}
                             className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-2xl text-gray-200">📦</div>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">{item.title}</p>
                      <p className="text-gray-400 text-xs">
                        {item.subCategory?.name} • ₹{item.rentPricePerDay}/day
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={item.isAvailable ? 'badge-green text-xs' : 'badge-red text-xs'}>
                          {item.isAvailable ? 'Available' : 'Rented Out'}
                        </span>
                        <span className="text-xs text-gray-400">
                          {item.images?.length || 0} photo(s)
                        </span>
                        <span className="text-xs text-gray-400">
                          ⭐ {item.averageRating?.toFixed(1) || '0.0'}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleToggleAvailability(item.id, item.isAvailable)}
                        className={`text-xs px-3 py-1 rounded-lg transition-colors ${
                          item.isAvailable
                            ? 'bg-red-50 text-red-500 hover:bg-red-100'
                            : 'bg-green-50 text-green-500 hover:bg-green-100'}`}>
                        {item.isAvailable ? 'Mark Rented' : 'Mark Available'}
                      </button>
                      <button onClick={() => navigate(`/items/${item.id}`)}
                              className="text-xs px-3 py-1 rounded-lg bg-primary-50 text-primary-500 hover:bg-primary-100 transition-colors">
                        View
                      </button>
                      <button onClick={() => handleDeleteItem(item.id)}
                              className="text-xs px-3 py-1 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-colors">
                        Delete
                      </button>
                    </div>
                  </div>

                  {item.images && item.images.length > 0 && (
                    <div className="mb-3">
                      <p className="text-xs text-gray-500 mb-2 font-medium">Current Photos:</p>
                      <div className="flex gap-2 flex-wrap">
                        {item.images.map((img, idx) => (
                          <div key={idx} className="w-16 h-16 rounded-xl overflow-hidden border border-gray-200">
                            <img src={img} alt="" className="w-full h-full object-cover" />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="border-t border-gray-100 pt-3">
                    <p className="text-xs text-gray-500 mb-2 font-medium">📸 Add More Photos:</p>
                    <ImageUploader
                      endpoint={`/upload/item/${item.id}/images`}
                      multiple={true}
                      label="Upload Item Photos"
                      onUploadSuccess={(updatedItem) => {
                        setItems(prev => prev.map(it =>
                          it.id === item.id ? updatedItem : it
                        ))
                        setItemSuccess('Photos uploaded successfully!')
                        setTimeout(() => setItemSuccess(''), 3000)
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* PROFILE TAB */}
      {activeTab === 'profile' && (
        <div className="card p-6 animate-fade-in">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-900">Seller Profile</h3>
            <button onClick={() => setEditingProfile(!editingProfile)}
                    className="text-primary-500 text-sm hover:text-primary-600">
              {editingProfile ? 'Cancel' : '✏️ Edit'}
            </button>
          </div>

          {profileSuccess && (
            <div className="bg-green-50 border border-green-200 text-green-600
                            rounded-xl px-4 py-3 mb-4 text-sm">
              ✅ {profileSuccess}
            </div>
          )}

          {editingProfile ? (
            <form onSubmit={handleUpdateSellerProfile} className="space-y-3">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Business Name</label>
                <input type="text" value={profileForm.businessName}
                       onChange={e => setProfileForm({...profileForm, businessName: e.target.value})}
                       className="input-field" required />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">City</label>
                <input type="text" value={profileForm.city} placeholder="Mumbai"
                       onChange={e => setProfileForm({...profileForm, city: e.target.value})}
                       className="input-field" required />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Profile Description</label>
                <textarea value={profileForm.profileDescription}
                          onChange={e => setProfileForm({...profileForm, profileDescription: e.target.value})}
                          className="input-field h-20 resize-none"
                          placeholder="Tell customers about your business..." />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">GSTIN (optional)</label>
                <input type="text" value={profileForm.gstin}
                       onChange={e => setProfileForm({...profileForm, gstin: e.target.value})}
                       className="input-field" />
              </div>
              <div className="flex gap-3">
                <button type="submit" disabled={savingProfile} className="btn-primary flex-1">
                  {savingProfile ? 'Saving...' : 'Save Changes'}
                </button>
                <button type="button" onClick={() => setEditingProfile(false)}
                        className="btn-secondary flex-1">Cancel</button>
              </div>
            </form>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'Business Name',    value: sellerProfile.businessName },
                { label: 'City',             value: sellerProfile.city },
                { label: 'Account Status',   value: sellerProfile.accountStatus },
                { label: 'Total Earned',     value: `₹${earningsData.total}` },
                { label: 'GSTIN',            value: sellerProfile.gstin || 'Not provided' },
                { label: 'Description',      value: sellerProfile.profileDescription || 'Not provided' },
              ].map((field, i) => (
                <div key={i} className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs text-gray-400 mb-1">{field.label}</p>
                  <p className="font-medium text-gray-900">{field.value}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}