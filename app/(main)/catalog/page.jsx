'use client'
import { useState, useEffect, useCallback } from 'react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import AnimeCard from '@/components/AnimeCard'
import { GENRES } from '@/lib/jikan'

const FILTERS = [
  {key:'bypopularity',label:'Popular'},{key:'airing',label:'Airing'},
  {key:'upcoming',label:'Upcoming'},{key:'favorite',label:'Favorites'},
]

export default function CatalogPage() {
  const [list,    setList]    = useState([])
  const [loading, setLoading] = useState(true)
  const [page,    setPage]    = useState(1)
  const [hasNext, setHasNext] = useState(false)
  const [filter,  setFilter]  = useState('bypopularity')
  const [genre,   setGenre]   = useState('')
  const [query,   setQuery]   = useState('')
  const [input,   setInput]   = useState('')

  const fetch_ = useCallback(async () => {
    setLoading(true)
    try {
      let url = ''
      if (query) url = `https://api.jikan.moe/v4/anime?q=${encodeURIComponent(query)}&page=${page}&limit=20`
      else if (genre) url = `https://api.jikan.moe/v4/anime?genres=${genre}&page=${page}&limit=20`
      else url = `https://api.jikan.moe/v4/top/anime?filter=${filter}&page=${page}&limit=20`
      const res  = await fetch(url)
      const data = await res.json()
      setList(data.data || [])
      setHasNext(data.pagination?.has_next_page || false)
    } catch { setList([]) }
    setLoading(false)
  }, [query, genre, filter, page])

  useEffect(() => { fetch_() }, [fetch_])

  const doSearch = (e) => { e.preventDefault(); setQuery(input); setGenre(''); setPage(1) }
  const setF = (f) => { setFilter(f); setGenre(''); setQuery(''); setInput(''); setPage(1) }
  const setG = (g) => { setGenre(genre===g?'':g); setFilter(''); setQuery(''); setInput(''); setPage(1) }
  const clear = () => { setQuery(''); setGenre(''); setInput(''); setFilter('bypopularity'); setPage(1) }
  const pageTo = (p) => { setPage(p); window.scrollTo(0,0) }

  return (
    <div className="min-h-screen bg-shim-bg">
      <Navbar/>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-24 pb-16">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-shim-text mb-1">Anime Catalog</h1>
          <p className="text-shim-muted font-jp text-sm">アニメカタログ</p>
        </div>

        {/* Search */}
        <form onSubmit={doSearch} className="flex gap-3 mb-6">
          <div className="relative flex-1">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-shim-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
            <input type="text" value={input} onChange={e=>setInput(e.target.value)} placeholder="Search anime..." className="input-base pl-10"/>
          </div>
          <button type="submit" className="btn-primary px-6 py-3">Search</button>
        </form>

        {/* Filters */}
        {!query && !genre && (
          <div className="flex flex-wrap gap-2 mb-4">
            {FILTERS.map(f => (
              <button key={f.key} onClick={() => setF(f.key)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filter===f.key?'bg-shim-primary text-white shadow-lg shadow-shim-primary/30':'bg-shim-card border border-shim-border text-shim-textD hover:text-shim-text hover:border-shim-primary/40'}`}>
                {f.label}
              </button>
            ))}
          </div>
        )}

        {/* Genre tags */}
        <div className="flex flex-wrap gap-2 mb-8">
          <span className="text-xs text-shim-muted self-center">Genres:</span>
          {GENRES.map(g => (
            <button key={g.id} onClick={() => setG(String(g.id))}
              className={`genre-tag cursor-pointer transition-all ${genre===String(g.id)?'!bg-shim-primary/30 !border-shim-primary !text-shim-accent':''}`}>
              {g.name}
            </button>
          ))}
        </div>

        {/* Active filter label */}
        {(query||genre) && (
          <div className="flex items-center gap-2 mb-6">
            <span className="text-shim-textD text-sm">{query?`Results for "${query}"`:GENRES.find(g=>String(g.id)===genre)?.name}</span>
            <button onClick={clear} className="text-xs text-shim-primary hover:text-shim-accent transition-colors">× Clear</button>
          </div>
        )}

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {Array(20).fill(0).map((_,i)=>(
              <div key={i} className="bg-shim-card rounded-xl overflow-hidden animate-pulse">
                <div className="aspect-[3/4] bg-shim-bgalt"/>
                <div className="p-3 space-y-2"><div className="h-3 bg-shim-bgalt rounded w-3/4"/><div className="h-2 bg-shim-bgalt rounded w-1/2"/></div>
              </div>
            ))}
          </div>
        ) : list.length===0 ? (
          <div className="text-center py-24 text-shim-muted">
            <div className="text-5xl mb-4">🔍</div>
            <p className="text-lg font-medium text-shim-textD">No anime found</p>
            <p className="text-sm mt-1">Try a different search or filter</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {list.map((a,i) => <AnimeCard key={a.mal_id} anime={a} showRank={!query&&!genre} rank={(page-1)*20+i+1}/>)}
          </div>
        )}

        {/* Pagination */}
        {!loading && list.length>0 && (
          <div className="flex items-center justify-center gap-3 mt-12">
            <button onClick={()=>pageTo(page-1)} disabled={page===1} className="btn-ghost disabled:opacity-40 disabled:cursor-not-allowed">← Prev</button>
            <span className="text-sm text-shim-muted">Page {page}</span>
            <button onClick={()=>pageTo(page+1)} disabled={!hasNext} className="btn-ghost disabled:opacity-40 disabled:cursor-not-allowed">Next →</button>
          </div>
        )}
      </main>
      <Footer/>
    </div>
  )
}
