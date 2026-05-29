import { useState } from 'react'
import { BarChart2, Eye, EyeOff, Mail, Lock, User } from 'lucide-react'

export default function LoginPage({ onLogin }) {
  const [mode, setMode] = useState('login')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({ name: '', email: '', password: '' })

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
    setError('')
  }

  function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (!form.email || !form.password) {
      setError('Please fill in all fields.')
      return
    }
    if (mode === 'signup' && !form.name) {
      setError('Please enter your name.')
      return
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }

    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      const user = {
        name: mode === 'signup' ? form.name : form.email.split('@')[0],
        email: form.email,
      }
      localStorage.setItem('ai_analyst_user', JSON.stringify(user))
      onLogin(user)
    }, 1000)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">

        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-brand-500 flex items-center justify-center mx-auto mb-4">
            <BarChart2 size={22} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">AI Data Analyst</h1>
          <p className="text-gray-500 text-sm mt-1">Upload datasets, get instant AI insights</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-8">

          <div className="flex rounded-xl bg-gray-100 p-1 mb-6">
            <button
              onClick={() => { setMode('login'); setError('') }}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${mode === 'login' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Sign In
            </button>
            <button
              onClick={() => { setMode('signup'); setError('') }}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${mode === 'signup' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Sign Up
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1.5 block">Full Name</label>
                <div className="relative">
                  <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="John Doe"
                    className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100 transition-all"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="text-xs font-medium text-gray-600 mb-1.5 block">Email Address</label>
              <div className="relative">
                <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-gray-600 mb-1.5 block">Password</label>
              <div className="relative">
                <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-10 py-2.5 text-sm border border-gray-200 rounded-xl outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {mode === 'login' && (
              <div className="text-right">
                <button type="button" className="text-xs text-brand-500 hover:text-brand-600 font-medium">
                  Forgot password?
                </button>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-2.5 text-sm text-red-600">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-brand-500 hover:bg-brand-600 text-white font-medium py-2.5 rounded-xl text-sm transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  {mode === 'login' ? 'Signing in...' : 'Creating account...'}
                </>
              ) : (
                mode === 'login' ? 'Sign In' : 'Create Account'
              )}
            </button>
          </form>

          <div className="mt-4 pt-4 border-t border-gray-100 text-center">
            <p className="text-xs text-gray-400">
              {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
              <button
                onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError('') }}
                className="text-brand-500 hover:text-brand-600 font-medium"
              >
                {mode === 'login' ? 'Sign up free' : 'Sign in'}
              </button>
            </p>
          </div>
        </div>

        <p className="text-center text-xs text-gray-400 mt-4">
          Demo app — credentials are stored locally only
        </p>
      </div>
    </div>
  )
}
