import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../api/axiosConfig'
import { useAuth } from '../context/AuthContext'

export default function ItemDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { isLoggedIn, user } = useAuth()

  const [item, setItem]               = useState(null)
  const [loading, setLoading]         = useState(true)
  const [selectedImage, setSelectedImage] = useState(0)
  const [startDate, setStartDate]     = useState('')
  const [endDate, setEndDate]         = useState('')
  const [rentalDays, setRentalDays]   = useState(0)
  const [totalCost, setTotalCost]     = useState(0)
  const [addingToCart, setAddingToCart] = useState(false)
  const [cartSuccess, setCartSuccess] = useState(false)
  const [error, setError]             = useState('')
  const [inWishlist, setInWishlist]       = useState(false)
  const [togglingWishlist, setTogglingWishlist] = useState(false)

  // Report item
  const [showReportForm, setShowReportForm] = useState(false)
  const [reportReason, setReportReason]     = useState('')
  const [reporting, setReporting]           = useState(false)
  const [reportSuccess, setReportSuccess]   = useState('')
  const [reportError, setReportError]       = useState('')

  // Reviews
  const [reviews, setReviews]           = useState([])
  const [reviewsLoading, setReviewsLoading] = useState(true)
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [reviewForm, setReviewForm]     = useState({ rating: 5, reviewText: '' })
  const [submittingReview, setSubmittingReview] = useState(false)
  const [reviewError, setReviewError]   = useState('')
  const [reviewSuccess, setReviewSuccess] = useState('')
  const [hasRented, setHasRented]       = useState(false)
  const [hasReviewed, setHasReviewed]   = useState(false)

  // Blocked dates
  const [blockedDates, setBlockedDates] = useState([])

  useEffect(() => {
    fetchItem()
    fetchReviews()
    fetchBlockedDates()
  }, [id])

  // Check if user ordered this item
  useEffect(() => {
    if (isLoggedIn && user?.id) {
      checkUserEligibility()
    }
  }, [isLoggedIn, user, id])

  // Check if user already reviewed (separate from above)
  useEffect(() => {
    if (reviews.length >= 0 && user?.id) {
      const alreadyReviewed = reviews.some(r => r.reviewer?.id === user.id)
      setHasReviewed(alreadyReviewed)
    }
  }, [reviews, user])

  // Calculate rental days and cost when dates change
  useEffect(() => {
    if (startDate && endDate) {
      const start = new Date(startDate)
      const end   = new Date(endDate)
      const days  = Math.ceil((end - start) / (1000 * 60 * 60 * 24))
      if (days > 0) {
        setRentalDays(days)
        setTotalCost(days * item?.rentPricePerDay || 0)
      } else {
        setRentalDays(0)
        setTotalCost(0)
      }
    }
  }, [startDate, endDate, item])

  const fetchItem = async () => {
    try {
      const res = await api.get(`/items/${id}`)
      setItem(res.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const fetchReviews = async () => {
    setReviewsLoading(true)
    try {
      const res = await api.get(`/reviews/item/${id}`)
      setReviews(res.data)
    } catch (err) {
      console.error(err)
    } finally {
      setReviewsLoading(false)
    }
  }

  const fetchBlockedDates = async () => {
    try {
      const res = await api.get(`/items/${id}/availability-blocks`)
      setBlockedDates(res.data)
    } catch (err) {
      console.error(err)
    }
  }

  const checkUserEligibility = async () => {
    if (!user?.id) return
    try {
      const ordersRes = await api.get(`/orders/customer/${user.id}`)
      const hasOrdered = ordersRes.data.some(order =>
        order.status !== 'CANCELLED' &&
        order.items?.some(oi => oi.item?.id === parseInt(id))
      )
      setHasRented(hasOrdered)
    } catch (err) {
      console.error(err)
      setHasRented(false)
    }
  }

  const handleAddToCart = async () => {
    if (!isLoggedIn) {
      navigate('/login')
      return
    }
    if (!startDate || !endDate) {
      setError('Please select rental dates')
      return
    }
    if (rentalDays <= 0) {
      setError('End date must be after start date')
      return
    }

    setAddingToCart(true)
    setError('')

    try {
      const userData = JSON.parse(localStorage.getItem('user'))
      const userId = userData.id

      await api.post(`/cart/user/${userId}/add-item/${id}`, {
        rentalStartDate: startDate,
        rentalEndDate: endDate
      })

      setCartSuccess(true)
      setTimeout(() => navigate('/cart'), 1500)

    } catch (err) {
      setError(err.response?.data || 'Failed to add to cart')
    } finally {
      setAddingToCart(false)
    }
  }

  const handleWishlist = async () => {
    if (!isLoggedIn) { navigate('/login'); return }
    setTogglingWishlist(true)
    try {
      const userData = JSON.parse(localStorage.getItem('user'))
      if (inWishlist) {
        await api.put(`/wishlist/user/${userData.id}/remove-item/${id}`)
        setInWishlist(false)
      } else {
        await api.put(`/wishlist/user/${userData.id}/add-item/${id}`)
        setInWishlist(true)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setTogglingWishlist(false)
    }
  }

  const handleReport = async (e) => {
    e.preventDefault()
    if (!isLoggedIn) { navigate('/login'); return }
    setReporting(true)
    setReportError('')
    try {
      const userData = JSON.parse(localStorage.getItem('user'))

      await api.post('/support-tickets', {
        subject:     `Item Report: ${item.title}`,
        description: reportReason,
        raisedBy:    { id: userData.id },
      })

      if (item.seller?.id) {
        try {
          await api.post('/notifications', {
            message: `⚠️ Your item "${item.title}" has been reported. Reason: ${reportReason}`,
            type:    'GENERAL',
            user:    { id: item.seller.id }
          })
        } catch (notifErr) {
          console.warn('Seller notification failed:', notifErr)
        }
      }

      try {
        const adminUsers = await api.get('/users/role/ROLE_ADMIN')
        if (adminUsers.data?.length > 0) {
          await api.post('/notifications', {
            message: `🚨 Item "${item.title}" reported. Reason: ${reportReason}. Reported by: ${userData.email}`,
            type:    'GENERAL',
            user:    { id: adminUsers.data[0].id }
          })
        }
      } catch (adminErr) {
        console.warn('Admin notification failed:', adminErr)
      }

      setReportSuccess('Report submitted successfully. Our team will review it.')
      setShowReportForm(false)
      setReportReason('')
    } catch (err) {
      console.error('Report error:', err)
      setReportError(err.response?.data || 'Failed to submit report. Please try again.')
    } finally {
      setReporting(false)
    }
  }

  const handleSubmitReview = async (e) => {
    e.preventDefault()
    setSubmittingReview(true)
    setReviewError('')

    try {
      await api.post('/reviews', {
        rating:     reviewForm.rating,
        reviewText: reviewForm.reviewText,
        item:       { id: parseInt(id) },
        reviewer:   { id: user.id }
      })

      setReviewSuccess('Review submitted successfully!')
      setShowReviewForm(false)
      setReviewForm({ rating: 5, reviewText: '' })
      fetchReviews()
      fetchItem()
      setTimeout(() => setReviewSuccess(''), 3000)
    } catch (err) {
      console.error('Review error:', err.response?.data)
      setReviewError(err.response?.data || 'Failed to submit review')
    } finally {
      setSubmittingReview(false)
    }
  }

  // Get today's date for min date
  const today = new Date().toISOString().split('T')[0]

  if (loading) return (
    <div className="page-container">
      <div className="animate-pulse">
        <div className="grid grid-cols-2 gap-8">
          <div className="h-96 bg-gray-200 rounded-2xl" />
          <div className="space-y-4">
            <div className="h-8 bg-gray-200 rounded w-3/4" />
            <div className="h-4 bg-gray-200 rounded w-1/2" />
            <div className="h-4 bg-gray-200 rounded w-1/3" />
          </div>
        </div>
      </div>
    </div>
  )

  if (!item) return (
    <div className="page-container text-center py-20">
      <p className="text-4xl mb-4">😕</p>
      <p className="text-gray-500">Item not found</p>
      <button onClick={() => navigate('/items')}
              className="btn-primary mt-4">
        Browse Items
      </button>
    </div>
  )

  return (
    <div className="page-container animate-fade-in">

      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-gray-500
                   hover:text-gray-700 mb-6 transition-colors">
        ← Back
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">

        {/* ── LEFT — Images ── */}
        <div className="animate-slide-up">

          {/* Main image */}
          <div className="h-80 md:h-96 bg-gray-100 rounded-2xl
                          overflow-hidden mb-4">
            {item.images && item.images.length > 0 ? (
              <img
                src={item.images[selectedImage]}
                alt={item.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center
                              justify-center text-6xl text-gray-200">
                📦
              </div>
            )}
          </div>

          {/* Thumbnail images */}
          {item.images && item.images.length > 1 && (
            <div className="flex gap-3">
              {item.images.map((img, i) => (
                <div
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  className={`w-20 h-20 rounded-xl overflow-hidden
                              cursor-pointer border-2 transition-all
                              ${selectedImage === i
                                ? 'border-primary-500'
                                : 'border-transparent'}`}>
                  <img src={img} alt=""
                       className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── RIGHT — Details ── */}
        <div className="animate-slide-up">

          {/* Title & badges */}
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="badge-blue text-xs">
                {item.subCategory?.category?.name}
              </span>
              <span className="badge-green text-xs">
                {item.condition?.replace('_', ' ')}
              </span>
              {item.isAvailable ? (
                <span className="badge-green text-xs">✅ Available</span>
              ) : (
                <span className="badge-red text-xs">❌ Not Available</span>
              )}
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-1">
              {item.title}
            </h1>
            <p className="text-gray-500 text-sm">
              {item.subCategory?.name} •{' '}
              {item.seller?.firstName} {item.seller?.lastName}
            </p>
          </div>

          {/* Rating */}
          {item.totalReviews > 0 && (
            <div className="flex items-center gap-2 mb-4">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <span key={i}
                        className={i < Math.round(item.averageRating)
                          ? 'text-yellow-400' : 'text-gray-200'}>
                    ⭐
                  </span>
                ))}
              </div>
              <span className="font-semibold text-gray-700">
                {item.averageRating?.toFixed(1)}
              </span>
              <span className="text-gray-400 text-sm">
                ({item.totalReviews} reviews)
              </span>
            </div>
          )}

          {/* Pricing */}
          <div className="bg-primary-50 rounded-2xl p-4 mb-6">
            <div className="flex items-baseline gap-2 mb-1">
              <span className="text-3xl font-bold text-primary-500">
                ₹{item.rentPricePerDay}
              </span>
              <span className="text-gray-500">per day</span>
            </div>
            <p className="text-gray-500 text-sm">
              Security Deposit: ₹{item.securityDeposit}
              <span className="text-green-500 ml-1">
                (refundable)
              </span>
            </p>
          </div>

          {/* Description */}
          <div className="mb-6">
            <h3 className="font-semibold text-gray-900 mb-2">
              About this item
            </h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              {item.description}
            </p>
          </div>

          {/* Date picker */}
          {item.isAvailable && (
            <div className="bg-white border border-gray-200
                            rounded-2xl p-4 mb-4">
              <h3 className="font-semibold text-gray-900 mb-3">
                📅 Select Rental Dates
              </h3>
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    min={today}
                    onChange={e => setStartDate(e.target.value)}
                    className="input-field text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    min={startDate || today}
                    onChange={e => setEndDate(e.target.value)}
                    className="input-field text-sm"
                  />
                </div>
              </div>

              {/* Blocked dates info */}
              {blockedDates.length > 0 && (
                <div className="bg-red-50 border border-red-100 rounded-xl p-3 mt-3">
                  <p className="text-xs font-semibold text-red-700 mb-2">
                    🚫 Already Booked Dates:
                  </p>
                  <div className="space-y-1">
                    {blockedDates.map((block, i) => (
                      <div key={i} className="flex items-center gap-2
                                              text-xs text-red-600">
                        <span>📅</span>
                        <span>
                          {block.blockedFrom} → {block.blockedTill}
                        </span>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-red-400 mt-2">
                    Please select dates outside the above ranges
                  </p>
                </div>
              )}

              {/* Cost summary */}
              {rentalDays > 0 && (
                <div className="bg-primary-50 rounded-xl p-3
                                animate-fade-in text-sm mt-3">
                  <div className="flex justify-between mb-1">
                    <span className="text-gray-600">
                      ₹{item.rentPricePerDay} × {rentalDays} days
                    </span>
                    <span className="font-semibold">₹{totalCost}</span>
                  </div>
                  <div className="flex justify-between mb-1">
                    <span className="text-gray-600">
                      Security deposit
                    </span>
                    <span className="font-semibold">
                      ₹{item.securityDeposit}
                    </span>
                  </div>
                  <div className="border-t border-primary-200 pt-2 mt-2
                                  flex justify-between font-bold">
                    <span>Total payable</span>
                    <span className="text-primary-500">
                      ₹{totalCost + item.securityDeposit}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600
                            rounded-xl px-4 py-3 mb-4 text-sm animate-fade-in">
              ⚠️ {error}
            </div>
          )}

          {/* Success */}
          {cartSuccess && (
            <div className="bg-green-50 border border-green-200
                            text-green-600 rounded-xl px-4 py-3 mb-4
                            text-sm animate-fade-in">
              ✅ Added to cart! Redirecting...
            </div>
          )}

          {/* Add to cart button */}
          {item.isAvailable ? (
            <button
              onClick={handleAddToCart}
              disabled={addingToCart}
              className="btn-primary w-full flex items-center
                         justify-center gap-2 text-lg py-4">
              {addingToCart ? (
                <>
                  <div className="w-5 h-5 border-2 border-white
                                  border-t-transparent rounded-full
                                  animate-spin" />
                  Adding to cart...
                </>
              ) : (
                <>🛒 Add to Cart</>
              )}
            </button>
          ) : (
            <button disabled
                    className="w-full py-4 rounded-xl bg-gray-100
                               text-gray-400 font-semibold cursor-not-allowed">
              Not Available
            </button>
          )}

          {/* Wishlist */}
          <button
            onClick={handleWishlist}
            disabled={togglingWishlist}
            className={`w-full mt-3 py-3 rounded-xl font-semibold
                        border-2 transition-all duration-200
                        ${inWishlist
                          ? 'bg-red-50 border-red-300 text-red-500'
                          : 'btn-secondary'}`}>
            {togglingWishlist ? '...' : inWishlist ? '♥ Saved to Wishlist' : '♡ Add to Wishlist'}
          </button>

          {/* Report Item */}
          <div className="mt-6 pt-6 border-t border-gray-100">
            {reportSuccess && (
              <div className="bg-green-50 border border-green-200 text-green-600
                              rounded-xl px-4 py-3 mb-3 text-sm animate-fade-in">
                ✅ {reportSuccess}
              </div>
            )}

            {!showReportForm ? (
              <button
                onClick={() => {
                  if (!isLoggedIn) { navigate('/login'); return }
                  setShowReportForm(true)
                }}
                className="text-red-400 text-sm hover:text-red-600
                           transition-colors flex items-center gap-1">
                🚩 Report this item
              </button>
            ) : (
              <div className="animate-scale-in">
                <h4 className="font-medium text-gray-900 mb-2 text-sm">
                  🚩 Report Item
                </h4>
                {reportError && (
                  <p className="text-red-500 text-xs mb-2">⚠️ {reportError}</p>
                )}
                <form onSubmit={handleReport} className="space-y-3">
                  <select
                    value={reportReason}
                    onChange={e => setReportReason(e.target.value)}
                    className="input-field text-sm"
                    required>
                    <option value="">Select reason</option>
                    <option value="Fake/misleading photos">
                      Fake/misleading photos
                    </option>
                    <option value="Item not as described">
                      Item not as described
                    </option>
                    <option value="Inappropriate content">
                      Inappropriate content
                    </option>
                    <option value="Suspected fraud">
                      Suspected fraud
                    </option>
                    <option value="Damaged item listed as good condition">
                      Damaged item listed as good condition
                    </option>
                    <option value="Other">Other</option>
                  </select>
                  <div className="flex gap-2">
                    <button type="submit" disabled={reporting}
                            className="flex-1 bg-red-500 text-white py-2
                                       rounded-xl text-sm font-medium
                                       hover:bg-red-600 transition-colors
                                       disabled:opacity-50">
                      {reporting ? 'Submitting...' : 'Submit Report'}
                    </button>
                    <button type="button"
                            onClick={() => setShowReportForm(false)}
                            className="flex-1 btn-secondary text-sm py-2">
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* ── REVIEWS SECTION ── */}
      <div className="mt-10 animate-fade-in">
        <div className="flex items-center justify-between mb-6">
          <h2 className="section-title">
            ⭐ Reviews ({reviews.length})
          </h2>

          {/* Write review button */}
          {isLoggedIn && hasRented && !hasReviewed && (
            <button
              onClick={() => setShowReviewForm(!showReviewForm)}
              className="btn-primary text-sm py-2">
              ✏️ Write Review
            </button>
          )}
        </div>

        {/* Review form */}
        {showReviewForm && (
          <div className="card p-6 mb-6 animate-scale-in">
            <h3 className="font-semibold text-gray-900 mb-4">
              Your Review
            </h3>

            {reviewError && (
              <div className="bg-red-50 border border-red-200 text-red-600
                              rounded-xl px-4 py-3 mb-4 text-sm">
                ⚠️ {reviewError}
              </div>
            )}

            <form onSubmit={handleSubmitReview} className="space-y-4">

              {/* Star rating */}
              <div>
                <label className="block text-sm font-medium
                                   text-gray-700 mb-2">
                  Rating
                </label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewForm(
                        {...reviewForm, rating: star})}
                      className={`text-3xl transition-transform
                                  hover:scale-110
                                  ${star <= reviewForm.rating
                                    ? 'text-yellow-400'
                                    : 'text-gray-200'}`}>
                      ⭐
                    </button>
                  ))}
                  <span className="text-gray-500 text-sm ml-2 self-center">
                    {reviewForm.rating}/5
                  </span>
                </div>
              </div>

              {/* Review text */}
              <div>
                <label className="block text-sm font-medium
                                   text-gray-700 mb-1">
                  Your experience
                </label>
                <textarea
                  value={reviewForm.reviewText}
                  onChange={e => setReviewForm(
                    {...reviewForm, reviewText: e.target.value})}
                  placeholder="How was the item? Was it as described?"
                  className="input-field h-28 resize-none"
                  required
                />
              </div>

              <div className="flex gap-3">
                <button type="submit" disabled={submittingReview}
                        className="btn-primary flex-1">
                  {submittingReview ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white
                                      border-t-transparent rounded-full
                                      animate-spin" />
                      Submitting...
                    </span>
                  ) : 'Submit Review'}
                </button>
                <button type="button"
                        onClick={() => setShowReviewForm(false)}
                        className="btn-secondary flex-1">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Review success */}
        {reviewSuccess && (
          <div className="bg-green-50 border border-green-200 text-green-600
                          rounded-xl px-4 py-3 mb-6 text-sm animate-fade-in">
            ✅ {reviewSuccess}
          </div>
        )}

        {/* Not eligible messages */}
        {isLoggedIn && !hasRented && (
          <div className="bg-blue-50 border border-blue-100 text-blue-600
                          rounded-xl px-4 py-3 mb-6 text-sm">
            ℹ️ Only customers who have rented this item can write a review
          </div>
        )}

        {isLoggedIn && hasRented && hasReviewed && (
          <div className="bg-green-50 border border-green-200 text-green-600
                          rounded-xl px-4 py-3 mb-6 text-sm">
            ✅ You have already reviewed this item
          </div>
        )}

        {/* Reviews list */}
        {reviewsLoading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded-2xl
                                      animate-pulse" />
            ))}
          </div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-10 text-gray-400">
            <p className="text-3xl mb-2">⭐</p>
            <p>No reviews yet — be the first to rent and review!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {reviews.map((review, i) => (
              <div key={review.id}
                   className="card p-5 animate-slide-up"
                   style={{ animationDelay: `${i * 0.1}s` }}>

                {/* Reviewer info */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary-500 rounded-full
                                    flex items-center justify-center
                                    text-white font-bold text-sm overflow-hidden">
                      {review.reviewer?.profileImage ? (
                        <img src={review.reviewer.profileImage}
                             alt="" className="w-full h-full object-cover" />
                      ) : (
                        review.reviewer?.firstName?.charAt(0).toUpperCase()
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 text-sm">
                        {review.reviewer?.firstName} {review.reviewer?.lastName}
                      </p>
                      {review.createdAt && (
                        <p className="text-gray-400 text-xs">
                          {new Date(review.createdAt)
                            .toLocaleDateString('en-IN', {
                              day: 'numeric', month: 'short', year: 'numeric'
                            })}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Star rating */}
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map(star => (
                      <span key={star}
                            className={star <= review.rating
                              ? 'text-yellow-400' : 'text-gray-200'}>
                        ⭐
                      </span>
                    ))}
                    <span className="text-gray-600 text-sm font-bold ml-1">
                      {review.rating}
                    </span>
                  </div>
                </div>

                {/* Review text */}
                <p className="text-gray-600 text-sm leading-relaxed">
                  {review.reviewText}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  )
}