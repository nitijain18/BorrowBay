import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import api from '../api/axiosConfig'
import ItemCard from '../components/ItemCard'   // ← import

export default function ItemsPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const [items, setItems]             = useState([])
  const [categories, setCategories]   = useState([])
  const [loading, setLoading]         = useState(true)
  const [searchQuery, setSearchQuery] = useState(
    searchParams.get('search') || ''
  )
  const [selectedCategory, setSelectedCategory] = useState(
    searchParams.get('categoryId') || ''
  )
  const [sortBy, setSortBy] = useState('default')

  useEffect(() => { fetchCategories() }, [])
  useEffect(() => { fetchItems() }, [searchQuery, selectedCategory])

  const fetchCategories = async () => {
    try {
      const res = await api.get('/categories')
      setCategories(res.data)
    } catch (err) { console.error(err) }
  }

  const fetchItems = async () => {
    setLoading(true)
    try {
      let res
      if (searchQuery) {
        res = await api.get(`/items/search?query=${searchQuery}`)
      } else if (selectedCategory) {
        res = await api.get(`/items/category/${selectedCategory}`)
      } else {
        res = await api.get('/items')
      }
      setItems(res.data)
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }

  const sortedItems = [...items].sort((a, b) => {
    if (sortBy === 'price-low')  return a.rentPricePerDay - b.rentPricePerDay
    if (sortBy === 'price-high') return b.rentPricePerDay - a.rentPricePerDay
    if (sortBy === 'rating')     return b.averageRating - a.averageRating
    return 0
  })

  const handleSearch = (e) => {
    e.preventDefault()
    setSelectedCategory('')
    fetchItems()
  }

  const handleCategoryClick = (categoryId) => {
    setSelectedCategory(categoryId === selectedCategory ? '' : categoryId)
    setSearchQuery('')
  }

  const clearFilters = () => {
    setSearchQuery('')
    setSelectedCategory('')
    setSortBy('default')
  }

  return (
    <div className="page-container animate-fade-in">

      <div className="mb-8">
        <h1 className="section-title mb-2">Browse Items</h1>
        <p className="text-gray-500">
          {loading ? 'Loading...' : `${items.length} items available`}
        </p>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="mb-6">
        <div className="relative max-w-2xl">
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search cameras, bikes, clothes..."
            className="input-field pr-24"
          />
          <button type="submit"
                  className="absolute right-2 top-1/2 -translate-y-1/2
                             btn-primary py-2 px-4 text-sm">
            Search
          </button>
        </div>
      </form>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-8">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={clearFilters}
            className={`px-4 py-2 rounded-xl text-sm font-medium
                        transition-all duration-200
                        ${!selectedCategory && !searchQuery
                          ? 'bg-primary-500 text-white'
                          : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'}`}>
            All
          </button>
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => handleCategoryClick(String(cat.id))}
              className={`px-4 py-2 rounded-xl text-sm font-medium
                          transition-all duration-200
                          ${selectedCategory === String(cat.id)
                            ? 'bg-primary-500 text-white'
                            : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'}`}>
              {cat.name}
            </button>
          ))}
        </div>
        <div className="ml-auto">
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
            className="input-field py-2 text-sm w-auto cursor-pointer">
            <option value="default">Sort: Default</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="rating">Top Rated</option>
          </select>
        </div>
      </div>

      {/* Active filters */}
      {(searchQuery || selectedCategory) && (
        <div className="flex items-center gap-2 mb-6 animate-fade-in">
          <span className="text-sm text-gray-500">Active filters:</span>
          {searchQuery && (
            <span className="badge-blue flex items-center gap-1">
              🔍 "{searchQuery}"
              <button onClick={() => setSearchQuery('')}
                      className="ml-1 hover:text-primary-800">×</button>
            </span>
          )}
          {selectedCategory && (
            <span className="badge-blue flex items-center gap-1">
              📁 {categories.find(c => String(c.id) === selectedCategory)?.name}
              <button onClick={() => setSelectedCategory('')}
                      className="ml-1 hover:text-primary-800">×</button>
            </span>
          )}
          <button onClick={clearFilters}
                  className="text-sm text-red-500 hover:text-red-600">
            Clear all
          </button>
        </div>
      )}

      {/* Grid — uses reusable ItemCard */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3
                        lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-72 bg-gray-200 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : sortedItems.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-5xl mb-4">🔍</p>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            No items found
          </h3>
          <p className="text-gray-400 mb-6">Try a different search</p>
          <button onClick={clearFilters} className="btn-primary">
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3
                        lg:grid-cols-4 gap-6">
          {sortedItems.map((item, i) => (
            <ItemCard key={item.id} item={item} index={i} />
          ))}
        </div>
      )}
    </div>
  )
}