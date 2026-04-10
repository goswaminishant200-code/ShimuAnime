'use client'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'

const NAV = [
  { href:'/',        en:'Home',    ja:'ホーム'   },
  { href:'/catalog', en:'Catalog', ja:'カタログ' },
  { href:'/news',    en:'News',    ja:'ニュース' },
  { href:'/search',  en:'Search',  ja:'検索'    },
]

const Logo = () => (
  <svg viewBox="0 0 32 32" className="w-8 h-8" fill="none">
    <circle cx="16" cy="10" r="5" fill="#c8446a" opacity=".9"/>
    <circle cx="22" cy="16" r="5" fill="#c8446a" opacity=".7"/>
    <circle cx="10" cy="16" r="5" fill="#c8446a" opacity=".7"/>
    <circle cx="20" cy="23" r="5" fill="#c8446a" opacity=".5"/>
    <circle cx="12" cy="23" r="5" fill="#c8446a" opacity=".5"/>
    <circle cx="16" cy="16" r="4" fill="#f4a7bc"/>
  </svg>
)

export default function Navbar() {
  const path = usePathname()
  const { user, profile, logout, isAdmin, isPremium } = useAuth()
  const [scrolled, setScrolled] = useState(false)
  const [open,     setOpen]     = useState(false)
  const [lang,     setLang]     = useState('en')
  const [drop,     setDrop]     = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', fn); return () => window.removeEventListener('scroll', fn)
  }, [])
  useEffect(() => {
    const fn = e => { if (ref.current && !ref.current.contains(e.target)) setDrop(false) }
    document.addEventListener('mousedown', fn); return () => document.removeEventListener('mousedown', fn)
  }, [])
  useEffect(() => setOpen(false), [path])

  const T = l => lang === 'ja' ? l.ja : l.en

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'glass shadow-lg shadow-black/40' : 'bg-transparent'}`}>
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">

        <Link href="/" className="flex items-center gap-2 group">
          <Logo />
          <span className="font-display text-lg font-bold">
            <span className="text-shim-primary">Shimu</span><span className="text-shim-text">Anime</span>
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-1">
          {NAV.map(l => (
            <Link key={l.href} href={l.href}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${path===l.href?'text-shim-primary bg-shim-primary/10 border border-shim-primary/30':'text-shim-textD hover:text-shim-text hover:bg-white/5'}`}>
              {T(l)}
            </Link>
          ))}
          {isAdmin && (
            <Link href="/admin" className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${path==='/admin'?'text-shim-gold bg-shim-gold/10 border border-shim-gold/30':'text-shim-gold/70 hover:text-shim-gold hover:bg-shim-gold/5'}`}>
              {lang==='ja'?'管理者':'Admin'}
            </Link>
          )}
        </div>

        <div className="flex items-center gap-3">
          <button onClick={() => setLang(l => l==='en'?'ja':'en')}
            className="hidden sm:flex items-center gap-1 px-3 py-1.5 rounded-lg border border-shim-border text-xs text-shim-textD hover:text-shim-text hover:border-shim-primary/40 transition-all">
            {lang==='en'?'🇯🇵 日本語':'🇺🇸 English'}
          </button>

          {user ? (
            <div className="relative" ref={ref}>
              <button onClick={() => setDrop(d=>!d)} className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-shim-border hover:border-shim-primary/50 transition-all">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${isPremium?'bg-gradient-to-br from-shim-gold to-shim-primary text-white':'bg-shim-primary/20 text-shim-accent'}`}>
                  {profile?.display_name?.[0]?.toUpperCase()||'U'}
                </div>
                <span className="hidden sm:block text-sm truncate max-w-[90px] text-shim-text">{profile?.display_name||'User'}</span>
                {isPremium && <span className="hidden sm:block text-[10px] text-shim-gold border border-shim-gold/40 px-1.5 py-0.5 rounded-full">PRO</span>}
                <svg className={`w-3 h-3 text-shim-muted transition-transform ${drop?'rotate-180':''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"/></svg>
              </button>
              {drop && (
                <div className="absolute right-0 top-full mt-2 w-44 glass rounded-xl border border-shim-border overflow-hidden shadow-xl z-50">
                  <Link href="/profile" className="flex items-center gap-3 px-4 py-3 hover:bg-white/5 text-sm text-shim-text transition-colors">👤 {lang==='ja'?'プロフィール':'Profile'}</Link>
                  {!isPremium && <Link href="/premium" className="flex items-center gap-3 px-4 py-3 hover:bg-shim-gold/10 text-sm text-shim-gold transition-colors">⭐ Go Premium</Link>}
                  <div className="sakura-div"/>
                  <button onClick={logout} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-shim-primary/10 text-sm text-shim-primary transition-colors">🚪 {lang==='ja'?'ログアウト':'Logout'}</button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login" className="px-4 py-2 rounded-lg text-sm text-shim-textD hover:text-shim-text border border-transparent hover:border-shim-border transition-all">{lang==='ja'?'ログイン':'Login'}</Link>
              <Link href="/register" className="px-4 py-2 rounded-lg text-sm font-bold text-white bg-shim-primary hover:bg-shim-primaryH transition-all shadow-lg shadow-shim-primary/30">{lang==='ja'?'登録':'Sign Up'}</Link>
            </div>
          )}

          <button onClick={() => setOpen(m=>!m)} className="md:hidden p-2 rounded-lg hover:bg-white/5 transition-colors">
            <div className={`w-5 h-0.5 bg-shim-text mb-1.5 transition-all duration-300 ${open?'rotate-45 translate-y-2':''}`}/>
            <div className={`w-5 h-0.5 bg-shim-text mb-1.5 transition-all ${open?'opacity-0':''}`}/>
            <div className={`w-5 h-0.5 bg-shim-text transition-all duration-300 ${open?'-rotate-45 -translate-y-2':''}`}/>
          </button>
        </div>
      </nav>

      {open && (
        <div className="md:hidden glass border-t border-shim-border px-4 py-4 space-y-1">
          {NAV.map(l => (
            <Link key={l.href} href={l.href} className={`block px-4 py-3 rounded-lg text-sm font-medium transition-all ${path===l.href?'text-shim-primary bg-shim-primary/10':'text-shim-textD hover:text-shim-text hover:bg-white/5'}`}>{T(l)}</Link>
          ))}
          {isAdmin && <Link href="/admin" className="block px-4 py-3 rounded-lg text-sm text-shim-gold hover:bg-shim-gold/10 transition-all">👑 Admin</Link>}
          <div className="pt-2 border-t border-shim-border">
            <button onClick={() => setLang(l=>l==='en'?'ja':'en')} className="w-full text-left px-4 py-3 rounded-lg text-sm text-shim-textD hover:text-shim-text transition-all">
              {lang==='en'?'🇯🇵 日本語':'🇺🇸 English'}
            </button>
          </div>
        </div>
      )}
    </header>
  )
}
