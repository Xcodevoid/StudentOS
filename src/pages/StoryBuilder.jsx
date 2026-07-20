import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { BookOpen, Copy, FolderOpen } from 'lucide-react'
import { useStore } from '../context/StoreContext'
import { useToast } from '../context/ToastContext'
import { Card, CardHeader } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Badge, EmptyState } from '../components/ui/Misc'
import { formatDate } from '../lib/dates'
import { buildStoryChapters, countUnframed, storyStats, formatChapterText, formatFullStory } from '../lib/storyBuilder'

export default function StoryBuilder() {
  const { data } = useStore()
  const { push } = useToast()

  const chapters = useMemo(() => buildStoryChapters(data), [data])
  const stats = useMemo(() => storyStats(chapters), [chapters])
  const unframedCount = useMemo(() => countUnframed(data), [data])

  function copyAll() {
    navigator.clipboard.writeText(formatFullStory(chapters, data.northStar.identity))
    push('Copied your story', { description: 'Paste it into an essay draft or interview prep doc.' })
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[24px] sm:text-[26px] font-semibold tracking-tight text-neutral-900 dark:text-white">Your Story</h1>
        <p className="text-[14px] text-neutral-500 dark:text-neutral-400 mt-1 max-w-2xl">
          Beginning, challenge, action, impact, growth — organized from the projects and activities you've already framed, in order.
        </p>
      </div>

      <Card className="p-5">
        <CardHeader
          title="Your story so far"
          subtitle={data.northStar.identity || 'Set a Future Identity in North Star to anchor this.'}
          action={
            chapters.length > 0 && (
              <Button size="sm" variant="secondary" icon={Copy} onClick={copyAll}>
                Copy full story
              </Button>
            )
          }
        />
        {stats && (
          <div className="flex items-center gap-4 flex-wrap mt-4 text-[13px] text-neutral-500 dark:text-neutral-400">
            <span>{stats.count} chapter{stats.count === 1 ? '' : 's'} framed</span>
            {stats.span && <span>· {stats.span}</span>}
            {stats.topDimension && <span>· Mostly about {stats.topDimension}</span>}
          </div>
        )}
      </Card>

      {chapters.length === 0 ? (
        <Card className="p-5">
          <EmptyState
            icon={BookOpen}
            title="No chapters framed yet"
            description="Add Problem / Action / Impact / Growth to a project or activity — in Portfolio or College Prep — and it shows up here as a chapter of your story."
          />
        </Card>
      ) : (
        <div className="space-y-4">
          {chapters.map((chapter, i) => (
            <ChapterCard key={`${chapter.kind}-${chapter.id}`} chapter={chapter} index={i + 1} />
          ))}
        </div>
      )}

      {unframedCount > 0 && (
        <Card className="p-5 flex items-center justify-between gap-3 flex-wrap">
          <p className="text-[13.5px] text-neutral-500 dark:text-neutral-400">
            {unframedCount} more {unframedCount === 1 ? 'entry has' : 'entries have'} no impact framing yet — frame it to add a chapter.
          </p>
          <div className="flex gap-2">
            <Button as={Link} to="/portfolio" size="sm" variant="secondary">Portfolio</Button>
            <Button as={Link} to="/college-prep" size="sm" variant="secondary">College Prep</Button>
          </div>
        </Card>
      )}
    </div>
  )
}

function ChapterCard({ chapter, index }) {
  const { push } = useToast()

  function copyChapter() {
    navigator.clipboard.writeText(formatChapterText(chapter))
    push('Chapter copied')
  }

  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          <Badge>Ch. {index}</Badge>
          <p className="text-[15px] font-semibold text-neutral-900 dark:text-white">{chapter.title}</p>
          <Badge tone="neutral">{chapter.source}</Badge>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {chapter.evidenceCount > 0 && (
            <Link to="/evidence" className="inline-flex items-center gap-1 text-[12px] text-neutral-400 hover:text-accent-600 dark:hover:text-accent-400">
              <FolderOpen size={12} /> {chapter.evidenceCount} evidence
            </Link>
          )}
          <Button size="sm" variant="ghost" icon={Copy} onClick={copyChapter}>Copy</Button>
        </div>
      </div>

      <p className="text-[13.5px] text-neutral-500 dark:text-neutral-400 mt-2 leading-relaxed">
        <span className="font-medium text-neutral-600 dark:text-neutral-300">Beginning — </span>
        {chapter.beginning}
      </p>

      <div className="mt-3 space-y-2">
        {chapter.problem && <StoryLine label="Challenge" text={chapter.problem} />}
        {chapter.action && <StoryLine label="Action" text={chapter.action} />}
        {chapter.impactWho && <StoryLine label="Impact" text={chapter.impactWho} />}
        {chapter.growth && <StoryLine label="Growth" text={chapter.growth} />}
      </div>

      {chapter.date && <p className="text-[12px] text-neutral-400 mt-3">{formatDate(chapter.date)}</p>}
    </Card>
  )
}

function StoryLine({ label, text }) {
  return (
    <p className="text-[13.5px] text-neutral-700 dark:text-neutral-200 leading-relaxed">
      <span className="font-medium text-neutral-500 dark:text-neutral-400">{label} — </span>
      {text}
    </p>
  )
}
