import { supabase } from './supabaseClient'
import { TABLES, toDb, fromDb, profileToDb, profileFromDb } from './cloudMap'
import { defaultData } from './storage'
import { wipeEvidenceFiles } from './evidenceStorage'

export async function pullAllFromCloud(userId) {
  const { data: profileRow, error: profileError } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle()
  if (profileError) throw profileError

  const entityResults = await Promise.all(
    Object.entries(TABLES).map(async ([entity, table]) => {
      const { data: rows, error } = await supabase.from(table).select('*').eq('user_id', userId)
      if (error) throw error
      return [entity, (rows || []).map((r) => fromDb(entity, r))]
    })
  )

  const base = defaultData()
  const assembled = { ...base }
  entityResults.forEach(([entity, rows]) => {
    assembled[entity] = rows
  })

  if (profileRow) {
    const { profile, streak, badges, notifications, northStar } = profileFromDb(profileRow)
    assembled.profile = profile
    assembled.streak = streak
    assembled.badges = badges
    assembled.notifications = notifications
    assembled.northStar = northStar
  }

  return assembled
}

export async function wipeAllCloud(userId) {
  await Promise.all(Object.values(TABLES).map((table) => supabase.from(table).delete().eq('user_id', userId)))
  await wipeEvidenceFiles(userId)
}

// Replaces everything in the cloud with the given local dataset — used both
// by "reset & load demo data" and by the one-time local -> cloud migration.
export async function pushAllToCloud(userId, data) {
  await wipeAllCloud(userId)

  await Promise.all(
    Object.entries(TABLES).map(([entity, table]) => {
      const rows = (data[entity] || []).map((item) => toDb(entity, item, userId))
      if (rows.length === 0) return Promise.resolve()
      return supabase.from(table).insert(rows)
    })
  )

  const profileRow = profileToDb(
    data.profile,
    {
      streakDates: data.streak?.datesActive || [],
      badgesSeen: data.badges?.seen || [],
      remindersNotified: data.notifications?.remindersNotified || {},
      northStar: data.northStar || {},
    },
    userId
  )
  const { error } = await supabase.from('profiles').upsert(profileRow)
  if (error) throw error
}

export function hasMeaningfulData(data) {
  return (
    data.classes.length > 0 ||
    data.assignments.length > 0 ||
    data.exams.length > 0 ||
    data.projects.length > 0 ||
    data.activities.length > 0 ||
    data.opportunities.length > 0 ||
    data.tasks.length > 0 ||
    data.evidence.length > 0
  )
}
