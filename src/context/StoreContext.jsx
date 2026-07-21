import { createContext, useContext, useEffect, useMemo, useState, useCallback, useRef } from 'react'
import { loadData, saveData, defaultData, uid } from '../lib/storage'
import { seedDemoData } from '../lib/seed'
import { recordToday } from '../lib/streak'
import { useAuth } from './AuthContext'
import { supabase, isCloudConfigured } from '../lib/supabaseClient'
import { TABLES, toDb, profileToDb } from '../lib/cloudMap'
import { pullAllFromCloud, pushAllToCloud, wipeAllCloud, hasMeaningfulData } from '../lib/cloudSync'

const StoreContext = createContext(null)

export function StoreProvider({ children }) {
  const { user } = useAuth()
  const cloudActive = isCloudConfigured && Boolean(user)

  const [data, setData] = useState(loadData)
  const [cloudLoading, setCloudLoading] = useState(false)
  const [migrationOffer, setMigrationOffer] = useState(null)

  const dataRef = useRef(data)
  useEffect(() => {
    dataRef.current = data
  }, [data])

  // Guest mode: mirror every change to localStorage, exactly as before cloud support existed.
  useEffect(() => {
    if (!cloudActive) saveData(data)
  }, [data, cloudActive])

  // On login, pull this student's cloud data. If the cloud account is brand
  // new and this device already has local data, offer to import it instead
  // of silently discarding it.
  useEffect(() => {
    if (!cloudActive) {
      setData(loadData())
      return
    }
    let cancelled = false
    const localSnapshot = loadData()
    setCloudLoading(true)
    pullAllFromCloud(user.id)
      .then((cloudData) => {
        if (cancelled) return
        const cloudIsEmpty = !hasMeaningfulData(cloudData) && !cloudData.profile.onboarded
        if (cloudIsEmpty && hasMeaningfulData(localSnapshot)) {
          setMigrationOffer({ localSnapshot })
        }
        setData(cloudData)
      })
      .catch((err) => console.error('Failed to load cloud data:', err))
      .finally(() => !cancelled && setCloudLoading(false))
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cloudActive, user?.id])

  const profileSyncTimer = useRef(null)
  useEffect(() => () => clearTimeout(profileSyncTimer.current), [])

  const scheduleProfileSync = useCallback(() => {
    if (!cloudActive) return
    clearTimeout(profileSyncTimer.current)
    profileSyncTimer.current = setTimeout(() => {
      const snap = dataRef.current
      const row = profileToDb(
        snap.profile,
        {
          streakDates: snap.streak.datesActive,
          badgesSeen: snap.badges.seen,
          remindersNotified: snap.notifications.remindersNotified,
          northStar: snap.northStar,
          testTargets: snap.testPrep.targets,
          majorFit: snap.majorFit,
        },
        user.id
      )
      supabase.from('profiles').upsert(row).then(({ error }) => error && console.error(error))
    }, 700)
  }, [cloudActive, user])

  const addItem = useCallback(
    (entity, item) => {
      const newItem = { id: uid(), ...item }
      setData((prev) => ({ ...prev, [entity]: [...prev[entity], newItem] }))
      if (cloudActive && TABLES[entity]) {
        supabase.from(TABLES[entity]).insert(toDb(entity, newItem, user.id)).then(({ error }) => error && console.error(error))
      }
      return newItem.id
    },
    [cloudActive, user]
  )

  const updateItem = useCallback(
    (entity, id, patch) => {
      setData((prev) => ({
        ...prev,
        [entity]: prev[entity].map((it) => (it.id === id ? { ...it, ...patch } : it)),
      }))
      if (cloudActive && TABLES[entity]) {
        supabase
          .from(TABLES[entity])
          .update(toDb(entity, patch, user.id))
          .eq('id', id)
          .eq('user_id', user.id)
          .then(({ error }) => error && console.error(error))
      }
    },
    [cloudActive, user]
  )

  const removeItem = useCallback(
    (entity, id) => {
      setData((prev) => ({ ...prev, [entity]: prev[entity].filter((it) => it.id !== id) }))
      if (cloudActive && TABLES[entity]) {
        supabase.from(TABLES[entity]).delete().eq('id', id).eq('user_id', user.id).then(({ error }) => error && console.error(error))
      }
    },
    [cloudActive, user]
  )

  const toggleItem = useCallback(
    (entity, id, field = 'done') => {
      const current = data[entity].find((it) => it.id === id)
      if (!current) return
      const nextValue = !current[field]
      setData((prev) => ({
        ...prev,
        [entity]: prev[entity].map((it) => (it.id === id ? { ...it, [field]: nextValue } : it)),
      }))
      if (cloudActive && TABLES[entity]) {
        supabase
          .from(TABLES[entity])
          .update(toDb(entity, { [field]: nextValue }, user.id))
          .eq('id', id)
          .eq('user_id', user.id)
          .then(({ error }) => error && console.error(error))
      }
    },
    [data, cloudActive, user]
  )

  const setProfile = useCallback(
    (patch) => {
      setData((prev) => ({ ...prev, profile: { ...prev.profile, ...patch } }))
      scheduleProfileSync()
    },
    [scheduleProfileSync]
  )

  const setNorthStar = useCallback(
    (patch) => {
      setData((prev) => ({
        ...prev,
        northStar: {
          ...prev.northStar,
          ...patch,
          goals: patch.goals ? { ...prev.northStar.goals, ...patch.goals } : prev.northStar.goals,
        },
      }))
      scheduleProfileSync()
    },
    [scheduleProfileSync]
  )

  const setTestTargets = useCallback(
    (patch) => {
      setData((prev) => ({ ...prev, testPrep: { targets: { ...prev.testPrep.targets, ...patch } } }))
      scheduleProfileSync()
    },
    [scheduleProfileSync]
  )

  const setMajorFit = useCallback(
    (patch) => {
      setData((prev) => ({ ...prev, majorFit: { ...prev.majorFit, ...patch } }))
      scheduleProfileSync()
    },
    [scheduleProfileSync]
  )

  const recordActivityToday = useCallback(() => {
    setData((prev) => ({ ...prev, streak: { ...prev.streak, datesActive: recordToday(prev.streak.datesActive) } }))
    scheduleProfileSync()
  }, [scheduleProfileSync])

  const isReminded = useCallback((key) => Boolean(data.notifications.remindersNotified[key]), [data.notifications.remindersNotified])

  const markReminded = useCallback(
    (key) => {
      setData((prev) => ({
        ...prev,
        notifications: { ...prev.notifications, remindersNotified: { ...prev.notifications.remindersNotified, [key]: true } },
      }))
      scheduleProfileSync()
    },
    [scheduleProfileSync]
  )

  const markBadgesSeen = useCallback(
    (ids) => {
      setData((prev) => ({ ...prev, badges: { ...prev.badges, seen: [...new Set([...prev.badges.seen, ...ids])] } }))
      scheduleProfileSync()
    },
    [scheduleProfileSync]
  )

  const resetAll = useCallback(() => {
    const empty = defaultData()
    setData(empty)
    if (cloudActive) {
      wipeAllCloud(user.id)
        .then(() =>
          supabase
            .from('profiles')
            .upsert(profileToDb(empty.profile, { streakDates: [], badgesSeen: [], remindersNotified: {}, northStar: empty.northStar, testTargets: {}, majorFit: empty.majorFit }, user.id))
        )
        .catch((err) => console.error(err))
    }
  }, [cloudActive, user])

  const loadDemo = useCallback(() => {
    const demo = { ...defaultData(), ...seedDemoData() }
    setData(demo)
    if (cloudActive) pushAllToCloud(user.id, demo).catch((err) => console.error(err))
  }, [cloudActive, user])

  const replaceAll = useCallback(
    (next) => {
      const base = defaultData()
      const merged = {
        ...base,
        ...next,
        // Backups exported before Opportunities was renamed from "deadlines"
        // should still import cleanly.
        opportunities: next.opportunities || next.deadlines || [],
        profile: { ...base.profile, ...next.profile },
        streak: { ...base.streak, ...next.streak },
        badges: { ...base.badges, ...next.badges },
        notifications: { ...base.notifications, ...next.notifications },
        northStar: {
          ...base.northStar,
          ...next.northStar,
          goals: { ...base.northStar.goals, ...next.northStar?.goals },
        },
        testPrep: { targets: { ...base.testPrep.targets, ...next.testPrep?.targets } },
        majorFit: { ...base.majorFit, ...next.majorFit },
      }
      setData(merged)
      if (cloudActive) pushAllToCloud(user.id, merged).catch((err) => console.error(err))
    },
    [cloudActive, user]
  )

  const acceptMigration = useCallback(() => {
    if (!migrationOffer || !user) return
    const snapshot = migrationOffer.localSnapshot
    setMigrationOffer(null)
    setData(snapshot)
    pushAllToCloud(user.id, snapshot).catch((err) => console.error(err))
  }, [migrationOffer, user])

  const declineMigration = useCallback(() => setMigrationOffer(null), [])

  const value = useMemo(
    () => ({
      data,
      setData,
      addItem,
      updateItem,
      removeItem,
      toggleItem,
      setProfile,
      setNorthStar,
      setTestTargets,
      setMajorFit,
      resetAll,
      loadDemo,
      replaceAll,
      recordActivityToday,
      isReminded,
      markReminded,
      markBadgesSeen,
      mode: cloudActive ? 'cloud' : 'local',
      cloudLoading,
      migrationOffer,
      acceptMigration,
      declineMigration,
    }),
    [
      data,
      addItem,
      updateItem,
      removeItem,
      toggleItem,
      setProfile,
      setNorthStar,
      setTestTargets,
      setMajorFit,
      resetAll,
      loadDemo,
      replaceAll,
      recordActivityToday,
      isReminded,
      markReminded,
      markBadgesSeen,
      cloudActive,
      cloudLoading,
      migrationOffer,
      acceptMigration,
      declineMigration,
    ]
  )

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}

export function useStore() {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error('useStore must be used within StoreProvider')
  return ctx
}
