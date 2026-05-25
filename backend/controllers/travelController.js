const axios = require('axios')
const http = require('http')
const https = require('https')

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000'

// POST: synchronous plan generation
exports.generatePlan = async (req, res) => {
  try {
    const response = await axios.post(`${AI_SERVICE_URL}/plan`, req.body, { timeout: 120000 })
    res.json(response.data)
  } catch (err) {
    console.error('AI Service error:', err.message)
    res.status(500).json({ error: 'AI service unavailable', message: err.message })
  }
}

// GET: SSE streaming - proxies the FastAPI SSE stream
exports.streamPlan = (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream')
  res.setHeader('Cache-Control', 'no-cache')
  res.setHeader('Connection', 'keep-alive')
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.flushHeaders()

  const params = new URLSearchParams(req.query).toString()
  const serviceUrl = `${AI_SERVICE_URL}/stream?${params}`

  const lib = serviceUrl.startsWith('https') ? https : http
  const urlObj = new URL(serviceUrl)

  const options = {
    hostname: urlObj.hostname,
    port: urlObj.port || (serviceUrl.startsWith('https') ? 443 : 80),
    path: urlObj.pathname + '?' + urlObj.searchParams.toString(),
    method: 'GET',
    headers: { 'Accept': 'text/event-stream' }
  }

  const proxyReq = lib.request(options, (proxyRes) => {
    proxyRes.on('data', (chunk) => {
      res.write(chunk)
    })
    proxyRes.on('end', () => res.end())
    proxyRes.on('error', (err) => {
      console.error('Proxy stream error:', err)
      res.write(`data: ${JSON.stringify({ type: 'error', message: 'Stream error: ' + err.message })}\n\n`)
      res.end()
    })
  })

  proxyReq.on('error', (err) => {
    console.error('AI service connection error:', err.message)
    res.write(`data: ${JSON.stringify({ type: 'error', message: 'Cannot connect to AI service. Is FastAPI running on port 8000?' })}\n\n`)
    res.end()
  })

  proxyReq.end()

  req.on('close', () => {
    proxyReq.destroy()
  })
}
