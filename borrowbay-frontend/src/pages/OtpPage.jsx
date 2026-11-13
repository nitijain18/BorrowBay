import { useState, useEffect, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import api from '../api/axiosConfig'

export default function OtpPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const email = searchParams.get('email') || ''

  const [otp, setOtp]         = useState(['', '', '', '', '', ''])
  const [loading, setLoading] = useState(false)
  const [sending, setSending] = useState(false)
  const [error, setError]     = useState('')
  const [success, setSuccess] = useState('')
  const [timer, setTimer]     = useState(60)

  const inputRefs    = useRef([])
  const hasSentOtp   = useRef(false)  // ← prevents double send

  // Send OTP once on page load — guard prevents StrictMode double call
  useEffect(() => {
    if (email && !hasSentOtp.current) {
      hasSentOtp.current = true
      sendOtp()
    }
  }, [])

  // Countdown timer
  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => setTimer(t => t - 1), 1000)
      return () => clearInterval(interval)
    }
  }, [timer])

  const sendOtp = async () => {
    setSending(true)
    setError('')
    try {
      await api.post(`/otp/send?email=${email}`)
      setSuccess(`OTP sent to ${email}`)
      setTimer(60)
    } catch (err) {
      setError('Failed to send OTP. Please try again.')
    } finally {
      setSending(false)
    }
  }

  const handleOtpChange = (index, value) => {
    if (value.length > 1) return

    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)
    setError('')

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const otpString = otp.join('')

    if (otpString.length !== 6) {
      setError('Please enter all 6 digits')
      return
    }

    setLoading(true)
    setError('')

    try {
      await api.post(`/otp/verify?email=${email}&otp=${otpString}`)
      setSuccess('Email verified! Redirecting to login...')
      setTimeout(() => navigate('/login'), 1500)
    } catch (err) {
      setError(err.response?.data || 'Invalid OTP. Please try again.')
      setOtp(['', '', '', '', '', ''])
      inputRefs.current[0]?.focus()
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md animate-scale-in">

        <div className="bg-white rounded-2xl shadow-card p-8">

          {/* Header */}
          <div className="text-center mb-8">
            <div className="text-4xl mb-3">📧</div>
            <h1 className="text-2xl font-bold text-gray-900">
              Verify your email
            </h1>
            <p className="text-gray-500 mt-2 text-sm">
              We sent a 6-digit code to
            </p>
            <p className="text-primary-500 font-semibold mt-1">
              {email}
            </p>
          </div>

          {/* Success */}
          {success && (
            <div className="bg-green-50 border border-green-200
                            text-green-600 rounded-xl px-4 py-3 mb-6
                            text-sm animate-fade-in">
              ✅ {success}
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600
                            rounded-xl px-4 py-3 mb-6 text-sm animate-fade-in">
              ⚠️ {error}
            </div>
          )}

          {/* OTP inputs */}
          <form onSubmit={handleSubmit}>
            <div className="flex gap-3 justify-center mb-8">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={el => inputRefs.current[index] = el}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={e => handleOtpChange(index, e.target.value)}
                  onKeyDown={e => handleKeyDown(index, e)}
                  className="w-12 h-12 text-center text-xl font-bold
                             border-2 border-gray-200 rounded-xl
                             focus:outline-none focus:border-primary-500
                             focus:ring-2 focus:ring-primary-100
                             transition-all duration-200"
                />
              ))}
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
                  Verifying...
                </>
              ) : 'Verify OTP'}
            </button>
          </form>

          {/* Resend */}
          <div className="text-center mt-6">
            {timer > 0 ? (
              <p className="text-gray-500 text-sm">
                Resend OTP in{' '}
                <span className="text-primary-500 font-semibold">
                  {timer}s
                </span>
              </p>
            ) : (
              <button
                onClick={sendOtp}
                disabled={sending}
                className="text-primary-500 font-semibold text-sm
                           hover:text-primary-600 transition-colors">
                {sending ? 'Sending...' : 'Resend OTP'}
              </button>
            )}
          </div>

          {/* Back to signup */}
          <div className="text-center mt-4">
            <button
              onClick={() => navigate('/signup')}
              className="text-gray-400 text-sm hover:text-gray-600
                         transition-colors">
              ← Back to signup
            </button>
          </div>

        </div>
      </div>
    </div>
  )
}