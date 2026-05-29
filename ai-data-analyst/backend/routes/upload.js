const express = require('express')
const multer = require('multer')
const path = require('path')
const fs = require('fs')
const Papa = require('papaparse')
const XLSX = require('xlsx')
const { v4: uuidv4 } = require('uuid')

const router = express.Router()

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, '../uploads')),
  filename: (req, file, cb) => {
    const id = uuidv4()
    const ext = path.extname(file.originalname)
    cb(null, `${id}${ext}`)
  },
})

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['.csv', '.xlsx', '.xls']
    const ext = path.extname(file.originalname).toLowerCase()
    if (allowed.includes(ext)) cb(null, true)
    else cb(new Error('Only CSV and Excel files are supported'))
  },
})

const datasets = {}

router.post('/', upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' })

  const filePath = req.file.path
  const ext = path.extname(req.file.originalname).toLowerCase()
  const id = path.basename(req.file.filename, ext)

  try {
    let rows = []

    if (ext === '.csv') {
      const content = fs.readFileSync(filePath, 'utf8')
      const parsed = Papa.parse(content, { header: true, skipEmptyLines: true, dynamicTyping: true })
      rows = parsed.data
    } else {
      const wb = XLSX.readFile(filePath)
      const ws = wb.Sheets[wb.SheetNames[0]]
      rows = XLSX.utils.sheet_to_json(ws)
    }

    if (rows.length === 0) return res.status(400).json({ error: 'File is empty or could not be parsed' })

    const columns = inferColumns(rows)
    const stats = computeStats(rows, columns)
    const fileSize = formatBytes(req.file.size)

    datasets[id] = { id, rows, columns, filename: req.file.originalname, stats }

    res.json({
      id,
      filename: req.file.originalname,
      rows: rows.length,
      columns,
      fileSize,
      stats,
    })
  } catch (err) {
    console.error('Upload error:', err)
    res.status(500).json({ error: 'Failed to parse file: ' + err.message })
  }
})

function inferColumns(rows) {
  if (!rows.length) return []
  return Object.keys(rows[0]).map((name) => {
    const vals = rows.map((r) => r[name]).filter((v) => v !== null && v !== undefined && v !== '')
    let type = 'string'
    if (vals.length > 0) {
      if (vals.every((v) => typeof v === 'number' && Number.isInteger(v))) type = 'int'
      else if (vals.every((v) => typeof v === 'number')) type = 'float'
      else if (vals.every((v) => !isNaN(Date.parse(v)))) type = 'date'
    }
    return { name, type }
  })
}

function computeStats(rows, columns) {
  const stats = {}
  for (const col of columns) {
    const vals = rows.map((r) => r[col.name]).filter((v) => v !== null && v !== undefined && v !== '')
    const nullCount = rows.length - vals.length
    const entry = { nullCount, total: rows.length }

    if (col.type === 'int' || col.type === 'float') {
      const nums = vals.map(Number).filter((n) => !isNaN(n))
      if (nums.length) {
        entry.min = Math.min(...nums)
        entry.max = Math.max(...nums)
        entry.mean = parseFloat((nums.reduce((a, b) => a + b, 0) / nums.length).toFixed(4))
        const sorted = [...nums].sort((a, b) => a - b)
        const mid = Math.floor(sorted.length / 2)
        entry.median = sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2
      }
    } else if (col.type === 'string') {
      const freq = {}
      vals.forEach((v) => { freq[v] = (freq[v] || 0) + 1 })
      const top = Object.entries(freq).sort((a, b) => b[1] - a[1]).slice(0, 5)
      entry.topValues = top.map(([value, count]) => ({ value, count }))
      entry.unique = Object.keys(freq).length
    }
    stats[col.name] = entry
  }
  return stats
}

function formatBytes(bytes) {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

router.getDataset = (id) => datasets[id]

module.exports = router
module.exports.getDataset = (id) => datasets[id]
