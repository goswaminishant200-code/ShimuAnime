'use client'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { addToWatchlist, removeFromWatchlist, checkWatchlist } from '@/lib/db'
import toast from 'react-hot-toast'

export default function AnimeCard({ anime, rank, showRank }) {
  const { user } = useAuth()
  const [inWL, setInWL] = useState(false)
  const [busy, setBusy] = useState(false)

  const title = anime.title_english || anime.title || 'Unknown'
  const image = anime.images?.jpg?.large_image_url || anime.images?.jpg?.image_url || ''
  const score = anime.score ? anime.score.toFixed(1) : 'N/A'
  const genres = anime.genres?.slice(0, 2) || []
  const eps = anime.episodes || '?'
  const year = anime.year || ''

  useEffect(() => {
    if (user) checkWatchlist(user.id, anime.mal_id).then(setInWL)
  }, [user, anime.mal_id])

  const toggle = async (e) => {
    e.preventDefault()
    if (!user) { toast.error('Login to use watchlist'); return }
    setBusy(true)
    try {
      if (inWL) { await removeFromWatchlist(user.id, anime.mal_id); setInWL(false); toast.success('Removed') }
      else { await addToWatchlist(user.id, anime.mal_id, { title, image, score, episodes: eps }); setInWL(true); toast.success('Added to watchlist ✓') }
    } catch { toast.error('Failed') }
    setBusy(false)
  }

  return (
    <Link href={`/anime/${anime.mal_id}`} className="block group">
      <div className="anime-card relative bg-shim-card border border-shim-border rounded-xl overflow-hidden">
        {showRank && <div className="absolute top-2 left-2 z-10 w-7 h-7 rounded-lg bg-shim-primary flex items-center justify-center text-xs font-bold text-white shadow">{rank}</div>}
        {score !== 'N/A' && <div className="absolute top-2 right-2 z-10 flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-black/70"><span className="text-shim-gold text-xs">★</span><span className="text-shim-gold text-xs font-bold">{score}</span></div>}
        <div className="relative aspect-[3/4] overflow-hidden bg-shim-bgalt">
          {image && <img src={image} alt={title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" loading="lazy"/>}
          <div className="absolute inset-0 bg-gradient-to-t from-shim-bg via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"/>
          <button onClick={toggle} disabled={busy}
            className={`absolute bottom-2 right-2 z-10 p-1.5 rounded-lg border transition-all duration-200 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0
              ${inWL ? 'bg-shim-primary border-shim-primary text-white' : 'bg-black/70 border-shim-border text-shim-textD hover:border-shim-primary hover:text-shim-primary'}`}>
            <svg className="w-3.5 h-3.5" fill={inWL?'currentColor':'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"/></svg>
          </button>
        </div>
        <div className="p-3">
          <h3 className="text-xs font-medium text-shim-text clamp2 mb-1.5 leading-snug group-hover:text-shim-accent transition-colors">{title}</h3>
          <div className="flex flex-wrap gap-1 mb-1.5">{genres.map(g => <span key={g.mal_id} className="genre-tag">{g.name}</span>)}</div>
          <div className="flex items-center justify-between text-xs text-shim-muted"><span>{eps} eps</span><span>{year}</span></div>
          {anime.status === 'Currently Airing' && <div className="mt-1.5 flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"/><span className="text-green-400 text-xs">Airing</span></div>}
        </div>
      </div>
    </Link>
  )
}
