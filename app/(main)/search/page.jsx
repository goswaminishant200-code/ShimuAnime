'use client'
import { useState } from 'react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import AnimeCard from '@/components/AnimeCard'

export default function SearchPage() {
  const [q,        setQ]        = useState('')
  const [input,    setInput]    = useState('')
  const [results,  setResults]  = useState([])
  const [loading,  setLoading]  = useState(false)
  const [searched, setSearched] = useState(false)

  const search = async (e) => {
    e.preventDefault()
    if (!input.trim()) return
    setQ(input); setLoading(true); setSearched(true)
    try {
      const res  = await fetch(`https://api.jikan.moe/v4/anime?q=${encodeURIComponent(input)}&limit=20`)
      const data = await res.json()
      setResults(data.data || [])
    } catch { setResults([]) }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-shim-bg">
      <Navbar/>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-28 pb-16">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-shim-text mb-1">Search Anime</h1>
          <p className="text-shim-muted font-jp text-sm">アニメを検索</p>
        </div>

        <form onSubmit={search} className="flex gap-3 max-w-2xl mx-auto mb-12">
          <div className="relative flex-1">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-shim-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
            <input type="text" value={input} onChange={e=>setInput(e.target.value)} placeholder="e.g. Demon Slayer, One Piece..." className="input-base pl-11 text-base py-4" autoFocus/>
          </div>
          <button type="submit" className="btn-primary px-8">Search</button>
        </form>

        {loading&&(
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {Array(10).fill(0).map((_,i)=>(
              <div key={i} className="bg-shim-card rounded-xl overflow-hidden animate-pulse"><div className="aspect-[3/4] bg-shim-bgalt"/><div className="p-3 space-y-2"><div className="h-3 bg-shim-bgalt rounded w-3/4"/><div className="h-2 bg-shim-bgalt rounded w-1/2"/></div></div>
            ))}
          </div>
        )}

        {!loading&&searched&&results.length===0&&(
          <div className="text-center py-20">
            <div className="text-5xl mb-4">🔍</div>
            <p className="text-shim-textD font-medium">No results for "{q}"</p>
            <p className="text-shim-muted text-sm mt-1">Try a different keyword</p>
          </div>
        )}

        {!loading&&results.length>0&&(
          <>
            <p className="text-shim-muted text-sm mb-5">{results.length} results for "<span className="text-shim-accent">{q}</span>"</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {results.map(a=><AnimeCard key={a.mal_id} anime={a}/>)}
            </div>
          </>
        )}

        {!searched&&(
          <div className="text-center py-20 text-shim-muted">
            <div className="text-6xl mb-4">🌸</div>
            <p>Type an anime name to search</p>
            <p className="text-xs mt-2 font-jp">アニメ名を入力してください</p>
          </div>
        )}
      </main>
      <Footer/>
    </div>
  )
}
