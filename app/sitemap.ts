import type { MetadataRoute } from 'next'
import { createBuildClient } from '@/lib/supabase/server'

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://pondyprep.in'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  let examUrls: MetadataRoute.Sitemap = []
  try {
    const db = createBuildClient()
    const { data: exams } = await db
      .from('exams')
      .select('slug, created_at')
      .eq('is_active', true)
    examUrls = (exams ?? []).map(exam => ({
      url: `${BASE_URL}/tests/${exam.slug}`,
      lastModified: exam.created_at ? new Date(exam.created_at) : new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    }))
  } catch {}

  return [
    { url: BASE_URL, lastModified: new Date(), changeFrequency: 'weekly', priority: 1 },
    { url: `${BASE_URL}/tests`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    ...examUrls,
    { url: `${BASE_URL}/payment`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE_URL}/privacy`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
    { url: `${BASE_URL}/terms`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
    { url: `${BASE_URL}/refunds`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
  ]
}
