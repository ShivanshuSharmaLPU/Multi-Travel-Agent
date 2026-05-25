import { motion } from 'framer-motion'
import { CheckCircle, Loader, Clock } from 'lucide-react'

const STATUS_STYLES = {
  idle: 'text-muted border-border',
  active: 'text-accent border-accent bg-accent/5 agent-pulse',
  done: 'text-emerald-400 border-emerald-400/30 bg-emerald-400/5',
}

export default function AgentCard({ agent, status = 'idle', message = '', index = 0 }) {
  const Icon = agent.icon
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
      className={`glass rounded-xl p-4 border transition-all duration-500 ${STATUS_STYLES[status]}`}
    >
      <div className="flex items-start gap-3">
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
          status === 'active' ? 'bg-accent/15' : status === 'done' ? 'bg-emerald-400/10' : 'bg-surface'
        }`}>
          <Icon size={18} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <p className="font-semibold text-sm text-text">{agent.name}</p>
            {status === 'active' && <Loader size={13} className="animate-spin text-accent flex-shrink-0" />}
            {status === 'done' && <CheckCircle size={13} className="text-emerald-400 flex-shrink-0" />}
            {status === 'idle' && <Clock size={13} className="text-muted flex-shrink-0" />}
          </div>
          <p className="text-xs text-muted mt-0.5">{agent.role}</p>
          {message && (
            <p className={`text-xs mt-2 leading-relaxed ${status === 'active' ? 'text-accent/80 streaming-cursor' : 'text-muted'}`}>
              {message}
            </p>
          )}
        </div>
      </div>
    </motion.div>
  )
}
