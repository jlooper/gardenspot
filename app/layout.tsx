import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'GardenSpot',
  description: 'Take three pictures of your yard. GardenSpot shows you where your garden will thrive.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
