import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'F-Mobile Do\'kon Boshqaruv Tizimi',
  description: 'Professional do\'kon boshqaruv tizimi',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="uz" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  const stored = localStorage.getItem('f-mobile-theme')
                  let theme = 'light'
                  if (stored) {
                    try {
                      const parsed = JSON.parse(stored)
                      theme = parsed.state?.theme || 'light'
                    } catch {}
                  }
                  if (theme === 'dark') {
                    document.documentElement.classList.add('dark')
                  } else {
                    document.documentElement.classList.remove('dark')
                  }
                } catch (e) {}
              })()
            `,
          }}
        />
      </head>
      <body className="theme-transition bg-[var(--bg-primary)] text-[var(--text-primary)]">
        {children}
      </body>
    </html>
  )
}

