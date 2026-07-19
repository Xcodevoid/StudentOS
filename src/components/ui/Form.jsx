const fieldClass =
  'w-full rounded-xl border border-black/10 dark:border-white/15 bg-white dark:bg-white/5 px-3.5 py-2.5 text-[14px] text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-accent-500/40 focus:border-accent-500 transition-colors'

export function Field({ label, hint, children, className = '' }) {
  return (
    <label className={`block ${className}`}>
      {label && <span className="block text-[13px] font-medium text-neutral-600 dark:text-neutral-300 mb-1.5">{label}</span>}
      {children}
      {hint && <span className="block text-[12px] text-neutral-400 mt-1">{hint}</span>}
    </label>
  )
}

export function Input({ className = '', ...props }) {
  return <input className={`${fieldClass} ${className}`} {...props} />
}

export function Textarea({ className = '', rows = 3, ...props }) {
  return <textarea rows={rows} className={`${fieldClass} resize-none ${className}`} {...props} />
}

export function Select({ className = '', children, ...props }) {
  return (
    <select className={`${fieldClass} appearance-none bg-no-repeat bg-[right_0.9rem_center] ${className}`} {...props}>
      {children}
    </select>
  )
}

export function Checkbox({ checked, onChange, className = '' }) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      onClick={onChange}
      className={`flex-shrink-0 w-5 h-5 rounded-full border-[1.5px] flex items-center justify-center transition-all ${
        checked
          ? 'bg-accent-500 border-accent-500'
          : 'border-neutral-300 dark:border-neutral-600 hover:border-accent-500'
      } ${className}`}
    >
      {checked && (
        <svg width="11" height="9" viewBox="0 0 11 9" fill="none">
          <path d="M1 4.5L4 7.5L10 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </button>
  )
}
