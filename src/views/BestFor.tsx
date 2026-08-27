import { useMemo, useState } from 'react'
import type { Category, WalletCard } from '../types'
import { getBank, getProduct, PRODUCTS } from '../data/catalog'
import { CATEGORIES } from '../data/pay'

function score(productId: string, cat: Category): number {
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

export function BestForView({
  wallet,
  onAdd,
}: {
  wallet: WalletCard[]
  onAdd: () => void
}) {
  const [cat, setCat] = useState<Category>('movies')

  const mine = useMemo(() => {
    return wallet
      .map((w) => {
        const product = getProduct(w.productId)
        if (!product) return null
        return { w, product, score: score(product.id, cat) }
      })
      .filter((x) => x && x.score > 0)
      .sort((a, b) => b!.score - a!.score) as {
      w: WalletCard
      product: NonNullable<ReturnType<typeof getProduct>>
      score: number
    }[]
  }, [wallet, cat])

  const discover = useMemo(() => {
    const held = new Set(wallet.map((w) => w.productId))
    return PRODUCTS.filter((p) => !held.has(p.id) && score(p.id, cat) > 0)
      .sort((a, b) => score(b.id, cat) - score(a.id, cat))
      .slice(0, 6)
  }, [wallet, cat])

  const label = CATEGORIES.find((c) => c.id === cat)?.label ?? cat

  return (
    <section className="page">
      <p className="eyebrow">Best for</p>
      <h1>{label}</h1>
      <p className="lede">
        Ranked from the cards in your wallet, then similar products you could add. Always
        confirm the live bank page before you pay.
      </p>
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

      <h2 className="subhead">In your wallet</h2>
      {mine.length === 0 ? (
        <p className="muted">
          None of your cards are strong for {label.toLowerCase()}. Add a specialist, or pick
          another category.
        </p>
      ) : (
        <ol className="rank">
          {mine.map((row, i) => {
            const bank = getBank(row.product.bankId)
            const offers = row.product.offers.filter((o) => o.category === cat)
            return (
              <li key={row.w.id} className="rank-item">
                <span className="rank-n">{i + 1}</span>
                <div>
                  <strong>
                    {bank?.short} {row.product.name}
                  </strong>
                  <span className="muted">
                    {' '}
                    · {row.w.last4 ? `•••• ${row.w.last4}` : '•••• XXXX'}
                  </span>
                  {offers.map((o) => (
                    <p key={o.id} className="rank-offer">
                      {o.title} — UPI {o.payment.upi === 'yes' ? 'works' : o.payment.upi === 'maybe' ? 'maybe' : 'no'}
                      {' · '}
                      phone tap {o.payment.phoneNfc === 'yes' ? 'works' : o.payment.phoneNfc === 'maybe' ? 'maybe' : 'no'}
                    </p>
                  ))}
                </div>
              </li>
            )
          })}
        </ol>
      )}

      <h2 className="subhead">Also in the catalog</h2>
      <ul className="discover">
        {discover.map((p) => {
          const bank = getBank(p.bankId)
          const hit = p.offers.find((o) => o.category === cat)
          return (
            <li key={p.id}>
              <strong>
                {bank?.short} {p.name}
              </strong>
              <span className="muted"> · {p.network} {p.kind}</span>
              {hit ? <p className="rank-offer">{hit.title}</p> : null}
            </li>
          )
        })}
      </ul>
      <button type="button" className="primary" onClick={onAdd}>
        Add a card
      </button>
    </section>
  )
}
