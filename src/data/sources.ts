import type { OfferSource } from '../types'

export const CATALOG_AS_OF = 'August 2026'

export const OFFER_SOURCES: OfferSource[] = [
  {
    name: 'Your bank app / netbanking',
    kind: 'Official',
    url: 'https://www.rupay.co.in',
    note: 'HDFC MyCards, Axis Mobile, iMobile Pay, YONO, IndusMobile. Offers, vouchers and milestone trackers live here first.',
  },
  {
    name: 'Card MITC & offers page',
    kind: 'Official',
    url: 'https://www.rbi.org.in',
    note: 'Most “hidden” rules — caps, excluded MCCs, EMI, wallet loads — are in the Most Important Terms & Conditions PDF, not the marketing page.',
  },
  {
    name: 'RuPay Credit on UPI',
    kind: 'Network',
    url: 'https://www.rupay.co.in/rupay-credit-on-upi',
    note: 'Only RuPay credit can be linked to UPI. Visa / Mastercard / Amex will never earn via QR scan.',
  },
  {
    name: 'BookMyShow Offers',
    kind: 'Movies',
    url: 'https://in.bookmyshow.com/offers',
    note: 'BOGO and bank movie deals. Almost always require paying on BMS with that card — not box-office tap, not UPI.',
  },
  {
    name: 'MakeMyTrip / Cleartrip / Ixigo',
    kind: 'Flights',
    url: 'https://www.makemytrip.com/offers/',
    note: 'Bank flight coupons are checkout-code + that card as the payment method. Airline UPI at the airport does not count.',
  },
  {
    name: 'Amazon & Flipkart bank offers',
    kind: 'Shopping',
    url: 'https://www.amazon.in',
    note: 'Select the co-branded card at payment. Funding Amazon Pay wallet or paying Flipkart via UPI usually kills the extra % .',
  },
  {
    name: 'Amazon Pay',
    kind: 'App',
    url: 'https://www.amazon.in/amazonpay/home',
    note: 'ICICI Amazon Pay card, bank-offer tiles, bills. Wallet load is where most 5% cards die.',
  },
  {
    name: 'POP Club',
    kind: 'App',
    url: 'https://popclub.co/',
    note: 'POP UPI, POPshop, YES BANK POP Club RuPay. Coins and shop tiles rotate in the app.',
  },
  {
    name: 'CRED',
    kind: 'App',
    url: 'https://cred.club/',
    note: 'Card bills, Store coupons, CRED UPI. Pay bills from a bank account, not another credit card.',
  },
  {
    name: 'Google Pay',
    kind: 'UPI apps',
    url: 'https://pay.google.com',
    note: 'In-app offer tiles, plus RuPay credit linking. Phone tap (NFC) is a different rail from UPI QR.',
  },
  {
    name: 'PhonePe',
    kind: 'App',
    url: 'https://www.phonepe.com/',
    note: 'QR, Rewards, Switch, HDFC Uno/Ultimo. In-app deals are not Millennia 5%.',
  },
  {
    name: 'Paytm',
    kind: 'App',
    url: 'https://paytm.com/',
    note: 'UPI, movies, travel mini-apps. Adding money to the Paytm wallet usually earns 0% on cashback cards.',
  },
  {
    name: 'Tata Neu',
    kind: 'App',
    url: 'https://www.tataneu.com/',
    note: 'NeuCoins, Tata brands, Neu UPI ID. GPay-linked Neu Plus is only the base UPI slab.',
  },
  {
    name: 'CheQ',
    kind: 'App',
    url: 'https://cheq.one/',
    note: 'Card bill pay, CheQ Chips, vouchers, Wisor. Confirm chip rate on the pay screen.',
  },
  {
    name: 'EazyDiner / Swiggy / Zomato',
    kind: 'Dining',
    url: 'https://www.eazydiner.com',
    note: 'Co-brand extra discount is inside that app’s payment step. Restaurant QR via UPI is a different offer (or none).',
  },
  {
    name: 'Scapia / SmartBuy / GyFTR',
    kind: 'Travel & vouchers',
    url: 'https://smartbuy.hdfcbank.com',
    note: 'HDFC SmartBuy, Axis Travel Edge, Amex Reward multiplier, GyFTR gift cards — often the real travel value, with their own exclusions.',
  },
  {
    name: 'CardInsider · BankBazaar · Paisabazaar',
    kind: 'Trackers',
    url: 'https://cardinsider.com',
    note: 'Good for comparing current-month intern offers. Always cross-check the bank page before you pay — aggregators lag.',
  },
]
