import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Plane, Hotel, CloudSun, Wallet, CalendarDays,
  UtensilsCrossed, Shield, Brain, Activity, CheckCircle2,
  Sparkles, Clock
} from 'lucide-react'
import Navbar from '../components/Navbar'
import AgentCard from '../components/AgentCard'

const AGENTS = [
  { id: 'supervisor', name: 'Supervisor Agent', role: 'Orchestrating all agents', icon: Brain },
  { id: 'transport', name: 'Transport Agent', role: 'Flights, trains & buses', icon: Plane },
  { id: 'hotel', name: 'Hotel Agent', role: 'Accommodations & ratings', icon: Hotel },
  { id: 'weather', name: 'Weather Agent', role: 'Open-Meteo forecasts', icon: CloudSun },
  { id: 'budget', name: 'Budget Planner', role: 'Expense breakdown', icon: Wallet },
  { id: 'itinerary', name: 'Itinerary Agent', role: 'Day-wise planning', icon: CalendarDays },
  { id: 'local', name: 'Local Guide Agent', role: 'Hidden gems & food', icon: UtensilsCrossed },
  { id: 'safety', name: 'Safety Agent', role: 'Precautions & tips', icon: Shield },
]

const TIPS = [
  'Analyzing best transport routes for your budget...',
  'Checking live weather forecasts via Open-Meteo...',
  'Finding top-rated hotels in your price range...',
  'Building a day-wise itinerary just for you...',
  'Calculating smart budget breakdown...',
  'Discovering local hidden gems & food spots...',
  'Reviewing safety tips for your destination...',
  'Almost there — finalizing your travel plan...',
]

export default function Workflow() {
  const nav = useNavigate()
  const [agentStatuses, setAgentStatuses] = useState({})
  const [agentMessages, setAgentMessages] = useState({})
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState('')
  const [tipIndex, setTipIndex] = useState(0)
  const esRef = useRef(null)

  // Rotate tips every 3 seconds
  useEffect(() => {
    const t = setInterval(() => setTipIndex(i => (i + 1) % TIPS.length), 3000)
    return () => clearInterval(t)
  }, [])

  useEffect(() => {
    const raw = sessionStorage.getItem('travelForm')
    if (!raw) { nav('/planner'); return }
    const form = JSON.parse(raw)

    setAgentStatuses({ supervisor: 'active' })
    setAgentMessages({ supervisor: 'Initializing multi-agent workflow...' })

    const params = new URLSearchParams({
      source: form.source,
      destination: form.destination,
      budget: form.budget,
      duration: form.duration,
      travel_type: form.travelType,
      group_size: form.groupSize,
    })

    const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000'
    const es = new EventSource(`${apiBase}/api/travel/stream?${params}`)
    esRef.current = es

    es.onmessage = (evt) => {
      try {
        const data = JSON.parse(evt.data)

        if (data.type === 'agent_start') {
          setAgentStatuses(p => ({ ...p, [data.agent]: 'active' }))
          setAgentMessages(p => ({ ...p, [data.agent]: data.message || 'Working...' }))
          setProgress(p => Math.min(p + 10, 85))
        }
        else if (data.type === 'agent_update') {
          setAgentMessages(p => ({ ...p, [data.agent]: data.message }))
        }
        else if (data.type === 'agent_done') {
          setAgentStatuses(p => ({ ...p, [data.agent]: 'done' }))
          setAgentMessages(p => ({ ...p, [data.agent]: data.message || 'Completed ✓' }))
          setProgress(p => Math.min(p + 5, 95))
        }
        else if (data.type === 'done') {
          es.close()
          setProgress(100)
          AGENTS.forEach(a => {
            setAgentStatuses(p => ({ ...p, [a.id]: 'done' }))
          })
          setTimeout(() => {
            sessionStorage.setItem('travelPlan', JSON.stringify(data.plan))
            nav('/plan')
          }, 1200)
        }
        else if (data.type === 'error') {
          setError(data.message)
          es.close()
        }
      } catch (e) {
        // silently ignore parse errors
      }
    }

    es.onerror = () => {
      setError('Connection to AI service lost. Make sure the backend is running.')
      es.close()
    }

    return () => es.close()
  }, [nav])

  const doneCount = Object.values(agentStatuses).filter(s => s === 'done').length
  const activeCount = Object.values(agentStatuses).filter(s => s === 'active').length

  return (
    <div className="min-h-screen bg-bg">
      <Navbar />
      <div className="pt-20 pb-10 px-4 md:px-6">
        <div className="max-w-4xl mx-auto">

          {/* Header */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
            <div className="inline-flex items-center gap-2 glass border border-accent/20 rounded-full px-4 py-2 mb-3">
              <Activity size={13} className="text-accent animate-pulse" />
              <span className="text-xs font-mono text-accent">Live Agent Workflow</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold mb-1">AI agents are working</h1>
            <p className="text-muted text-sm">{doneCount} of {AGENTS.length} agents completed</p>
          </motion.div>

          {/* Progress bar */}
          <div className="mb-6 max-w-xl mx-auto">
            <div className="h-1.5 bg-surface rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-accent to-accent2 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
            <div className="flex justify-between mt-1.5 text-xs text-muted font-mono">
              <span>{progress}% complete</span>
              <span>{activeCount} active · {doneCount} done</span>
            </div>
          </div>

          {/* Rotating tip */}
          <motion.div
            key={tipIndex}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="flex items-center justify-center gap-2 mb-8"
          >
            <Clock size={12} className="text-accent" />
            <p className="text-xs text-muted font-mono">{TIPS[tipIndex]}</p>
          </motion.div>

          {/* Agents Grid — full width now */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
            {AGENTS.map((agent, i) => (
              <AgentCard
                key={agent.id}
                agent={agent}
                status={agentStatuses[agent.id] || 'idle'}
                message={agentMessages[agent.id] || ''}
                index={i}
              />
            ))}
          </div>

          {/* Bottom status bar */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="glass border border-border rounded-xl px-5 py-3 flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <Sparkles size={13} className="text-accent" />
              <span className="text-xs text-muted">
                {progress === 100
                  ? 'All agents done! Redirecting to your plan...'
                  : 'Agents are collaborating to build your perfect travel plan'}
              </span>
            </div>
            <div className="flex gap-1.5">
              {[0, 1, 2].map(i => (
                <motion.div
                  key={i}
                  className="w-1.5 h-1.5 rounded-full bg-accent"
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
                />
              ))}
            </div>
          </motion.div>

          {/* Error */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-5 bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-red-400 text-sm"
            >
              <p className="font-semibold mb-1">⚠ Connection Error</p>
              <p>{error}</p>
              <p className="mt-2 text-xs text-red-400/70">
                Make sure the Express backend (port 5000) and FastAPI service (port 8000) are running.
              </p>
            </motion.div>
          )}

        </div>
      </div>
    </div>
  )
}