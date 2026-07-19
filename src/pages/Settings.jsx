import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Download, Upload, Sparkles, Trash2, ShieldCheck, BellRing, BellOff, Send, LogOut, LogIn, Cloud, CloudOff } from 'lucide-react'
import { useStore } from '../context/StoreContext'
import { useToast } from '../context/ToastContext'
import { useAuth } from '../context/AuthContext'
import { setGuestMode } from '../lib/guestMode'
import { Card, CardHeader } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Misc'
import { Field, Input, Textarea, Select } from '../components/ui/Form'

function useNotificationPermission() {
  const [permission, setPermission] = useState(typeof Notification === 'undefined' ? 'unsupported' : Notification.permission)
  return {
    permission,
    request: async () => {
      if (typeof Notification === 'undefined') return 'unsupported'
      const result = await Notification.requestPermission()
      setPermission(result)
      return result
    },
  }
}

export default function SettingsPage() {
  const { data, mode, setProfile, resetAll, loadDemo, replaceAll } = useStore()
  const { push } = useToast()
  const { isCloudConfigured, user, signOut } = useAuth()
  const { permission, request } = useNotificationPermission()
  const navigate = useNavigate()
  const fileRef = useRef(null)
  const [confirmReset, setConfirmReset] = useState(false)
  const [confirmDemo, setConfirmDemo] = useState(false)
  const [importError, setImportError] = useState('')

  async function handleSignOut() {
    await signOut()
    setGuestMode(false)
    navigate('/login')
  }

  async function enableNotifications() {
    const result = await request()
    if (result === 'granted') {
      setProfile({ notificationsEnabled: true })
      push('Reminders enabled', { tone: 'success', description: 'You’ll get a browser notification when homework, exams, or deadlines are due.' })
    } else if (result === 'denied') {
      push('Notifications blocked', { description: 'Enable them in your browser’s site settings to turn reminders back on.' })
    }
  }

  function disableNotifications() {
    setProfile({ notificationsEnabled: false })
  }

  function sendTest() {
    if (Notification.permission === 'granted') {
      new Notification('StudentOS reminder', { body: 'This is what a due-date reminder looks like.' })
    }
  }

  function exportData() {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `studentos-backup-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  function handleImportFile(e) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result)
        replaceAll(parsed)
        setImportError('')
      } catch {
        setImportError('That file could not be read. Make sure it’s a StudentOS export.')
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-[24px] sm:text-[26px] font-semibold tracking-tight text-neutral-900 dark:text-white">Settings</h1>
        <p className="text-[14px] text-neutral-500 dark:text-neutral-400 mt-1">
          {mode === 'cloud' ? 'Your profile and data, synced to your account.' : 'Your profile and data, stored locally on this device.'}
        </p>
      </div>

      {isCloudConfigured && (
        <Card className="p-5">
          <CardHeader
            title="Account"
            subtitle={user ? user.email : 'Browsing as a guest'}
            action={<Badge tone={mode === 'cloud' ? 'green' : 'neutral'}>{mode === 'cloud' ? <><Cloud size={11} className="inline -mt-0.5 mr-1" />Synced</> : <><CloudOff size={11} className="inline -mt-0.5 mr-1" />Guest</>}</Badge>}
          />
          <div className="mt-4">
            {user ? (
              <Button variant="secondary" icon={LogOut} onClick={handleSignOut}>Sign out</Button>
            ) : (
              <div>
                <p className="text-[13px] text-neutral-500 mb-3">
                  Your data is only on this device right now. Sign in to save it to the cloud and pick up where you left off on any device.
                </p>
                <Button icon={LogIn} onClick={() => navigate('/login')}>Sign in or create an account</Button>
              </div>
            )}
          </div>
        </Card>
      )}

      <Card className="p-5">
        <CardHeader title="Profile" subtitle="Shown on your dashboard and generated portfolio." />
        <div className="mt-4 space-y-4">
          <Field label="Full name">
            <Input value={data.profile.name} onChange={(e) => setProfile({ name: e.target.value })} placeholder="Your name" />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Grade level">
              <Select value={data.profile.gradeLevel} onChange={(e) => setProfile({ gradeLevel: e.target.value })}>
                {['9th Grade', '10th Grade', '11th Grade', '12th Grade'].map((g) => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </Select>
            </Field>
            <Field label="School">
              <Input value={data.profile.school} onChange={(e) => setProfile({ school: e.target.value })} placeholder="Your school" />
            </Field>
          </div>
          <Field label="Bio" hint="A short intro shown at the top of your portfolio.">
            <Textarea value={data.profile.bio} onChange={(e) => setProfile({ bio: e.target.value })} rows={3} placeholder="Tell colleges and collaborators who you are." />
          </Field>
        </div>
      </Card>

      <Card className="p-5">
        <CardHeader title="Reminders" subtitle="Browser notifications for homework, exams, and deadlines while StudentOS is open." />
        <div className="mt-4">
          {permission === 'unsupported' ? (
            <p className="text-[13px] text-neutral-400">Your browser doesn't support notifications. You can still see everything due in the bell menu at the top of the app.</p>
          ) : permission === 'granted' && data.profile.notificationsEnabled ? (
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 text-[13px] text-green-600 dark:text-green-400 font-medium">
                <BellRing size={15} /> Reminders are on
              </span>
              <Button size="sm" variant="secondary" icon={Send} onClick={sendTest}>Send test</Button>
              <Button size="sm" variant="ghost" icon={BellOff} onClick={disableNotifications}>Turn off</Button>
            </div>
          ) : permission === 'denied' ? (
            <p className="text-[13px] text-neutral-500">
              Notifications are blocked for this site. Enable them in your browser's site settings, then reload this page.
            </p>
          ) : (
            <Button variant="secondary" icon={BellRing} onClick={enableNotifications}>Enable reminders</Button>
          )}
        </div>
      </Card>

      <Card className="p-5">
        <CardHeader
          title="Your Data"
          subtitle={mode === 'cloud' ? 'Backed up to your account, but a local export is good insurance.' : 'StudentOS stores everything in this browser only — nothing is sent to a server unless you sign in.'}
        />
        <div className="mt-4 flex flex-col sm:flex-row gap-2">
          <Button variant="secondary" icon={Download} onClick={exportData}>Export backup (.json)</Button>
          <Button variant="secondary" icon={Upload} onClick={() => fileRef.current?.click()}>Import backup</Button>
          <input ref={fileRef} type="file" accept="application/json" className="hidden" onChange={handleImportFile} />
        </div>
        {importError && <p className="text-[12.5px] text-red-500 mt-2">{importError}</p>}
        {mode === 'local' && (
          <div className="flex items-start gap-2 mt-4 text-[12.5px] text-neutral-400">
            <ShieldCheck size={15} className="flex-shrink-0 mt-0.5" />
            <p>Export a backup before switching browsers or devices — local storage doesn't sync automatically.</p>
          </div>
        )}
      </Card>

      <Card className="p-5">
        <CardHeader title="Sample Data" subtitle="Load example classes, exams, and projects to explore StudentOS." />
        <div className="mt-4">
          {confirmDemo ? (
            <div className="flex items-center gap-2">
              <span className="text-[13px] text-neutral-500">This replaces your current data. Continue?</span>
              <Button size="sm" onClick={() => { loadDemo(); setConfirmDemo(false) }}>Yes, load sample data</Button>
              <Button size="sm" variant="ghost" onClick={() => setConfirmDemo(false)}>Cancel</Button>
            </div>
          ) : (
            <Button variant="secondary" icon={Sparkles} onClick={() => setConfirmDemo(true)}>Load sample data</Button>
          )}
        </div>
      </Card>

      <Card className="p-5 border-red-200 dark:border-red-500/20">
        <CardHeader title="Danger Zone" subtitle={mode === 'cloud' ? 'Permanently erase everything in your account.' : 'Permanently erase everything stored on this device.'} />
        <div className="mt-4">
          {confirmReset ? (
            <div className="flex items-center gap-2">
              <span className="text-[13px] text-neutral-500">This cannot be undone. Continue?</span>
              <Button size="sm" variant="danger" onClick={() => { resetAll(); setConfirmReset(false) }}>Yes, delete everything</Button>
              <Button size="sm" variant="ghost" onClick={() => setConfirmReset(false)}>Cancel</Button>
            </div>
          ) : (
            <Button variant="danger" icon={Trash2} onClick={() => setConfirmReset(true)}>Reset all data</Button>
          )}
        </div>
      </Card>
    </div>
  )
}
