import type { CardProduct, Offer, PayAppId, WalletCard } from '../types'
import { getApp } from './apps'
import { getBank, getProduct, PRODUCTS } from './catalog'

const USE: Record<PayAppId, RegExp> = {
  'amazon-pay': /\bamazon(\.in)?\b|amazon pay|amazon app/i,
  pop: /\bpop(coins|shop|club|\s*upi|\s*app)?\b/i,
  cred: /\bcred\b/i,
  gpay: /\bgpay\b|google pay|\bg pay\b/i,
  phonepe: /phonepe|phone pe/i,
  paytm: /\bpaytm\b/i,
  'tata-neu': /tata neu|neucoins?|neupass|neu plus|neu infinity|neu card|neu upi/i,
  cheq: /\bcheq\b/i,
}

const TRAP: Record<PayAppId, RegExp> = {
  'amazon-pay': /not amazon pay|amazon pay (balance|wallet|later)|funding amazon pay|amazon pay wallet/i,
  pop: /not pop/i,
  cred: /via cred|excluded.*cred|education via cred/i,
  gpay: /not (from )?gpay|gpay path is only|not phonepe\/gpay as the upi/i,
  phonepe: /not phonepe|other upi apps may earn less/i,
  paytm: /not paytm|paytm\/amazon pay load|paytm wallet/i,
  'tata-neu': /not infinity|not tata neu/i,
  cheq: /via cred\/cheq|education via cred\/cheq|cheq\/mobikwik/i,
}

export type AppHitKind = 'use' | 'trap'

export function offerHitsApp(offer: Offer, appId: PayAppId): AppHitKind | null {
  if (offer.viaApps?.includes(appId)) return 'use'
  const blob = `${offer.title}\n${offer.headline}\n${offer.where.join(' ')}\n${offer.howToUse.join(' ')}`
  const hidden = offer.hidden.join(' ')
  const trap = TRAP[appId]
  const use = USE[appId]
  const trapHit = trap.test(hidden) || trap.test(blob)
  const useHit = use.test(blob) || use.test(hidden)
  if (trapHit && !use.test(offer.where.join(' '))) return 'trap'
  if (trapHit && useHit && /not |never |kill |die |excluded|do not pick/i.test(blob + hidden)) {
    if (use.test(offer.where.join(' '))) return 'use'
    return 'trap'
  }
  if (useHit) return 'use'
  return null
}

export function cardOffersForApp(product: CardProduct, appId: PayAppId, kind?: AppHitKind): Offer[] {
  return product.offers.filter((o) => {
    const hit = offerHitsApp(o, appId)
    return kind ? hit === kind : hit !== null
  })
}

export function isRupayCredit(product: CardProduct): boolean {
  return product.kind === 'credit' && product.network === 'RuPay'
}

export function scoreCardForApp(product: CardProduct, appId: PayAppId): number {
  const app = getApp(appId)
  if (!app) return 0
  let s = 0
  if (app.partnerProductIds.includes(product.id)) s += 40
  s += cardOffersForApp(product, appId, 'use').length * 12
  s -= cardOffersForApp(product, appId, 'trap').length * 4
  if (
    (appId === 'gpay' || appId === 'phonepe' || appId === 'paytm' || appId === 'cred' || appId === 'pop') &&
    isRupayCredit(product)
  ) {
    s += 10
  }
  if (appId === 'tata-neu' && product.id.startsWith('hdfc-neu')) s += 20
  if (appId === 'amazon-pay' && product.id === 'icici-amazon') s += 20
  if (appId === 'phonepe' && product.id.includes('phonepe')) s += 20
  if (appId === 'pop' && product.id.includes('pop')) s += 20
  return s
}

export function walletPicksForApp(wallet: WalletCard[], appId: PayAppId) {
  return wallet
    .map((w) => {
      const product = getProduct(w.productId)
      if (!product) return null
      const score = scoreCardForApp(product, appId)
      const use = cardOffersForApp(product, appId, 'use')
      const trap = cardOffersForApp(product, appId, 'trap')
      if (score <= 0 && use.length === 0 && trap.length === 0) return null
      return { w, product, score, use, trap }
    })
    .filter((x) => x !== null)
    .sort((a, b) => b.score - a.score)
}

export function catalogPicksForApp(wallet: WalletCard[], appId: PayAppId, limit = 5) {
  const held = new Set(wallet.map((c) => c.productId))
  return PRODUCTS.filter((p) => !held.has(p.id) && scoreCardForApp(p, appId) >= 40)
    .sort((a, b) => scoreCardForApp(b, appId) - scoreCardForApp(a, appId))
    .slice(0, limit)
    .map((product) => ({
      product,
      bank: getBank(product.bankId),
      score: scoreCardForApp(product, appId),
    }))
}
