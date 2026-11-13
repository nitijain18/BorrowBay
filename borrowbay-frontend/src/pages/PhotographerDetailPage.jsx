import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../api/axiosConfig'
import { useAuth } from '../context/AuthContext'

export default function PhotographerDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { isLoggedIn, user } = useAuth()

  const [photographer, setPhotographer] = useState(null)
  const [reviews, setReviews]           = useState([])
  const [loading, setLoading]           = useState(true)
  const [selectedImage, setSelectedImage] = useState(0)
  const [myBookings, setMyBookings]     = useState([])

  // Booking form
  const [bookingForm, setBookingForm] = useState({
    bookingDate: '',
    startTime:   '',
    endTime:     '',
    location:    '',
    eventDescription: ''
  })
  const [booking, setBooking]         = useState(false)
  const [bookingError, setBookingError]   = useState('')
  const [bookingSuccess, setBookingSuccess] = useState('')

  // Edit pricing
  const [editingPrice, setEditingPrice] = useState(false)
  const [priceForm, setPriceForm] = useState({
    pricePerHour: '',
    pricePerDay:  ''
  })
  const [savingPrice, setSavingPrice] = useState(false)

  // Check if current user is the photographer
  const isOwnProfile = isLoggedIn &&
    photographer?.user?.id === user?.id

useEffect(() => {
  fetchPhotographer()
  fetchReviews()
}, [id])

// ← ADD THIS RIGHT HERE
useEffect(() => {
  if (photographer) {
    setPriceForm({
      pricePerHour: photographer.pricePerHour || '',
      pricePerDay:  photographer.pricePerDay || ''
    })
  }
}, [photographer])

  // Keep the price form in sync once photographer data loads/changes
  useEffect(() => {
    if (photographer) {
      setPriceForm({
        pricePerHour: photographer.pricePerHour ?? '',
        pricePerDay:  photographer.pricePerDay ?? ''
      })
    }
  }, [photographer])

  const fetchPhotographer = async () => {
    try {
      const res = await api.get(`/photographer-profiles/${id}`)
      setPhotographer(res.data)

      // If viewing own profile, fetch bookings
      const userData = JSON.parse(localStorage.getItem('user'))
      if (userData && res.data.user?.id === userData.id) {
        try {
          const bookingsRes = await api.get(
            `/booking-slots/photographer/${id}`)
          setMyBookings(bookingsRes.data)
        } catch (err) {
          console.error('Failed to fetch bookings:', err)
        }
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const fetchReviews = async () => {
    try {
      const res = await api.get(`/photographer-reviews/photographer/${id}`)
      setReviews(res.data)
    } catch (err) {
      console.error(err)
    }
  }

  const handleBook = async (e) => {
    e.preventDefault()
    if (!isLoggedIn) { navigate('/login'); return }
    setBooking(true)
    setBookingError('')

    try {
      const startTime = bookingForm.startTime.length === 5
        ? bookingForm.startTime + ':00'
        : bookingForm.startTime

      const endTime = bookingForm.endTime.length === 5
        ? bookingForm.endTime + ':00'
        : bookingForm.endTime

      const res = await api.post('/booking-slots', {
        bookingDate:      bookingForm.bookingDate,
        startTime:        startTime,
        endTime:          endTime,
        location:         bookingForm.location,
        eventDescription: bookingForm.eventDescription,
        photographer:     { id: parseInt(id) },
        customer:         { id: user.id }
      })

      // Notify photographer
      try {
        await api.post('/notifications', {
          message: `📅 New booking request from ${user.firstName} ${user.lastName}! Date: ${bookingForm.bookingDate}, Time: ${bookingForm.startTime} - ${bookingForm.endTime}, Location: ${bookingForm.location}`,
          type: 'GENERAL',
          user: { id: photographer.user?.id }
        })
      } catch (notifErr) {
        console.warn('Notification failed:', notifErr)
      }

      // Notify customer
      try {
        await api.post('/notifications', {
          message: `✅ Your booking request has been sent to ${photographer.user?.firstName}! They will confirm within 24 hours.`,
          type: 'GENERAL',
          user: { id: user.id }
        })
      } catch (notifErr) {
        console.warn('Self notification failed:', notifErr)
      }

      setBookingSuccess('Booking request sent! Photographer will confirm shortly.')
      setBookingForm({
        bookingDate: '', startTime: '', endTime: '',
        location: '', eventDescription: ''
      })

    } catch (err) {
      setBookingError(err.response?.data || 'Booking failed.')
    } finally {
      setBooking(false)
    }
  }

const handleUpdatePrice = async (e) => {
  e.preventDefault()
  setSavingPrice(true)
  try {
    // id from useParams = photographer profile id
    await api.put(`/photographer-profiles/${id}`, {
      bio:             photographer.bio,
      specializations: photographer.specializations,
      city:            photographer.city,
      instagramUrl:    photographer.instagramUrl,
      portfolioImages: photographer.portfolioImages,
      pricePerHour:    parseFloat(priceForm.pricePerHour),
      pricePerDay:     parseFloat(priceForm.pricePerDay),
    })
    setEditingPrice(false)
    await fetchPhotographer()
    alert('Pricing updated successfully!')
  } catch (err) {
    console.error('Update error:', err)
    alert('Failed to update pricing')
  } finally {
    setSavingPrice(false)
  }
}

  // Calculate estimated price
  const calculatePrice = () => {
    if (!bookingForm.startTime || !bookingForm.endTime || !photographer) return 0
    const start = new Date(`2000-01-01T${bookingForm.startTime}`)
    const end   = new Date(`2000-01-01T${bookingForm.endTime}`)
    const hours = (end - start) / (1000 * 60 * 60)
    if (hours <= 0) return 0
    return Math.round(hours * photographer.pricePerHour)
  }

  const today = new Date().toISOString().split('T')[0]

  if (loading) return (
    <div className="page-container animate-pulse">
      <div className="grid grid-cols-2 gap-8">
        <div className="h-96 bg-gray-200 rounded-2xl" />
        <div className="space-y-4">
          <div className="h-8 bg-gray-200 rounded w-3/4" />
          <div className="h-4 bg-gray-200 rounded w-1/2" />
        </div>
      </div>
    </div>
  )

  if (!photographer) return (
    <div className="page-container text-center py-20">
      <p className="text-4xl mb-4">😕</p>
      <p className="text-gray-500">Photographer not found</p>
      <button onClick={() => navigate('/photographers')}
              className="btn-primary mt-4">
        Browse Photographers
      </button>
    </div>
  )

  const estimatedPrice = calculatePrice()

  return (
    <div className="page-container animate-fade-in">

      {/* Back */}
      <button onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-gray-500
                         hover:text-gray-700 mb-6 transition-colors">
        ← Back
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">

        {/* ── LEFT — Portfolio + Info ── */}
        <div className="animate-slide-up">

          {/* Main portfolio image */}
          <div className="h-80 bg-gray-100 rounded-2xl overflow-hidden mb-4">
            {photographer.portfolioImages?.length > 0 ? (
              <img
                src={photographer.portfolioImages[selectedImage]}
                alt={photographer.user?.firstName}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center
                              justify-center text-6xl text-gray-200">
                📷
              </div>
            )}
          </div>

          {/* Portfolio thumbnails */}
          {photographer.portfolioImages?.length > 1 && (
            <div className="flex gap-2 flex-wrap mb-6">
              {photographer.portfolioImages.map((img, i) => (
                <div
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  className={`w-16 h-16 rounded-xl overflow-hidden
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

          {/* Photographer info */}
          <div className="card p-5">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 bg-primary-500 rounded-full
                              flex items-center justify-center
                              text-white text-2xl font-bold
                              overflow-hidden flex-shrink-0">
                {photographer.user?.profileImage ? (
                  <img src={photographer.user.profileImage}
                       alt="" className="w-full h-full object-cover" />
                ) : (
                  photographer.user?.firstName?.charAt(0).toUpperCase()
                )}
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  {photographer.user?.firstName}{' '}
                  {photographer.user?.lastName}
                </h1>
                <p className="text-gray-500 text-sm">
                  📍 {photographer.city}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  {photographer.isVerified && (
                    <span className="badge-green text-xs">
                      ✅ Verified
                    </span>
                  )}
                  {photographer.isAvailable ? (
                    <span className="badge-green text-xs">
                      Available
                    </span>
                  ) : (
                    <span className="badge-red text-xs">
                      Not Available
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Bio */}
            {photographer.bio && (
              <p className="text-gray-600 text-sm leading-relaxed mb-4">
                {photographer.bio}
              </p>
            )}

            {/* Specializations */}
            {photographer.specializations && (
              <div className="mb-4">
                <p className="text-xs font-medium text-gray-500 mb-2">
                  Specializations
                </p>
                <div className="flex flex-wrap gap-2">
                  {photographer.specializations.split(',').map((spec, i) => (
                    <span key={i} className="badge-blue text-xs">
                      {spec.trim()}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Instagram */}
            {photographer.instagramUrl && (
              <a href={photographer.instagramUrl}
                 target="_blank" rel="noreferrer"
                 className="text-primary-500 text-sm hover:underline
                            flex items-center gap-1">
                📸 View Instagram Portfolio
              </a>
            )}
          </div>

          {/* Pricing card */}
          <div className="card p-5 mt-4">
            <h3 className="font-bold text-gray-900 mb-3">Pricing</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-primary-50 rounded-xl p-4 text-center">
                <p className="text-2xl font-bold text-primary-500">
                  ₹{photographer.pricePerHour}
                </p>
                <p className="text-gray-500 text-sm">per hour</p>
              </div>
              <div className="bg-primary-50 rounded-xl p-4 text-center">
                <p className="text-2xl font-bold text-primary-500">
                  ₹{photographer.pricePerDay}
                </p>
                <p className="text-gray-500 text-sm">full day</p>
              </div>
            </div>
          </div>

          {/* Reviews */}
          {reviews.length > 0 && (
            <div className="mt-6">
              <h3 className="font-bold text-gray-900 mb-4">
                ⭐ Reviews ({reviews.length})
              </h3>
              <div className="space-y-3">
                {reviews.map((review, i) => (
                  <div key={review.id} className="card p-4">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-medium text-gray-900 text-sm">
                        {review.reviewer?.firstName}{' '}
                        {review.reviewer?.lastName}
                      </p>
                      <div className="flex">
                        {[1,2,3,4,5].map(s => (
                          <span key={s}
                                className={s <= review.rating
                                  ? 'text-yellow-400 text-sm'
                                  : 'text-gray-200 text-sm'}>
                            ⭐
                          </span>
                        ))}
                      </div>
                    </div>
                    <p className="text-gray-600 text-sm">
                      {review.reviewText}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── RIGHT — Booking Form / Own Profile ── */}
        <div className="animate-slide-up">
          <div className="card p-6 sticky top-24">

            {isOwnProfile ? (
              // ── OWN PROFILE VIEW ──
              <div>
                <h2 className="font-bold text-gray-900 text-xl mb-6">
                  📷 My Photographer Profile
                </h2>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                  {[
                    { label: 'Total Bookings',
                      value: photographer.totalBookings || 0,
                      icon: '📅', color: 'text-blue-500' },
                    { label: 'Average Rating',
                      value: photographer.averageRating > 0
                        ? `⭐ ${photographer.averageRating?.toFixed(1)}`
                        : 'No ratings yet',
                      icon: '⭐', color: 'text-yellow-500' },
                    { label: 'Price/Hour',
                      value: `₹${photographer.pricePerHour}`,
                      icon: '💰', color: 'text-green-500' },
                    { label: 'Price/Day',
                      value: `₹${photographer.pricePerDay}`,
                      icon: '💰', color: 'text-green-500' },
                  ].map((stat, i) => (
                    <div key={i} className="bg-gray-50 rounded-xl p-3 text-center">
                      <p className={`text-xl font-bold ${stat.color}`}>
                        {stat.value}
                      </p>
                      <p className="text-gray-400 text-xs mt-1">{stat.label}</p>
                    </div>
                  ))}
                </div>

                {/* Status */}
                <div className="space-y-2 mb-6">
                  <div className="flex justify-between items-center py-2
                                  border-b border-gray-100">
                    <span className="text-gray-500 text-sm">Verification</span>
                    <span className={photographer.isVerified
                      ? 'badge-green text-xs'
                      : 'badge-yellow text-xs'}>
                      {photographer.isVerified ? '✅ Verified' : '⏳ Pending'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2
                                  border-b border-gray-100">
                    <span className="text-gray-500 text-sm">Availability</span>
                    <span className={photographer.isAvailable
                      ? 'badge-green text-xs'
                      : 'badge-red text-xs'}>
                      {photographer.isAvailable ? '🟢 Available' : '🔴 Not Available'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2
                                  border-b border-gray-100">
                    <span className="text-gray-500 text-sm">City</span>
                    <span className="text-gray-900 text-sm font-medium">
                      📍 {photographer.city}
                    </span>
                  </div>
                </div>

                {/* Recent Bookings */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-gray-900 text-sm">
                      Recent Bookings
                    </h3>
                    <button
                      onClick={() => navigate('/photographer/bookings')}
                      className="text-primary-500 text-xs hover:text-primary-600">
                      View all →
                    </button>
                  </div>

                  {myBookings.length === 0 ? (
                    <div className="bg-gray-50 rounded-xl p-4 text-center">
                      <p className="text-2xl mb-1">📅</p>
                      <p className="text-gray-400 text-xs">No bookings yet</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {myBookings.slice(0, 3).map(booking => (
                        <div key={booking.id}
                             className="bg-gray-50 rounded-xl p-3">
                          <div className="flex items-center justify-between mb-1">
                            <p className="font-medium text-gray-900 text-sm">
                              {booking.customer?.firstName}{' '}
                              {booking.customer?.lastName}
                            </p>
                            <span className={booking.isConfirmed
                              ? 'badge-green text-xs'
                              : 'badge-yellow text-xs'}>
                              {booking.isConfirmed ? '✅' : '⏳'}
                            </span>
                          </div>
                          <p className="text-gray-500 text-xs">
                            📅 {booking.bookingDate} •
                            🕐 {booking.startTime?.slice(0, 5)} -{' '}
                            {booking.endTime?.slice(0, 5)}
                          </p>
                          <p className="text-gray-500 text-xs">
                            📍 {booking.location}
                          </p>
                          {booking.price > 0 && (
                            <p className="text-primary-500 text-xs font-semibold mt-1">
                              ₹{booking.price?.toFixed(0)}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Earnings Summary */}
                <div className="bg-primary-50 rounded-xl p-4 mb-6">
                  <h3 className="font-semibold text-gray-900 text-sm mb-3">
                    💰 Earnings Summary
                  </h3>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Confirmed bookings</span>
                      <span className="font-medium text-gray-900">
                        {myBookings.filter(b => b.isConfirmed).length}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Total earned</span>
                      <span className="font-bold text-primary-500">
                        ₹{myBookings
                            .filter(b => b.isConfirmed)
                            .reduce((sum, b) => sum + (b.price || 0), 0)
                            .toFixed(0)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Pending confirmation</span>
                      <span className="font-medium text-orange-500">
                        {myBookings.filter(b => !b.isConfirmed).length} request(s)
                      </span>
                    </div>
                  </div>
                </div>

                {/* Edit Pricing */}
                <div className="card p-5 mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold text-gray-900 text-sm">
                      💰 My Pricing
                    </h3>
                    <button
                      onClick={() => setEditingPrice(!editingPrice)}
                      className="text-primary-500 text-xs hover:text-primary-600">
                      {editingPrice ? 'Cancel' : '✏️ Edit'}
                    </button>
                  </div>

                  {editingPrice ? (
                    <form onSubmit={handleUpdatePrice} className="space-y-3">
                      <div>
                        <label className="text-xs text-gray-500 mb-1 block">
                          Price per hour (₹)
                        </label>
                        <input
                          type="number"
                          value={priceForm.pricePerHour}
                          onChange={e => setPriceForm(
                            {...priceForm, pricePerHour: e.target.value})}
                          className="input-field text-sm"
                          required
                        />
                      </div>
                      <div>
                        <label className="text-xs text-gray-500 mb-1 block">
                          Price per day (₹)
                        </label>
                        <input
                          type="number"
                          value={priceForm.pricePerDay}
                          onChange={e => setPriceForm(
                            {...priceForm, pricePerDay: e.target.value})}
                          className="input-field text-sm"
                          required
                        />
                      </div>
                      <button type="submit" disabled={savingPrice}
                              className="btn-primary w-full text-sm py-2">
                        {savingPrice ? 'Saving...' : 'Save Pricing'}
                      </button>
                    </form>
                  ) : (
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-primary-50 rounded-xl p-3 text-center">
                        <p className="text-xl font-bold text-primary-500">
                          ₹{photographer.pricePerHour}
                        </p>
                        <p className="text-gray-400 text-xs">per hour</p>
                      </div>
                      <div className="bg-primary-50 rounded-xl p-3 text-center">
                        <p className="text-xl font-bold text-primary-500">
                          ₹{photographer.pricePerDay}
                        </p>
                        <p className="text-gray-400 text-xs">per day</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="space-y-3">
                  <button
                    onClick={() => navigate('/photographer/bookings')}
                    className="btn-primary w-full">
                    📅 Manage Bookings
                  </button>
                  <button
                    onClick={() => navigate('/photographers')}
                    className="btn-secondary w-full">
                    Browse Other Photographers
                  </button>
                </div>
              </div>

            ) : !photographer.isAvailable ? (
              // ── NOT AVAILABLE ──
              <div className="text-center py-8">
                <p className="text-3xl mb-3">😔</p>
                <p className="text-gray-500">
                  This photographer is currently not available
                </p>
              </div>

            ) : !isLoggedIn ? (
              // ── NOT LOGGED IN ──
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">
                  Login to book a session
                </p>
                <button onClick={() => navigate('/login')}
                        className="btn-primary">
                  Login to Book
                </button>
              </div>

            ) : (
              // ── BOOKING FORM ──
              <>
                <h2 className="font-bold text-gray-900 text-xl mb-6">
                  📅 Book a Session
                </h2>

                {bookingSuccess && (
                  <div className="bg-green-50 border border-green-200
                                  text-green-600 rounded-xl px-4 py-3
                                  mb-4 text-sm animate-fade-in">
                    ✅ {bookingSuccess}
                  </div>
                )}

                {bookingError && (
                  <div className="bg-red-50 border border-red-200
                                  text-red-600 rounded-xl px-4 py-3
                                  mb-4 text-sm animate-fade-in">
                    ⚠️ {bookingError}
                  </div>
                )}

                <form onSubmit={handleBook} className="space-y-4">

                  <div>
                    <label className="block text-sm font-medium
                                       text-gray-700 mb-1">
                      📅 Date
                    </label>
                    <input
                      type="date"
                      min={today}
                      value={bookingForm.bookingDate}
                      onChange={e => setBookingForm(
                        {...bookingForm, bookingDate: e.target.value})}
                      className="input-field"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium
                                         text-gray-700 mb-1">
                        Start Time
                      </label>
                      <input
                        type="time"
                        value={bookingForm.startTime}
                        onChange={e => setBookingForm(
                          {...bookingForm, startTime: e.target.value})}
                        className="input-field"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium
                                         text-gray-700 mb-1">
                        End Time
                      </label>
                      <input
                        type="time"
                        value={bookingForm.endTime}
                        onChange={e => setBookingForm(
                          {...bookingForm, endTime: e.target.value})}
                        className="input-field"
                        required
                      />
                    </div>
                  </div>

                  {/* Price estimate */}
                  {estimatedPrice > 0 && (
                    <div className="bg-primary-50 rounded-xl p-3
                                    animate-fade-in">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">
                          Estimated cost
                        </span>
                        <span className="font-bold text-primary-500">
                          ₹{estimatedPrice}
                        </span>
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium
                                       text-gray-700 mb-1">
                      📍 Location
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Bandra, Mumbai"
                      value={bookingForm.location}
                      onChange={e => setBookingForm(
                        {...bookingForm, location: e.target.value})}
                      className="input-field"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium
                                       text-gray-700 mb-1">
                      Event Description
                    </label>
                    <textarea
                      placeholder="e.g. Wedding reception, Product shoot..."
                      value={bookingForm.eventDescription}
                      onChange={e => setBookingForm(
                        {...bookingForm, eventDescription: e.target.value})}
                      className="input-field h-24 resize-none"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={booking}
                    className="btn-primary w-full flex items-center
                               justify-center gap-2 py-4 text-lg">
                    {booking ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white
                                        border-t-transparent rounded-full
                                        animate-spin" />
                        Sending Request...
                      </>
                    ) : '📷 Send Booking Request'}
                  </button>

                  <p className="text-gray-400 text-xs text-center">
                    Photographer will confirm within 24 hours
                  </p>

                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}