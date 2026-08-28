import type { LiveOffersFile, Offer, PayAppId, PayMethod, PayStatus } from '../types'
import { PAY_APP_IDS, applyAppOfferOverlay } from '../data/apps'
import { applyCardOfferOverlay } from '../data/catalog'

const CACHE_KEY = 'offerfolio.live.v1'
const PAY_KEYS: PayMethod[] = ['swipe', 'tapCard', 'phoneNfc', 'upi', 'online']

export type LiveStatus = {
  state: 'idle' | 'loading' | 'ok' | 'error'
  asOf: string | null
  checkedAt: number | null
  error: string | null
  fromCache: boolean
}

const defaultPayment: Record<PayMethod, PayStatus> = {
  swipe: 'no',
  tapCard: 'no',
  phoneNfc: 'no',
  upi: 'maybe',
  online: 'yes',
}

function asOffer(raw: unknown): Offer | null {
  if (!raw || typeof raw !== 'object') return null
  const x = raw as Partial<Offer>
  if (typeof x.id !== 'string' || !x.id) return null
  if (typeof x.title !== 'string' || !x.title) return null
  const payment = { ...defaultPayment }
  if (x.payment && typeof x.payment === 'object') {
    for (const k of PAY_KEYS) {
      const v = x.payment[k]
      if (v === 'yes' || v === 'no' || v === 'maybe') payment[k] = v
    }
  }
  return {
    id: x.id,
    title: x.title,
    category: x.category ?? 'online',
    headline: typeof x.headline === 'string' ? x.headline : x.title,
    howToUse: Array.isArray(x.howToUse) ? x.howToUse.map(String) : ['Open the app and read the live tile.'],
    where: Array.isArray(x.where) ? x.where.map(String) : [],
    payment,
    paymentNotes: x.paymentNotes && typeof x.paymentNotes === 'object' ? x.paymentNotes : {},
    hidden: Array.isArray(x.hidden) ? x.hidden.map(String) : [],
    cap: typeof x.cap === 'string' ? x.cap : undefined,
    source: typeof x.source === 'string' ? x.source : 'Live overlay',
    viaApps: Array.isArray(x.viaApps) ? (x.viaApps as PayAppId[]) : undefined,
    fresh: true,
  }
}

function parseBundle(raw: unknown): LiveOffersFile | null {
  if (!raw || typeof raw !== 'object') return null
  const x = raw as LiveOffersFile
  if (typeof x.asOf !== 'string' || !x.asOf) return null
  const apps: LiveOffersFile['apps'] = {}
  if (x.apps && typeof x.apps === 'object') {
    for (const id of PAY_APP_IDS) {
      const list = x.apps[id]
      if (!Array.isArray(list)) continue
      const offers = list.map(asOffer).filter((o): o is Offer => o !== null)
      if (offers.length) apps[id] = offers
    }
  }
  const cardOffers: Record<string, Offer[]> = {}
  if (x.cardOffers && typeof x.cardOffers === 'object') {
    for (const [productId, list] of Object.entries(x.cardOffers)) {
      if (!Array.isArray(list)) continue
      const offers = list.map(asOffer).filter((o): o is Offer => o !== null)
      if (offers.length) cardOffers[productId] = offers
    }
  }
  return { asOf: x.asOf, apps, cardOffers }
}

function applyBundle(bundle: LiveOffersFile): void {
  applyAppOfferOverlay(bundle.apps ?? {})
  applyCardOfferOverlay(bundle.cardOffers ?? {})
}

function readCache(): LiveOffersFile | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY)
    if (!raw) return null
    return parseBundle(JSON.parse(raw) as unknown)
  } catch {
    return null
  }
}

function writeCache(bundle: LiveOffersFile): void {
  localStorage.setItem(CACHE_KEY, JSON.stringify(bundle))
}

async function fetchJson(url: string): Promise<unknown> {
  const res = await fetch(url, { cache: 'no-store' })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json() as Promise<unknown>
}

export async function refreshLiveOffers(): Promise<LiveStatus> {
  const cached = readCache()
  if (cached) applyBundle(cached)

  const urls = [`/live-offers.json?t=${Date.now()}`]
  const remote = import.meta.env.VITE_LIVE_OFFERS_URL
  if (typeof remote === 'string' && remote.startsWith('http')) urls.unshift(`${remote}${remote.includes('?') ? '&' : '?'}t=${Date.now()}`)

  let lastError: string | null = null
  for (const url of urls) {
    try {
      const bundle = parseBundle(await fetchJson(url))
      if (!bundle) {
        lastError = 'Live file was not valid JSON offers.'
        continue
      }
      applyBundle(bundle)
      writeCache(bundle)
      return {
        state: 'ok',
        asOf: bundle.asOf,
        checkedAt: Date.now(),
        error: null,
        fromCache: false,
      }
    } catch (e) {
      lastError = e instanceof Error ? e.message : 'Fetch failed'
    }
  }

  if (cached) {
    return {
      state: 'ok',
      asOf: cached.asOf,
      checkedAt: Date.now(),
      error: lastError,
      fromCache: true,
    }
  }

  applyAppOfferOverlay({})
  applyCardOfferOverlay({})
  return {
    state: 'error',
    asOf: null,
    checkedAt: Date.now(),
    error: lastError ?? 'Could not load live offers.',
    fromCache: false,
  }
}

export function formatCheckedAt(ts: number | null): string {
  if (!ts) return ''
  return new Date(ts).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })
}
