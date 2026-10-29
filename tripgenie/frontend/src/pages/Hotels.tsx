import React, { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { Hotel as HotelIcon, Star, MapPin, Search, Check } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../services/api'
import type { Hotel as HotelListing } from '../types'

export const Hotels: React.FC = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const initialDest = searchParams.get('destination') || ''

  const [destination, setDestination] = useState(initialDest)
  const [stars, setStars] = useState<string>('')
  const [sort, setSort] = useState<string>('price_asc')
  const [hotels, setHotels] = useState<HotelListing[]>([])
  const [loading, setLoading] = useState(false)

  const fetchHotels = async () => {
    setLoading(true)
    try {
      const params: any = { sort }
      if (destination) params.destination = destination
      if (stars) params.stars = Number(stars)

      const res = await api.get('/hotels', { params })
      setHotels(res.data.items || [])
    } catch {
      toast.error('Failed to load hotels.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchHotels()
  }, [sort, stars])

  const handleBook = (hotel: any) => {
    navigate('/checkout', {
      state: {
        type: 'hotel',
        itemId: hotel.id,
        title: hotel.name,
        price: hotel.price_per_night,
        meta: `${hotel.stars} Stars · ${hotel.address || 'Central Location'}`,
      },
    })
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
          Discover Handpicked Hotels
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Browse sample hotel listings and estimated rates. Availability, prices, and reservations are not live.
        </p>

        {/* Filter Bar */}
        <div className="mt-6 p-4 bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-wrap gap-4 items-center">
          <div className="flex-1 min-w-[200px] relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
            <input
              type="text"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder="Search by destination or hotel name..."
              className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <select
            value={stars}
            onChange={(e) => setStars(e.target.value)}
            className="px-3 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            <option value="">All Star Ratings</option>
            <option value="3">3+ Stars</option>
            <option value="4">4+ Stars</option>
            <option value="5">5 Stars Luxury</option>
          </select>

          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="px-3 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="rating_desc">Highest Rated</option>
          </select>

          <button
            onClick={fetchHotels}
            className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs sm:text-sm font-semibold transition"
          >
            Search
          </button>
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center text-slate-400 font-medium">Searching hotels...</div>
      ) : hotels.length === 0 ? (
        <div className="py-20 text-center text-slate-500">No hotels found matching criteria.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {hotels.map((h) => (
            <div
              key={h.id}
              className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col hover:shadow-md transition"
            >
              <div className="h-44 bg-slate-100 relative">
                <img
                  src={h.image_url || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&auto=format&fit=crop&q=80'}
                  alt={h.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 right-3 px-2 py-1 bg-black/60 backdrop-blur-md rounded-lg text-white text-xs font-bold flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                  {h.rating} ({h.stars}★)
                </div>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-slate-900 text-base">{h.name}</h3>
                  <p className="text-slate-400 text-xs flex items-center gap-1 mt-1">
                    <MapPin className="w-3.5 h-3.5 text-teal-600" />
                    {h.address || 'Central location'}
                  </p>
                  <a
                    href={`https://www.openstreetmap.org/search?query=${encodeURIComponent(
                      [h.name, h.address].filter(Boolean).join(', ')
                    )}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 mt-2 text-xs font-semibold text-teal-700 hover:text-teal-900"
                  >
                    <MapPin className="w-3.5 h-3.5" />
                    Find on map
                  </a>

                  {h.amenities && (
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {h.amenities.slice(0, 3).map((a: string) => (
                        <span
                          key={a}
                          className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px] font-medium"
                        >
                          {a}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-slate-400">Per night</span>
                    <div className="text-lg font-extrabold text-slate-900">
                      ₹{Number(h.price_per_night).toLocaleString('en-IN')}
                    </div>
                  </div>
                  <button
                    onClick={() => handleBook(h)}
                    className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition shadow-sm"
                  >
                    Reserve
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
