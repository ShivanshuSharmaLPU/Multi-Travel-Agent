const axios = require('axios')
const http = require('http')
const https = require('https')

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000'

/**
 * POST: Generate full travel plan (non-streaming)
 */
exports.generatePlan = async (req, res) => {
  try {
    const response = await axios.post(
      `${AI_SERVICE_URL}/plan`,
      req.body,
      { timeout: 120000 }
    )

    return res.json(response.data)

  } catch (err) {
    console.error('AI Service error:', err.response?.data || err.message)

    return res.status(500).json({
      error: 'AI service unavailable',
      message: err.response?.data || err.message
    })
  }
}


/**
 * GET: SSE Streaming proxy to FastAPI
 */
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
    path: urlObj.pathname + (urlObj.search ? urlObj.search : ''),
    method: 'GET',
    headers: {
      Accept: 'text/event-stream'
    }
  }

  const proxyReq = lib.request(options, (proxyRes) => {

    // 🔥 IMPORTANT: handle upstream HTTP errors (like Groq 429)
    if (proxyRes.statusCode >= 400) {
      let errorData = ''

      proxyRes.on('data', chunk => {
        errorData += chunk
      })

      proxyRes.on('end', () => {
        res.write(`data: ${JSON.stringify({
          type: 'error',
          message: 'AI service error',
          status: proxyRes.statusCode,
          details: errorData
        })}\n\n`)
        res.end()
      })

      return
    }

    // Stream data normally
    proxyRes.on('data', (chunk) => {
      res.write(chunk)
    })

    proxyRes.on('end', () => {
      res.write(`data: ${JSON.stringify({ type: 'done' })}\n\n`)
      res.end()
    })
  })

  // 🔥 Real connection error handler
  proxyReq.on('error', (err) => {
    console.error('AI service connection error:', err.message)

    res.write(`data: ${JSON.stringify({
      type: 'error',
      message: 'AI service unreachable or rate limited',
      detail: err.message
    })}\n\n`)

    res.end()
  })

  // Cleanup if client disconnects
  req.on('close', () => {
    proxyReq.destroy()
  })

  proxyReq.end()
}