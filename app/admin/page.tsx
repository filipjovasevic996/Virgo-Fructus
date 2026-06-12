'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import useSWR from 'swr'
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  DollarSign,
  ArrowLeft,
  TrendingUp,
  Clock,
  CreditCard,
  Wallet,
  XCircle,
  Menu,
  X,
} from 'lucide-react'
import { ProductsTab } from '@/components/admin/products-tab'
import { OrdersTab } from '@/components/admin/orders-tab'
import { FinancesTab } from '@/components/admin/finances-tab'
import { useI18n } from '@/lib/i18n'

const fetcher = (url: string) => fetch(url).then((res) => res.json())

type Tab = 'dashboard' | 'products' | 'orders' | 'finances'

function formatPrice(price: number) {
  return new Intl.NumberFormat('sr-RS', {
    style: 'decimal',
    minimumFractionDigits: 0,
  }).format(price) + ' RSD'
}

export default function AdminPage() {
  const router = useRouter()
  const { t } = useI18n()
  const [activeTab, setActiveTab] = useState<Tab>('dashboard')
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const { data: stats, isLoading } = useSWR('/api/admin/stats', fetcher, {
    refreshInterval: 30000,
  })

  const tabs = [
    { id: 'dashboard' as const, label: t('admin.dashboard'), icon: LayoutDashboard },
    { id: 'products' as const, label: t('admin.products'), icon: Package },
    { id: 'orders' as const, label: t('admin.orders'), icon: ShoppingCart },
    { id: 'finances' as const, label: t('admin.finances'), icon: DollarSign },
  ]

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/auth/logout', { method: 'POST' })
    } catch (error) {
      console.error('Logout failed:', error)
    } finally {
      router.replace('/admin/login')
      router.refresh()
    }
  }

  const selectTab = (tab: Tab) => {
    setActiveTab(tab)
    setMobileNavOpen(false)
  }

  const NavInner = (
    <>
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {tabs.map((tab) => (
            <li key={tab.id}>
              <button
                type="button"
                onClick={() => selectTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-md transition-colors text-left ${
                  activeTab === tab.id
                    ? 'bg-lime text-bg-dark font-medium'
                    : 'text-text-body-light hover:bg-bg-card hover:text-cream'
                }`}
              >
                <tab.icon className="w-5 h-5 shrink-0" />
                {tab.label}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      <div className="p-4 border-t border-border-card">
        <Link
          href="/"
          className="flex items-center gap-2 text-text-body-light hover:text-lime transition-colors text-sm sm:text-base"
          onClick={() => setMobileNavOpen(false)}
        >
          <ArrowLeft className="w-4 h-4 shrink-0" />
          {t('admin.backToSite')}
        </Link>
      </div>
    </>
  )

  return (
    <div className="flex min-h-screen min-w-0 bg-bg-dark text-cream">
      {/* Mobile overlay */}
      {mobileNavOpen && (
        <button
          type="button"
          aria-label="Zatvori meni"
          className="fixed inset-0 z-40 bg-black/60 lg:hidden"
          onClick={() => setMobileNavOpen(false)}
        />
      )}

      {/* Sidebar — drawer on mobile, fixed column on lg */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[min(18rem,88vw)] max-w-sm flex-col bg-bg-hero border-r border-border-card shadow-xl transition-transform duration-200 ease-out lg:static lg:z-0 lg:w-64 lg:max-w-none lg:translate-x-0 lg:shadow-none ${
          mobileNavOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {NavInner}
      </aside>

      {/* Main Content */}
      <main className="flex min-h-screen min-w-0 flex-1 flex-col overflow-auto bg-bg-dark lg:min-h-screen">
        <header className="sticky top-0 z-30 bg-bg-hero border-b border-border-card px-4 py-4 sm:px-6 sm:py-6">
          <div className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <button
                type="button"
                aria-expanded={mobileNavOpen}
                aria-label={mobileNavOpen ? 'Zatvori meni' : 'Otvori meni'}
                className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-border-card text-cream hover:bg-bg-card lg:hidden"
                onClick={() => setMobileNavOpen((open) => !open)}
              >
                {mobileNavOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
              <h2 className="truncate text-lg font-serif text-cream sm:text-2xl">
                {tabs.find((tb) => tb.id === activeTab)?.label}
              </h2>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="shrink-0 px-3 py-2 rounded border border-border-card text-sm text-text-body-light hover:text-cream hover:bg-bg-card transition-colors sm:px-4"
            >
              {t('admin.logout')}
            </button>
          </div>
        </header>

        <div className="flex-1 p-4 sm:p-6 lg:p-8">
          {activeTab === 'dashboard' && (
            <DashboardContent stats={stats} isLoading={isLoading} onNavigate={setActiveTab} />
          )}
          {activeTab === 'products' && <ProductsTab />}
          {activeTab === 'orders' && <OrdersTab />}
          {activeTab === 'finances' && <FinancesTab />}
        </div>
      </main>
    </div>
  )
}

function DashboardContent({
  stats,
  isLoading,
  onNavigate,
}: {
  stats: {
    totalRevenue: number
    totalOrders: number
    pendingOrders: number
    paidOrders: number
    shippedOrders: number
    cancelledOrders: number
    totalProducts: number
  } | undefined
  isLoading: boolean
  onNavigate: (tab: Tab) => void
}) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(7)].map((_, i) => (
          <div
            key={i}
            className="bg-bg-hero rounded-lg p-6 animate-pulse"
          >
            <div className="h-4 bg-bg-card rounded w-24 mb-4" />
            <div className="h-8 bg-bg-card rounded w-32" />
          </div>
        ))}
      </div>
    )
  }

  const statCards = [
    {
      label: 'Ukupan prihod',
      value: formatPrice(stats?.totalRevenue || 0),
      icon: TrendingUp,
      color: 'text-lime',
      bgColor: 'bg-lime/10',
    },
    {
      label: 'Ukupno porudžbina',
      value: stats?.totalOrders || 0,
      icon: ShoppingCart,
      color: 'text-cream',
      bgColor: 'bg-cream/10',
    },
    {
      label: 'Na čekanju',
      value: stats?.pendingOrders || 0,
      icon: Clock,
      color: 'text-terra',
      bgColor: 'bg-terra/10',
    },
    {
      label: 'Plaćeno – sajt',
      value: stats?.paidOrders || 0,
      icon: CreditCard,
      color: 'text-lime',
      bgColor: 'bg-lime/10',
    },
    {
      label: 'Plaćeno – pouzećem',
      value: stats?.shippedOrders || 0,
      icon: Wallet,
      color: 'text-lime',
      bgColor: 'bg-lime/10',
    },
    {
      label: 'Otkazano',
      value: stats?.cancelledOrders || 0,
      icon: XCircle,
      color: 'text-terra',
      bgColor: 'bg-terra/10',
    },
    {
      label: 'Ukupno proizvoda',
      value: stats?.totalProducts || 0,
      icon: Package,
      color: 'text-cream',
      bgColor: 'bg-cream/10',
    },
  ]

  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => (
          <div
            key={stat.label}
            className="bg-bg-hero rounded-lg p-6 border border-border-card"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-text-body-light">{stat.label}</span>
              <div className={`p-2 rounded-md ${stat.bgColor}`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
            </div>
            <p className={`text-2xl font-semibold ${stat.color}`}>
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-bg-hero rounded-lg p-6 border border-border-card">
        <h3 className="text-lg font-serif text-cream mb-4">Brze akcije</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => onNavigate('products')}
            className="flex items-center gap-3 p-4 bg-bg-card rounded-md text-cream hover:bg-border-card transition-colors"
          >
            <Package className="w-5 h-5 text-lime" />
            <span>Dodaj novi proizvod</span>
          </button>
          <button
            onClick={() => onNavigate('orders')}
            className="flex items-center gap-3 p-4 bg-bg-card rounded-md text-cream hover:bg-border-card transition-colors"
          >
            <ShoppingCart className="w-5 h-5 text-lime" />
            <span>Pregledaj porudžbine</span>
          </button>
          <button
            onClick={() => onNavigate('finances')}
            className="flex items-center gap-3 p-4 bg-bg-card rounded-md text-cream hover:bg-border-card transition-colors"
          >
            <DollarSign className="w-5 h-5 text-lime" />
            <span>Pregled transakcija</span>
          </button>
        </div>
      </div>
    </div>
  )
}
