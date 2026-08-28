import type { WalletCard } from '../types'
import { getBank, getProduct } from '../data/catalog'
import { CATEGORIES } from '../data/pay'
import { CardPlastic } from '../components/CardPlastic'

const catLabel = (id: string) => CATEGORIES.find((c) => c.id === id)?.label.toLowerCase() ?? id

export function WalletView({
  wallet,
  onAdd,
  onOpen,
  onBackup,
}: {
  wallet: WalletCard[]
  onAdd: () => void
  onOpen: (id: string) => void
  onBackup: () => void
}) {
  return (
    <section className="page">
      <header className="page-head">
        <div>
          <p className="eyebrow">Wallet</p>
          <h1>Your cards</h1>
        </div>
        <div className="page-head-actions">
          <button type="button" className="ghost-btn" onClick={onBackup}>
            Backup
          </button>
          <button type="button" className="primary" onClick={onAdd}>
            Add card
          </button>
        </div>
      </header>
      <p className="lede">
        No PAN, CVV, or expiry. Choose bank and type. Numbers show as XXXX unless you add
        the last four.
      </p>

      {wallet.length === 0 ? (
        <div className="empty">
          <div className="empty-stack" aria-hidden>
            <div className="ghost-card c1" />
            <div className="ghost-card c2" />
            <div className="ghost-card c3" />
          </div>
          <h2>Empty wallet</h2>
          <p>
            Add HDFC Millennia, SBI Cashback, a RuPay UPI card — whatever you actually hold.
            Offers, tap-to-pay, and UPI rules attach automatically.
          </p>
          <button type="button" className="primary" onClick={onAdd}>
            Add your first card
          </button>
        </div>
      ) : (
        <div className="wallet-grid">
          {wallet.map((w) => {
            const product = getProduct(w.productId)
            if (!product) return null
            const bank = getBank(product.bankId)
            return (
              <div key={w.id} className="wallet-item">
                <CardPlastic
                  product={product}
                  last4={w.last4}
                  nickname={w.nickname}
                  onClick={() => onOpen(w.id)}
                />
                <p className="wallet-caption">
                  {bank?.short} · {product.bestFor.slice(0, 3).map(catLabel).join(' · ')} ·{' '}
                  {product.offers.length} offers
                </p>
              </div>
            )
          })}
        </div>
      )}
    </section>
  )
}
