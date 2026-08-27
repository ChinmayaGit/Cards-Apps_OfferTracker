export type PayStatus = 'yes' | 'no' | 'maybe'

export type PayMethod = 'swipe' | 'tapCard' | 'phoneNfc' | 'upi' | 'online'

export type Category =
  | 'movies'
  | 'flights'
  | 'hotels'
  | 'dining'
  | 'groceries'
  | 'fuel'
  | 'online'
  | 'upi'
  | 'lounge'
  | 'shopping'
  | 'entertainment'
  | 'bills'
  | 'travel'

export type Network = 'Visa' | 'Mastercard' | 'RuPay' | 'Amex' | 'Diners'

export type CardKind = 'credit' | 'debit'

export interface Offer {
  id: string
  title: string
  category: Category
  headline: string
  howToUse: string[]
  where: string[]
  payment: Record<PayMethod, PayStatus>
  paymentNotes: Partial<Record<PayMethod, string>>
  hidden: string[]
  cap?: string
  source: string
}

export interface CardProduct {
  id: string
  bankId: string
  name: string
  network: Network
  kind: CardKind
  annualFee: string
  bestFor: Category[]
  accent: string
  accent2: string
  blurb: string
  aliases?: string[]
  offers: Offer[]
}

export interface Bank {
  id: string
  name: string
  short: string
}

export interface WalletCard {
  id: string
  productId: string
  last4: string
  nickname: string
  addedAt: number
}

export interface OfferSource {
  name: string
  kind: string
  url: string
  note: string
}
