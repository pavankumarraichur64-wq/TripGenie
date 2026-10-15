import React, { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { ShieldCheck, CreditCard, Lock, ArrowRight } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../services/api'

export const BookingCheckout: React.FC = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const item = location.state || {
    type: 'hotel',
    itemId: 1,
    title: 'Heritage Stay',
    price: 4500,
    meta: '4 Stars',
  }

  const [name, setName] = useState('Alex Traveler')
  const [email, setEmail] = useState('demo@tripgenie.com')
  const [phone, setPhone] = useState('+91 9876543210')
  const [cardNumber, setCardNumber] = useState('4532 •••• •••• 8892')
  const [loading, setLoading] = useState(false)

  const handleConfirm = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await api.post('/bookings', {
        type: item.type,
        item_id: item.itemId,
        amount: item.price,
        details: {
          title: item.title,
          guest_name: name,
          guest_email: email,
          phone,
        },
      })
      toast.success('Booking confirmed!')
      navigate('/confirmation', { state: { booking: res.data } })
    } catch {
      toast.error('Could not process booking.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="text-center mb-8">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
          Simulated Checkout
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Review your reservation and simulate payment confirmation.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200">
          <form onSubmit={handleConfirm} className="space-y-4">
            <h3 className="font-bold text-slate-900 text-sm mb-2">Guest Information</h3>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Phone</label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
            </div>

            <h3 className="font-bold text-slate-900 text-sm pt-4 mb-2">Mock Payment Details</h3>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span className="flex items-center gap-1 font-semibold text-teal-700">
                  <ShieldCheck className="w-4 h-4 text-teal-600" />
                  Zero-Risk Sandbox Mode
                </span>
                <span>Any test card works</span>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase">Card Number</label>
                <input
                  type="text"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm font-mono mt-1 bg-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  value="12/28"
                  readOnly
                  className="px-3 py-2 rounded-lg border border-slate-200 text-xs font-mono bg-white"
                />
                <input
                  type="text"
                  value="•••"
                  readOnly
                  className="px-3 py-2 rounded-lg border border-slate-200 text-xs font-mono bg-white"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold transition shadow-md flex items-center justify-center gap-2 mt-4"
            >
              {loading ? 'Confirming Reservation...' : `Confirm & Pay ₹${Number(item.price).toLocaleString('en-IN')}`}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>

        {/* Order Summary */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 h-fit space-y-4">
          <h3 className="font-bold text-slate-900 text-sm">Summary</h3>
          <div className="pb-3 border-b border-slate-100">
            <span className="text-[10px] uppercase font-bold text-teal-600">
              {item.type}
            </span>
            <h4 className="font-bold text-slate-900 text-sm mt-0.5">{item.title}</h4>
            <p className="text-xs text-slate-500 mt-1">{item.meta}</p>
          </div>

          <div className="space-y-1.5 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>Base Rate</span>
              <span>₹{Number(item.price).toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Taxes & Fees</span>
              <span>₹0 (Included)</span>
            </div>
            <div className="flex justify-between text-sm font-bold text-slate-900 pt-2 border-t border-slate-100">
              <span>Total Due</span>
              <span className="text-teal-700">₹{Number(item.price).toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
