import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { S, categoryLabel, formatDate } from '../i18n'
import { useDecisions } from '../store'
import { isReviewDue } from '../types'

type Filter = 'all' | 'active' | 'due' | 'reviewed'

const FILTERS: { key: Filter; label: string }[] = [
  { key: 'all', label: S.filterAll },
  { key: 'active', label: S.filterActive },
  { key: 'due', label: S.filterDue },
  { key: 'reviewed', label: S.filterReviewed },
]

export default function ListPage() {
  const decisions = useDecisions()
  const navigate = useNavigate()
  const [filter, setFilter] = useState<Filter>('all')
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return decisions
      .filter((d) => {
        if (filter === 'active') return d.status === 'active'
        if (filter === 'due') return isReviewDue(d)
        if (filter === 'reviewed') return d.status === 'reviewed'
        return true
      })
      .filter(
        (d) =>
          !q ||
          d.title.toLowerCase().includes(q) ||
          d.reason.toLowerCase().includes(q),
      )
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  }, [decisions, filter, query])

  const dueCount = decisions.filter(isReviewDue).length

  return (
    <>
      <h1 className="page-title">{S.homePrompt}</h1>

      {dueCount > 0 && filter !== 'due' && (
        <button className="notice" style={{ border: 'none', width: '100%', textAlign: 'left' }} onClick={() => setFilter('due')}>
          {S.dueBadge} · {dueCount}
        </button>
      )}

      <Link to="/new" className="btn btn-primary desktop-new">
        + {S.newDecision}
      </Link>

      <input
        className="search-input"
        type="search"
        placeholder={S.searchHint}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />

      <div className="filters">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            className={`chip ${filter === f.key ? 'selected' : ''}`}
            onClick={() => setFilter(f.key)}
          >
            {f.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">{S.emptyList}</div>
      ) : (
        filtered.map((d) => (
          <Link key={d.id} to={`/decision/${d.id}`} className="card decision-item">
            <h3>{d.title}</h3>
            <div className="meta">
              <span className="badge badge-category">{categoryLabel(d.category)}</span>
              {isReviewDue(d) && <span className="badge badge-due">{S.dueBadge}</span>}
              {d.status === 'reviewed' && (
                <span className="badge badge-reviewed">{S.reviewedBadge}</span>
              )}
              <span>{formatDate(d.createdAt)}</span>
              <span>
                {S.confidenceLabel} {d.confidence}%
              </span>
            </div>
          </Link>
        ))
      )}

      <button className="fab" aria-label={S.newDecision} onClick={() => navigate('/new')}>
        +
      </button>
    </>
  )
}
