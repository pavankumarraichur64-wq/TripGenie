import React from 'react'
import { useLocation, Link } from 'react-router-dom'
import { CheckCircle2, Ticket, ArrowRight, Home } from 'lucide-react'

export const BookingConfirmation: React.FC = () => {
  const location = useLocation()
  const booking = location.state?.booking || {
    booking_ref: 'TG-20261015-A1B2',
    amount: 4500,
    type: 'hotel',
    status: 'confirmed',
    created_at: new Date().toISOString(),
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-16 text-center">
      <div className="w-16 h-16 rounded-full bg-teal-50 text-teal-600 flex items-center justify-center mx-auto mb-4">
        <CheckCircle2 className="w-10 h-10" />
      </div>
      <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
        Booking Confirmed!
      </h1>
      <p className="text-slate-500 text-sm mt-1">
        Your travel reservation has been secured. Save your booking reference below.
      </p>

      <div className="mt-8 bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200 text-left space-y-4">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <span className="text-xs text-slate-400 font-semibold uppercase">Booking Ref</span>
            <div className="text-lg font-mono font-extrabold text-teal-700">
              {booking.booking_ref}
            </div>
          </div>
          <span className="px-3 py-1 rounded-full bg-teal-50 text-teal-700 text-xs font-bold uppercase">
            {booking.status}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4 text-xs">
          <div>
            <span className="text-slate-400">Category</span>
            <div className="font-semibold text-slate-900 uppercase mt-0.5">{booking.type}</div>
          </div>
          <div>
            <span className="text-slate-400">Amount Paid</span>
            <div className="font-semibold text-slate-900 mt-0.5">
              ₹{Number(booking.amount).toLocaleString('en-IN')}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
        <Link
          to="/my-trips"
          className="px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-sm font-bold transition shadow-sm flex items-center justify-center gap-2"
        >
          View in My Trips
          <ArrowRight className="w-4 h-4" />
        </Link>
        <Link
          to="/"
          className="px-6 py-3 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-sm font-semibold transition flex items-center justify-center gap-2"
        >
          <Home className="w-4 h-4" />
          Home
        </Link>
      </div>
    </div>
  )
}
