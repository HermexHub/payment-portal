import {
  ConfirmPaymentRequest,
  ConfirmPaymentResponse,
  OrderDetails,
  PaymentSession
} from './types'

const API_BASE = '/api/v1'

function generateCorrelationId(): string {
  return 'pay-' + Math.random().toString(36).substring(2, 11) + '-' + Date.now()
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers || {})
  if (!headers.has('Content-Type') && options.body) {
    headers.set('Content-Type', 'application/json')
  }
  if (!headers.has('x-correlation-id')) {
    headers.set('x-correlation-id', generateCorrelationId())
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers
  })

  if (!response.ok) {
    let errorMsg = `HTTP Error ${response.status}: ${response.statusText}`
    try {
      const errJson = await response.json()
      if (errJson.message) {
        errorMsg = Array.isArray(errJson.message) ? errJson.message.join(', ') : errJson.message
      }
    } catch {
      // Use fallback errorMsg
    }
    throw new Error(errorMsg)
  }

  return response.json() as Promise<T>
}

export async function fetchPaymentSession(orderId: string): Promise<PaymentSession> {
  return request<PaymentSession>(`/payments/${orderId}`)
}

export async function fetchOrderDetails(orderId: string): Promise<OrderDetails> {
  return request<OrderDetails>(`/orders/${orderId}`)
}

export async function confirmPaymentApi(
  orderId: string,
  data: ConfirmPaymentRequest
): Promise<ConfirmPaymentResponse> {
  const idempotencyKey = data.idempotencyKey || 'pay-idem-' + Math.random().toString(36).substring(2, 15)
  return request<ConfirmPaymentResponse>(`/payments/${orderId}/confirm`, {
    method: 'POST',
    headers: {
      'X-Idempotency-Key': idempotencyKey
    },
    body: JSON.stringify({
      ...data,
      idempotencyKey
    })
  })
}
