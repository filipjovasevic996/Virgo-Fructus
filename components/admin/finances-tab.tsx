'use client'

import { useState } from 'react'
import useSWR from 'swr'
import {
  Search,
  TrendingUp,
  TrendingDown,
  CreditCard,
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  Loader2,
  Calendar,
  DollarSign,
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import type { Transaction } from '@/lib/admin-store'

const fetcher = (url: string) => fetch(url).then((res) => res.json())

// Only two payment methods are actually supported by the shop:
//   - `card`             → WSPay (placeno sajt)
//   - `cash_on_delivery` → courier hands over cash (placeno pouzecem)
// Anything else coming from the DB falls back to UNKNOWN_METHOD below.
const paymentMethodConfig = {
  card: { label: 'Kartica', icon: CreditCard },
  cash_on_delivery: { label: 'Pouzećem', icon: Wallet },
}

const UNKNOWN_METHOD = { label: 'Nepoznato', icon: Wallet } as const

function formatPrice(price: number) {
  const safe = Number.isFinite(price) ? price : 0
  return new Intl.NumberFormat('sr-RS').format(safe) + ' RSD'
}

function formatDate(dateString: string | null | undefined) {
  if (!dateString) return '—'
  const d = new Date(dateString)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleDateString('sr-RS', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function FinancesTab() {
  const { data: transactionsData, isLoading: transactionsLoading } = useSWR(
    '/api/admin/transactions',
    fetcher
  )
  const { data: statsData, isLoading: statsLoading } = useSWR(
    '/api/admin/stats',
    fetcher
  )

  const [searchQuery, setSearchQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [methodFilter, setMethodFilter] = useState<string>('all')

  const transactions: Transaction[] = Array.isArray(transactionsData?.transactions)
    ? transactionsData.transactions
    : []

  const filteredTransactions = transactions.filter((txn) => {
    const q = searchQuery.toLowerCase()
    const orderNumber = (txn.orderNumber ?? '').toLowerCase()
    const customerName = (txn.customerName ?? '').toLowerCase()
    const matchesSearch = orderNumber.includes(q) || customerName.includes(q)
    const matchesType = typeFilter === 'all' || txn.type === typeFilter
    const matchesMethod =
      methodFilter === 'all' || txn.paymentMethod === methodFilter
    return matchesSearch && matchesType && matchesMethod
  })

  // Coerce in case the API ever returns numeric values as strings (Postgres
  // `numeric` columns serialize as string by default).
  const amountOf = (t: Transaction) => {
    const n = typeof t.amount === 'number' ? t.amount : Number.parseFloat(String(t.amount ?? 0))
    return Number.isFinite(n) ? n : 0
  }

  const totalPayments = transactions
    .filter((t) => t.type === 'payment' && t.status === 'completed')
    .reduce((sum, t) => sum + amountOf(t), 0)

  const totalRefunds = transactions
    .filter((t) => t.type === 'refund' && t.status === 'completed')
    .reduce((sum, t) => sum + amountOf(t), 0)

  const netRevenue = totalPayments - totalRefunds

  const paymentsByMethod = {
    card: transactions
      .filter((t) => t.paymentMethod === 'card' && t.type === 'payment' && t.status === 'completed')
      .reduce((sum, t) => sum + amountOf(t), 0),
    cash_on_delivery: transactions
      .filter((t) => t.paymentMethod === 'cash_on_delivery' && t.type === 'payment' && t.status === 'completed')
      .reduce((sum, t) => sum + amountOf(t), 0),
  }

  const isLoading = transactionsLoading || statsLoading

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 text-lime animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Financial Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-bg-hero rounded-lg p-6 border border-border-card">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-text-body-light">Ukupna uplata</span>
            <div className="p-2 rounded-md bg-lime/10">
              <TrendingUp className="w-5 h-5 text-lime" />
            </div>
          </div>
          <p className="text-2xl font-semibold text-lime">
            {formatPrice(totalPayments)}
          </p>
        </div>

        <div className="bg-bg-hero rounded-lg p-6 border border-border-card">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-text-body-light">Ukupan povraćaj</span>
            <div className="p-2 rounded-md bg-terra/10">
              <TrendingDown className="w-5 h-5 text-terra" />
            </div>
          </div>
          <p className="text-2xl font-semibold text-terra">
            {formatPrice(totalRefunds)}
          </p>
        </div>

        <div className="bg-bg-hero rounded-lg p-6 border border-border-card">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-text-body-light">Neto prihod</span>
            <div className="p-2 rounded-md bg-cream/10">
              <DollarSign className="w-5 h-5 text-cream" />
            </div>
          </div>
          <p className="text-2xl font-semibold text-cream">
            {formatPrice(netRevenue)}
          </p>
        </div>

        <div className="bg-bg-hero rounded-lg p-6 border border-border-card">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-text-body-light">Br. transakcija</span>
            <div className="p-2 rounded-md bg-lime/10">
              <Calendar className="w-5 h-5 text-lime" />
            </div>
          </div>
          <p className="text-2xl font-semibold text-lime">
            {transactions.length}
          </p>
        </div>
      </div>

      {/* Payment Methods Breakdown */}
      <div className="bg-bg-hero rounded-lg p-6 border border-border-card">
        <h3 className="text-lg font-serif text-cream mb-4">Pregled po načinu plaćanja</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(paymentsByMethod).map(([method, amount]) => {
            const config = paymentMethodConfig[method as keyof typeof paymentMethodConfig]
            const Icon = config.icon
            const percentage = totalPayments > 0 ? (amount / totalPayments) * 100 : 0

            return (
              <div key={method} className="bg-bg-card rounded-md p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 rounded-md bg-bg-hero">
                    <Icon className="w-5 h-5 text-lime" />
                  </div>
                  <span className="text-cream">{config.label}</span>
                </div>
                <p className="text-xl font-semibold text-cream mb-2">
                  {formatPrice(amount)}
                </p>
                <div className="w-full h-2 bg-bg-dark rounded-full overflow-hidden">
                  <div
                    className="h-full bg-lime rounded-full transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <p className="text-xs text-text-muted mt-1">
                  {percentage.toFixed(1)}% od ukupnog
                </p>
              </div>
            )
          })}
        </div>
      </div>

      {/* Transactions List */}
      <div className="space-y-4">
        <h3 className="text-lg font-serif text-cream">Istorija transakcija</h3>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Pretraži po broju porudžbine ili imenu..."
              className="pl-10 input-vigor"
            />
          </div>
          <div className="flex gap-4">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3 py-2 input-vigor min-w-[120px]"
            >
              <option value="all">Svi tipovi</option>
              <option value="payment">Uplate</option>
              <option value="refund">Povraćaji</option>
            </select>
            <select
              value={methodFilter}
              onChange={(e) => setMethodFilter(e.target.value)}
              className="px-3 py-2 input-vigor min-w-[140px]"
            >
              <option value="all">Svi metodi</option>
              <option value="card">Kartica</option>
              <option value="cash_on_delivery">Pouzećem</option>
            </select>
          </div>
        </div>

        {/* Transactions Table */}
        <div className="bg-bg-hero rounded-lg border border-border-card overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border-card">
                <th className="text-left px-6 py-4 text-sm font-medium text-text-body-light">
                  Tip
                </th>
                <th className="text-left px-6 py-4 text-sm font-medium text-text-body-light">
                  Porudžbina
                </th>
                <th className="text-left px-6 py-4 text-sm font-medium text-text-body-light">
                  Kupac
                </th>
                <th className="text-left px-6 py-4 text-sm font-medium text-text-body-light">
                  Metod
                </th>
                <th className="text-left px-6 py-4 text-sm font-medium text-text-body-light">
                  Datum
                </th>
                <th className="text-right px-6 py-4 text-sm font-medium text-text-body-light">
                  Iznos
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.map((txn) => {
                const method =
                  paymentMethodConfig[
                    txn.paymentMethod as keyof typeof paymentMethodConfig
                  ] ?? UNKNOWN_METHOD
                const MethodIcon = method.icon

                return (
                  <tr
                    key={txn.id}
                    className="border-b border-border-card last:border-b-0"
                  >
                    <td className="px-6 py-4">
                      <div
                        className={`inline-flex items-center gap-2 px-2 py-1 rounded ${
                          txn.type === 'payment'
                            ? 'bg-lime/10 text-lime'
                            : 'bg-terra/10 text-terra'
                        }`}
                      >
                        {txn.type === 'payment' ? (
                          <ArrowUpRight className="w-4 h-4" />
                        ) : (
                          <ArrowDownLeft className="w-4 h-4" />
                        )}
                        <span className="text-sm">
                          {txn.type === 'payment' ? 'Uplata' : 'Povraćaj'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-cream font-medium">
                        {txn.orderNumber ?? '—'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-text-body-light">
                        {txn.customerName ?? '—'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-text-body-light">
                        <MethodIcon className="w-4 h-4" />
                        <span>{method.label}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-text-body-light">
                        {formatDate(txn.createdAt)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span
                        className={`font-medium ${
                          txn.type === 'payment' ? 'text-lime' : 'text-terra'
                        }`}
                      >
                        {txn.type === 'payment' ? '+' : '-'}
                        {formatPrice(amountOf(txn))}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>

          {filteredTransactions.length === 0 && (
            <div className="py-12 text-center">
              <DollarSign className="w-12 h-12 mx-auto text-text-muted mb-4" />
              <p className="text-text-body-light">Nema transakcija za prikaz</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
