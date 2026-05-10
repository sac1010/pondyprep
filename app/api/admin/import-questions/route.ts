import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

interface RawQuestion {
  id: number
  question: string
  options: { A: string; B: string; C: string; D: string }
  answer: string
  category?: string
}

export async function POST(request: NextRequest) {
  const formData = await request.formData()
  const adminKey = formData.get('admin_key') as string

  if (adminKey !== process.env.ADMIN_SECRET_KEY) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  const file = formData.get('file') as File
  const slug = formData.get('slug') as string
  const title = formData.get('title') as string
  const year = parseInt(formData.get('year') as string)
  const exam_type = formData.get('exam_type') as string
  const duration_mins = parseInt(formData.get('duration_mins') as string) || 120
  const is_free = formData.get('is_free') === 'true'

  if (!file || !slug || !title) {
    return NextResponse.json({ error: 'missing_fields' }, { status: 400 })
  }

  const text = await file.text()
  let questions: RawQuestion[]
  try {
    questions = JSON.parse(text)
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 })
  }

  const serviceSupabase = await createServiceClient()

  // Upsert exam
  const { data: examRow, error: examErr } = await serviceSupabase
    .from('exams')
    .upsert({ slug, title, year, exam_type, duration_mins, is_free, is_active: true, source_file: file.name }, { onConflict: 'slug' })
    .select('id')
    .single()

  if (examErr || !examRow) {
    return NextResponse.json({ error: examErr?.message || 'exam_upsert_failed' }, { status: 500 })
  }

  const examId = examRow.id
  const rows = questions.map(q => ({
    exam_id: examId,
    position: q.id,
    question_text: q.question,
    option_a: q.options.A,
    option_b: q.options.B,
    option_c: q.options.C,
    option_d: q.options.D,
    correct_answer: q.answer,
    category: q.category ?? null,
  }))

  // Upsert in batches
  const BATCH = 50
  for (let i = 0; i < rows.length; i += BATCH) {
    const { error } = await serviceSupabase
      .from('questions')
      .upsert(rows.slice(i, i + BATCH), { onConflict: 'exam_id,position' })
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true, count: rows.length, examId })
}
