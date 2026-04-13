'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useI18n } from '@/lib/i18n'

export default function AdminLoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { t } = useI18n()
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const nextPath = searchParams.get('next') || '/admin'

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setSubmitting(true)
    setError('')

    try {
      const response = await fetch('/api/admin/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password }),
      })

      if (!response.ok) {
        setError(t('admin.badCredentials'))
        return
      }

      router.replace(nextPath)
      router.refresh()
    } catch (requestError) {
      console.error('Login request failed:', requestError)
      setError(t('admin.loginError'))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-bg-dark flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-bg-hero border border-border-card rounded-xl p-8">
        <h1 className="text-2xl font-serif text-cream mb-2">{t('admin.login')}</h1>
        <p className="text-text-body-light mb-6">
          {t('admin.loginDesc')}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-text-body-light mb-2">
              {t('admin.identifier')}
            </label>
            <input
              className="w-full px-3 py-2 input-vigor"
              value={identifier}
              onChange={(event) => setIdentifier(event.target.value)}
              autoComplete="username"
              required
            />
          </div>

          <div>
            <label className="block text-sm text-text-body-light mb-2">
              {t('admin.password')}
            </label>
            <input
              type="password"
              className="w-full px-3 py-2 input-vigor"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
              required
            />
          </div>

          {error ? <p className="text-sm text-terra">{error}</p> : null}

          <button
            type="submit"
            disabled={submitting}
            className="w-full px-4 py-2 rounded bg-lime text-bg-dark font-medium hover:bg-lime/90 disabled:opacity-70"
          >
            {submitting ? t('admin.loggingIn') : t('admin.loginBtn')}
          </button>
        </form>
      </div>
    </div>
  )
}
