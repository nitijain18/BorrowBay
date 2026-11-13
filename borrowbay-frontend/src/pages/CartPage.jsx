import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/axiosConfig'
import { useAuth } from '../context/AuthContext'

export default function CartPage() {
  const navigate = useNavigate()
  const { isLoggedIn, user } = useAuth()

  const [cart, setCart]       = useState(null)
  const [loading, setLoading] = useState(true)
  const [userId, setUserId]   = useState(null)
  const [error, setError]     = useState('')
  const [placingOrder, setPlacingOrder] = useState(false)
  const [addresses, setAddresses]       = useState([])
  const [selectedAddress, setSelectedAddress] = useState('')

  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/login')
      return
    }
    fetchUserAndCart()
  }, [])

  const fetchUserAndCart = async () => {
    try {
      const userData = JSON.parse(localStorage.getItem('user'))
      const uid = userData.id
      setUserId(uid)

      const [cartRes, addressRes] = await Promise.all([
        api.get(`/cart/user/${uid}`),
        api.get(`/addresses/user/${uid}`)
      ])

      setCart(cartRes.data)
      setAddresses(addressRes.data)
      if (addressRes.data.length > 0) {
        setSelectedAddress(addressRes.data[0].id)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveItem = async (itemId) => {
    try {
      await api.delete(`/cart/user/${userId}/remove-item/${itemId}`)
      fetchUserAndCart()
    } catch (err) {
      setError('Failed to remove item')
    }
  }

  const handleClearCart = async () => {
    try {
      await api.delete(`/cart/user/${userId}/clear`)
      fetchUserAndCart()
    } catch (err) {
      setError('Failed to clear cart')
    }
  }

  const handlePlaceOrder = async () => {
    if (!selectedAddress) {
      setError('Please select a delivery address')
      return
    }
    // Check cart has items
    if (!cart?.cartItems || cart.cartItems.length === 0) {
      setError('Your cart is empty')
      return
    }
    setPlacingOrder(true)
    setError('')

    try {
      // Step 1 — Place order on backend
      const orderRes = await api.post(
        `/orders/place/${userId}?addressId=${selectedAddress}`)
      const order = orderRes.data

      // Step 2 — Create Razorpay order
      const razorpayRes = await api.post('/razorpay/create-order', {
        orderId: order.id,
        amount:  order.totalRentAmount + order.totalDeposit
      })

      const { razorpayOrderId, amount, keyId } = razorpayRes.data

      // Step 3 — Open Razorpay popup
      const options = {
        key:         keyId,
        amount:      Math.round(amount * 100),  // paise, rounded
        currency:    'INR',
        name:        'BorrowBay',
        description: `Order #${order.id}`,
        order_id:    razorpayOrderId,
        prefill: {
          name:    `${user?.firstName} ${user?.lastName}`,
          email:   user?.email,
          contact: user?.phoneNumber || ''
        },
        theme: { color: '#3B82F6' },

        handler: async (response) => {
          // Step 4 — Payment successful — verify
          try {
            const paymentRes = await api.post('/payments', {
              rentAmount:       order.totalRentAmount,
              depositAmount:    order.totalDeposit,
              paymentMethod:    'RAZORPAY',
              paymentGatewayId: response.razorpay_payment_id,
              order:            { id: order.id },
              user:             { id: userId }
            })

            await api.post(
              `/razorpay/verify?razorpayOrderId=${response.razorpay_order_id}&razorpayPaymentId=${response.razorpay_payment_id}&razorpaySignature=${response.razorpay_signature}&paymentId=${paymentRes.data.id}`
            )

            navigate('/orders')
          } catch (err) {
            setError('Payment done but verification failed. Contact support.')
            setPlacingOrder(false)
          }
        },

        modal: {
          ondismiss: () => {
            setError('Payment cancelled. Order placed but payment pending.')
            setPlacingOrder(false)
            navigate('/orders')
          }
        }
      }

      const rzp = new window.Razorpay(options)
      rzp.open()

    } catch (err) {
      console.error('Order error:', err)
      setError(err.response?.data || 'Failed to place order. Please try again.')
      setPlacingOrder(false)
    }
  }

  if (loading) return (
    <div className="page-container">
      <div className="animate-pulse space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-28 bg-gray-200 rounded-2xl" />
        ))}
      </div>
    </div>
  )

  const isEmpty = !cart?.cartItems || cart.cartItems.length === 0

  return (
    <div className="page-container animate-fade-in">
      <h1 className="section-title mb-8">🛒 My Cart</h1>

      {isEmpty ? (
        <div className="text-center py-20">
          <p className="text-6xl mb-4">🛒</p>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            Your cart is empty
          </h3>
          <p className="text-gray-400 mb-6">
            Add items to get started
          </p>
          <button onClick={() => navigate('/items')}
                  className="btn-primary">
            Browse Items
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* ── LEFT — Cart Items ── */}
          <div className="lg:col-span-2 space-y-4">

            {/* Clear cart button */}
            <div className="flex justify-between items-center">
              <p className="text-gray-500 text-sm">
                {cart.cartItems.length} item(s) in cart
              </p>
              <button
                onClick={handleClearCart}
                className="text-red-500 text-sm hover:text-red-600
                           transition-colors">
                Clear cart
              </button>
            </div>

            {/* Cart items */}
            {cart.cartItems.map((cartItem) => (
              <div key={cartItem.id}
                   className="card p-4 flex gap-4 animate-slide-up">

                {/* Image */}
                <div className="w-24 h-24 bg-gray-100 rounded-xl
                                overflow-hidden flex-shrink-0">
                  {cartItem.item?.images?.[0] ? (
                    <img
                      src={cartItem.item.images[0]}
                      alt={cartItem.item.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center
                                    justify-center text-2xl text-gray-200">
                      📦
                    </div>
                  )}
                </div>

                {/* Details */}
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-1">
                    {cartItem.item?.title}
                  </h3>
                  <p className="text-gray-400 text-xs mb-2">
                    {cartItem.item?.subCategory?.name}
                  </p>
                  <div className="flex items-center gap-3 text-sm">
                    <span className="text-primary-500 font-medium">
                      📅 {cartItem.rentalStartDate}
                    </span>
                    <span className="text-gray-400">→</span>
                    <span className="text-primary-500 font-medium">
                      {cartItem.rentalEndDate}
                    </span>
                    <span className="badge-blue">
                      {cartItem.rentalDays} days
                    </span>
                  </div>
                </div>

                {/* Price + remove */}
                <div className="text-right flex-shrink-0">
                  <p className="font-bold text-gray-900 mb-1">
                    ₹{cartItem.rentAmount}
                  </p>
                  <p className="text-gray-400 text-xs mb-2">
                    + ₹{cartItem.depositAmount} deposit
                  </p>
                  <button
                    onClick={() => handleRemoveItem(cartItem.item?.id)}
                    className="text-red-400 text-xs hover:text-red-600
                               transition-colors">
                    Remove
                  </button>
                </div>
              </div>
            ))}

            {/* Delivery Address */}
            <div className="card p-4">
              <h3 className="font-semibold text-gray-900 mb-3">
                📍 Delivery Address
              </h3>

              {addresses.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-gray-400 text-sm mb-3">
                    No saved addresses
                  </p>
                  <button
                    onClick={() => navigate('/profile')}
                    className="btn-secondary text-sm py-2">
                    Add Address
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  {addresses.map(addr => (
                    <label key={addr.id}
                           className={`flex items-start gap-3 p-3
                                       rounded-xl border-2 cursor-pointer
                                       transition-all duration-200
                                       hover:border-primary-300
                                       ${selectedAddress === addr.id
                                         ? 'border-primary-500 bg-primary-50'
                                         : 'border-gray-200'}`}>
                      <input
                        type="radio"
                        name="address"
                        value={addr.id}
                        checked={selectedAddress === addr.id}
                        onChange={() => setSelectedAddress(addr.id)}
                        className="mt-1 accent-primary-500"
                      />
                      <div>
                        <p className="font-medium text-gray-900 text-sm">
                          {addr.street}
                        </p>
                        <p className="text-gray-500 text-xs">
                          {addr.city}, {addr.state} - {addr.pincode}
                        </p>
                        {addr.landmark && (
                          <p className="text-gray-400 text-xs">
                            Near {addr.landmark}
                          </p>
                        )}
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ── RIGHT — Order Summary ── */}
          <div className="lg:col-span-1">
            <div className="card p-6 sticky top-24">
              <h3 className="font-bold text-gray-900 mb-4">
                Order Summary
              </h3>

              <div className="space-y-3 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Rent Amount</span>
                  <span className="font-medium">
                    ₹{cart.totalRentAmount}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Security Deposit</span>
                  <span className="font-medium">
                    ₹{cart.totalDeposit}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Platform Fee (10%)</span>
                  <span className="font-medium">
                    ₹{(cart.totalRentAmount * 0.10).toFixed(0)}
                  </span>
                </div>
                <div className="border-t border-gray-100 pt-3
                                flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span className="text-primary-500">
                    ₹{cart.totalRentAmount + cart.totalDeposit}
                  </span>
                </div>
              </div>

              <p className="text-xs text-gray-400 mb-4 text-center">
                💚 Deposit of ₹{cart.totalDeposit} refunded after return
              </p>

              {error && (
                <div className="bg-red-50 border border-red-200
                                text-red-600 rounded-xl px-3 py-2
                                mb-4 text-xs animate-fade-in">
                  ⚠️ {error}
                </div>
              )}

              <button
                onClick={handlePlaceOrder}
                disabled={placingOrder || addresses.length === 0}
                className="btn-primary w-full flex items-center
                           justify-center gap-2">
                {placingOrder ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white
                                    border-t-transparent rounded-full
                                    animate-spin" />
                    Processing...
                  </>
                ) : '💳 Pay & Place Order'}
              </button>

              <button
                onClick={() => navigate('/items')}
                className="btn-ghost w-full mt-2 text-sm">
                Continue Shopping
              </button>
            </div>
          </div>

        </div>
      )}
    </div>
  )
}