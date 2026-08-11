import { type NextRequest, NextResponse } from 'next/server'
import { purgeExpiredCustomerData } from '@/lib/data-retention'

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { purgedCount } = await purgeExpiredCustomerData()
  return NextResponse.json({ success: true, purgedCount })
}
