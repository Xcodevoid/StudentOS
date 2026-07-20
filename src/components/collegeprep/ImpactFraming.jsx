import { Field, Textarea } from '../ui/Form'

// Shared Problem/Action/Impact/Growth framing, reused on both the Activity
// (College Prep) and Project (Portfolio) forms. Entirely optional — it
// exists to turn "volunteered at animal shelter" into "designed an adoption
// campaign that got 40+ animals homed," not to gate saving an entry.
export function ImpactFraming({ value, onChange }) {
  function set(field, fieldValue) {
    onChange({ ...value, [field]: fieldValue })
  }

  return (
    <div>
      <p className="text-[13px] font-medium text-neutral-600 dark:text-neutral-300">Impact framing</p>
      <p className="text-[12px] text-neutral-400 mb-2">Optional — turns "I did X" into "I changed Y."</p>
      <div className="grid sm:grid-cols-2 gap-3">
        <Field label="Problem" hint="What problem existed?">
          <Textarea
            rows={2}
            value={value.problem}
            onChange={(e) => set('problem', e.target.value)}
            placeholder="e.g. Shelter animals were being overlooked for adoption"
          />
        </Field>
        <Field label="Action" hint="What did you do?">
          <Textarea
            rows={2}
            value={value.action}
            onChange={(e) => set('action', e.target.value)}
            placeholder="e.g. Designed and ran a social media adoption campaign"
          />
        </Field>
        <Field label="Impact" hint="Who benefited?">
          <Textarea
            rows={2}
            value={value.impactWho}
            onChange={(e) => set('impactWho', e.target.value)}
            placeholder="e.g. 40+ animals adopted within 3 months"
          />
        </Field>
        <Field label="Growth" hint="What did you learn?">
          <Textarea
            rows={2}
            value={value.growth}
            onChange={(e) => set('growth', e.target.value)}
            placeholder="e.g. Learned to translate data into a compelling story"
          />
        </Field>
      </div>
    </div>
  )
}
