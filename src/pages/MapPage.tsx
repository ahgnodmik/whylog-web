import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import {
  forceCenter,
  forceCollide,
  forceLink,
  forceManyBody,
  forceSimulation,
  type SimulationLinkDatum,
  type SimulationNodeDatum,
} from 'd3-force'
import { S, categoryLabel, formatDate, outcomeLabel } from '../i18n'
import { projectNames, useDecisions } from '../store'
import { CATEGORIES, isReviewDue, type Decision, type DecisionCategory } from '../types'

const CATEGORY_COLORS: Record<DecisionCategory, string> = {
  work: '#3d5a80',
  business: '#7d4f9e',
  money: '#2e7d5b',
  purchase: '#b07a1f',
  relationship: '#c25b8a',
  learning: '#3a8fa3',
  health: '#6a9e46',
  personal: '#8a6d4f',
  other: '#7a7a7a',
}

type Tab = 'timeline' | 'network'

export default function MapPage() {
  const decisions = useDecisions()
  const [params, setParams] = useSearchParams()
  const tab: Tab = params.get('tab') === 'network' ? 'network' : 'timeline'
  const project = params.get('project')
  const projects = projectNames(decisions)

  function update(next: { tab?: Tab; project?: string | null }) {
    const p: Record<string, string> = {}
    const t = next.tab ?? tab
    const proj = next.project === undefined ? project : next.project
    if (t !== 'timeline') p.tab = t
    if (proj) p.project = proj
    setParams(p, { replace: true })
  }
  const setTab = (t: Tab) => update({ tab: t })
  const setProject = (p: string | null) => update({ project: p })
  const visible = project === null ? decisions : decisions.filter((d) => d.project === project)

  return (
    <>
      <h1 className="page-title">{S.map}</h1>
      <div className="filters">
        <button
          className={`chip ${tab === 'timeline' ? 'selected' : ''}`}
          onClick={() => setTab('timeline')}
        >
          {S.timelineTab}
        </button>
        <button
          className={`chip ${tab === 'network' ? 'selected' : ''}`}
          onClick={() => setTab('network')}
        >
          {S.networkTab}
        </button>
      </div>

      {projects.length > 0 && (
        <div className="filters" style={{ marginTop: 0 }}>
          <button
            className={`chip ${project === null ? 'selected' : ''}`}
            onClick={() => setProject(null)}
          >
            {S.allProjects}
          </button>
          {projects.map((p) => (
            <button
              key={p}
              className={`chip ${project === p ? 'selected' : ''}`}
              onClick={() => setProject(project === p ? null : p)}
            >
              # {p}
            </button>
          ))}
        </div>
      )}

      {visible.length === 0 ? (
        <div className="empty-state">{S.mapEmpty}</div>
      ) : tab === 'timeline' ? (
        <Timeline decisions={visible} />
      ) : (
        <Network decisions={visible} />
      )}
    </>
  )
}

function monthKey(iso: string): string {
  return iso.slice(0, 7)
}

function monthLabel(key: string): string {
  const [y, m] = key.split('-')
  return S.isKo ? `${y}년 ${Number(m)}월` : new Date(Number(y), Number(m) - 1).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })
}

function Timeline({ decisions }: { decisions: Decision[] }) {
  const groups = useMemo(() => {
    const sorted = [...decisions].sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    const byMonth = new Map<string, Decision[]>()
    for (const d of sorted) {
      const key = monthKey(d.createdAt)
      byMonth.set(key, [...(byMonth.get(key) ?? []), d])
    }
    return [...byMonth.entries()]
  }, [decisions])

  return (
    <div className="timeline">
      {groups.map(([month, items]) => (
        <div key={month} className="timeline-month">
          <div className="timeline-month-label">{monthLabel(month)}</div>
          {items.map((d) => (
            <Link key={d.id} to={`/decision/${d.id}`} className="timeline-item">
              <span
                className="timeline-dot"
                style={{
                  background: d.status === 'reviewed' ? 'var(--good)' : isReviewDue(d) ? 'var(--warn)' : CATEGORY_COLORS[d.category],
                }}
              />
              <div className="timeline-body card">
                <h3>{d.title}</h3>
                <div className="meta">
                  {d.project && <span className="badge badge-project"># {d.project}</span>}
                  <span className="badge badge-category">{categoryLabel(d.category)}</span>
                  {d.status === 'reviewed' && d.outcome && (
                    <span className="badge badge-reviewed">{outcomeLabel(d.outcome.status)}</span>
                  )}
                  {isReviewDue(d) && <span className="badge badge-due">{S.dueBadge}</span>}
                  <span>{formatDate(d.createdAt)}</span>
                  <span>{d.confidence}%</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ))}
    </div>
  )
}

interface GraphNode extends SimulationNodeDatum {
  d: Decision
}

function Network({ decisions }: { decisions: Decision[] }) {
  const navigate = useNavigate()
  const wrapRef = useRef<HTMLDivElement>(null)
  const [layout, setLayout] = useState<{
    nodes: GraphNode[]
    links: { source: GraphNode; target: GraphNode; explicit: boolean }[]
    width: number
    height: number
  } | null>(null)

  useEffect(() => {
    const width = wrapRef.current?.clientWidth ?? 680
    const height = Math.max(420, Math.min(640, decisions.length * 42))
    const nodes: GraphNode[] = decisions.map((d) => ({ d }))
    const byId = new Map(nodes.map((n) => [n.d.id, n]))

    const links: { source: GraphNode; target: GraphNode; explicit: boolean }[] = []
    const seen = new Set<string>()
    const addLink = (a: GraphNode, b: GraphNode, explicit: boolean) => {
      const key = [a.d.id, b.d.id].sort().join('|')
      if (a === b || seen.has(key)) return
      seen.add(key)
      links.push({ source: a, target: b, explicit })
    }

    for (const n of nodes) {
      for (const rid of n.d.relatedIds ?? []) {
        const other = byId.get(rid)
        if (other) addLink(n, other, true)
      }
    }
    // Same-project chain (by time) — projects pull tighter than categories.
    const byProject = new Map<string, GraphNode[]>()
    for (const n of nodes) {
      if (!n.d.project) continue
      byProject.set(n.d.project, [...(byProject.get(n.d.project) ?? []), n])
    }
    for (const group of byProject.values()) {
      group.sort((a, b) => a.d.createdAt.localeCompare(b.d.createdAt))
      for (let i = 1; i < group.length; i++) addLink(group[i - 1], group[i], true)
    }
    // Same-category chain (by time) — cluster hint without O(n²) edges.
    for (const cat of CATEGORIES) {
      const inCat = nodes
        .filter((n) => n.d.category === cat)
        .sort((a, b) => a.d.createdAt.localeCompare(b.d.createdAt))
      for (let i = 1; i < inCat.length; i++) addLink(inCat[i - 1], inCat[i], false)
    }

    const sim = forceSimulation(nodes)
      .force('charge', forceManyBody().strength(-100).distanceMax(220))
      .force(
        'link',
        forceLink<GraphNode, SimulationLinkDatum<GraphNode>>(links)
          .distance((l) => ((l as { explicit?: boolean }).explicit ? 70 : 110))
          .strength((l) => ((l as { explicit?: boolean }).explicit ? 0.5 : 0.15)),
      )
      .force('center', forceCenter(width / 2, height / 2))
      .force('collide', forceCollide(26))
      .stop()
    sim.tick(300)

    for (const n of nodes) {
      n.x = Math.max(60, Math.min(width - 60, n.x ?? width / 2))
      n.y = Math.max(36, Math.min(height - 44, n.y ?? height / 2))
    }
    setLayout({ nodes, links, width, height })
  }, [decisions])

  if (!layout) return null

  return (
    <div ref={wrapRef}>
      <div className="notice">{S.networkHint}</div>
      <svg
        className="network-svg"
        width="100%"
        viewBox={`0 0 ${layout.width} ${layout.height}`}
        style={{ display: 'block' }}
      >
        {layout.links.map((l, i) => (
          <line
            key={i}
            x1={l.source.x}
            y1={l.source.y}
            x2={l.target.x}
            y2={l.target.y}
            stroke={l.explicit ? 'var(--accent)' : 'var(--border)'}
            strokeWidth={l.explicit ? 2 : 1}
            strokeOpacity={l.explicit ? 0.9 : 0.6}
          />
        ))}
        {layout.nodes.map((n) => {
          const r = 8 + (n.d.confidence / 100) * 8
          return (
            <g
              key={n.d.id}
              transform={`translate(${n.x},${n.y})`}
              style={{ cursor: 'pointer' }}
              onClick={() => navigate(`/decision/${n.d.id}`)}
            >
              <circle
                r={r}
                fill={CATEGORY_COLORS[n.d.category]}
                stroke={n.d.status === 'reviewed' ? 'var(--good)' : isReviewDue(n.d) ? 'var(--warn)' : 'transparent'}
                strokeWidth={3}
              />
              <title>{`${n.d.title} (${categoryLabel(n.d.category)}, ${n.d.confidence}%)`}</title>
              <text
                y={r + 14}
                textAnchor="middle"
                fontSize="11"
                fill="var(--text-soft)"
              >
                {n.d.title.length > 14 ? `${n.d.title.slice(0, 14)}…` : n.d.title}
              </text>
            </g>
          )
        })}
      </svg>
      <div className="chips" style={{ marginTop: 14 }}>
        {CATEGORIES.filter((c) => decisions.some((d) => d.category === c)).map((c) => (
          <span key={c} className="chip" style={{ borderColor: CATEGORY_COLORS[c], color: CATEGORY_COLORS[c] }}>
            {categoryLabel(c)}
          </span>
        ))}
      </div>
    </div>
  )
}
