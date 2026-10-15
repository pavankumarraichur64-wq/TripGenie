import React, { useState, useEffect } from 'react'
import { Users, MapPin, Hotel, Plane, ShieldCheck, DollarSign } from 'lucide-react'
import api from '../services/api'

export const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<any>(null)
  const [bookings, setBookings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([api.get('/admin/stats'), api.get('/admin/bookings')])
      .then(([statsRes, bookingsRes]) => {
        setStats(statsRes.data)
        setBookings(bookingsRes.data || [])
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return <div className="py-20 text-center text-slate-400">Loading admin control center...</div>
  }

  const statCards = [
    { label: 'Total Users', value: stats?.total_users || 0, icon: Users, color: 'text-blue-600' },
    { label: 'Generated Trips', value: stats?.total_trips || 0, icon: MapPin, color: 'text-teal-600' },
    { label: 'Bookings Made', value: stats?.total_bookings || 0, icon: ShieldCheck, color: 'text-emerald-600' },
    { label: 'Platform Revenue', value: `₹${Number(stats?.revenue || 0).toLocaleString('en-IN')}`, icon: DollarSign, color: 'text-amber-600' },
    { label: 'Destinations', value: stats?.total_destinations || 0, icon: MapPin, color: 'text-purple-600' },
    { label: 'Seeded Hotels', value: stats?.total_hotels || 0, icon: Hotel, color: 'text-rose-600' },
    { label: 'Seeded Flights', value: stats?.total_flights || 0, icon: Plane, color: 'text-indigo-600' },
  ]

  return (
    <div className="max-w-6xl mx-auto px-4 py-10 space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
          Admin Control Center
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          High-level operational overview, database metrics, and global transaction logs.
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {statCards.map((c) => {
          const Icon = c.icon
          return (
            <div key={c.label} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-500">{c.label}</span>
                <Icon className={`w-4 h-4 ${c.color}`} />
              </div>
              <div className="text-xl font-extrabold text-slate-900">{c.value}</div>
            </div>
          )
        })}
      </div>

      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
        <h2 className="text-base font-bold text-slate-900">Recent Platform Transactions</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase">
              <tr>
                <th className="py-2.5 px-3">Booking Ref</th>
                <th className="py-2.5 px-3">Type</th>
                <th className="py-2.5 px-3">Amount</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {bookings.map((b) => (
                <tr key={b.id} className="hover:bg-slate-50/50">
                  <td className="py-2.5 px-3 font-mono font-bold text-teal-700">{b.booking_ref}</td>
                  <td className="py-2.5 px-3 uppercase text-slate-600">{b.type}</td>
                  <td className="py-2.5 px-3 font-semibold text-slate-900">
                    ₹{Number(b.amount).toLocaleString('en-IN')}
                  </td>
                  <td className="py-2.5 px-3">
                    <span className="px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 font-bold text-[10px]">
                      {b.status}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-slate-400">
                    {new Date(b.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
