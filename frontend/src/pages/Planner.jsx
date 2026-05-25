import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  MapPin, Navigation, Wallet, CalendarDays, Users,
  Briefcase, Plane, Sparkles, AlertCircle
} from 'lucide-react'
import Navbar from '../components/Navbar'

const travelTypes = [
  { value: 'solo', label: 'Solo', emoji: '🧳' },
  { value: 'couple', label: 'Couple', emoji: '💑' },
  { value: 'family', label: 'Family', emoji: '👨‍👩‍👧‍👦' },
  { value: 'friends', label: 'Friends', emoji: '👥' },
  { value: 'business', label: 'Business', emoji: '💼' },
]

export default function Planner() {
  const nav = useNavigate()
  const [form, setForm] = useState({
    source: '',
    destination: '',
    budget: '',
    duration: '',
    travelType: 'solo',
    groupSize: '1',
  })
  const [error, setError] = useState('')

  const handleChange = (e) => {
    setForm(p => ({ ...p, [e.target.name]: e.target.value }))
    setError('')
  }

  const handleSubmit = () => {
    if (!form.source || !form.destination || !form.budget || !form.duration) {
      setError('Please fill in all required fields.')
      return
    }
    if (Number(form.budget) < 1000) {
      setError('Budget should be at least ₹1,000.')
      return
    }
    if (Number(form.duration) < 1 || Number(form.duration) > 30) {
      setError('Duration should be between 1 and 30 days.')
      return
    }
    sessionStorage.setItem('travelForm', JSON.stringify(form))
    nav('/workflow')
  }

  return (
    <div className="min-h-screen bg-bg">
      <Navbar />
      <div className="relative pt-28 pb-20 px-6">
        <div className="absolute top-20 left-1/3 w-72 h-72 bg-accent2/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute inset-0 bg-grid opacity-20 pointer-events-none" />

        <div className="max-w-2xl mx-auto relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
            <div className="inline-flex items-center gap-2 glass border border-border rounded-full px-4 py-2 mb-4">
              <Sparkles size={13} className="text-accent" />
              <span className="text-xs font-mono text-muted">Multi-Agent AI Planner</span>
            </div>
            <h1 className="text-4xl font-extrabold mb-3">Plan your journey</h1>
          
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass border border-border rounded-2xl p-8 space-y-6"
          >
            {/* Source & Destination */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-muted mb-2 uppercase tracking-wider">From *</label>
                <div className="relative">
                  <Navigation size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                  <input
                    name="source"
                    value={form.source}
                    onChange={handleChange}
                    placeholder="e.g. Mumbai"
                    className="w-full bg-surface border border-border rounded-xl pl-9 pr-4 py-3 text-sm text-text placeholder:text-muted focus:outline-none focus:border-accent/50 transition-colors"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-muted mb-2 uppercase tracking-wider">To *</label>
                <div className="relative">
                  <MapPin size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                  <input
                    name="destination"
                    value={form.destination}
                    onChange={handleChange}
                    placeholder="e.g. Goa"
                    className="w-full bg-surface border border-border rounded-xl pl-9 pr-4 py-3 text-sm text-text placeholder:text-muted focus:outline-none focus:border-accent/50 transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Budget & Duration */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-muted mb-2 uppercase tracking-wider">Budget (₹) *</label>
                <div className="relative">
                  <Wallet size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                  <input
                    name="budget"
                    type="number"
                    value={form.budget}
                    onChange={handleChange}
                    placeholder="e.g. 25000"
                    min="1000"
                    className="w-full bg-surface border border-border rounded-xl pl-9 pr-4 py-3 text-sm text-text placeholder:text-muted focus:outline-none focus:border-accent/50 transition-colors"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-muted mb-2 uppercase tracking-wider">Duration (days) *</label>
                <div className="relative">
                  <CalendarDays size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                  <input
                    name="duration"
                    type="number"
                    value={form.duration}
                    onChange={handleChange}
                    placeholder="e.g. 5"
                    min="1"
                    max="30"
                    className="w-full bg-surface border border-border rounded-xl pl-9 pr-4 py-3 text-sm text-text placeholder:text-muted focus:outline-none focus:border-accent/50 transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Group Size */}
            <div>
              <label className="block text-xs font-semibold text-muted mb-2 uppercase tracking-wider">Group Size</label>
              <div className="relative">
                <Users size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                <input
                  name="groupSize"
                  type="number"
                  value={form.groupSize}
                  onChange={handleChange}
                  placeholder="1"
                  min="1"
                  max="50"
                  className="w-full bg-surface border border-border rounded-xl pl-9 pr-4 py-3 text-sm text-text placeholder:text-muted focus:outline-none focus:border-accent/50 transition-colors"
                />
              </div>
            </div>

            {/* Travel Type */}
            <div>
              <label className="block text-xs font-semibold text-muted mb-3 uppercase tracking-wider">Travel Type</label>
              <div className="flex flex-wrap gap-2">
                {travelTypes.map(t => (
                  <button
                    key={t.value}
                    onClick={() => setForm(p => ({ ...p, travelType: t.value }))}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                      form.travelType === t.value
                        ? 'border-accent bg-accent/10 text-accent'
                        : 'border-border text-muted hover:border-accent/30 hover:text-text'
                    }`}
                  >
                    <span>{t.emoji}</span>
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
                <AlertCircle size={14} className="text-red-400 flex-shrink-0" />
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            <button
              onClick={handleSubmit}
              className="w-full flex items-center justify-center gap-2 bg-accent text-bg font-bold py-4 rounded-xl hover:bg-accent/90 transition-all glow-accent text-base"
            >
              <Plane size={18} />
              Generate AI Travel Plan
            </button>
          </motion.div>

          {/* <p className="text-center text-xs text-muted mt-6 font-mono">
            Powered by Groq • Agno • LangChain • Open-Meteo
          </p> */}
        </div>
      </div>
    </div>
  )
}
