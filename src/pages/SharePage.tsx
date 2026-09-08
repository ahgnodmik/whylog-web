import { useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  S,
  categoryLabel,
  formatDate,
  outcomeLabel,
  reasonTypeLabel,
} from '../i18n'
import { decodeShare } from '../share'
import { getDecision, upsertDecision } from '../store'
import { useToast } from '../toast'

export default function SharePage() {
  const { data } = useParams()
  const navigate = useNavigate()
  const toast = useToast()
  const d = useMemo(() => (data ? decodeShare(data) : null), [data])

  if (!d) {
    return <div className="empty-state">{S.sharedInvalid}</div>
  }

  function importShared() {
    if (!d) return
    // Re-key if this id already exists locally so import never overwrites.
    const decision = getDecision(d.id) ? { ...d, id: crypto.randomUUID() } : d
    upsertDecision(decision)
    toast(S.sharedImported)
    navigate(`/decision/${decision.id}`, { replace: true })
  }

  return (
    <>
      <h1 className="page-title">
        {S.sharedTitle}: {d.title}
      </h1>

      <div className="card" style={{ marginBottom: 16 }}>
        <div className="detail-section">
          <h4>{S.qReason}</h4>
          <p>{d.reason}</p>
        </div>
        {d.reasonTypes.length > 0 && (
          <div className="detail-section">
            <h4>{S.reasonTagsLabel}</h4>
            <div className="chips">
              {d.reasonTypes.map((t) => (
                <span key={t} className="chip">
                  {reasonTypeLabel(t)}
                </span>
              ))}
            </div>
          </div>
        )}
        <div className="detail-section">
          <h4>{S.confidenceLabel}</h4>
          <p>{d.confidence}%</p>
        </div>
        {d.expectation && (
          <div className="detail-section">
            <h4>{S.expectationLabel}</h4>
            <p>{d.expectation}</p>
          </div>
        )}
        {d.outcome && (
          <div className="detail-section">
            <h4>{S.qOutcome}</h4>
            <p>{outcomeLabel(d.outcome.status)}</p>
          </div>
        )}
        <div className="detail-section" style={{ marginBottom: 0 }}>
          <h4>{S.createdOn}</h4>
          <p>
            {formatDate(d.createdAt)} · {categoryLabel(d.category)}
          </p>
        </div>
      </div>

      <button className="btn btn-primary btn-block" onClick={importShared}>
        {S.sharedImport}
      </button>
    </>
  )
}
