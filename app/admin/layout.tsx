import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Admin Panel | Vigor Fructus',
  description: 'Upravljajte proizvodima, porudžbinama i finansijama',
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-bg-dark">
      {children}
    </div>
  )
}
