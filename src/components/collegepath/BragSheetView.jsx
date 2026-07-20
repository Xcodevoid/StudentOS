import { useMemo, useState } from 'react'
import { Copy, Printer, FileHeart } from 'lucide-react'
import { useStore } from '../../context/StoreContext'
import { useToast } from '../../context/ToastContext'
import { Card, CardHeader } from '../ui/Card'
import { Button } from '../ui/Button'
import { Select } from '../ui/Form'
import { Badge, EmptyState } from '../ui/Misc'
import { formatDate } from '../../lib/dates'
import { WEIGHT_LABELS } from '../../lib/gpa'
import { buildBragSheet, formatBragSheetText } from '../../lib/bragSheet'

export default function BragSheetView() {
  const { data } = useStore()
  const { push } = useToast()
  const [recommenderId, setRecommenderId] = useState('')

  const sheet = useMemo(() => buildBragSheet(data, { recommenderId: recommenderId || null }), [data, recommenderId])
  const isEmpty = sheet.classes.length === 0 && sheet.highlights.length === 0 && sheet.awards.length === 0 && !sheet.identity

  function copyAll() {
    navigator.clipboard.writeText(formatBragSheetText(sheet))
    push('Copied brag sheet', { description: 'Paste it into an email to your recommender.' })
  }

  return (
    <div className="space-y-4">
      <Card className="p-5 no-print">
        <CardHeader
          title="Brag Sheet"
          subtitle="Auto-built from your Portfolio, Evidence, and North Star — nothing new to write."
          action={
            <div className="flex items-center gap-2">
              <Button size="sm" variant="secondary" icon={Printer} onClick={() => window.print()}>Print</Button>
              <Button size="sm" icon={Copy} onClick={copyAll}>Copy</Button>
            </div>
          }
        />
        {data.recommenders.length > 0 && (
          <div className="mt-4 max-w-sm">
            <Select value={recommenderId} onChange={(e) => setRecommenderId(e.target.value)}>
              <option value="">General — not personalized</option>
              {data.recommenders.map((r) => (
                <option key={r.id} value={r.id}>Personalize for {r.name}</option>
              ))}
            </Select>
          </div>
        )}
      </Card>

      {isEmpty ? (
        <Card className="p-5">
          <EmptyState
            icon={FileHeart}
            title="Nothing to show yet"
            description="Add a few projects or activities in Portfolio, or set your Future Identity in Growth Journey, and your brag sheet builds itself."
          />
        </Card>
      ) : (
        <Card className="p-6 sm:p-8 print:shadow-none print:border-0">
          <div className="flex items-start justify-between gap-3 flex-wrap pb-5 border-b border-black/5 dark:border-white/10">
            <div>
              <h2 className="text-[20px] font-semibold tracking-tight text-neutral-900 dark:text-white">{sheet.profile.name || 'Student'}</h2>
              <p className="text-[13.5px] text-neutral-500 dark:text-neutral-400 mt-0.5">
                {[sheet.profile.gradeLevel, sheet.profile.school].filter(Boolean).join(' · ')}
              </p>
              {sheet.profile.intendedMajor && (
                <p className="text-[13px] text-neutral-500 dark:text-neutral-400 mt-0.5">Intended major: {sheet.profile.intendedMajor}</p>
              )}
            </div>
            {sheet.gpa.weighted !== null && (
              <div className="text-right flex-shrink-0">
                <p className="text-[22px] font-semibold text-neutral-900 dark:text-white leading-none">{sheet.gpa.weighted}</p>
                <p className="text-[11.5px] text-neutral-400 mt-1">weighted GPA</p>
              </div>
            )}
          </div>

          {sheet.recommender && (
            <div className="mt-5 p-4 rounded-xl bg-accent-50 dark:bg-accent-500/10">
              <p className="text-[12px] font-semibold text-accent-700 dark:text-accent-400 uppercase tracking-wide">
                Prepared for {sheet.recommender.name}{sheet.recommender.subject ? ` — ${sheet.recommender.subject}` : ''}
              </p>
              {sheet.recommender.notes && (
                <p className="text-[13.5px] text-neutral-700 dark:text-neutral-200 mt-1.5">{sheet.recommender.notes}</p>
              )}
            </div>
          )}

          {sheet.identity && (
            <Section title="Who I Am">
              <p className="text-[14px] text-neutral-700 dark:text-neutral-200 leading-relaxed italic">"{sheet.identity}"</p>
            </Section>
          )}

          {sheet.classes.length > 0 && (
            <Section title="Notable Coursework">
              <div className="flex flex-wrap gap-2">
                {sheet.classes.map((c) => (
                  <Badge key={c.id} tone="neutral">
                    {c.name}{c.weight && c.weight !== 'regular' ? ` · ${WEIGHT_LABELS[c.weight] || c.weight}` : ''}{c.grade ? ` · ${c.grade}` : ''}
                  </Badge>
                ))}
              </div>
            </Section>
          )}

          {sheet.highlights.length > 0 && (
            <Section title="Key Projects & Activities">
              <div className="space-y-4">
                {sheet.highlights.map((h) => (
                  <div key={h.id}>
                    <p className="text-[14px] font-medium text-neutral-900 dark:text-white">
                      {h.title}{h.role ? ` — ${h.role}` : ''}
                    </p>
                    <div className="mt-1 space-y-0.5">
                      {h.problem && <p className="text-[13px] text-neutral-500 dark:text-neutral-400"><span className="text-neutral-400 dark:text-neutral-500">Challenge:</span> {h.problem}</p>}
                      {h.action && <p className="text-[13px] text-neutral-500 dark:text-neutral-400"><span className="text-neutral-400 dark:text-neutral-500">Action:</span> {h.action}</p>}
                      {h.impactWho && <p className="text-[13px] text-neutral-500 dark:text-neutral-400"><span className="text-neutral-400 dark:text-neutral-500">Impact:</span> {h.impactWho}</p>}
                      {!h.problem && !h.action && !h.impactWho && h.description && (
                        <p className="text-[13px] text-neutral-500 dark:text-neutral-400">{h.description}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Section>
          )}

          {sheet.awards.length > 0 && (
            <Section title="Awards & Recognition">
              <div className="space-y-1.5">
                {sheet.awards.map((a) => (
                  <div key={a.id} className="flex items-center justify-between gap-2">
                    <p className="text-[13.5px] text-neutral-800 dark:text-neutral-100">{a.title}</p>
                    {a.date && <span className="text-[12px] text-neutral-400 flex-shrink-0">{formatDate(a.date)}</span>}
                  </div>
                ))}
              </div>
            </Section>
          )}

          {sheet.applyingTo.length > 0 && (
            <Section title="Applying To">
              <div className="flex flex-wrap gap-2">
                {sheet.applyingTo.map((o) => (
                  <Badge key={o.id} tone="accent">
                    {o.schoolName || o.title}{o.date ? ` · ${formatDate(o.date)}` : ''}
                  </Badge>
                ))}
              </div>
            </Section>
          )}
        </Card>
      )}
    </div>
  )
}

function Section({ title, children }) {
  return (
    <div className="mt-5 pt-5 border-t border-black/5 dark:border-white/10">
      <p className="text-[11.5px] font-semibold uppercase tracking-wide text-neutral-400 mb-2.5">{title}</p>
      {children}
    </div>
  )
}
