import React, { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { Plane, Calendar, ArrowRight, ShieldCheck } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../services/api'
import type { Flight } from '../types'

export const Flights: React.FC = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  const [origin, setOrigin] = useState('Delhi')
  const [destination, setDestination] = useState(searchParams.get('destination') || 'Goa')
  const [departDate, setDepartDate] = useState(searchParams.get('depart_date') || '')
  const [flightClass, setFlightClass] = useState('economy')
  const [flights, setFlights] = useState<Flight[]>([])
  const [loading, setLoading] = useState(false)

  const fetchFlights = async () => {
    setLoading(true)
    try {
      const res = await api.get('/flights', {
        params: {
          origin: origin || undefined,
          destination: destination || undefined,
          depart_date: departDate || undefined,
          flight_class: flightClass,
        },
      })
      setFlights(res.data.items || [])
    } catch {
      toast.error('Failed to load flights.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchFlights()
  }, [flightClass])

  const handleBook = (flight: Flight) => {
    navigate('/checkout', {
      state: {
        type: 'flight',
        itemId: flight.id,
        title: `${flight.airline} ${flight.flight_no} (${flight.origin} → ${flight.destination})`,
        price: flight.price,
        meta: `${flight.duration_min} mins · ${flight.flight_class.toUpperCase()}`,
      },
    })
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
          Find & Compare Flights
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Compare sample fares and schedules from our demo dataset. Prices and seat counts are not live.
        </p>

        {/* Search Bar */}
        <div className="mt-6 p-4 bg-white rounded-2xl shadow-sm border border-slate-200 grid grid-cols-1 sm:grid-cols-5 gap-3 items-center">
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase">From</label>
            <input
              type="text"
              value={origin}
              onChange={(e) => setOrigin(e.target.value)}
              placeholder="Origin city"
              className="w-full py-1.5 border-b border-slate-200 focus:outline-none focus:border-teal-500 text-sm font-semibold text-slate-800"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase">Departure date</label>
            <input
              type="date"
              value={departDate}
              min={new Date().toISOString().slice(0, 10)}
              onChange={(e) => setDepartDate(e.target.value)}
              className="w-full py-1.5 border-b border-slate-200 focus:outline-none focus:border-teal-500 text-sm font-semibold text-slate-800"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase">To</label>
            <input
              type="text"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder="Destination city"
              className="w-full py-1.5 border-b border-slate-200 focus:outline-none focus:border-teal-500 text-sm font-semibold text-slate-800"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase">Class</label>
            <select
              value={flightClass}
              onChange={(e) => setFlightClass(e.target.value)}
              className="w-full py-1.5 border-b border-slate-200 focus:outline-none focus:border-teal-500 text-sm font-semibold text-slate-800 bg-transparent"
            >
              <option value="economy">Economy</option>
              <option value="business">Business</option>
            </select>
          </div>

          <button
            onClick={fetchFlights}
            className="w-full py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs sm:text-sm font-bold transition shadow-sm mt-2 sm:mt-0"
          >
            Find Flights
          </button>
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center text-slate-400 font-medium">Checking flight routes...</div>
      ) : flights.length === 0 ? (
        <div className="py-20 text-center text-slate-500">No flights found for this route.</div>
      ) : (
        <div className="space-y-4">
          {flights.map((f) => (
            <div
              key={f.id}
              className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:border-teal-300 transition"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center font-bold text-sm">
                  <Plane className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-slate-900 text-base">{f.airline}</span>
                    <span className="text-xs px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-medium">
                      {f.flight_no}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                    <span>{f.origin}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                    <span>{f.destination}</span>
                    <span>·</span>
                    <span>{f.duration_min} mins</span>
                    <span>·</span>
                    <span className="capitalize">{f.flight_class}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-6 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-0 pt-3 sm:pt-0 border-slate-100">
                <div className="text-right">
                  <div className="text-lg font-extrabold text-slate-900">
                    ₹{Number(f.price).toLocaleString('en-IN')}
                  </div>
                  <div className="text-[10px] text-teal-600 font-semibold">
                    {f.seats_available} seats left
                  </div>
                </div>

                <button
                  onClick={() => handleBook(f)}
                  className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition shadow-sm"
                >
                  Book Flight
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
