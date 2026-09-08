import { S, reasonTypeLabel } from '../i18n'
import { useDecisions } from '../store'
import { MIN_REVIEWS_FOR_INSIGHTS, isReviewDue, type ReasonType } from '../types'

export default function InsightsPage() {
  const decisions = useDecisions()

  const reviewed = decisions.filter(
    (d) => d.outcome && d.outcome.status !== 'undecidable',
  )
  const dueCount = decisions.filter(isReviewDue).length
  const avgConfidence =
    decisions.length === 0
      ? 0
      : Math.round(decisions.reduce((sum, d) => sum + d.confidence, 0) / decisions.length)

  const reasonStats = new Map<ReasonType, { total: number; positive: number }>()
  for (const d of reviewed) {
    const positive = d.outcome!.status === 'betterThanExpected'
    for (const t of d.reasonTypes) {
      const prev = reasonStats.get(t) ?? { total: 0, positive: 0 }
      reasonStats.set(t, {
        total: prev.total + 1,
        positive: prev.positive + (positive ? 1 : 0),
      })
    }
  }

  const highConfidence = reviewed.filter((d) => d.confidence >= 80)
  const highConfidenceGood = highConfidence.filter(
    (d) => d.outcome!.status !== 'worseThanExpected',
  ).length

  const locked = reviewed.length < MIN_REVIEWS_FOR_INSIGHTS

  return (
    <>
      <h1 className="page-title">{S.insights}</h1>

      <div className="stat-grid">
        <div className="card stat-card">
          <div className="value">{decisions.length}</div>
          <div className="label">{S.totalDecisions}</div>
        </div>
        <div className="card stat-card">
          <div className="value">{reviewed.length}</div>
          <div className="label">{S.reviewedCount}</div>
        </div>
        <div className="card stat-card">
          <div className="value">{dueCount}</div>
          <div className="label">{S.dueCount}</div>
        </div>
        <div className="card stat-card">
          <div className="value">{avgConfidence}%</div>
          <div className="label">{S.avgConfidence}</div>
        </div>
      </div>

      {locked ? (
        <div className="notice">
          {S.insightsLocked(MIN_REVIEWS_FOR_INSIGHTS - reviewed.length)}
        </div>
      ) : (
        <>
          {reasonStats.size > 0 && (
            <div className="card" style={{ marginBottom: 16 }}>
              <h4 style={{ marginTop: 0 }}>{S.reasonStatsTitle}</h4>
              {[...reasonStats.entries()]
                .sort((a, b) => b[1].total - a[1].total)
                .map(([type, stat]) => {
                  const rate = Math.round((stat.positive / stat.total) * 100)
                  return (
                    <div key={type} className="bar-row">
                      <span>{reasonTypeLabel(type)}</span>
                      <div className="bar-track">
                        <div className="bar-fill" style={{ width: `${rate}%` }} />
                      </div>
                      <span>
                        {rate}% ({stat.total})
                      </span>
                    </div>
                  )
                })}
            </div>
          )}

          {highConfidence.length > 0 && (
            <div className="card">
              <h4 style={{ marginTop: 0 }}>{S.highConfidenceTitle}</h4>
              <p>
                {highConfidenceGood}/{highConfidence.length} {S.betterOrAsExpected}
              </p>
            </div>
          )}
        </>
      )}
    </>
  )
}
