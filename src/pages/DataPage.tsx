import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { S } from '../i18n'
import { exportJson, importJson, useDecisions } from '../store'
import { useToast } from '../toast'

export default function DataPage() {
  const decisions = useDecisions()
  const toast = useToast()
  const fileInput = useRef<HTMLInputElement>(null)

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
    </>
  )
}
