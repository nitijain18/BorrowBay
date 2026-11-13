import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/axiosConfig'
import { useAuth } from '../context/AuthContext'
import ImageUploader from '../components/ImageUploader'

export default function PhotographerApplyPage() {
  const navigate  = useNavigate()
  const { isLoggedIn, user } = useAuth()

  const [step, setStep]     = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError]   = useState('')
  const [profileId, setProfileId] = useState(null)

  const [existingProfile, setExistingProfile] = useState(null)
  const [checkingProfile, setCheckingProfile] = useState(true)
  

  const [form, setForm] = useState({
    bio:              '',
    specializations:  '',
    city:             '',
    instagramUrl:     '',
    pricePerHour:     '',
    pricePerDay:      '',
  })

  useEffect(() => {
    if (!isLoggedIn) { navigate('/login'); return }
    checkExistingProfile()
  }, [])

const checkExistingProfile = async () => {
  try {
    const res = await api.get(`/photographer-profiles/user/${user.id}`)
    setExistingProfile(res.data)
  } catch (err) {
    // 404 = no profile yet → show form
    setExistingProfile(null)
  } finally {
    setCheckingProfile(false)
  }
}


// In handleSubmit after api.post succeeds:
const handleSubmit = async (e) => {
  e.preventDefault()
  setLoading(true)
  setError('')

  try {
    const res = await api.post('/photographer-profiles', {
      ...form,
      pricePerHour: parseFloat(form.pricePerHour),
      pricePerDay:  parseFloat(form.pricePerDay),
      user: { id: user.id }
    })
    setProfileId(res.data.id)

    // Refresh user to get updated role ← ADD THIS
    const token = localStorage.getItem('token')
    await refreshUser(user.email, token)

    // Notify admin + self...
    setStep(2)
  } catch (err) {
    setError(err.response?.data || 'Failed to submit')
  } finally {
    setLoading(false)
  }
}
  if (checkingProfile) return (
    <div className="page-container text-center py-20">
      <div className="w-8 h-8 border-2 border-primary-500
                      border-t-transparent rounded-full animate-spin
                      mx-auto" />
    </div>
  )

  // Already applied — show status
  if (existingProfile) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <div className="w-full max-w-md animate-scale-in">
          <div className="bg-white rounded-2xl shadow-card p-8 text-center">

            {existingProfile.isVerified ? (
              <>
                <div className="text-5xl mb-4">✅</div>
                <h1 className="text-2xl font-bold text-gray-900 mb-3">
                  You're a Verified Photographer!
                </h1>
                <p className="text-gray-500 mb-6">
                  Your profile is live and customers can book you.
                </p>
                <button
                  onClick={() => navigate('/photographers')}
                  className="btn-primary w-full">
                  View My Profile
                </button>
              </>
            ) : (
              <>
                <div className="text-5xl mb-4">⏳</div>
                <h1 className="text-2xl font-bold text-gray-900 mb-3">
                  Application Under Review
                </h1>
                <p className="text-gray-500 mb-2">
                  Our team is reviewing your photographer profile.
                </p>
                <p className="text-gray-400 text-sm mb-6">
                  You'll receive a notification once verified
                  (usually within 24-48 hours).
                </p>
                <span className="badge-yellow text-sm">
                  ⏳ Pending Verification
                </span>
                <div className="mt-6">
                  <button
                    onClick={() => navigate('/')}
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
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center
                    px-4 py-8">
      <div className="w-full max-w-lg animate-scale-in">

        {/* Steps indicator */}
        <div className="flex items-center gap-3 mb-8 justify-center">
          {[
            { n: 1, label: 'Profile Info' },
            { n: 2, label: 'Portfolio' },
            { n: 3, label: 'Done' },
          ].map((s, i) => (
            <div key={s.n} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center
                               justify-center text-sm font-bold
                               transition-all
                               ${step >= s.n
                                 ? 'bg-primary-500 text-white'
                                 : 'bg-gray-200 text-gray-400'}`}>
                {step > s.n ? '✓' : s.n}
              </div>
              <span className={`text-sm font-medium hidden sm:block
                                ${step >= s.n
                                  ? 'text-primary-500'
                                  : 'text-gray-400'}`}>
                {s.label}
              </span>
              {i < 2 && (
                <div className={`w-8 h-0.5 ${
                  step > s.n ? 'bg-primary-500' : 'bg-gray-200'}`} />
              )}
            </div>
          ))}
        </div>

        {/* Step 1 — Profile Info */}
        {step === 1 && (
          <div className="bg-white rounded-2xl shadow-card p-8">
            <div className="text-center mb-6">
              <div className="text-4xl mb-3">📷</div>
              <h1 className="text-2xl font-bold text-gray-900">
                Become a Photographer
              </h1>
              <p className="text-gray-500 mt-1 text-sm">
                Tell us about yourself
              </p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600
                              rounded-xl px-4 py-3 mb-4 text-sm">
                ⚠️ {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium
                                   text-gray-700 mb-1">
                  Bio
                </label>
                <textarea
                  placeholder="Tell customers about your experience..."
                  value={form.bio}
                  onChange={e => setForm({...form, bio: e.target.value})}
                  className="input-field h-24 resize-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium
                                   text-gray-700 mb-1">
                  Specializations
                </label>
                <input
                  type="text"
                  placeholder="Wedding, Portrait, Product (comma separated)"
                  value={form.specializations}
                  onChange={e => setForm(
                    {...form, specializations: e.target.value})}
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

              <div>
                <label className="block text-sm font-medium
                                   text-gray-700 mb-1">
                  Instagram URL
                </label>
                <input
                  type="url"
                  placeholder="https://instagram.com/yourhandle"
                  value={form.instagramUrl}
                  onChange={e => setForm(
                    {...form, instagramUrl: e.target.value})}
                  className="input-field"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium
                                     text-gray-700 mb-1">
                    Price/hour (₹)
                  </label>
                  <input
                    type="number"
                    placeholder="2000"
                    value={form.pricePerHour}
                    onChange={e => setForm(
                      {...form, pricePerHour: e.target.value})}
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium
                                     text-gray-700 mb-1">
                    Price/day (₹)
                  </label>
                  <input
                    type="number"
                    placeholder="12000"
                    value={form.pricePerDay}
                    onChange={e => setForm(
                      {...form, pricePerDay: e.target.value})}
                    className="input-field"
                    required
                  />
                </div>
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
                ) : 'Continue →'}
              </button>
            </form>
          </div>
        )}

        {/* Step 2 — Portfolio Upload */}
        {step === 2 && profileId && (
          <div className="bg-white rounded-2xl shadow-card p-8">
            <div className="text-center mb-6">
              <div className="text-4xl mb-3">🖼️</div>
              <h1 className="text-2xl font-bold text-gray-900">
                Upload Portfolio
              </h1>
              <p className="text-gray-500 mt-1 text-sm">
                Show your best work (optional but recommended)
              </p>
            </div>

            <ImageUploader
              endpoint={`/upload/photographer/${profileId}/portfolio`}
              multiple={true}
              label="Upload Portfolio Photos"
              onUploadSuccess={() => {
                setStep(3)
              }}
            />

            <button
              onClick={() => setStep(3)}
              className="btn-ghost w-full mt-4 text-sm">
              Skip for now →
            </button>
          </div>
        )}

        {/* Step 3 — Done */}
        {step === 3 && (
          <div className="bg-white rounded-2xl shadow-card p-8
                          text-center animate-scale-in">
            <div className="text-5xl mb-4">🎉</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-3">
              Application Submitted!
            </h1>
            <p className="text-gray-500 mb-2">
              Our team will verify your profile within 24-48 hours.
            </p>
            <p className="text-gray-400 text-sm mb-8">
              You'll be notified once verified and can start
              accepting bookings.
            </p>

            <div className="space-y-3">
              <button
                onClick={() => navigate('/photographers')}
                className="btn-primary w-full">
                Browse Photographers
              </button>
              <button
                onClick={() => navigate('/')}
                className="btn-ghost w-full">
                Go to Home
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}