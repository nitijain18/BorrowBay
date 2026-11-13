import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/axiosConfig'
import ItemCard from '../components/ItemCard'    // ← import
import { useAuth } from '../context/AuthContext'

export default function HomePage() {
  const navigate = useNavigate()
  const [categories, setCategories] = useState([])
  const [items, setItems]           = useState([])
  const [loading, setLoading]       = useState(true)
  const { isLoggedIn, isSeller, isAdmin, user } = useAuth()

  const categoryEmojis = {
    'Electronics': '📷', 'Fashion': '👗', 'Sports': '🚲',
    'Music': '🎸', 'Books': '📚', 'Furniture': '🪑',
    'Tools': '🔧', 'Vehicles': '🚗',
  }

  useEffect(() => { fetchData() }, [])

  const fetchData = async () => {
    try {
      const [categoriesRes, itemsRes] = await Promise.all([
        api.get('/categories'),
        api.get('/items')
      ])
      setCategories(categoriesRes.data)
      setItems(itemsRes.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <LoadingSkeleton />

  return (
    <div className="animate-fade-in">

      {/* Hero */}
      <section className="bg-gradient-to-br from-primary-500 to-primary-700
                          text-white py-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 animate-slide-up">
            Rent Anything. <br />
            <span className="text-primary-200">Earn from Everything.</span>
          </h1>
          <p className="text-primary-100 text-lg md:text-xl mb-8
                        max-w-2xl mx-auto animate-slide-up">
            India's premier peer-to-peer rental marketplace.
          </p>

          {/* Hero buttons — dynamic based on login/role */}
          <div className="flex gap-4 justify-center animate-slide-up flex-wrap">
            <button
              onClick={() => navigate('/items')}
              className="bg-white text-primary-600 px-8 py-4 rounded-xl
                         font-bold text-lg hover:bg-primary-50
                         active:scale-95 transition-all duration-200 shadow-lg">
              Browse Items
            </button>

            {!isLoggedIn && (
              <button
                onClick={() => navigate('/signup')}
                className="border-2 border-white text-white px-8 py-4
                           rounded-xl font-bold text-lg
                           hover:bg-white hover:text-primary-600
                           active:scale-95 transition-all duration-200">
                Start Renting
              </button>
            )}

            {isLoggedIn && user?.role === 'ROLE_ADMIN' && (
              <button
                onClick={() => navigate('/admin')}
                className="border-2 border-white text-white px-8 py-4
                           rounded-xl font-bold text-lg
                           hover:bg-white hover:text-primary-600
                           active:scale-95 transition-all duration-200">
                Admin Dashboard ⚙️
              </button>
            )}

            {isLoggedIn && user?.role === 'ROLE_SELLER' && (
              <button
                onClick={() => navigate('/seller')}
                className="border-2 border-white text-white px-8 py-4
                           rounded-xl font-bold text-lg
                           hover:bg-white hover:text-primary-600
                           active:scale-95 transition-all duration-200">
                Seller Dashboard 🏪
              </button>
            )}

            {isLoggedIn && user?.role === 'ROLE_PHOTOGRAPHER' && (
              <button
                onClick={() => navigate('/photographer/bookings')}
                className="border-2 border-white text-white px-8 py-4
                           rounded-xl font-bold text-lg
                           hover:bg-white hover:text-primary-600
                           active:scale-95 transition-all duration-200">
                My Bookings 📷
              </button>
            )}

            {isLoggedIn && user?.role === 'ROLE_DELIVERY_PARTNER' && (
              <button
                onClick={() => navigate('/delivery/dashboard')}
                className="border-2 border-white text-white px-8 py-4
                           rounded-xl font-bold text-lg
                           hover:bg-white hover:text-primary-600
                           active:scale-95 transition-all duration-200">
                My Deliveries 🚚
              </button>
            )}

            {isLoggedIn && user?.role === 'ROLE_CUSTOMER' && (
              <button
                onClick={() => navigate('/seller/apply')}
                className="border-2 border-white text-white px-8 py-4
                           rounded-xl font-bold text-lg
                           hover:bg-white hover:text-primary-600
                           active:scale-95 transition-all duration-200">
                Become a Seller 🏪
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-white border-b border-gray-100 py-6">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-3 gap-4 text-center">
            {[
              { value: '10,000+', label: 'Items Listed' },
              { value: '5,000+',  label: 'Happy Renters' },
              { value: '50+',     label: 'Cities' },
            ].map((stat, i) => (
              <div key={i}>
                <p className="text-2xl font-bold text-primary-500">{stat.value}</p>
                <p className="text-gray-500 text-sm">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="page-container">
        <div className="flex items-center justify-between mb-6">
          <h2 className="section-title">Browse Categories</h2>
          <button onClick={() => navigate('/items')}
                  className="text-primary-500 font-medium text-sm
                             hover:text-primary-600 transition-colors">
            View all →
          </button>
        </div>
        {categories.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <p className="text-4xl mb-3">📦</p>
            <p>No categories yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4
                          lg:grid-cols-6 gap-4">
            {categories.map((category, i) => (
              <div key={category.id}
                   onClick={() => navigate(`/items?categoryId=${category.id}`)}
                   className="card p-4 text-center cursor-pointer
                              animate-slide-up group"
                   style={{ animationDelay: `${i * 0.1}s` }}>
                <div className="text-3xl mb-2 group-hover:scale-110
                                transition-transform duration-200">
                  {categoryEmojis[category.name] || '📦'}
                </div>
                <p className="text-sm font-medium text-gray-700
                              group-hover:text-primary-500 transition-colors">
                  {category.name}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Featured Items — uses reusable ItemCard */}
      <section className="page-container">
        <div className="flex items-center justify-between mb-6">
          <h2 className="section-title">Featured Items</h2>
          <button onClick={() => navigate('/items')}
                  className="text-primary-500 font-medium text-sm
                             hover:text-primary-600 transition-colors">
            View all →
          </button>
        </div>
        {items.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <p className="text-4xl mb-3">🏷️</p>
            <p>No items listed yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3
                          lg:grid-cols-4 gap-6">
            {items.slice(0, 8).map((item, i) => (
              <ItemCard key={item.id} item={item} index={i} />
            ))}
          </div>
        )}
      </section>

      {/* How it works */}
      <section className="bg-primary-50 py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="section-title text-center mb-12">
            How BorrowBay Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: '01', icon: '🔍', title: 'Browse & Search',
                desc: 'Find exactly what you need from thousands of listings' },
              { step: '02', icon: '📅', title: 'Book & Pay',
                desc: 'Select your rental dates, pay securely' },
              { step: '03', icon: '🚚', title: 'Get Delivered',
                desc: 'Item delivered to your doorstep. Return when done.' },
            ].map((step, i) => (
              <div key={i} className="text-center animate-slide-up"
                   style={{ animationDelay: `${i * 0.2}s` }}>
                <div className="relative inline-block mb-4">
                  <div className="w-16 h-16 bg-primary-500 rounded-2xl
                                  flex items-center justify-center
                                  text-3xl mx-auto">
                    {step.icon}
                  </div>
                  <span className="absolute -top-2 -right-2 bg-primary-100
                                   text-primary-600 text-xs font-bold
                                   w-6 h-6 rounded-full flex items-center
                                   justify-center">
                    {step.step}
                  </span>
                </div>
                <h3 className="font-bold text-gray-900 mb-2 text-lg">
                  {step.title}
                </h3>
                <p className="text-gray-500 text-sm leading-relaxed">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── JOIN AS PROFESSIONAL ── */}
      <section className="page-container">
        <div className="text-center mb-10">
          <h2 className="section-title">💼 Earn with BorrowBay</h2>
          <p className="text-gray-500 mt-2">
            Join thousands earning on our platform
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          {/* Seller */}
          <div className="card p-6 text-center group hover:border-primary-300
                          border-2 border-transparent transition-all duration-300
                          animate-slide-up">
            <div className="w-16 h-16 bg-primary-100 rounded-2xl
                            flex items-center justify-center text-3xl
                            mx-auto mb-4 group-hover:bg-primary-500
                            group-hover:scale-110 transition-all duration-300">
              🏪
            </div>
            <h3 className="font-bold text-gray-900 text-lg mb-2">
              Become a Seller
            </h3>
            <p className="text-gray-500 text-sm mb-4 leading-relaxed">
              List your unused items and earn rental income.
              Cameras, bikes, clothes — anything goes.
            </p>
            <div className="space-y-2 text-sm text-gray-500 mb-6">
              <p>✅ List items in minutes</p>
              <p>✅ Set your own price</p>
              <p>✅ Earn passive income</p>
            </div>
            <button
              onClick={() => isLoggedIn
                ? navigate('/seller/apply')
                : navigate('/signup')}
              className="btn-primary w-full">
              {isLoggedIn && isSeller
                ? 'Go to Dashboard →'
                : 'Start Selling →'}
            </button>
          </div>

          {/* Photographer */}
          <div className="card p-6 text-center group hover:border-primary-300
                          border-2 border-transparent transition-all duration-300
                          animate-slide-up"
               style={{ animationDelay: '0.1s' }}>
            <div className="w-16 h-16 bg-purple-100 rounded-2xl
                            flex items-center justify-center text-3xl
                            mx-auto mb-4 group-hover:bg-purple-500
                            group-hover:scale-110 transition-all duration-300">
              📷
            </div>
            <h3 className="font-bold text-gray-900 text-lg mb-2">
              Become a Photographer
            </h3>
            <p className="text-gray-500 text-sm mb-4 leading-relaxed">
              Offer photography services for events, weddings
              and product shoots.
            </p>
            <div className="space-y-2 text-sm text-gray-500 mb-6">
              <p>✅ Set your own schedule</p>
              <p>✅ Choose your price</p>
              <p>✅ Build your portfolio</p>
            </div>
            <button
              onClick={() => isLoggedIn
                ? navigate('/photographer/apply')
                : navigate('/signup')}
              className="w-full py-3 rounded-xl font-semibold text-sm
                         bg-purple-500 text-white hover:bg-purple-600
                         active:scale-95 transition-all duration-200">
              {isLoggedIn && user?.role === 'ROLE_PHOTOGRAPHER'
                ? 'View Bookings →'
                : 'Start Shooting →'}
            </button>
          </div>

          {/* Delivery Partner */}
          <div className="card p-6 text-center group hover:border-primary-300
                          border-2 border-transparent transition-all duration-300
                          animate-slide-up"
               style={{ animationDelay: '0.2s' }}>
            <div className="w-16 h-16 bg-green-100 rounded-2xl
                            flex items-center justify-center text-3xl
                            mx-auto mb-4 group-hover:bg-green-500
                            group-hover:scale-110 transition-all duration-300">
              🚚
            </div>
            <h3 className="font-bold text-gray-900 text-lg mb-2">
              Become a Delivery Partner
            </h3>
            <p className="text-gray-500 text-sm mb-4 leading-relaxed">
              Earn by picking up and delivering rental items
              in your city.
            </p>
            <div className="space-y-2 text-sm text-gray-500 mb-6">
              <p>✅ Flexible working hours</p>
              <p>✅ Earn per delivery</p>
              <p>✅ Be your own boss</p>
            </div>
            <button
              onClick={() => isLoggedIn
                ? navigate('/delivery/apply')
                : navigate('/signup')}
              className="w-full py-3 rounded-xl font-semibold text-sm
                         bg-green-500 text-white hover:bg-green-600
                         active:scale-95 transition-all duration-200">
              {isLoggedIn && user?.role === 'ROLE_DELIVERY_PARTNER'
                ? 'Go to Dashboard →'
                : 'Start Delivering →'}
            </button>
          </div>

        </div>
      </section>

      {/* ── ABOUT US ── */}
<section id="about" className="bg-white py-16 px-4">
  <div className="max-w-7xl mx-auto">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-12
                    items-center">

      {/* Left — Text */}
      <div className="animate-slide-up">
        <span className="badge-blue text-sm mb-4 inline-block">
          About BorrowBay
        </span>
        <h2 className="text-3xl md:text-4xl font-bold
                       text-gray-900 mb-6 leading-tight">
          India's Smartest Peer-to-Peer Rental Platform
        </h2>
        <p className="text-gray-500 text-lg leading-relaxed mb-6">
          BorrowBay connects people who need items with people
          who have them. Instead of buying something you'll use
          once, just rent it — save money, reduce waste, and
          support your community.
        </p>
        <p className="text-gray-500 leading-relaxed mb-8">
          Founded in 2025, we're on a mission to make renting
          as easy as shopping online. From cameras to bicycles,
          formal wear to power tools — find anything near you.
        </p>

        <div className="grid grid-cols-2 gap-4">
          {[
            { value: '10,000+', label: 'Items Listed' },
            { value: '5,000+',  label: 'Happy Renters' },
            { value: '50+',     label: 'Cities' },
            { value: '₹2 Cr+',  label: 'Saved by Renters' },
          ].map((stat, i) => (
            <div key={i} className="bg-primary-50 rounded-2xl p-4">
              <p className="text-2xl font-bold text-primary-500">
                {stat.value}
              </p>
              <p className="text-gray-500 text-sm">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Right — Values */}
      <div className="space-y-4 animate-slide-up">
        {[
          {
            icon: '♻️',
            title: 'Sustainable',
            desc: 'Reduce waste by sharing resources instead of buying new'
          },
          {
            icon: '🤝',
            title: 'Community Driven',
            desc: 'Built on trust between neighbors and local communities'
          },
          {
            icon: '🔒',
            title: 'Safe & Secure',
            desc: 'Verified sellers, secure payments, and buyer protection'
          },
          {
            icon: '💰',
            title: 'Save Money',
            desc: 'Rent for a fraction of the purchase price'
          },
        ].map((val, i) => (
          <div key={i}
               className="flex items-start gap-4 p-4 rounded-2xl
                          bg-gray-50 hover:bg-primary-50
                          transition-colors duration-200">
            <div className="text-3xl">{val.icon}</div>
            <div>
              <h3 className="font-bold text-gray-900 mb-1">
                {val.title}
              </h3>
              <p className="text-gray-500 text-sm">{val.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
</section>

      {/* CTA Banner — dynamic based on login/seller state */}
      <section className="page-container">
        <div className="bg-gradient-to-r from-primary-500 to-primary-700
                        rounded-3xl p-8 md:p-12 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">
            {isLoggedIn && isSeller
              ? 'Manage your listings 🏪'
              : 'Have something to rent out?'}
          </h2>
          <p className="text-primary-100 mb-8 max-w-lg mx-auto">
            {isLoggedIn && isSeller
              ? 'View your active listings, track bookings and earnings.'
              : 'Turn your unused items into income. List in minutes.'}
          </p>
          <button
            onClick={() => navigate(
              isLoggedIn && isSeller ? '/seller' : '/seller/apply'
            )}
            className="bg-white text-primary-600 px-8 py-4 rounded-xl
                       font-bold hover:bg-primary-50
                       active:scale-95 transition-all duration-200 shadow-lg">
            {isLoggedIn && isSeller
              ? 'Go to Dashboard →'
              : isLoggedIn
                ? 'Become a Seller →'
                : 'Start Earning →'}
          </button>
        </div>
      </section>

    </div>
  )
}

function LoadingSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="bg-primary-200 h-64" />
      <div className="page-container">
        <div className="h-6 bg-gray-200 rounded w-48 mb-6" />
        <div className="grid grid-cols-6 gap-4 mb-12">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-24 bg-gray-200 rounded-2xl" />
          ))}
        </div>
        <div className="h-6 bg-gray-200 rounded w-48 mb-6" />
        <div className="grid grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-64 bg-gray-200 rounded-2xl" />
          ))}
        </div>
      </div>
    </div>
  )
}