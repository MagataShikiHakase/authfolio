import '../styles/globals.css'
import { Inter } from 'next/font/google'
import { Italiana } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })
const italiana = Italiana({ weight: '400', subsets: ['latin'] })

export const metadata = {
  title: 'Authfolio | Create Your Online Portfolio Effortlessly',
  description:
    'Authfolio lets you instantly build a beautiful online portfolio by just entering your information. Designed for students, engineers, and job seekers.',
  keywords: [
    'portfolio builder',
    'resume website',
    'authfolio',
    'nextjs portfolio',
    'job hunting website',
  ],
  authors: [{ name: 'Yuma Fukazawa' }],
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
    title: 'Authfolio',
    description: 'Instantly create a stunning online portfolio website.',
    images: ['/og-image.png'],
  },
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
