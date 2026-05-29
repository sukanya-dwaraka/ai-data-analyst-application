import { useState, useEffect } from 'react'
import Sidebar from './components/Sidebar'
import Topbar from './components/Topbar'
import ChatPanel from './components/ChatPanel'
import ResultsPanel from './components/ResultsPanel'
import UploadModal from './components/UploadModal'
import LoginPage from './components/LoginPage'

export default function App() {
  const [user, setUser] = useState(null)
  const [dataset, setDataset] = useState(null)
  const [analysisResult, setAnalysisResult] = useState(null)
  const [showUpload, setShowUpload] = useState(false)
  const [activeTab, setActiveTab] = useState('result')

  useEffect(() => {
    const saved = localStorage.getItem('ai_analyst_user')
    if (saved) setUser(JSON.parse(saved))
  }, [])

  function handleLogin(userData) {
    setUser(userData)
  }

  function handleLogout() {
    localStorage.removeItem('ai_analyst_user')
    setUser(null)
    setDataset(null)
    setAnalysisResult(null)
  }

  if (!user) return <LoginPage onLogin={handleLogin} />

  return (
    <div className="flex flex-col h-screen bg-gray-50 overflow-hidden">
      <Topbar
        dataset={dataset}
        onUploadClick={() => setShowUpload(true)}
        user={user}
        onLogout={handleLogout}
      />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar dataset={dataset} />
        <main className="flex-1 flex flex-col overflow-hidden">
          <ChatPanel dataset={dataset} onResult={(r) => { setAnalysisResult(r); setActiveTab('result') }} />
          <ResultsPanel result={analysisResult} activeTab={activeTab} setActiveTab={setActiveTab} />
        </main>
      </div>
      {showUpload && (
        <UploadModal
          onClose={() => setShowUpload(false)}
          onUploaded={(data) => { setDataset(data); setAnalysisResult(null); setShowUpload(false) }}
        />
      )}
    </div>
  )
}
