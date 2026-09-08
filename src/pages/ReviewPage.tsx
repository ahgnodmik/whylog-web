import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { S, formatDate, outcomeLabel, sameAgainLabel } from '../i18n'
import { getDecision, upsertDecision } from '../store'
import {
  OUTCOME_STATUSES,
  SAME_AGAIN_VALUES,
  type OutcomeStatus,
  type SameDecisionAgain,
} from '../types'

export default function ReviewPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const d = id ? getDecision(id) : undefined

  const [status, setStatus] = useState<OutcomeStatus | null>(
    d?.outcome?.status ?? null,
  )
  const [actualResult, setActualResult] = useState(d?.outcome?.actualResult ?? '')
  const [again, setAgain] = useState<SameDecisionAgain | null>(
    d?.outcome?.wouldDecideAgain ?? null,
  )
  const [reflection, setReflection] = useState(d?.outcome?.reflection ?? '')

  if (!d) {
    return <div className="empty-state">Not found</div>
  }

  function submit() {
    if (!d || !status) return
    upsertDecision({
      ...d,
      status: 'reviewed',
      updatedAt: new Date().toISOString(),
      outcome: {
        status,
        actualResult: actualResult.trim() || undefined,
        wouldDecideAgain: again ?? undefined,
        reflection: reflection.trim() || undefined,
        reviewedAt: d.outcome?.reviewedAt ?? new Date().toISOString(),
      },
    })
    navigate(`/decision/${d.id}`, { replace: true })
  }

  return (
    <>
      <h1 className="page-title">{S.reviewTitle}</h1>

      <div className="card" style={{ marginBottom: 24 }}>
        <div className="detail-section">
          <h4>{S.atTheTime}</h4>
          <p style={{ fontWeight: 600 }}>{d.title}</p>
        </div>
        <div className="detail-section">
          <h4>{S.qReason}</h4>
          <p>{d.reason}</p>
        </div>
        {d.expectation && (
          <div className="detail-section">
            <h4>{S.expectationLabel}</h4>
            <p>{d.expectation}</p>
          </div>
        )}
        <div className="detail-section" style={{ marginBottom: 0 }}>
          <h4>{S.confidenceLabel}</h4>
          <p>
            {d.confidence}% · {formatDate(d.createdAt)}
          </p>
        </div>
      </div>

      <div className="field">
        <label>{S.qOutcome}</label>
        <div className="chips">
          {OUTCOME_STATUSES.map((s) => (
            <button
              key={s}
              className={`chip ${status === s ? 'selected' : ''}`}
              onClick={() => setStatus(s)}
            >
              {outcomeLabel(s)}
            </button>
          ))}
        </div>
      </div>

      <div className="field">
        <label>{S.qActualResult}</label>
        <textarea
          value={actualResult}
          maxLength={2000}
          onChange={(e) => setActualResult(e.target.value)}
        />
      </div>

      <div className="field">
        <label>{S.qAgain}</label>
        <div className="chips">
          {SAME_AGAIN_VALUES.map((v) => (
            <button
              key={v}
              className={`chip ${again === v ? 'selected' : ''}`}
              onClick={() => setAgain(v)}
            >
              {sameAgainLabel(v)}
            </button>
          ))}
        </div>
      </div>

      <div className="field">
        <label>{S.qReflection}</label>
        <textarea
          value={reflection}
          maxLength={2000}
          onChange={(e) => setReflection(e.target.value)}
        />
      </div>

      <button
        className="btn btn-primary btn-block"
        disabled={!status}
        style={{ opacity: status ? 1 : 0.5 }}
        onClick={submit}
      >
        {S.saveReview}
      </button>
    </>
  )
}
