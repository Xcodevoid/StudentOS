import { supabase, isCloudConfigured } from './supabaseClient'
import { uid } from './storage'

const BUCKET = 'evidence'

function sanitizeFilename(name) {
  return (name || 'file').replace(/[^a-zA-Z0-9._-]/g, '-')
}

// Uploads to a {userId}/... path, matching the storage.objects RLS policies
// in schema.sql (owner-only, keyed off the first path segment).
export async function uploadEvidenceFile(userId, file) {
  const path = `${userId}/${uid()}-${sanitizeFilename(file.name)}`
  const { error } = await supabase.storage.from(BUCKET).upload(path, file)
  if (error) throw error
  return path
}

// The bucket is private — there is no public URL. Resolve a short-lived
// signed URL on demand each time a file needs to be shown; never persist it.
export async function getEvidenceSignedUrl(path, expiresInSeconds = 3600) {
  if (!path) return null
  const { data, error } = await supabase.storage.from(BUCKET).createSignedUrl(path, expiresInSeconds)
  if (error) throw error
  return data.signedUrl
}

export async function deleteEvidenceFile(path) {
  if (!path) return
  await supabase.storage.from(BUCKET).remove([path])
}

// "Reset all data" and "load sample data" both wipe every DB row for a user
// — this clears the actual uploaded files too, so a reset doesn't leave
// orphaned files behind in the bucket.
export async function wipeEvidenceFiles(userId) {
  if (!isCloudConfigured) return
  const { data: files, error } = await supabase.storage.from(BUCKET).list(userId)
  if (error || !files || files.length === 0) return
  await supabase.storage.from(BUCKET).remove(files.map((f) => `${userId}/${f.name}`))
}
