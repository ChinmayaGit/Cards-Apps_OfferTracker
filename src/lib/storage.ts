import type { WalletCard } from '../types'

const KEY = 'offerfolio.wallet.v1'

export function loadWallet(): WalletCard[] {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as WalletCard[]
    if (!Array.isArray(parsed)) return []
    return parsed.filter((c) => c && typeof c.productId === 'string')
  } catch {
    return []
  }
}

export function saveWallet(cards: WalletCard[]): void {
  localStorage.setItem(KEY, JSON.stringify(cards))
}

export function uid(): string {
  return crypto.randomUUID()
}
