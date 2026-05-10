'use client'

import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { formatTime } from '@/lib/exam/engine'

interface ExamTimerProps {
  durationSeconds: number
  sessionId: string
  onTimeUp: () => void
  onTick: (remaining: number) => void
}

export default function ExamTimer({ durationSeconds, sessionId, onTimeUp, onTick }: ExamTimerProps) {
  const endTimeRef = useRef<number>(0)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const [remaining, setRemaining] = useState(durationSeconds)

  useEffect(() => {
    // Restore from sessionStorage if exists (page refresh recovery)
    const stored = sessionStorage.getItem(`exam_end_${sessionId}`)
    if (stored) {
      endTimeRef.current = parseInt(stored, 10)
    } else {
      endTimeRef.current = Date.now() + durationSeconds * 1000
      sessionStorage.setItem(`exam_end_${sessionId}`, String(endTimeRef.current))
    }

    function tick() {
      const r = Math.max(0, Math.ceil((endTimeRef.current - Date.now()) / 1000))
      setRemaining(r)
      onTick(r)
      if (r <= 0) {
        if (intervalRef.current) clearInterval(intervalRef.current)
        sessionStorage.removeItem(`exam_end_${sessionId}`)
        onTimeUp()
      }
    }

    tick()
    intervalRef.current = setInterval(tick, 500)
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [sessionId])

  const isWarning = remaining <= 300  // 5 minutes
  const isCritical = remaining <= 60  // 1 minute
  const pct = Math.min(100, (remaining / durationSeconds) * 100)

  return (
    <motion.div
      animate={isCritical ? { x: [0, -2, 2, -2, 2, 0] } : {}}
      transition={{ repeat: Infinity, duration: 0.5 }}
      className={`flex items-center gap-2 px-4 py-2 rounded-xl font-mono text-sm font-semibold ${
        isCritical
          ? 'bg-red-100 text-red-700 border border-red-200'
          : isWarning
          ? 'bg-yellow-50 text-yellow-700 border border-yellow-200'
          : 'bg-slate-100 text-slate-700 border border-slate-200'
      }`}
    >
      <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <motion.span
        animate={isCritical ? { opacity: [1, 0.4, 1] } : {}}
        transition={{ repeat: Infinity, duration: 1 }}
      >
        {formatTime(remaining)}
      </motion.span>
    </motion.div>
  )
}
