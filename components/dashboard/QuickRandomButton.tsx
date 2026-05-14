'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

export default function QuickRandomButton({ hasPaid }: { hasPaid: boolean }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleStart() {
    if (!hasPaid) {
      router.push('/payment')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/exam/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_type: 'mini_random',
          question_count: 10,
        }),
      })

      if (res.status === 403) {
        router.push('/payment')
        return
      }

      if (!res.ok) {
        throw new Error('Failed to start test')
      }

      const { sessionId } = await res.json()
      router.push(`/exam/${sessionId}`)
    } catch (err) {
      setLoading(false)
      toast.error('Failed to start random test.')
    }
  }

  return (
    <button 
      onClick={handleStart}
      disabled={loading}
      className="bg-white rounded-2xl border border-slate-200 p-5 hover:border-blue-300 hover:shadow-sm transition-all group text-left w-full disabled:opacity-70 disabled:cursor-not-allowed"
    >
      <div className="text-2xl mb-2">{loading ? '⏳' : '🔀'}</div>
      <h3 className="font-semibold text-slate-900 group-hover:text-blue-600">
        {loading ? 'Starting...' : 'Quick Random'}
      </h3>
      <p className="text-xs text-slate-400 mt-0.5">Instant 10-question mix</p>
      {!hasPaid && <span className="text-xs text-blue-600 font-medium block mt-1">Unlock →</span>}
    </button>
  )
}
