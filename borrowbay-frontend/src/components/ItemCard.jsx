import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/axiosConfig'
import { useAuth } from '../context/AuthContext'

export default function ItemCard({ item, index = 0 }) {
  const navigate = useNavigate()
  const { isLoggedIn } = useAuth()

  const [inWishlist, setInWishlist]             = useState(false)
  const [togglingWishlist, setTogglingWishlist] = useState(false)

  const handleWishlist = async (e) => {
    e.stopPropagation() // prevent card click
    if (!isLoggedIn) { navigate('/login'); return }

    setTogglingWishlist(true)
    try {
      const userData = JSON.parse(localStorage.getItem('user'))
      if (inWishlist) {
        await api.put(`/wishlist/user/${userData.id}/remove-item/${item.id}`)
        setInWishlist(false)
      } else {
        await api.put(`/wishlist/user/${userData.id}/add-item/${item.id}`)
        setInWishlist(true)
      }
    } catch (err) {
      console.error('Wishlist error:', err.response?.data)
    } finally {
      setTogglingWishlist(false)
    }
  }

  return (
    <div
      onClick={() => navigate(`/items/${item.id}`)}
      className="card cursor-pointer overflow-hidden animate-slide-up group"
      style={{ animationDelay: `${index * 0.05}s` }}>

      {/* Image */}
      <div className="relative h-48 bg-gray-100 overflow-hidden">
        {item.images?.[0] ? (
          <img
            src={item.images[0]}
            alt={item.title}
            className="w-full h-full object-cover
                       group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center
                          justify-center text-5xl text-gray-200">
            📦
          </div>
        )}

        {/* Condition badge */}
        <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm
                         text-xs font-medium px-2 py-1 rounded-lg text-gray-600">
          {item.condition?.replace('_', ' ')}
        </span>

        {/* Wishlist heart button — WIRED UP */}
        <button
          onClick={handleWishlist}
          disabled={togglingWishlist}
          className={`absolute top-3 right-3 w-8 h-8
                      rounded-full flex items-center justify-center
                      transition-all duration-200 text-sm
                      ${inWishlist
                        ? 'bg-red-500 text-white'
                        : 'bg-white/90 text-gray-400 hover:text-red-500'}`}>
          {togglingWishlist ? (
            <div className="w-3 h-3 border border-current
                            border-t-transparent rounded-full animate-spin" />
          ) : inWishlist ? '♥' : '♡'}
        </button>
      </div>

      {/* Details */}
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 mb-1 truncate">
          {item.title}
        </h3>
        <p className="text-gray-400 text-xs mb-3 truncate">
          {item.subCategory?.name} • {item.subCategory?.category?.name}
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

        <div className="flex items-center justify-between text-xs text-gray-400 mb-3">
          <span>Deposit: ₹{item.securityDeposit}</span>
        </div>

        <button className="w-full bg-primary-50 text-primary-600
                           py-2 rounded-lg text-sm font-medium
                           hover:bg-primary-500 hover:text-white
                           transition-all duration-200">
          View Details
        </button>
      </div>
    </div>
  )
}