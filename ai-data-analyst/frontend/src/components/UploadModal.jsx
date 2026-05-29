import { useState, useRef } from 'react'
import { X, Upload, FileText, AlertCircle, CheckCircle2 } from 'lucide-react'
import axios from 'axios'

export default function UploadModal({ onClose, onUploaded }) {
  const [dragging, setDragging] = useState(false)
  const [file, setFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState(null)
  const inputRef = useRef()

  function handleDrop(e) {
    e.preventDefault()
    setDragging(false)
    const f = e.dataTransfer.files[0]
    if (f) validateAndSet(f)
  }

  function validateAndSet(f) {
    const valid = ['text/csv', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel']
    const extOk = f.name.endsWith('.csv') || f.name.endsWith('.xlsx') || f.name.endsWith('.xls')
    if (!valid.includes(f.type) && !extOk) {
      setError('Please upload a CSV or Excel (.xlsx/.xls) file.')
      return
    }
    setError(null)
    setFile(f)
  }

  async function handleUpload() {
    if (!file) return
    setUploading(true)
    setError(null)
    const formData = new FormData()
    formData.append('file', file)
    try {
      const res = await axios.post("https://ai-data-analyst-application.onrender.com/api/upload", formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      onUploaded(res.data)
    } catch (err) {
      setError(err.response?.data?.error || 'Upload failed. Make sure the backend is running on port 4000.')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">Upload Dataset</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-400 transition-colors">
            <X size={16} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div
            onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            onClick={() => inputRef.current.click()}
            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
              dragging ? 'border-brand-400 bg-brand-50' : 'border-gray-200 hover:border-brand-300 hover:bg-gray-50'
            }`}
          >
            <input
              ref={inputRef}
              type="file"
              accept=".csv,.xlsx,.xls"
              className="hidden"
              onChange={(e) => validateAndSet(e.target.files[0])}
            />
            <Upload size={28} className="mx-auto mb-3 text-gray-300" />
            <p className="text-sm font-medium text-gray-600">Drop your file here or click to browse</p>
            <p className="text-xs text-gray-400 mt-1">Supports CSV, XLSX, XLS</p>
          </div>

          {file && !error && (
            <div className="flex items-center gap-3 bg-brand-50 border border-brand-100 rounded-xl px-4 py-3">
              <FileText size={18} className="text-brand-500 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate">{file.name}</p>
                <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(1)} KB</p>
              </div>
              <CheckCircle2 size={16} className="text-green-500" />
            </div>
          )}

          {error && (
            <div className="flex items-start gap-2 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
              <AlertCircle size={16} className="text-red-500 mt-0.5 shrink-0" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <div className="flex gap-3 pt-1">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleUpload}
              disabled={!file || uploading || !!error}
              className="flex-1 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-sm text-white font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {uploading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Uploading...
                </>
              ) : 'Upload & Analyze'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
