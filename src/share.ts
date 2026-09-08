import { compressToEncodedURIComponent, decompressFromEncodedURIComponent } from 'lz-string'
import type { Decision } from './types'

export function encodeShare(d: Decision): string {
  // Strip nothing — a shared decision carries its full record including outcome.
  return compressToEncodedURIComponent(JSON.stringify(d))
}

export function decodeShare(data: string): Decision | null {
  try {
    const raw = decompressFromEncodedURIComponent(data)
    if (!raw) return null
    const d = JSON.parse(raw) as Decision
    if (typeof d.id !== 'string' || typeof d.title !== 'string' || typeof d.reason !== 'string') {
      return null
    }
    return d
  } catch {
    return null
  }
}

export function shareUrl(d: Decision): string {
  return `${location.origin}${import.meta.env.BASE_URL}#/s/${encodeShare(d)}`
}
