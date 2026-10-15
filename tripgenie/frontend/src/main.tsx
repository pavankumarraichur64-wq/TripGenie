import React from 'react'
import ReactDOM from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import App from './App'
import './index.css'

// React Query client with sensible defaults for a college demo
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 1000 * 60 * 5, // 5 minutes
    },
  },
})

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
      {/* Global toast notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#14213D',
            color: '#FAF7F2',
            borderRadius: '12px',
            padding: '12px 16px',
            fontSize: '14px',
          },
          success: { iconTheme: { primary: '#0D7377', secondary: '#FAF7F2' } },
          error: { iconTheme: { primary: '#ef4444', secondary: '#FAF7F2' } },
        }}
      />
    </QueryClientProvider>
  </React.StrictMode>,
)
