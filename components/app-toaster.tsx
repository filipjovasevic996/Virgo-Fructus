'use client'

import { Toaster } from 'sonner'

export function AppToaster() {
  return (
    <Toaster
      position="bottom-center"
      closeButton={false}
      className="font-sans"
      offset={{ bottom: 'calc(1rem + env(safe-area-inset-bottom, 0px))' }}
      gap={12}
      toastOptions={{
        duration: 2000,
        classNames: {
          toast:
            'relative overflow-hidden !w-[min(100vw-2rem,22rem)] !max-w-none !bg-bg-hero !border !border-border-card !text-cream !shadow-xl !rounded-lg !px-4 !py-3.5',
          title: '!text-cream font-medium text-sm leading-snug',
          description: '!text-text-body-light text-sm mt-1',
        },
      }}
    />
  )
}
