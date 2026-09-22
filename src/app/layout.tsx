import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Hermex Pay — Оплата замовлення',
  description: 'Платіжний сервіс платформи Hermex'
}

export default function RootLayout({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="uk" className="light">
      <body className="min-h-screen flex flex-col bg-slate-50 text-slate-900 antialiased selection:bg-blue-600 selection:text-white">
        {/* Top Header */}
        <header className="sticky top-0 z-40 border-b border-slate-200/90 bg-white/90 backdrop-blur-md">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center font-black text-white shadow-xs text-sm">
                HX
              </div>
              <span className="text-base font-bold tracking-tight text-slate-900">
                Hermex<span className="text-blue-600">Pay</span>
              </span>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 py-8">
          {children}
        </main>

        {/* Footer */}
        <footer className="border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-500">
          <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-center gap-2">
            <p>© {new Date().getFullYear()} Hermex Hub. Всі права захищені.</p>
          </div>
        </footer>
      </body>
    </html>
  )
}
