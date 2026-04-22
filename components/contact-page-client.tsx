'use client'

import { useState } from 'react'
import { Phone, Mail, Check } from 'lucide-react'
import { useI18n } from '@/lib/i18n'

export default function ContactPageClient() {
  const { t } = useI18n()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    topic: '',
    message: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitted, setIsSubmitted] = useState(false)

  const topics = [
    { value: '', label: t('contact.topicDefault') },
    { value: 'order', label: t('contact.topicOrder') },
    { value: 'product', label: t('contact.topicProducts') },
    { value: 'wholesale', label: t('contact.topicB2B') },
    { value: 'partnership', label: t('contact.topicCollab') },
    { value: 'other', label: t('contact.topicOther') },
  ]

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    if (!formData.name.trim()) newErrors.name = t('contact.errorName')
    if (!formData.email.trim()) newErrors.email = t('contact.errorEmail')
    if (!formData.topic) newErrors.topic = t('contact.errorTopic')
    if (!formData.message.trim()) newErrors.message = t('contact.errorMessage')
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validateForm()) {
      setIsSubmitted(true)
    }
  }

  return (
    <div className="bg-bg-page min-h-screen py-4 sm:py-8 lg:py-12">
      <div className="mx-auto max-w-[1100px] px-5 sm:px-6 lg:px-8">
        <div className="text-center mb-8 sm:mb-12">
          <span className="font-sans text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.14em] text-terra">
            {t('contact.title')}
          </span>
          <h1 className="mt-3 sm:mt-4 font-serif font-bold text-2xl sm:text-3xl lg:text-4xl text-bg-dark">
            {t('contact.heading')}
          </h1>
          <p className="mt-3 sm:mt-4 font-sans text-sm sm:text-base text-text-nav max-w-md mx-auto">
            {t('contact.description')}
          </p>
        </div>

        <div className="grid lg:grid-cols-[1fr_1.2fr] gap-8 lg:gap-12">
          <div className="space-y-8 lg:pt-20">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-bg-hero flex items-center justify-center flex-shrink-0">
                <Phone className="w-5 h-5 text-lime" />
              </div>
              <div>
                <h3 className="font-sans font-semibold text-sm text-bg-dark">
                  {t('contact.phone')}
                </h3>
                <p className="mt-1 font-sans font-bold text-lg sm:text-xl text-text-nav">
                  +381 69 302 3828
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-bg-hero flex items-center justify-center flex-shrink-0">
                <Mail className="w-5 h-5 text-lime" />
              </div>
              <div>
                <h3 className="font-sans font-semibold text-sm text-bg-dark">
                  {t('contact.email')}
                </h3>
                <p className="mt-1 font-sans font-bold text-lg sm:text-xl text-text-nav break-all sm:break-normal">
                  vigorfructus@gmail.com
                </p>
                <p className="mt-1 font-sans text-sm text-text-nav/70">
                  {t('contact.emailDesc')}
                </p>
              </div>
            </div>

            <div className="p-6 bg-cream rounded-lg">
              <h3 className="font-serif font-semibold text-lg text-bg-dark">
                {t('contact.b2bTitle')}
              </h3>
              <p className="mt-2 font-sans text-sm text-text-nav leading-relaxed">
                {t('contact.b2bDesc')}
              </p>
            </div>
          </div>

          <div className="bg-bg-hero rounded-lg p-5 sm:p-8">
            {isSubmitted ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-lime flex items-center justify-center">
                  <Check className="w-8 h-8 text-bg-dark" />
                </div>
                <h2 className="font-serif font-semibold text-xl sm:text-2xl text-cream">
                  {t('contact.successTitle')}
                </h2>
                <p className="mt-4 font-sans text-text-body-light">
                  {t('contact.successDesc')}
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="name" className="block font-sans text-sm font-medium text-cream mb-2">
                    {t('contact.nameLabel')}
                  </label>
                  <input
                    id="name"
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="input-vigor w-full px-4 py-3"
                    placeholder={t('contact.namePlaceholder')}
                  />
                  {errors.name && <p className="mt-1 text-sm text-terra">{errors.name}</p>}
                </div>

                <div>
                  <label htmlFor="email" className="block font-sans text-sm font-medium text-cream mb-2">
                    {t('contact.emailLabel')}
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="input-vigor w-full px-4 py-3"
                    placeholder="vas@email.com"
                  />
                  {errors.email && <p className="mt-1 text-sm text-terra">{errors.email}</p>}
                </div>

                <div>
                  <label htmlFor="topic" className="block font-sans text-sm font-medium text-cream mb-2">
                    {t('contact.topicLabel')}
                  </label>
                  <select
                    id="topic"
                    value={formData.topic}
                    onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                    className="input-vigor w-full px-4 py-3"
                  >
                    {topics.map((topic) => (
                      <option key={topic.value} value={topic.value}>{topic.label}</option>
                    ))}
                  </select>
                  {errors.topic && <p className="mt-1 text-sm text-terra">{errors.topic}</p>}
                </div>

                <div>
                  <label htmlFor="message" className="block font-sans text-sm font-medium text-cream mb-2">
                    {t('contact.messageLabel')}
                  </label>
                  <textarea
                    id="message"
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="input-vigor w-full px-4 py-3 min-h-[150px] resize-none"
                    placeholder={t('contact.messagePlaceholder')}
                  />
                  {errors.message && <p className="mt-1 text-sm text-terra">{errors.message}</p>}
                </div>

                <button
                  type="submit"
                  className="w-full py-4 px-6 bg-bg-page text-bg-dark font-sans text-[13px] font-semibold uppercase tracking-[0.08em] rounded hover:bg-cream transition-colors"
                >
                  {t('contact.send')}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
