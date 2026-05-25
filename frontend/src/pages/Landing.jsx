import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import {
  Compass, Zap, Brain, MapPin, CloudSun, Wallet,
  CalendarDays, UtensilsCrossed, Shield, ArrowRight,
  Globe, Cpu, Layers
} from 'lucide-react'
import Navbar from '../components/Navbar'

const features = [
  { icon: Zap, label: 'Transport Agent', desc: 'Flights, trains & buses compared in real-time', color: 'text-yellow-400' },
  { icon: MapPin, label: 'Hotel Agent', desc: 'Budget-matched hotels with ratings & reviews', color: 'text-pink-400' },
  { icon: CloudSun, label: 'Weather Agent', desc: 'Live forecasts via Open-Meteo API integration', color: 'text-cyan-400' },
  { icon: Wallet, label: 'Budget Planner', desc: 'Detailed expense breakdown & savings tips', color: 'text-green-400' },
  { icon: CalendarDays, label: 'Itinerary Agent', desc: 'Day-wise schedules with attraction timings', color: 'text-purple-400' },
  { icon: UtensilsCrossed, label: 'Local Guide', desc: 'Hidden gems, cafés & authentic experiences', color: 'text-orange-400' },
  { icon: Shield, label: 'Safety Agent', desc: 'Precautions, scam alerts & emergency contacts', color: 'text-red-400' },
  { icon: Brain, label: 'Supervisor Agent', desc: 'Orchestrates all agents & synthesizes results', color: 'text-accent' },
]

const workflow = [
  { step: '01', label: 'You describe your trip' },
  { step: '02', label: 'Supervisor assigns agents' },
  { step: '03', label: 'Agents work in parallel' },
  { step: '04', label: 'Results synthesized live' },
  { step: '05', label: 'PDF plan generated' },
]

export default function Landing() {
  const nav = useNavigate()

  return (
    <div className="min-h-screen bg-bg">
      <Navbar />

      {/* Hero */}
      <section className="relative pt-32 pb-24 px-6 overflow-hidden">
        {/* Background orbs */}
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-40 right-1/4 w-80 h-80 bg-accent2/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute inset-0 bg-grid opacity-30 pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 glass border border-accent/20 rounded-full px-4 py-2 mb-8"
          >
            <Cpu size={13} className="text-accent" />
            <span className="text-xs font-mono text-muted">Multi-Agent AI Architecture • Supervisor Pattern</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-7xl font-extrabold leading-tight mb-6"
          >
            Travel planning,{' '}
            <span className="gradient-text glow-text">reimagined</span>
            <br />with AI agents
          </motion.h1>

        <motion.p
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ delay: 0.2 }}
  className="text-lg text-muted max-w-2xl mx-auto mb-10 leading-relaxed"
>
  Every great journey begins with a single destination. Let's plan yours, and turn that dream into your next great story.
</motion.p>

       <motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ delay: 0.3 }}
  className="flex flex-col items-center gap-6"
>
  <button
    onClick={() => nav('/planner')}
    className="group flex items-center justify-center gap-2 bg-accent text-bg font-bold px-8 py-4 rounded-xl hover:bg-accent/90 transition-all glow-accent text-base"
  >
    Start Planning
    <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
  </button>
  <p className="text-xs text-muted font-mono">
  ✦ Plan smart &nbsp;·&nbsp; Travel light &nbsp;·&nbsp; Explore more &nbsp;·&nbsp; Come back with stories
</p>
</motion.div>
        </div>
      </section>

      {/* Workflow Steps */}
      <section className="py-16 px-6 border-y border-border">
        <div className="max-w-5xl mx-auto">
          <p className="text-xs font-mono text-muted text-center mb-10 uppercase tracking-widest">AI Workflow Pipeline</p>
          <div className="flex flex-col md:flex-row items-center gap-0 md:gap-0">
            {workflow.map((w, i) => (
              <div key={i} className="flex md:flex-col items-center gap-3 md:gap-2 flex-1 min-w-0">
                <div className="flex md:flex-col items-center gap-3 md:gap-2 w-full">
                  <div className="w-10 h-10 rounded-xl glass border border-accent/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-mono text-accent font-bold">{w.step}</span>
                  </div>
                  {i < workflow.length - 1 && (
                    <div className="hidden md:block h-px flex-1 bg-gradient-to-r from-accent/20 to-transparent w-full" />
                  )}
                </div>
                <p className="text-xs text-muted text-center leading-tight mt-1">{w.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Agents Grid */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 glass border border-border rounded-full px-4 py-2 mb-4">
              <Layers size={13} className="text-accent2" />
              <span className="text-xs font-mono text-muted">Specialized Agent Network</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold">
              8 agents. One seamless plan.
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {features.map((f, i) => {
              const Icon = f.icon
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                  className="glass border border-border rounded-2xl p-5 hover:border-accent/20 transition-all group"
                >
                  <div className={`w-10 h-10 rounded-xl bg-surface flex items-center justify-center mb-4 ${f.color} group-hover:scale-110 transition-transform`}>
                    <Icon size={20} />
                  </div>
                  <h3 className="font-semibold text-sm text-text mb-1">{f.label}</h3>
                  <p className="text-xs text-muted leading-relaxed">{f.desc}</p>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <div className="glass border border-accent/20 rounded-3xl p-12 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-accent2/5" />
            <div className="relative z-10">
              <Compass size={40} className="text-accent mx-auto mb-6" />
              <h2 className="text-3xl font-bold mb-4">Ready to explore?</h2>
              <p className="text-muted mb-8">Tell our AI agents your dream destination and watch them build your perfect itinerary in real-time.</p>
              <button
                onClick={() => nav('/planner')}
                className="inline-flex items-center gap-2 bg-accent text-bg font-bold px-8 py-4 rounded-xl hover:bg-accent/90 transition-all glow-accent"
              >
                Generate My Travel Plan
                <ArrowRight size={18} />
              </button>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-border py-8 px-6 text-center">
        <p className="text-xs text-muted font-mono">VoyageAI © 2025 — Powered by Groq + Agno + LangChain + Open-Meteo</p>
      </footer>
    </div>
  )
}
