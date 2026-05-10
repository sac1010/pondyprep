'use client'

import { useState } from 'react'
import { toast } from 'sonner'

const EXAM_TYPES = ['UDC', 'LDC', 'FIELD_ASSISTANT', 'ASSISTANT_TIER1', 'ASSISTANT_TIER2', 'POLICE_CONSTABLE', 'VAO']

export default function AdminPage() {
  const [adminKey, setAdminKey] = useState('')
  const [authed, setAuthed] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [meta, setMeta] = useState({ slug: '', title: '', year: '', exam_type: 'UDC', duration_mins: '120', is_free: false })
  const [uploading, setUploading] = useState(false)
  const [result, setResult] = useState<string | null>(null)

  function handleAuth(e: React.FormEvent) {
    e.preventDefault()
    if (adminKey === process.env.NEXT_PUBLIC_ADMIN_KEY) {
      setAuthed(true)
    } else {
      toast.error('Invalid admin key')
    }
  }

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault()
    if (!file) { toast.error('Select a JSON file'); return }

    setUploading(true)
    setResult(null)

    const formData = new FormData()
    formData.append('file', file)
    formData.append('slug', meta.slug)
    formData.append('title', meta.title)
    formData.append('year', meta.year)
    formData.append('exam_type', meta.exam_type)
    formData.append('duration_mins', meta.duration_mins)
    formData.append('is_free', String(meta.is_free))
    formData.append('admin_key', adminKey)

    const res = await fetch('/api/admin/import-questions', { method: 'POST', body: formData })
    const data = await res.json()

    setUploading(false)

    if (res.ok) {
      toast.success(`Imported ${data.count} questions for "${meta.title}"`)
      setResult(`✓ ${data.count} questions imported. Exam ID: ${data.examId}`)
      setFile(null)
    } else {
      toast.error(data.error || 'Import failed')
    }
  }

  if (!authed) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <form onSubmit={handleAuth} className="bg-white rounded-2xl border border-slate-200 p-8 w-full max-w-sm space-y-4">
          <h1 className="text-lg font-semibold text-slate-900">Admin Access</h1>
          <input
            type="password"
            value={adminKey}
            onChange={e => setAdminKey(e.target.value)}
            placeholder="Admin key"
            className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm outline-none focus:border-blue-500"
          />
          <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-xl font-medium text-sm hover:bg-blue-700">
            Enter
          </button>
        </form>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-6">
      <div className="max-w-xl mx-auto">
        <h1 className="text-2xl font-bold text-slate-900 mb-8">Admin Panel</h1>

        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <h2 className="font-semibold text-slate-900 mb-4">Import Exam Paper</h2>
          <form onSubmit={handleUpload} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">JSON File</label>
              <input
                type="file"
                accept=".json"
                onChange={e => setFile(e.target.files?.[0] || null)}
                className="w-full text-sm text-slate-600 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-blue-50 file:text-blue-600 file:font-medium"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Slug</label>
                <input value={meta.slug} onChange={e => setMeta({...meta, slug: e.target.value})}
                  placeholder="udc-2024" className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:border-blue-500" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Year</label>
                <input value={meta.year} onChange={e => setMeta({...meta, year: e.target.value})}
                  placeholder="2024" className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:border-blue-500" required />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
              <input value={meta.title} onChange={e => setMeta({...meta, title: e.target.value})}
                placeholder="UDC 2024" className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:border-blue-500" required />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Exam Type</label>
                <select value={meta.exam_type} onChange={e => setMeta({...meta, exam_type: e.target.value})}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:border-blue-500">
                  {EXAM_TYPES.map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Duration (min)</label>
                <input value={meta.duration_mins} onChange={e => setMeta({...meta, duration_mins: e.target.value})}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:border-blue-500" />
              </div>
            </div>
            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input type="checkbox" checked={meta.is_free} onChange={e => setMeta({...meta, is_free: e.target.checked})} />
              Mark as free exam
            </label>

            {result && <p className="text-sm text-green-700 bg-green-50 rounded-lg px-3 py-2">{result}</p>}

            <button
              type="submit"
              disabled={uploading}
              className="w-full bg-blue-600 text-white py-3 rounded-xl font-medium text-sm hover:bg-blue-700 disabled:opacity-60"
            >
              {uploading ? 'Importing…' : 'Import Questions'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
