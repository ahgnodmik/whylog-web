import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  S,
  categoryLabel,
  presetLabel,
  reasonTypeLabel,
  templateContextHint,
  templateExpectationHint,
  templateLabel,
  templateReasonHint,
  templateTitleHint,
} from '../i18n'
import { getDecision, projectNames, upsertDecision, useDecisions } from '../store'
import {
  CATEGORIES,
  REASON_TYPES,
  REVIEW_PRESETS,
  TEMPLATES,
  TEMPLATE_CATEGORY,
  type Decision,
  type DecisionCategory,
  type DecisionTemplate,
  type ReasonType,
} from '../types'

function toDateInput(iso: string | undefined): string {
  if (!iso) return ''
  return iso.slice(0, 10)
}

function daysFromNow(days: number): string {
  const d = new Date()
  d.setDate(d.getDate() + days)
  d.setHours(0, 0, 0, 0)
  return d.toISOString().slice(0, 10)
}

export default function EditPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const allDecisions = useDecisions()
  const existing = id ? getDecision(id) : undefined
  const isEdit = Boolean(existing)

  const [template, setTemplate] = useState<DecisionTemplate>('basic')
  const [title, setTitle] = useState(existing?.title ?? '')
  const [reason, setReason] = useState(existing?.reason ?? '')
  const [confidence, setConfidence] = useState(existing?.confidence ?? 70)
  const [category, setCategory] = useState<DecisionCategory>(existing?.category ?? 'other')
  const [reasonTypes, setReasonTypes] = useState<ReasonType[]>(existing?.reasonTypes ?? [])
  const [reviewDate, setReviewDate] = useState(
    existing ? toDateInput(existing.reviewDate) : daysFromNow(30),
  )
  const [showMore, setShowMore] = useState(
    Boolean(existing?.expectation || existing?.context || existing?.alternatives.length),
  )
  const [expectation, setExpectation] = useState(existing?.expectation ?? '')
  const [context, setContext] = useState(existing?.context ?? '')
  const [alternatives, setAlternatives] = useState(existing?.alternatives.join('\n') ?? '')
  const [project, setProject] = useState(existing?.project ?? '')
  const [relatedIds, setRelatedIds] = useState<string[]>(existing?.relatedIds ?? [])
  const [relatedQuery, setRelatedQuery] = useState('')
  const [errors, setErrors] = useState<{ title?: string; reason?: string }>({})

  const relatedCandidates = allDecisions.filter((d) => {
    if (d.id === existing?.id) return false
    const q = relatedQuery.trim().toLowerCase()
    return relatedIds.includes(d.id) || !q || d.title.toLowerCase().includes(q)
  })

  function toggleRelated(rid: string) {
    setRelatedIds((prev) =>
      prev.includes(rid) ? prev.filter((x) => x !== rid) : [...prev, rid],
    )
  }

  function applyTemplate(tpl: DecisionTemplate) {
    setTemplate(tpl)
    if (!isEdit) setCategory(TEMPLATE_CATEGORY[tpl])
  }

  function toggleReasonType(t: ReasonType) {
    setReasonTypes((prev) =>
      prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t],
    )
  }

  function submit() {
    const nextErrors: typeof errors = {}
    if (!title.trim()) nextErrors.title = S.validateTitle
    if (!reason.trim()) nextErrors.reason = S.validateReason
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    const now = new Date().toISOString()
    const decision: Decision = {
      id: existing?.id ?? crypto.randomUUID(),
      title: title.trim(),
      reason: reason.trim(),
      expectation: expectation.trim() || undefined,
      confidence,
      category,
      context: context.trim() || undefined,
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
      reviewDate: reviewDate ? new Date(reviewDate).toISOString() : undefined,
      status: existing?.status ?? 'active',
      reasonTypes,
      alternatives: alternatives
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean),
      outcome: existing?.outcome,
      relatedIds: relatedIds.length > 0 ? relatedIds : undefined,
      project: project.trim() || undefined,
    }
    upsertDecision(decision)
    navigate(`/decision/${decision.id}`, { replace: true })
  }

  return (
    <>
      <h1 className="page-title">{isEdit ? S.editDecision : S.newDecision}</h1>

      {!isEdit && (
        <div className="field">
          <div className="chips">
            {TEMPLATES.map((tpl) => (
              <button
                key={tpl}
                className={`chip ${template === tpl ? 'selected' : ''}`}
                onClick={() => applyTemplate(tpl)}
              >
                {templateLabel(tpl)}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="field">
        <label>{S.qWhat}</label>
        <input
          type="text"
          value={title}
          placeholder={templateTitleHint(template)}
          maxLength={200}
          autoFocus
          onChange={(e) => setTitle(e.target.value)}
        />
        {errors.title && <div className="error">{errors.title}</div>}
      </div>

      <div className="field">
        <label>{S.qReason}</label>
        <textarea
          value={reason}
          placeholder={templateReasonHint(template)}
          maxLength={2000}
          onChange={(e) => setReason(e.target.value)}
        />
        {errors.reason && <div className="error">{errors.reason}</div>}
      </div>

      <div className="field">
        <label>{S.qConfidence}</label>
        <div className="confidence-row">
          <input
            type="range"
            min={0}
            max={100}
            step={5}
            value={confidence}
            onChange={(e) => setConfidence(Number(e.target.value))}
          />
          <span className="confidence-value">{confidence}%</span>
        </div>
      </div>

      <div className="field">
        <label>{S.qWhen}</label>
        <div className="chips" style={{ marginBottom: 10 }}>
          {REVIEW_PRESETS.map((days) => (
            <button
              key={days}
              className={`chip ${reviewDate === daysFromNow(days) ? 'selected' : ''}`}
              onClick={() => setReviewDate(daysFromNow(days))}
            >
              {presetLabel(days)}
            </button>
          ))}
          <button
            className={`chip ${!reviewDate ? 'selected' : ''}`}
            onClick={() => setReviewDate('')}
          >
            {S.noReviewDate}
          </button>
        </div>
        <input type="date" value={reviewDate} onChange={(e) => setReviewDate(e.target.value)} />
      </div>

      <div className="field">
        <label>
          {S.projectLabel}
          <div className="hint">{S.projectHint}</div>
        </label>
        <input
          type="text"
          list="project-names"
          value={project}
          maxLength={100}
          onChange={(e) => setProject(e.target.value)}
        />
        <datalist id="project-names">
          {projectNames(allDecisions).map((p) => (
            <option key={p} value={p} />
          ))}
        </datalist>
      </div>

      <div className="field">
        <label>{S.categoryLabel}</label>
        <div className="chips">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              className={`chip ${category === c ? 'selected' : ''}`}
              onClick={() => setCategory(c)}
            >
              {categoryLabel(c)}
            </button>
          ))}
        </div>
      </div>

      <div className="field">
        <label>{S.reasonTagsLabel}</label>
        <div className="chips">
          {REASON_TYPES.map((t) => (
            <button
              key={t}
              className={`chip ${reasonTypes.includes(t) ? 'selected' : ''}`}
              onClick={() => toggleReasonType(t)}
            >
              {reasonTypeLabel(t)}
            </button>
          ))}
        </div>
      </div>

      {!showMore ? (
        <button className="btn" onClick={() => setShowMore(true)}>
          {S.addMore}
        </button>
      ) : (
        <>
          <div className="field">
            <label>{S.qExpectation}</label>
            <textarea
              value={expectation}
              placeholder={templateExpectationHint(template)}
              maxLength={2000}
              onChange={(e) => setExpectation(e.target.value)}
            />
          </div>
          <div className="field">
            <label>
              {S.qAlternatives}
              <div className="hint">{S.alternativesHint}</div>
            </label>
            <textarea
              value={alternatives}
              onChange={(e) => setAlternatives(e.target.value)}
            />
          </div>
          <div className="field">
            <label>{S.qContext}</label>
            <textarea
              value={context}
              placeholder={templateContextHint(template)}
              maxLength={2000}
              onChange={(e) => setContext(e.target.value)}
            />
          </div>
          {allDecisions.length > (isEdit ? 1 : 0) && (
            <div className="field">
              <label>{S.relatedLabel}</label>
              <input
                type="text"
                placeholder={S.relatedSearchHint}
                value={relatedQuery}
                onChange={(e) => setRelatedQuery(e.target.value)}
              />
              <div className="related-list">
                {relatedCandidates.slice(0, 30).map((d) => (
                  <button
                    key={d.id}
                    type="button"
                    className={`related-option ${relatedIds.includes(d.id) ? 'selected' : ''}`}
                    onClick={() => toggleRelated(d.id)}
                  >
                    <span>{relatedIds.includes(d.id) ? '✓' : '·'}</span>
                    <span>{d.title}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      <div style={{ marginTop: 28 }}>
        <button className="btn btn-primary btn-block" onClick={submit}>
          {isEdit ? S.save : S.recordDecision}
        </button>
      </div>
    </>
  )
}
