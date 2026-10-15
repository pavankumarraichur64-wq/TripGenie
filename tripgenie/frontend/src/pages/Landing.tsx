/**
 * TripGenie — Landing Page
 * Premium travel-themed hero with animated gradient, feature cards, and destinations showcase.
 */
import { Link } from 'react-router-dom'
import { Sparkles, MapPin, Hotel, Plane, MessageSquare, Shield, Zap } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const FEATURES = [
  {
    icon: Sparkles,
    title: 'AI Itinerary Generation',
    desc: 'Describe your trip in plain language and get a personalized day-wise plan in seconds.',
    color: 'text-primary bg-primary/10',
  },
  {
    icon: Hotel,
    title: 'Hotel Search',
    desc: 'Browse and filter hotels across top destinations — from budget hostels to luxury resorts.',
    color: 'text-blue-600 bg-blue-50',
  },
  {
    icon: Plane,
    title: 'Flight Booking',
    desc: 'Find flights for your dates, compare prices, and book instantly with a simulated checkout.',
    color: 'text-purple-600 bg-purple-50',
  },
  {
    icon: MessageSquare,
    title: 'AI Chat Refinement',
    desc: 'Chat with TripGenie to tweak your itinerary — "make day 2 cheaper" or "add a temple visit".',
    color: 'text-accent bg-accent/10',
  },
  {
    icon: Shield,
    title: 'Secure & Private',
    desc: 'Your trips belong to you. JWT-secured accounts with bcrypt password hashing.',
    color: 'text-green-600 bg-green-50',
  },
  {
    icon: Zap,
    title: 'Budget Tracking',
    desc: 'See a real-time cost breakdown across flights, stay, food, activities, and local travel.',
    color: 'text-orange-500 bg-orange-50',
  },
]

const DESTINATIONS = [
  { name: 'Goa', tag: 'Beaches & Nightlife', emoji: '🏖️' },
  { name: 'Jaipur', tag: 'Heritage & Culture', emoji: '🏰' },
  { name: 'Manali', tag: 'Adventure & Snow', emoji: '⛷️' },
  { name: 'Kerala', tag: 'Backwaters & Nature', emoji: '🌿' },
  { name: 'Ladakh', tag: 'Mountains & Monasteries', emoji: '🏔️' },
  { name: 'Dubai', tag: 'Luxury & Shopping', emoji: '🌆' },
  { name: 'Bangkok', tag: 'Temples & Street Food', emoji: '🛕' },
  { name: 'Andaman', tag: 'Diving & Islands', emoji: '🤿' },
]

export default function Landing() {
  const { isAuthenticated } = useAuth()

  return (
    <div className="overflow-x-hidden">
      {/* ── Hero Section ─────────────────────────────────────────────────────── */}
      <section className="relative min-h-[92vh] flex items-center overflow-hidden">
        {/* Gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary-900 via-primary-700 to-dark" />
        {/* Animated blobs */}
        <div className="absolute top-20 right-10 w-96 h-96 bg-accent/20 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-20 left-10 w-80 h-80 bg-primary/30 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }} />

        <div className="container-page relative z-10 py-24">
          <div className="max-w-3xl">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full text-white/80 text-sm font-medium mb-6 backdrop-blur-sm border border-white/20">
              <Sparkles size={14} className="text-accent" />
              Powered by Groq AI — LLaMA 3.1
            </div>

            {/* Headline */}
            <h1 className="font-display text-5xl md:text-7xl font-bold text-white leading-tight mb-6">
              Plan your perfect{' '}
              <span className="text-accent">trip</span>{' '}
              with AI
            </h1>

            <p className="text-xl text-white/70 mb-10 leading-relaxed max-w-2xl">
              Just describe your dream trip in plain language — 
              <em className="text-white/90"> "3 days in Jaipur under ₹15,000, family"</em> — 
              and TripGenie builds a complete itinerary with hotels, flights, and a budget breakdown.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                to={isAuthenticated ? '/plan' : '/register'}
                className="btn-accent text-base px-8 py-4 shadow-xl shadow-accent/30"
              >
                <Sparkles size={20} />
                {isAuthenticated ? 'Plan a Trip' : 'Get Started Free'}
              </Link>
              <Link
                to="/hotels"
                className="inline-flex items-center gap-2 px-8 py-4 bg-white/10 text-white rounded-xl font-semibold text-base border border-white/20 hover:bg-white/20 transition-all backdrop-blur-sm"
              >
                <Hotel size={20} />
                Browse Hotels
              </Link>
            </div>

            {/* Social proof */}
            <div className="mt-12 flex items-center gap-6 text-white/50 text-sm">
              <div><span className="text-white font-semibold">10+</span> Destinations</div>
              <div className="w-px h-4 bg-white/20" />
              <div><span className="text-white font-semibold">50+</span> Hotels</div>
              <div className="w-px h-4 bg-white/20" />
              <div><span className="text-white font-semibold">120+</span> Flights</div>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/40">
          <span className="text-xs">Scroll to explore</span>
          <div className="w-px h-8 bg-white/20 animate-pulse" />
        </div>
      </section>

      {/* ── How it works ─────────────────────────────────────────────────────── */}
      <section className="section bg-white">
        <div className="container-page">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-display font-bold text-dark mb-4">
              From prompt to itinerary in{' '}
              <span className="text-gradient">seconds</span>
            </h2>
            <p className="text-gray-500 text-lg max-w-xl mx-auto">
              No more juggling 10 tabs. One sentence. One complete trip plan.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: '01', title: 'Describe Your Trip', desc: 'Type a free-text prompt or fill a quick form with destination, dates, budget, and interests.', icon: '✍️' },
              { step: '02', title: 'AI Builds Your Plan', desc: 'Groq AI generates a day-wise itinerary with activities, timings, costs, and a budget breakdown.', icon: '🤖' },
              { step: '03', title: 'Book & Go', desc: 'Pick hotels and flights from our database, complete a mock booking, and download your PDF.', icon: '✈️' },
            ].map(({ step, title, desc, icon }) => (
              <div key={step} className="relative">
                <div className="card p-8 h-full">
                  <div className="text-4xl mb-4">{icon}</div>
                  <div className="text-xs font-bold text-primary/50 tracking-widest mb-2">STEP {step}</div>
                  <h3 className="text-xl font-semibold text-dark mb-3">{title}</h3>
                  <p className="text-gray-500 leading-relaxed">{desc}</p>
                </div>
                {step !== '03' && (
                  <div className="hidden md:block absolute top-1/2 -right-4 -translate-y-1/2 text-gray-300 text-2xl z-10">→</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────────────────────────── */}
      <section className="section bg-surface">
        <div className="container-page">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-display font-bold text-dark mb-4">
              Everything you need,{' '}
              <span className="text-gradient">all in one place</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map(({ icon: Icon, title, desc, color }) => (
              <div key={title} className="card p-6 group hover:-translate-y-1 transition-transform duration-200">
                <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <Icon size={22} />
                </div>
                <h3 className="font-semibold text-dark text-lg mb-2">{title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Destinations ─────────────────────────────────────────────────────── */}
      <section className="section bg-white">
        <div className="container-page">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-display font-bold text-dark mb-4">
              Popular <span className="text-gradient">destinations</span>
            </h2>
            <p className="text-gray-500">Plan trips to these beautiful places with AI</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {DESTINATIONS.map(({ name, tag, emoji }) => (
              <Link
                key={name}
                to={isAuthenticated ? '/plan' : '/register'}
                className="group card p-5 flex flex-col gap-2 hover:-translate-y-1 transition-transform duration-200 cursor-pointer"
              >
                <div className="text-3xl">{emoji}</div>
                <div className="font-semibold text-dark group-hover:text-primary transition-colors">{name}</div>
                <div className="text-xs text-gray-400">{tag}</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ───────────────────────────────────────────────────────── */}
      <section className="section bg-gradient-to-r from-primary-900 to-dark">
        <div className="container-page text-center">
          <h2 className="text-4xl font-display font-bold text-white mb-6">
            Ready to plan your next adventure?
          </h2>
          <p className="text-white/60 text-lg mb-8">
            Join TripGenie today — it's free and takes 30 seconds to sign up.
          </p>
          <Link
            to={isAuthenticated ? '/plan' : '/register'}
            className="btn-accent text-base px-10 py-4 shadow-xl shadow-accent/30 inline-flex"
          >
            <Sparkles size={20} />
            {isAuthenticated ? 'Plan a Trip Now' : 'Start Planning Free'}
          </Link>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────────────────────── */}
      <footer className="bg-dark text-white/40 py-8">
        <div className="container-page flex flex-col md:flex-row items-center justify-between gap-4 text-sm">
          <div className="flex items-center gap-2">
            <MapPin size={14} className="text-primary" />
            <span className="font-display font-bold text-white/60">TripGenie</span>
          </div>
          <p>BCA Final Year Project · Built with React, FastAPI & Groq AI</p>
          <p>© {new Date().getFullYear()} TripGenie</p>
        </div>
      </footer>
    </div>
  )
}
