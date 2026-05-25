import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plane, Hotel, CloudSun, Wallet, CalendarDays,
  UtensilsCrossed, Shield, Brain, Activity, CheckCircle2
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

export default function Workflow() {
  const nav = useNavigate()
  const [agentStatuses, setAgentStatuses] = useState({})
  const [agentMessages, setAgentMessages] = useState({})
  const [logs, setLogs] = useState([])
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState('')
  const logsEndRef = useRef(null)
  const esRef = useRef(null)

  const addLog = (msg, type = 'info') => {
    setLogs(p => [...p.slice(-50), { msg, type, time: new Date().toLocaleTimeString() }])
  }

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [logs])

  useEffect(() => {
    const raw = sessionStorage.getItem('travelForm')
    if (!raw) { nav('/planner'); return }
    const form = JSON.parse(raw)

    setAgentStatuses({ supervisor: 'active' })
    setAgentMessages({ supervisor: 'Initializing multi-agent workflow...' })
    addLog('🚀 VoyageAI multi-agent system starting...', 'system')

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
          addLog(`▶ ${data.agent} agent activated`, 'agent')
          setProgress(p => Math.min(p + 10, 85))
        }
        else if (data.type === 'agent_update') {
          setAgentMessages(p => ({ ...p, [data.agent]: data.message }))
          addLog(`   ${data.agent}: ${data.message}`, 'update')
        }
        else if (data.type === 'agent_done') {
          setAgentStatuses(p => ({ ...p, [data.agent]: 'done' }))
          setAgentMessages(p => ({ ...p, [data.agent]: data.message || 'Completed ✓' }))
          addLog(`✓ ${data.agent} agent completed`, 'done')
          setProgress(p => Math.min(p + 5, 95))
        }
        else if (data.type === 'log') {
          addLog(data.message, 'log')
        }
        else if (data.type === 'done') {
          es.close()
          setProgress(100)
          addLog('✅ All agents completed! Generating travel plan...', 'system')
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
          addLog(`❌ Error: ${data.message}`, 'error')
        }
      } catch (e) {
        console.error('Parse error', e)
      }
    }

    es.onerror = () => {
      setError('Connection to AI service lost. Make sure the backend is running.')
      addLog('❌ SSE connection error', 'error')
      es.close()
    }

    return () => es.close()
  }, [nav])

  const activeCount = Object.values(agentStatuses).filter(s => s === 'active').length
  const doneCount = Object.values(agentStatuses).filter(s => s === 'done').length

  return (
    <div className="min-h-screen bg-bg">
      <Navbar />
      <div className="pt-24 pb-16 px-6">
        <div className="max-w-6xl mx-auto">

          {/* Header */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
            <div className="inline-flex items-center gap-2 glass border border-accent/20 rounded-full px-4 py-2 mb-4">
              <Activity size={13} className="text-accent animate-pulse" />
              <span className="text-xs font-mono text-accent">Live Agent Workflow</span>
            </div>
            <h1 className="text-3xl font-bold mb-2">AI agents are working</h1>
            <p className="text-muted text-sm">{doneCount} of {AGENTS.length} agents completed</p>
          </motion.div>

          {/* Progress bar */}
          <div className="mb-10 max-w-2xl mx-auto">
            <div className="h-1.5 bg-surface rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-accent to-accent2 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
            <div className="flex justify-between mt-2 text-xs text-muted font-mono">
              <span>{progress}% complete</span>
              <span>{activeCount} active · {doneCount} done</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Agents Grid */}
            <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-3 content-start">
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

            {/* Live Log */}
            <div className="glass border border-border rounded-2xl p-4 h-[520px] flex flex-col">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                <span className="text-xs font-mono text-muted uppercase tracking-wider">Live Console</span>
              </div>
              <div className="flex-1 overflow-y-auto space-y-1.5 font-mono text-xs">
                <AnimatePresence>
                  {logs.map((log, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={`flex gap-2 ${
                        log.type === 'system' ? 'text-accent' :
                        log.type === 'done' ? 'text-emerald-400' :
                        log.type === 'error' ? 'text-red-400' :
                        log.type === 'agent' ? 'text-purple-400' :
                        'text-muted'
                      }`}
                    >
                      <span className="text-muted/50 flex-shrink-0">{log.time}</span>
                      <span className="break-all">{log.msg}</span>
                    </motion.div>
                  ))}
                </AnimatePresence>
                <div ref={logsEndRef} />
              </div>
            </div>
          </div>

          {/* Error */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 max-w-2xl mx-auto bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-red-400 text-sm"
            >
              <p className="font-semibold mb-1">⚠ Connection Error</p>
              <p>{error}</p>
              <p className="mt-2 text-xs text-red-400/70">Make sure the Express backend (port 5000) and FastAPI service (port 8000) are running.</p>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}
