'use client'
import { useState, useEffect } from 'react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { getNews } from '@/lib/db'

const IDS = [52991, 51009, 40748, 50265, 49596]

export default function NewsPage() {
  const [siteNews,  setSiteNews]  = useState([])
  const [malNews,   setMalNews]   = useState([])
  const [loading,   setLoading]   = useState(true)
  const [src,       setSrc]       = useState('all')
  const [category,  setCategory]  = useState('All')

  useEffect(() => {
    setLoading(true)
    Promise.all([
      getNews().catch(()=>[]),
      ...IDS.map(id => fetch(`https://api.jikan.moe/v4/anime/${id}/news?limit=5`).then(r=>r.json()).catch(()=>({data:[]})))
    ]).then(([sn, ...rests]) => {
      setSiteNews(sn)
      setMalNews(rests.flatMap(r=>r.data||[]).sort((a,b)=>new Date(b.date)-new Date(a.date)))
    }).finally(()=>setLoading(false))
  }, [])

  const cats  = ['All','General','New Season','Episode Release','Movie','Announcement','Review']
  const shown = siteNews.filter(n => category==='All' || n.category===category)

  return (
    <div className="min-h-screen bg-shim-bg">
      <Navbar/>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-24 pb-16">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-shim-text mb-1">Anime News</h1>
          <p className="text-shim-muted font-jp text-sm">アニメニュース</p>
        </div>

        {/* Source tabs */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {[{k:'all',l:'All News'},{k:'site',l:'Site News'},{k:'mal',l:'Anime Updates'}].map(t=>(
            <button key={t.k} onClick={()=>setSrc(t.k)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${src===t.k?'bg-shim-primary text-white shadow-lg shadow-shim-primary/30':'bg-shim-card border border-shim-border text-shim-textD hover:text-shim-text'}`}>
              {t.l}
            </button>
          ))}
        </div>

        {/* Category filter */}
        {(src==='all'||src==='site') && (
          <div className="flex flex-wrap gap-2 mb-6">
            {cats.map(c=>(
              <button key={c} onClick={()=>setCategory(c)}
                className={`genre-tag cursor-pointer ${category===c?'!bg-shim-primary/30 !border-shim-primary !text-shim-accent':''}`}>
                {c}
              </button>
            ))}
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array(9).fill(0).map((_,i)=><div key={i} className="bg-shim-card rounded-xl h-40 animate-pulse"/>)}
          </div>
        ) : (
          <>
            {/* Site news */}
            {(src==='all'||src==='site') && shown.length>0 && (
              <div className="mb-10">
                {src==='all'&&<h2 className="text-base font-semibold text-shim-text mb-4 flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-shim-primary"/>Site Articles</h2>}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {shown.map(n=>(
                    <div key={n.id} className="glass rounded-xl border border-shim-border group hover:border-shim-primary/40 transition-all overflow-hidden">
                      {n.image_url&&<img src={n.image_url} alt="" className="w-full h-36 object-cover group-hover:scale-105 transition-transform duration-300"/>}
                      <div className="p-4">
                        <div className="flex items-center gap-2 mb-2"><span className="genre-tag">{n.category}</span></div>
                        <h3 className="font-semibold text-shim-text text-sm mb-2 clamp2 group-hover:text-shim-accent transition-colors">{n.title}</h3>
                        <p className="text-shim-textD text-xs clamp3 leading-relaxed">{n.content}</p>
                        <div className="flex items-center justify-between mt-3">
                          <span className="text-xs text-shim-muted">by {n.author}</span>
                          <span className="text-xs text-shim-muted">{new Date(n.created_at).toLocaleDateString('en-US',{month:'short',day:'numeric'})}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* MAL news */}
            {(src==='all'||src==='mal') && malNews.length>0 && (
              <div>
                {src==='all'&&<h2 className="text-base font-semibold text-shim-text mb-4 flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-blue-400"/>MyAnimeList News</h2>}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {malNews.map((n,i)=>(
                    <a key={n.mal_id||i} href={n.url} target="_blank" rel="noopener noreferrer"
                      className="group glass rounded-xl border border-shim-border hover:border-blue-400/40 transition-all p-4">
                      <div className="flex gap-3">
                        {n.images?.jpg?.image_url&&<img src={n.images.jpg.image_url} alt="" className="w-14 h-20 rounded-lg object-cover flex-shrink-0"/>}
                        <div className="flex-1 min-w-0">
                          <h3 className="text-xs font-medium text-shim-text clamp3 group-hover:text-blue-300 transition-colors mb-2 leading-snug">{n.title}</h3>
                          <p className="text-xs text-shim-muted">{n.date?new Date(n.date).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'}):''}</p>
                          {n.author_username&&<p className="text-xs text-shim-textD">by {n.author_username}</p>}
                        </div>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {src==='site'&&shown.length===0&&<div className="text-center py-12 text-shim-muted"><div className="text-4xl mb-3">📰</div><p>No articles yet</p></div>}
          </>
        )}
      </main>
      <Footer/>
    </div>
  )
}
