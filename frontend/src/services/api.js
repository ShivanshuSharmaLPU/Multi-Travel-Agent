import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000'

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' }
})

export const generateTravelPlan = async (formData) => {
  const response = await api.post('/api/travel/plan', formData)
  return response.data
}

export const streamTravelPlan = (formData, onMessage, onComplete, onError) => {
  const params = new URLSearchParams({
    source: formData.source,
    destination: formData.destination,
    budget: formData.budget,
    duration: formData.duration,
    travel_type: formData.travelType,
    group_size: formData.groupSize,
  })

  const eventSource = new EventSource(`${API_BASE}/api/travel/stream?${params}`)

  eventSource.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data)
      if (data.type === 'done') {
        eventSource.close()
        onComplete(data.plan)
      } else {
        onMessage(data)
      }
    } catch (e) {
      console.error('Parse error:', e)
    }
  }

  eventSource.onerror = (err) => {
    eventSource.close()
    onError(err)
  }

  return eventSource
}

export default api
