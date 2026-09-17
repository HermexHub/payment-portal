export type PaymentScenario =
  | 'SUCCESS'
  | 'INSUFFICIENT_FUNDS'
  | 'CARD_EXPIRED'
  | 'BANK_DECLINE'
  | 'TIMEOUT'

export interface PaymentSession {
  paymentId: string
  orderId: string
  userId: string
  amount: number
  currency: string
  status: string
  failureReason?: string
  createdAt: string
  updatedAt?: string
}

export interface OrderItem {
  id?: string
  productId: string
  quantity: number
  price: number
  productName?: string
}

export interface OrderDetails {
  id: string
  userId?: string
  status: string
  totalAmount: number
  currency?: string
  deliveryAddress?: string
  items?: OrderItem[]
  createdAt?: string
}

export interface ConfirmPaymentRequest {
  cardNumber: string
  cardHolder: string
  expiry: string
  cvv: string
  scenario?: PaymentScenario
  idempotencyKey?: string
}

export interface ConfirmPaymentResponse {
  paymentId: string
  orderId: string
  status: 'SUCCEEDED' | 'FAILED' | 'PENDING'
  amount: number
  currency: string
  failureReason?: string
  processedAt: string
}
