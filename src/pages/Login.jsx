import { useState } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import { GalleryVerticalEnd, Mail, Lock, ArrowRight } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { setGuestMode } from '../lib/guestMode'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Field, Input } from '../components/ui/Form'

export default function Login() {
  const { isCloudConfigured, signUpWithEmail, signInWithEmail, signInWithApple, signInWithGoogle, resetPassword } = useAuth()
  const navigate = useNavigate()
  const [mode, setMode] = useState('signin') // signin | signup
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [busy, setBusy] = useState(false)

  if (!isCloudConfigured) return <Navigate to="/" replace />

  function continueAsGuest() {
    setGuestMode(true)
    navigate('/')
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setNotice('')
    setBusy(true)
    try {
      if (mode === 'signup') {
        await signUpWithEmail(email, password, name)
        setNotice('Check your email to confirm your account, then sign in.')
        setMode('signin')
      } else {
        await signInWithEmail(email, password)
        navigate('/')
      }
    } catch (err) {
      setError(err.message || 'Something went wrong.')
    } finally {
      setBusy(false)
    }
  }

  async function handleProvider(fn) {
    setError('')
    try {
      await fn()
    } catch (err) {
      setError(err.message || 'Could not start sign-in.')
    }
  }

  async function handleForgotPassword() {
    if (!email) {
      setError('Enter your email above first, then tap "Forgot password?"')
      return
    }
    try {
      await resetPassword(email)
      setNotice('Password reset email sent.')
      setError('')
    } catch (err) {
      setError(err.message || 'Could not send reset email.')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-canvas dark:bg-[#0b0b0f] px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-7">
          <div className="w-11 h-11 rounded-2xl bg-accent-500 flex items-center justify-center mb-3 shadow-lg shadow-accent-500/20">
            <GalleryVerticalEnd size={22} className="text-white" strokeWidth={2.5} />
          </div>
          <h1 className="text-[20px] font-semibold tracking-tight text-neutral-900 dark:text-white">StudentOS</h1>
          <p className="text-[13.5px] text-neutral-400 mt-1">{mode === 'signin' ? 'Welcome back' : 'Create your account'}</p>
        </div>

        <Card className="p-5">
          <div className="flex flex-col gap-2 mb-4">
            <Button variant="secondary" size="lg" onClick={() => handleProvider(signInWithApple)}>
              <AppleMark /> Continue with Apple
            </Button>
            <Button variant="secondary" size="lg" onClick={() => handleProvider(signInWithGoogle)}>
              <GoogleMark /> Continue with Google
            </Button>
          </div>

          <div className="flex items-center gap-3 my-4">
            <div className="h-px bg-black/10 dark:bg-white/10 flex-1" />
            <span className="text-[12px] text-neutral-400">or with email</span>
            <div className="h-px bg-black/10 dark:bg-white/10 flex-1" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            {mode === 'signup' && (
              <Field label="Name">
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Jamie Chen" />
              </Field>
            )}
            <Field label="Email">
              <div className="relative">
                <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
                <Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@school.edu" className="pl-9" />
              </div>
            </Field>
            <Field label="Password">
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
                <Input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="pl-9"
                />
              </div>
            </Field>

            {mode === 'signin' && (
              <button type="button" onClick={handleForgotPassword} className="text-[12.5px] text-accent-600 dark:text-accent-400 hover:underline">
                Forgot password?
              </button>
            )}

            {error && <p className="text-[12.5px] text-red-500">{error}</p>}
            {notice && <p className="text-[12.5px] text-green-600 dark:text-green-400">{notice}</p>}

            <Button type="submit" size="lg" className="w-full" disabled={busy} icon={ArrowRight}>
              {mode === 'signin' ? 'Sign In' : 'Create Account'}
            </Button>
          </form>

          <p className="text-center text-[13px] text-neutral-500 mt-4">
            {mode === 'signin' ? "Don't have an account? " : 'Already have an account? '}
            <button
              onClick={() => {
                setMode(mode === 'signin' ? 'signup' : 'signin')
                setError('')
                setNotice('')
              }}
              className="text-accent-600 dark:text-accent-400 font-medium hover:underline"
            >
              {mode === 'signin' ? 'Sign up' : 'Sign in'}
            </button>
          </p>
        </Card>

        <button onClick={continueAsGuest} className="w-full text-center text-[13px] text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 mt-5">
          Continue without an account →
        </button>
        <p className="text-center text-[11.5px] text-neutral-400 mt-2 max-w-xs mx-auto">
          Guest data stays only on this device. Sign in any time to sync it to the cloud.
        </p>
      </div>
    </div>
  )
}

function AppleMark() {
  return (
    <svg width="15" height="15" viewBox="0 0 384 512" fill="currentColor">
      <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z"/>
    </svg>
  )
}

function GoogleMark() {
  return (
    <svg width="15" height="15" viewBox="0 0 48 48">
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.6-6 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 8 3l6-6C34.6 5.1 29.6 3 24 3 12.4 3 3 12.4 3 24s9.4 21 21 21 21-9.4 21-21c0-1.4-.1-2.5-.4-3.5z"/>
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 15.9 18.9 13 24 13c3.1 0 5.8 1.1 8 3l6-6C34.6 5.1 29.6 3 24 3c-7.5 0-14 4.2-17.7 10.3z"/>
      <path fill="#4CAF50" d="M24 45c5.5 0 10.4-1.9 14.1-5.1l-6.5-5.5C29.6 36 26.9 37 24 37c-5.3 0-9.7-3.4-11.3-8.1l-6.5 5C9.9 40.6 16.4 45 24 45z"/>
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.2 4.2-4.1 5.6l6.5 5.5C41.4 36 44 30.5 44 24c0-1.4-.1-2.5-.4-3.5z"/>
    </svg>
  )
}
