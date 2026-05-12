import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const JSON_DIR = path.resolve(__dirname, '..', '..', '..')
const FILES = ['PONDY_MOCK_NEW_1.json', 'PONDY_MOCK_NEW_2.json', 'PONDY_MOCK_NEW_3.json', 'PONDY_MOCK_NEW_4.json', 'PONDY_MOCK_NEW_5.json']

async function seed() {
  console.log('Starting seed...')
  
  // Create a dummy exam to hold these questions because exam_id cannot be null
  const { data: examRow, error: examErr } = await supabase
    .from('exams')
    .upsert({
      slug: 'mega-question-bank',
      title: 'Mega Question Bank',
      year: 2026,
      exam_type: 'PRACTICE',
      duration_mins: 0,
      is_free: true,
      is_active: false // Keep it inactive so it doesn't show up in the test list
    }, { onConflict: 'slug' })
    .select('id')
    .single()
    
  if (examErr || !examRow) {
    console.error('Failed to create bank exam:', examErr)
    return
  }
  
  const examId = examRow.id
  let total = 0
  
  for (let i = 0; i < FILES.length; i++) {
    const file = FILES[i]
    const filePath = path.resolve(__dirname, '..', '..', file)
    console.log(`Reading ${filePath}`)
    if (!fs.existsSync(filePath)) {
      console.error(`File not found: ${filePath}`)
      continue
    }
    
    const raw = JSON.parse(fs.readFileSync(filePath, 'utf-8'))
    
    const questionRows = raw.map((q: any) => ({
      exam_id: examId,
      position: q.id,
      question_text: q.question,
      option_a: q.options.A,
      option_b: q.options.B,
      option_c: q.options.C,
      option_d: q.options.D,
      correct_answer: q.answer,
      category: q.category ?? null,
      explanation: q.explanation ?? null,
    }))
    
    const BATCH = 50
    for (let j = 0; j < questionRows.length; j += BATCH) {
      const batch = questionRows.slice(j, j + BATCH)
      const { error } = await supabase
        .from('questions')
        .upsert(batch, { onConflict: 'exam_id,position' })
      
      if (error) {
        console.error(`Batch failed: ${error.message}`)
      }
    }
    total += raw.length
    console.log(`Inserted ${raw.length} questions from ${file}`)
  }
  
  console.log(`Seed complete. Total: ${total}`)
}

seed().catch(console.error)
