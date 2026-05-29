import { useState, useRef, useEffect } from 'react'
import { MessageCircle, Send, Lightbulb, ChevronDown, Bot, User } from 'lucide-react'
import axios from 'axios'

const SUGGESTED = [
  'Show summary statistics',
  'Which columns have missing values?',
  'Show top 5 rows',
  'What are the data types?',
  'Generate a distribution chart',
]

export default function ChatPanel({ dataset, onResult }) {
  const [messages, setMessages] = useState([
    {
      role: 'ai',
      text: 'Hello! Upload a dataset and I\'ll generate insights, charts, and summaries for you automatically.',
      time: now(),
    },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [showSuggested, setShowSuggested] = useState(false)
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function sendMessage(text) {
    if (!text.trim() || !dataset) return
    const userMsg = { role: 'user', text, time: now() }
    setMessages((m) => [...m, userMsg])
    setInput('')
    setLoading(true)
    setShowSuggested(false)

    try {
      const res = await axios.post('http://localhost:4000/api/analyze', {
        query: text,
        datasetId: dataset.id,
      })
      const data = res.data
      setMessages((m) => [
        ...m,
        { role: 'ai', text: data.summary || 'Here are the results.', time: now() },
      ])
      onResult(data)
    } catch (err) {
      setMessages((m) => [
        ...m,
        { role: 'ai', text: 'Sorry, something went wrong. Make sure the backend is running.', time: now(), error: true },
      ])
    } finally {
      setLoading(false)
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage(input)
    }
  }

  return (
    <div className="flex flex-col bg-white border-b border-gray-100" style={{ minHeight: 0 }}>
      <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
        <div className="flex items-center gap-2 text-brand-500 font-medium text-sm">
          <MessageCircle size={16} />
          Chat with your data
        </div>
        <div className="relative">
          <button
            onClick={() => setShowSuggested(!showSuggested)}
            className="flex items-center gap-1.5 text-xs text-gray-500 border border-gray-200 rounded-lg px-3 py-1.5 hover:bg-gray-50 transition-colors"
          >
            <Lightbulb size={12} />
            Suggested Questions
            <ChevronDown size={12} />
          </button>
          {showSuggested && (
            <div className="absolute right-0 top-9 bg-white border border-gray-100 rounded-xl shadow-lg py-1 w-64 z-50">
              {SUGGESTED.map((q) => (
                <button
                  key={q}
                  className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  onClick={() => sendMessage(q)}
                >
                  {q}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4 scrollbar-thin" style={{ maxHeight: '240px' }}>
        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'ai' ? 'bg-brand-500' : 'bg-gray-200'}`}>
              {msg.role === 'ai'
                ? <Bot size={14} className="text-white" />
                : <User size={14} className="text-gray-600" />
              }
            </div>
            <div className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs text-gray-400">
                  {msg.role === 'ai' ? 'AI Analyst' : 'You'}
                </span>
                <span className="text-xs text-gray-300">{msg.time}</span>
              </div>
              <div className={`rounded-2xl px-4 py-2.5 text-sm max-w-xs leading-relaxed
                ${msg.role === 'user'
                  ? 'bg-brand-500 text-white rounded-tr-sm'
                  : msg.error
                    ? 'bg-red-50 text-red-700 border border-red-100 rounded-tl-sm'
                    : 'bg-gray-50 text-gray-800 border border-gray-100 rounded-tl-sm'
                }`}
              >
                {msg.text}
              </div>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex gap-3">
            <div className="w-7 h-7 rounded-full bg-brand-500 flex items-center justify-center shrink-0">
              <Bot size={14} className="text-white" />
            </div>
            <div className="bg-gray-50 border border-gray-100 rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-brand-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-1.5 h-1.5 bg-brand-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-1.5 h-1.5 bg-brand-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="px-5 py-3 border-t border-gray-100 flex gap-3">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={dataset ? 'Ask something about your data...' : 'Upload a dataset first...'}
          disabled={!dataset || loading}
          className="flex-1 text-sm bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:border-brand-400 focus:bg-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        />
        <button
          onClick={() => sendMessage(input)}
          disabled={!dataset || !input.trim() || loading}
          className="w-10 h-10 rounded-xl bg-brand-500 hover:bg-brand-600 flex items-center justify-center transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          aria-label="Send message"
        >
          <Send size={15} className="text-white" />
        </button>
      </div>
    </div>
  )
}

function now() {
  return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}
