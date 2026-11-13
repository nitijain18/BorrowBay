import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../api/axiosConfig'
import { useAuth } from '../context/AuthContext'

export default function LoginPage() {
  const navigate  = useNavigate()
  const { login } = useAuth()

  const [form, setForm]       = useState({ email: '', password: '' })
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
      // Call Spring Boot login endpoint
      const response = await api.post('/users/login', {
        email:    form.email,
        password: form.password
      })

      const { jwt, role } = response.data

      // Save minimal user data — no extra API call needed
      const userData = {
        email: form.email,
        role:  role,
      }

      // Save to context + localStorage
      login(userData, jwt)

      // Redirect based on role
      if (role === 'ROLE_ADMIN')       navigate('/admin')
      else if (role === 'ROLE_SELLER') navigate('/seller')
      else                             navigate('/')

    } catch (err) {
      setError(err.response?.data || 'Invalid email or password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md animate-scale-in">

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-card p-8">

          {/* Header */}
          <div className="text-center mb-8">
            <div className="text-4xl mb-3">🔐</div>
            <h1 className="text-2xl font-bold text-gray-900">
              Welcome back
            </h1>
            <p className="text-gray-500 mt-1">
              Login to your BorrowBay account
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
                Password
              </label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Enter your password"
                className="input-field"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center
                         justify-center gap-2 mt-2">
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white
                                  border-t-transparent rounded-full
                                  animate-spin" />
                  Logging in...
                </>
              ) : 'Login'}
            </button>

          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-gray-400 text-sm">or</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          {/* Signup link */}
          <p className="text-center text-gray-600 text-sm">
            Don't have an account?{' '}
            <Link to="/signup"
                  className="text-primary-500 font-semibold
                             hover:text-primary-600">
              Sign up free
            </Link>
          </p>

        </div>

      </div>
    </div>
  )
}