import { useEffect, useState } from 'react'
import type { CardProduct, WalletCard } from './types'
import {
  loadSnapshots,
  loadWallet,
  pushSnapshot,
  saveWallet,
  uid,
} from './lib/storage'
import { AddCard } from './components/AddCard'
import { WalletView } from './views/Wallet'
import { OffersView } from './views/Offers'
import { BestForView } from './views/BestFor'
import { BackupView } from './views/Backup'
import { SourcesView } from './views/Sources'
import { CardDetailView } from './views/CardDetail'

type Tab = 'wallet' | 'offers' | 'best' | 'backup' | 'sources'

const TABS: { id: Tab; desk: string; mob: string }[] = [
  { id: 'wallet', desk: 'Wallet', mob: 'Wallet' },
  { id: 'offers', desk: 'Offers', mob: 'Offers' },
  { id: 'best', desk: 'Best for', mob: 'Best' },
  { id: 'backup', desk: 'Backup', mob: 'Backup' },
  { id: 'sources', desk: 'Sources', mob: 'Sources' },
]

export default function App() {
  const [wallet, setWallet] = useState<WalletCard[]>(() => loadWallet())
  const [snapshots, setSnapshots] = useState(() => loadSnapshots())
  const [tab, setTab] = useState<Tab>('wallet')
  const [adding, setAdding] = useState(false)
  const [openId, setOpenId] = useState<string | null>(null)

  useEffect(() => {
    const stored = loadWallet()
    if (JSON.stringify(stored) !== JSON.stringify(wallet)) {
      setSnapshots(pushSnapshot(stored))
    }
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
          {TABS.map(({ id, desk }) => (
            <button
              key={id}
              type="button"
              className={tab === id && !openId ? 'on' : ''}
              onClick={() => {
                setOpenId(null)
                setTab(id)
              }}
            >
              {desk}
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
            onBackup={() => setTab('backup')}
          />
        ) : tab === 'offers' ? (
          <OffersView wallet={wallet} onAdd={() => setAdding(true)} />
        ) : tab === 'best' ? (
          <BestForView wallet={wallet} onAdd={() => setAdding(true)} />
        ) : tab === 'backup' ? (
          <BackupView
            wallet={wallet}
            snapshots={snapshots}
            onReplace={setWallet}
            onMerge={setWallet}
          />
        ) : (
          <SourcesView />
        )}
      </main>

      <nav className="nav-mob">
        {TABS.map(({ id, mob }) => (
          <button
            key={id}
            type="button"
            className={tab === id && !openId ? 'on' : ''}
            onClick={() => {
              setOpenId(null)
              setTab(id)
            }}
          >
            {mob}
          </button>
        ))}
      </nav>

      {adding ? (
        <AddCard onClose={() => setAdding(false)} onAdd={addCard} />
      ) : null}
    </div>
  )
}
