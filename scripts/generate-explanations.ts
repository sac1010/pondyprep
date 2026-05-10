import Anthropic from '@anthropic-ai/sdk'
import fs from 'fs'
import path from 'path'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const JSON_DIR = path.join(__dirname, '../../')
const JSON_FILES = [
  'UDC_2023.json',
  'UDC_2015.json',
  'ldc_2012.json',
  'field_assistant_2023.json',
  'assistant_tier1_2025.json',
  'assistant_tier2_2025.json',
  'pc2025_paper1.json',
  'vao2025_paper1.json',
  'vao2025_paper2.json',
]

interface Question {
  id: number
  question: string
  options: { A: string; B: string; C: string; D: string }
  answer: string
  category: string
  explanation?: string
}

async function generateExplanations(questions: Question[]): Promise<Record<number, string>> {
  const batch = questions.map(q => ({
    id: q.id,
    question: q.question,
    options: q.options,
    answer: q.answer,
  }))

  const response = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 2048,
    messages: [
      {
        role: 'user',
        content: `You are an expert tutor for Pondicherry (Puducherry) government recruitment exams. For each question below, write a concise explanation (1-2 sentences) that tells the student WHY the correct answer is right. Be factual and educational. Do not repeat the answer letter or restate the question.

Return ONLY a valid JSON array with objects: [{"id": <number>, "explanation": "<text>"}, ...]

Questions:
${JSON.stringify(batch, null, 2)}`,
      },
    ],
  })

  const text = response.content[0].type === 'text' ? response.content[0].text : ''
  const jsonMatch = text.match(/\[[\s\S]*\]/)
  if (!jsonMatch) throw new Error('No JSON array found in response')

  const results: { id: number; explanation: string }[] = JSON.parse(jsonMatch[0])
  return Object.fromEntries(results.map(r => [r.id, r.explanation]))
}

async function processFile(filename: string) {
  const filepath = path.join(JSON_DIR, filename)
  const questions: Question[] = JSON.parse(fs.readFileSync(filepath, 'utf-8'))

  const missing = questions.filter(q => !q.explanation)
  if (missing.length === 0) {
    console.log(`${filename}: all explanations present, skipping`)
    return
  }

  console.log(`${filename}: generating explanations for ${missing.length} questions...`)

  const BATCH_SIZE = 10
  let completed = 0

  for (let i = 0; i < missing.length; i += BATCH_SIZE) {
    const batch = missing.slice(i, i + BATCH_SIZE)
    let retries = 0
    while (retries < 3) {
      try {
        const explanations = await generateExplanations(batch)
        for (const q of questions) {
          if (explanations[q.id] !== undefined) {
            q.explanation = explanations[q.id]
          }
        }
        completed += batch.length
        console.log(`  ${filename}: ${completed}/${missing.length}`)
        break
      } catch (err) {
        retries++
        console.error(`  Batch ${i}-${i + BATCH_SIZE} failed (attempt ${retries}):`, err)
        if (retries >= 3) throw err
        await new Promise(r => setTimeout(r, 2000 * retries))
      }
    }
    // Save after each batch so progress isn't lost on failure
    fs.writeFileSync(filepath, JSON.stringify(questions, null, 2))
    // Small delay to avoid rate limits
    await new Promise(r => setTimeout(r, 300))
  }

  console.log(`${filename}: done ✓`)
}

async function main() {
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error('Error: ANTHROPIC_API_KEY environment variable not set')
    process.exit(1)
  }

  for (const file of JSON_FILES) {
    await processFile(file)
  }

  console.log('\nAll files complete.')
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
