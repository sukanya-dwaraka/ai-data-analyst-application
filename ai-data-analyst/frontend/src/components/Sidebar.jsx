import { LayoutGrid, Columns, Zap, ChevronRight, CheckCircle2 } from 'lucide-react'

const TYPE_COLORS = {
  int:    'bg-blue-50 text-blue-700',
  float:  'bg-purple-50 text-purple-700',
  string: 'bg-green-50 text-green-700',
  date:   'bg-amber-50 text-amber-700',
  bool:   'bg-pink-50 text-pink-700',
}

const TYPE_ICON = {
  int: '123',
  float: '1.0',
  string: 'Aa',
  date: '📅',
  bool: '✓',
}

export default function Sidebar({ dataset }) {
  return (
    <aside className="w-56 shrink-0 bg-white border-r border-gray-100 flex flex-col overflow-y-auto scrollbar-thin">
      <section className="px-4 pt-4">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-brand-500 uppercase tracking-wider mb-2">
          <LayoutGrid size={13} />
          Dataset Overview
        </div>

        {dataset ? (
          <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-800 truncate">{dataset.filename}</span>
              <CheckCircle2 size={16} className="text-green-500 shrink-0" />
            </div>
            <div className="space-y-1">
              {[
                ['Rows', dataset.rows?.toLocaleString()],
                ['Columns', dataset.columns?.length],
                ['File Size', dataset.fileSize],
              ].map(([label, val]) => (
                <div key={label} className="flex justify-between text-xs">
                  <span className="text-gray-500">{label}</span>
                  <span className="font-medium text-gray-800">{val ?? '—'}</span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-gray-50 rounded-xl p-3 border border-dashed border-gray-200 text-center">
            <p className="text-xs text-gray-400">No dataset loaded</p>
            <p className="text-xs text-gray-400 mt-0.5">Upload a CSV or Excel file</p>
          </div>
        )}
      </section>

      {dataset?.columns?.length > 0 && (
        <section className="px-4 pt-4">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-brand-500 uppercase tracking-wider mb-2">
            <Columns size={13} />
            Columns
          </div>
          <div className="space-y-0.5">
            {dataset.columns.map((col) => (
              <div
                key={col.name}
                className="flex items-center justify-between px-2 py-1.5 rounded-lg hover:bg-gray-50 cursor-default group"
              >
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="text-[10px] font-mono text-gray-400 w-5 shrink-0">
                    {TYPE_ICON[col.type] ?? '?'}
                  </span>
                  <span className="text-xs text-gray-700 truncate">{col.name}</span>
                </div>
                <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium shrink-0 ml-1 ${TYPE_COLORS[col.type] ?? 'bg-gray-100 text-gray-500'}`}>
                  {col.type}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="px-4 pt-4 pb-4">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-brand-500 uppercase tracking-wider mb-2">
          <Zap size={13} />
          Quick Actions
        </div>
        {['Summary Statistics', 'Missing Values', 'Data Preview'].map((action) => (
          <button
            key={action}
            className="flex items-center justify-between w-full px-2 py-2 rounded-lg hover:bg-gray-50 text-xs text-gray-600 transition-colors"
          >
            <span>{action}</span>
            <ChevronRight size={13} className="text-gray-400" />
          </button>
        ))}
      </section>
    </aside>
  )
}
