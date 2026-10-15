/**
 * TripGenie — Navigation Bar
 * Responsive top nav with links, auth state, and mobile hamburger menu.
 */
import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { MapPin, Menu, X, LogOut, User, LayoutDashboard } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

export default function Navbar() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  const handleLogout = () => {
    logout()
    toast.success('Logged out successfully')
    navigate('/')
  }

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `text-sm font-medium transition-colors duration-150 ${
      isActive ? 'text-primary' : 'text-gray-600 hover:text-primary'
    }`

  return (
    <nav className="sticky top-0 z-50 glass border-b border-white/60 shadow-sm">
      <div className="container-page">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
              <MapPin size={16} className="text-white" />
            </div>
            <span className="font-display font-bold text-xl text-dark">
              Trip<span className="text-primary">Genie</span>
            </span>
          </Link>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-6">
            <NavLink to="/hotels" className={navLinkClass}>Hotels</NavLink>
            <NavLink to="/flights" className={navLinkClass}>Flights</NavLink>
            {isAuthenticated && (
              <>
                <NavLink to="/plan" className={navLinkClass}>Plan Trip</NavLink>
                <NavLink to="/my-trips" className={navLinkClass}>My Trips</NavLink>
              </>
            )}
            {isAdmin && (
              <NavLink to="/admin" className={navLinkClass}>Admin</NavLink>
            )}
          </div>

          {/* Desktop Auth */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <>
                <span className="text-sm text-gray-500">Hi, {user?.name.split(' ')[0]}</span>
                <Link to="/profile" className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
                  <User size={18} className="text-gray-600" />
                </Link>
                {isAdmin && (
                  <Link to="/admin" className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
                    <LayoutDashboard size={18} className="text-gray-600" />
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="p-2 rounded-lg hover:bg-red-50 transition-colors"
                  title="Logout"
                >
                  <LogOut size={18} className="text-gray-400 hover:text-red-500" />
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn-secondary py-2 px-4 text-xs">Log in</Link>
                <Link to="/register" className="btn-primary py-2 px-4 text-xs">Sign up</Link>
              </>
            )}
          </div>

          {/* Mobile Hamburger */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-gray-100"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white/95 backdrop-blur-sm animate-fade-in">
          <div className="container-page py-4 flex flex-col gap-3">
            <NavLink to="/hotels" className={navLinkClass} onClick={() => setMenuOpen(false)}>Hotels</NavLink>
            <NavLink to="/flights" className={navLinkClass} onClick={() => setMenuOpen(false)}>Flights</NavLink>
            {isAuthenticated && (
              <>
                <NavLink to="/plan" className={navLinkClass} onClick={() => setMenuOpen(false)}>Plan Trip</NavLink>
                <NavLink to="/my-trips" className={navLinkClass} onClick={() => setMenuOpen(false)}>My Trips</NavLink>
                <NavLink to="/profile" className={navLinkClass} onClick={() => setMenuOpen(false)}>Profile</NavLink>
              </>
            )}
            {isAdmin && (
              <NavLink to="/admin" className={navLinkClass} onClick={() => setMenuOpen(false)}>Admin Dashboard</NavLink>
            )}
            <div className="pt-3 border-t border-gray-100 flex gap-2">
              {isAuthenticated ? (
                <button onClick={handleLogout} className="btn-secondary w-full justify-center py-2 text-xs">
                  Logout
                </button>
              ) : (
                <>
                  <Link to="/login" className="btn-secondary flex-1 text-center py-2 text-xs" onClick={() => setMenuOpen(false)}>Log in</Link>
                  <Link to="/register" className="btn-primary flex-1 text-center py-2 text-xs" onClick={() => setMenuOpen(false)}>Sign up</Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}
