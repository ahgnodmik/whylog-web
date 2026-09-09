import { useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { S, categoryLabel, outcomeLabel, reasonTypeLabel, sameAgainLabel } from '../i18n'
import { projectNames, useDecisions } from '../store'
import type { Decision } from '../types'

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString(S.isKo ? 'ko-KR' : 'en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function Entry({ d }: { d: Decision }) {
  return (
    <div className="print-entry">
      <div className="print-date">{formatDateTime(d.createdAt)}</div>
      <div className="print-title">{d.title}</div>
      <div className="print-meta">
        {d.project && `# ${d.project} · `}
        {categoryLabel(d.category)} · {S.confidenceLabel} {d.confidence}%
        {d.reasonTypes.length > 0 && ` · ${d.reasonTypes.map(reasonTypeLabel).join(', ')}`}
      </div>
      <div className="print-body">
        <p>
          <strong>{S.qReason}</strong> {d.reason}
        </p>
        {d.expectation && (
          <p>
            <strong>{S.expectationLabel}</strong> {d.expectation}
          </p>
        )}
        {d.alternatives.length > 0 && (
          <p>
            <strong>{S.alternativesLabel}</strong> {d.alternatives.join(' / ')}
          </p>
        )}
        {d.context && (
          <p>
            <strong>{S.contextLabel}</strong> {d.context}
          </p>
        )}
        {d.outcome && (
          <div className="print-outcome">
            <p>
              <strong>{S.qOutcome}</strong> {outcomeLabel(d.outcome.status)}
              {d.outcome.wouldDecideAgain &&
                ` · ${S.qAgain} ${sameAgainLabel(d.outcome.wouldDecideAgain)}`}
            </p>
            {d.outcome.actualResult && (
              <p>
                <strong>{S.qActualResult}</strong> {d.outcome.actualResult}
              </p>
            )}
            {d.outcome.reflection && (
              <p>
                <strong>{S.qReflection}</strong> {d.outcome.reflection}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default function PrintPage() {
  const decisions = useDecisions()
  const projects = projectNames(decisions)
  const [params, setParams] = useSearchParams()
  const project = params.get('project') ?? 'all'
  const setProject = (p: string | 'all') =>
    setParams(p === 'all' ? {} : { project: p }, { replace: true })

  const sorted = useMemo(
    () =>
      [...decisions]
        .filter((d) => project === 'all' || d.project === project)
        .sort((a, b) => a.createdAt.localeCompare(b.createdAt)),
    [decisions, project],
  )

  return (
    <div className="print-page">
      <div className="print-controls no-print">
        <div className="notice">{S.printHint}</div>
        {projects.length > 0 && (
          <div className="filters">
            <button
              className={`chip ${project === 'all' ? 'selected' : ''}`}
              onClick={() => setProject('all')}
            >
              {S.allProjects}
            </button>
            {projects.map((p) => (
              <button
                key={p}
                className={`chip ${project === p ? 'selected' : ''}`}
                onClick={() => setProject(p)}
              >
                # {p}
              </button>
            ))}
          </div>
        )}
        <button className="btn btn-primary" onClick={() => window.print()}>
          {S.print}
        </button>
      </div>

      <h1 className="print-doc-title">
        WhyLog{project !== 'all' && ` — ${project}`}
      </h1>
      <div className="print-doc-sub">
        {S.totalDecisions}: {sorted.length} · {formatDateTime(new Date().toISOString())}
      </div>

      {sorted.map((d) => (
        <Entry key={d.id} d={d} />
      ))}
    </div>
  )
}
