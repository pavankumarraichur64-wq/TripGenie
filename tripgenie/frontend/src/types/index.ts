/**
 * TripGenie — TypeScript Type Definitions
 * Shared interfaces used across pages and services.
 */

// ── Auth ──────────────────────────────────────────────────────────────────────
export interface User {
  id: number
  name: string
  email: string
  role: 'user' | 'admin'
  created_at: string
}

export interface AuthState {
  user: User | null
  token: string | null
}

// ── Destinations ──────────────────────────────────────────────────────────────
export interface Destination {
  id: number
  name: string
  country: string
  description: string
  best_season: string
  image_url: string
  avg_daily_cost: number
}

// ── Hotels ────────────────────────────────────────────────────────────────────
export interface Hotel {
  id: number
  destination_id: number
  name: string
  stars: number
  rating: number
  price_per_night: number
  amenities: string[]
  image_url: string
  address: string
}

// ── Flights ───────────────────────────────────────────────────────────────────
export interface Flight {
  id: number
  airline: string
  flight_no: string
  origin: string
  destination: string
  depart_time: string
  arrive_time: string
  duration_min: number
  price: number
  flight_class: string
  seats_available: number
}

export interface LocalTransportOption {
  mode: string
  description: string
  estimated_fare: number
  estimated_minutes: number
  currency: string
  is_mock: boolean
}

export interface PlaceLookup {
  name: string
  latitude: number | null
  longitude: number | null
  location_source: string | null
  photo_url: string | null
  photo_page_url: string | null
  photo_artist: string | null
  photo_license: string | null
}

// ── Itinerary ─────────────────────────────────────────────────────────────────
export interface ItineraryItem {
  id: number
  day_id: number
  time_slot: 'Morning' | 'Afternoon' | 'Evening' | 'Night'
  title: string
  description: string
  category: 'Food' | 'Activity' | 'Transport' | 'Accommodation' | 'Shopping'
  estimated_cost: number
  position: number
  place_name?: string | null
  latitude?: number | null
  longitude?: number | null
  photo_url?: string | null
  photo_credit?: string | null
  location_source?: string | null
}

export interface ItineraryDay {
  id: number
  trip_id: number
  day_number: number
  title: string
  summary: string
  items: ItineraryItem[]
  local_transport?: LocalTransportOption[]
}

// ── Trips ─────────────────────────────────────────────────────────────────────
export interface Trip {
  id: number
  user_id: number
  destination_id: number | null
  destination_name?: string | null
  latitude?: number | null
  longitude?: number | null
  map_location_source?: string | null
  title: string
  start_date: string | null
  days: number
  travellers: number
  budget: number | null
  trip_type: string | null
  interests: string[]
  total_estimated_cost: number | null
  status: string
  created_at: string
  itinerary_days?: ItineraryDay[]
}

export interface BudgetBreakdown {
  flights: number
  stay: number
  food: number
  activities: number
  local_travel: number
  total: number
}

// ── Bookings ──────────────────────────────────────────────────────────────────
export interface Booking {
  id: number
  user_id: number
  trip_id: number | null
  booking_type: 'hotel' | 'flight'
  item_id: number
  booking_ref: string
  amount: number
  status: string
  details: Record<string, unknown>
  created_at: string
}

// ── Chat ──────────────────────────────────────────────────────────────────────
export interface ChatMessage {
  id: number
  trip_id: number
  role: 'user' | 'assistant'
  content: string
  created_at: string
}

// ── API Responses ─────────────────────────────────────────────────────────────
export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  per_page: number
}
