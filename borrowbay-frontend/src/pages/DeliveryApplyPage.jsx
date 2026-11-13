import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/axiosConfig'
import { useAuth } from '../context/AuthContext'

export default function DeliveryApplyPage() {
  const navigate = useNavigate()
  const { isLoggedIn, user } = useAuth()

  const [existingProfile, setExistingProfile] = useState(null)
  const [checking, setChecking]               = useState(true)
  const [loading, setLoading]                 = useState(false)
  const [error, setError]                     = useState('')

  const [form, setForm] = useState({
    vehicleType:    'BIKE',
    vehicleNumber:  '',
    licenseNumber:  '',
    city:           '',
  })

  useEffect(() => {
    if (!isLoggedIn) { navigate('/login'); return }
    checkExisting()
  }, [])

  const checkExisting = async () => {
    try {
      const res = await api.get(
        `/delivery-partner-profiles/user/${user.id}`)
      setExistingProfile(res.data)
    } catch {
      setExistingProfile(null)
    } finally {
      setChecking(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      await api.post('/delivery-partner-profiles', {
        ...form,
        user: { id: user.id }
      })

      // Notify admin
      try {
        const adminRes = await api.get('/users/role/ROLE_ADMIN')
        if (adminRes.data?.length > 0) {
          await api.post('/notifications', {
            message: `🚚 New delivery partner application from
                      ${user.firstName} ${user.lastName} — ${form.city}.
                      Vehicle: ${form.vehicleType}`,
            type: 'GENERAL',
            user: { id: adminRes.data[0].id }
          })
        }
      } catch (notifErr) {
        console.warn('Admin notification failed:', notifErr)
      }

      // Notify applicant
      try {
        await api.post('/notifications', {
          message: `✅ Your delivery partner application has been submitted!
                    Our team will verify it within 24-48 hours.`,
          type: 'GENERAL',
          user: { id: user.id }
        })
      } catch (notifErr) {
        console.warn('Self notification failed:', notifErr)
      }

      checkExisting()

    } catch (err) {
      setError(err.response?.data || 'Failed to submit application')
    } finally {
      setLoading(false)
    }
  }

  if (checking) return (
    <div className="page-container text-center py-20">
      <div className="w-8 h-8 border-2 border-primary-500
                      border-t-transparent rounded-full animate-spin
                      mx-auto" />
    </div>
  )

  // Already applied
  if (existingProfile) return (
    <div className="min-h-[80vh] flex items-center
                    justify-center px-4">
      <div className="w-full max-w-md animate-scale-in">
        <div className="bg-white rounded-2xl shadow-card p-8
                        text-center">
          {existingProfile.isVerified ? (
            <>
              <div className="text-5xl mb-4">✅</div>
              <h1 className="text-2xl font-bold text-gray-900 mb-3">
                You're a Verified Delivery Partner!
              </h1>
              <p className="text-gray-500 mb-6">
                You can now receive delivery assignments.
              </p>
              <button
                onClick={() => navigate('/delivery/dashboard')}
                className="btn-primary w-full">
                Go to Dashboard
              </button>
            </>
          ) : (
            <>
              <div className="text-5xl mb-4">⏳</div>
              <h1 className="text-2xl font-bold text-gray-900 mb-3">
                Application Under Review
              </h1>
              <p className="text-gray-500 mb-2">
                Our team is reviewing your application.
              </p>
              <p className="text-gray-400 text-sm mb-6">
                You'll be notified once verified.
              </p>
              <span className="badge-yellow">⏳ Pending Verification</span>
              <div className="mt-6">
                <button onClick={() => navigate('/')}
                        className="btn-ghost w-full">
                  Go to Home
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-[80vh] flex items-center
                    justify-center px-4 py-8">
      <div className="w-full max-w-md animate-scale-in">
        <div className="bg-white rounded-2xl shadow-card p-8">

          <div className="text-center mb-8">
            <div className="text-4xl mb-3">🚚</div>
            <h1 className="text-2xl font-bold text-gray-900">
              Become a Delivery Partner
            </h1>
            <p className="text-gray-500 mt-1 text-sm">
              Earn by delivering rental items
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200
                            text-red-600 rounded-xl px-4 py-3
                            mb-6 text-sm">
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">

            <div>
              <label className="block text-sm font-medium
                                 text-gray-700 mb-1">
                Vehicle Type
              </label>
              <select
                value={form.vehicleType}
                onChange={e => setForm(
                  {...form, vehicleType: e.target.value})}
                className="input-field">
                <option value="BIKE">🏍️ Bike</option>
                <option value="SCOOTER">🛵 Scooter</option>
                <option value="VAN">🚐 Van</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium
                                 text-gray-700 mb-1">
                Vehicle Number
              </label>
              <input
                type="text"
                placeholder="MH12AB1234"
                value={form.vehicleNumber}
                onChange={e => setForm(
                  {...form, vehicleNumber: e.target.value.toUpperCase()})}
                className="input-field"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium
                                 text-gray-700 mb-1">
                Driving License Number
              </label>
              <input
                type="text"
                placeholder="MH1234567890"
                value={form.licenseNumber}
                onChange={e => setForm(
                  {...form, licenseNumber: e.target.value})}
                className="input-field"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium
                                 text-gray-700 mb-1">
                City
              </label>
              <input
                type="text"
                placeholder="Mumbai"
                value={form.city}
                onChange={e => setForm({...form, city: e.target.value})}
                className="input-field"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center
                         justify-center gap-2">
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white
                                  border-t-transparent rounded-full
                                  animate-spin" />
                  Submitting...
                </>
              ) : 'Submit Application'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}