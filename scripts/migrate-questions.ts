import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

interface RawQuestion {
  id: number
  question: string
  options: { A: string; B: string; C: string; D: string }
  answer: string
  category?: string
  explanation?: string
}

const EXAM_REGISTRY = [
  {
    slug: 'ldc-2012',
    title: 'LDC 2012',
    year: 2012,
    exam_type: 'LDC',
    duration_mins: 120,
    is_free: false,
    source_file: 'ldc_2012.json',
  },
  {
    slug: 'udc-2015',
    title: 'UDC 2015',
    year: 2015,
    exam_type: 'UDC',
    duration_mins: 120,
    is_free: true, // ← free exam
    source_file: 'UDC_2015.json',
  },
  {
    slug: 'udc-2023',
    title: 'UDC 2023',
    year: 2023,
    exam_type: 'UDC',
    duration_mins: 120,
    is_free: false,
    source_file: 'UDC_2023.json',
  },
  {
    slug: 'field-assistant-2023',
    title: 'Field Assistant 2023',
    year: 2023,
    exam_type: 'FIELD_ASSISTANT',
    duration_mins: 120,
    is_free: false,
    source_file: 'field_assistant_2023.json',
  },
  {
    slug: 'assistant-tier1-2025',
    title: 'Assistant Tier-1 2025',
    year: 2025,
    exam_type: 'ASSISTANT_TIER1',
    duration_mins: 120,
    is_free: false,
    source_file: 'assistant_tier1_2025.json',
  },
  {
    slug: 'assistant-tier2-2025',
    title: 'Assistant Tier-2 2025',
    year: 2025,
    exam_type: 'ASSISTANT_TIER2',
    duration_mins: 120,
    is_free: false,
    source_file: 'assistant_tier2_2025.json',
  },
  {
    slug: 'pc-2025-paper1',
    title: 'Police Constable 2025 — Paper 1',
    year: 2025,
    exam_type: 'POLICE_CONSTABLE',
    duration_mins: 120,
    is_free: false,
    source_file: 'pc2025_paper1.json',
  },
  {
    slug: 'vao-2025-paper1',
    title: 'VAO 2025 — Paper 1',
    year: 2025,
    exam_type: 'VAO',
    duration_mins: 120,
    is_free: false,
    source_file: 'vao2025_paper1.json',
  },
  {
    slug: 'vao-2025-paper2',
    title: 'VAO 2025 — Paper 2',
    year: 2025,
    exam_type: 'VAO',
    duration_mins: 120,
    is_free: false,
    source_file: 'vao2025_paper2.json',
  },
]

// JSON files are one level up from the pondyprep folder
const JSON_DIR = path.resolve(__dirname, '..', '..')

async function migrate() {
  console.log('Starting migration...\n')
  let totalQuestions = 0

  for (const exam of EXAM_REGISTRY) {
    console.log(`Processing: ${exam.title}`)

    // Upsert exam row
    const { data: examRow, error: examErr } = await supabase
      .from('exams')
      .upsert(
        {
          slug: exam.slug,
          title: exam.title,
          year: exam.year,
          exam_type: exam.exam_type,
          duration_mins: exam.duration_mins,
          is_free: exam.is_free,
          is_active: true,
          source_file: exam.source_file,
        },
        { onConflict: 'slug' }
      )
      .select('id')
      .single()

    if (examErr || !examRow) {
      console.error(`  ✗ Failed to upsert exam: ${examErr?.message}`)
      continue
    }

    const examId = examRow.id

    // Read JSON file
    const filePath = path.join(JSON_DIR, exam.source_file)
    if (!fs.existsSync(filePath)) {
      console.error(`  ✗ File not found: ${filePath}`)
      continue
    }

    const raw: RawQuestion[] = JSON.parse(fs.readFileSync(filePath, 'utf-8'))

    // Map to DB rows
    const questionRows = raw.map(q => ({
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

    // Upsert in batches of 50
    const BATCH = 50
    for (let i = 0; i < questionRows.length; i += BATCH) {
      const batch = questionRows.slice(i, i + BATCH)
      const { error } = await supabase
        .from('questions')
        .upsert(batch, { onConflict: 'exam_id,position' })

      if (error) {
        console.error(`  ✗ Batch ${i / BATCH + 1} failed: ${error.message}`)
      }
    }

    totalQuestions += raw.length
    console.log(`  ✓ ${raw.length} questions imported (exam_id: ${examId})`)
  }

  console.log(`\nMigration complete. Total questions: ${totalQuestions}`)
}

migrate().catch(console.error)
