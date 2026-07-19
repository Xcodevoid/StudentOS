import { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react'
import { useStore } from './StoreContext'
import { useToast } from './ToastContext'

const TimerContext = createContext(null)

export function TimerProvider({ children }) {
  const { addItem, recordActivityToday, data } = useStore()
  const { push } = useToast()
  const [status, setStatus] = useState('idle') // idle | running | paused
  const [remaining, setRemaining] = useState(0)
  const [total, setTotal] = useState(0)
  const [label, setLabel] = useState('')
  const [examId, setExamId] = useState(null)
  const intervalRef = useRef(null)

  const complete = useCallback(() => {
    clearInterval(intervalRef.current)
    const minutes = Math.round(total / 60)
    if (minutes > 0) {
      addItem('studySessions', { examId, minutes, date: new Date().toISOString().slice(0, 10) })
      recordActivityToday()
    }
    if (typeof Notification !== 'undefined' && Notification.permission === 'granted' && data.profile.notificationsEnabled) {
      new Notification('Focus session complete', { body: `Nice work — you studied ${label || 'your material'} for ${minutes} min.` })
    }
    push(`Focus session complete — ${minutes} min logged.`, { tone: 'celebrate', description: label })
    setStatus('idle')
    setRemaining(0)
    setTotal(0)
  }, [total, examId, label, addItem, recordActivityToday, push, data.profile.notificationsEnabled])

  useEffect(() => {
    if (status !== 'running') return
    intervalRef.current = setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          clearInterval(intervalRef.current)
          setTimeout(complete, 0)
          return 0
        }
        return r - 1
      })
    }, 1000)
    return () => clearInterval(intervalRef.current)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status])

  const start = useCallback((minutes, opts = {}) => {
    const seconds = Math.round(minutes * 60)
    setTotal(seconds)
    setRemaining(seconds)
    setLabel(opts.label || '')
    setExamId(opts.examId || null)
    setStatus('running')
  }, [])

  const pause = useCallback(() => setStatus('paused'), [])
  const resume = useCallback(() => setStatus('running'), [])
  const stop = useCallback(() => {
    clearInterval(intervalRef.current)
    setStatus('idle')
    setRemaining(0)
    setTotal(0)
  }, [])

  const value = { status, remaining, total, label, examId, start, pause, resume, stop }

  return <TimerContext.Provider value={value}>{children}</TimerContext.Provider>
}

export function useTimer() {
  const ctx = useContext(TimerContext)
  if (!ctx) throw new Error('useTimer must be used within TimerProvider')
  return ctx
}
