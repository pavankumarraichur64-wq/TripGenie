import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { MapPin, Calendar, Trash2, ArrowRight, PlusCircle, Ticket } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../services/api'

export const MyTrips: React.FC = () => {
  const [trips, setTrips] = useState<any[]>([])
  const [bookings, setBookings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const fetchData = async () => {
    try {
      const [tripsRes, bookingsRes] = await Promise.all([
        api.get('/trips'),
        api.get('/bookings'),
      ])
      setTrips(tripsRes.data || [])
      setBookings(bookingsRes.data || [])
    } catch {
      toast.error('Failed to load trips.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleDeleteTrip = async (id: number) => {
    if (!confirm('Are you sure you want to delete this itinerary?')) return
    try {
      await api.delete(`/trips/${id}`)
      toast.success('Trip removed.')
      setTrips(trips.filter((t) => t.id !== id))
    } catch {
      toast.error('Could not delete trip.')
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-10 space-y-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            My Travel Dashboard
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Access your AI-planned itineraries and active reservations.
          </p>
        </div>
        <Link
          to="/plan"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-sm font-bold shadow-md transition"
        >
          <PlusCircle className="w-4 h-4" />
          Plan New Trip
        </Link>
      </div>

      {/* Trips Section */}
      <div>
        <h2 className="text-lg font-bold text-slate-900 mb-4">Saved Itineraries</h2>
        {loading ? (
          <div className="py-12 text-center text-slate-400">Loading your trips...</div>
        ) : trips.length === 0 ? (
          <div className="p-8 bg-white rounded-3xl border border-slate-200 text-center">
            <MapPin className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-slate-600 text-sm font-medium">No trips saved yet.</p>
            <Link to="/plan" className="text-teal-600 font-bold text-xs mt-2 inline-block">
              Start your first itinerary →
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {trips.map((t) => (
              <div
                key={t.id}
                className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col justify-between hover:shadow-md transition"
              >
                <div>
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {t.days} Days
                    </span>
                    <span className="capitalize font-semibold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md">
                      {t.trip_type}
                    </span>
                  </div>
                  <h3 className="font-extrabold text-slate-900 text-base">{t.title}</h3>
                  <p className="text-slate-500 text-xs mt-1">
                    Budget: ₹{Number(t.budget).toLocaleString('en-IN')}
                  </p>
                </div>

                <div className="pt-4 mt-6 border-t border-slate-100 flex items-center justify-between">
                  <Link
                    to={`/itinerary/${t.id}`}
                    className="text-xs font-bold text-teal-600 hover:text-teal-800 flex items-center gap-1"
                  >
                    View Plan <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                  <button
                    onClick={() => handleDeleteTrip(t.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 transition"
                    title="Delete trip"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bookings Section */}
      <div>
        <h2 className="text-lg font-bold text-slate-900 mb-4">Reservations & Bookings</h2>
        {bookings.length === 0 ? (
          <div className="p-6 bg-white rounded-2xl border border-slate-200 text-xs text-slate-500">
            No confirmed bookings yet. Browse Hotels and Flights to make reservations.
          </div>
        ) : (
          <div className="space-y-3">
            {bookings.map((b) => (
              <div
                key={b.id}
                className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-slate-100 text-slate-700 rounded-lg">
                    <Ticket className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-mono font-bold text-slate-900">{b.booking_ref}</span>
                    <div className="text-slate-500 capitalize mt-0.5">
                      {b.type} · ₹{Number(b.amount).toLocaleString('en-IN')}
                    </div>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-teal-50 text-teal-700 font-bold uppercase text-[10px]">
                  {b.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
