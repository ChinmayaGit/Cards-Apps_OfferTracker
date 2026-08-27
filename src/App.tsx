import { useEffect, useState } from 'react'
import type { CardProduct, WalletCard } from './types'
import { loadWallet, saveWallet, uid } from './lib/storage'
import { AddCard } from './components/AddCard'
import { WalletView } from './views/Wallet'
import { OffersView } from './views/Offers'
import { BestForView } from './views/BestFor'
import { SourcesView } from './views/Sources'
import { CardDetailView } from './views/CardDetail'

type Tab = 'wallet' | 'offers' | 'best' | 'sources'

export default function App() {
  const [wallet, setWallet] = useState<WalletCard[]>(() => loadWallet())
  const [tab, setTab] = useState<Tab>('wallet')
  const [adding, setAdding] = useState(false)
  const [openId, setOpenId] = useState<string | null>(null)

  useEffect(() => {
    saveWallet(wallet)
  }, [wallet])

  const openCard = wallet.find((c) => c.id === openId) ?? null

  function addCard(product: CardProduct, last4: string, nickname: string) {
    setWallet((prev) => [
      {
        id: uid(),
        productId: product.id,
        last4,
        nickname,
        addedAt: Date.now(),
      },
      ...prev,
    ])
    setAdding(false)
    setTab('wallet')
  }

  function removeCard(id: string) {
    setWallet((prev) => prev.filter((c) => c.id !== id))
    setOpenId(null)
  }

  return (
    <div className="app">
      <header className="top">
        <div className="brand">
          <span className="mark" aria-hidden />
          <div>
            <strong>Folio</strong>
            <em>Card offers, decoded</em>
          </div>
        </div>
        <nav className="nav-desk">
          {(
            [
              ['wallet', 'Wallet'],
              ['offers', 'Offers'],
              ['best', 'Best for'],
              ['sources', 'Sources'],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              className={tab === id && !openId ? 'on' : ''}
              onClick={() => {
                setOpenId(null)
                setTab(id)
              }}
            >
              {label}
            </button>
          ))}
        </nav>
      </header>

      <main>
        {openCard ? (
          <CardDetailView
            card={openCard}
            onBack={() => setOpenId(null)}
            onRemove={() => {
              if (window.confirm('Remove this card from your wallet?')) {
                removeCard(openCard.id)
              }
            }}
          />
        ) : tab === 'wallet' ? (
          <WalletView
            wallet={wallet}
            onAdd={() => setAdding(true)}
            onOpen={setOpenId}
          />
        ) : tab === 'offers' ? (
          <OffersView wallet={wallet} onAdd={() => setAdding(true)} />
        ) : tab === 'best' ? (
          <BestForView wallet={wallet} onAdd={() => setAdding(true)} />
        ) : (
          <SourcesView />
        )}
      </main>

      <nav className="nav-mob">
        {(
          [
            ['wallet', 'Wallet'],
            ['offers', 'Offers'],
            ['best', 'Best'],
            ['sources', 'Sources'],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            className={tab === id && !openId ? 'on' : ''}
            onClick={() => {
              setOpenId(null)
              setTab(id)
            }}
          >
            {label}
          </button>
        ))}
      </nav>

      {adding ? (
        <AddCard onClose={() => setAdding(false)} onAdd={addCard} />
      ) : null}
    </div>
  )
}
