import { AuthProvider } from '@/context/AuthContext'
import { Toaster } from 'react-hot-toast'
import Petals from '@/components/Petals'
import './globals.css'

export const metadata = { title: 'ShimuAnime — アニメを視聴', description: 'Stream anime free & premium. Sub & Dub.' }

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
        <link href="https://fonts.googleapis.com/css2?family=Cinzel+Decorative:wght@400;700&family=Noto+Sans+JP:wght@300;400;500;700&display=swap" rel="stylesheet" />
      </head>
      <body className="bg-shim-bg text-shim-text min-h-screen overflow-x-hidden">
        <AuthProvider>
          <Petals />
          <Toaster position="top-right" toastOptions={{ style: { background:'#12122a', color:'#f0eaf4', border:'1px solid rgba(200,68,106,0.4)', borderRadius:'10px' } }} />
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}
