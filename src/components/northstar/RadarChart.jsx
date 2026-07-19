const TONE = {
  neutral: { stroke: 'stroke-neutral-300 dark:stroke-neutral-500', fill: 'fill-neutral-300/10 dark:fill-neutral-500/10', dot: 'fill-neutral-400' },
  accent: { stroke: 'stroke-accent-500', fill: 'fill-accent-500/10', dot: 'fill-accent-500' },
  amber: { stroke: 'stroke-amber-500', fill: 'fill-amber-500/10', dot: 'fill-amber-500' },
  green: { stroke: 'stroke-green-500', fill: 'fill-green-500/10', dot: 'fill-green-500' },
  purple: { stroke: 'stroke-purple-500', fill: 'fill-purple-500/10', dot: 'fill-purple-500' },
}

// A single-series radar: one shape, one hue (by overall tier) — never a rainbow
// per axis. Grid rings are solid hairlines; the polygon is a soft ~10% wash
// with a 2px stroke; vertex dots carry a surface-color ring so they read
// cleanly where spokes cross them.
export function RadarChart({ dimensions, tone = 'accent', size = 300, showLabels = true }) {
  const center = size / 2
  const labelGutter = showLabels ? 46 : 8
  const maxR = center - labelGutter
  const count = dimensions.length
  const angleStep = (Math.PI * 2) / count
  const startAngle = -Math.PI / 2
  const colors = TONE[tone] || TONE.accent

  const pointAt = (i, rPct) => {
    const angle = startAngle + i * angleStep
    const r = maxR * rPct
    return [center + r * Math.cos(angle), center + r * Math.sin(angle)]
  }

  const rings = [0.25, 0.5, 0.75, 1]
  const scorePoints = dimensions.map((d, i) => pointAt(i, (d.score ?? 0) / 100).join(',')).join(' ')

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size}>
        {rings.map((pct) => (
          <polygon
            key={pct}
            points={dimensions.map((_, i) => pointAt(i, pct).join(',')).join(' ')}
            fill="none"
            strokeWidth={1}
            className="stroke-black/[0.08] dark:stroke-white/10"
          />
        ))}
        {dimensions.map((_, i) => {
          const [x, y] = pointAt(i, 1)
          return <line key={i} x1={center} y1={center} x2={x} y2={y} strokeWidth={1} className="stroke-black/[0.08] dark:stroke-white/10" />
        })}
        <polygon
          points={scorePoints}
          strokeWidth={2}
          strokeLinejoin="round"
          className={`${colors.fill} ${colors.stroke} transition-all duration-700 ease-out`}
        />
        {dimensions.map((d, i) => {
          const [x, y] = pointAt(i, (d.score ?? 0) / 100)
          return (
            <g key={d.id}>
              <circle cx={x} cy={y} r={7} className="fill-white dark:fill-neutral-900" />
              <circle cx={x} cy={y} r={5} className={`${colors.dot} ${d.recentlyActive ? 'animate-pulse' : ''}`}>
                <title>{`${d.label}: ${d.score ?? 0}/100${d.tier ? ` — ${d.tier}` : ' — no evidence yet'}`}</title>
              </circle>
            </g>
          )
        })}
        {showLabels &&
          dimensions.map((d, i) => {
            const [x, y] = pointAt(i, 1.22)
            const Icon = d.icon
            return (
              <foreignObject key={d.id} x={x - 34} y={y - 17} width={68} height={36} className="pointer-events-none">
                <div className="flex flex-col items-center gap-0.5">
                  <Icon size={13} strokeWidth={2} className="text-neutral-400" />
                  <span className="text-[10.5px] font-medium text-neutral-500 dark:text-neutral-400 text-center leading-tight">
                    {d.shortLabel}
                  </span>
                </div>
              </foreignObject>
            )
          })}
      </svg>
    </div>
  )
}
