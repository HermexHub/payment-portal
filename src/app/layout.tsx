import type { Metadata } from 'next'
import { ShieldCheck, Lock } from 'lucide-react'
import './globals.css'

export const metadata: Metadata = {
  title: 'Hermex Pay — Secure Hosted Payment Gateway',
  description: 'Isolated Hosted Checkout Portal & Interactive Saga Simulation'
}

export default function RootLayout({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen flex flex-col bg-slate-950 text-slate-100 antialiased selection:bg-blue-600 selection:text-white">
        {/* Top Header */}
        <header className="sticky top-0 z-40 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center font-bold text-white shadow-lg shadow-blue-600/30 text-sm">
                HX
              </div>
              <div>
                <span className="text-base font-bold tracking-tight text-white">
                  Hermex<span className="text-blue-400">Pay</span>
                </span>
                <span className="hidden sm:inline-block ml-2 text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400">
                  Hosted Checkout
                </span>
              </div>
            </div>

            {/* Security Indicator */}
            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-1.5 text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20 font-medium">
                <Lock className="w-3 h-3" />
                <span>PCI-DSS Level 1</span>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 py-8">
          {children}
        </main>

        {/* Footer */}
        <footer className="border-t border-slate-800/60 bg-slate-950/60 py-6 text-center text-xs text-slate-500">
          <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
            <p>© {new Date().getFullYear()} Hermex Hub. Hosted Payment Service.</p>
            <p className="flex items-center gap-1 text-[11px] text-slate-400">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
              Isolated Microfrontend • Zero Raw Card Storage
            </p>
          </div>
        </footer>
      </body>
    </html>
  )
}
