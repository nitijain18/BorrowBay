import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/axiosConfig'
import { useAuth } from '../context/AuthContext'

export default function PhotographerBookingsPage() {
  const navigate = useNavigate()
  const { isLoggedIn, user } = useAuth()

  const [bookings, setBookings]         = useState([])
  const [profile, setProfile]           = useState(null)
  const [loading, setLoading]           = useState(true)
  const [activeTab, setActiveTab]       = useState('pending')
  const [confirmingId, setConfirmingId] = useState(null)
  const [success, setSuccess]           = useState('')

  useEffect(() => {
    if (!isLoggedIn) { navigate('/login'); return }
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      // Get photographer profile
      const profileRes = await api.get(
        `/photographer-profiles/user/${user.id}`)
      setProfile(profileRes.data)

      // Get bookings for this photographer
      const bookingsRes = await api.get(
        `/booking-slots/photographer/${profileRes.data.id}`)
      setBookings(bookingsRes.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleConfirm = async (bookingId, customerId) => {
    setConfirmingId(bookingId)
    try {
      await api.patch(`/booking-slots/${bookingId}/confirm`)

      // Notify customer
      await api.post('/notifications', {
        message: `🎉 Your booking has been confirmed by ${user.firstName}! 
                  See you soon.`,
        type: 'GENERAL',
        user: { id: customerId }
      })

      setSuccess('Booking confirmed! Customer notified.')
      fetchData()
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      console.error(err)
    } finally {
      setConfirmingId(null)
    }
  }

  const pendingBookings   = bookings.filter(b => !b.isConfirmed)
  const confirmedBookings = bookings.filter(b => b.isConfirmed)

  if (loading) return (
    <div className="page-container animate-pulse space-y-4">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="h-32 bg-gray-200 rounded-2xl" />
      ))}
    </div>
  )

  if (!profile) return (
    <div className="page-container text-center py-20">
      <p className="text-4xl mb-4">📷</p>
      <p className="text-gray-500 mb-4">
        You don't have a photographer profile yet
      </p>
      <button
        onClick={() => navigate('/photographer/apply')}
        className="btn-primary">
        Apply as Photographer
      </button>
    </div>
  )

  return (
    <div className="page-container animate-fade-in">

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="section-title">📅 My Bookings</h1>
          <p className="text-gray-500 mt-1">
            {pendingBookings.length} pending •{' '}
            {confirmedBookings.length} confirmed
          </p>
        </div>
        <button
          onClick={() => navigate(`/photographers/${profile.id}`)}
          className="btn-secondary text-sm py-2">
          View My Profile
        </button>
      </div>

      {/* Success */}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-600
                        rounded-xl px-4 py-3 mb-6 text-sm animate-fade-in">
          ✅ {success}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {[
          { id: 'pending',   label: `⏳ Pending (${pendingBookings.length})` },
          { id: 'confirmed', label: `✅ Confirmed (${confirmedBookings.length})` },
          { id: 'all',       label: `📋 All (${bookings.length})` },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
           className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${activeTab === tab.id ? 'bg-primary-500 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Bookings list */}
      {(() => {
        const list = activeTab === 'pending'   ? pendingBookings
                   : activeTab === 'confirmed' ? confirmedBookings
                   : bookings

        if (list.length === 0) return (
          <div className="text-center py-20">
            <p className="text-4xl mb-4">📅</p>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              No {activeTab} bookings
            </h3>
            <p className="text-gray-400">
              {activeTab === 'pending'
                ? 'No pending booking requests'
                : 'No confirmed bookings yet'}
            </p>
          </div>
        )

        return (
          <div className="space-y-4">
            {list.map((booking, i) => (
              <div
                key={booking.id}
                className={`card p-5 animate-slide-up
                            ${!booking.isConfirmed
                              ? 'border-l-4 border-orange-400'
                              : 'border-l-4 border-green-400'}`}
                style={{ animationDelay: `${i * 0.1}s` }}>

                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="font-bold text-gray-900 text-lg">
                      Booking #{booking.id}
                    </p>
                    <p className="text-gray-500 text-sm">
                      👤 {booking.customer?.firstName}{' '}
                      {booking.customer?.lastName}
                    </p>
                    <p className="text-gray-400 text-xs">
                      📧 {booking.customer?.email}
                    </p>
                  </div>
                  <span className={booking.isConfirmed
                    ? 'badge-green' : 'badge-yellow'}>
                    {booking.isConfirmed ? '✅ Confirmed' : '⏳ Pending'}
                  </span>
                </div>

                {/* Booking details */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                  <div className="bg-gray-50 rounded-xl p-3">
                    <p className="text-xs text-gray-400 mb-1">Date</p>
                    <p className="font-medium text-gray-900 text-sm">
                      📅 {booking.bookingDate}
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-3">
                    <p className="text-xs text-gray-400 mb-1">Time</p>
                    <p className="font-medium text-gray-900 text-sm">
                      🕐 {booking.startTime?.slice(0, 5)} -{' '}
                      {booking.endTime?.slice(0, 5)}
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-3">
                    <p className="text-xs text-gray-400 mb-1">Location</p>
                    <p className="font-medium text-gray-900 text-sm">
                      📍 {booking.location}
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-3">
                    <p className="text-xs text-gray-400 mb-1">Price</p>
                    <p className="font-medium text-primary-500 text-sm">
                      ₹{booking.price?.toFixed(0) || 'TBD'}
                    </p>
                  </div>
                </div>

                {/* Event description */}
                {booking.eventDescription && (
                  <div className="bg-blue-50 rounded-xl p-3 mb-4">
                    <p className="text-xs text-gray-500 mb-1">
                      Event Description
                    </p>
                    <p className="text-gray-700 text-sm">
                      {booking.eventDescription}
                    </p>
                  </div>
                )}

                {/* Confirm button */}
                {!booking.isConfirmed && (
                  <button
                    onClick={() => handleConfirm(
                      booking.id, booking.customer?.id)}
                    disabled={confirmingId === booking.id}
                    className="w-full bg-green-500 text-white py-3
                               rounded-xl font-semibold text-sm
                               hover:bg-green-600 transition-colors
                               disabled:opacity-50 flex items-center
                               justify-center gap-2">
                    {confirmingId === booking.id ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white
                                        border-t-transparent rounded-full
                                        animate-spin" />
                        Confirming...
                      </>
                    ) : '✅ Confirm Booking'}
                  </button>
                )}

              </div>
            ))}
          </div>
        )
      })()}
    </div>
  )
}