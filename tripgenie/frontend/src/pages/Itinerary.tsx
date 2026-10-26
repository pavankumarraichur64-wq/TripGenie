import React, { useState, useEffect, useMemo, useRef } from 'react'
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
  LocateFixed,
  Image as ImageIcon,
} from 'lucide-react'
import toast from 'react-hot-toast'
import * as L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import api from '../services/api'
import { ChatDrawer } from '../components/ChatDrawer'

type Coordinates = [number, number]

const ItineraryMap: React.FC<{
  items: any[]
  userLocation: Coordinates | null
  onLocate: () => void
}> = ({ items, userLocation, onLocate }) => {
  const mapElement = useRef<HTMLDivElement>(null)
  const mapRef = useRef<L.Map | null>(null)
  const stopsLayer = useRef<L.LayerGroup | null>(null)
  const mapStops = useMemo(
    () => items.filter((item) => Number.isFinite(item.latitude) && Number.isFinite(item.longitude)),
    [items]
  )

  useEffect(() => {
    if (!mapElement.current) return

    const map = L.map(mapElement.current, { scrollWheelZoom: false })
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map)
    const layer = L.layerGroup().addTo(map)
    mapRef.current = map
    stopsLayer.current = layer

    return () => {
      map.remove()
      mapRef.current = null
      stopsLayer.current = null
    }
  }, [])

  useEffect(() => {
    const map = mapRef.current
    const layer = stopsLayer.current
    if (!map || !layer) return

    layer.clearLayers()
    const positions = mapStops.map((item) => L.latLng(item.latitude, item.longitude))
    if (positions.length > 1) {
      L.polyline(positions, { color: '#0d9488', weight: 4 }).addTo(layer)
    }

    mapStops.forEach((item, index) => {
      const popup = document.createElement('div')
      const title = document.createElement('strong')
      title.textContent = item.place_name || item.title
      popup.append(title, document.createElement('br'), 'Approximate demo location')
      L.circleMarker(positions[index], {
        radius: 8,
        color: '#0f766e',
        fillColor: '#14b8a6',
        fillOpacity: 0.9,
      }).bindPopup(popup).addTo(layer)
    })

    if (userLocation) {
      const currentPosition = L.latLng(userLocation)
      const popup = document.createElement('div')
      popup.textContent = 'Your current GPS location'
      L.circleMarker(currentPosition, {
        radius: 9,
        color: '#1d4ed8',
        fillColor: '#60a5fa',
        fillOpacity: 1,
      }).bindPopup(popup).addTo(layer)
      map.setView(currentPosition, 14)
    } else if (positions.length > 1) {
      map.fitBounds(L.latLngBounds(positions), { padding: [24, 24], maxZoom: 14 })
    } else if (positions.length === 1) {
      map.setView(positions[0], 14)
    }
  }, [mapStops, userLocation])

  return (
    <section className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="font-bold text-slate-900 text-sm">Day route map</h3>
          <p className="text-[11px] text-slate-500 mt-1">
            Approximate demo pins and a straight-line route; not navigation directions.
          </p>
        </div>
        <button
          type="button"
          onClick={onLocate}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
        >
          <LocateFixed className="h-4 w-4 text-teal-700" />
          Show my GPS location
        </button>
      </div>
      <div ref={mapElement} className="h-72 overflow-hidden rounded-2xl border border-slate-200" />
    </section>
  )
}

export const Itinerary: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const [trip, setTrip] = useState<any>(null)
  const [activeDay, setActiveDay] = useState<number>(1)
  const [loading, setLoading] = useState<boolean>(true)
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false)
  const [regenerating, setRegenerating] = useState<boolean>(false)
  const [exportingPdf, setExportingPdf] = useState<boolean>(false)
  const [userLocation, setUserLocation] = useState<Coordinates | null>(null)

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

  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      toast.error('GPS location is not available in this browser.')
      return
    }

    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setUserLocation([coords.latitude, coords.longitude])
        toast.success('Your current location is shown on the map.')
      },
      (error) => {
        const message = error.code === error.PERMISSION_DENIED
          ? 'Allow location access in your browser to show your position.'
          : 'Unable to determine your location. Please try again.'
        toast.error(message)
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    )
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
  const mapItems: any[] = currentDayData?.items || []
  const hasMapStops = mapItems.some(
    (item: any) => Number.isFinite(item.latitude) && Number.isFinite(item.longitude)
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

              {hasMapStops && (
                <ItineraryMap
                  items={mapItems}
                  userLocation={userLocation}
                  onLocate={handleLocateMe}
                />
              )}

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
                        {item.latitude != null && item.longitude != null && (
                          <p className="text-[10px] text-slate-400 mt-1">
                            Approx. GPS: {Number(item.latitude).toFixed(5)}, {Number(item.longitude).toFixed(5)}
                          </p>
                        )}
                      </div>
                    </div>
                    {item.photo_url && (
                      <div className="flex items-center gap-2 sm:w-36 sm:flex-col sm:items-start">
                        <img
                          src={item.photo_url}
                          alt={`Illustrative destination photo for ${item.title}`}
                          loading="lazy"
                          className="h-16 w-20 rounded-lg object-cover sm:h-20 sm:w-full"
                        />
                        <span className="flex items-center gap-1 text-[10px] text-slate-400">
                          <ImageIcon className="h-3 w-3 shrink-0" />
                          {item.photo_credit || 'Destination photo'}
                        </span>
                      </div>
                    )}
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

          {currentDayData?.local_transport?.length > 0 && (
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 space-y-3">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Local transport</h3>
                <p className="text-[11px] text-slate-500 mt-1">
                  Sample estimates only. Confirm fares and availability locally.
                </p>
              </div>
              {currentDayData.local_transport.map((option: any) => (
                <div
                  key={option.mode}
                  className="flex items-start justify-between gap-3 rounded-xl bg-slate-50 p-3"
                >
                  <div>
                    <p className="text-xs font-bold text-slate-800">{option.mode}</p>
                    <p className="text-[10px] text-slate-500 mt-1">{option.description}</p>
                    <p className="text-[10px] text-slate-400 mt-1">
                      Approx. {option.estimated_minutes} minutes
                    </p>
                  </div>
                  <span className="shrink-0 text-xs font-bold text-teal-700">
                    ₹{Number(option.estimated_fare).toLocaleString('en-IN')}
                  </span>
                </div>
              ))}
            </div>
          )}

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
