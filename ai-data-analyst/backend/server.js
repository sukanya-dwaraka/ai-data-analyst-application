require('dotenv').config()
const express = require('express')
const cors = require('cors')

const uploadRoute = require('./routes/upload')
const analyzeRoute = require('./routes/analyze')

const app = express()
const PORT = process.env.PORT || 4000

app.use(cors())
app.use(express.json())

app.get('/', (_, res) => res.json({ status: 'ok', message: 'AI Data Analyst API is running' }))
app.get('/health', (_, res) => res.json({ status: 'ok' }))

app.use('/api/upload', uploadRoute)
app.use('/api/analyze', analyzeRoute)

app.use((err, req, res, next) => {
  console.error('Error:', err.message)
  res.status(500).json({ error: err.message })
})

app.listen(PORT, () => {
  console.log(`\n🚀 Backend running at http://localhost:${PORT}`)
  console.log(`   GROQ_API_KEY: ${process.env.GROQ_API_KEY ? '✅ set' : '❌ not set'}`)
  console.log(`   ANTHROPIC_API_KEY: ${process.env.ANTHROPIC_API_KEY ? '✅ set' : '❌ not set'}`)
  console.log(`   (App works without API keys — insights will be auto-computed)\n`)
})
