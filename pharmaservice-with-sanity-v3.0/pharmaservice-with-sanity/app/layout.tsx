import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Pharma Service — The Voice of Reason',
  description: 'Independent research, honest recommendations, direct delivery. Value-driven consumer health insights from a 40-year pharmaceutical distributor.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,300;1,9..40,400&display=swap" rel="stylesheet" />
      </head>
      <body>{children}</body>
    </html>
  )
}
