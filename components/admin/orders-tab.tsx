'use client'

import { useState, type ComponentType } from 'react'
import useSWR, { mutate } from 'swr'
import {
  Search,
  ChevronDown,
  ChevronUp,
  Package,
  XCircle,
  Clock,
  Loader2,
  User,
  MapPin,
  Phone,
  Mail,
  CreditCard,
  Banknote,
  Building2,
  DollarSign,
} from 'lucide-react'
import { Input } from '@/components/ui/input'

const fetcher = (url: string) => fetch(url).then((res) => res.json())

interface OrderItem {
  id: string
  productName: string
  quantity: number
  price: string
}

type OrderStatus = 'PENDING' | 'PAID' | 'FAILED' | 'SHIPPED' | 'CANCELLED'
type PaymentMethod = 'card' | 'cash_on_delivery' | 'bank_transfer'

interface DBOrder {
  id: string
  customerName: string | null
  customerEmail: string | null
  phone: string | null
  city: string
  address: string | null
  postalCode: string | null
  totalAmount: string
  status: OrderStatus
  notes: string | null
  createdAt: string
  items: OrderItem[]
  /** Most recent payment method for this order, joined server-side. */
  paymentMethod: PaymentMethod | string | null
}

type StatusDisplay = {
  label: string
  color: string
  icon: ComponentType<{ className?: string }>
}

const PAID_BY_METHOD: Record<string, StatusDisplay> = {
  card: { label: 'Plaćeno – sajt', color: 'bg-lime/20 text-lime', icon: CreditCard },
  cash_on_delivery: { label: 'Plaćeno – pouzećem', color: 'bg-lime/20 text-lime', icon: Banknote },
  bank_transfer: { label: 'Plaćeno – uplata', color: 'bg-lime/20 text-lime', icon: Building2 },
}

/**
 * Combines `orders.status` with the joined `payments.payment_method` to
 * derive what the admin actually wants to see. PAID and SHIPPED both render
 * as "paid" — they only differ by method (sajt = card, pouzećem = COD).
 *
 * Falls back gracefully when no payment row exists yet by inferring the
 * method from the status itself (PAID ⇒ card, SHIPPED ⇒ COD), matching the
 * auto-create logic in the orders API.
 */
function resolveStatusDisplay(
  status: OrderStatus,
  paymentMethod: DBOrder['paymentMethod'],
): StatusDisplay {
  if (status === 'PAID' || status === 'SHIPPED') {
    const inferred =
      paymentMethod ??
      (status === 'PAID' ? 'card' : 'cash_on_delivery')
    return (
      PAID_BY_METHOD[inferred] ?? {
        label: 'Plaćeno',
        color: 'bg-lime/20 text-lime',
        icon: DollarSign,
      }
    )
  }
  if (status === 'PENDING') {
    return { label: 'Na čekanju', color: 'bg-terra/20 text-terra', icon: Clock }
  }
  if (status === 'CANCELLED') {
    return { label: 'Otkazano', color: 'bg-terra/20 text-terra', icon: XCircle }
  }
  if (status === 'FAILED') {
    return { label: 'Neuspešno', color: 'bg-terra/20 text-terra', icon: XCircle }
  }
  return { label: String(status), color: 'bg-cream/20 text-cream', icon: Package }
}

function formatPrice(price: number | string) {
  const num = typeof price === 'string' ? parseFloat(price) : price
  return new Intl.NumberFormat('sr-RS').format(num) + ' RSD'
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('sr-RS', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function OrdersTab() {
  const { data, isLoading } = useSWR('/api/admin/orders', fetcher)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null)

  const orders: DBOrder[] = data?.orders || []

  const filteredOrders = orders.filter((order) => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      const matchesSearch =
        (order.customerName || '').toLowerCase().includes(q) ||
        (order.customerEmail || '').toLowerCase().includes(q) ||
        (order.phone || '').includes(q) ||
        order.id.toLowerCase().includes(q)
      if (!matchesSearch) return false
    }
    if (statusFilter !== 'all' && order.status !== statusFilter) return false
    return true
  })

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      await fetch('/api/admin/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: orderId, status: newStatus }),
      })
      mutate('/api/admin/orders')
      mutate('/api/admin/stats')
      // Status changes can auto-create a payment row, so the Finances tab
      // must re-fetch to show the new transaction.
      mutate('/api/admin/transactions')
    } catch (error) {
      console.error('Status update error:', error)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 text-lime animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Pretraži po imenu, emailu ili telefonu..."
            className="pl-10 input-vigor"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 input-vigor min-w-[180px]"
        >
          <option value="all">Svi statusi</option>
          <option value="PENDING">Na čekanju</option>
          <option value="PAID">Plaćeno – sajt</option>
          <option value="SHIPPED">Plaćeno – pouzećem</option>
          <option value="FAILED">Neuspešno</option>
          <option value="CANCELLED">Otkazano</option>
        </select>
      </div>

      <p className="text-text-body-light">
        Prikazano {filteredOrders.length} od {orders.length} porudžbina
      </p>

      <div className="space-y-4">
        {filteredOrders.map((order) => {
          const status = resolveStatusDisplay(order.status, order.paymentMethod)
          const StatusIcon = status.icon
          const isExpanded = expandedOrder === order.id
          const shortId = order.id.slice(0, 8).toUpperCase()

          return (
            <div
              key={order.id}
              className="bg-bg-hero rounded-lg border border-border-card overflow-hidden"
            >
              <div
                className="p-4 cursor-pointer hover:bg-bg-card/50 transition-colors"
                onClick={() => setExpandedOrder(isExpanded ? null : order.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-md ${status.color}`}>
                      <StatusIcon className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-3">
                        <span className="font-medium text-cream font-mono text-sm">
                          #{shortId}
                        </span>
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${status.color}`}>
                          {status.label}
                        </span>
                      </div>
                      <p className="text-sm text-text-body-light">
                        {order.customerName ?? 'Podaci obrisani (GDPR)'} — {formatDate(order.createdAt)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-medium text-cream">
                      {formatPrice(order.totalAmount)}
                    </span>
                    {isExpanded ? (
                      <ChevronUp className="w-5 h-5 text-text-body-light" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-text-body-light" />
                    )}
                  </div>
                </div>
              </div>

              {isExpanded && (
                <div className="border-t border-border-card p-4 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-3">
                      <h4 className="text-sm font-medium text-cream flex items-center gap-2">
                        <User className="w-4 h-4" />
                        Podaci o kupcu
                      </h4>
                      <div className="space-y-2 text-sm">
                        {order.customerEmail ? (
                          <>
                            <p className="text-cream">{order.customerName}</p>
                            <p className="text-text-body-light flex items-center gap-2">
                              <Mail className="w-3 h-3" />
                              {order.customerEmail}
                            </p>
                            <p className="text-text-body-light flex items-center gap-2">
                              <Phone className="w-3 h-3" />
                              {order.phone}
                            </p>
                          </>
                        ) : (
                          <p className="text-text-muted italic">
                            Podaci o kupcu obrisani nakon {'>'}90 dana (GDPR)
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <h4 className="text-sm font-medium text-cream flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        Adresa dostave
                      </h4>
                      <div className="text-sm text-text-body-light space-y-1">
                        {order.address ? (
                          <>
                            <p>{order.address}</p>
                            <p>{order.postalCode ? `${order.postalCode} ` : ''}{order.city}</p>
                          </>
                        ) : (
                          <p>{order.city}</p>
                        )}
                      </div>
                      {order.notes && (
                        <p className="text-xs text-terra italic mt-2">
                          Napomena: {order.notes}
                        </p>
                      )}
                    </div>

                    <div className="space-y-3">
                      <h4 className="text-sm font-medium text-cream">
                        Promeni status
                      </h4>
                      <select
                        value={order.status}
                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                        className="w-full px-3 py-2 input-vigor"
                      >
                        <option value="PENDING">Na čekanju</option>
                        <option value="PAID">Plaćeno (sajt)</option>
                        <option value="SHIPPED">Plaćeno (pouzećem)</option>
                        <option value="CANCELLED">Otkazano</option>
                      </select>
                      <p className="text-xs text-text-muted">
                        Postavljanje na "Plaćeno" automatski beleži uplatu u Finansijama ako još nije zabeležena.
                      </p>
                    </div>
                  </div>

                  {order.items && order.items.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="text-sm font-medium text-cream">
                        Stavke porudžbine
                      </h4>
                      <div className="bg-bg-card rounded-md overflow-hidden">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b border-border-card">
                              <th className="text-left px-4 py-2 text-xs text-text-muted">Proizvod</th>
                              <th className="text-center px-4 py-2 text-xs text-text-muted">Količina</th>
                              <th className="text-right px-4 py-2 text-xs text-text-muted">Cena</th>
                              <th className="text-right px-4 py-2 text-xs text-text-muted">Ukupno</th>
                            </tr>
                          </thead>
                          <tbody>
                            {order.items.map((item, index) => {
                              const itemPrice = parseFloat(item.price)
                              return (
                                <tr key={index} className="border-b border-border-card last:border-b-0">
                                  <td className="px-4 py-2 text-sm text-cream">{item.productName}</td>
                                  <td className="px-4 py-2 text-sm text-text-body-light text-center">{item.quantity}</td>
                                  <td className="px-4 py-2 text-sm text-text-body-light text-right">{formatPrice(itemPrice)}</td>
                                  <td className="px-4 py-2 text-sm text-cream text-right">{formatPrice(itemPrice * item.quantity)}</td>
                                </tr>
                              )
                            })}
                          </tbody>
                          <tfoot>
                            <tr className="border-t border-border-muted">
                              <td colSpan={3} className="px-4 py-2 text-sm font-medium text-cream text-right">Ukupno:</td>
                              <td className="px-4 py-2 text-sm font-medium text-lime text-right">{formatPrice(order.totalAmount)}</td>
                            </tr>
                          </tfoot>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}

        {filteredOrders.length === 0 && (
          <div className="bg-bg-hero rounded-lg border border-border-card p-12 text-center">
            <Package className="w-12 h-12 mx-auto text-text-muted mb-4" />
            <p className="text-text-body-light">Nema porudžbina za prikaz</p>
          </div>
        )}
      </div>
    </div>
  )
}
