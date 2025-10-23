import '../styles/globals.css'
import { Inter } from 'next/font/google'
import { Italiana } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })
const italiana = Italiana({ weight: '400', subsets: ['latin'] })

export const metadata = {
  title: 'Authfolio',
  description: 'Online Resume Web Application',
  icons: {
    icon: '/newFavicon.ico',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={italiana.className}>{children}</body>
    </html>
  )
}
