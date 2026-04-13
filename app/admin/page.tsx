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
  Users,
  Clock,
  CheckCircle,
  AlertCircle,
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

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-bg-hero border-r border-border-card flex flex-col">
        {/* <div className="p-6 border-b border-border-card">
          <h1 className="font-serif text-2xl text-cream">Vigor Fructus</h1>
          <p className="text-sm text-text-body-light mt-1">Admin Panel</p>
        </div> */}
        
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {tabs.map((tab) => (
              <li key={tab.id}>
                <button
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-md transition-colors ${
                    activeTab === tab.id
                      ? 'bg-lime text-bg-dark font-medium'
                      : 'text-text-body-light hover:bg-bg-card hover:text-cream'
                  }`}
                >
                  <tab.icon className="w-5 h-5" />
                  {tab.label}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        <div className="p-4 border-t border-border-card">
          <Link
            href="/"
            className="flex items-center gap-2 text-text-body-light hover:text-lime transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            {t('admin.backToSite')}
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <header className="bg-bg-hero border-b border-border-card px-8 py-6">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-2xl font-serif text-cream">
              {tabs.find((t) => t.id === activeTab)?.label}
            </h2>
            <button
              onClick={handleLogout}
              className="px-4 py-2 rounded border border-border-card text-text-body-light hover:text-cream hover:bg-bg-card transition-colors"
            >
              {t('admin.logout')}
            </button>
          </div>
        </header>

        <div className="p-8">
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
    processingOrders: number
    completedOrders: number
    totalProducts: number
    b2bOrders: number
    b2cOrders: number
  } | undefined
  isLoading: boolean
  onNavigate: (tab: Tab) => void
}) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => (
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
      label: 'U obradi',
      value: stats?.processingOrders || 0,
      icon: AlertCircle,
      color: 'text-lime',
      bgColor: 'bg-lime/10',
    },
    {
      label: 'Isporučeno',
      value: stats?.completedOrders || 0,
      icon: CheckCircle,
      color: 'text-lime',
      bgColor: 'bg-lime/10',
    },
    {
      label: 'Ukupno proizvoda',
      value: stats?.totalProducts || 0,
      icon: Package,
      color: 'text-cream',
      bgColor: 'bg-cream/10',
    },
    {
      label: 'B2B porudžbine',
      value: stats?.b2bOrders || 0,
      icon: Users,
      color: 'text-lime',
      bgColor: 'bg-lime/10',
    },
    {
      label: 'B2C porudžbine',
      value: stats?.b2cOrders || 0,
      icon: Users,
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
