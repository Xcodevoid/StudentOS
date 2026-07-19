const variants = {
  primary: 'bg-accent-500 text-white hover:bg-accent-600 active:bg-accent-700 shadow-sm',
  secondary: 'bg-black/[0.04] text-neutral-900 hover:bg-black/[0.07] dark:bg-white/10 dark:text-white dark:hover:bg-white/15',
  ghost: 'text-neutral-600 hover:bg-black/[0.04] dark:text-neutral-300 dark:hover:bg-white/10',
  danger: 'text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10',
}

const sizes = {
  sm: 'text-[13px] px-2.5 py-1.5 gap-1.5',
  md: 'text-[14px] px-3.5 py-2 gap-2',
  lg: 'text-[15px] px-5 py-2.5 gap-2',
}

export function Button({ children, variant = 'primary', size = 'md', className = '', as: Comp = 'button', icon: Icon, ...props }) {
  return (
    <Comp
      className={`inline-flex items-center justify-center rounded-full font-medium transition-colors disabled:opacity-40 disabled:pointer-events-none whitespace-nowrap ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {Icon && <Icon size={size === 'sm' ? 14 : 16} strokeWidth={2.25} />}
      {children}
    </Comp>
  )
}

export function IconButton({ icon: Icon, className = '', size = 16, ...props }) {
  return (
    <button
      className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-neutral-500 hover:bg-black/[0.05] hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-white/10 dark:hover:text-white transition-colors ${className}`}
      {...props}
    >
      <Icon size={size} strokeWidth={2.25} />
    </button>
  )
}
