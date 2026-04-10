import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import AnimeCard from '@/components/AnimeCard'
import AnnounceBanner from '@/components/AnnounceBanner'
import Link from 'next/link'
import { getTrending, getSeasonal, getTopAnime, getAnimeNews } from '@/lib/jikan'

// ── Hero ──────────────────────────────────────────────────────
async function Hero() {
  let anime = null
  try { const d = await getTrending(); anime = d?.data?.[Math.floor(Math.random()*5)] } catch {}
  const title    = anime?.title_english || anime?.title || 'ShimuAnime'
  const synopsis = anime?.synopsis?.slice(0,200)+'...' || 'Stream thousands of anime. Free & Premium.'
  const image    = anime?.images?.jpg?.large_image_url || ''
  const id       = anime?.mal_id || 1
  const score    = anime?.score?.toFixed(1) || ''
  const genres   = anime?.genres?.slice(0,3) || []

  return (
    <section className="relative h-[90vh] min-h-[580px] flex items-center overflow-hidden">
      <div className="absolute inset-0">
        {image && <img src={image} alt={title} className="w-full h-full object-cover object-top scale-105" style={{filter:'blur(2px) brightness(0.28)'}}/>}
        <div className="absolute inset-0" style={{background:'linear-gradient(90deg,rgba(7,7,15,0.96) 0%,rgba(7,7,15,0.6) 60%,transparent 100%)'}}/>
        <div className="absolute bottom-0 left-0 right-0 h-40" style={{background:'linear-gradient(to top, #07070f, transparent)'}}/>
      </div>
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 w-full pt-20">
        <div className="max-w-2xl">
          <div className="flex items-center gap-3 mb-4 fade-up" style={{animationDelay:'.1s'}}>
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-shim-primary/20 border border-shim-primary/40 text-shim-accent text-xs font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-shim-primary animate-pulse"/>Trending
            </span>
            {genres.map(g => <span key={g.mal_id} className="genre-tag hidden sm:inline-block">{g.name}</span>)}
            {score && <span className="text-shim-gold text-xs font-bold">★ {score}</span>}
          </div>
          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-5 glow-text fade-up" style={{animationDelay:'.2s'}}>{title}</h1>
          <p className="text-shim-textD text-base sm:text-lg leading-relaxed mb-8 clamp3 fade-up" style={{animationDelay:'.3s'}}>{synopsis}</p>
          <div className="flex flex-wrap gap-4 fade-up" style={{animationDelay:'.4s'}}>
            <Link href={`/watch/${id}`} className="btn-primary"><svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>Watch Now</Link>
            <Link href={`/anime/${id}`} className="btn-ghost">Details</Link>
            <Link href="/premium" className="hidden sm:flex items-center gap-2 px-6 py-3 rounded-xl border border-shim-gold/40 hover:border-shim-gold text-shim-gold font-semibold text-sm transition-all hover:bg-shim-gold/10">⭐ Go Premium</Link>
          </div>
        </div>
      </div>
    </section>
  )
}

// ── Section header ────────────────────────────────────────────
function SectionHead({ title, ja, href, color='from-shim-primary to-shim-accent' }) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-3">
        <div className={`w-1 h-8 bg-gradient-to-b ${color} rounded-full`}/>
        <div><h2 className="text-xl font-bold text-shim-text">{title}</h2><p className="text-xs text-shim-muted font-jp">{ja}</p></div>
      </div>
      <Link href={href} className="text-shim-primary text-sm hover:text-shim-accent transition-colors flex items-center gap-1">View All<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/></svg></Link>
    </div>
  )
}

// ── Grid ─────────────────────────────────────────────────────
function AnimeGrid({ items, cols='grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5', showRank }) {
  return (
    <div className={`grid ${cols} gap-4`}>
      {items.map((a,i) => <AnimeCard key={a.mal_id} anime={a} showRank={showRank} rank={i+1}/>)}
    </div>
  )
}

// ── Skeleton ─────────────────────────────────────────────────
function Skeleton({ n=10 }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {Array(n).fill(0).map((_,i) => (
        <div key={i} className="bg-shim-card rounded-xl overflow-hidden animate-pulse">
          <div className="aspect-[3/4] bg-shim-bgalt"/>
          <div className="p-3 space-y-2"><div className="h-3 bg-shim-bgalt rounded w-3/4"/><div className="h-2 bg-shim-bgalt rounded w-1/2"/></div>
        </div>
      ))}
    </div>
  )
}

// ── Trending ─────────────────────────────────────────────────
async function TrendingSection() {
  let list = []
  try { const d = await getTrending(); list = d?.data?.slice(0,10)||[] } catch {}
  return (
    <section>
      <SectionHead title="Trending Now" ja="今トレンド中" href="/catalog?f=trending"/>
      {list.length ? <AnimeGrid items={list} showRank/> : <Skeleton/>}
    </section>
  )
}

// ── Seasonal ─────────────────────────────────────────────────
async function SeasonalSection() {
  let list = []
  try { const d = await getSeasonal(); list = d?.data?.slice(0,8)||[] } catch {}
  const m = new Date().getMonth()
  const season = m<3?{en:'Winter',ja:'冬'}:m<6?{en:'Spring',ja:'春'}:m<9?{en:'Summer',ja:'夏'}:{en:'Fall',ja:'秋'}
  return (
    <section>
      <SectionHead title={`${season.en} ${new Date().getFullYear()} Anime`} ja={`${season.ja}アニメ`} href="/catalog?f=seasonal" color="from-shim-accent to-shim-primary"/>
      {list.length ? <AnimeGrid items={list} cols="grid-cols-2 sm:grid-cols-3 md:grid-cols-4"/> : <Skeleton n={8}/>}
    </section>
  )
}

// ── Top Rated ────────────────────────────────────────────────
async function TopSection() {
  let list = []
  try { const d = await getTopAnime(); list = d?.data?.slice(0,8)||[] } catch {}
  return (
    <section>
      <SectionHead title="Top Rated" ja="最高評価" href="/catalog?f=top" color="from-shim-gold to-shim-primary"/>
      {list.length ? <AnimeGrid items={list} cols="grid-cols-2 sm:grid-cols-3 md:grid-cols-4" showRank/> : <Skeleton n={8}/>}
    </section>
  )
}

// ── News preview ─────────────────────────────────────────────
async function NewsSection() {
  let news = []
  try {
    const ids = [52991, 51009, 40748]
    const res = await Promise.allSettled(ids.map(id => getAnimeNews(id)))
    news = res.filter(r=>r.status==='fulfilled').flatMap(r=>r.value?.data||[]).slice(0,6)
  } catch {}
  if (!news.length) return null
  return (
    <section>
      <SectionHead title="Anime News" ja="アニメニュース" href="/news" color="from-blue-400 to-shim-primary"/>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {news.map((n,i) => (
          <a key={n.mal_id||i} href={n.url} target="_blank" rel="noopener noreferrer" className="group glass rounded-xl border border-shim-border hover:border-shim-primary/40 transition-all hover:-translate-y-1 p-4">
            <div className="flex gap-3">
              {n.images?.jpg?.image_url && <img src={n.images.jpg.image_url} alt="" className="w-14 h-14 rounded-lg object-cover flex-shrink-0"/>}
              <div className="flex-1 min-w-0">
                <h3 className="text-xs font-medium text-shim-text clamp2 group-hover:text-shim-accent transition-colors mb-1 leading-snug">{n.title}</h3>
                <p className="text-xs text-shim-muted">{n.date ? new Date(n.date).toLocaleDateString('en-US',{month:'short',day:'numeric'}) : ''}</p>
              </div>
            </div>
          </a>
        ))}
      </div>
    </section>
  )
}

// ── Main page ─────────────────────────────────────────────────
export default function HomePage() {
  return (
    <div className="min-h-screen bg-shim-bg relative">
      <div className="kana-deco top-24 right-0 overflow-hidden">アニメ</div>
      <Navbar/>
      <AnnounceBanner/>
      <main className="relative z-10">
        <Hero/>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-20 pb-12">
          <TrendingSection/>
          <SeasonalSection/>
          <TopSection/>
          <NewsSection/>
        </div>
      </main>
      <Footer/>
    </div>
  )
}
