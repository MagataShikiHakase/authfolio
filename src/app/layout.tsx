import '../styles/globals.css'
import { Inter, Italiana } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })
const italiana = Italiana({ weight: '400', subsets: ['latin'] })

export const metadata = {
  title: {
    default: 'Authfolio | Create Your Online Portfolio Effortlessly',
    template: '%s | Authfolio',
  },
  description:
    'Authfolio lets you instantly build a beautiful online portfolio by just entering your information. Designed for students, engineers, and job seekers.',
  keywords: [
    'portfolio builder',
    'resume website',
    'authfolio',
    'nextjs portfolio',
    'job hunting website',
    'online resume',
    'developer portfolio',
  ],
  authors: [{ name: 'Yuma Fukazawa', url: 'https://authfolio.vercel.app' }],
  metadataBase: new URL('https://authfolio.vercel.app'),
  openGraph: {
    title: 'Authfolio | Beautiful Online Resume Builder',
    description:
      'Easily create a stunning portfolio website to showcase your achievements, skills, and projects.',
    url: 'https://authfolio.vercel.app',
    siteName: 'Authfolio',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Authfolio Preview',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Authfolio | Create Your Portfolio Effortlessly',
    description: 'Instantly create a stunning online portfolio website.',
    images: ['/og-image.png'],
    creator: '@your_twitter_handle', // ← 持ってたら追加
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
  icons: {
    icon: '/newFavicon.ico',
    shortcut: '/newFavicon.ico',
    apple: '/newFavicon.ico',
  },
  alternates: {
    canonical: 'https://authfolio.vercel.app',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} ${italiana.className}`}>
        {children}
      </body>
    </html>
  )
}
