import { Download, Sparkles } from 'lucide-react'
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts'

const TABS = ['result', 'chart', 'insights']
const COLORS = ['#6C63FF', '#22c55e', '#f59e0b', '#ef4444', '#06b6d4', '#ec4899']

export default function ResultsPanel({ result, activeTab, setActiveTab }) {
  if (!result) {
    return (
      <div className="flex-1 flex items-center justify-center bg-white border-t border-gray-100">
        <div className="text-center">
          <div className="w-14 h-14 rounded-2xl bg-brand-50 flex items-center justify-center mx-auto mb-3">
            <Sparkles size={24} className="text-brand-500" />
          </div>
          <p className="text-sm font-medium text-gray-600">No results yet</p>
          <p className="text-xs text-gray-400 mt-1">Upload a dataset and ask a question to see results here</p>
        </div>
      </div>
    )
  }

  function downloadCSV() {
    if (!result?.tableData) return
    const headers = Object.keys(result.tableData[0]).join(',')
    const rows = result.tableData.map((r) => Object.values(r).join(','))
    const csv = [headers, ...rows].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'result.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="flex-1 flex flex-col bg-white border-t border-gray-100 overflow-hidden">
      <div className="flex items-center px-5 border-b border-gray-100">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-3 text-sm capitalize border-b-2 transition-colors ${
              activeTab === tab
                ? 'border-brand-500 text-brand-600 font-medium'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab}
          </button>
        ))}
        <div className="flex-1" />
        <button
          onClick={downloadCSV}
          className="flex items-center gap-1.5 text-xs text-gray-500 border border-gray-200 rounded-lg px-3 py-1.5 hover:bg-gray-50 transition-colors"
        >
          <Download size={13} />
          Download Result
        </button>
      </div>

      <div className="flex-1 overflow-auto p-5">
        {activeTab === 'result' && <ResultTab result={result} />}
        {activeTab === 'chart' && <ChartTab result={result} />}
        {activeTab === 'insights' && <InsightsTab result={result} />}
      </div>
    </div>
  )
}

function ResultTab({ result }) {
  const rows = result?.tableData ?? []
  if (rows.length === 0) return <p className="text-sm text-gray-400">No tabular data available.</p>
  const headers = Object.keys(rows[0])

  return (
    <div>
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Table Result</p>
      <div className="overflow-auto rounded-xl border border-gray-100">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50">
              {headers.map((h) => (
                <th key={h} className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 whitespace-nowrap">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i} className="border-t border-gray-50 hover:bg-gray-50 transition-colors">
                {headers.map((h) => (
                  <td key={h} className="px-4 py-2.5 text-gray-700 whitespace-nowrap">
                    {row[h] ?? '—'}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-gray-400 mt-2">Showing {rows.length} rows</p>
    </div>
  )
}

function ChartTab({ result }) {
  const chartData = result?.chartData ?? []
  const chartType = result?.chartType ?? 'bar'

  if (!chartData.length) return <p className="text-sm text-gray-400">No chart data available.</p>

  return (
    <div>
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-4">Visualization</p>
      <ResponsiveContainer width="100%" height={300}>
        {chartType === 'pie' ? (
          <PieChart>
            <Pie data={chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={110} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
              {chartData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
            </Pie>
            <Tooltip />
          </PieChart>
        ) : chartType === 'line' ? (
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="value" stroke="#6C63FF" strokeWidth={2} dot={{ fill: '#6C63FF', r: 4 }} />
          </LineChart>
        ) : (
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip />
            <Legend />
            <Bar dataKey="value" fill="#6C63FF" radius={[4, 4, 0, 0]} />
          </BarChart>
        )}
      </ResponsiveContainer>
    </div>
  )
}

function InsightsTab({ result }) {
  const insights = result?.insights ?? []
  if (!insights.length) return <p className="text-sm text-gray-400">No insights generated yet.</p>

  return (
    <div className="space-y-3">
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">AI Insights</p>
      {insights.map((insight, i) => (
        <div key={i} className="bg-emerald-50 border border-emerald-100 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1.5">
            <Sparkles size={14} className="text-emerald-600" />
            <span className="text-sm font-medium text-emerald-800">{insight.title}</span>
          </div>
          <p className="text-sm text-emerald-700 leading-relaxed">{insight.body}</p>
        </div>
      ))}
    </div>
  )
}
