import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/axiosConfig'
import { useAuth } from '../context/AuthContext'

export default function AdminDashboard() {
  const navigate = useNavigate()
  const { isLoggedIn, isAdmin } = useAuth()

  const [activeTab, setActiveTab]           = useState('overview')
  const [pendingSellers, setPendingSellers] = useState([])
  const [allOrders, setAllOrders]           = useState([])
  const [allUsers, setAllUsers]             = useState([])
  const [allItems, setAllItems]             = useState([])
  const [allCategories, setAllCategories]       = useState([])
  const [allSubCategories, setAllSubCategories] = useState([])
  const [supportTickets, setSupportTickets]     = useState([])
  const [pendingPhotographers, setPendingPhotographers] = useState([])
  const [pendingDeliveryPartners, setPendingDeliveryPartners] = useState([])
  const [loading, setLoading]               = useState(true)
  const [actionLoading, setActionLoading]   = useState(null)
  const [success, setSuccess]               = useState('')
  const [selectedUser, setSelectedUser]     = useState(null)

  // All-profile lookups (used for city display/edit + accurate counts)
  const [allSellerProfiles, setAllSellerProfiles]     = useState([])
  const [allPhotographers, setAllPhotographers]       = useState([])
  const [allDeliveryPartners, setAllDeliveryPartners] = useState([])

  // Category form
  const [showCatForm, setShowCatForm]   = useState(false)
  const [catForm, setCatForm]           = useState({ name: '', imageUrl: '' })
  const [savingCat, setSavingCat]       = useState(false)

  // SubCategory form
  const [showSubCatForm, setShowSubCatForm] = useState(false)
  const [subCatForm, setSubCatForm] = useState({
    name: '', imageUrl: '', categoryId: ''
  })
  const [savingSubCat, setSavingSubCat] = useState(false)

 useEffect(() => {
  if (!isLoggedIn) { navigate('/login'); return }
  if (!isAdmin)    { navigate('/');      return }
  fetchData()
}, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [sellersRes, ordersRes, usersRes, itemsRes,
             catRes, subCatRes, ticketsRes,
             photosRes, deliveryRes, allSellersRes] = await Promise.all([
        api.get('/seller-profiles/pending'),
        api.get('/orders'),
        api.get('/users'),
        api.get('/items/all'),
        api.get('/categories'),
        api.get('/subcategories'),
        api.get('/support-tickets/status/OPEN').catch(() => ({ data: [] })),
        api.get('/photographer-profiles'),
        api.get('/delivery-partner-profiles'),
        api.get('/seller-profiles'),
      ])

      setPendingSellers(sellersRes.data)

      const sortedOrders = ordersRes.data.sort(
        (a, b) => new Date(b.orderDate) - new Date(a.orderDate))
      setAllOrders(sortedOrders)

      setAllUsers(usersRes.data)
      setAllItems(itemsRes.data)
      setAllCategories(catRes.data)
      setAllSubCategories(subCatRes.data)
      setSupportTickets(ticketsRes.data)
      setAllPhotographers(photosRes.data)
      setAllDeliveryPartners(deliveryRes.data)
      setAllSellerProfiles(allSellersRes.data)
      setPendingPhotographers(photosRes.data.filter(p => !p.isVerified))
      setPendingDeliveryPartners(deliveryRes.data.filter(d => !d.isVerified))
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleApproveSeller = async (profileId) => {
    setActionLoading(profileId)
    try {
      await api.patch(`/seller-profiles/${profileId}/approve`)
      setSuccess('Seller approved successfully!')
      fetchData()
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      console.error(err)
    } finally {
      setActionLoading(null)
    }
  }

  const handleRejectSeller = async (profileId) => {
    const reason = window.prompt('Rejection reason:')
    if (!reason) return
    setActionLoading(profileId)
    try {
      await api.patch(
        `/seller-profiles/${profileId}/reject?reason=${reason}`)
      setSuccess('Seller rejected.')
      fetchData()
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      console.error(err)
    } finally {
      setActionLoading(null)
    }
  }

  const handleUpdateOrderStatus = async (orderId, status) => {
    setActionLoading(orderId)
    try {
      await api.patch(`/orders/${orderId}/status?status=${status}`)
      setSuccess(`Order #${orderId} updated to ${status}`)
      fetchData()
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      console.error(err)
    } finally {
      setActionLoading(null)
    }
  }

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Delete this user?')) return
    setActionLoading(userId)
    try {
      await api.delete(`/users/${userId}`)
      setSuccess('User deleted')
      fetchData()
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      console.error(err)
    } finally {
      setActionLoading(null)
    }
  }

  const handleAddCategory = async (e) => {
    e.preventDefault()
    setSavingCat(true)
    try {
      await api.post('/categories', catForm)
      setSuccess('Category added!')
      setCatForm({ name: '', imageUrl: '' })
      setShowCatForm(false)
      fetchData()
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      console.error(err)
    } finally {
      setSavingCat(false)
    }
  }

  const handleAddSubCategory = async (e) => {
    e.preventDefault()
    setSavingSubCat(true)
    try {
      await api.post('/subcategories', {
        name:     subCatForm.name,
        imageUrl: subCatForm.imageUrl,
        category: { id: parseInt(subCatForm.categoryId) }
      })
      setSuccess('SubCategory added!')
      setSubCatForm({ name: '', imageUrl: '', categoryId: '' })
      setShowSubCatForm(false)
      fetchData()
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      console.error(err)
    } finally {
      setSavingSubCat(false)
    }
  }

  const handleDeleteCategory = async (id) => {
    if (!window.confirm('Delete category? This may affect existing items.')) return
    try {
      await api.delete(`/categories/${id}`)
      setSuccess('Category deleted')
      fetchData()
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setSuccess('Cannot delete — items exist in this category')
      setTimeout(() => setSuccess(''), 3000)
    }
  }

  const handleDeleteSubCategory = async (id) => {
    if (!window.confirm('Delete subcategory?')) return
    try {
      await api.delete(`/subcategories/${id}`)
      setSuccess('SubCategory deleted')
      fetchData()
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      console.error(err)
    }
  }

  const handleRemoveItemWithReason = async (item) => {
    const reason = window.prompt(
      `Reason for removing "${item.title}":\n\nThis message will be sent to the seller.`
    )

    // If user cancelled the prompt
    if (reason === null) return
    // If user submitted empty reason
    if (reason.trim() === '') {
      alert('Please provide a reason')
      return
    }

    setActionLoading(item.id)
    try {
      // Delete the item
      await api.delete(`/items/${item.id}`)

      // Notify the seller with reason
      if (item.seller?.id) {
        try {
          await api.post('/notifications', {
            message: `❌ Your item "${item.title}" has been removed by admin. Reason: ${reason}`,
            type:    'GENERAL',
            user:    { id: item.seller.id }
          })
        } catch (notifErr) {
          console.warn('Failed to notify seller:', notifErr)
        }
      }

      setSuccess(`✅ Item "${item.title}" removed. Seller notified.`)
      fetchData()
      setTimeout(() => setSuccess(''), 4000)

    } catch (err) {
      console.error(err)
      setSuccess('❌ Failed to remove item')
      setTimeout(() => setSuccess(''), 3000)
    } finally {
      setActionLoading(null)
    }
  }

  const handleResolveTicket = async (ticket) => {
    const reason = window.prompt('Resolution note for closing this report:')
    if (!reason) return
    try {
      await api.patch(
        `/support-tickets/${ticket.id}/resolve?resolution=${reason}`
      )
      setSuccess('Report resolved!')
      fetchData()
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) { console.error(err) }
  }

  const handleVerifyPhotographer = async (photo) => {
    setActionLoading(photo.id)
    try {
      await api.patch(`/photographer-profiles/${photo.id}/verify`)

      // Notify the photographer
      if (photo.user?.id) {
        await api.post('/notifications', {
          message: `🎉 Congratulations! Your photographer profile has been verified. You can now receive bookings from customers!`,
          type:    'GENERAL',
          user:    { id: photo.user.id }
        })
      }

      setSuccess('Photographer verified and notified!')
      fetchData()
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      console.error(err)
    } finally {
      setActionLoading(null)
    }
  }

  const handleVerifyDeliveryPartner = async (partner) => {
    setActionLoading(partner.id)
    try {
      await api.patch(`/delivery-partner-profiles/${partner.id}/verify`)

      // Notify partner
      if (partner.user?.id) {
        await api.post('/notifications', {
          message: `🎉 Your delivery partner profile has been verified! You can now receive delivery assignments.`,
          type: 'GENERAL',
          user: { id: partner.user.id }
        })
      }

      setSuccess('Delivery partner verified and notified!')
      fetchData()
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      console.error(err)
    } finally {
      setActionLoading(null)
    }
  }

  const getCategoryEmoji = (name) => {
    const emojis = {
      'Electronics': '📷', 'Fashion': '👗',  'Sports': '🚲',
      'Music':       '🎸', 'Books':   '📚',  'Furniture': '🪑',
      'Tools':       '🔧', 'Vehicles':'🚗',  'Cameras': '📷',
      'Bikes':       '🚲', 'Clothing':'👕',  'Drones': '🚁',
      'Tents':       '⛺', 'Guitars': '🎸',
    }
    return emojis[name] || '📦'
  }
const statusConfig = {
  PENDING:                 { color: 'badge-yellow', label: 'Payment Pending' },
  CONFIRMED:               { color: 'badge-blue',   label: 'Confirmed' },
  PICKED_UP_FROM_SELLER:   { color: 'badge-blue',   label: 'Out for Delivery' },
  DELIVERED_TO_CUSTOMER:   { color: 'badge-green',  label: 'Delivered' },
  RETURN_REQUESTED:        { color: 'badge-yellow', label: 'Return Requested' },
  PICKED_UP_FROM_CUSTOMER: { color: 'badge-blue',   label: 'Return In Transit' },
  RETURNED_TO_SELLER:      { color: 'badge-green',  label: 'Rental Complete' },
  COMPLETED:               { color: 'badge-green',  label: 'Complete' },
  CANCELLED:               { color: 'badge-red',    label: 'Cancelled' },
}
  const nextStatus = {
    PENDING:               'CONFIRMED',
    CONFIRMED:             'PICKED_UP_FROM_SELLER',
    PICKED_UP_FROM_SELLER: 'DELIVERED_TO_CUSTOMER',
    DELIVERED_TO_CUSTOMER: 'COMPLETED',
    RETURN_REQUESTED:      'PICKED_UP_FROM_CUSTOMER',
  }

  if (loading) return (
    <div className="page-container">
      <div className="animate-pulse space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-24 bg-gray-200 rounded-2xl" />
        ))}
      </div>
    </div>
  )

  if (!isAdmin) return (
    <div className="page-container text-center py-20">
      <p className="text-4xl mb-4">🚫</p>
      <p className="text-gray-500">Admin access only</p>
    </div>
  )

  return (
    <div className="page-container animate-fade-in">

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="section-title">⚙️ Admin Dashboard</h1>
          <p className="text-gray-500 mt-1">
            Manage your platform
          </p>
        </div>
        <button
          onClick={fetchData}
          className="btn-secondary text-sm py-2">
          🔄 Refresh
        </button>
      </div>

      {/* Success */}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-600
                        rounded-xl px-4 py-3 mb-6 text-sm animate-fade-in">
          ✅ {success}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Users',    value: allUsers.length,
            icon: '👥', color: 'text-blue-500' },
          { label: 'Total Items',    value: allItems.length,
            icon: '📦', color: 'text-green-500' },
          { label: 'Total Orders',   value: allOrders.length,
            icon: '📋', color: 'text-purple-500' },
          { label: 'Pending Sellers',value: pendingSellers.length,
            icon: '⏳', color: 'text-orange-500' },
        ].map((stat, i) => (
          <div key={i}
               className="card p-4 animate-slide-up"
               style={{ animationDelay: `${i * 0.1}s` }}>
            <p className="text-2xl mb-1">{stat.icon}</p>
            <p className={`text-2xl font-bold ${stat.color}`}>
              {stat.value}
            </p>
            <p className="text-gray-500 text-sm">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {[
          { id: 'overview',      label: '📊 Overview' },
          { id: 'sellers',       label: `🏪 Sellers (${pendingSellers.length} pending)` },
          { id: 'orders',        label: `📋 Orders (${allOrders.length})` },
          { id: 'users',         label: `👥 Users (${allUsers.length})` },
          { id: 'items',         label: `📦 Items (${allItems.length})` },
          { id: 'categories',    label: '📁 Categories' },
          { id: 'reports',       label: `🚨 Reports (${supportTickets.length})` },
          { id: 'photographers', label: `📷 Photographers (${pendingPhotographers.length} pending)` },
          { id: 'delivery',      label: `🚚 Delivery Partners (${pendingDeliveryPartners.length} pending)` },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${activeTab === tab.id ? 'bg-primary-500 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── OVERVIEW TAB ── */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6
                        animate-fade-in">

          {/* Reports alert */}
          {supportTickets.length > 0 && (
            <div className="card p-6 border-l-4 border-red-400">
              <h3 className="font-bold text-gray-900 mb-2">
                🚨 {supportTickets.length} Open Report(s)
              </h3>
              <div className="space-y-2 mb-4">
                {supportTickets.slice(0, 3).map(ticket => (
                  <div key={ticket.id}
                       className="bg-red-50 rounded-xl p-3 text-sm">
                    <p className="font-medium text-red-800">
                      {ticket.subject}
                    </p>
                    <p className="text-red-600 text-xs mt-1">
                      {ticket.description}
                    </p>
                    <p className="text-red-400 text-xs mt-1">
                      Reported by: {ticket.raisedBy?.firstName}{' '}
                      {ticket.raisedBy?.lastName}
                    </p>
                  </div>
                ))}
              </div>
              <button
                onClick={() => setActiveTab('reports')}
                className="bg-red-500 text-white text-sm px-4 py-2
                           rounded-xl hover:bg-red-600 transition-colors">
                View All Reports →
              </button>
            </div>
          )}

          {/* Pending sellers alert */}
          {pendingSellers.length > 0 && (
            <div className="card p-6 border-l-4 border-orange-400">
              <h3 className="font-bold text-gray-900 mb-2">
                ⏳ {pendingSellers.length} Seller(s) Awaiting Approval
              </h3>
              <p className="text-gray-500 text-sm mb-4">
                Review and approve seller applications
              </p>
              <button
                onClick={() => setActiveTab('sellers')}
                className="btn-primary text-sm py-2">
                Review Now →
              </button>
            </div>
          )}

          {/* Pending photographers alert */}
          {pendingPhotographers.length > 0 && (
            <div className="card p-6 border-l-4 border-purple-400">
              <h3 className="font-bold text-gray-900 mb-2">
                📷 {pendingPhotographers.length} Photographer(s) Awaiting Verification
              </h3>
              <p className="text-gray-500 text-sm mb-4">
                Review and verify photographer applications
              </p>
              <button
                onClick={() => setActiveTab('photographers')}
                className="btn-primary text-sm py-2">
                Review Now →
              </button>
            </div>
          )}

          {/* Pending delivery partners alert */}
          {pendingDeliveryPartners.length > 0 && (
            <div className="card p-6 border-l-4 border-blue-400">
              <h3 className="font-bold text-gray-900 mb-2">
                🚚 {pendingDeliveryPartners.length} Delivery Partner(s) Awaiting Verification
              </h3>
              <p className="text-gray-500 text-sm mb-4">
                Review and verify delivery partner applications
              </p>
              <button
                onClick={() => setActiveTab('delivery')}
                className="btn-primary text-sm py-2">
                Review Now →
              </button>
            </div>
          )}

          {/* Recent orders */}
          <div className="card p-6">
            <h3 className="font-bold text-gray-900 mb-4">
              Recent Orders
            </h3>
            {allOrders.slice(0, 3).map(order => (
              <div key={order.id}
                   className="flex items-center justify-between
                              py-2 border-b border-gray-50 last:border-0">
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    Order #{order.id}
                  </p>
                  <p className="text-xs text-gray-400">
                    {order.customer?.firstName} {order.customer?.lastName}
                  </p>
                </div>
                <span className={`${statusConfig[order.status]?.color}
                                  text-xs`}>
                  {statusConfig[order.status]?.label}
                </span>
              </div>
            ))}
            <button
              onClick={() => setActiveTab('orders')}
              className="text-primary-500 text-sm mt-3
                         hover:text-primary-600 transition-colors">
              View all orders →
            </button>
          </div>

          {/* User breakdown */}
          <div className="card p-6">
            <h3 className="font-bold text-gray-900 mb-4">
              User Breakdown
            </h3>
            {[
              {
                id: 'all',
                label: 'Total Users (All Renters)',
                icon: '👥',
                color: 'text-gray-700',
                count: allUsers.length,
                desc: 'Everyone can rent items'
              },
              {
                id: 'non_admin',
                label: 'Customers (Non-Admin)',
                icon: '👤',
                color: 'text-blue-500',
                count: allUsers.filter(u => !u.isAdmin && u.role !== 'ROLE_ADMIN').length,
                desc: 'All users excluding admin'
              },
              {
                id: 'ROLE_SELLER',
                label: 'Sellers',
                icon: '🏪',
                color: 'text-green-500',
                count: allUsers.filter(u => u.role === 'ROLE_SELLER').length,
                desc: null
              },
              {
                id: 'ROLE_PHOTOGRAPHER',
                label: 'Photographers',
                icon: '📷',
                color: 'text-purple-500',
                count: allPhotographers?.length || 0,
                desc: 'By profile count'
              },
              {
                id: 'ROLE_DELIVERY_PARTNER',
                label: 'Delivery Partners',
                icon: '🚚',
                color: 'text-orange-500',
                count: allDeliveryPartners?.length || 0,
                desc: 'By profile count'
              },
              {
                id: 'ROLE_ADMIN',
                label: 'Admins',
                icon: '⚙️',
                color: 'text-red-500',
                count: allUsers.filter(u => u.isAdmin || u.role === 'ROLE_ADMIN').length,
                desc: null
              },
            ].map(r => (
              <div
                key={r.id}
                onClick={() => r.id.startsWith('ROLE_') && setActiveTab('users')}
                className={`flex items-center justify-between py-2
                            border-b border-gray-50 last:border-0
                            ${r.id.startsWith('ROLE_')
                              ? 'cursor-pointer hover:bg-gray-50 rounded-lg px-2'
                              : ''}`}>
                <div>
                  <span className="text-sm text-gray-600">
                    {r.icon} {r.label}
                  </span>
                  {r.desc && (
                    <p className="text-xs text-gray-400">{r.desc}</p>
                  )}
                </div>
                <span className={`font-bold ${r.color}`}>{r.count}</span>
              </div>
            ))}
            <p className="text-xs text-gray-400 mt-2">
              * Photographer/Delivery counts reflect profiles, since a user's
              role field only stores their most recent application
            </p>
          </div>

          {/* Platform revenue */}
          <div className="card p-6">
            <h3 className="font-bold text-gray-900 mb-4">
              Platform Revenue
            </h3>
            <p className="text-3xl font-bold text-primary-500 mb-1">
              ₹{allOrders.reduce((sum, o) =>
                sum + (o.platformCommission || 0), 0).toFixed(0)}
            </p>
            <p className="text-gray-400 text-sm">
              Total commission earned (10% per order)
            </p>
            <div className="mt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Total rent collected</span>
                <span className="font-medium">
                  ₹{allOrders.reduce((sum, o) =>
                    sum + (o.totalRentAmount || 0), 0).toFixed(0)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Completed orders</span>
                <span className="font-medium">
                  {allOrders.filter(
                    o => o.status === 'COMPLETED').length}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── SELLERS TAB ── */}
      {activeTab === 'sellers' && (
        <div className="animate-fade-in">
          <h2 className="font-bold text-gray-900 mb-4">
            Pending Seller Applications ({pendingSellers.length})
          </h2>

          {pendingSellers.length === 0 ? (
            <div className="card p-8 text-center">
              <p className="text-3xl mb-3">✅</p>
              <p className="text-gray-500">
                No pending applications
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingSellers.map((seller, i) => (
                <div key={seller.id}
                     className="card p-6 animate-slide-up"
                     style={{ animationDelay: `${i * 0.1}s` }}>
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-bold text-gray-900 text-lg">
                        {seller.businessName}
                      </h3>
                      <p className="text-gray-500 text-sm">
                        👤 {seller.user?.firstName} {seller.user?.lastName}
                      </p>
                      <p className="text-gray-500 text-sm">
                        📧 {seller.user?.email}
                      </p>
                      <p className="text-gray-500 text-sm">
                        📍 {seller.city}
                      </p>
                    </div>
                    <span className="badge-yellow">Pending</span>
                  </div>

                  {seller.profileDescription && (
                    <p className="text-gray-600 text-sm mb-4 bg-gray-50
                                  rounded-xl p-3">
                      {seller.profileDescription}
                    </p>
                  )}

                  <div className="grid grid-cols-2 gap-3 text-sm mb-4">
                    <div className="bg-gray-50 rounded-xl p-3">
                      <p className="text-gray-400 text-xs mb-1">Bank Account</p>
                      <p className="font-medium">
                        {seller.bankAccountNumber}
                      </p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-3">
                      <p className="text-gray-400 text-xs mb-1">IFSC</p>
                      <p className="font-medium">{seller.ifscCode}</p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => handleApproveSeller(seller.id)}
                      disabled={actionLoading === seller.id}
                      className="flex-1 bg-green-500 text-white py-2
                                 rounded-xl font-medium text-sm
                                 hover:bg-green-600 transition-colors
                                 disabled:opacity-50">
                      {actionLoading === seller.id
                        ? 'Processing...' : '✅ Approve'}
                    </button>
                    <button
                      onClick={() => handleRejectSeller(seller.id)}
                      disabled={actionLoading === seller.id}
                      className="flex-1 bg-red-50 text-red-500 py-2
                                 rounded-xl font-medium text-sm border
                                 border-red-200 hover:bg-red-100
                                 transition-colors disabled:opacity-50">
                      ❌ Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── ORDERS TAB ── */}
      {activeTab === 'orders' && (
        <div className="animate-fade-in">
          <h2 className="font-bold text-gray-900 mb-4">
            All Orders ({allOrders.length})
          </h2>

          {allOrders.length === 0 ? (
            <div className="card p-8 text-center">
              <p className="text-3xl mb-3">📋</p>
              <p className="text-gray-500">No orders yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {allOrders.map((order, i) => {
                const status = statusConfig[order.status] || {
                  color: 'badge-blue', label: order.status }
                const next = nextStatus[order.status]
                return (
                  <div key={order.id}
                       className="card p-4 animate-slide-up"
                       style={{ animationDelay: `${i * 0.05}s` }}>
                    <div className="flex items-center justify-between
                                    mb-3">
                      <div>
                        <p className="font-bold text-gray-900">
                          Order #{order.id}
                        </p>
                        <p className="text-gray-400 text-xs">
                          {order.customer?.firstName}{' '}
                          {order.customer?.lastName} •{' '}
                          {new Date(order.orderDate)
                            .toLocaleDateString('en-IN')}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`${status.color} text-xs`}>
                          {status.label}
                        </span>
                        <p className="font-bold text-primary-500 text-sm">
                          ₹{order.totalRentAmount + order.totalDeposit}
                        </p>
                      </div>
                    </div>

                    {/* Items */}
                    <div className="flex items-center gap-2 mb-3
                                    flex-wrap">
                      {order.items?.map(oi => (
                        <span key={oi.id}
                              className="text-xs bg-gray-100 text-gray-600
                                         px-2 py-1 rounded-lg">
                          {oi.item?.title}
                        </span>
                      ))}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 flex-wrap">
                      {next && (
                        <button
                          onClick={() => handleUpdateOrderStatus(
                            order.id, next)}
                          disabled={actionLoading === order.id}
                          className="bg-primary-50 text-primary-600
                                     text-xs px-3 py-1 rounded-lg
                                     hover:bg-primary-500
                                     hover:text-white transition-all
                                     disabled:opacity-50">
                          {actionLoading === order.id
                            ? 'Updating...'
                            : `Move to: ${next.replace(/_/g, ' ')}`}
                        </button>
                      )}
                      {order.status !== 'CANCELLED' &&
                       order.status !== 'COMPLETED' && (
                        <button
                          onClick={() => handleUpdateOrderStatus(
                            order.id, 'CANCELLED')}
                          disabled={actionLoading === order.id}
                          className="bg-red-50 text-red-500 text-xs
                                     px-3 py-1 rounded-lg
                                     hover:bg-red-100 transition-colors
                                     disabled:opacity-50">
                          Cancel Order
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* ── USERS TAB ── */}
      {activeTab === 'users' && (
        <div className="animate-fade-in">
          <h2 className="font-bold text-gray-900 mb-4">
            All Users ({allUsers.length})
          </h2>
          <div className="space-y-3">
            {allUsers.map((u, i) => {
              // Find profile for city info
              const sellerProfile = allSellerProfiles?.find(
                s => s.user?.id === u.id)
              const deliveryProfile = allDeliveryPartners?.find(
                d => d.user?.id === u.id)
              const photographerProfile = allPhotographers?.find(
                p => p.user?.id === u.id)

              const profileCity = sellerProfile?.city ||
                                  deliveryProfile?.city ||
                                  photographerProfile?.city

              return (
                <div key={u.id}
                     onClick={() => setSelectedUser(u)}
                     className="card p-4 flex items-center gap-4 animate-slide-up
                                cursor-pointer hover:border-primary-200 border
                                border-transparent transition-all"
                     style={{ animationDelay: `${i * 0.05}s` }}>
                  <div className="w-10 h-10 bg-primary-100 rounded-full
                                  flex items-center justify-center
                                  text-primary-600 font-bold flex-shrink-0">
                    {u.firstName?.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">
                      {u.firstName} {u.lastName}
                    </p>
                    <p className="text-gray-400 text-xs">{u.email}</p>
                    {profileCity && (
                      <p className="text-gray-400 text-xs">
                        📍 {profileCity}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      u.role === 'ROLE_ADMIN'
                        ? 'bg-red-100 text-red-600'
                        : u.role === 'ROLE_SELLER'
                        ? 'bg-green-100 text-green-600'
                        : u.role === 'ROLE_PHOTOGRAPHER'
                        ? 'bg-purple-100 text-purple-600'
                        : u.role === 'ROLE_DELIVERY_PARTNER'
                        ? 'bg-orange-100 text-orange-600'
                        : 'bg-blue-100 text-blue-600'}`}>
                      {u.role?.replace('ROLE_', '')}
                    </span>

                    {/* Edit city button */}
                    {(sellerProfile || deliveryProfile || photographerProfile) && (
                      <button
                        onClick={async (e) => {
                          e.stopPropagation()
                          const newCity = window.prompt(
                            `Update city for ${u.firstName}:\nCurrent: ${profileCity || 'Not set'}`)
                          if (!newCity) return
                          try {
                            if (sellerProfile) {
                              await api.put(`/seller-profiles/${sellerProfile.id}`, {
                                ...sellerProfile, city: newCity })
                            }
                            if (deliveryProfile) {
                              await api.put(`/delivery-partner-profiles/${deliveryProfile.id}`, {
                                ...deliveryProfile, city: newCity })
                            }
                            if (photographerProfile) {
                              await api.put(`/photographer-profiles/${photographerProfile.id}`, {
                                ...photographerProfile, city: newCity })
                            }
                            setSuccess(`City updated to ${newCity}`)
                            fetchData()
                            setTimeout(() => setSuccess(''), 3000)
                          } catch (err) {
                            console.error(err)
                          }
                        }}
                        className="text-xs px-2 py-1 rounded-lg
                                   bg-primary-50 text-primary-600
                                   hover:bg-primary-100 transition-colors">
                        ✏️ City
                      </button>
                    )}

                    {u.role !== 'ROLE_ADMIN' && !u.isAdmin && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDeleteUser(u.id)
                        }}
                        disabled={actionLoading === u.id}
                        className="text-red-400 text-xs hover:text-red-600
                                   transition-colors disabled:opacity-50">
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ── ITEMS TAB ── */}
      {activeTab === 'items' && (
        <div className="animate-fade-in">
          <h2 className="font-bold text-gray-900 mb-4">
            All Items ({allItems.length})
          </h2>
          <div className="space-y-3">
            {allItems.map((item, i) => (
              <div key={item.id}
                   className="card p-4 flex items-center gap-4
                              animate-slide-up"
                   style={{ animationDelay: `${i * 0.05}s` }}>
                <div className="w-14 h-14 bg-gray-100 rounded-xl
                                overflow-hidden flex-shrink-0">
                  {item.images?.[0] ? (
                    <img src={item.images[0]} alt={item.title}
                         className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center
                                    justify-center text-xl text-gray-200">
                      📦
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">
                    {item.title}
                  </p>
                  <p className="text-gray-400 text-xs">
                    {item.subCategory?.name} • ₹{item.rentPricePerDay}/day •
                    Seller: {item.seller?.firstName} {item.seller?.lastName}
                  </p>
                  <p className="text-gray-400 text-xs">
                    📧 {item.seller?.email}
                  </p>
                </div>
                <span className={item.isAvailable
                  ? 'badge-green text-xs'
                  : 'badge-red text-xs'}>
                  {item.isAvailable ? 'Available' : 'Rented'}
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => navigate(`/items/${item.id}`)}
                    className="text-primary-500 text-xs hover:text-primary-600
                               transition-colors px-2 py-1 rounded-lg
                               bg-primary-50">
                    View
                  </button>
                  <button
                    onClick={() => handleRemoveItemWithReason(item)}
                    disabled={actionLoading === item.id}
                    className="text-red-500 text-xs hover:text-red-600
                               transition-colors px-2 py-1 rounded-lg
                               bg-red-50 hover:bg-red-100 disabled:opacity-50">
                    {actionLoading === item.id ? '...' : '🗑 Remove'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── CATEGORIES TAB ── */}
      {activeTab === 'categories' && (
        <div className="animate-fade-in space-y-8">

          {/* ── CATEGORIES ── */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-gray-900">
                Categories ({allCategories.length})
              </h2>
              <button
                onClick={() => setShowCatForm(!showCatForm)}
                className="btn-primary text-sm py-2">
                + Add Category
              </button>
            </div>

            {/* Add category form */}
            {showCatForm && (
              <div className="card p-5 mb-4 animate-scale-in">
                <h3 className="font-semibold text-gray-900 mb-3">
                  New Category
                </h3>
                <form onSubmit={handleAddCategory} className="space-y-3">
                  <input
                    type="text"
                    placeholder="Category name (e.g. Electronics)"
                    value={catForm.name}
                    onChange={e => setCatForm({...catForm, name: e.target.value})}
                    className="input-field"
                    required
                  />
                  <input
                    type="text"
                    placeholder="Image URL (optional)"
                    value={catForm.imageUrl}
                    onChange={e => setCatForm({...catForm, imageUrl: e.target.value})}
                    className="input-field"
                  />
                  <div className="flex gap-3">
                    <button type="submit" disabled={savingCat}
                            className="btn-primary flex-1 text-sm">
                      {savingCat ? 'Saving...' : 'Add Category'}
                    </button>
                    <button type="button"
                            onClick={() => setShowCatForm(false)}
                            className="btn-secondary flex-1 text-sm">
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Categories grid */}
            {allCategories.length === 0 ? (
              <div className="card p-8 text-center">
                <p className="text-3xl mb-3">📁</p>
                <p className="text-gray-500">No categories yet</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {allCategories.map((cat, i) => (
                  <div key={cat.id}
                       className="card p-4 flex items-center justify-between
                                  animate-slide-up"
                       style={{ animationDelay: `${i * 0.05}s` }}>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary-100 rounded-xl
                                      flex items-center justify-center text-xl">
                        {getCategoryEmoji(cat.name)}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 text-sm">
                          {cat.name}
                        </p>
                        <p className="text-gray-400 text-xs">
                          {allSubCategories.filter(
                            s => s.category?.id === cat.id).length} subcategories
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteCategory(cat.id)}
                      className="text-red-400 hover:text-red-600
                                 transition-colors text-xs">
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ── SUBCATEGORIES ── */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-gray-900">
                SubCategories ({allSubCategories.length})
              </h2>
              <button
                onClick={() => setShowSubCatForm(!showSubCatForm)}
                className="btn-primary text-sm py-2">
                + Add SubCategory
              </button>
            </div>

            {/* Add subcategory form */}
            {showSubCatForm && (
              <div className="card p-5 mb-4 animate-scale-in">
                <h3 className="font-semibold text-gray-900 mb-3">
                  New SubCategory
                </h3>
                <form onSubmit={handleAddSubCategory} className="space-y-3">
                  <select
                    value={subCatForm.categoryId}
                    onChange={e => setSubCatForm(
                      {...subCatForm, categoryId: e.target.value})}
                    className="input-field"
                    required>
                    <option value="">Select parent category</option>
                    {allCategories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                  <input
                    type="text"
                    placeholder="SubCategory name (e.g. DSLR Camera)"
                    value={subCatForm.name}
                    onChange={e => setSubCatForm({...subCatForm, name: e.target.value})}
                    className="input-field"
                    required
                  />
                  <input
                    type="text"
                    placeholder="Image URL (optional)"
                    value={subCatForm.imageUrl}
                    onChange={e => setSubCatForm(
                      {...subCatForm, imageUrl: e.target.value})}
                    className="input-field"
                  />
                  <div className="flex gap-3">
                    <button type="submit" disabled={savingSubCat}
                            className="btn-primary flex-1 text-sm">
                      {savingSubCat ? 'Saving...' : 'Add SubCategory'}
                    </button>
                    <button type="button"
                            onClick={() => setShowSubCatForm(false)}
                            className="btn-secondary flex-1 text-sm">
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* SubCategories list — grouped by category */}
            <div className="space-y-4">
              {allCategories.map(cat => {
                const subs = allSubCategories.filter(
                  s => s.category?.id === cat.id)
                if (subs.length === 0) return null
                return (
                  <div key={cat.id} className="card p-4">
                    <p className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      {getCategoryEmoji(cat.name)} {cat.name}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {subs.map(sub => (
                        <div key={sub.id}
                             className="flex items-center gap-2 bg-gray-50
                                        rounded-xl px-3 py-2">
                          <span className="text-sm text-gray-700">
                            {sub.name}
                          </span>
                          <button
                            onClick={() => handleDeleteSubCategory(sub.id)}
                            className="text-red-400 hover:text-red-600
                                       transition-colors text-xs">
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

        </div>
      )}

      {/* ── REPORTS TAB ── */}
      {activeTab === 'reports' && (
        <div className="animate-fade-in">
          <h2 className="font-bold text-gray-900 mb-4">
            Item Reports ({supportTickets.length})
          </h2>

          {supportTickets.length === 0 ? (
            <div className="card p-8 text-center">
              <p className="text-3xl mb-3">✅</p>
              <p className="text-gray-500">No open reports</p>
            </div>
          ) : (
            <div className="space-y-4">
              {supportTickets.map((ticket, i) => (
                <div key={ticket.id}
                     className="card p-5 border-l-4 border-red-300
                                animate-slide-up"
                     style={{ animationDelay: `${i * 0.1}s` }}>

                  {/* Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-bold text-gray-900">
                        {ticket.subject}
                      </p>
                      <p className="text-gray-500 text-sm mt-1">
                        {ticket.description}
                      </p>
                    </div>
                    <span className="badge-red text-xs">
                      {ticket.status}
                    </span>
                  </div>

                  {/* Reporter info */}
                  <div className="bg-gray-50 rounded-xl p-3 mb-3 text-sm">
                    <p className="text-gray-500">
                      Reported by:{' '}
                      <span className="font-medium text-gray-900">
                        {ticket.raisedBy?.firstName}{' '}
                        {ticket.raisedBy?.lastName}
                      </span>
                      {' '}({ticket.raisedBy?.email})
                    </p>
                    <p className="text-gray-400 text-xs mt-1">
                      {new Date(ticket.createdAt)
                        .toLocaleDateString('en-IN')}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleResolveTicket(ticket)}
                      className="flex-1 bg-green-500 text-white text-sm py-2
                                 rounded-xl hover:bg-green-600 transition-colors">
                      ✅ Mark Resolved
                    </button>
                    <button
                      onClick={() => setActiveTab('items')}
                      className="flex-1 btn-secondary text-sm py-2">
                      View Items →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── PHOTOGRAPHERS TAB ── */}
      {activeTab === 'photographers' && (
        <div className="animate-fade-in">
          <h2 className="font-bold text-gray-900 mb-4">
            Photographer Applications ({pendingPhotographers.length} pending)
          </h2>

          {pendingPhotographers.length === 0 ? (
            <div className="card p-8 text-center">
              <p className="text-3xl mb-3">✅</p>
              <p className="text-gray-500">No pending applications</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingPhotographers.map((photo, i) => (
                <div key={photo.id}
                     className="card p-6 animate-slide-up"
                     style={{ animationDelay: `${i * 0.1}s` }}>

                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-bold text-gray-900">
                        {photo.user?.firstName} {photo.user?.lastName}
                      </h3>
                      <p className="text-gray-500 text-sm">
                        📍 {photo.city}
                      </p>
                      <p className="text-gray-500 text-sm">
                        📧 {photo.user?.email}
                      </p>
                    </div>
                    <span className="badge-yellow">Pending</span>
                  </div>

                  <p className="text-gray-600 text-sm mb-3 bg-gray-50
                                rounded-xl p-3">
                    {photo.bio}
                  </p>

                  <div className="grid grid-cols-3 gap-3 text-sm mb-4">
                    <div className="bg-gray-50 rounded-xl p-3">
                      <p className="text-gray-400 text-xs mb-1">
                        Specializations
                      </p>
                      <p className="font-medium">{photo.specializations}</p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-3">
                      <p className="text-gray-400 text-xs mb-1">
                        Price/hour
                      </p>
                      <p className="font-medium">₹{photo.pricePerHour}</p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-3">
                      <p className="text-gray-400 text-xs mb-1">
                        Price/day
                      </p>
                      <p className="font-medium">₹{photo.pricePerDay}</p>
                    </div>
                  </div>

                  {/* Portfolio preview */}
                  {photo.portfolioImages?.length > 0 && (
                    <div className="flex gap-2 mb-4 flex-wrap">
                      {photo.portfolioImages.slice(0, 4).map((img, idx) => (
                        <div key={idx}
                             className="w-16 h-16 rounded-xl overflow-hidden
                                        border border-gray-200">
                          <img src={img} alt=""
                               className="w-full h-full object-cover" />
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Instagram */}
                  {photo.instagramUrl && (
                    <a href={photo.instagramUrl}
                       target="_blank" rel="noreferrer"
                       className="text-primary-500 text-sm hover:underline
                                  block mb-4">
                      📸 View Instagram Portfolio
                    </a>
                  )}

                  <button
                    onClick={() => handleVerifyPhotographer(photo)}
                    disabled={actionLoading === photo.id}
                    className="w-full bg-green-500 text-white py-2
                               rounded-xl font-medium text-sm
                               hover:bg-green-600 transition-colors
                               disabled:opacity-50">
                    {actionLoading === photo.id
                      ? 'Verifying...' : '✅ Verify Photographer'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── DELIVERY PARTNERS TAB ── */}
      {activeTab === 'delivery' && (
        <div className="animate-fade-in">
          <h2 className="font-bold text-gray-900 mb-4">
            Delivery Partner Applications
            ({pendingDeliveryPartners.length} pending)
          </h2>

          {pendingDeliveryPartners.length === 0 ? (
            <div className="card p-8 text-center">
              <p className="text-3xl mb-3">✅</p>
              <p className="text-gray-500">No pending applications</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingDeliveryPartners.map((partner, i) => (
                <div key={partner.id}
                     className="card p-6 animate-slide-up"
                     style={{ animationDelay: `${i * 0.1}s` }}>

                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-bold text-gray-900">
                        {partner.user?.firstName} {partner.user?.lastName}
                      </h3>
                      <p className="text-gray-500 text-sm">
                        📧 {partner.user?.email}
                      </p>
                      <p className="text-gray-500 text-sm">
                        📍 {partner.city}
                      </p>
                    </div>
                    <span className="badge-yellow">Pending</span>
                  </div>

                  <div className="grid grid-cols-3 gap-3 text-sm mb-4">
                    <div className="bg-gray-50 rounded-xl p-3">
                      <p className="text-gray-400 text-xs mb-1">Vehicle</p>
                      <p className="font-medium">{partner.vehicleType}</p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-3">
                      <p className="text-gray-400 text-xs mb-1">
                        Vehicle No.
                      </p>
                      <p className="font-medium">{partner.vehicleNumber}</p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-3">
                      <p className="text-gray-400 text-xs mb-1">License</p>
                      <p className="font-medium">{partner.licenseNumber}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleVerifyDeliveryPartner(partner)}
                    disabled={actionLoading === partner.id}
                    className="w-full bg-green-500 text-white py-2
                               rounded-xl font-medium text-sm
                               hover:bg-green-600 transition-colors
                               disabled:opacity-50">
                    {actionLoading === partner.id
                      ? 'Verifying...' : '✅ Verify Partner'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── SELECTED USER PROFILE MODAL ── */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center
                        justify-center p-4"
             onClick={() => setSelectedUser(null)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-md
                          animate-scale-in"
               onClick={e => e.stopPropagation()}>

            {/* Header */}
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 bg-primary-500 rounded-full
                              flex items-center justify-center
                              text-white text-2xl font-bold overflow-hidden">
                {selectedUser.profileImage ? (
                  <img src={selectedUser.profileImage} alt=""
                       className="w-full h-full object-cover" />
                ) : selectedUser.firstName?.charAt(0).toUpperCase()}
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-lg">
                  {selectedUser.firstName} {selectedUser.lastName}
                </h3>
                <p className="text-gray-500 text-sm">{selectedUser.email}</p>
                <p className="text-gray-500 text-xs">{selectedUser.phoneNumber}</p>
              </div>
              <button onClick={() => setSelectedUser(null)}
                      className="ml-auto text-gray-400 hover:text-gray-600
                                 text-xl font-bold">
                ×
              </button>
            </div>

            {/* Roles */}
            <div className="mb-4">
              <p className="text-xs text-gray-400 mb-2 font-semibold uppercase">
                Roles & Profiles
              </p>
              <div className="flex flex-wrap gap-2">
                {/* Primary role */}
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  selectedUser.role === 'ROLE_ADMIN'
                    ? 'bg-red-100 text-red-600'
                    : selectedUser.role === 'ROLE_SELLER'
                    ? 'bg-green-100 text-green-600'
                    : selectedUser.role === 'ROLE_PHOTOGRAPHER'
                    ? 'bg-purple-100 text-purple-600'
                    : selectedUser.role === 'ROLE_DELIVERY_PARTNER'
                    ? 'bg-orange-100 text-orange-600'
                    : 'bg-blue-100 text-blue-600'}`}>
                  {selectedUser.role?.replace('ROLE_', '')}
                </span>

                {/* Admin badge */}
                {selectedUser.isAdmin && (
                  <span className="px-3 py-1 rounded-full text-xs
                                   font-medium bg-red-100 text-red-600">
                    ⚙️ ADMIN
                  </span>
                )}

                {/* Check other profiles */}
                {allSellerProfiles?.find(s => s.user?.id === selectedUser.id) && (
                  <span className="px-3 py-1 rounded-full text-xs
                                   font-medium bg-green-100 text-green-600">
                    🏪 Seller Profile
                  </span>
                )}
                {allPhotographers?.find(p => p.user?.id === selectedUser.id) && (
                  <span className="px-3 py-1 rounded-full text-xs
                                   font-medium bg-purple-100 text-purple-600">
                    📷 Photographer Profile
                  </span>
                )}
                {allDeliveryPartners?.find(d => d.user?.id === selectedUser.id) && (
                  <span className="px-3 py-1 rounded-full text-xs
                                   font-medium bg-orange-100 text-orange-600">
                    🚚 Delivery Profile
                  </span>
                )}
              </div>
            </div>

            {/* Profile details */}
            {(() => {
              const seller = allSellerProfiles?.find(
                s => s.user?.id === selectedUser.id)
              const delivery = allDeliveryPartners?.find(
                d => d.user?.id === selectedUser.id)
              const photographer = allPhotographers?.find(
                p => p.user?.id === selectedUser.id)

              return (
                <div className="space-y-3">
                  {seller && (
                    <div className="bg-green-50 rounded-xl p-3">
                      <p className="text-xs font-semibold text-green-700 mb-1">
                        🏪 Seller Details
                      </p>
                      <p className="text-sm text-gray-700">
                        {seller.businessName}
                      </p>
                      <p className="text-xs text-gray-500">
                        📍 {seller.city} • {seller.accountStatus}
                      </p>
                    </div>
                  )}
                  {photographer && (
                    <div className="bg-purple-50 rounded-xl p-3">
                      <p className="text-xs font-semibold text-purple-700 mb-1">
                        📷 Photographer Details
                      </p>
                      <p className="text-sm text-gray-700">
                        {photographer.specializations}
                      </p>
                      <p className="text-xs text-gray-500">
                        📍 {photographer.city} •
                        ₹{photographer.pricePerHour}/hr •
                        {photographer.isVerified ? ' ✅ Verified' : ' ⏳ Pending'}
                      </p>
                    </div>
                  )}
                  {delivery && (
                    <div className="bg-orange-50 rounded-xl p-3">
                      <p className="text-xs font-semibold text-orange-700 mb-1">
                        🚚 Delivery Details
                      </p>
                      <p className="text-sm text-gray-700">
                        {delivery.vehicleType} • {delivery.vehicleNumber}
                      </p>
                      <p className="text-xs text-gray-500">
                        📍 {delivery.city} •
                        {delivery.isVerified ? ' ✅ Verified' : ' ⏳ Pending'}
                      </p>
                    </div>
                  )}
                </div>
              )
            })()}

            {/* Actions */}
            <div className="flex gap-3 mt-6">
              {selectedUser.role !== 'ROLE_ADMIN' && !selectedUser.isAdmin && (
                <button
                  onClick={async () => {
                    if (!window.confirm('Delete this user?')) return
                    await handleDeleteUser(selectedUser.id)
                    setSelectedUser(null)
                  }}
                  className="flex-1 bg-red-50 text-red-500 py-2 rounded-xl
                             text-sm font-medium hover:bg-red-100 transition-colors">
                  🗑 Delete User
                </button>
              )}
              <button
                onClick={() => setSelectedUser(null)}
                className="flex-1 btn-secondary text-sm py-2">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}