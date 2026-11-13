import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/axiosConfig'
import { useAuth } from '../context/AuthContext'

export default function SellerApplyPage() {
  const navigate = useNavigate()
  const { isLoggedIn, user } = useAuth()

  const [form, setForm] = useState({
    businessName: '', gstin: '',
    bankAccountNumber: '', ifscCode: '',
    accountHolderName: '', city: '',
    profileDescription: '',
    pickupStreet: '', pickupCity: '', pickupState: '', pickupPincode: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!isLoggedIn) { navigate('/login'); return }
    setLoading(true)
    setError('')

    try {
      // Step 1: Create address for pickup
      const addressRes = await api.post('/addresses', {
        street:  form.pickupStreet,
        city:    form.pickupCity,
        state:   form.pickupState,
        pincode: form.pickupPincode,
        user:    { id: user.id }
      })

      // Step 2: Create seller profile with address
      await api.post('/seller-profiles', {
        businessName:       form.businessName,
        gstin:              form.gstin,
        bankAccountNumber:  form.bankAccountNumber,
        ifscCode:           form.ifscCode,
        accountHolderName:  form.accountHolderName,
        city:               form.city,
        profileDescription: form.profileDescription,
        pickupAddress:      { id: addressRes.data.id },
        user:               { id: user.id }
      })

      navigate('/seller')
    } catch (err) {
      setError(err.response?.data || 'Failed to submit application')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-lg animate-scale-in">
        <div className="bg-white rounded-2xl shadow-card p-8">

          <div className="text-center mb-8">
            <div className="text-4xl mb-3">🏪</div>
            <h1 className="text-2xl font-bold text-gray-900">
              Apply to Sell
            </h1>
            <p className="text-gray-500 mt-1">
              Fill in your business details to get started
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600
                            rounded-xl px-4 py-3 mb-6 text-sm">
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              placeholder="Business name"
              value={form.businessName}
              onChange={e => setForm({...form, businessName: e.target.value})}
              className="input-field"
              required
            />
            <input
              type="text"
              placeholder="City"
              value={form.city}
              onChange={e => setForm({...form, city: e.target.value})}
              className="input-field"
              required
            />
            <textarea
              placeholder="Tell us about your business"
              value={form.profileDescription}
              onChange={e => setForm(
                {...form, profileDescription: e.target.value})}
              className="input-field h-20 resize-none"
            />
            <div className="grid grid-cols-2 gap-3">
              <input
                type="text"
                placeholder="Bank account number"
                value={form.bankAccountNumber}
                onChange={e => setForm(
                  {...form, bankAccountNumber: e.target.value})}
                className="input-field"
                required
              />
              <input
                type="text"
                placeholder="IFSC code"
                value={form.ifscCode}
                onChange={e => setForm({...form, ifscCode: e.target.value})}
                className="input-field"
                required
              />
            </div>
            <input
              type="text"
              placeholder="Account holder name"
              value={form.accountHolderName}
              onChange={e => setForm(
                {...form, accountHolderName: e.target.value})}
              className="input-field"
              required
            />
            <input
              type="text"
              placeholder="GSTIN (optional)"
              value={form.gstin}
              onChange={e => setForm({...form, gstin: e.target.value})}
              className="input-field"
            />

            {/* Pickup Address */}
            <div className="border-t border-gray-100 pt-4 mt-4">
              <p className="text-sm font-semibold text-gray-700 mb-3">
                📍 Pickup Address (where delivery partners collect items)
              </p>
              <input
                type="text"
                placeholder="Street address"
                value={form.pickupStreet}
                onChange={e => setForm({...form, pickupStreet: e.target.value})}
                className="input-field mb-3"
                required
              />
              <div className="grid grid-cols-2 gap-3 mb-3">
                <input
                  type="text"
                  placeholder="City"
                  value={form.pickupCity}
                  onChange={e => setForm({...form, pickupCity: e.target.value})}
                  className="input-field"
                  required
                />
                <input
                  type="text"
                  placeholder="State"
                  value={form.pickupState}
                  onChange={e => setForm({...form, pickupState: e.target.value})}
                  className="input-field"
                  required
                />
              </div>
              <input
                type="text"
                placeholder="Pincode"
                value={form.pickupPincode}
                onChange={e => setForm({...form, pickupPincode: e.target.value})}
                className="input-field"
                maxLength={6}
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