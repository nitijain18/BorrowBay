import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/axiosConfig'
import { useAuth } from '../context/AuthContext'
import ImageUploader from '../components/ImageUploader'

export default function ProfilePage() {
  const navigate = useNavigate()
  const { isLoggedIn, logout } = useAuth()

  const [user, setUser]           = useState(null)
  const [addresses, setAddresses] = useState([])
  const [loading, setLoading]     = useState(true)
  const [activeTab, setActiveTab] = useState('profile')

  // Add address form
  const [showAddressForm, setShowAddressForm] = useState(false)
  const [addressForm, setAddressForm] = useState({
    street: '', city: '', state: '',
    pincode: '', landmark: ''
  })
  const [savingAddress, setSavingAddress] = useState(false)
  const [addressSuccess, setAddressSuccess] = useState('')
  const [error, setError] = useState('')

  // Edit profile
  const [editingProfile, setEditingProfile] = useState(false)
  const [profileForm, setProfileForm] = useState({
    firstName: '', lastName: '', phoneNumber: ''
  })
  const [savingProfile, setSavingProfile] = useState(false)
  const [profileSuccess, setProfileSuccess] = useState('')

  useEffect(() => {
    if (!isLoggedIn) { navigate('/login'); return }
    fetchData()
  }, [])

  // Initialize edit form whenever user data loads/changes
  useEffect(() => {
    if (user) {
      setProfileForm({
        firstName:   user.firstName || '',
        lastName:    user.lastName || '',
        phoneNumber: user.phoneNumber || ''
      })
    }
  }, [user])

  const fetchData = async () => {
    try {
      const userData = JSON.parse(localStorage.getItem('user'))
      setUser(userData)

      const addrRes = await api.get(`/addresses/user/${userData.id}`)
      setAddresses(addrRes.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveProfile = async (e) => {
    e.preventDefault()
    setSavingProfile(true)
    try {
      const res = await api.patch(`/users/${user.id}`, profileForm)
      // Update localStorage
      const updatedUser = { ...user, ...res.data }
      localStorage.setItem('user', JSON.stringify(updatedUser))
      setUser(updatedUser)
      setEditingProfile(false)
      setProfileSuccess('Profile updated successfully!')
      setTimeout(() => setProfileSuccess(''), 3000)
    } catch (err) {
      console.error(err)
    } finally {
      setSavingProfile(false)
    }
  }

  const handleAddAddress = async (e) => {
    e.preventDefault()
    setSavingAddress(true)
    setError('')
    try {
      await api.post('/addresses', {
        ...addressForm,
        user: { id: user.id }
      })
      setAddressSuccess('Address added successfully!')
      setShowAddressForm(false)
      setAddressForm({
        street: '', city: '', state: '',
        pincode: '', landmark: ''
      })
      fetchData()
      setTimeout(() => setAddressSuccess(''), 3000)
    } catch (err) {
      setError('Failed to add address')
    } finally {
      setSavingAddress(false)
    }
  }

  const handleDeleteAddress = async (addressId) => {
    try {
      await api.delete(`/addresses/${addressId}`)
      fetchData()
    } catch (err) {
      setError('Failed to delete address')
    }
  }

  if (loading) return (
    <div className="page-container">
      <div className="animate-pulse space-y-4">
        <div className="h-32 bg-gray-200 rounded-2xl" />
        <div className="h-48 bg-gray-200 rounded-2xl" />
      </div>
    </div>
  )

  return (
    <div className="page-container animate-fade-in">

      {/* ── PROFILE HEADER ── */}
      <div className="card p-6 mb-6 flex items-center gap-6">
        <div className="w-20 h-20 bg-primary-500 rounded-full
                        flex items-center justify-center
                        text-white text-3xl font-bold overflow-hidden">
          {user?.profileImage ? (
            <img src={user.profileImage} alt=""
                 className="w-full h-full object-cover" />
          ) : (
            user?.firstName?.charAt(0).toUpperCase()
          )}
        </div>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">
            {user?.firstName} {user?.lastName}
          </h1>
          <p className="text-gray-500">{user?.email}</p>
          <p className="text-gray-500 text-sm">{user?.phoneNumber}</p>
          <span className="badge-blue mt-1 inline-block">
            {user?.role?.replace('ROLE_', '')}
          </span>
        </div>
        <button
          onClick={logout}
          className="btn-secondary text-red-500 border-red-200
                     hover:bg-red-50 text-sm">
          🚪 Logout
        </button>
      </div>

      {/* ── TABS ── */}
      <div className="flex gap-2 mb-6">
        {[
          { id: 'profile',   label: '👤 Profile' },
          { id: 'addresses', label: '📍 Addresses' },
          { id: 'orders',    label: '📋 Orders' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
              activeTab === tab.id
                ? 'bg-primary-500 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
            }`}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── PROFILE TAB ── */}
      {activeTab === 'profile' && (
        <div className="card p-6 animate-fade-in">

          {/* Profile photo upload */}
          <div className="flex items-center gap-6 mb-6
                          pb-6 border-b border-gray-100">
            <div className="relative">
              <div className="w-24 h-24 rounded-full overflow-hidden
                              bg-primary-500 flex items-center justify-center
                              text-white text-3xl font-bold">
                {user?.profileImage ? (
                  <img src={user.profileImage} alt=""
                       className="w-full h-full object-cover" />
                ) : (
                  user?.firstName?.charAt(0).toUpperCase()
                )}
              </div>
            </div>
            <div className="flex-1">
              <p className="font-semibold text-gray-900 mb-1">
                Profile Photo
              </p>
              <p className="text-gray-400 text-xs mb-3">
                Upload a clear photo of yourself
              </p>
              <ImageUploader
                endpoint={`/upload/user/${user?.id}/profile`}
                multiple={false}
                label="Change Photo"
                onUploadSuccess={(updatedUser) => {
                  setUser(updatedUser)
                  localStorage.setItem('user',
                    JSON.stringify(updatedUser))
                }}
              />
            </div>
          </div>

          {/* Success */}
          {profileSuccess && (
            <div className="bg-green-50 border border-green-200 text-green-600
                            rounded-xl px-4 py-3 mb-4 text-sm animate-fade-in">
              ✅ {profileSuccess}
            </div>
          )}

          {/* Edit toggle */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-900">Personal Information</h3>
            <button
              onClick={() => setEditingProfile(!editingProfile)}
              className="text-primary-500 text-sm hover:text-primary-600">
              {editingProfile ? 'Cancel' : '✏️ Edit'}
            </button>
          </div>

          {editingProfile ? (
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">
                    First Name
                  </label>
                  <input
                    type="text"
                    value={profileForm.firstName}
                    onChange={e => setProfileForm(
                      {...profileForm, firstName: e.target.value})}
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">
                    Last Name
                  </label>
                  <input
                    type="text"
                    value={profileForm.lastName}
                    onChange={e => setProfileForm(
                      {...profileForm, lastName: e.target.value})}
                    className="input-field"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={profileForm.phoneNumber}
                  onChange={e => setProfileForm(
                    {...profileForm, phoneNumber: e.target.value})}
                  className="input-field"
                  maxLength={10}
                />
              </div>
              <div className="flex gap-3">
                <button type="submit" disabled={savingProfile}
                        className="btn-primary flex-1">
                  {savingProfile ? 'Saving...' : 'Save Changes'}
                </button>
                <button type="button"
                        onClick={() => setEditingProfile(false)}
                        className="btn-secondary flex-1">
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'First Name',   value: user?.firstName },
                { label: 'Last Name',    value: user?.lastName },
                { label: 'Email',        value: user?.email },
                { label: 'Phone',        value: user?.phoneNumber },
                { label: 'Role',         value: user?.role?.replace('ROLE_', '') },
                { label: 'Member Since', value: new Date(user?.createdAt)
                                                .toLocaleDateString('en-IN') },
              ].map((field, i) => (
                <div key={i} className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs text-gray-400 mb-1">{field.label}</p>
                  <p className="font-medium text-gray-900">{field.value || '—'}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── ADDRESSES TAB ── */}
      {activeTab === 'addresses' && (
        <div className="animate-fade-in">

          {/* Success */}
          {addressSuccess && (
            <div className="bg-green-50 border border-green-200
                            text-green-600 rounded-xl px-4 py-3 mb-4
                            text-sm animate-fade-in">
              ✅ {addressSuccess}
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600
                            rounded-xl px-4 py-3 mb-4 text-sm">
              ⚠️ {error}
            </div>
          )}

          {/* Add address button */}
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-bold text-gray-900">
              Saved Addresses ({addresses.length})
            </h2>
            <button
              onClick={() => setShowAddressForm(!showAddressForm)}
              className="btn-primary text-sm py-2">
              + Add Address
            </button>
          </div>

          {/* Add address form */}
          {showAddressForm && (
            <div className="card p-6 mb-4 animate-scale-in">
              <h3 className="font-semibold text-gray-900 mb-4">
                New Address
              </h3>
              <form onSubmit={handleAddAddress} className="space-y-3">
                <input
                  type="text"
                  placeholder="Street address"
                  value={addressForm.street}
                  onChange={e => setAddressForm(
                    {...addressForm, street: e.target.value})}
                  className="input-field"
                  required
                />
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="City"
                    value={addressForm.city}
                    onChange={e => setAddressForm(
                      {...addressForm, city: e.target.value})}
                    className="input-field"
                    required
                  />
                  <input
                    type="text"
                    placeholder="State"
                    value={addressForm.state}
                    onChange={e => setAddressForm(
                      {...addressForm, state: e.target.value})}
                    className="input-field"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="Pincode"
                    value={addressForm.pincode}
                    onChange={e => setAddressForm(
                      {...addressForm, pincode: e.target.value})}
                    className="input-field"
                    maxLength={6}
                    required
                  />
                  <input
                    type="text"
                    placeholder="Landmark (optional)"
                    value={addressForm.landmark}
                    onChange={e => setAddressForm(
                      {...addressForm, landmark: e.target.value})}
                    className="input-field"
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={savingAddress}
                    className="btn-primary flex-1">
                    {savingAddress ? 'Saving...' : 'Save Address'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddressForm(false)}
                    className="btn-secondary flex-1">
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Addresses list */}
          {addresses.length === 0 ? (
            <div className="card p-8 text-center">
              <p className="text-3xl mb-3">📍</p>
              <p className="text-gray-500 mb-4">No saved addresses yet</p>
              <button
                onClick={() => setShowAddressForm(true)}
                className="btn-primary text-sm">
                Add Your First Address
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {addresses.map((addr, i) => (
                <div key={addr.id}
                     className="card p-4 flex items-start justify-between
                                animate-slide-up"
                     style={{ animationDelay: `${i * 0.1}s` }}>
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">📍</span>
                    <div>
                      <p className="font-medium text-gray-900">
                        {addr.street}
                      </p>
                      <p className="text-gray-500 text-sm">
                        {addr.city}, {addr.state} - {addr.pincode}
                      </p>
                      {addr.landmark && (
                        <p className="text-gray-400 text-xs">
                          Near {addr.landmark}
                        </p>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteAddress(addr.id)}
                    className="text-red-400 hover:text-red-600
                               transition-colors text-sm">
                    Delete
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── ORDERS TAB ── */}
      {activeTab === 'orders' && (
        <div className="animate-fade-in">
          <button
            onClick={() => navigate('/orders')}
            className="btn-primary">
            View My Orders
          </button>
        </div>
      )}

    </div>
  )
}