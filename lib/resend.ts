import { Resend } from 'resend'

export const resend = new Resend(process.env.RESEND_API_KEY)

export const FROM_EMAIL = process.env.FROM_EMAIL || 'Vigor Fructus <onboarding@resend.dev>'
export const SUPPLIER_EMAIL = process.env.SUPPLIER_EMAIL || ''
