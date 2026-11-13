import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/axiosConfig'

export default function PhotographersPage() {
  const navigate = useNavigate()

  const [photographers, setPhotographers] = useState([])
  const [loading, setLoading]             = useState(true)
  const [searchCity, setSearchCity]       = useState('')
  const [allCities, setAllCities]         = useState([])

  useEffect(() => { fetchPhotographers() }, [])

  const fetchPhotographers = async () => {
    setLoading(true)
    try {
      const res = await api.get('/photographer-profiles/available')
      setPhotographers(res.data)
      // Extract unique cities
      const cities = [...new Set(res.data.map(p => p.city).filter(Boolean))]
      setAllCities(cities)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const fetchByCity = async (city) => {
    if (!city) { fetchPhotographers(); return }
    setLoading(true)
    try {
      const res = await api.get(`/photographer-profiles/city/${city}`)
      setPhotographers(res.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleCityChange = (city) => {
    setSearchCity(city)
    fetchByCity(city)
  }

  if (loading) return (
    <div className="page-container">
      <div className="grid grid-cols-3 gap-6 animate-pulse">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-64 bg-gray-200 rounded-2xl" />
        ))}
      </div>
    </div>
  )

  return (
    <div className="page-container animate-fade-in">

      {/* Header */}
      <div className="mb-8">
        <h1 className="section-title mb-2">📷 Photographers</h1>
        <p className="text-gray-500">
          Book professional photographers for your events
        </p>
      </div>

      {/* City filter */}
      <div className="flex flex-wrap gap-2 mb-8">
        <button
          onClick={() => handleCityChange('')}
         className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${!searchCity ? 'bg-primary-500 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}>
          All Cities
        </button>
        {allCities.map(city => (
          <button
            key={city}
            onClick={() => handleCityChange(city)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${searchCity === city ? 'bg-primary-500 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}>
            📍 {city}
          </button>
        ))}
      </div>

      {/* Empty state */}
      {photographers.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-5xl mb-4">📷</p>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            No photographers available
          </h3>
          <p className="text-gray-400 mb-6">
            {searchCity
              ? `No photographers in ${searchCity}`
              : 'Check back soon'}
          </p>
          <button
            onClick={() => navigate('/photographer/apply')}
            className="btn-primary">
            Become a Photographer
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2
                        lg:grid-cols-3 gap-6">
          {photographers.map((photographer, i) => (
            <PhotographerCard
              key={photographer.id}
              photographer={photographer}
              index={i}
              onClick={() => navigate(`/photographers/${photographer.id}`)}
            />
          ))}
        </div>
      )}

      {/* Become a photographer CTA */}
      <div className="mt-12 bg-gradient-to-r from-primary-500
                      to-primary-700 rounded-3xl p-8 text-center
                      text-white">
        <h2 className="text-2xl font-bold mb-3">
          Are you a photographer?
        </h2>
        <p className="text-primary-100 mb-6">
          Join BorrowBay and get bookings from customers near you
        </p>
        <button
          onClick={() => navigate('/photographer/apply')}
          className="bg-white text-primary-600 px-6 py-3 rounded-xl
                     font-bold hover:bg-primary-50 transition-all
                     active:scale-95">
          Apply Now →
        </button>
      </div>

    </div>
  )
}

function PhotographerCard({ photographer, index, onClick }) {
  return (
    <div
      onClick={onClick}
      className="card cursor-pointer overflow-hidden animate-slide-up
                 group"
      style={{ animationDelay: `${index * 0.1}s` }}>

      {/* Portfolio preview */}
      <div className="h-48 bg-gray-100 overflow-hidden relative">
        {photographer.portfolioImages?.length > 0 ? (
          <img
            src={photographer.portfolioImages[0]}
            alt={photographer.user?.firstName}
            className="w-full h-full object-cover
                       group-hover:scale-105 transition-transform
                       duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center
                          justify-center text-5xl text-gray-200">
            📷
          </div>
        )}
        {/* Verified badge */}
        {photographer.isVerified && (
          <span className="absolute top-3 right-3 bg-green-500
                           text-white text-xs px-2 py-1 rounded-lg
                           font-medium">
            ✅ Verified
          </span>
        )}
      </div>

      {/* Details */}
      <div className="p-5">
        <div className="flex items-start justify-between mb-2">
          <div>
            <h3 className="font-bold text-gray-900 text-lg">
              {photographer.user?.firstName} {photographer.user?.lastName}
            </h3>
            <p className="text-gray-500 text-sm">
              📍 {photographer.city}
            </p>
          </div>
          <div className="w-12 h-12 bg-primary-100 rounded-full
                          flex items-center justify-center
                          text-primary-600 font-bold text-lg
                          overflow-hidden flex-shrink-0">
            {photographer.user?.profileImage ? (
              <img src={photographer.user.profileImage}
                   alt="" className="w-full h-full object-cover" />
            ) : (
              photographer.user?.firstName?.charAt(0).toUpperCase()
            )}
          </div>
        </div>

        {/* Specializations */}
        {photographer.specializations && (
          <div className="flex flex-wrap gap-1 mb-3">
            {photographer.specializations.split(',')
              .slice(0, 3).map((spec, i) => (
              <span key={i} className="badge-blue text-xs">
                {spec.trim()}
              </span>
            ))}
          </div>
        )}

        {/* Bio */}
        {photographer.bio && (
          <p className="text-gray-500 text-sm mb-4 line-clamp-2
                         leading-relaxed">
            {photographer.bio}
          </p>
        )}

        {/* Pricing */}
        <div className="flex items-center justify-between
                        pt-3 border-t border-gray-100">
          <div>
            <span className="text-primary-500 font-bold text-lg">
              ₹{photographer.pricePerHour}
            </span>
            <span className="text-gray-400 text-xs">/hour</span>
          </div>
          <div className="text-right">
            <span className="text-gray-600 font-semibold">
              ₹{photographer.pricePerDay}
            </span>
            <span className="text-gray-400 text-xs">/day</span>
          </div>
        </div>

        <button className="mt-3 w-full bg-primary-50 text-primary-600
                           py-2 rounded-lg text-sm font-medium
                           hover:bg-primary-500 hover:text-white
                           transition-all duration-200">
          View Profile & Book
        </button>
      </div>
    </div>
  )
}