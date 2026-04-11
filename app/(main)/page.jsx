'use client'
import { useState, useEffect } from 'react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import AnimeCard from '@/components/AnimeCard'
import AnnounceBanner from '@/components/AnnounceBanner'
import Link from 'next/link'

// Delay helper to avoid Jikan rate limit
const delay = (ms) => new Promise(res => setTimeout(res, ms))

// ── Skeleton ─────────────────────────────────────
function Skeleton({ n = 10, cols = 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5' }) {
  return (
    <div className={`grid ${cols} gap-4`}>
      {Array(n).fill(0).map((_, i) => (
        <div key={i} className="bg-shim-card rounded-xl overflow-hidden animate-pulse">
          <div className="aspect-[3/4] bg-shim-bgalt" />
          <div className="p-3 space-y-2">
            <div className="h-3 bg-shim-bgalt rounded w-3/4" />
            <div className="h-2 bg-shim-bgalt rounded w-1/2" />
          </div>
        </div>
      ))}
    </div>
  )
}

// ── Section header ────────────────────────────────
function SectionHead({ title, ja, href, color = 'from-shim-primary to-shim-accent' }) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-3">
        <div className={`w-1 h-8 bg-gradient-to-b ${color} rounded-full`} />
        <div>
          <h2 className="text-xl font-bold text-shim-text">{title}</h2>
          <p className="text-xs text-shim-muted font-jp">{ja}</p>
        </div>
      </div>
      <Link href={href} className="text-shim-primary text-sm hover:text-shim-accent transition-colors flex items-center gap-1">
        View All
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </Link>
    </div>
  )
}

export default function HomePage() {
  const [hero,     setHero]     = useState(null)
  const [trending, setTrending] = useState([])
  const [seasonal, setSeasonal] = useState([])
  const [topRated, setTopRated] = useState([])
  const [news,     setNews]     = useState([])
  const [heroIdx,  setHeroIdx]  = useState(0)

  // Fetch all sections with delay between each to avoid rate limit
  useEffect(() => {
    async function loadAll() {
      try {
        // Fetch trending first
        const tRes  = await fetch('https://api.jikan.moe/v4/top/anime?filter=airing&limit=20')
        const tData = await tRes.json()
        const tList = tData?.data || []
        setTrending(tList)
        // Set hero pool from trending
        setHero(tList)
      } catch (e) { console.error('Trending failed:', e) }

      await delay(400)

      try {
        const sRes  = await fetch('https://api.jikan.moe/v4/seasons/now?limit=20')
        const sData = await sRes.json()
        setSeasonal(sData?.data || [])
      } catch (e) { console.error('Seasonal failed:', e) }

      await delay(400)

      try {
        const rRes  = await fetch('https://api.jikan.moe/v4/top/anime?page=1&limit=20')
        const rData = await rRes.json()
        setTopRated(rData?.data || [])
      } catch (e) { console.error('Top rated failed:', e) }

      await delay(400)

      try {
        const ids = [52991, 51009, 40748]
        const newsRes = await Promise.allSettled(
          ids.map(id => fetch(`https://api.jikan.moe/v4/anime/${id}/news?limit=3`).then(r => r.json()))
        )
        const allNews = newsRes
          .filter(r => r.status === 'fulfilled')
          .flatMap(r => r.value?.data || [])
          .slice(0, 6)
        setNews(allNews)
      } catch (e) { console.error('News failed:', e) }
    }
    loadAll()
  }, [])

  // Hero rotates every 6 seconds through trending anime
  useEffect(() => {
    if (!hero?.length) return
    const t = setInterval(() => {
      setHeroIdx(i => (i + 1) % Math.min(10, hero.length))
    }, 6000)
    return () => clearInterval(t)
  }, [hero])

  const featured  = hero?.[heroIdx]
  const title     = featured?.title_english || featured?.title || 'ShimizuAnime'
  const synopsis  = featured?.synopsis?.slice(0, 220) + '...' || 'Stream thousands of anime free and premium.'
  const image     = featured?.images?.jpg?.large_image_url || ''
  const id        = featured?.mal_id || 1
  const score     = featured?.score?.toFixed(1) || ''
  const genres    = featured?.genres?.slice(0, 3) || []
  const m         = new Date().getMonth()
  const season    = m < 3 ? { en: 'Winter', ja: '冬' } : m < 6 ? { en: 'Spring', ja: '春' } : m < 9 ? { en: 'Summer', ja: '夏' } : { en: 'Fall', ja: '秋' }

  return (
    <div className="min-h-screen bg-shim-bg relative">
      <div className="kana-deco top-24 right-0 overflow-hidden select-none">アニメ</div>
      <Navbar />
      <AnnounceBanner />

      <main className="relative z-10">

        {/* ── Hero ── */}
        <section className="relative h-[90vh] min-h-[580px] flex items-center overflow-hidden">
          <div className="absolute inset-0">
            {image && (
              <img
                key={image}
                src={image}
                alt={title}
                className="w-full h-full object-cover object-top scale-105 transition-opacity duration-1000"
                style={{ filter: 'blur(2px) brightness(0.28)' }}
              />
            )}
            <div className="absolute inset-0" style={{ background: 'linear-gradient(90deg,rgba(7,7,15,0.96) 0%,rgba(7,7,15,0.6) 60%,transparent 100%)' }} />
            <div className="absolute bottom-0 left-0 right-0 h-40" style={{ background: 'linear-gradient(to top, #07070f, transparent)' }} />
          </div>

          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 w-full pt-20">
            <div className="max-w-2xl">
              <div className="flex items-center gap-3 mb-4 fade-up">
                <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-shim-primary/20 border border-shim-primary/40 text-shim-accent text-xs font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-shim-primary animate-pulse" />
                  Now Trending
                </span>
                {genres.map(g => <span key={g.mal_id} className="genre-tag hidden sm:inline-block">{g.name}</span>)}
                {score && <span className="text-shim-gold text-xs font-bold">★ {score}</span>}
              </div>

              <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-5 glow-text fade-up">
                {title}
              </h1>

              <p className="text-shim-textD text-base sm:text-lg leading-relaxed mb-8 clamp3 fade-up">
                {synopsis}
              </p>

              <div className="flex flex-wrap gap-4 fade-up">
                <Link href={`/watch/${id}`} className="btn-primary">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                  Watch Now
                </Link>
                <Link href={`/anime/${id}`} className="btn-ghost">Details</Link>
                <Link href="/premium" className="hidden sm:flex items-center gap-2 px-6 py-3 rounded-xl border border-shim-gold/40 hover:border-shim-gold text-shim-gold font-semibold text-sm transition-all hover:bg-shim-gold/10">
                  ⭐ Go Premium
                </Link>
              </div>

              {/* Hero dots indicator */}
              {hero?.length > 1 && (
                <div className="flex items-center gap-2 mt-6">
                  {Array.from({ length: Math.min(10, hero.length) }, (_, i) => (
                    <button
                      key={i}
                      onClick={() => setHeroIdx(i)}
                      className={`transition-all rounded-full ${i === heroIdx ? 'w-6 h-2 bg-shim-primary' : 'w-2 h-2 bg-shim-muted/40 hover:bg-shim-muted'}`}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-20 pb-12">

          {/* ── Trending ── */}
          <section>
            <SectionHead title="Trending Now" ja="今トレンド中" href="/catalog?f=trending" />
            {trending.length === 0
              ? <Skeleton n={10} />
              : <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {trending.map((a, i) => <AnimeCard key={a.mal_id} anime={a} showRank rank={i + 1} />)}
                </div>
            }
          </section>

          {/* ── Seasonal ── */}
          <section>
            <SectionHead
              title={`${season.en} ${new Date().getFullYear()} Anime`}
              ja={`${season.ja}アニメ`}
              href="/catalog?f=seasonal"
              color="from-shim-accent to-shim-primary"
            />
            {seasonal.length === 0
              ? <Skeleton n={10} cols="grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5" />
              : <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {seasonal.map(a => <AnimeCard key={a.mal_id} anime={a} />)}
                </div>
            }
          </section>

          {/* ── Top Rated ── */}
          <section>
            <SectionHead title="Top Rated" ja="最高評価" href="/catalog?f=top" color="from-shim-gold to-shim-primary" />
            {topRated.length === 0
              ? <Skeleton n={10} />
              : <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {topRated.map((a, i) => <AnimeCard key={a.mal_id} anime={a} showRank rank={i + 1} />)}
                </div>
            }
          </section>

          {/* ── News ── */}
          {news.length > 0 && (
            <section>
              <SectionHead title="Anime News" ja="アニメニュース" href="/news" color="from-blue-400 to-shim-primary" />
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {news.map((n, i) => (
                  <a key={n.mal_id || i} href={n.url} target="_blank" rel="noopener noreferrer"
                    className="group glass rounded-xl border border-shim-border hover:border-shim-primary/40 transition-all hover:-translate-y-1 p-4">
                    <div className="flex gap-3">
                      {n.images?.jpg?.image_url && (
                        <img src={n.images.jpg.image_url} alt="" className="w-14 h-14 rounded-lg object-cover flex-shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-xs font-medium text-shim-text clamp2 group-hover:text-shim-accent transition-colors mb-1 leading-snug">{n.title}</h3>
                        <p className="text-xs text-shim-muted">
                          {n.date ? new Date(n.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : ''}
                        </p>
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            </section>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}
