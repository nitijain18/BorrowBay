import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../api/axiosConfig'

export default function Navbar() {
  const { isLoggedIn, user, logout } = useAuth()
  const [menuOpen, setMenuOpen]       = useState(false)
  const [jobsOpen, setJobsOpen]       = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [unreadCount, setUnreadCount] = useState(0)
  const [cartCount, setCartCount]     = useState(0)
  const navigate = useNavigate()

  useEffect(() => {
    if (isLoggedIn && user?.id) {
      fetchUnreadCount()
      fetchCartCount()
      const interval = setInterval(() => {
        fetchUnreadCount()
        fetchCartCount()
      }, 30000)
      return () => clearInterval(interval)
    }
  }, [isLoggedIn, user])

  const fetchUnreadCount = async () => {
    try {
      const res = await api.get(`/notifications/user/${user.id}/unread`)
      setUnreadCount(res.data.length)
    } catch (err) {
      console.warn('Failed to fetch unread count', err)
    }
  }

  const fetchCartCount = async () => {
    try {
      const res = await api.get(`/cart/user/${user.id}`)
      setCartCount(res.data?.cartItems?.length || 0)
    } catch (err) {
      console.warn('Failed to fetch cart count', err)
    }
  }

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/items?search=${searchQuery}`)
      setSearchQuery('')
    }
  }

  const getJobOptions = () => {
    const role = user?.role
    return [
      {
        icon: '🏪',
        title: 'Seller',
        desc: 'List items and earn',
        action: () => navigate(role === 'ROLE_SELLER' ? '/seller' : '/seller/apply'),
        label: role === 'ROLE_SELLER' ? 'Go to Dashboard →' : 'Apply Now',
        isActive: role === 'ROLE_SELLER',
      },
      {
        icon: '📷',
        title: 'Photographer',
        desc: 'Offer photo services',
        action: () => navigate(role === 'ROLE_PHOTOGRAPHER' ? '/photographer/bookings' : '/photographer/apply'),
        label: role === 'ROLE_PHOTOGRAPHER' ? 'My Bookings →' : 'Apply Now',
        isActive: role === 'ROLE_PHOTOGRAPHER',
      },
      {
        icon: '🚚',
        title: 'Delivery Partner',
        desc: 'Deliver and earn',
        action: () => navigate(role === 'ROLE_DELIVERY_PARTNER' ? '/delivery/dashboard' : '/delivery/apply'),
        label: role === 'ROLE_DELIVERY_PARTNER' ? 'My Dashboard →' : 'Apply Now',
        isActive: role === 'ROLE_DELIVERY_PARTNER',
      },
    ]
  }

  const isShopperRole = user?.role === 'ROLE_CUSTOMER' || user?.role === 'ROLE_SELLER'

  return (
    <>
      {/* MAIN NAVBAR */}
      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-4">

            <Link to="/" className="flex items-center gap-2 flex-shrink-0">
              <span className="text-2xl">🏪</span>
              <span className="text-xl font-bold text-primary-600">BorrowBay</span>
            </Link>

            <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md">
              <div className="relative w-full">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search cameras, bikes, clothes..."
                  className="input-field pr-10 text-sm py-2"
                />
                <button type="submit"
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary-500">
                  🔍
                </button>
              </div>
            </form>

            <div className="hidden md:flex items-center gap-1">

              <button
  onClick={() => {
    if (window.location.pathname === '/') {
      // Already on home page — scroll to section
      document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' })
    } else {
      // Navigate to home then scroll
      navigate('/')
      setTimeout(() => {
        document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' })
      }, 500)
    }
  }}
  className="btn-ghost text-sm">
  About
</button>

              <div className="relative">
                <button
                  onClick={() => { setJobsOpen(!jobsOpen); setMenuOpen(false) }}
                  className="btn-ghost text-sm flex items-center gap-1">
                  💼 Jobs <span className="text-xs">▼</span>
                </button>

                {jobsOpen && (
                  <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-gray-100 animate-scale-in z-50 p-2">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide px-3 py-2">
                      Earn with BorrowBay
                    </p>
                    {getJobOptions().map((job, i) => (
                      <button
                        key={i}
                        onClick={() => { job.action(); setJobsOpen(false) }}
                        className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-colors text-left ${job.isActive ? 'bg-primary-50 border border-primary-200' : 'hover:bg-gray-50'}`}>
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0 ${job.isActive ? 'bg-primary-500' : 'bg-gray-100'}`}>
                          {job.icon}
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900 text-sm">{job.title}</p>
                          <p className="text-gray-400 text-xs">{job.desc}</p>
                        </div>
                        <span className={`text-xs font-medium px-2 py-1 rounded-lg ${job.isActive ? 'bg-primary-500 text-white' : 'bg-gray-100 text-gray-500'}`}>
                          {job.label}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {user?.role !== 'ROLE_PHOTOGRAPHER' && (
                <Link to="/photographers" className="btn-ghost text-sm">
                  📷 Photographers
                </Link>
              )}

              {isLoggedIn ? (
                <>
                  <Link to="/notifications" className="relative btn-ghost p-2">
                    🔔
                    {unreadCount > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold leading-none">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </Link>

                  <div className="relative">
                    <button
                      onClick={() => { setMenuOpen(!menuOpen); setJobsOpen(false) }}
                      className="flex items-center gap-2 btn-ghost pl-2">
                      <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center text-white text-sm font-bold overflow-hidden">
                        {user?.profileImage ? (
                          <img src={user.profileImage} alt="" className="w-full h-full object-cover" />
                        ) : user?.firstName?.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-sm font-medium max-w-20 truncate">{user?.firstName}</span>
                      <span className="text-xs text-gray-400">▼</span>
                    </button>

                    {menuOpen && (
                      <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 animate-scale-in z-50">
                        <div className="p-2">
                          <div className="px-3 py-2 mb-1">
                            <p className="text-xs text-gray-400">Logged in as</p>
                            <p className="text-sm font-semibold text-gray-900">{user?.firstName} {user?.lastName}</p>
                            <span className="badge-blue text-xs mt-1 inline-block">
                              {user?.role?.replace('ROLE_', '')}
                            </span>
                          </div>
                          <hr className="border-gray-100 mb-1" />

                          <Link to="/profile" onClick={() => setMenuOpen(false)}
                                className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-50 text-sm text-gray-700 transition-colors">
                            👤 My Profile
                          </Link>

                          {isShopperRole && (
                            <>
                              <Link to="/wishlist" onClick={() => setMenuOpen(false)}
                                    className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-50 text-sm text-gray-700 transition-colors">
                                ❤️ Wishlist
                              </Link>
                              <Link to="/cart" onClick={() => setMenuOpen(false)}
                                    className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-50 text-sm text-gray-700 transition-colors">
                                🛒 Cart {cartCount > 0 && `(${cartCount})`}
                              </Link>
                              <Link to="/orders" onClick={() => setMenuOpen(false)}
                                    className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-50 text-sm text-gray-700 transition-colors">
                                📋 My Orders
                              </Link>
                            </>
                          )}

                          <Link to="/notifications" onClick={() => setMenuOpen(false)}
                                className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-50 text-sm text-gray-700 transition-colors">
                            🔔 Notifications
                            {unreadCount > 0 && (
                              <span className="ml-auto bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                                {unreadCount}
                              </span>
                            )}
                          </Link>

                          {user?.role === 'ROLE_SELLER' && (
                            <Link to="/seller" onClick={() => setMenuOpen(false)}
                                  className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-50 text-sm text-gray-700 transition-colors">
                              🏪 Seller Dashboard
                            </Link>
                          )}
                          {user?.role === 'ROLE_PHOTOGRAPHER' && (
                            <Link to="/photographer/bookings" onClick={() => setMenuOpen(false)}
                                  className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-50 text-sm text-gray-700 transition-colors">
                              📷 My Bookings
                            </Link>
                          )}
                          {user?.role === 'ROLE_DELIVERY_PARTNER' && (
                            <Link to="/delivery/dashboard" onClick={() => setMenuOpen(false)}
                                  className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-50 text-sm text-gray-700 transition-colors">
                              🚚 My Deliveries
                            </Link>
                          )}
                          {user?.isAdmin && (
                            <Link to="/admin" onClick={() => setMenuOpen(false)}
                                  className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-50 text-sm text-gray-700 transition-colors">
                              ⚙️ Admin Dashboard
                            </Link>
                          )}

                          <hr className="my-1 border-gray-100" />
                          <button
                            onClick={() => { logout(); setMenuOpen(false) }}
                            className="flex items-center gap-2 px-3 py-2 w-full rounded-lg hover:bg-red-50 text-sm text-red-600 transition-colors">
                            🚪 Logout
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <Link to="/login" className="btn-ghost text-sm">Login</Link>
                  <Link to="/signup" className="btn-primary text-sm py-2">Sign Up</Link>
                </>
              )}
            </div>

            <button className="md:hidden btn-ghost p-2" onClick={() => setMenuOpen(!menuOpen)}>
              ☰
            </button>
          </div>
        </div>

        {(menuOpen || jobsOpen) && (
          <div className="fixed inset-0 z-40" onClick={() => { setMenuOpen(false); setJobsOpen(false) }} />
        )}
      </nav>

      {/* SUB NAVBAR - Customer/Seller */}
      {isLoggedIn && isShopperRole && (
        <div className="bg-primary-50 border-b border-primary-100 sticky top-16 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-center md:justify-end gap-2 py-2.5 flex-wrap">

              <Link to="/items"
                    className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm font-semibold text-gray-700 bg-white hover:bg-primary-100 hover:text-primary-700 transition-all duration-200 shadow-sm">
                🏷️ Browse Items
              </Link>

              <Link to="/wishlist"
                    className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm font-semibold text-gray-700 bg-white hover:bg-primary-100 hover:text-primary-700 transition-all duration-200 shadow-sm">
                ❤️ Wishlist
              </Link>

              <Link to="/cart"
                    className="relative flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm font-semibold text-gray-700 bg-white hover:bg-primary-100 hover:text-primary-700 transition-all duration-200 shadow-sm">
                🛒 Cart
                {cartCount > 0 && (
                  <span className="bg-primary-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold leading-none">
                    {cartCount > 9 ? '9+' : cartCount}
                  </span>
                )}
              </Link>

              <Link to="/orders"
                    className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm font-semibold text-gray-700 bg-white hover:bg-primary-100 hover:text-primary-700 transition-all duration-200 shadow-sm">
                📋 My Orders
              </Link>

              {user?.role === 'ROLE_SELLER' && (
                <Link to="/seller"
                      className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm font-semibold text-white bg-primary-500 hover:bg-primary-600 transition-all duration-200 shadow-sm">
                  🏪 Seller Dashboard
                </Link>
              )}
            </div>
          </div>
        </div>
      )}

      {/* SUB NAVBAR - Photographer */}
      {isLoggedIn && user?.role === 'ROLE_PHOTOGRAPHER' && (
        <div className="bg-purple-50 border-b border-purple-100 sticky top-16 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-center md:justify-end gap-2 py-2.5">
              <Link to="/photographers"
                    className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm font-semibold text-gray-700 bg-white hover:bg-purple-100 hover:text-purple-700 transition-all duration-200 shadow-sm">
                📷 Browse Photographers
              </Link>
              <Link to="/photographer/bookings"
                    className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm font-semibold text-white bg-purple-500 hover:bg-purple-600 transition-all duration-200 shadow-sm">
                📅 My Bookings
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* SUB NAVBAR - Delivery Partner */}
      {isLoggedIn && user?.role === 'ROLE_DELIVERY_PARTNER' && (
        <div className="bg-green-50 border-b border-green-100 sticky top-16 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-center md:justify-end gap-2 py-2.5">
              <Link to="/delivery/dashboard"
                    className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm font-semibold text-white bg-green-500 hover:bg-green-600 transition-all duration-200 shadow-sm">
                🚚 My Deliveries
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* SUB NAVBAR - Admin */}
      {isLoggedIn && user?.isAdmin && (
        <div className="bg-gray-900 border-b border-gray-800 sticky top-16 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-center md:justify-end gap-2 py-2.5">
              <Link to="/admin"
                    className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm font-semibold text-white bg-gray-700 hover:bg-gray-600 transition-all duration-200">
                ⚙️ Admin Dashboard
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* MOBILE MENU */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 shadow-lg z-50 animate-slide-down">
          <div className="p-4 space-y-2">
            <form onSubmit={handleSearch} className="mb-3">
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search items..."
                className="input-field text-sm"
              />
            </form>

            <Link to="/items" onClick={() => setMenuOpen(false)} className="block btn-ghost text-left">
              🏷️ Browse Items
            </Link>
            <Link to="/photographers" onClick={() => setMenuOpen(false)} className="block btn-ghost text-left">
              📷 Photographers
            </Link>
            <button
  onClick={() => {
    setMenuOpen(false)
    if (window.location.pathname === '/') {
      document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' })
    } else {
      navigate('/')
      setTimeout(() => {
        document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' })
      }, 500)
    }
  }}
  className="block btn-ghost text-left w-full">
  ℹ️ About
</button>

            {isLoggedIn ? (
              <>
                <hr className="border-gray-100" />
                <Link to="/profile" onClick={() => setMenuOpen(false)} className="block btn-ghost text-left">
                  👤 Profile
                </Link>
                {isShopperRole && (
                  <>
                    <Link to="/cart" onClick={() => setMenuOpen(false)} className="block btn-ghost text-left">
                      🛒 Cart {cartCount > 0 && `(${cartCount})`}
                    </Link>
                    <Link to="/orders" onClick={() => setMenuOpen(false)} className="block btn-ghost text-left">
                      📋 Orders
                    </Link>
                    <Link to="/wishlist" onClick={() => setMenuOpen(false)} className="block btn-ghost text-left">
                      ❤️ Wishlist
                    </Link>
                  </>
                )}
                <Link to="/notifications" onClick={() => setMenuOpen(false)} className="block btn-ghost text-left">
                  🔔 Notifications {unreadCount > 0 && `(${unreadCount})`}
                </Link>

                <hr className="border-gray-100" />
                <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide px-4">Jobs</p>
                {getJobOptions().map((job, i) => (
                  <button key={i}
                          onClick={() => { job.action(); setMenuOpen(false) }}
                          className="w-full btn-ghost text-left flex items-center gap-2">
                    {job.icon} {job.title}
                    <span className="text-xs text-gray-400 ml-auto">{job.label}</span>
                  </button>
                ))}

                <hr className="border-gray-100" />
                <button onClick={() => { logout(); setMenuOpen(false) }}
                        className="block btn-ghost text-left text-red-600 w-full">
                  🚪 Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={() => setMenuOpen(false)} className="block btn-ghost text-left">
                  Login
                </Link>
                <Link to="/signup" onClick={() => setMenuOpen(false)} className="block btn-primary text-center">
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </>
  )
}