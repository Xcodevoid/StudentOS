import { useEffect } from 'react'
import { useStore } from '../context/StoreContext'
import { useToast } from '../context/ToastContext'
import { getReminderItems, EXAM_MILESTONES, KIND_LABEL } from '../lib/reminders'
import { daysUntil } from '../lib/dates'
import { computeNorthStar } from '../lib/northStar'

const CHECK_INTERVAL_MS = 60_000

// Mounted once near the app root. Two jobs, both silent unless something is
// actually due: (1) fire browser notifications for newly-due items and
// exam/test countdown milestones, deduped via data.notifications.remindersNotified;
// (2) toast a North Star characteristic crossing an evidence-count milestone
// (1st/3rd/5th/10th piece) (reuses the same
// "seen" dedup store that badge unlocks used to).
export default function BackgroundEngine() {
  const { data, isReminded, markReminded, markBadgesSeen } = useStore()
  const { push } = useToast()

  useEffect(() => {
    function checkReminders() {
      if (typeof Notification === 'undefined') return
      if (Notification.permission !== 'granted' || !data.profile.notificationsEnabled) return

      const todayStr = new Date().toISOString().slice(0, 10)
      getReminderItems(data).forEach((item) => {
        const diff = daysUntil(item.date)
        if (item.kind === 'exam' || item.kind === 'test') {
          if (!EXAM_MILESTONES.includes(diff)) return
          const key = `${item.kind}-${item.id}-${diff}`
          if (isReminded(key)) return
          markReminded(key)
          const body = diff === 0 ? `${item.title} is today. You've got this.` : `${diff} day${diff === 1 ? '' : 's'} until ${item.title}.`
          new Notification(item.kind === 'exam' ? 'Exam countdown' : 'Test countdown', { body })
        } else {
          if (diff > 0) return
          const key = `${item.kind}-${item.id}-${todayStr}`
          if (isReminded(key)) return
          markReminded(key)
          const body = diff === 0 ? `${item.title} is due today.` : `${item.title} is overdue.`
          new Notification(`${KIND_LABEL[item.kind]} reminder`, { body })
        }
      })
    }

    checkReminders()
    const id = setInterval(checkReminders, CHECK_INTERVAL_MS)
    return () => clearInterval(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data])

  useEffect(() => {
    const chosenIds = data.northStar.characteristics || []
    if (chosenIds.length === 0) return
    const northStar = computeNorthStar(data)
    const milestoneCounts = [1, 3, 5, 10]
    const newMilestones = northStar.dimensions
      .filter((d) => chosenIds.includes(d.id) && milestoneCounts.includes(d.evidenceCount))
      .map((d) => ({ id: `northstar-${d.id}-${d.evidenceCount}`, label: d.label, count: d.evidenceCount }))
      .filter((m) => !data.badges.seen.includes(m.id))
    if (newMilestones.length === 0) return
    newMilestones.forEach((m) => {
      push(`${m.label} is growing`, { tone: 'celebrate', description: `${m.count} piece${m.count === 1 ? '' : 's'} of evidence now — keep building.` })
    })
    markBadgesSeen(newMilestones.map((m) => m.id))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.projects, data.activities, data.habits, data.habitLogs, data.reflections, data.commitments, data.northStar.characteristics])

  return null
}
