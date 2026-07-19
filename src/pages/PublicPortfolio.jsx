import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ExternalLink, GalleryVerticalEnd, Code2, Award, Trophy, FlaskConical, Globe as GlobeIcon, Folder } from 'lucide-react'
import { fetchPublicPortfolio } from '../lib/publicPortfolio'
import { isCloudConfigured } from '../lib/supabaseClient'
import { formatDate } from '../lib/dates'

const TYPES = {
  project: { label: 'Project', icon: Code2 },
  achievement: { label: 'Achievement', icon: Award },
  competition: { label: 'Competition', icon: Trophy },
  research: { label: 'Research', icon: FlaskConical },
  website: { label: 'Website', icon: GlobeIcon },
}

export default function PublicPortfolio() {
  const { slug } = useParams()
  const [state, setState] = useState({ status: 'loading', data: null })

  useEffect(() => {
    let cancelled = false
    if (!isCloudConfigured) {
      setState({ status: 'unavailable', data: null })
      return
    }
    fetchPublicPortfolio(slug)
      .then((result) => !cancelled && setState({ status: result ? 'found' : 'not-found', data: result }))
      .catch(() => !cancelled && setState({ status: 'error', data: null }))
    return () => {
      cancelled = true
    }
  }, [slug])

  return (
    <div className="min-h-screen bg-canvas dark:bg-[#0b0b0f] flex flex-col">
      <header className="flex items-center gap-2 px-6 h-16">
        <div className="w-7 h-7 rounded-lg bg-accent-500 flex items-center justify-center">
          <GalleryVerticalEnd size={15} className="text-white" strokeWidth={2.5} />
        </div>
        <span className="font-semibold text-[15px] tracking-tight text-neutral-900 dark:text-white">StudentOS</span>
      </header>

      <main className="flex-1 max-w-2xl w-full mx-auto px-4 sm:px-6 pb-16">
        {state.status === 'loading' && <p className="text-center text-[13.5px] text-neutral-400 mt-16">Loading…</p>}

        {(state.status === 'not-found' || state.status === 'unavailable' || state.status === 'error') && (
          <div className="text-center mt-24">
            <Folder size={32} className="text-neutral-300 mx-auto mb-3" strokeWidth={1.5} />
            <p className="text-[15px] font-medium text-neutral-700 dark:text-neutral-200">
              {state.status === 'unavailable' ? 'Public portfolios aren’t available here' : 'This portfolio isn’t public'}
            </p>
            <p className="text-[13.5px] text-neutral-400 mt-1">It may have been unpublished, or the link is mistyped.</p>
          </div>
        )}

        {state.status === 'found' && <PortfolioContent profile={state.data.profile} projects={state.data.projects} />}
      </main>

      <footer className="py-6 text-center no-print">
        <Link to="/" className="text-[12.5px] text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300">
          Built with StudentOS
        </Link>
      </footer>
    </div>
  )
}

function PortfolioContent({ profile, projects }) {
  return (
    <div className="rounded-2xl bg-white dark:bg-white/5 border border-black/5 dark:border-white/10 shadow-[var(--shadow-card)] p-6 sm:p-10 mt-6">
      <div className="text-center border-b border-black/5 dark:border-white/10 pb-6 mb-6">
        <h1 className="text-[28px] font-semibold tracking-tight text-neutral-900 dark:text-white">{profile.name || 'Student'}</h1>
        <p className="text-[13.5px] text-neutral-400 mt-1">{[profile.gradeLevel, profile.school].filter(Boolean).join(' · ')}</p>
        {profile.bio && <p className="text-[14px] text-neutral-600 dark:text-neutral-300 mt-3 max-w-xl mx-auto leading-relaxed">{profile.bio}</p>}
      </div>

      {projects.length === 0 ? (
        <p className="text-center text-[13.5px] text-neutral-400 py-6">No portfolio entries yet.</p>
      ) : (
        <div className="space-y-5">
          {projects.map((p, i) => {
            const T = TYPES[p.type] || TYPES.project
            return (
              <div key={i} className="flex gap-4">
                <div className="w-10 h-10 rounded-xl bg-black/[0.04] dark:bg-white/10 flex items-center justify-center flex-shrink-0">
                  <T.icon size={17} className="text-neutral-500" />
                </div>
                <div className="min-w-0 flex-1 text-left">
                  <div className="flex items-center justify-between gap-3 flex-wrap">
                    <h3 className="text-[15px] font-semibold text-neutral-900 dark:text-white">{p.title}</h3>
                    <span className="text-[12px] text-neutral-400 flex-shrink-0">{p.date ? formatDate(p.date) : ''}</span>
                  </div>
                  <p className="text-[12.5px] text-neutral-400 mt-0.5">{[T.label, p.role].filter(Boolean).join(' · ')}</p>
                  {p.description && <p className="text-[13.5px] text-neutral-600 dark:text-neutral-300 mt-1.5 leading-relaxed">{p.description}</p>}
                  <div className="flex items-center gap-1.5 flex-wrap mt-2">
                    {(p.tags || []).map((tag) => (
                      <span key={tag} className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-black/[0.05] text-neutral-600 dark:bg-white/10 dark:text-neutral-300">
                        {tag}
                      </span>
                    ))}
                    {p.link && (
                      <a href={p.link} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-[12px] text-accent-600 dark:text-accent-400 hover:underline">
                        <ExternalLink size={11} /> View
                      </a>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
