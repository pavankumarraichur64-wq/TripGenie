import React from 'react'
import { useAuth } from '../context/AuthContext'
import { User, Mail, Shield, LogOut } from 'lucide-react'

export const Profile: React.FC = () => {
  const { user, logout } = useAuth()

  if (!user) return null

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm text-center">
        <div className="w-16 h-16 rounded-full bg-teal-50 text-teal-600 flex items-center justify-center font-bold text-2xl mx-auto mb-4">
          {user.name.charAt(0).toUpperCase()}
        </div>
        <h1 className="text-xl font-extrabold text-slate-900">{user.name}</h1>
        <p className="text-slate-500 text-xs mt-0.5">{user.email}</p>

        <div className="mt-6 pt-6 border-t border-slate-100 text-left space-y-3 text-xs">
          <div className="flex justify-between items-center py-1">
            <span className="text-slate-500 flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-slate-400" /> Role
            </span>
            <span className="font-bold text-teal-700 capitalize bg-teal-50 px-2.5 py-0.5 rounded-md">
              {user.role}
            </span>
          </div>
          <div className="flex justify-between items-center py-1">
            <span className="text-slate-500 flex items-center gap-1.5">
              <Mail className="w-4 h-4 text-slate-400" /> Account Status
            </span>
            <span className="font-semibold text-emerald-600">Active</span>
          </div>
        </div>

        <button
          onClick={logout}
          className="w-full mt-8 py-2.5 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-bold transition flex items-center justify-center gap-2"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </div>
  )
}
