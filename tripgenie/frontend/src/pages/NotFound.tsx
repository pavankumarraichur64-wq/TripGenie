import React from 'react'
import { Link } from 'react-router-dom'
import { Compass, Home } from 'lucide-react'

export const NotFound: React.FC = () => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center">
      <Compass className="w-16 h-16 text-teal-600 animate-spin mb-4 opacity-80" />
      <h1 className="text-3xl font-extrabold text-slate-900">Destination Not Found</h1>
      <p className="text-slate-500 text-sm mt-2 max-w-sm">
        Looks like you've wandered off the itinerary. Let's guide you back to familiar coordinates.
      </p>
      <Link
        to="/"
        className="mt-6 px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md transition flex items-center gap-2"
      >
        <Home className="w-4 h-4" />
        Return to Home
      </Link>
    </div>
  )
}
