import { useSyncExternalStore } from 'react'
import { LICENSE_API } from './config'

const LICENSE_KEY = 'whylog.license.v1'

interface License {
  key: string
  instanceId?: string
  activatedAt: string
}

type Listener = () => void
const listeners = new Set<Listener>()

function load(): License | null {
  try {
    const raw = localStorage.getItem(LICENSE_KEY)
    return raw ? (JSON.parse(raw) as License) : null
  } catch {
    return null
  }
}

let license: License | null = load()

function emit() {
  for (const l of listeners) l()
}

export function useLicense(): License | null {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l)
      return () => listeners.delete(l)
    },
    () => license,
  )
}

export function isLicensed(): boolean {
  return license !== null
}

export async function activateLicense(key: string): Promise<{ ok: boolean; error?: string }> {
  try {
    const res = await fetch(`${LICENSE_API}/activate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ license_key: key.trim(), instance_name: 'whylog-web' }),
    })
    const data = await res.json()
    if (!data.activated) {
      return { ok: false, error: typeof data.error === 'string' ? data.error : undefined }
    }
    license = {
      key: key.trim(),
      instanceId: data.instance?.id,
      activatedAt: new Date().toISOString(),
    }
    localStorage.setItem(LICENSE_KEY, JSON.stringify(license))
    emit()
    return { ok: true }
  } catch {
    return { ok: false }
  }
}

export async function deactivateLicense(): Promise<void> {
  const current = license
  license = null
  localStorage.removeItem(LICENSE_KEY)
  emit()
  if (current?.instanceId) {
    // Best-effort: free the activation slot on the store side.
    fetch(`${LICENSE_API}/deactivate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ license_key: current.key, instance_id: current.instanceId }),
    }).catch(() => {})
  }
}
