import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './context/AuthContext'
import Navbar from './components/Navbar'
import ProtectedRoute from './components/ProtectedRoute'

import Landing from './pages/Landing'
import { Login } from './pages/Login'
import { Register } from './pages/Register'
import { PlanTrip } from './pages/PlanTrip'
import { Itinerary } from './pages/Itinerary'
import { Hotels } from './pages/Hotels'
import { Flights } from './pages/Flights'
import { BookingCheckout } from './pages/BookingCheckout'
import { BookingConfirmation } from './pages/BookingConfirmation'
import { MyTrips } from './pages/MyTrips'
import { AdminDashboard } from './pages/AdminDashboard'
import { Profile } from './pages/Profile'
import { NotFound } from './pages/NotFound'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans antialiased">
          <Toaster position="top-right" />
          <Navbar />
          <main className="flex-1">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Landing />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Protected User Routes */}
              <Route element={<ProtectedRoute />}>
                <Route path="/plan" element={<PlanTrip />} />
                <Route path="/itinerary/:id" element={<Itinerary />} />
                <Route path="/hotels" element={<Hotels />} />
                <Route path="/flights" element={<Flights />} />
                <Route path="/checkout" element={<BookingCheckout />} />
                <Route path="/confirmation" element={<BookingConfirmation />} />
                <Route path="/my-trips" element={<MyTrips />} />
                <Route path="/profile" element={<Profile />} />
              </Route>

              {/* Admin Routes */}
              <Route element={<ProtectedRoute requireAdmin />}>
                <Route path="/admin" element={<AdminDashboard />} />
              </Route>

              {/* 404 Catch-All */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
        </div>
      </AuthProvider>
    </BrowserRouter>
  )
}
