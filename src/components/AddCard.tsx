import { useMemo, useState } from 'react'
import type { CardKind, CardProduct } from '../types'
import {
  BANKS,
  bankCardCounts,
  banksWithKind,
  getBank,
  getProduct,
  productsForBank,
  searchProducts,
} from '../data/catalog'
import { CardPlastic } from './CardPlastic'

type KindFilter = 'all' | CardKind

function ProductButton({
  product,
  onPick,
}: {
  product: CardProduct
  onPick: () => void
}) {
  const bank = getBank(product.bankId)
  return (
    <button type="button" className="product-tile" onClick={onPick}>
      <CardPlastic product={product} last4="" compact />
      <span className="product-meta">
        {product.kind} · {bank?.short} · {product.network} · {product.annualFee}
      </span>
    </button>
  )
}

export function AddCard({
  onClose,
  onAdd,
}: {
  onClose: () => void
  onAdd: (product: CardProduct, last4: string, nickname: string) => void
}) {
  const [kind, setKind] = useState<KindFilter>('all')
  const [bankId, setBankId] = useState<string | null>(null)
  const [productId, setProductId] = useState<string | null>(null)
  const [last4, setLast4] = useState('')
  const [nickname, setNickname] = useState('')
  const [q, setQ] = useState('')

  const kindArg = kind === 'all' ? undefined : kind

  const banks = useMemo(() => {
    const list = banksWithKind(kindArg)
    const query = q.trim().toLowerCase()
    if (!query) return list
    return list.filter(
      (b) =>
        b.name.toLowerCase().includes(query) ||
        b.short.toLowerCase().includes(query),
    )
  }, [kindArg, q])

  const productHits = useMemo(() => {
    if (bankId) return []
    return searchProducts(q, kindArg)
  }, [kindArg, q, bankId])

  const products = bankId ? productsForBank(bankId, kindArg) : []
  const visibleProducts = products.filter((p) => {
    const query = q.trim().toLowerCase()
    if (!query) return true
    const blob = [p.name, p.kind, p.network, ...(p.aliases ?? [])].join(' ').toLowerCase()
    return blob.includes(query)
  })
  const debitList = visibleProducts.filter((p) => p.kind === 'debit')
  const creditList = visibleProducts.filter((p) => p.kind === 'credit')
  const product = productId ? (getProduct(productId) ?? null) : null
  const bank = bankId ? getBank(bankId) : undefined

  function resetBank() {
    setBankId(null)
    setProductId(null)
    setLast4('')
    setNickname('')
    setQ('')
  }

  function setFilter(next: KindFilter) {
    setKind(next)
    setProductId(null)
    setQ('')
  }

  return (
    <div className="sheet-backdrop" onClick={onClose} role="presentation">
      <div
        className="sheet"
        role="dialog"
        aria-labelledby="add-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sheet-bar">
          <h2 id="add-title">Add a card</h2>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>
        <p className="muted">
          Pick bank and type. No PAN, CVV, or expiry. Last four is optional (XXXX or 1234).
          Debit sits under the same bank as credit — tap <strong>All</strong> or{' '}
          <strong>Debit</strong>, then HDFC / SBI.
        </p>

        <div className="seg">
          <button type="button" className={kind === 'all' ? 'on' : ''} onClick={() => setFilter('all')}>
            All
          </button>
          <button
            type="button"
            className={kind === 'credit' ? 'on' : ''}
            onClick={() => setFilter('credit')}
          >
            Credit
          </button>
          <button
            type="button"
            className={kind === 'debit' ? 'on' : ''}
            onClick={() => setFilter('debit')}
          >
            Debit
          </button>
        </div>

        {!bankId ? (
          <>
            <label className="field">
              <span>Search bank or card</span>
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="HDFC Platinum debit, SBI Mastercard, Pulse…"
                autoFocus
              />
            </label>
            {productHits.length > 0 ? (
              <div className="product-pick" style={{ marginBottom: 16 }}>
                <h3 className="subhead">Matching cards</h3>
                {productHits.map((p) => (
                  <ProductButton
                    key={p.id}
                    product={p}
                    onPick={() => {
                      setBankId(p.bankId)
                      setProductId(p.id)
                      setQ('')
                    }}
                  />
                ))}
              </div>
            ) : null}
            <div className="bank-grid">
              {banks.map((b) => {
                const n = bankCardCounts(b.id)
                return (
                  <button
                    key={b.id}
                    type="button"
                    className="bank-tile"
                    onClick={() => {
                      setBankId(b.id)
                      setQ('')
                    }}
                  >
                    <strong>{b.short}</strong>
                    <span>{b.name}</span>
                    <span className="bank-counts">
                      {n.credit} credit · {n.debit} debit
                    </span>
                  </button>
                )
              })}
              {banks.length === 0 ? <p className="muted">No banks match that search.</p> : null}
            </div>
          </>
        ) : !product ? (
          <>
            <button type="button" className="linkish" onClick={resetBank}>
              ← {bank?.name ?? 'Banks'}
            </button>
            <h3 className="subhead">{bank?.name} cards</h3>
            <label className="field">
              <span>Filter this bank</span>
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Platinum, Mastercard, Millennia…"
              />
            </label>
            <div className="product-pick">
              {kind !== 'credit' && debitList.length > 0 ? (
                <>
                  <h4 className="kind-label">Debit</h4>
                  {debitList.map((p) => (
                    <ProductButton key={p.id} product={p} onPick={() => setProductId(p.id)} />
                  ))}
                </>
              ) : null}
              {kind !== 'debit' && creditList.length > 0 ? (
                <>
                  <h4 className="kind-label">Credit</h4>
                  {creditList.map((p) => (
                    <ProductButton key={p.id} product={p} onPick={() => setProductId(p.id)} />
                  ))}
                </>
              ) : null}
              {visibleProducts.length === 0 ? (
                <p className="muted">No cards match. Tap All, or clear the filter.</p>
              ) : null}
            </div>
          </>
        ) : (
          <>
            <button type="button" className="linkish" onClick={() => setProductId(null)}>
              ← {BANKS.find((b) => b.id === product.bankId)?.name} cards
            </button>
            <p className="chip" style={{ width: 'fit-content' }}>
              {product.kind} · {product.network}
            </p>
            <div className="preview">
              <CardPlastic product={product} last4={last4} nickname={nickname} />
            </div>
            <label className="field">
              <span>Last 4 digits (optional)</span>
              <input
                inputMode="numeric"
                maxLength={4}
                value={last4}
                onChange={(e) => setLast4(e.target.value.replace(/\D/g, '').slice(0, 4))}
                placeholder="XXXX"
              />
            </label>
            <label className="field">
              <span>Nickname (optional)</span>
              <input
                value={nickname}
                onChange={(e) => setNickname(e.target.value.slice(0, 24))}
                placeholder="Work · Travel · Mom"
              />
            </label>
            <button
              type="button"
              className="primary"
              onClick={() => onAdd(product, last4, nickname.trim())}
            >
              Add to wallet
            </button>
          </>
        )}
      </div>
    </div>
  )
}
