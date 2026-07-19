export function Card({ children, className = '', hover = false, as: Comp = 'div', ...props }) {
  return (
    <Comp
      className={`rounded-2xl bg-white dark:bg-white/5 border border-black/5 dark:border-white/10 shadow-[var(--shadow-card)] ${
        hover ? 'transition-shadow hover:shadow-[var(--shadow-card-hover)]' : ''
      } ${className}`}
      {...props}
    >
      {children}
    </Comp>
  )
}

export function CardHeader({ title, subtitle, action, className = '' }) {
  return (
    <div className={`flex items-start justify-between gap-3 ${className}`}>
      <div>
        <h3 className="text-[15px] font-semibold text-neutral-900 dark:text-white tracking-tight">{title}</h3>
        {subtitle && <p className="text-[13px] text-neutral-500 dark:text-neutral-400 mt-0.5">{subtitle}</p>}
      </div>
      {action}
    </div>
  )
}
