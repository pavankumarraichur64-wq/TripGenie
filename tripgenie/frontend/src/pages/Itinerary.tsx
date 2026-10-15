import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  Calendar,
  Clock,
  Sparkles,
  Download,
  RotateCw,
  MessageSquare,
  Hotel,
  Plane,
  Tag,
  CheckCircle,
} from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../services/api'
import { ChatDrawer } from '../components/ChatDrawer'

export const Itinerary: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const [trip, setTrip] = useState<any>(null)
  const [activeDay, setActiveDay] = useState<number>(1)
  const [loading, setLoading] = useState<boolean>(true)
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false)
  const [regenerating, setRegenerating] = useState<boolean>(false)
  const [exportingPdf, setExportingPdf] = useState<boolean>(false)

  const fetchTrip = async () => {
    try {
      const res = await api.get(`/trips/${id}`)
      setTrip(res.data)
      if (res.data.itinerary_days?.length > 0) {
        setActiveDay(res.data.itinerary_days[0].day_number)
      }
    } catch {
      toast.error('Failed to load itinerary.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTrip()
  }, [id])

  const handleRegenerateDay = async (dayNumber: number) => {
    setRegenerating(true)
    try {
      await api.post(`/trips/${id}/regenerate-day/${dayNumber}`, {})
      toast.success(`Day ${dayNumber} refreshed with new activities!`)
      fetchTrip()
    } catch {
      toast.error('Failed to regenerate day.')
    } finally {
      setRegenerating(false)
    }
  }

  const handleExportPDF = async () => {
    setExportingPdf(true)
    try {
      const response = await api.get<Blob>(`/trips/${id}/export`, {
        responseType: 'blob',
      })
      const contentDisposition = response.headers['content-disposition'] as string | undefined
      const filename = contentDisposition?.match(/filename="?([^";]+)"?/)?.[1]
        || `TripGenie_Itinerary_${id}.pdf`
      const downloadUrl = URL.createObjectURL(
        new Blob([response.data], { type: 'application/pdf' })
      )
      const link = document.createElement('a')
      link.href = downloadUrl
      link.download = filename
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.setTimeout(() => URL.revokeObjectURL(downloadUrl), 1000)
      toast.success('Itinerary PDF downloaded.')
    } catch {
      toast.error('Failed to download itinerary PDF.')
    } finally {
      setExportingPdf(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-20 text-center">
        <Sparkles className="w-8 h-8 text-teal-600 animate-spin mx-auto mb-3" />
        <p className="text-slate-600 font-medium">Loading itinerary details...</p>
      </div>
    )
  }

  if (!trip) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-20 text-center">
        <h2 className="text-xl font-bold">Itinerary not found</h2>
        <Link to="/plan" className="text-teal-600 underline mt-2 inline-block">
          Plan a new trip
        </Link>
      </div>
    )
  }

  const currentDayData = trip.itinerary_days?.find(
    (d: any) => d.day_number === activeDay
  )

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-teal-700 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-teal-300 text-xs font-semibold mb-2">
            <Calendar className="w-4 h-4" />
            {trip.days} Days · {trip.travellers} Travellers · {trip.trip_type.toUpperCase()}
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold">{trip.title}</h1>
          <p className="text-slate-200 text-sm mt-1">
            Total Budget: ₹{Number(trip.budget).toLocaleString('en-IN')}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setIsChatOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-sm text-sm font-semibold transition border border-white/20"
          >
            <MessageSquare className="w-4 h-4 text-teal-300" />
            AI Assistant
          </button>
          <button
            onClick={handleExportPDF}
            disabled={exportingPdf}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 disabled:opacity-60 disabled:cursor-wait text-slate-900 text-sm font-bold transition shadow-md"
          >
            <Download className="w-4 h-4" />
            {exportingPdf ? 'Preparing PDF...' : 'Download PDF'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Itinerary View */}
        <div className="lg:col-span-2 space-y-6">
          {/* Day Tabs */}
          <div className="flex gap-2 overflow-x-auto pb-2 border-b border-slate-200">
            {trip.itinerary_days?.map((d: any) => (
              <button
                key={d.day_number}
                onClick={() => setActiveDay(d.day_number)}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition ${
                  activeDay === d.day_number
                    ? 'bg-teal-600 text-white shadow-md'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                Day {d.day_number}
              </button>
            ))}
          </div>

          {/* Current Day Content */}
          {currentDayData ? (
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 space-y-6">
              <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-100">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    Day {currentDayData.day_number}: {currentDayData.title}
                  </h2>
                  {currentDayData.summary && (
                    <p className="text-slate-500 text-xs sm:text-sm mt-1">
                      {currentDayData.summary}
                    </p>
                  )}
                </div>
                <button
                  disabled={regenerating}
                  onClick={() => handleRegenerateDay(currentDayData.day_number)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-600 transition"
                  title="Regenerate this day with AI"
                >
                  <RotateCw className={`w-3.5 h-3.5 ${regenerating ? 'animate-spin' : ''}`} />
                  Regenerate
                </button>
              </div>

              {/* Activities timeline */}
              <div className="space-y-4">
                {currentDayData.items?.map((item: any, idx: number) => (
                  <div
                    key={item.id || idx}
                    className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-teal-200 transition"
                  >
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-xl bg-teal-50 text-teal-600 font-semibold text-xs mt-0.5">
                        <Clock className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-teal-700 uppercase tracking-wider">
                            {item.time_slot}
                          </span>
                          <span className="text-xs px-2 py-0.5 rounded-md bg-slate-200 text-slate-700 font-medium">
                            {item.category}
                          </span>
                        </div>
                        <h4 className="font-bold text-slate-900 text-sm mt-1">{item.title}</h4>
                        {item.description && (
                          <p className="text-slate-500 text-xs mt-1 leading-relaxed">
                            {item.description}
                          </p>
                        )}
                      </div>
                    </div>
                    {item.estimated_cost > 0 && (
                      <div className="text-right flex-shrink-0">
                        <span className="text-xs text-slate-400">Est.</span>
                        <div className="text-sm font-bold text-slate-900">
                          ₹{Number(item.estimated_cost).toLocaleString('en-IN')}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-slate-500 text-sm">No details for this day.</p>
          )}
        </div>

        {/* Sidebar: Budget & Fast Booking Actions */}
        <div className="space-y-6">
          {/* Quick Book Hotels / Flights */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 space-y-3">
            <h3 className="font-bold text-slate-900 text-sm">Enhance Your Trip</h3>
            <p className="text-xs text-slate-500">
              Browse seeded hotels and flights matched to your destination and schedule.
            </p>
            <div className="pt-2 flex flex-col gap-2">
              <Link
                to={`/hotels?destination=${encodeURIComponent(trip.title)}`}
                className="flex items-center justify-between p-3 rounded-xl bg-teal-50 hover:bg-teal-100/80 text-teal-800 text-xs font-bold transition border border-teal-200"
              >
                <div className="flex items-center gap-2">
                  <Hotel className="w-4 h-4" />
                  <span>Find Hotels</span>
                </div>
                <span>→</span>
              </Link>
              <Link
                to={`/flights?destination=${encodeURIComponent(trip.title)}`}
                className="flex items-center justify-between p-3 rounded-xl bg-amber-50 hover:bg-amber-100/80 text-amber-800 text-xs font-bold transition border border-amber-200"
              >
                <div className="flex items-center gap-2">
                  <Plane className="w-4 h-4" />
                  <span>Find Flights</span>
                </div>
                <span>→</span>
              </Link>
            </div>
          </div>

          {/* Budget Snapshot */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 space-y-4">
            <h3 className="font-bold text-slate-900 text-sm">Budget Breakdown</h3>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Accommodation</span>
                <span className="font-semibold text-slate-900">₹{(trip.budget * 0.35).toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Food & Dining</span>
                <span className="font-semibold text-slate-900">₹{(trip.budget * 0.25).toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Activities & Tickets</span>
                <span className="font-semibold text-slate-900">₹{(trip.budget * 0.20).toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Local Travel</span>
                <span className="font-semibold text-slate-900">₹{(trip.budget * 0.10).toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Flights / Transport</span>
                <span className="font-semibold text-slate-900">₹{(trip.budget * 0.10).toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between pt-2 font-bold text-sm text-teal-700">
                <span>Total Budget</span>
                <span>₹{Number(trip.budget).toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Slide-out Chat Assistant Drawer */}
      <ChatDrawer
        tripId={Number(id)}
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        onRefreshItinerary={fetchTrip}
      />
    </div>
  )
}
