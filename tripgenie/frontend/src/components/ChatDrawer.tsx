import React, { useState, useEffect, useRef } from 'react'
import { MessageSquare, X, Send, Sparkles, Bot, User } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../services/api'

interface ChatDrawerProps {
  tripId: number
  isOpen: boolean
  onClose: () => void
  onRefreshItinerary: () => void
}

export const ChatDrawer: React.FC<ChatDrawerProps> = ({
  tripId,
  isOpen,
  onClose,
  onRefreshItinerary,
}) => {
  const [messages, setMessages] = useState<any[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isOpen) {
      api.get(`/trips/${tripId}/chat`)
        .then((res) => setMessages(res.data))
        .catch(() => {})
    }
  }, [isOpen, tripId])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || loading) return

    const userText = input
    setInput('')
    setMessages((prev) => [...prev, { role: 'user', content: userText, id: Date.now() }])
    setLoading(true)

    try {
      const res = await api.post(`/trips/${tripId}/chat`, { message: userText })
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: res.data.reply, id: Date.now() + 1 },
      ])
      if (res.data.action === 'suggest_update') {
        toast.success('Itinerary refreshed with your updates!')
        onRefreshItinerary()
      }
    } catch {
      toast.error('Could not get AI response.')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-y-0 right-0 w-full max-w-md bg-white shadow-2xl z-50 flex flex-col border-l border-slate-200">
      {/* Header */}
      <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-teal-700 text-white">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-teal-300" />
          <h3 className="font-bold text-sm">TripGenie Assistant</h3>
        </div>
        <button onClick={onClose} className="p-1 hover:bg-teal-600 rounded-lg transition">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Message List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50">
        {messages.length === 0 && (
          <div className="text-center py-10 px-4 text-slate-500 text-xs">
            <Bot className="w-8 h-8 mx-auto text-teal-600 mb-2 opacity-70" />
            <p className="font-semibold text-slate-700 text-sm">How can I assist your journey?</p>
            <p className="mt-1">Ask me: "Make Day 2 more relaxed", "Suggest dinner near our afternoon spot", or "What should I pack?"</p>
          </div>
        )}

        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex gap-2.5 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {m.role !== 'user' && (
              <div className="w-7 h-7 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Bot className="w-4 h-4" />
              </div>
            )}
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-xs sm:text-sm leading-relaxed ${
                m.role === 'user'
                  ? 'bg-teal-600 text-white rounded-tr-none'
                  : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none shadow-sm'
              }`}
            >
              {m.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex gap-2 items-center text-xs text-slate-500 italic">
            <Bot className="w-4 h-4 text-teal-600 animate-pulse" />
            TripGenie is thinking...
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="p-3 bg-white border-t border-slate-200 flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a question or adjust plan..."
          className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 text-xs sm:text-sm"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="p-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl disabled:opacity-50 transition"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  )
}
