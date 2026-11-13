import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../api/axiosConfig'
import { useAuth } from '../context/AuthContext'

export default function OrderDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()

  const [order, setOrder]     = useState(null)
  const [payment, setPayment] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchOrder()
  }, [id])

  const fetchOrder = async () => {
    try {
      const [orderRes, paymentRes] = await Promise.all([
        api.get(`/orders/${id}`),
        api.get(`/payments/order/${id}`).catch(() => ({ data: null }))
      ])
      setOrder(orderRes.data)
      setPayment(paymentRes.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

 const statusConfig = {
  PENDING: {
    color: 'badge-yellow',
    label: 'Payment Pending',
    icon: '⏳',
    step: 0
  },
  CONFIRMED: {
    color: 'badge-blue',
    label: 'Order Confirmed',
    icon: '✅',
    step: 1
  },
  PICKED_UP_FROM_SELLER: {
    color: 'badge-blue',
    label: 'Out for Delivery',
    icon: '🚚',
    step: 2
  },
  DELIVERED_TO_CUSTOMER: {
    color: 'badge-green',
    label: 'Delivered to You',
    icon: '📦',
    step: 3
  },
  RETURN_REQUESTED: {
    color: 'badge-yellow',
    label: 'Return Requested',
    icon: '↩️',
    step: 3
  },
  PICKED_UP_FROM_CUSTOMER: {
    color: 'badge-blue',
    label: 'Return In Transit',
    icon: '🚚',
    step: 4
  },
  RETURNED_TO_SELLER: {
    color: 'badge-green',
    label: 'Rental Complete',
    icon: '🎉',
    step: 5
  },
  COMPLETED: {
    color: 'badge-green',
    label: 'Rental Complete',
    icon: '🎉',
    step: 6
  },
  CANCELLED: {
    color: 'badge-red',
    label: 'Cancelled',
    icon: '❌',
    step: -1
  },
}

const steps = [
  { label: 'Order Placed',  icon: '📋' },
  { label: 'Confirmed',     icon: '✅' },
  { label: 'Out for Delivery', icon: '🚚' },
  { label: 'With You',      icon: '📦' },
  { label: 'Returned',      icon: '↩️' },
  { label: 'Complete',      icon: '🎉' },
]

  if (loading) return (
    <div className="page-container animate-pulse">
      <div className="h-8 bg-gray-200 rounded w-48 mb-8" />
      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-4">
          <div className="h-48 bg-gray-200 rounded-2xl" />
          <div className="h-48 bg-gray-200 rounded-2xl" />
        </div>
        <div className="h-64 bg-gray-200 rounded-2xl" />
      </div>
    </div>
  )

  if (!order) return (
    <div className="page-container text-center py-20">
      <p className="text-4xl mb-4">😕</p>
      <p className="text-gray-500 mb-4">Order not found</p>
      <button onClick={() => navigate('/orders')}
              className="btn-primary">
        My Orders
      </button>
    </div>
  )

  const status = statusConfig[order.status] || statusConfig.PENDING
  const currentStep = status.step

  return (
    <div className="page-container animate-fade-in">

      {/* Back */}
      <button onClick={() => navigate('/orders')}
              className="flex items-center gap-2 text-gray-500
                         hover:text-gray-700 mb-6 transition-colors">
        ← Back to Orders
      </button>

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="section-title">Order #{order.id}</h1>
          <p className="text-gray-400 text-sm mt-1">
            Placed on {new Date(order.orderDate).toLocaleDateString('en-IN', {
              day: 'numeric', month: 'long', year: 'numeric',
              hour: '2-digit', minute: '2-digit'
            })}
          </p>
        </div>
        <span className={`${status.color} flex items-center gap-1`}>
          {status.icon} {status.label}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ── LEFT — Main Info ── */}
        <div className="lg:col-span-2 space-y-6">

          {/* Progress tracker */}
          {order.status !== 'CANCELLED' && (
            <div className="card p-6">
              <h3 className="font-bold text-gray-900 mb-6">
                Order Progress
              </h3>
              <div className="flex items-start">
                {steps.map((step, i) => (
                  <div key={i} className="flex items-center flex-1">
                    <div className="flex flex-col items-center">
                      <div className={`w-10 h-10 rounded-full flex items-center
                                       justify-center text-lg transition-all
                                       ${currentStep >= i
                                         ? 'bg-primary-500 text-white shadow-button'
                                         : 'bg-gray-100 text-gray-300'}`}>
                        {currentStep > i ? '✓' : step.icon}
                      </div>
                      <p className={`text-xs mt-2 text-center font-medium
                                     ${currentStep >= i
                                       ? 'text-primary-500'
                                       : 'text-gray-300'}`}>
                        {step.label}
                      </p>
                    </div>
                    {i < steps.length - 1 && (
                      <div className={`flex-1 h-0.5 mb-6 mx-1 transition-all
                                       ${currentStep > i
                                         ? 'bg-primary-500'
                                         : 'bg-gray-200'}`} />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Items */}
          <div className="card p-6">
            <h3 className="font-bold text-gray-900 mb-4">
              Items ({order.items?.length})
            </h3>
            <div className="space-y-4">
              {order.items?.map(orderItem => (
                <div key={orderItem.id}
                     className="flex items-center gap-4 p-4
                                bg-gray-50 rounded-2xl">
                  <div className="w-20 h-20 bg-white rounded-xl
                                  overflow-hidden flex-shrink-0
                                  border border-gray-100">
                    {orderItem.item?.images?.[0] ? (
                      <img src={orderItem.item.images[0]}
                           alt={orderItem.item.title}
                           className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center
                                      justify-center text-2xl">📦</div>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">
                      {orderItem.item?.title || 'Item Removed'}
                    </p>
                    <p className="text-gray-400 text-xs mb-2">
                      {orderItem.item?.subCategory?.name}
                    </p>
                    <div className="flex items-center gap-3 text-sm">
                      <span className="badge-blue text-xs">
                        📅 {orderItem.rentalStartDate}
                      </span>
                      <span className="text-gray-400">→</span>
                      <span className="badge-blue text-xs">
                        {orderItem.rentalEndDate}
                      </span>
                      <span className="badge-green text-xs">
                        {orderItem.rentalDays} days
                      </span>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-bold text-gray-900">
                      ₹{orderItem.rentAmount}
                    </p>
                    <p className="text-gray-400 text-xs">
                      +₹{orderItem.depositAmount} deposit
                    </p>
                    <span className={`text-xs mt-1 inline-block
                                      ${orderItem.status === 'PENDING'
                                        ? 'text-yellow-500'
                                        : 'text-green-500'}`}>
                      {orderItem.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Delivery Address */}
          <div className="card p-6">
            <h3 className="font-bold text-gray-900 mb-4">
              📍 Delivery Address
            </h3>
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="font-medium text-gray-900">
                {order.deliveryAddress?.street}
              </p>
              <p className="text-gray-500 text-sm">
                {order.deliveryAddress?.city},{' '}
                {order.deliveryAddress?.state} -{' '}
                {order.deliveryAddress?.pincode}
              </p>
              {order.deliveryAddress?.landmark && (
                <p className="text-gray-400 text-xs mt-1">
                  Near {order.deliveryAddress.landmark}
                </p>
              )}
            </div>
          </div>

          {/* Payment Info */}
          {payment && (
            <div className="card p-6">
              <h3 className="font-bold text-gray-900 mb-4">
                💳 Payment Details
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Payment ID</span>
                  <span className="font-mono text-gray-700 text-xs">
                    {payment.paymentGatewayId}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Method</span>
                  <span className="font-medium">{payment.paymentMethod}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Status</span>
                  <span className={`font-medium ${
                    payment.status === 'COMPLETED'
                      ? 'text-green-500' : 'text-yellow-500'}`}>
                    {payment.status}
                  </span>
                </div>
                {payment.paidAt && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Paid At</span>
                    <span className="text-gray-700">
                      {new Date(payment.paidAt).toLocaleDateString('en-IN', {
                        day: 'numeric', month: 'short',
                        hour: '2-digit', minute: '2-digit'
                      })}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* ── RIGHT — Summary ── */}
        <div className="lg:col-span-1">
          <div className="card p-6 sticky top-24">

            <h3 className="font-bold text-gray-900 mb-4">
              Order Summary
            </h3>

            <div className="space-y-3 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Rent Amount</span>
                <span className="font-medium">
                  ₹{order.totalRentAmount}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Security Deposit</span>
                <span className="font-medium">₹{order.totalDeposit}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Platform Fee (10%)</span>
                <span className="font-medium">
                  ₹{order.platformCommission?.toFixed(0)}
                </span>
              </div>
              <div className="border-t border-gray-100 pt-3
                              flex justify-between font-bold text-lg">
                <span>Total Paid</span>
                <span className="text-primary-500">
                  ₹{order.totalRentAmount + order.totalDeposit}
                </span>
              </div>
            </div>

            {/* Deposit refund note */}
            <div className="bg-green-50 rounded-xl p-3 mb-4 text-sm">
              <p className="text-green-700 font-medium mb-1">
                💚 Refundable Deposit
              </p>
              <p className="text-green-600 text-xs">
                ₹{order.totalDeposit} will be refunded after
                item is returned in good condition
              </p>
            </div>

          {/* Actions */}
<div className="space-y-3">
  {order.status === 'DELIVERED_TO_CUSTOMER' && (
    <div className="bg-blue-50 border border-blue-100
                    rounded-xl p-3 text-center">
      <p className="text-blue-700 text-sm font-medium">
        📦 Enjoy your rental!
      </p>
      <p className="text-blue-500 text-xs mt-1">
        Return pickup will be automatically arranged
        when your rental period ends.
      </p>
    </div>
  )}

              {(order.status === 'PENDING' ||
                order.status === 'CONFIRMED') && (
                <button
                  onClick={async () => {
                    // Calculate refund percent based on order date
                    const orderDate = new Date(order.orderDate)
                    const now = new Date()
                    const hoursElapsed = (now - orderDate) / (1000 * 60 * 60)
                    let refundPercent
                    if (hoursElapsed <= 2)       refundPercent = 100
                    else if (hoursElapsed <= 24) refundPercent = 90
                    else if (hoursElapsed <= 48) refundPercent = 75
                    else if (hoursElapsed <= 72) refundPercent = 50
                    else                         refundPercent = 25

                    const totalPaid = order.totalRentAmount + order.totalDeposit
                    const refundAmount = (totalPaid * refundPercent / 100).toFixed(0)

                    const confirmed = window.confirm(
                      `Cancel Order #${order.id}?\n\n` +
                      `Cancellation Policy:\n` +
                      `• Order placed ${Math.floor(hoursElapsed)} hours ago\n` +
                      `• Refund: ${refundPercent}% = ₹${refundAmount}\n\n` +
                      `Refund will be processed within 5-7 business days.`
                    )
                    if (!confirmed) return
                    try {
                      await api.delete(`/orders/${order.id}/cancel`)
                      fetchOrder()
                      alert('Order cancelled. Refund will be processed shortly.')
                    } catch (err) {
                      alert(err.response?.data || 'Failed to cancel order')
                    }
                  }}
                  className="w-full border-2 border-red-200 text-red-500
                             py-2 rounded-xl text-sm font-medium
                             hover:bg-red-50 transition-colors">
                  ❌ Cancel Order
                </button>
              )}

              {order.status === 'COMPLETED' && (
                <button
                  onClick={() => navigate(`/items/${
                    order.items?.[0]?.item?.id}`)}
                  className="btn-secondary w-full text-sm">
                  ⭐ Write a Review
                </button>
              )}

              <button
                onClick={() => navigate('/items')}
                className="btn-ghost w-full text-sm">
                Continue Shopping
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}