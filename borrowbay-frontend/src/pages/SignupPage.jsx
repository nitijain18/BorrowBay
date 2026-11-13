import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../api/axiosConfig'

export default function SignupPage() {
  const navigate = useNavigate()

  const [form, setForm] = useState({
    firstName:   '',
    lastName:    '',
    email:       '',
    password:    '',
    phoneNumber: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // Call Spring Boot signup endpoint
      await api.post('/users/signup', {
        firstName:   form.firstName,
        lastName:    form.lastName,
        email:       form.email,
        password:    form.password,
        phoneNumber: form.phoneNumber
      })

      // After signup → go to OTP page to verify email
      // Pass email via URL so OTP page knows which email to verify
      navigate(`/otp?email=${form.email}`)

    } catch (err) {
      setError(err.response?.data || 'Signup failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md animate-scale-in">

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-card p-8">

          {/* Header */}
          <div className="text-center mb-8">
            <div className="text-4xl mb-3">🎉</div>
            <h1 className="text-2xl font-bold text-gray-900">
              Create account
            </h1>
            <p className="text-gray-500 mt-1">
              Join BorrowBay and start renting
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600
                            rounded-xl px-4 py-3 mb-6 text-sm animate-fade-in">
              ⚠️ {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">

            {/* First + Last name row */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  First name
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={form.firstName}
                  onChange={handleChange}
                  placeholder="Rakesh"
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Last name
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={form.lastName}
                  onChange={handleChange}
                  placeholder="Prajapati"
                  className="input-field"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email address
              </label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="rakesh@gmail.com"
                className="input-field"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone number
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2
                                 text-gray-500 text-sm font-medium">
                  +91
                </span>
                <input
                  type="tel"
                  name="phoneNumber"
                  value={form.phoneNumber}
                  onChange={handleChange}
                  placeholder="9876543210"
                  className="input-field pl-12"
                  maxLength={10}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Min 6 characters"
                className="input-field"
                minLength={6}
                required
              />
            </div>

            {/* Terms */}
            <p className="text-xs text-gray-400 text-center">
              By signing up you agree to our{' '}
              <span className="text-primary-500 cursor-pointer">
                Terms of Service
              </span>{' '}
              and{' '}
              <span className="text-primary-500 cursor-pointer">
                Privacy Policy
              </span>
            </p>

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
                  Creating account...
                </>
              ) : 'Create Account'}
            </button>

          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-gray-400 text-sm">or</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          {/* Login link */}
          <p className="text-center text-gray-600 text-sm">
            Already have an account?{' '}
            <Link to="/login"
                  className="text-primary-500 font-semibold
                             hover:text-primary-600">
              Login
            </Link>
          </p>

        </div>
      </div>
    </div>
  )
}