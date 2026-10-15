import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Sparkles, Calendar, Users, Wallet, Compass, Wand2, MapPin, Tag } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../services/api'

export const PlanTrip: React.FC = () => {
  const navigate = useNavigate()
  const [mode, setMode] = useState<'form' | 'prompt'>('form')
  const [loading, setLoading] = useState(false)
  const [destinations, setDestinations] = useState<any[]>([])

  // Form state
  const [destination, setDestination] = useState('')
  const [startDate, setStartDate] = useState('')
  const [days, setDays] = useState(3)
  const [travellers, setTravellers] = useState(2)
  const [budget, setBudget] = useState(25000)
  const [tripType, setTripType] = useState('leisure')
  const [selectedInterests, setSelectedInterests] = useState<string[]>([
    'Sightseeing',
    'Local Food',
  ])
  const [customPrompt, setCustomPrompt] = useState('')

  // Free text prompt state
  const [freeTextPrompt, setFreeTextPrompt] = useState('')

  useEffect(() => {
    api.get('/destinations')
      .then((res) => setDestinations(res.data))
      .catch(() => {})
  }, [])

  const interestOptions = [
    'Sightseeing',
    'Local Food',
    'History & Heritage',
    'Nature & Wildlife',
    'Adventure & Sports',
    'Nightlife',
    'Shopping',
    'Relaxation',
  ]

  const toggleInterest = (interest: string) => {
    if (selectedInterests.includes(interest)) {
      setSelectedInterests(selectedInterests.filter((i) => i !== interest))
    } else {
      setSelectedInterests([...selectedInterests, interest])
    }
  }

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const payload =
      mode === 'form'
        ? {
            destination: destination || 'Goa',
            start_date: startDate || null,
            days: Number(days),
            travellers: Number(travellers),
            budget: Number(budget),
            trip_type: tripType,
            interests: selectedInterests,
            custom_prompt: customPrompt || null,
          }
        : {
            destination: destination || 'Jaipur',
            days: 3,
            travellers: 2,
            budget: 20000,
            trip_type: 'leisure',
            interests: ['Sightseeing', 'Culture'],
            custom_prompt: freeTextPrompt,
          }

    try {
      const res = await api.post('/trips/generate', payload)
      toast.success('Your itinerary was generated successfully!')
      navigate(`/itinerary/${res.data.id}`)
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Failed to generate itinerary. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-teal-50 border border-teal-200 text-teal-700 text-xs font-semibold mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          AI-Powered Travel Intelligence
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900">
          Plan Your Next Journey with AI
        </h1>
        <p className="text-slate-600 mt-2 max-w-xl mx-auto text-sm sm:text-base">
          Customize your travel preferences or describe your dream trip in plain words.
          TripGenie creates a day-by-day tailored itinerary in seconds.
        </p>

        {/* Mode Toggle */}
        <div className="inline-flex p-1 bg-slate-200/60 rounded-xl mt-6">
          <button
            type="button"
            onClick={() => setMode('form')}
            className={`px-5 py-2 rounded-lg text-sm font-semibold transition ${
              mode === 'form' ? 'bg-white text-teal-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Structured Planner
          </button>
          <button
            type="button"
            onClick={() => setMode('prompt')}
            className={`px-5 py-2 rounded-lg text-sm font-semibold transition ${
              mode === 'prompt' ? 'bg-white text-teal-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Prompt AI Directly
          </button>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-6 sm:p-10">
        <form onSubmit={handleGenerate} className="space-y-6">
          {mode === 'form' ? (
            <>
              {/* Destination */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Destination
                </label>
                <div className="relative">
                  <MapPin className="w-5 h-5 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    required
                    list="destinations-list"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    placeholder="e.g. Goa, Jaipur, Manali, Kerala, Dubai, Bangkok"
                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm font-medium"
                  />
                  <datalist id="destinations-list">
                    {destinations.map((d) => (
                      <option key={d.id} value={d.name} />
                    ))}
                  </datalist>
                </div>
              </div>

              {/* Grid: Dates, Days, Travelers */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Start Date (Optional)
                  </label>
                  <div className="relative">
                    <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Duration: {days} Days
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="14"
                    value={days}
                    onChange={(e) => setDays(Number(e.target.value))}
                    className="w-full accent-teal-600 mt-3"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Travellers: {travellers}
                  </label>
                  <div className="relative">
                    <Users className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                    <input
                      type="number"
                      min="1"
                      max="20"
                      value={travellers}
                      onChange={(e) => setTravellers(Number(e.target.value))}
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Budget & Trip Type */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Estimated Budget (₹ INR)
                  </label>
                  <div className="relative">
                    <Wallet className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                    <input
                      type="number"
                      step="1000"
                      min="2000"
                      value={budget}
                      onChange={(e) => setBudget(Number(e.target.value))}
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm font-semibold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Trip Type
                  </label>
                  <select
                    value={tripType}
                    onChange={(e) => setTripType(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
                  >
                    <option value="leisure">Leisure & Relax</option>
                    <option value="adventure">Adventure & Outdoors</option>
                    <option value="family">Family Vacation</option>
                    <option value="romantic">Romantic Getaway</option>
                    <option value="budget">Backpacker / Budget</option>
                  </select>
                </div>
              </div>

              {/* Interests Tags */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Interests & Preferences
                </label>
                <div className="flex flex-wrap gap-2">
                  {interestOptions.map((item) => {
                    const active = selectedInterests.includes(item)
                    return (
                      <button
                        key={item}
                        type="button"
                        onClick={() => toggleInterest(item)}
                        className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition border ${
                          active
                            ? 'bg-teal-600 text-white border-teal-600 shadow-sm'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {item}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Additional notes */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Specific Requests or Dietary Notes (Optional)
                </label>
                <input
                  type="text"
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  placeholder="e.g. Vegetarian food only, wheelchair friendly, prefer historic monuments"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
                />
              </div>
            </>
          ) : (
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Describe your dream vacation
              </label>
              <textarea
                rows={5}
                required
                value={freeTextPrompt}
                onChange={(e) => setFreeTextPrompt(e.target.value)}
                placeholder="Example: Plan a 4-day trip to Jaipur for a couple under ₹25,000. We want heritage forts, royal palaces, authentic Rajasthani thali, and vibrant local bazaars."
                className="w-full p-4 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm leading-relaxed"
              />
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white text-base font-bold rounded-2xl shadow-lg transition transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Wand2 className="w-5 h-5 animate-spin" />
                Crafting your intelligent itinerary with AI...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                Generate Itinerary
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  )
}
