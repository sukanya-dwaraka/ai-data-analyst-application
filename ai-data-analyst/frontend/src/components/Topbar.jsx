import { BarChart2, Upload, ChevronDown, LogOut, User } from 'lucide-react'
import { useState } from 'react'

export default function Topbar({ dataset, onUploadClick, user, onLogout }) {
  const [showMenu, setShowMenu] = useState(false)

  const initials = user?.name
    ? user.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
    : 'U'

  return (
    <header className="flex items-center gap-3 px-5 h-14 bg-white border-b border-gray-100 shrink-0 z-10">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center">
          <BarChart2 size={16} className="text-white" />
        </div>
        <span className="font-semibold text-gray-900 text-base">AI Data Analyst</span>
      </div>

      <div className="flex-1" />

      <button
        onClick={onUploadClick}
        className="flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
      >
        <Upload size={14} />
        Upload Dataset
      </button>

      {dataset && (
        <div className="flex items-center gap-1.5 text-sm text-gray-500 border border-gray-200 rounded-lg px-3 py-1.5">
          <span className="text-gray-400 text-xs">📄</span>
          <span className="text-gray-700 font-medium truncate max-w-32">{dataset.filename}</span>
          <ChevronDown size={13} className="text-gray-400" />
        </div>
      )}

      <div className="relative">
        <button
          onClick={() => setShowMenu(!showMenu)}
          className="flex items-center gap-2 hover:bg-gray-50 rounded-xl px-2 py-1.5 transition-colors"
        >
          <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center">
            <span className="text-xs font-semibold text-brand-600">{initials}</span>
          </div>
          <span className="text-sm text-gray-700 font-medium hidden sm:block">{user?.name}</span>
          <ChevronDown size={13} className="text-gray-400" />
        </button>

        {showMenu && (
          <div className="absolute right-0 top-11 bg-white border border-gray-100 rounded-xl shadow-lg py-1.5 w-44 z-50">
            <div className="px-3 py-2 border-b border-gray-50 mb-1">
              <p className="text-xs font-medium text-gray-800 truncate">{user?.name}</p>
              <p className="text-xs text-gray-400 truncate">{user?.email}</p>
            </div>
            <button
              className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-500 hover:bg-red-50 transition-colors"
              onClick={() => { setShowMenu(false); onLogout() }}
            >
              <LogOut size={14} />
              Logout
            </button>
          </div>
        )}
      </div>
    </header>
  )
}
