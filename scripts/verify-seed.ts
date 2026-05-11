import { createClient } from '@supabase/supabase-js'

async function main() {
  const sb = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )
  const [{ count: examCount }, { count: qCount }, { count: explained }, { data: sample }] = await Promise.all([
    sb.from('exams').select('*', { count: 'exact', head: true }),
    sb.from('questions').select('*', { count: 'exact', head: true }),
    sb.from('questions').select('*', { count: 'exact', head: true }).not('explanation', 'is', null),
    sb.from('exams').select('slug, title, year, is_free').order('year'),
  ])
  console.log(`Exams: ${examCount}`)
  console.log(`Questions: ${qCount}`)
  console.log(`With explanations: ${explained}`)
  console.log('\nExams seeded:')
  for (const e of sample || []) {
    console.log(`  ${e.slug} (${e.year}) — ${e.title}${e.is_free ? ' [FREE]' : ''}`)
  }
}

main().catch(err => { console.error(err); process.exit(1) })
