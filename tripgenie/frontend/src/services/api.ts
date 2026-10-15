/**
 * TripGenie — Axios API Client
 * Single instance with base URL + JWT auth interceptor.
 */
import axios from 'axios'

const api = axios.create({
  baseURL: '/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
})

// ── Request interceptor — attach JWT token ────────────────────────────────────
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('tripgenie_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// ── Response interceptor — handle 401 globally ───────────────────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear stale token and redirect to login
      localStorage.removeItem('tripgenie_token')
      localStorage.removeItem('tripgenie_user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api
