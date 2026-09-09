import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { BUY_URL } from '../config'
import { S } from '../i18n'
import { activateLicense, deactivateLicense, useLicense } from '../license'
import { exportJson, importJson, useDecisions } from '../store'
import { useToast } from '../toast'

export default function DataPage() {
  const decisions = useDecisions()
  const toast = useToast()
  const fileInput = useRef<HTMLInputElement>(null)
  const license = useLicense()
  const [key, setKey] = useState('')
  const [activating, setActivating] = useState(false)

  async function activate() {
    if (!key.trim() || activating) return
    setActivating(true)
    const result = await activateLicense(key)
    setActivating(false)
    if (result.ok) {
      setKey('')
      toast(S.licenseActive)
    } else {
      toast(result.error ?? S.activateFailed)
    }
  }

  function download() {
    const blob = new Blob([exportJson()], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `whylog-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  async function onFile(file: File) {
    try {
      const { added, updated } = importJson(await file.text())
      toast(S.importDone(added, updated))
    } catch {
      toast(S.importFailed)
    }
  }

  return (
    <>
      <h1 className="page-title">{S.settings}</h1>

      <div className="notice">{S.localOnlyNote}</div>

      <div className="card" style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <Link to="/print" className="btn">
          {S.exportPdf}
        </Link>
        <button className="btn" onClick={download} disabled={decisions.length === 0}>
          {S.exportJson} ({decisions.length})
        </button>
        <button className="btn" onClick={() => fileInput.current?.click()}>
          {S.importJson}
        </button>
        <input
          ref={fileInput}
          type="file"
          accept="application/json"
          hidden
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) onFile(file)
            e.target.value = ''
          }}
        />
      </div>

      {(BUY_URL || license) && (
        <div className="card" style={{ marginTop: 16 }}>
          <h4 style={{ marginTop: 0 }}>{S.removeAdsTitle}</h4>
          {license ? (
            <>
              <p>{S.licenseActive}</p>
              <button className="btn" onClick={() => deactivateLicense()}>
                {S.deactivate}
              </button>
            </>
          ) : (
            <>
              <p style={{ color: 'var(--text-soft)', fontSize: 14 }}>{S.removeAdsBody}</p>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <a className="btn btn-primary" href={BUY_URL} target="_blank" rel="noreferrer">
                  {S.buyRemoveAds}
                </a>
                <input
                  type="text"
                  placeholder={S.licenseKeyHint}
                  value={key}
                  onChange={(e) => setKey(e.target.value)}
                  style={{
                    padding: '10px 14px',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius)',
                    background: 'var(--surface)',
                    flex: 1,
                    minWidth: 200,
                  }}
                />
                <button className="btn" onClick={activate} disabled={activating || !key.trim()}>
                  {S.activate}
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </>
  )
}
