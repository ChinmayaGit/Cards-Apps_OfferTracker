import { useMemo, useState } from 'react'
import type { Category, PayApp, Scope, WalletApp, WalletCard } from '../types'
import { getApp, getApps } from '../data/apps'
import { getBank, getProduct, PRODUCTS } from '../data/catalog'
import { CATEGORIES } from '../data/pay'
import { ScopeTabs } from '../components/ScopeTabs'

function scoreCard(productId: string, cat: Category): number {
  const p = getProduct(productId)
  if (!p) return 0
  let s = 0
  if (p.bestFor.includes(cat)) s += 20
  for (const o of p.offers) {
    if (o.category === cat) {
      s += 12
      if (o.payment.online === 'yes') s += 1
      if (o.payment.upi === 'yes') s += 2
    }
  }
  return s
}

function scoreApp(app: PayApp, cat: Category): number {
  let s = 0
  if (app.bestFor.includes(cat)) s += 20
  for (const o of app.offers) {
    if (o.category === cat) {
      s += 12
      if (o.payment.upi === 'yes') s += 2
      if (o.payment.online === 'yes') s += 1
    }
  }
  return s
}

type RankRow =
  | {
      key: string
      kind: 'card'
      score: number
      title: string
      meta: string
      lines: string[]
    }
  | {
      key: string
      kind: 'app'
      score: number
      title: string
      meta: string
      lines: string[]
    }

export function BestForView({
  wallet,
  apps,
  onAddCard,
  onAddApp,
  liveEpoch,
}: {
  wallet: WalletCard[]
  apps: WalletApp[]
  onAddCard: () => void
  onAddApp: () => void
  liveEpoch: number
}) {
  const [scope, setScope] = useState<Scope>('all')
  const [cat, setCat] = useState<Category>('movies')
  const wantCards = scope === 'all' || scope === 'cards'
  const wantApps = scope === 'all' || scope === 'apps'

  const mine = useMemo(() => {
    const rows: RankRow[] = []
    if (wantCards) {
      for (const w of wallet) {
        const product = getProduct(w.productId)
        if (!product) continue
        const score = scoreCard(product.id, cat)
        if (score <= 0) continue
        const bank = getBank(product.bankId)
        rows.push({
          key: `card-${w.id}`,
          kind: 'card',
          score,
          title: `${bank?.short} ${product.name}`,
          meta: w.last4 ? `•••• ${w.last4}` : '•••• XXXX',
          lines: product.offers
            .filter((o) => o.category === cat)
            .map(
              (o) =>
                `${o.title} — UPI ${o.payment.upi === 'yes' ? 'works' : o.payment.upi === 'maybe' ? 'maybe' : 'no'} · phone tap ${o.payment.phoneNfc === 'yes' ? 'works' : o.payment.phoneNfc === 'maybe' ? 'maybe' : 'no'}`,
            ),
        })
      }
    }
    if (wantApps) {
      for (const w of apps) {
        const app = getApp(w.appId)
        if (!app) continue
        const score = scoreApp(app, cat)
        if (score <= 0) continue
        rows.push({
          key: `app-${w.id}`,
          kind: 'app',
          score,
          title: app.name,
          meta: app.kind,
          lines: app.offers.filter((o) => o.category === cat).map((o) => o.title),
        })
      }
    }
    return rows.sort((a, b) => b.score - a.score)
  }, [wallet, apps, cat, wantCards, wantApps, liveEpoch])

  const discover = useMemo(() => {
    const items: { key: string; title: string; meta: string; line: string }[] = []
    if (wantCards) {
      const held = new Set(wallet.map((w) => w.productId))
      for (const p of PRODUCTS.filter((x) => !held.has(x.id) && scoreCard(x.id, cat) > 0)
        .sort((a, b) => scoreCard(b.id, cat) - scoreCard(a.id, cat))
        .slice(0, 6)) {
        const bank = getBank(p.bankId)
        const hit = p.offers.find((o) => o.category === cat)
        items.push({
          key: `c-${p.id}`,
          title: `${bank?.short} ${p.name}`,
          meta: `${p.network} ${p.kind} · card`,
          line: hit?.title ?? '',
        })
      }
    }
    if (wantApps) {
      const held = new Set(apps.map((a) => a.appId))
      for (const app of getApps()
        .filter((a) => !held.has(a.id) && scoreApp(a, cat) > 0)
        .sort((a, b) => scoreApp(b, cat) - scoreApp(a, cat))
        .slice(0, 6)) {
        const hit = app.offers.find((o) => o.category === cat)
        items.push({
          key: `a-${app.id}`,
          title: app.name,
          meta: `${app.kind} · app`,
          line: hit?.title ?? '',
        })
      }
    }
    return items
  }, [wallet, apps, cat, wantCards, wantApps, liveEpoch])

  const label = CATEGORIES.find((c) => c.id === cat)?.label ?? cat

  return (
    <section className="page">
      <p className="eyebrow">Best for</p>
      <h1>{label}</h1>
      <p className="lede">
        All ranks cards and apps you added. Confirm the live tile in the bank or pay app before
        you pay.
      </p>
      <ScopeTabs value={scope} onChange={setScope} />
      <div className="chips">
        {CATEGORIES.map((c) => (
          <button
            key={c.id}
            type="button"
            className={`chip-btn ${cat === c.id ? 'on' : ''}`}
            onClick={() => setCat(c.id)}
          >
            {c.label}
          </button>
        ))}
      </div>

      <h2 className="subhead">In your lists</h2>
      {mine.length === 0 ? (
        <p className="muted">
          Nothing you added is strong for {label.toLowerCase()}. Add a specialist, switch All /
          Cards / Apps, or pick another category.
        </p>
      ) : (
        <ol className="rank">
          {mine.map((row, i) => (
            <li key={row.key} className="rank-item">
              <span className="rank-n">{i + 1}</span>
              <div>
                <strong>{row.title}</strong>
                <span className="muted">
                  {' '}
                  · <span className="kind-pill">{row.kind === 'app' ? 'App' : 'Card'}</span>
                  {row.meta}
                </span>
                {row.lines.map((line) => (
                  <p key={line} className="rank-offer">
                    {line}
                  </p>
                ))}
              </div>
            </li>
          ))}
        </ol>
      )}

      <h2 className="subhead">Also in the catalog</h2>
      {discover.length === 0 ? (
        <p className="muted">Nothing else to suggest for this filter.</p>
      ) : (
        <ul className="discover">
          {discover.map((row) => (
            <li key={row.key}>
              <strong>{row.title}</strong>
              <span className="muted"> · {row.meta}</span>
              {row.line ? <p className="rank-offer">{row.line}</p> : null}
            </li>
          ))}
        </ul>
      )}
      <div className="page-head-actions">
        {scope !== 'apps' ? (
          <button type="button" className="primary" onClick={onAddCard}>
            Add a card
          </button>
        ) : null}
        {scope !== 'cards' ? (
          <button type="button" className={scope === 'apps' ? 'primary' : 'ghost-btn'} onClick={onAddApp}>
            Add an app
          </button>
        ) : null}
      </div>
    </section>
  )
}
