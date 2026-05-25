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
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.25 }}
      className="glass border border-border rounded-xl overflow-hidden"
    >
      <button
        onClick={() => setOpen(p => !p)}
        className="w-full flex items-center justify-between px-5 py-3 hover:bg-white/[0.02] transition-colors"
      >
        <div className="flex items-center gap-2.5">
          <Icon size={16} className={color} />
          <h2 className="font-bold text-sm text-text">{title}</h2>
        </div>
        {open
          ? <ChevronUp size={14} className="text-muted" />
          : <ChevronDown size={14} className="text-muted" />}
      </button>
      {open && <div className="px-5 pb-4">{children}</div>}
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
      <div className="text-muted text-sm">Loading plan...</div>
    </div>
  )

  const budgetData = plan.budget_plan?.breakdown
    ? Object.entries(plan.budget_plan.breakdown).map(([name, value]) => ({ name, value: Number(value) }))
    : []

  const weatherDays = plan.weather?.forecast || []

  return (
    <div className="min-h-screen bg-bg">
      <Navbar />

      <div className="pt-16 pb-8 px-3 md:px-5">
        <div className="max-w-3xl mx-auto space-y-3">

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-4"
          >
            <div className="inline-flex items-center gap-1.5 glass border border-emerald-400/20 rounded-full px-3 py-1 mb-2">
              <CheckCircle size={11} className="text-emerald-400" />
              <span className="text-xs font-mono text-emerald-400">Travel Plan Ready</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold mb-1">
              {plan.source} <span className="text-muted">→</span>{' '}
              <span className="gradient-text">{plan.destination}</span>
            </h1>
            <p className="text-muted text-xs">
              {plan.duration} days · ₹{Number(plan.budget).toLocaleString()} budget · {plan.travel_type} trip
            </p>
          </motion.div>

          {/* Action buttons */}
          <div className="flex gap-2 justify-center pb-1">
            <button
              onClick={() => nav('/planner')}
              className="flex items-center gap-1.5 glass border border-border px-3 py-2 rounded-lg text-xs text-muted hover:text-text hover:border-accent/30 transition-all"
            >
              <ArrowLeft size={12} /> New Plan
            </button>
            <button
              onClick={() => generatePDF(plan)}
              className="flex items-center gap-1.5 bg-accent text-bg font-bold px-5 py-2 rounded-lg text-xs hover:bg-accent/90 transition-all glow-accent"
            >
              <Download size={12} /> Download PDF
            </button>
          </div>

          {/* Transport */}
          <Section icon={Plane} title="Transport Recommendations" color="text-yellow-400">
            <div className="space-y-2 mt-1">
              {(plan.transport?.options || []).map((opt, i) => (
                <div
                  key={i}
                  className={`flex items-center justify-between p-3 rounded-lg border transition-all ${opt.recommended ? 'border-accent/40 bg-accent/5' : 'border-border bg-surface'}`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-surface border border-border flex items-center justify-center text-base">
                      {opt.type === 'flight' ? '✈️' : opt.type === 'train' ? '🚂' : '🚌'}
                    </div>
                    <div>
                      <p className="font-semibold text-xs text-text">{opt.name}</p>
                      <p className="text-xs text-muted">{opt.duration} · {opt.type}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-xs text-text">₹{Number(opt.cost).toLocaleString()}</p>
                    {opt.recommended && <span className="text-xs text-accent font-mono">Best Pick</span>}
                  </div>
                </div>
              ))}
            </div>
            {plan.transport?.recommendation && (
              <p className="mt-3 text-xs text-muted bg-surface border border-border rounded-lg p-2.5 leading-relaxed">
                💡 {plan.transport.recommendation}
              </p>
            )}
          </Section>

          {/* Hotels */}
          <Section icon={Hotel} title="Hotel Suggestions" color="text-pink-400">
            <div className="space-y-2 mt-1">
              {(plan.hotels?.options || []).map((h, i) => (
                <div
                  key={i}
                  className={`p-3 rounded-lg border ${h.recommended ? 'border-pink-400/30 bg-pink-400/5' : 'border-border bg-surface'}`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold text-xs text-text">{h.name}</p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <MapPin size={10} className="text-muted" />
                        <span className="text-xs text-muted">{h.area}</span>
                        {h.rating && (
                          <>
                            <Star size={10} className="text-yellow-400" />
                            <span className="text-xs text-yellow-400">{h.rating}/5</span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-xs text-text">₹{Number(h.pricePerNight).toLocaleString()}</p>
                      <p className="text-xs text-muted">per night</p>
                    </div>
                  </div>
                  {h.amenities?.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1.5">
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
            <div className="grid grid-cols-3 gap-2 mt-1 mb-3">
              <div className="bg-surface border border-border rounded-lg p-3 text-center">
                <ThermometerSun size={16} className="text-cyan-400 mx-auto mb-0.5" />
                <p className="text-xl font-bold text-text">{plan.weather?.avgTemp}°C</p>
                <p className="text-xs text-muted">Avg Temp</p>
              </div>
              <div className="bg-surface border border-border rounded-lg p-3 text-center">
                <Droplets size={16} className="text-blue-400 mx-auto mb-0.5" />
                <p className="text-xl font-bold text-text">{plan.weather?.avgRain || 0}%</p>
                <p className="text-xs text-muted">Rain Chance</p>
              </div>
              <div className="bg-surface border border-border rounded-lg p-3 text-center">
                <CloudSun size={16} className="text-yellow-400 mx-auto mb-0.5" />
                <p className="text-sm font-bold text-text leading-tight">{plan.weather?.condition}</p>
                <p className="text-xs text-muted">Condition</p>
              </div>
            </div>
            {weatherDays.length > 0 && (
              <ResponsiveContainer width="100%" height={130}>
                <BarChart data={weatherDays.slice(0, 7)} margin={{ left: -20, right: 0, top: 4, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1E2D45" />
                  <XAxis dataKey="date" tick={{ fontSize: 9, fill: '#4B6080' }} />
                  <YAxis tick={{ fontSize: 9, fill: '#4B6080' }} />
                  <Tooltip contentStyle={{ background: '#0D1420', border: '1px solid #1E2D45', borderRadius: 6, fontSize: 10 }} />
                  <Bar dataKey="temp_max" name="Max °C" fill="#00D4FF" radius={[3, 3, 0, 0]} />
                  <Bar dataKey="temp_min" name="Min °C" fill="#7C3AED" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
            {plan.weather?.advice && (
              <p className="mt-2 text-xs text-muted bg-surface border border-border rounded-lg p-2.5">{plan.weather.advice}</p>
            )}
            {plan.weather?.packing?.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {plan.weather.packing.map((p, i) => (
                  <span key={i} className="text-xs bg-cyan-400/10 border border-cyan-400/20 rounded-full px-2.5 py-0.5 text-cyan-400">{p}</span>
                ))}
              </div>
            )}
          </Section>

          {/* Budget */}
          <Section icon={Wallet} title="Budget Breakdown" color="text-green-400">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-1">
              <ResponsiveContainer width="100%" height={170}>
                <PieChart>
                  <Pie data={budgetData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} paddingAngle={3}>
                    {budgetData.map((_, i) => (
                      <Cell key={i} fill={BUDGET_COLORS[i % BUDGET_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ background: '#0D1420', border: '1px solid #1E2D45', borderRadius: 6, fontSize: 10 }}
                    formatter={(v) => [`₹${Number(v).toLocaleString()}`, '']}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-1.5 self-center">
                {budgetData.map((d, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: BUDGET_COLORS[i % BUDGET_COLORS.length] }} />
                      <span className="text-xs text-muted">{d.name}</span>
                    </div>
                    <span className="text-xs font-mono text-text">₹{Number(d.value).toLocaleString()}</span>
                  </div>
                ))}
                <div className="pt-1.5 border-t border-border flex justify-between">
                  <span className="text-xs font-bold text-text">Total</span>
                  <span className="text-xs font-bold font-mono text-accent">₹{Number(plan.budget_plan?.total || 0).toLocaleString()}</span>
                </div>
              </div>
            </div>
            {plan.budget_plan?.savings_tip && (
              <div className="mt-3 flex items-start gap-2 bg-green-400/5 border border-green-400/20 rounded-lg p-2.5">
                <TrendingDown size={12} className="text-green-400 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-green-400">{plan.budget_plan.savings_tip}</p>
              </div>
            )}
          </Section>

          {/* Itinerary */}
          <Section icon={CalendarDays} title="Day-wise Itinerary" color="text-purple-400">
            <div className="space-y-3 mt-1">
              {(plan.itinerary?.days || []).map((day, i) => (
                <div key={i} className="border-l-2 border-purple-400/30 pl-3">
                  <p className="font-bold text-xs text-purple-400 mb-1.5">Day {i + 1} — {day.theme}</p>
                  <div className="space-y-1.5">
                    {(day.activities || []).map((act, j) => (
                      <div key={j} className="flex items-start gap-2 bg-surface border border-border rounded-lg p-2.5">
                        <div className="flex items-center gap-1 text-xs text-muted font-mono flex-shrink-0 mt-0.5">
                          <Clock size={9} />
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1">
              {[
                { key: 'restaurants', label: '🍽 Restaurants', color: 'text-orange-400' },
                { key: 'cafes', label: '☕ Cafés', color: 'text-yellow-400' },
                { key: 'hidden_gems', label: '💎 Hidden Gems', color: 'text-cyan-400' },
                { key: 'shopping', label: '🛍 Shopping', color: 'text-pink-400' },
              ].map(cat => (
                plan.local_guide?.[cat.key]?.length > 0 && (
                  <div key={cat.key} className="bg-surface border border-border rounded-lg p-3">
                    <p className={`text-xs font-bold mb-2 ${cat.color}`}>{cat.label}</p>
                    <div className="space-y-1">
                      {plan.local_guide[cat.key].map((item, i) => (
                        <p key={i} className="text-xs text-muted flex items-center gap-1.5">
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
            <div className="mt-1 space-y-3">
              {plan.safety?.precautions?.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-muted mb-1.5 uppercase tracking-wider">Precautions</p>
                  <div className="space-y-1.5">
                    {plan.safety.precautions.map((p, i) => (
                      <div key={i} className="flex items-start gap-1.5 text-xs text-muted">
                        <CheckCircle size={11} className="text-red-400 flex-shrink-0 mt-0.5" />
                        {p}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {plan.safety?.scam_warnings?.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-muted mb-1.5 uppercase tracking-wider">Scam Alerts</p>
                  <div className="space-y-1.5">
                    {plan.safety.scam_warnings.map((w, i) => (
                      <div key={i} className="flex items-start gap-1.5 text-xs text-muted">
                        <span className="text-yellow-400 flex-shrink-0">⚠</span>
                        {w}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {plan.safety?.emergency_contacts && (
                <div className="bg-red-500/5 border border-red-500/20 rounded-lg p-3">
                  <p className="text-xs font-semibold text-red-400 mb-0.5">Emergency Contacts</p>
                  <p className="text-xs text-muted">{plan.safety.emergency_contacts}</p>
                </div>
              )}
            </div>
          </Section>

          {/* Download CTA */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="glass border border-accent/20 rounded-xl p-5 text-center"
          >
            <Download size={24} className="text-accent mx-auto mb-2" />
            <h3 className="text-base font-bold mb-1">Save your travel plan</h3>
            <p className="text-muted text-xs mb-4">Download a professional PDF with your complete itinerary, budget, hotels, and more.</p>
            <button
              onClick={() => generatePDF(plan)}
              className="inline-flex items-center gap-2 bg-accent text-bg font-bold px-6 py-2.5 rounded-lg text-sm hover:bg-accent/90 transition-all glow-accent"
            >
              <Download size={13} />
              Download PDF Plan
            </button>
          </motion.div>

        </div>
      </div>
    </div>
  )
}