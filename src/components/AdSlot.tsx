import { useEffect, useRef } from 'react'
import { ADSENSE_CLIENT } from '../config'
import { useLicense } from '../license'

declare global {
  interface Window {
    adsbygoogle?: unknown[]
  }
}

let scriptLoaded = false

function loadScript() {
  if (scriptLoaded) return
  scriptLoaded = true
  const s = document.createElement('script')
  s.async = true
  s.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`
  s.crossOrigin = 'anonymous'
  document.head.appendChild(s)
}

export default function AdSlot({ slot }: { slot: string }) {
  const licensed = useLicense() !== null
  const pushed = useRef(false)
  const enabled = Boolean(ADSENSE_CLIENT && slot) && !licensed

  useEffect(() => {
    if (!enabled || pushed.current) return
    pushed.current = true
    loadScript()
    try {
      ;(window.adsbygoogle = window.adsbygoogle || []).push({})
    } catch {
      // AdSense not ready / blocked — nothing to do.
    }
  }, [enabled])

  if (!enabled) return null

  return (
    <ins
      className="adsbygoogle"
      style={{ display: 'block', marginTop: 24 }}
      data-ad-client={ADSENSE_CLIENT}
      data-ad-slot={slot}
      data-ad-format="auto"
      data-full-width-responsive="true"
    />
  )
}
