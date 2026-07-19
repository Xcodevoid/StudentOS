import { createContext, useCallback, useContext, useState } from 'react'
import { CheckCircle2, PartyPopper, Info } from 'lucide-react'

const ToastContext = createContext(null)

const ICONS = { success: CheckCircle2, celebrate: PartyPopper, info: Info }

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const push = useCallback((message, opts = {}) => {
    const id = Math.random().toString(36).slice(2, 9)
    const toast = { id, message, tone: opts.tone || 'info', description: opts.description }
    setToasts((prev) => [...prev, toast])
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), opts.duration || 4500)
  }, [])

  return (
    <ToastContext.Provider value={{ push }}>
      {children}
      <div className="fixed bottom-4 sm:bottom-6 inset-x-0 z-[60] flex flex-col items-center gap-2 pointer-events-none px-4">
        {toasts.map((t) => {
          const Icon = ICONS[t.tone] || Info
          return (
            <div
              key={t.id}
              className="pointer-events-auto flex items-start gap-2.5 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 rounded-2xl shadow-xl px-4 py-3 max-w-sm w-full sm:w-auto animate-[toastIn_0.25s_ease-out]"
            >
              <Icon size={18} className="flex-shrink-0 mt-0.5 text-accent-400 dark:text-accent-600" />
              <div className="min-w-0">
                <p className="text-[13.5px] font-medium leading-snug">{t.message}</p>
                {t.description && <p className="text-[12px] opacity-70 mt-0.5">{t.description}</p>}
              </div>
            </div>
          )
        })}
      </div>
      <style>{`@keyframes toastIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }`}</style>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}
