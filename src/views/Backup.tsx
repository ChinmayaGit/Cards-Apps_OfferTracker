import { useRef, useState } from 'react'
import type { WalletCard } from '../types'
import { getProduct } from '../data/catalog'
import {
  backupFilename,
  downloadBackup,
  formatWhen,
  makeBackup,
  mergeWallets,
  parseBackup,
  type Snapshot,
} from '../lib/storage'

export function BackupView({
  wallet,
  snapshots,
  onReplace,
  onMerge,
}: {
  wallet: WalletCard[]
  snapshots: Snapshot[]
  onReplace: (cards: WalletCard[]) => void
  onMerge: (cards: WalletCard[]) => void
}) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [msg, setMsg] = useState<string | null>(null)
  const [err, setErr] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  function applyFile(text: string, mode: 'replace' | 'merge') {
    try {
      const cards = parseBackup(text)
      if (mode === 'replace') {
        if (
          wallet.length > 0 &&
          !window.confirm(
            `Replace ${wallet.length} card${wallet.length === 1 ? '' : 's'} in this browser with ${cards.length} from the backup?`,
          )
        ) {
          return
        }
        onReplace(cards)
        setMsg(`Restored ${cards.length} card${cards.length === 1 ? '' : 's'} from file.`)
      } else {
        const merged = mergeWallets(wallet, cards)
        const added = merged.length - wallet.length
        onMerge(merged)
        setMsg(
          added === 0
            ? 'Nothing new to add — those cards are already in the wallet.'
            : `Merged ${added} card${added === 1 ? '' : 's'} into this wallet.`,
        )
      }
      setErr(null)
    } catch (e) {
      setMsg(null)
      setErr(e instanceof Error ? e.message : 'Could not restore that backup.')
    }
  }

  function onPickFile(mode: 'replace' | 'merge') {
    const input = fileRef.current
    if (!input) return
    input.onchange = () => {
      const file = input.files?.[0]
      input.value = ''
      if (!file) return
      void file.text().then((text) => applyFile(text, mode))
    }
    input.click()
  }

  async function copyJson() {
    try {
      const body = JSON.stringify(makeBackup(wallet), null, 2)
      await navigator.clipboard.writeText(body)
      setCopied(true)
      setErr(null)
      window.setTimeout(() => setCopied(false), 2000)
    } catch {
      setErr('Could not copy — download the file instead.')
    }
  }

  return (
    <section className="page">
      <p className="eyebrow">Backup</p>
      <h1>Keep this wallet</h1>
      <p className="lede">
        Cards live only in this browser. Download a JSON file to Drive, iCloud, or a USB stick.
        The file has bank, card type, nickname, and last four — never PAN, CVV, or expiry.
      </p>

      <div className="backup-grid">
        <article className="offer">
          <h3>Save a copy</h3>
          <p className="offer-lead">
            {wallet.length} card{wallet.length === 1 ? '' : 's'} in this browser. File name{' '}
            <code>{backupFilename()}</code>.
          </p>
          <div className="backup-actions">
            <button
              type="button"
              className="primary"
              onClick={() => {
                downloadBackup(wallet)
                setMsg('Backup file downloaded.')
                setErr(null)
              }}
              disabled={wallet.length === 0}
            >
              Download backup
            </button>
            <button type="button" className="ghost-btn" onClick={() => void copyJson()}>
              {copied ? 'Copied' : 'Copy JSON'}
            </button>
          </div>
        </article>

        <article className="offer">
          <h3>Restore</h3>
          <p className="offer-lead">
            Merge adds cards that are not already here. Replace wipes this browser’s wallet and
            loads the file.
          </p>
          <input
            ref={fileRef}
            type="file"
            accept="application/json,.json"
            hidden
          />
          <div className="backup-actions">
            <button type="button" className="primary" onClick={() => onPickFile('merge')}>
              Merge from file
            </button>
            <button type="button" className="ghost-btn" onClick={() => onPickFile('replace')}>
              Replace from file
            </button>
          </div>
        </article>
      </div>

      {msg ? <p className="backup-ok">{msg}</p> : null}
      {err ? <p className="backup-err">{err}</p> : null}

      <h2 className="subhead">Automatic snapshots</h2>
      <p className="muted">
        Folio keeps the last 8 wallet versions in this browser so an accidental delete is
        undoable. These are not a substitute for a downloaded file if you clear site data.
      </p>
      {snapshots.length === 0 ? (
        <p className="muted">Snapshots appear after you add or change cards.</p>
      ) : (
        <ol className="rank">
          {snapshots.map((s) => (
            <li key={s.id} className="rank-item">
              <div>
                <strong>{formatWhen(s.savedAt)}</strong>
                <p className="rank-offer">
                  {s.cards.length} card{s.cards.length === 1 ? '' : 's'}
                  {s.cards
                    .slice(0, 4)
                    .map((c) => {
                      const p = getProduct(c.productId)
                      return p ? p.name : c.productId
                    })
                    .join(' · ')}
                  {s.cards.length > 4 ? '…' : ''}
                </p>
                <button
                  type="button"
                  className="linkish"
                  onClick={() => {
                    if (
                      !window.confirm(
                        `Restore this snapshot (${s.cards.length} cards) and replace the current wallet?`,
                      )
                    ) {
                      return
                    }
                    onReplace(s.cards)
                    setMsg(`Restored snapshot from ${formatWhen(s.savedAt)}.`)
                    setErr(null)
                  }}
                >
                  Restore this snapshot
                </button>
              </div>
            </li>
          ))}
        </ol>
      )}
    </section>
  )
}
