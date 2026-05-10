'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

interface Props {
  examId: string
  examSlug: string
}

export default function StartExamButton({ examId, examSlug }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleStart() {
    setLoading(true)
    try {
      const res = await fetch('/api/exam/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_type: 'mock', exam_id: examId }),
      })
      const data = await res.json()

      if (!res.ok) {
        if (data.error === 'free_limit_reached') {
          toast.error('You have already used your free test. Upgrade to continue.')
          router.push('/payment')
        } else if (data.error === 'upgrade_required') {
          toast.error('Unlock all exams to continue')
          router.push('/payment')
        } else {
          toast.error(data.error || 'Failed to start exam')
        }
        return
      }

      router.push(`/exam/${data.sessionId}`)
    } catch {
      toast.error('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleStart}
      disabled={loading}
      className="w-full bg-blue-600 text-white py-3.5 rounded-xl font-semibold text-sm hover:bg-blue-700 active:scale-[0.98] transition-all disabled:opacity-60"
    >
      {loading ? (
        <span className="flex items-center justify-center gap-2">
          <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
          </svg>
          Starting…
        </span>
      ) : 'Start Test'}
    </button>
  )
}
