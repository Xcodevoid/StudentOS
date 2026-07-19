import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getGuestMode } from '../lib/guestMode'
import { GalleryVerticalEnd } from 'lucide-react'

export default function RequireAccess({ children }) {
  const { isCloudConfigured, user, loading } = useAuth()

  if (!isCloudConfigured) return children

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-canvas dark:bg-[#0b0b0f]">
        <div className="w-10 h-10 rounded-2xl bg-accent-500 flex items-center justify-center animate-pulse">
          <GalleryVerticalEnd size={20} className="text-white" strokeWidth={2.5} />
        </div>
      </div>
    )
  }

  if (!user && !getGuestMode()) return <Navigate to="/login" replace />

  return children
}
