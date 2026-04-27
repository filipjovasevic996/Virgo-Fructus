import { NextResponse } from 'next/server'
import { resend, FROM_EMAIL, SUPPLIER_EMAIL } from '@/lib/resend'

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

const topicLabels: Record<string, string> = {
  order: 'Pitanje o porudžbini',
  product: 'Pitanje o proizvodima',
  wholesale: 'Veleprodaja / B2B',
  partnership: 'Saradnja',
  other: 'Ostalo',
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const name = String(body?.name ?? '').trim()
    const email = String(body?.email ?? '').trim()
    const topic = String(body?.topic ?? '').trim()
    const message = String(body?.message ?? '').trim()

    if (!name || !email || !topic || !message) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const to = SUPPLIER_EMAIL || 'vigorfructus@gmail.com'
    const safeName = escapeHtml(name)
    const safeEmail = escapeHtml(email)
    const safeTopic = escapeHtml(topicLabels[topic] || topic)
    const safeMessage = escapeHtml(message).replace(/\n/g, '<br/>')

    await resend.emails.send({
      from: FROM_EMAIL,
      to,
      replyTo: email,
      subject: `Kontakt forma — ${safeTopic} (${safeName})`,
      html: `
        <div style="font-family:Arial,sans-serif;line-height:1.5;color:#111">
          <h2 style="margin:0 0 12px">Nova poruka sa kontakt forme</h2>
          <p style="margin:0 0 8px"><strong>Ime:</strong> ${safeName}</p>
          <p style="margin:0 0 8px"><strong>Email:</strong> ${safeEmail}</p>
          <p style="margin:0 0 8px"><strong>Tema:</strong> ${safeTopic}</p>
          <p style="margin:0 0 4px"><strong>Poruka:</strong></p>
          <p style="margin:0">${safeMessage}</p>
        </div>
      `,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Contact form submit error:', error)
    return NextResponse.json({ error: 'Failed to send contact message' }, { status: 500 })
  }
}

