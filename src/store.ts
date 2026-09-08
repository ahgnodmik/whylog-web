import { useSyncExternalStore } from 'react'
import type { Decision } from './types'

const STORAGE_KEY = 'whylog.decisions.v1'

type Listener = () => void

let decisions: Decision[] = load()
const listeners = new Set<Listener>()

function load(): Decision[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? (parsed as Decision[]) : []
  } catch {
    return []
  }
}

function persist() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(decisions))
}

function emit() {
  for (const l of listeners) l()
}

function subscribe(listener: Listener): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

// Another tab may write; keep this tab in sync.
window.addEventListener('storage', (e) => {
  if (e.key === STORAGE_KEY) {
    decisions = load()
    emit()
  }
})

export function useDecisions(): Decision[] {
  return useSyncExternalStore(subscribe, () => decisions)
}

export function projectNames(items: Decision[]): string[] {
  return [...new Set(items.map((d) => d.project).filter((p): p is string => Boolean(p)))].sort()
}

export function getDecision(id: string): Decision | undefined {
  return decisions.find((d) => d.id === id)
}

export function upsertDecision(d: Decision) {
  const idx = decisions.findIndex((x) => x.id === d.id)
  decisions =
    idx >= 0
      ? [...decisions.slice(0, idx), d, ...decisions.slice(idx + 1)]
      : [d, ...decisions]
  persist()
  emit()
}

export function deleteDecision(id: string) {
  decisions = decisions.filter((d) => d.id !== id)
  persist()
  emit()
}

export function replaceAll(items: Decision[]) {
  decisions = items
  persist()
  emit()
}

export function exportJson(): string {
  return JSON.stringify({ app: 'whylog', version: 1, decisions }, null, 2)
}

export interface ImportResult {
  added: number
  updated: number
}

/** Merge imported decisions by id; newer updatedAt wins. */
export function importJson(raw: string): ImportResult {
  const parsed = JSON.parse(raw)
  const items: Decision[] = Array.isArray(parsed) ? parsed : parsed.decisions
  if (!Array.isArray(items)) throw new Error('invalid format')
  let added = 0
  let updated = 0
  const byId = new Map(decisions.map((d) => [d.id, d]))
  for (const item of items) {
    if (!item || typeof item.id !== 'string' || typeof item.title !== 'string') continue
    const existing = byId.get(item.id)
    if (!existing) {
      byId.set(item.id, item)
      added++
    } else if (item.updatedAt > existing.updatedAt) {
      byId.set(item.id, item)
      updated++
    }
  }
  decisions = [...byId.values()].sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  persist()
  emit()
  return { added, updated }
}
