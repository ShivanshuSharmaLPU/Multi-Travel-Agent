import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Plane, Hotel, CloudSun, Wallet, CalendarDays,
  UtensilsCrossed, Shield, Download, ArrowLeft,
  ThermometerSun, Droplets, Star, CheckCircle,
  MapPin, Clock, ChevronDown, ChevronUp, TrendingDown
} from 'lucide-react'
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts'
import Navbar from '../components/Navbar'
import { generatePDF } from '../services/pdfService'

const Section = ({ icon: Icon, title, color = 'text-accent', children }) => {
  const [open, setOpen] = useState(true)
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="glass border border-border rounded-2xl overflow-hidden"
    >
      <button
        onClick={() => setOpen(p => !p)}
        className="w-full flex items-center justify-between px-6 py-4 hover:bg-white/[0.02] transition-colors"
      >
        <div className="flex items-center gap-3">
          <Icon size={18} className={color} />
          <h2 className="font-bold text-base text-text">{title}</h2>
        </div>
        {open ? <ChevronUp size={16} className="text-muted" /> : <ChevronDown size={16} className="text-muted" />}
      </button>
      {open && <div className="px-6 pb-6">{children}</div>}
    </motion.div>
  )
}

const BUDGET_COLORS = ['#00D4FF', '#7C3AED', '#10B981', '#F59E0B', '#EF4444', '#EC4899', '#8B5CF6']

export default function TravelPlan() {
  const nav = useNavigate()
  const [plan, setPlan] = useState(null)

  useEffect(() => {
    const raw = sessionStorage.getItem('travelPlan')
    if (!raw) { nav('/planner'); return }
    setPlan(JSON.parse(raw))
  }, [nav])

  if (!plan) return (
    <div className="min-h-screen bg-bg flex items-center justify-center">
      <div className="text-muted">Loading plan...</div>
    </div>
  )

  const budgetData = plan.budget_plan?.breakdown
    ? Object.entries(plan.budget_plan.breakdown).map(([name, value]) => ({ name, value: Number(value) }))
    : []

  const weatherDays = plan.weather?.forecast || []

  return (
    <div className="min-h-screen bg-bg">
      <Navbar />
      <div className="pt-24 pb-16 px-4 md:px-6">
        <div className="max-w-4xl mx-auto space-y-5">

          {/* Header */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
            <div className="inline-flex items-center gap-2 glass border border-emerald-400/20 rounded-full px-4 py-2 mb-4">
              <CheckCircle size={13} className="text-emerald-400" />
              <span className="text-xs font-mono text-emerald-400">Travel Plan Ready</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold mb-2">
              {plan.source} <span className="text-muted">→</span> <span className="gradient-text">{plan.destination}</span>
            </h1>
            <p className="text-muted text-sm">{plan.duration} days · ₹{Number(plan.budget).toLocaleString()} budget · {plan.travel_type} trip</p>
          </motion.div>

          {/* Action buttons */}
          <div className="flex gap-3 justify-center mb-6">
            <button
              onClick={() => nav('/planner')}
              className="flex items-center gap-2 glass border border-border px-4 py-2.5 rounded-xl text-sm text-muted hover:text-text hover:border-accent/30 transition-all"
            >
              <ArrowLeft size={14} /> New Plan
            </button>
            <button
              onClick={() => generatePDF(plan)}
              className="flex items-center gap-2 bg-accent text-bg font-bold px-6 py-2.5 rounded-xl text-sm hover:bg-accent/90 transition-all glow-accent"
            >
              <Download size={14} /> Download PDF
            </button>
          </div>

          {/* Transport */}
          <Section icon={Plane} title="Transport Recommendations" color="text-yellow-400">
            <div className="space-y-3 mt-2">
              {(plan.transport?.options || []).map((opt, i) => (
                <div key={i} className={`flex items-center justify-between p-4 rounded-xl border transition-all ${opt.recommended ? 'border-accent/40 bg-accent/5' : 'border-border bg-surface'}`}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-surface border border-border flex items-center justify-center text-lg">
                      {opt.type === 'flight' ? '✈️' : opt.type === 'train' ? '🚂' : '🚌'}
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-text">{opt.name}</p>
                      <p className="text-xs text-muted">{opt.duration} · {opt.type}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-sm text-text">₹{Number(opt.cost).toLocaleString()}</p>
                    {opt.recommended && <span className="text-xs text-accent font-mono">Best Pick</span>}
                  </div>
                </div>
              ))}
            </div>
            {plan.transport?.recommendation && (
              <p className="mt-4 text-sm text-muted bg-surface border border-border rounded-xl p-3 leading-relaxed">
                💡 {plan.transport.recommendation}
              </p>
            )}
          </Section>

          {/* Hotels */}
          <Section icon={Hotel} title="Hotel Suggestions" color="text-pink-400">
            <div className="space-y-3 mt-2">
              {(plan.hotels?.options || []).map((h, i) => (
                <div key={i} className={`p-4 rounded-xl border ${h.recommended ? 'border-pink-400/30 bg-pink-400/5' : 'border-border bg-surface'}`}>
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold text-sm text-text">{h.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <MapPin size={11} className="text-muted" />
                        <span className="text-xs text-muted">{h.area}</span>
                        {h.rating && (
                          <>
                            <Star size={11} className="text-yellow-400" />
                            <span className="text-xs text-yellow-400">{h.rating}/5</span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-sm text-text">₹{Number(h.pricePerNight).toLocaleString()}</p>
                      <p className="text-xs text-muted">per night</p>
                    </div>
                  </div>
                  {h.amenities?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {h.amenities.slice(0, 4).map((a, j) => (
                        <span key={j} className="text-xs bg-surface border border-border rounded-full px-2 py-0.5 text-muted">{a}</span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Section>

          {/* Weather */}
          <Section icon={CloudSun} title="Weather Forecast" color="text-cyan-400">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-2 mb-4">
              <div className="bg-surface border border-border rounded-xl p-4 text-center">
                <ThermometerSun size={20} className="text-cyan-400 mx-auto mb-1" />
                <p className="text-2xl font-bold text-text">{plan.weather?.avgTemp}°C</p>
                <p className="text-xs text-muted mt-1">Avg Temperature</p>
              </div>
              <div className="bg-surface border border-border rounded-xl p-4 text-center">
                <Droplets size={20} className="text-blue-400 mx-auto mb-1" />
                <p className="text-2xl font-bold text-text">{plan.weather?.avgRain || 0}%</p>
                <p className="text-xs text-muted mt-1">Rain Probability</p>
              </div>
              <div className="bg-surface border border-border rounded-xl p-4 text-center">
                <CloudSun size={20} className="text-yellow-400 mx-auto mb-1" />
                <p className="text-lg font-bold text-text">{plan.weather?.condition}</p>
                <p className="text-xs text-muted mt-1">General Condition</p>
              </div>
            </div>
            {weatherDays.length > 0 && (
              <ResponsiveContainer width="100%" height={160}>
                <BarChart data={weatherDays.slice(0, 7)} margin={{ left: -20, right: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1E2D45" />
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#4B6080' }} />
                  <YAxis tick={{ fontSize: 10, fill: '#4B6080' }} />
                  <Tooltip contentStyle={{ background: '#0D1420', border: '1px solid #1E2D45', borderRadius: 8, fontSize: 11 }} />
                  <Bar dataKey="temp_max" name="Max °C" fill="#00D4FF" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="temp_min" name="Min °C" fill="#7C3AED" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
            {plan.weather?.advice && (
              <p className="mt-3 text-sm text-muted bg-surface border border-border rounded-xl p-3">{plan.weather.advice}</p>
            )}
            {plan.weather?.packing?.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {plan.weather.packing.map((p, i) => (
                  <span key={i} className="text-xs bg-cyan-400/10 border border-cyan-400/20 rounded-full px-3 py-1 text-cyan-400">{p}</span>
                ))}
              </div>
            )}
          </Section>

          {/* Budget */}
          <Section icon={Wallet} title="Budget Breakdown" color="text-green-400">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={budgetData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} paddingAngle={3}>
                    {budgetData.map((_, i) => (
                      <Cell key={i} fill={BUDGET_COLORS[i % BUDGET_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ background: '#0D1420', border: '1px solid #1E2D45', borderRadius: 8, fontSize: 11 }}
                    formatter={(v) => [`₹${Number(v).toLocaleString()}`, '']}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2">
                {budgetData.map((d, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: BUDGET_COLORS[i % BUDGET_COLORS.length] }} />
                      <span className="text-xs text-muted">{d.name}</span>
                    </div>
                    <span className="text-xs font-mono text-text">₹{Number(d.value).toLocaleString()}</span>
                  </div>
                ))}
                <div className="pt-2 border-t border-border flex justify-between">
                  <span className="text-xs font-bold text-text">Total</span>
                  <span className="text-xs font-bold font-mono text-accent">₹{Number(plan.budget_plan?.total || 0).toLocaleString()}</span>
                </div>
              </div>
            </div>
            {plan.budget_plan?.savings_tip && (
              <div className="mt-4 flex items-start gap-2 bg-green-400/5 border border-green-400/20 rounded-xl p-3">
                <TrendingDown size={14} className="text-green-400 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-green-400">{plan.budget_plan.savings_tip}</p>
              </div>
            )}
          </Section>

          {/* Itinerary */}
          <Section icon={CalendarDays} title="Day-wise Itinerary" color="text-purple-400">
            <div className="space-y-4 mt-2">
              {(plan.itinerary?.days || []).map((day, i) => (
                <div key={i} className="border-l-2 border-purple-400/30 pl-4">
                  <p className="font-bold text-sm text-purple-400 mb-2">Day {i + 1} — {day.theme}</p>
                  <div className="space-y-2">
                    {(day.activities || []).map((act, j) => (
                      <div key={j} className="flex items-start gap-3 bg-surface border border-border rounded-lg p-3">
                        <div className="flex items-center gap-1 text-xs text-muted font-mono flex-shrink-0 mt-0.5">
                          <Clock size={10} />
                          {act.time}
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-text">{act.activity}</p>
                          {act.description && <p className="text-xs text-muted mt-0.5">{act.description}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Section>

          {/* Local Guide */}
          <Section icon={UtensilsCrossed} title="Local Recommendations" color="text-orange-400">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
              {[
                { key: 'restaurants', label: '🍽 Restaurants', color: 'text-orange-400' },
                { key: 'cafes', label: '☕ Cafés', color: 'text-yellow-400' },
                { key: 'hidden_gems', label: '💎 Hidden Gems', color: 'text-cyan-400' },
                { key: 'shopping', label: '🛍 Shopping', color: 'text-pink-400' },
              ].map(cat => (
                plan.local_guide?.[cat.key]?.length > 0 && (
                  <div key={cat.key} className="bg-surface border border-border rounded-xl p-4">
                    <p className={`text-xs font-bold mb-3 ${cat.color}`}>{cat.label}</p>
                    <div className="space-y-1.5">
                      {plan.local_guide[cat.key].map((item, i) => (
                        <p key={i} className="text-xs text-muted flex items-center gap-2">
                          <span className="text-accent">·</span> {item}
                        </p>
                      ))}
                    </div>
                  </div>
                )
              ))}
            </div>
          </Section>

          {/* Safety */}
          <Section icon={Shield} title="Safety & Travel Tips" color="text-red-400">
            <div className="mt-2 space-y-4">
              {plan.safety?.precautions?.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-muted mb-2 uppercase tracking-wider">Precautions</p>
                  <div className="space-y-2">
                    {plan.safety.precautions.map((p, i) => (
                      <div key={i} className="flex items-start gap-2 text-sm text-muted">
                        <CheckCircle size={13} className="text-red-400 flex-shrink-0 mt-0.5" />
                        {p}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {plan.safety?.scam_warnings?.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-muted mb-2 uppercase tracking-wider">Scam Alerts</p>
                  <div className="space-y-2">
                    {plan.safety.scam_warnings.map((w, i) => (
                      <div key={i} className="flex items-start gap-2 text-sm text-muted">
                        <span className="text-yellow-400 flex-shrink-0">⚠</span>
                        {w}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {plan.safety?.emergency_contacts && (
                <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-4">
                  <p className="text-xs font-semibold text-red-400 mb-1">Emergency Contacts</p>
                  <p className="text-xs text-muted">{plan.safety.emergency_contacts}</p>
                </div>
              )}
            </div>
          </Section>

          {/* Download CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="glass border border-accent/20 rounded-2xl p-8 text-center"
          >
            <Download size={32} className="text-accent mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">Save your travel plan</h3>
            <p className="text-muted text-sm mb-6">Download a professional PDF with your complete itinerary, budget, hotels, and more.</p>
            <button
              onClick={() => generatePDF(plan)}
              className="inline-flex items-center gap-2 bg-accent text-bg font-bold px-8 py-3.5 rounded-xl hover:bg-accent/90 transition-all glow-accent"
            >
              <Download size={16} />
              Download PDF Plan
            </button>
          </motion.div>

        </div>
      </div>
    </div>
  )
}
