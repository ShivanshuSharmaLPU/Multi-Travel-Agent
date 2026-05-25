import { Routes, Route } from 'react-router-dom'
import Landing from './pages/Landing'
import Planner from './pages/Planner'
import Workflow from './pages/Workflow'
import TravelPlan from './pages/TravelPlan'

export default function App() {
  return (
    <div className="noise-bg min-h-screen">
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/planner" element={<Planner />} />
        <Route path="/workflow" element={<Workflow />} />
        <Route path="/plan" element={<TravelPlan />} />
      </Routes>
    </div>
  )
}
