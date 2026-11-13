import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/axiosConfig'
import { useAuth } from '../context/AuthContext'

export default function OrdersPage() {
  const navigate = useNavigate()
  const { isLoggedIn } = useAuth()

  const [orders, setOrders]   = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('all')

  useEffect(() => {
    if (!isLoggedIn) { navigate('/login'); return }
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      const userData = JSON.parse(localStorage.getItem('user'))
    const res = await api.get(`/orders/customer/${userData.id}`)
const sorted = (res.data || []).sort(
  (a, b) => new Date(b.orderDate) - new Date(a.orderDate))
setOrders(sorted)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  // Status color mapping
const statusConfig = {
  PENDING:                 { color: 'badge-yellow', label: 'Payment Pending' },
  CONFIRMED:               { color: 'badge-blue',   label: 'Order Confirmed' },
  PICKED_UP_FROM_SELLER:   { color: 'badge-blue',   label: 'Out for Delivery' },
  DELIVERED_TO_CUSTOMER:   { color: 'badge-green',  label: 'Delivered to You' },
  RETURN_REQUESTED:        { color: 'badge-yellow', label: 'Return Requested' },
  PICKED_UP_FROM_CUSTOMER: { color: 'badge-blue',   label: 'Return In Transit' },
  RETURNED_TO_SELLER:      { color: 'badge-green',  label: 'Rental Complete' },
  COMPLETED:               { color: 'badge-green',  label: 'Rental Complete' },
  CANCELLED:               { color: 'badge-red',    label: 'Cancelled' },
}

  // Filter orders by tab
  const filteredOrders = orders.filter(order => {
    if (activeTab === 'all')       return true
    if (activeTab === 'active')    return ['PENDING', 'CONFIRMED',
      'PICKED_UP_FROM_SELLER', 'DELIVERED_TO_CUSTOMER'].includes(order.status)
    if (activeTab === 'completed') return order.status === 'COMPLETED'
    if (activeTab === 'cancelled') return order.status === 'CANCELLED'
    return true
  })

  if (loading) return (
    <div className="page-container">
      <div className="animate-pulse space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-36 bg-gray-200 rounded-2xl" />
        ))}
      </div>
    </div>
  )

  return (
    <div className="page-container animate-fade-in">
      <h1 className="section-title mb-6">📋 My Orders</h1>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {[
          { id: 'all',       label: `All (${orders.length})` },
          { id: 'active',    label: 'Active' },
          { id: 'completed', label: 'Completed' },
          { id: 'cancelled', label: 'Cancelled' },
        ].map(tab => (
         <button
  key={tab.id}
  onClick={() => setActiveTab(tab.id)}
  className={`px-4 py-2 rounded-xl text-sm font-medium
              transition-all duration-200
              ${
                activeTab === tab.id
                  ? 'bg-primary-500 text-white'
                  : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
              }`}>
  {tab.label}
</button>
        ))}
      </div>

      {/* Empty state */}
      {filteredOrders.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-5xl mb-4">📋</p>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            No orders yet
          </h3>
          <p className="text-gray-400 mb-6">
            Start renting to see your orders here
          </p>
          <button
            onClick={() => navigate('/items')}
            className="btn-primary">
            Browse Items
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order, i) => {
            const status = statusConfig[order.status] || {
              color: 'badge-blue',
              label: order.status,
              icon: '📦'
            }
            return (
              <div
                key={order.id}
                className="card p-6 animate-slide-up cursor-pointer
                           hover:border-primary-200 border border-transparent
                           transition-all"
                style={{ animationDelay: `${i * 0.1}s` }}
                onClick={() => navigate(`/orders/${order.id}`)}>

                {/* Order header */}
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="font-bold text-gray-900">
                      Order #{order.id}
                    </p>
                    <p className="text-gray-400 text-xs mt-1">
                      {new Date(order.orderDate).toLocaleDateString('en-IN', {
                        day: 'numeric', month: 'short', year: 'numeric',
                        hour: '2-digit', minute: '2-digit'
                      })}
                    </p>
                  </div>
                  <span className={`${status.color} flex items-center gap-1`}>
                    {status.icon} {status.label}
                  </span>
                </div>

                {/* Order items */}
                <div className="space-y-3 mb-4">
                  {order.items?.map(orderItem => (
                    <div key={orderItem.id}
                         className="flex items-center gap-3">
                      <div className="w-14 h-14 bg-gray-100 rounded-xl
                                      overflow-hidden flex-shrink-0">
                        {orderItem.item?.images?.[0] ? (
                          <img
                            src={orderItem.item.images[0]}
                            alt={orderItem.item.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center
                                          justify-center text-xl text-gray-200">
                            📦
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 text-sm">
                          {orderItem.item?.title}
                        </p>
                        <p className="text-gray-400 text-xs">
                          {orderItem.rentalStartDate} →{' '}
                          {orderItem.rentalEndDate}
                          {' '}({orderItem.rentalDays} days)
                        </p>
                      </div>
                      <p className="font-semibold text-gray-900 text-sm">
                        ₹{orderItem.rentAmount}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Order footer */}
                <div className="flex items-center justify-between
                                pt-4 border-t border-gray-100">
                  <div className="text-sm text-gray-500">
                    📍 {order.deliveryAddress?.city},{' '}
                    {order.deliveryAddress?.state}
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-400">Total Paid</p>
                    <p className="font-bold text-primary-500">
                      ₹{order.totalRentAmount + order.totalDeposit}
                    </p>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="mt-4">
                  <OrderProgress status={order.status} />
                </div>

              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ── ORDER PROGRESS BAR ──
function OrderProgress({ status }) {
  const steps = [
    { key: 'PENDING',                 label: 'Ordered' },
    { key: 'CONFIRMED',               label: 'Confirmed' },
    { key: 'DELIVERED_TO_CUSTOMER',   label: 'Delivered' },
    { key: 'COMPLETED',               label: 'Completed' },
  ]

  const statusOrder = [
    'PENDING', 'CONFIRMED', 'PICKED_UP_FROM_SELLER',
    'DELIVERED_TO_CUSTOMER', 'RETURN_REQUESTED',
    'PICKED_UP_FROM_CUSTOMER', 'RETURNED_TO_SELLER', 'COMPLETED'
  ]

  const currentIndex = statusOrder.indexOf(status)

  if (status === 'CANCELLED') return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1 bg-red-200 rounded" />
      <span className="text-red-500 text-xs">Cancelled</span>
    </div>
  )

  return (
    <div className="flex items-center gap-1">
      {steps.map((step, i) => {
        const stepIndex = statusOrder.indexOf(step.key)
        const isCompleted = currentIndex >= stepIndex
        const isCurrent = step.key === status ||
          (status === 'PICKED_UP_FROM_SELLER' && i === 1)

        return (
          <div key={step.key} className="flex items-center flex-1">
            <div className="flex flex-col items-center flex-1">
              <div className={`w-3 h-3 rounded-full border-2
                              transition-all duration-300
                              ${isCompleted
                                ? 'bg-primary-500 border-primary-500'
                                : 'bg-white border-gray-300'}`} />
              <span className={`text-xs mt-1 text-center
                               ${isCompleted
                                 ? 'text-primary-500 font-medium'
                                 : 'text-gray-400'}`}>
                {step.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className={`flex-1 h-0.5 mb-4 transition-all duration-300
                              ${currentIndex > stepIndex
                                ? 'bg-primary-500'
                                : 'bg-gray-200'}`} />
            )}
          </div>
        )
      })}
    </div>
  )
}