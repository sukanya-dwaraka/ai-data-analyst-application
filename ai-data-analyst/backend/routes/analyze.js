const express = require('express')
const { getDataset } = require('./upload')

const router = express.Router()

async function getAIInsights(prompt) {
  const apiKey = process.env.GROQ_API_KEY || process.env.ANTHROPIC_API_KEY
  
  if (!apiKey) return null

  if (process.env.GROQ_API_KEY) {
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: 'llama3-8b-8192',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 600,
        temperature: 0.3,
      })
    })
    const data = await res.json()
    return data.choices?.[0]?.message?.content ?? null
  }

  if (process.env.ANTHROPIC_API_KEY) {
    const Anthropic = require('@anthropic-ai/sdk')
    const client = new Anthropic({ apiKey })
    const msg = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 600,
      messages: [{ role: 'user', content: prompt }],
    })
    return msg.content[0]?.text ?? null
  }

  return null
}

function generateFallbackInsights(rows, columns, stats, query) {
  const insights = []
  const numCols = columns.filter(c => c.type === 'int' || c.type === 'float')
  const strCols = columns.filter(c => c.type === 'string')

  if (numCols.length > 0) {
    const col = numCols[0]
    const s = stats[col.name]
    if (s) {
      insights.push({
        title: `${col.name} range`,
        body: `The column "${col.name}" ranges from ${s.min} to ${s.max} with a mean of ${s.mean}. ${s.nullCount > 0 ? `There are ${s.nullCount} missing values (${((s.nullCount/rows.length)*100).toFixed(1)}%).` : 'No missing values detected.'}`
      })
    }
  }

  if (strCols.length > 0) {
    const col = strCols[0]
    const s = stats[col.name]
    if (s?.topValues?.length) {
      const top = s.topValues[0]
      insights.push({
        title: `Top category in ${col.name}`,
        body: `The most common value in "${col.name}" is "${top.value}" appearing ${top.count} times out of ${rows.length} rows (${((top.count/rows.length)*100).toFixed(1)}%). There are ${s.unique} unique values total.`
      })
    }
  }

  const nullCols = columns.filter(c => (stats[c.name]?.nullCount ?? 0) > 0)
  if (nullCols.length > 0) {
    insights.push({
      title: 'Data quality note',
      body: `${nullCols.length} column(s) have missing values: ${nullCols.map(c => `${c.name} (${stats[c.name].nullCount} nulls)`).join(', ')}. Consider cleaning these before analysis.`
    })
  } else {
    insights.push({
      title: 'Data quality',
      body: `Dataset is complete — no missing values found across all ${columns.length} columns and ${rows.length} rows.`
    })
  }

  return insights
}

router.post('/', async (req, res) => {
  const { query, datasetId } = req.body
  if (!query || !datasetId) return res.status(400).json({ error: 'query and datasetId are required' })

  const dataset = getDataset(datasetId)
  if (!dataset) return res.status(404).json({ error: 'Dataset not found. Please re-upload.' })

  const { rows, columns, stats, filename } = dataset
  const lq = query.toLowerCase()

  let tableData = []
  let chartData = []
  let chartType = 'bar'
  let insights = []
  let aiSummary = ''

  if (lq.includes('missing') || lq.includes('null')) {
    tableData = columns.map(col => ({
      Column: col.name,
      Type: col.type,
      'Missing Values': stats[col.name]?.nullCount ?? 0,
      'Missing %': ((stats[col.name]?.nullCount / rows.length) * 100).toFixed(1) + '%',
    }))
    chartData = tableData.map(r => ({ name: r.Column, value: Number(r['Missing Values']) }))
    chartType = 'bar'
    aiSummary = `Found missing value analysis for ${columns.length} columns.`

  } else if (lq.includes('statistic') || lq.includes('summary') || lq.includes('describe')) {
    const numCols = columns.filter(c => c.type === 'int' || c.type === 'float')
    tableData = numCols.map(col => {
      const s = stats[col.name] || {}
      return { Column: col.name, Min: s.min ?? '—', Max: s.max ?? '—', Mean: s.mean ?? '—', Median: s.median ?? '—', Nulls: s.nullCount ?? 0 }
    })
    chartData = numCols.map(col => ({ name: col.name, value: stats[col.name]?.mean ?? 0 }))
    chartType = 'bar'
    aiSummary = `Summary statistics for ${tableData.length} numeric columns.`

  } else if (lq.includes('distribution') || lq.includes('categor') || lq.includes('top')) {
    const strCols = columns.filter(c => c.type === 'string')
    if (strCols.length > 0) {
      const col = strCols[0]
      const topVals = stats[col.name]?.topValues ?? []
      tableData = topVals.map((t, i) => ({ Rank: i + 1, [col.name]: t.value, Count: t.count }))
      chartData = topVals.map(t => ({ name: t.value, value: t.count }))
      chartType = 'pie'
      aiSummary = `Distribution of top values in "${col.name}".`
    }

  } else if (lq.includes('preview') || lq.includes('first') || lq.includes('rows') || lq.includes('show')) {
    tableData = rows.slice(0, 10).map((r, i) => ({ '#': i + 1, ...r }))
    const numCol = columns.find(c => c.type === 'int' || c.type === 'float')
    const labelCol = columns.find(c => c.type === 'string')
    if (numCol && labelCol) {
      chartData = rows.slice(0, 10).map(r => ({ name: String(r[labelCol.name]).slice(0, 12), value: Number(r[numCol.name]) }))
    }
    chartType = 'bar'
    aiSummary = `Showing first 10 rows of "${filename}".`

  } else {
    tableData = rows.slice(0, 20).map((r, i) => ({ '#': i + 1, ...r }))
    const numCol = columns.find(c => c.type === 'int' || c.type === 'float')
    const labelCol = columns.find(c => c.type === 'string')
    if (numCol && labelCol) {
      chartData = rows.slice(0, 10).map(r => ({ name: String(r[labelCol.name]).slice(0, 12), value: Number(r[numCol.name]) }))
    }
    chartType = 'bar'
    aiSummary = `Here are results for: "${query}"`
  }

  insights = generateFallbackInsights(rows, columns, stats, query)

  try {
    const statsSnippet = columns.slice(0, 8).map(col => {
      const s = stats[col.name] || {}
      if (col.type === 'int' || col.type === 'float') {
        return `${col.name} (${col.type}): min=${s.min}, max=${s.max}, mean=${s.mean}, nulls=${s.nullCount}`
      }
      const top = s.topValues?.slice(0, 3).map(t => `${t.value}(${t.count})`).join(', ')
      return `${col.name} (${col.type}): unique=${s.unique}, top=[${top}], nulls=${s.nullCount}`
    }).join('\n')

    const prompt = `You are a data analyst. Dataset: "${filename}", ${rows.length} rows, ${columns.length} columns.\n\nStats:\n${statsSnippet}\n\nUser query: "${query}"\n\nRespond ONLY with valid JSON, no markdown:\n{"summary":"one sentence","insights":[{"title":"short title","body":"one paragraph with specific numbers"},{"title":"short title","body":"one paragraph"}]}`

    const raw = await getAIInsights(prompt)
    if (raw) {
      const parsed = JSON.parse(raw.replace(/```json|```/g, '').trim())
      if (parsed.summary) aiSummary = parsed.summary
      if (parsed.insights?.length) insights = parsed.insights
    }
  } catch (err) {
    console.log('AI unavailable, using computed insights.')
  }

  res.json({ summary: aiSummary, tableData, chartData, chartType, insights })
})

module.exports = router
