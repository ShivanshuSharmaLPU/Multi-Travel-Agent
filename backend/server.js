require('dotenv').config()
const express = require('express')
const cors = require('cors')
const travelRoutes = require('./routes/travel')

const app = express()
const PORT = process.env.PORT || 5000

app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}))
app.use(express.json())

app.get('/health', (req, res) => res.json({ status: 'ok', service: 'VoyageAI Express Backend' }))

app.use('/api/travel', travelRoutes)

app.listen(PORT, () => {
  console.log(`\n🚀 VoyageAI Backend running on http://localhost:${PORT}`)
  console.log(`   AI Service: ${process.env.AI_SERVICE_URL || 'http://localhost:8000'}\n`)
})
