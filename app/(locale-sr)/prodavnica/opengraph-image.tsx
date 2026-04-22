import { ImageResponse } from 'next/og'

export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          background: '#1D2A1F',
          color: '#F6F0E7',
          fontSize: 64,
          fontWeight: 700,
          letterSpacing: 1,
        }}
      >
        <div>Prodavnica</div>
        <div style={{ marginTop: 16, fontSize: 36, color: '#C1D62E' }}>Vigor Fructus</div>
      </div>
    ),
    size,
  )
}
