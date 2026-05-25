import { Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Compass, Zap } from 'lucide-react'

export default function Navbar() {
  const loc = useLocation()

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed top-0 left-0 right-0 z-50 glass border-b border-border"
    >
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent to-accent2 flex items-center justify-center">
            <Compass size={16} className="text-white" />
          </div>
          <span className="font-bold text-lg gradient-text">VoyageAI</span>
        </Link>

        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 text-xs font-mono text-muted bg-surface border border-border rounded-full px-3 py-1.5">
            <Zap size={11} className="text-accent" />
            Multi-Agent AI
          </span>
          <Link
            to="/planner"
            className="bg-accent text-bg font-semibold text-sm px-4 py-2 rounded-lg hover:bg-accent/90 transition-colors"
          >
            Plan Trip
          </Link>
        </div>
      </div>
    </motion.nav>
  )
}
