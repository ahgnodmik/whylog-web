import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  S,
  categoryLabel,
  formatDate,
  outcomeLabel,
  reasonTypeLabel,
  sameAgainLabel,
} from '../i18n'
import { shareUrl } from '../share'
import { deleteDecision, useDecisions } from '../store'
import { isReviewDue } from '../types'
import { useToast } from '../toast'

export default function DetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const toast = useToast()
  const decisions = useDecisions()
  const d = decisions.find((x) => x.id === id)

  if (!d) {
    return <div className="empty-state">Not found</div>
  }

  async function copyShare() {
    if (!d) return
    await navigator.clipboard.writeText(shareUrl(d))
    toast(S.shareCopied)
  }

  function remove() {
    if (!d) return
    if (!window.confirm(S.deleteConfirm)) return
    deleteDecision(d.id)
    navigate('/', { replace: true })
  }

  return (
    <>
      <h1 className="page-title">{d.title}</h1>

      <div className="meta" style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 24 }}>
        {d.project && (
          <Link to={`/?project=${encodeURIComponent(d.project)}`} className="badge badge-project">
            # {d.project}
          </Link>
        )}
        <span className="badge badge-category">{categoryLabel(d.category)}</span>
        {isReviewDue(d) && <span className="badge badge-due">{S.dueBadge}</span>}
        {d.status === 'reviewed' && (
          <span className="badge badge-reviewed">{S.reviewedBadge}</span>
        )}
      </div>

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
        {d.alternatives.length > 0 && (
          <div className="detail-section">
            <h4>{S.alternativesLabel}</h4>
            <p>{d.alternatives.map((a) => `· ${a}`).join('\n')}</p>
          </div>
        )}
        {d.context && (
          <div className="detail-section">
            <h4>{S.contextLabel}</h4>
            <p>{d.context}</p>
          </div>
        )}
        {(d.relatedIds?.length ?? 0) > 0 && (
          <div className="detail-section">
            <h4>{S.relatedLabel}</h4>
            <div className="chips">
              {d.relatedIds!.map((rid) => {
                const rel = decisions.find((x) => x.id === rid)
                return rel ? (
                  <Link key={rid} to={`/decision/${rid}`} className="chip">
                    {rel.title}
                  </Link>
                ) : null
              })}
            </div>
          </div>
        )}
        <div className="detail-section" style={{ marginBottom: 0 }}>
          <h4>{S.createdOn}</h4>
          <p>
            {formatDate(d.createdAt)}
            {d.reviewDate && ` · ${S.reviewOn}: ${formatDate(d.reviewDate)}`}
          </p>
        </div>
      </div>

      {d.outcome && (
        <div className="card" style={{ marginBottom: 16 }}>
          <div className="detail-section">
            <h4>{S.qOutcome}</h4>
            <p>{outcomeLabel(d.outcome.status)}</p>
          </div>
          {d.outcome.actualResult && (
            <div className="detail-section">
              <h4>{S.qActualResult}</h4>
              <p>{d.outcome.actualResult}</p>
            </div>
          )}
          {d.outcome.wouldDecideAgain && (
            <div className="detail-section">
              <h4>{S.qAgain}</h4>
              <p>{sameAgainLabel(d.outcome.wouldDecideAgain)}</p>
            </div>
          )}
          {d.outcome.reflection && (
            <div className="detail-section">
              <h4>{S.qReflection}</h4>
              <p>{d.outcome.reflection}</p>
            </div>
          )}
          <div className="detail-section" style={{ marginBottom: 0 }}>
            <h4>{S.reviewedBadge}</h4>
            <p>{formatDate(d.outcome.reviewedAt)}</p>
          </div>
        </div>
      )}

      <div className="detail-actions">
        {d.status === 'active' && (
          <Link to={`/decision/${d.id}/review`} className="btn btn-primary">
            {S.startReview}
          </Link>
        )}
        <Link to={`/decision/${d.id}/edit`} className="btn">
          {S.edit}
        </Link>
        <button className="btn" onClick={copyShare}>
          {S.share}
        </button>
        <button className="btn btn-danger" onClick={remove}>
          {S.delete}
        </button>
      </div>
    </>
  )
}
