import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/axiosConfig'
import { useAuth } from '../context/AuthContext'

export default function DeliveryDashboard() {
  const navigate = useNavigate()
  const { isLoggedIn, user } = useAuth()

  const [profile, setProfile]         = useState(null)
  const [deliveries, setDeliveries]   = useState([])
  const [pickups, setPickups]         = useState([])
  const [loading, setLoading]         = useState(true)
  const [activeTab, setActiveTab]     = useState('active')
  const [actionLoading, setActionLoading] = useState(null)
  const [success, setSuccess]         = useState('')
  const [earnings, setEarnings]       = useState({ total: 0, thisMonth: 0 })
  const [availableJobs, setAvailableJobs] = useState([])
  const [acceptingJob, setAcceptingJob]   = useState(null)

  const [editingProfile, setEditingProfile]           = useState(false)
  const [savingProfile, setSavingProfile]             = useState(false)
  const [profileSuccess, setProfileSuccess]           = useState('')
  const [deliveryProfileForm, setDeliveryProfileForm] = useState({
    city: '', vehicleType: 'BIKE', vehicleNumber: ''
  })

  const statusFlow = {
    ASSIGNED:              'PICKED_UP_FROM_SELLER',
    PICKED_UP_FROM_SELLER: 'DELIVERED_TO_CUSTOMER',
  }

  const pickupStatusFlow = {
    ASSIGNED:                'PICKED_UP_FROM_CUSTOMER',
    PICKED_UP_FROM_CUSTOMER: 'RETURNED_TO_SELLER',
  }

  const statusLabel = {
    ASSIGNED:                '📋 Assigned',
    PICKED_UP_FROM_SELLER:   '📦 Picked Up from Seller',
    DELIVERED_TO_CUSTOMER:   '✅ Delivered to Customer',
    PICKED_UP_FROM_CUSTOMER: '↩️ Picked Up for Return',
    RETURNED_TO_SELLER:      '✅ Returned to Seller',
  }

  const getDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371
    const dLat = (lat2 - lat1) * Math.PI / 180
    const dLon = (lon2 - lon1) * Math.PI / 180
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon/2) * Math.sin(dLon/2)
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
  }

  const calculateEarnings = (deliveries, pickups) => {
    const BASE_RATE = 50, PER_KM_RATE = 10, AVG_DISTANCE = 5
    const calcEarning = (d) => {
      if (d.pickupAddress?.latitude && d.dropAddress?.latitude) {
        const dist = getDistance(
          d.pickupAddress.latitude, d.pickupAddress.longitude,
          d.dropAddress.latitude,  d.dropAddress.longitude)
        return BASE_RATE + (dist * PER_KM_RATE)
      }
      return BASE_RATE + (AVG_DISTANCE * PER_KM_RATE)
    }
    const completed = [
      ...deliveries.filter(d => d.status === 'DELIVERED_TO_CUSTOMER'),
      ...pickups.filter(p => p.status === 'RETURNED_TO_SELLER')
    ]
    const total = completed.reduce((sum, d) => sum + calcEarning(d), 0)
    const thisMonth = completed.filter(d => {
      const date = new Date(d.deliveredAt || d.returnedAt || Date.now())
      const now = new Date()
      return date.getMonth() === now.getMonth() &&
             date.getFullYear() === now.getFullYear()
    }).reduce((sum, d) => sum + calcEarning(d), 0)
    setEarnings({ total: Math.round(total), thisMonth: Math.round(thisMonth) })
  }

  useEffect(() => {
    if (!isLoggedIn) { navigate('/login'); return }
    fetchData()
  }, [])

  useEffect(() => {
    if (profile) {
      setDeliveryProfileForm({
        city:          profile.city || '',
        vehicleType:   profile.vehicleType || 'BIKE',
        vehicleNumber: profile.vehicleNumber || ''
      })
    }
  }, [profile])

  const fetchData = async () => {
    try {
      const profileRes = await api.get(
        `/delivery-partner-profiles/user/${user.id}`)
      setProfile(profileRes.data)

      const [deliveriesRes, pickupsRes, jobsRes] = await Promise.all([
        api.get(`/deliveries/partner/${profileRes.data.id}`),
        api.get(`/deliveries/pickup/partner/${profileRes.data.id}`),
        api.get(`/deliveries/available-jobs?city=${profileRes.data.city}`)
      ])

      setDeliveries(deliveriesRes.data || [])
      setPickups(pickupsRes.data || [])
      setAvailableJobs(jobsRes.data || [])
      calculateEarnings(deliveriesRes.data || [], pickupsRes.data || [])

    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleAcceptJob = async (orderId) => {
    setAcceptingJob(orderId)
    try {
      await api.post(
        `/deliveries/accept-job/${orderId}?deliveryPartnerId=${profile.id}`)
      setSuccess('Job accepted! Check Active tab.')
      fetchData()
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      alert(err.response?.data || 'This job was already taken')
      fetchData()
    } finally {
      setAcceptingJob(null)
    }
  }

  const handleUpdateStatus = async (deliveryId, nextStatus, isPickup = false) => {
    setActionLoading(deliveryId)
    try {
      const endpoint = isPickup
        ? `/deliveries/pickup/${deliveryId}/status?status=${nextStatus}`
        : `/deliveries/${deliveryId}/status?status=${nextStatus}`
      await api.patch(endpoint)
      setSuccess(`Status updated to ${nextStatus.replace(/_/g, ' ')}`)
      fetchData()
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      console.error(err)
      setSuccess('Failed to update status')
      setTimeout(() => setSuccess(''), 3000)
    } finally {
      setActionLoading(null)
    }
  }

  const handleToggleAvailability = async () => {
    try {
      await api.patch(
        `/delivery-partner-profiles/${profile.id}/availability?isAvailable=${!profile.isAvailable}`)
      fetchData()
    } catch (err) { console.error(err) }
  }

  const handleUpdateDeliveryProfile = async (e) => {
    e.preventDefault()
    setSavingProfile(true)
    try {
      const res = await api.put(`/delivery-partner-profiles/${profile.id}`, {
        ...profile,
        city:          deliveryProfileForm.city,
        vehicleType:   deliveryProfileForm.vehicleType,
        vehicleNumber: deliveryProfileForm.vehicleNumber,
      })
      setProfile(res.data)
      setEditingProfile(false)
      setProfileSuccess('Profile updated!')
      setTimeout(() => setProfileSuccess(''), 3000)
    } catch (err) {
      console.error(err)
    } finally {
      setSavingProfile(false)
    }
  }

  if (loading) return (
    <div className="page-container animate-pulse space-y-4">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="h-32 bg-gray-200 rounded-2xl" />
      ))}
    </div>
  )

  if (!profile) return (
    <div className="page-container text-center py-20">
      <p className="text-4xl mb-4">🚚</p>
      <p className="text-gray-500 mb-4">You don't have a delivery partner profile</p>
      <button onClick={() => navigate('/delivery/apply')} className="btn-primary">
        Apply as Delivery Partner
      </button>
    </div>
  )

  if (!profile.isVerified) return (
    <div className="page-container text-center py-20">
      <p className="text-4xl mb-4">⏳</p>
      <h2 className="text-xl font-bold text-gray-900 mb-3">Application Under Review</h2>
      <p className="text-gray-500 mb-4">Your application is being verified by our team.</p>
      <span className="badge-yellow">Pending Verification</span>
    </div>
  )

  const activeDeliveries   = deliveries.filter(d => d.status !== 'DELIVERED_TO_CUSTOMER')
  const completedDeliveries = deliveries.filter(d => d.status === 'DELIVERED_TO_CUSTOMER')
  const activePickups      = pickups.filter(d => d.status !== 'RETURNED_TO_SELLER')
  const completedPickups   = pickups.filter(d => d.status === 'RETURNED_TO_SELLER')

  return (
    <div className="page-container animate-fade-in">

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="section-title">🚚 Delivery Dashboard</h1>
          <p className="text-gray-500 mt-1">{profile.city} • {profile.vehicleType}</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleToggleAvailability}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              profile.isAvailable
                ? 'bg-green-100 text-green-700 hover:bg-green-200'
                : 'bg-red-100 text-red-700 hover:bg-red-200'}`}>
            {profile.isAvailable ? '🟢 Available' : '🔴 Unavailable'}
          </button>
        </div>
      </div>

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-600
                        rounded-xl px-4 py-3 mb-6 text-sm animate-fade-in">
          ✅ {success}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Active',     value: activeDeliveries.length,                           icon: '🚚', color: 'text-blue-500' },
          { label: 'Completed',  value: completedDeliveries.length + completedPickups.length, icon: '✅', color: 'text-green-500' },
          { label: 'This Month', value: `₹${earnings.thisMonth}`,                          icon: '💰', color: 'text-primary-500' },
          { label: 'Total Earned', value: `₹${earnings.total}`,                            icon: '🏆', color: 'text-yellow-500' },
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
          { id: 'available', label: `📢 Available (${availableJobs.length})` },
          { id: 'active',    label: `🚚 Active (${activeDeliveries.length})` },
          { id: 'pickups',   label: `↩️ Returns (${activePickups.length})` },
          { id: 'completed', label: `✅ Completed (${completedDeliveries.length + completedPickups.length})` },
          { id: 'profile',   label: '👤 Profile' },
        ].map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                    activeTab === tab.id
                      ? 'bg-primary-500 text-white'
                      : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Available Jobs */}
      {activeTab === 'available' && (
        <div className="animate-fade-in">
          {availableJobs.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-4xl mb-4">📢</p>
              <p className="text-gray-400">No jobs available in {profile.city} right now</p>
              <p className="text-gray-400 text-xs mt-2">Make sure you are set to Available</p>
            </div>
          ) : (
            <div className="space-y-4">
              {availableJobs.map((order, i) => (
                <div key={order.id}
                     className="card p-5 animate-slide-up border-l-4 border-yellow-400"
                     style={{ animationDelay: `${i * 0.1}s` }}>
                  <div className="flex items-center justify-between mb-3">
                    <p className="font-bold text-gray-900">Order #{order.id}</p>
                    <span className="badge-yellow text-xs">⏳ Available</span>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-3 mb-3">
                    <p className="text-xs text-gray-400 mb-1">Items to deliver</p>
                    {order.items?.map(oi => (
                      <p key={oi.id} className="text-sm text-gray-700">
                        📦 {oi.item?.title}
                      </p>
                    ))}
                  </div>
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="bg-gray-50 rounded-xl p-3">
                      <p className="text-xs text-gray-400 mb-1">Deliver to</p>
                      <p className="text-sm text-gray-700">
                        📍 {order.deliveryAddress?.city}, {order.deliveryAddress?.state}
                      </p>
                    </div>
                    <div className="bg-green-50 rounded-xl p-3">
                      <p className="text-xs text-gray-400 mb-1">Estimated earn</p>
                      <p className="text-sm font-bold text-green-600">₹100 approx</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleAcceptJob(order.id)}
                    disabled={acceptingJob === order.id}
                    className="w-full bg-primary-500 text-white py-3 rounded-xl
                               font-semibold text-sm hover:bg-primary-600
                               transition-colors disabled:opacity-50">
                    {acceptingJob === order.id ? 'Accepting...' : '✅ Accept This Job'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Active Deliveries */}
      {activeTab === 'active' && (
        <div className="animate-fade-in">
          {activeDeliveries.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-4xl mb-4">🚚</p>
              <p className="text-gray-400">No active deliveries</p>
            </div>
          ) : (
            <div className="space-y-4">
              {activeDeliveries.map((delivery, i) => (
                <DeliveryCard
                  key={delivery.id} delivery={delivery} index={i}
                  isPickup={false} statusLabel={statusLabel}
                  statusFlow={statusFlow} actionLoading={actionLoading}
                  onUpdateStatus={handleUpdateStatus}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Return Pickups */}
      {activeTab === 'pickups' && (
        <div className="animate-fade-in">
          {activePickups.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-4xl mb-4">↩️</p>
              <p className="text-gray-400">No return pickups assigned</p>
            </div>
          ) : (
            <div className="space-y-4">
              {activePickups.map((pickup, i) => (
                <DeliveryCard
                  key={pickup.id} delivery={pickup} index={i}
                  isPickup={true} statusLabel={statusLabel}
                  statusFlow={pickupStatusFlow} actionLoading={actionLoading}
                  onUpdateStatus={handleUpdateStatus}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Completed */}
      {activeTab === 'completed' && (
        <div className="animate-fade-in space-y-4">
          <div className="bg-green-50 rounded-2xl p-4 flex items-center
                          justify-between">
            <div>
              <p className="font-bold text-green-800">Total Completed</p>
              <p className="text-green-600 text-sm">
                {completedDeliveries.length} deliveries +{' '}
                {completedPickups.length} returns
              </p>
            </div>
            <p className="text-3xl font-bold text-green-600">
              ₹{earnings.total}
            </p>
          </div>

          {completedDeliveries.length === 0 && completedPickups.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-4xl mb-3">📦</p>
              <p className="text-gray-400">No completed deliveries yet</p>
            </div>
          ) : (
            <>
              {/* Completed deliveries */}
              {completedDeliveries.length > 0 && (
                <div>
                  <h3 className="font-bold text-gray-900 mb-3">
                    🚚 Deliveries ({completedDeliveries.length})
                  </h3>
                  <div className="space-y-4">
                    {completedDeliveries.map((delivery, i) => (
                      <CompletedCard
                        key={delivery.id} delivery={delivery}
                        index={i} isPickup={false}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Completed returns */}
              {completedPickups.length > 0 && (
                <div>
                  <h3 className="font-bold text-gray-900 mb-3 mt-6">
                    ↩️ Return Pickups ({completedPickups.length})
                  </h3>
                  <div className="space-y-4">
                    {completedPickups.map((pickup, i) => (
                      <CompletedCard
                        key={pickup.id} delivery={pickup}
                        index={i} isPickup={true}
                      />
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Profile */}
      {activeTab === 'profile' && (
        <div className="space-y-4 animate-fade-in">
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900">My Profile</h3>
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
              <form onSubmit={handleUpdateDeliveryProfile} className="space-y-3">
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">City</label>
                  <input type="text" value={deliveryProfileForm.city} placeholder="Mumbai"
                         onChange={e => setDeliveryProfileForm({...deliveryProfileForm, city: e.target.value})}
                         className="input-field" required />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Vehicle Type</label>
                  <select value={deliveryProfileForm.vehicleType}
                          onChange={e => setDeliveryProfileForm({...deliveryProfileForm, vehicleType: e.target.value})}
                          className="input-field">
                    <option value="BIKE">🏍️ Bike</option>
                    <option value="SCOOTER">🛵 Scooter</option>
                    <option value="VAN">🚐 Van</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Vehicle Number</label>
                  <input type="text" value={deliveryProfileForm.vehicleNumber}
                         onChange={e => setDeliveryProfileForm({...deliveryProfileForm,
                           vehicleNumber: e.target.value.toUpperCase()})}
                         className="input-field" required />
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
                  { label: 'City',           value: profile.city },
                  { label: 'Vehicle Type',   value: profile.vehicleType },
                  { label: 'Vehicle Number', value: profile.vehicleNumber },
                  { label: 'License',        value: profile.licenseNumber },
                  { label: 'Verified',       value: profile.isVerified ? '✅ Yes' : '❌ No' },
                  { label: 'Available',      value: profile.isAvailable ? '🟢 Yes' : '🔴 No' },
                ].map((field, i) => (
                  <div key={i} className="bg-gray-50 rounded-xl p-3">
                    <p className="text-xs text-gray-400 mb-1">{field.label}</p>
                    <p className="font-medium text-gray-900">{field.value}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Earnings */}
          <div className="card p-5">
            <h3 className="font-bold text-gray-900 mb-3">💰 Earnings Breakdown</h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Rate per delivery</span>
                <span className="font-medium">₹50 base + ₹10/km</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Total deliveries</span>
                <span className="font-medium">
                  {completedDeliveries.length + completedPickups.length}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">This month</span>
                <span className="font-bold text-primary-500">₹{earnings.thisMonth}</span>
              </div>
              <div className="flex justify-between text-sm border-t border-gray-100 pt-3">
                <span className="text-gray-500">Total earned</span>
                <span className="font-bold text-green-500 text-lg">₹{earnings.total}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Active delivery card
function DeliveryCard({ delivery, index, isPickup, statusLabel,
                        statusFlow, actionLoading, onUpdateStatus }) {
  const nextStatus = statusFlow[delivery.status]
  return (
    <div className="card p-5 animate-slide-up border-l-4 border-primary-400"
         style={{ animationDelay: `${index * 0.1}s` }}>
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="font-bold text-gray-900">
            {isPickup ? '↩️ Return' : '🚚 Delivery'} #{delivery.id}
          </p>
          <p className="text-gray-400 text-xs">Order #{delivery.order?.id}</p>
        </div>
        <span className="badge-blue text-xs">
          {statusLabel[delivery.status] || delivery.status}
        </span>
      </div>

      {/* Items */}
      <div className="bg-gray-50 rounded-xl p-3 mb-3">
        <p className="text-xs text-gray-400 mb-1">Items</p>
        {delivery.order?.items?.map(oi => (
          <p key={oi.id} className="text-sm text-gray-700">
            📦 {oi.item?.title || 'Item'}
          </p>
        ))}
      </div>

      {/* Addresses */}
      <div className="grid grid-cols-2 gap-3 mb-3">
        <div className="bg-gray-50 rounded-xl p-3">
          <p className="text-xs text-gray-400 mb-1">
            {isPickup ? 'Pickup From Customer' : 'Pickup From Seller'}
          </p>
          <p className="font-medium text-gray-900 text-sm">
            {delivery.pickupAddress?.street}
          </p>
          <p className="text-gray-500 text-xs">
            {delivery.pickupAddress?.city}, {delivery.pickupAddress?.pincode}
          </p>
        </div>
        <div className="bg-primary-50 rounded-xl p-3">
          <p className="text-xs text-gray-400 mb-1">
            {isPickup ? 'Return To Seller' : 'Deliver To Customer'}
          </p>
          <p className="font-medium text-gray-900 text-sm">
            {delivery.dropAddress?.street}
          </p>
          <p className="text-gray-500 text-xs">
            {delivery.dropAddress?.city}, {delivery.dropAddress?.pincode}
          </p>
        </div>
      </div>

      {/* Seller contact for pickup */}
      {!isPickup && delivery.order?.items?.[0]?.item?.seller && (
        <div className="bg-yellow-50 border border-yellow-100 rounded-xl p-3 mb-3">
          <p className="text-xs font-semibold text-yellow-700 mb-1">
            📞 Seller Contact (for pickup)
          </p>
          <p className="text-sm text-gray-700">
            👤 {delivery.order.items[0].item.seller.firstName}{' '}
               {delivery.order.items[0].item.seller.lastName}
          </p>
          <p className="text-sm text-gray-600">
            📱 {delivery.order.items[0].item.seller.phoneNumber}
          </p>
        </div>
      )}

      {/* Customer contact for return pickup */}
      {isPickup && delivery.order?.customer && (
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 mb-3">
          <p className="text-xs font-semibold text-blue-700 mb-1">
            📞 Customer Contact (for return pickup)
          </p>
          <p className="text-sm text-gray-700">
            👤 {delivery.order.customer.firstName}{' '}
               {delivery.order.customer.lastName}
          </p>
          <p className="text-sm text-gray-600">
            📱 {delivery.order.customer.phoneNumber}
          </p>
        </div>
      )}

      {nextStatus && (
        <button
          onClick={() => onUpdateStatus(delivery.id, nextStatus, isPickup)}
          disabled={actionLoading === delivery.id}
          className="w-full bg-primary-500 text-white py-3 rounded-xl
                     font-semibold text-sm hover:bg-primary-600
                     transition-colors disabled:opacity-50 flex items-center
                     justify-center gap-2">
          {actionLoading === delivery.id ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent
                              rounded-full animate-spin" />
              Updating...
            </>
          ) : `Mark as: ${nextStatus.replace(/_/g, ' ')}`}
        </button>
      )}
    </div>
  )
}

// Completed delivery card with full details
function CompletedCard({ delivery, index, isPickup }) {
  return (
    <div className="card p-5 animate-slide-up"
         style={{ animationDelay: `${index * 0.05}s` }}>

      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="font-bold text-gray-900">
            {isPickup ? '↩️ Return' : '🚚 Delivery'} #{delivery.id}
          </p>
          <p className="text-gray-400 text-xs">Order #{delivery.order?.id}</p>
        </div>
        <span className="badge-green text-xs">
          {isPickup ? '✅ Returned' : '✅ Delivered'}
        </span>
      </div>

      {/* Items */}
      <div className="bg-gray-50 rounded-xl p-3 mb-3">
        <p className="text-xs text-gray-400 mb-1">Items</p>
        {delivery.order?.items?.map(oi => (
          <p key={oi.id} className="text-sm text-gray-700">
            📦 {oi.item?.title || 'Item'}
          </p>
        ))}
      </div>

      {/* Addresses */}
      <div className="grid grid-cols-2 gap-3 mb-3">
        <div className="bg-gray-50 rounded-xl p-3">
          <p className="text-xs text-gray-400 mb-1">Picked up from</p>
          <p className="text-sm text-gray-700 font-medium">
            {delivery.pickupAddress?.street || 'N/A'}
          </p>
          <p className="text-xs text-gray-500">
            {delivery.pickupAddress?.city},{' '}
            {delivery.pickupAddress?.pincode}
          </p>
        </div>
        <div className="bg-green-50 rounded-xl p-3">
          <p className="text-xs text-gray-400 mb-1">
            {isPickup ? 'Returned to' : 'Delivered to'}
          </p>
          <p className="text-sm text-gray-700 font-medium">
            {delivery.dropAddress?.street || 'N/A'}
          </p>
          <p className="text-xs text-gray-500">
            {delivery.dropAddress?.city},{' '}
            {delivery.dropAddress?.pincode}
          </p>
        </div>
      </div>

      {/* Customer/Seller info */}
      <div className="bg-blue-50 rounded-xl p-3 mb-3">
        <p className="text-xs text-gray-400 mb-1">
          {isPickup ? 'Returned for customer' : 'Delivered to customer'}
        </p>
        <p className="text-sm text-gray-700">
          👤 {delivery.order?.customer?.firstName}{' '}
             {delivery.order?.customer?.lastName}
        </p>
        <p className="text-xs text-gray-500">
          📱 {delivery.order?.customer?.phoneNumber}
        </p>
      </div>

      {/* Timing + earnings */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-gray-50 rounded-xl p-3">
          <p className="text-xs text-gray-400 mb-1">
            {isPickup ? 'Returned at' : 'Delivered at'}
          </p>
          <p className="text-sm font-medium text-gray-700">
            {delivery.deliveredAt || delivery.returnedAt
              ? new Date(delivery.deliveredAt || delivery.returnedAt)
                  .toLocaleDateString('en-IN', {
                    day: 'numeric', month: 'short',
                    hour: '2-digit', minute: '2-digit'
                  })
              : 'N/A'}
          </p>
        </div>
        <div className="bg-green-50 rounded-xl p-3">
          <p className="text-xs text-gray-400 mb-1">Earned</p>
          <p className="text-sm font-bold text-green-600">
            ₹100 approx
          </p>
          <p className="text-xs text-gray-400">
            ₹50 base + distance
          </p>
        </div>
      </div>

      {/* Damage report for returns */}
      {isPickup && delivery.damageFound && (
        <div className="mt-3 bg-red-50 rounded-xl p-3">
          <p className="text-xs font-semibold text-red-700 mb-1">
            ⚠️ Damage Reported
          </p>
          <p className="text-xs text-red-600">
            {delivery.damageNotes || 'Damage found during pickup'}
          </p>
        </div>
      )}
    </div>
  )
}