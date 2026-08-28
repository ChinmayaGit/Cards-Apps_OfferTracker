import { useEffect, useState } from 'react'
import type { CardProduct, PayApp, WalletApp, WalletCard } from './types'
import {
  loadApps,
  loadSnapshots,
  loadWallet,
  pushSnapshot,
  saveApps,
  saveWallet,
  uid,
} from './lib/storage'
import { refreshLiveOffers, type LiveStatus } from './lib/live'
import { AddCard } from './components/AddCard'
import { AddApp } from './components/AddApp'
import { RefreshBar } from './components/RefreshBar'
import { WalletView } from './views/Wallet'
import { OffersView } from './views/Offers'
import { AppsView } from './views/Apps'
import { AppDetailView } from './views/AppDetail'
import { BestForView } from './views/BestFor'
import { BackupView } from './views/Backup'
import { SourcesView } from './views/Sources'
import { CardDetailView } from './views/CardDetail'

type Tab = 'wallet' | 'apps' | 'offers' | 'best' | 'sources' | 'backup'

const TABS: { id: Tab; desk: string; mob: string }[] = [
  { id: 'wallet', desk: 'Wallet', mob: 'Wallet' },
  { id: 'apps', desk: 'Apps', mob: 'Apps' },
  { id: 'offers', desk: 'Offers', mob: 'Offers' },
  { id: 'best', desk: 'Best for', mob: 'Best' },
  { id: 'sources', desk: 'Sources', mob: 'Src' },
  { id: 'backup', desk: 'Backup', mob: 'Backup' },
]

const idleLive: LiveStatus = {
  state: 'loading',
  asOf: null,
  checkedAt: null,
  error: null,
  fromCache: false,
}

export default function App() {
  const [wallet, setWallet] = useState<WalletCard[]>(() => loadWallet())
  const [apps, setApps] = useState<WalletApp[]>(() => loadApps())
  const [snapshots, setSnapshots] = useState(() => loadSnapshots())
  const [tab, setTab] = useState<Tab>('wallet')
  const [adding, setAdding] = useState<null | 'card' | 'app'>(null)
  const [openId, setOpenId] = useState<string | null>(null)
  const [openAppId, setOpenAppId] = useState<string | null>(null)
  const [live, setLive] = useState<LiveStatus>(idleLive)
  const [liveEpoch, setLiveEpoch] = useState(0)

  useEffect(() => {
    const stored = loadWallet()
    if (JSON.stringify(stored) !== JSON.stringify(wallet)) {
      setSnapshots(pushSnapshot(stored))
    }
    saveWallet(wallet)
  }, [wallet])

  useEffect(() => {
    saveApps(apps)
  }, [apps])

  useEffect(() => {
    let cancelled = false
    void refreshLiveOffers().then((result) => {
      if (cancelled) return
      setLive(result)
      setLiveEpoch((n) => n + 1)
    })
    return () => {
      cancelled = true
    }
  }, [])

  async function reloadLive() {
    setLive((s) => ({ ...s, state: 'loading' }))
    const result = await refreshLiveOffers()
    setLive(result)
    setLiveEpoch((n) => n + 1)
  }

  const openCard = wallet.find((c) => c.id === openId) ?? null

  function go(id: Tab) {
    setOpenId(null)
    setOpenAppId(null)
    setTab(id)
  }

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
    setAdding(null)
    setTab('wallet')
    setOpenAppId(null)
  }

  function addApp(app: PayApp) {
    setApps((prev) => {
      if (prev.some((a) => a.appId === app.id)) return prev
      return [{ id: uid(), appId: app.id, addedAt: Date.now() }, ...prev]
    })
    setAdding(null)
    setTab('apps')
  }

  function removeCard(id: string) {
    setWallet((prev) => prev.filter((c) => c.id !== id))
    setOpenId(null)
  }

  function removeApp(appId: string) {
    setApps((prev) => prev.filter((a) => a.appId !== appId))
    setOpenAppId(null)
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
              className={tab === id && !openId && !openAppId ? 'on' : ''}
              onClick={() => go(id)}
            >
              {desk}
            </button>
          ))}
        </nav>
      </header>

      <RefreshBar live={live} onRefresh={() => void reloadLive()} />

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
        ) : openAppId ? (
          <AppDetailView
            appId={openAppId}
            wallet={wallet}
            onBack={() => setOpenAppId(null)}
            onAdd={() => setAdding('card')}
            onRemove={
              apps.some((a) => a.appId === openAppId)
                ? () => {
                    if (window.confirm('Remove this app from your list?')) {
                      removeApp(openAppId)
                    }
                  }
                : undefined
            }
          />
        ) : tab === 'wallet' ? (
          <WalletView
            wallet={wallet}
            onAdd={() => setAdding('card')}
            onOpen={setOpenId}
            onBackup={() => go('backup')}
          />
        ) : tab === 'apps' ? (
          <AppsView
            wallet={wallet}
            apps={apps}
            liveEpoch={liveEpoch}
            onOpen={setOpenAppId}
            onAdd={() => setAdding('app')}
          />
        ) : tab === 'offers' ? (
          <OffersView
            wallet={wallet}
            apps={apps}
            onAddCard={() => setAdding('card')}
            onAddApp={() => setAdding('app')}
            liveEpoch={liveEpoch}
          />
        ) : tab === 'best' ? (
          <BestForView
            wallet={wallet}
            apps={apps}
            onAddCard={() => setAdding('card')}
            onAddApp={() => setAdding('app')}
            liveEpoch={liveEpoch}
          />
        ) : tab === 'backup' ? (
          <BackupView
            wallet={wallet}
            apps={apps}
            snapshots={snapshots}
            onReplace={(cards, nextApps) => {
              setWallet(cards)
              if (nextApps) setApps(nextApps)
            }}
            onMerge={(cards, nextApps) => {
              setWallet(cards)
              if (nextApps) setApps(nextApps)
            }}
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
            className={tab === id && !openId && !openAppId ? 'on' : ''}
            onClick={() => go(id)}
          >
            {mob}
          </button>
        ))}
      </nav>

      {adding === 'card' ? (
        <AddCard onClose={() => setAdding(null)} onAdd={addCard} />
      ) : null}
      {adding === 'app' ? (
        <AddApp
          heldIds={new Set(apps.map((a) => a.appId))}
          onClose={() => setAdding(null)}
          onAdd={addApp}
        />
      ) : null}
    </div>
  )
}
