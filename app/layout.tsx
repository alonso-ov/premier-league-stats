import type { Metadata } from 'next'
import { Space_Grotesk } from 'next/font/google'
import './globals.css'

import TopNavBar from '@/app/ui/top-nav-bar'

const lato = Space_Grotesk({ subsets: ['latin'], variable: '--font-space-grotesk' })

export const metadata: Metadata = {
  title: 'Soccer Stats',
  description: 'Statistics site for the Soccer Leagues',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`flex flex-col w-screen h-screen ${lato.className}`}>
        <TopNavBar />
        <div>
          {children}
        </div>
      </body>
    </html>
  )
}
