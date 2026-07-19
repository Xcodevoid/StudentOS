import { supabase, isCloudConfigured } from './supabaseClient'

export const SLUG_MIN = 3
export const SLUG_MAX = 32
const SLUG_REGEX = /^[a-z0-9-]{3,32}$/

export function slugify(input) {
  return (input || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, SLUG_MAX)
}

export function isValidSlug(slug) {
  return SLUG_REGEX.test(slug || '')
}

// Reads from the public_portfolios / public_portfolio_projects views only —
// these are the sole tables an anonymous visitor is allowed to query; see
// the comment in supabase/schema.sql for why that's safe.
export async function fetchPublicPortfolio(slug) {
  if (!isCloudConfigured || !isValidSlug(slug)) return null

  const [{ data: profileRow, error: profileError }, { data: projectRows, error: projectsError }] = await Promise.all([
    supabase.from('public_portfolios').select('*').eq('public_slug', slug).maybeSingle(),
    supabase.from('public_portfolio_projects').select('*').eq('public_slug', slug),
  ])

  if (profileError) throw profileError
  if (projectsError) throw projectsError
  if (!profileRow) return null

  return {
    profile: {
      name: profileRow.name || '',
      gradeLevel: profileRow.grade_level || '',
      school: profileRow.school || '',
      bio: profileRow.bio || '',
    },
    projects: (projectRows || []).sort((a, b) => Number(b.featured) - Number(a.featured) || new Date(b.date || 0) - new Date(a.date || 0)),
  }
}
