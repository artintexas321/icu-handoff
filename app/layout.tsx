import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'ShiftView',
  description: 'ICU Patient Handoff Dashboard',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-50 min-h-screen">
        <div className="fixed top-0 left-0 right-0 z-50 bg-yellow-400 text-yellow-900 text-center text-xs font-bold py-1.5 tracking-wide uppercase">
          ⚠ Mock Data — For Testing Purposes Only — Not Real Patient Information ⚠
        </div>
        <div className="pt-7">{children}</div>
      </body>
    </html>
  )
}
