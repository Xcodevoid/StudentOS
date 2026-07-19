import { useEffect } from 'react'
import { useStore } from '../context/StoreContext'
import { useToast } from '../context/ToastContext'
import { getReminderItems, EXAM_MILESTONES, KIND_LABEL } from '../lib/reminders'
import { daysUntil } from '../lib/dates'
import { computeStreak } from '../lib/streak'
import { computeBadges } from '../lib/badges'

const CHECK_INTERVAL_MS = 60_000

// Mounted once near the app root. Two jobs, both silent unless something is
// actually due: (1) fire browser notifications for newly-due items and exam
// countdown milestones, deduped via data.notifications.remindersNotified;
// (2) toast newly-unlocked badges.
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
        if (item.kind === 'exam') {
          if (!EXAM_MILESTONES.includes(diff)) return
          const key = `exam-${item.id}-${diff}`
          if (isReminded(key)) return
          markReminded(key)
          const body = diff === 0 ? `${item.title} is today. You've got this.` : `${diff} day${diff === 1 ? '' : 's'} until ${item.title}.`
          new Notification('Exam countdown', { body })
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
    const streak = computeStreak(data.streak.datesActive)
    const badges = computeBadges(data, streak)
    const newlyUnlocked = badges.filter((b) => b.unlocked && !data.badges.seen.includes(b.id))
    if (newlyUnlocked.length === 0) return
    newlyUnlocked.forEach((b) => {
      push(`Badge unlocked: ${b.label}`, { tone: 'celebrate', description: b.description })
    })
    markBadgesSeen(newlyUnlocked.map((b) => b.id))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.classes, data.projects, data.exams, data.studyTasks, data.deadlines, data.studySessions, data.streak])

  return null
}
