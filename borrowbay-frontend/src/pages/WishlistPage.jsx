import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/axiosConfig'
import { useAuth } from '../context/AuthContext'

export default function WishlistPage() {
  const navigate = useNavigate()
  const { isLoggedIn } = useAuth()

  const [wishlist, setWishlist] = useState(null)
  const [loading, setLoading]   = useState(true)
  const [removing, setRemoving] = useState(null)

  useEffect(() => {
    if (!isLoggedIn) { navigate('/login'); return }
    fetchWishlist()
  }, [])

  const fetchWishlist = async () => {
    try {
      const userData = JSON.parse(localStorage.getItem('user'))
      const res = await api.get(`/wishlist/user/${userData.id}`)
      setWishlist(res.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleRemove = async (itemId) => {
    setRemoving(itemId)
    try {
      const userData = JSON.parse(localStorage.getItem('user'))
      await api.put(`/wishlist/user/${userData.id}/remove-item/${itemId}`)
      fetchWishlist()
    } catch (err) {
      console.error(err)
    } finally {
      setRemoving(null)
    }
  }

  const handleClear = async () => {
    try {
      const userData = JSON.parse(localStorage.getItem('user'))
      await api.delete(`/wishlist/user/${userData.id}/clear`)
      fetchWishlist()
    } catch (err) {
      console.error(err)
    }
  }

  if (loading) return (
    <div className="page-container">
      <div className="grid grid-cols-4 gap-6 animate-pulse">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-64 bg-gray-200 rounded-2xl" />
        ))}
      </div>
    </div>
  )

  const items = wishlist?.items || []

  return (
    <div className="page-container animate-fade-in">

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="section-title">❤️ My Wishlist</h1>
          <p className="text-gray-500 mt-1">
            {items.length} saved item{items.length !== 1 ? 's' : ''}
          </p>
        </div>
        {items.length > 0 && (
          <button
            onClick={handleClear}
            className="text-red-500 text-sm hover:text-red-600
                       transition-colors">
            Clear all
          </button>
        )}
      </div>

      {/* Empty state */}
      {items.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-6xl mb-4">❤️</p>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            Your wishlist is empty
          </h3>
          <p className="text-gray-400 mb-6">
            Save items you love to rent later
          </p>
          <button
            onClick={() => navigate('/items')}
            className="btn-primary">
            Browse Items
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2
                        md:grid-cols-3 lg:grid-cols-4 gap-6">
          {items.map((item, i) => (
            <div
              key={item.id}
              className="card overflow-hidden animate-slide-up group"
              style={{ animationDelay: `${i * 0.1}s` }}>

              {/* Image */}
              <div className="relative h-48 bg-gray-100 overflow-hidden
                              cursor-pointer"
                   onClick={() => navigate(`/items/${item.id}`)}>
                {item.images?.[0] ? (
                  <img
                    src={item.images[0]}
                    alt={item.title}
                    className="w-full h-full object-cover
                               group-hover:scale-105
                               transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center
                                  justify-center text-4xl text-gray-200">
                    📦
                  </div>
                )}

                {/* Condition badge */}
                <span className="absolute top-3 left-3 bg-white/90
                                 backdrop-blur-sm text-xs font-medium
                                 px-2 py-1 rounded-lg text-gray-600">
                  {item.condition?.replace('_', ' ')}
                </span>

                {/* Remove button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleRemove(item.id)
                  }}
                  disabled={removing === item.id}
                  className="absolute top-3 right-3 w-8 h-8
                             bg-white/90 backdrop-blur-sm rounded-full
                             flex items-center justify-center
                             text-red-400 hover:text-red-600
                             hover:bg-white transition-all">
                  {removing === item.id ? (
                    <div className="w-3 h-3 border border-red-400
                                    border-t-transparent rounded-full
                                    animate-spin" />
                  ) : '♥'}
                </button>
              </div>

              {/* Details */}
              <div className="p-4">
                <h3
                  onClick={() => navigate(`/items/${item.id}`)}
                  className="font-semibold text-gray-900 mb-1
                             truncate cursor-pointer
                             hover:text-primary-500 transition-colors">
                  {item.title}
                </h3>
                <p className="text-gray-400 text-xs mb-3">
                  {item.subCategory?.name} •{' '}
                  {item.subCategory?.category?.name}
                </p>

                <div className="flex items-center justify-between mb-3">
                  <div>
                    <span className="text-primary-500 font-bold text-lg">
                      ₹{item.rentPricePerDay}
                    </span>
                    <span className="text-gray-400 text-xs">/day</span>
                  </div>
                  {item.totalReviews > 0 && (
                    <div className="flex items-center gap-1">
                      <span className="text-yellow-400 text-sm">⭐</span>
                      <span className="text-gray-600 text-sm font-medium">
                        {item.averageRating?.toFixed(1)}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => navigate(`/items/${item.id}`)}
                    className="flex-1 bg-primary-50 text-primary-600
                               py-2 rounded-lg text-sm font-medium
                               hover:bg-primary-500 hover:text-white
                               transition-all duration-200">
                    Rent Now
                  </button>
                  <button
                    onClick={() => handleRemove(item.id)}
                    className="px-3 py-2 rounded-lg text-sm
                               text-red-400 hover:bg-red-50
                               transition-colors">
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}