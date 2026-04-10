'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'
import { addToWatchlist, submitRating, getMyRating, addComment, getComments, deleteComment, checkWatchlist } from '@/lib/db'
import toast from 'react-hot-toast'

const TABS = ['Overview','Episodes','Characters','Comments']
const EPP  = 24

export default function AnimeDetail({ anime, episodes, characters, recs }) {
  const { user, profile, isPremium } = useAuth()
  const [tab,      setTab]      = useState('Overview')
  const [inWL,     setInWL]     = useState(false)
  const [myRating, setMyRating] = useState(0)
  const [hover,    setHover]    = useState(0)
  const [comments, setComments] = useState([])
  const [cmtText,  setCmtText]  = useState('')
  const [posting,  setPosting]  = useState(false)
  const [epPage,   setEpPage]   = useState(1)

  const title    = anime.title_english || anime.title
  const image    = anime.images?.jpg?.large_image_url || anime.images?.jpg?.image_url
  const score    = anime.score?.toFixed(1) || 'N/A'
  const genres   = anime.genres || []
  const studios  = anime.studios?.map(s=>s.name).join(', ') || 'Unknown'
  const pagedEps = episodes.slice((epPage-1)*EPP, epPage*EPP)
  const totalEpPg= Math.ceil(episodes.length/EPP)

  useEffect(() => {
    if (user) {
      checkWatchlist(user.id, anime.mal_id).then(setInWL)
      getMyRating(user.id, String(anime.mal_id)).then(setMyRating)
    }
  }, [user, anime.mal_id])

  useEffect(() => {
    if (tab==='Comments') getComments(String(anime.mal_id)).then(setComments).catch(()=>{})
  }, [tab, anime.mal_id])

  const toggleWL = async () => {
    if (!user) { toast.error('Login required'); return }
    if (inWL) { toast('Already in watchlist'); return }
    await addToWatchlist(user.id, anime.mal_id, { title, image, score, episodes: anime.episodes||'?' })
    setInWL(true); toast.success('Added to watchlist ✓')
  }

  const rate = async (r) => {
    if (!user) { toast.error('Login to rate'); return }
    setMyRating(r)
    await submitRating(user.id, String(anime.mal_id), r)
    toast.success(`Rated ${r}/10 ⭐`)
  }

  const postComment = async () => {
    if (!user) { toast.error('Login to comment'); return }
    if (!cmtText.trim()) return
    setPosting(true)
    try {
      await addComment(user.id, String(anime.mal_id), cmtText.trim(), profile?.display_name||'User')
      setCmtText('')
      const updated = await getComments(String(anime.mal_id))
      setComments(updated)
      toast.success('Comment posted!')
    } catch { toast.error('Failed') }
    setPosting(false)
  }

  const delComment = async (id) => {
    await deleteComment(id, user.id)
    setComments(c => c.filter(x => x.id !== id))
  }

  const META = [
    {l:'Episodes', v: anime.episodes||'?'},
    {l:'Status',   v: anime.status},
    {l:'Year',     v: anime.year},
    {l:'Studio',   v: studios},
    {l:'Source',   v: anime.source},
    {l:'Rating',   v: anime.rating},
  ].filter(m=>m.v)

  return (
    <main>
      {/* Banner */}
      <div className="relative h-[50vh] min-h-[360px]">
        <img src={image} alt={title} className="w-full h-full object-cover object-top" style={{filter:'brightness(0.22) blur(2px)'}}/>
        <div className="absolute inset-0" style={{background:'linear-gradient(to top,#07070f 0%,rgba(7,7,15,0.5) 60%,transparent 100%)'}}/>
        <div className="absolute inset-0" style={{background:'linear-gradient(to right,rgba(7,7,15,0.85),transparent)'}}/>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 -mt-56 relative z-10 pb-16">
        <div className="flex flex-col md:flex-row gap-8">

          {/* Poster + actions */}
          <div className="flex-shrink-0">
            <div className="w-44 md:w-52 rounded-2xl overflow-hidden border-2 border-shim-primary/40 shadow-2xl shadow-shim-primary/20 mx-auto md:mx-0">
              <img src={image} alt={title} className="w-full h-auto"/>
            </div>
            <div className="mt-4 space-y-2 w-44 md:w-52 mx-auto md:mx-0">
              <Link href={`/watch/${anime.mal_id}`} className="btn-primary w-full">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>Watch Now
              </Link>
              <button onClick={toggleWL} className={`btn-ghost w-full ${inWL?'!border-shim-primary !text-shim-accent':''}`}>
                <svg className="w-4 h-4" fill={inWL?'currentColor':'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"/></svg>
                {inWL?'In Watchlist':'+ Watchlist'}
              </button>
            </div>
            {/* Star rating */}
            <div className="mt-4 w-44 md:w-52 mx-auto md:mx-0 text-center">
              <p className="text-xs text-shim-muted mb-2">Your Rating</p>
              <div className="flex justify-center gap-0.5 flex-wrap">
                {[1,2,3,4,5,6,7,8,9,10].map(r=>(
                  <button key={r} onClick={()=>rate(r)} onMouseEnter={()=>setHover(r)} onMouseLeave={()=>setHover(0)}
                    className="text-lg transition-transform hover:scale-125">
                    <span style={{color:r<=(hover||myRating)?'#e8c97a':'#2a1a3a'}}>★</span>
                  </button>
                ))}
              </div>
              {myRating>0&&<p className="text-xs text-shim-gold mt-1">{myRating}/10</p>}
            </div>
          </div>

          {/* Info */}
          <div className="flex-1 pt-32 md:pt-8">
            <div className="flex flex-wrap gap-2 mb-3">
              {anime.status==='Currently Airing'&&<span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-500/20 border border-green-500/30 text-green-400 text-xs"><span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"/>Airing</span>}
              {genres.slice(0,4).map(g=><Link key={g.mal_id} href={`/catalog?genre=${g.mal_id}`} className="genre-tag">{g.name}</Link>)}
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-shim-text mb-1 leading-tight">{title}</h1>
            {anime.title!==title&&<p className="text-shim-muted text-sm mb-3 font-jp">{anime.title}</p>}

            <div className="flex items-center gap-6 mb-6">
              <div className="flex items-center gap-2"><span className="text-shim-gold text-2xl">★</span><span className="text-2xl font-bold text-shim-gold">{score}</span><span className="text-shim-muted text-sm">/10</span></div>
              {anime.rank&&<div className="text-shim-textD text-sm">#{anime.rank} <span className="text-shim-muted">Ranked</span></div>}
              {anime.popularity&&<div className="text-shim-textD text-sm">#{anime.popularity} <span className="text-shim-muted">Popular</span></div>}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
              {META.map(m=>(
                <div key={m.l} className="bg-shim-card border border-shim-border rounded-xl px-4 py-3">
                  <div className="text-xs text-shim-muted mb-0.5">{m.l}</div>
                  <div className="text-sm font-medium text-shim-text truncate">{m.v}</div>
                </div>
              ))}
            </div>

            {/* Tabs */}
            <div className="flex gap-1 mb-6 border-b border-shim-border overflow-x-auto">
              {TABS.map(t=>(
                <button key={t} onClick={()=>setTab(t)}
                  className={`flex-shrink-0 px-4 py-2.5 text-sm font-medium transition-all border-b-2 -mb-px ${tab===t?'border-shim-primary text-shim-primary':'border-transparent text-shim-textD hover:text-shim-text'}`}>
                  {t}
                </button>
              ))}
            </div>

            {/* Overview */}
            {tab==='Overview'&&(
              <div className="space-y-4">
                <p className="text-shim-textD leading-relaxed text-sm">{anime.synopsis||'No synopsis.'}</p>
                {recs.length>0&&(
                  <div className="mt-8">
                    <h3 className="text-shim-textD text-sm font-semibold mb-4">You might also like</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                      {recs.slice(0,6).map(r=>(
                        <Link key={r.entry?.mal_id} href={`/anime/${r.entry?.mal_id}`} className="group block">
                          <div className="rounded-xl overflow-hidden border border-shim-border hover:border-shim-primary/50 transition-all">
                            <img src={r.entry?.images?.jpg?.image_url} alt={r.entry?.title} className="w-full aspect-[3/4] object-cover group-hover:scale-105 transition-transform duration-300"/>
                            <div className="p-2"><p className="text-xs text-shim-textD clamp2 group-hover:text-shim-accent transition-colors">{r.entry?.title}</p></div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Episodes */}
            {tab==='Episodes'&&(
              <div>
                {episodes.length===0?(
                  <div>
                    <p className="text-shim-muted text-sm mb-4">Episode list unavailable. Use manual navigation:</p>
                    <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
                      {Array.from({length:Math.min(anime.episodes||24,100)},(_,i)=>i+1).map(ep=>(
                        <Link key={ep} href={`/watch/${anime.mal_id}?ep=${ep}`}
                          className="flex items-center justify-center py-2 rounded-lg text-xs font-medium bg-shim-card border border-shim-border text-shim-textD hover:border-shim-primary hover:text-shim-accent transition-all">
                          {ep}
                        </Link>
                      ))}
                    </div>
                  </div>
                ):(
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-5">
                      {pagedEps.map(ep=>(
                        <Link key={ep.mal_id} href={`/watch/${anime.mal_id}?ep=${ep.mal_id}`}
                          className="group flex items-center gap-3 p-3 rounded-xl bg-shim-card border border-shim-border hover:border-shim-primary/50 hover:bg-shim-cardH transition-all">
                          <div className="w-8 h-8 rounded-lg bg-shim-bgalt flex items-center justify-center text-xs font-bold text-shim-textD group-hover:bg-shim-primary group-hover:text-white transition-all flex-shrink-0">{ep.mal_id}</div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-shim-text group-hover:text-shim-accent transition-colors clamp2">{ep.title||`Episode ${ep.mal_id}`}</p>
                            {ep.aired&&<p className="text-xs text-shim-muted">{new Date(ep.aired).toLocaleDateString()}</p>}
                          </div>
                          {!isPremium&&ep.mal_id>3&&<span className="text-shim-gold text-xs flex-shrink-0">⭐</span>}
                        </Link>
                      ))}
                    </div>
                    {totalEpPg>1&&(
                      <div className="flex gap-2 flex-wrap">
                        {Array.from({length:totalEpPg},(_,i)=>(
                          <button key={i} onClick={()=>setEpPage(i+1)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${epPage===i+1?'bg-shim-primary text-white':'bg-shim-card border border-shim-border text-shim-textD hover:border-shim-primary/40'}`}>
                            {i*EPP+1}–{Math.min((i+1)*EPP,episodes.length)}
                          </button>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            {/* Characters */}
            {tab==='Characters'&&(
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {characters.length===0?<p className="text-shim-muted text-sm col-span-full">No character data.</p>:
                  characters.map(c=>(
                    <div key={c.character?.mal_id} className="flex gap-3 p-3 rounded-xl bg-shim-card border border-shim-border">
                      <img src={c.character?.images?.jpg?.image_url} alt={c.character?.name} className="w-12 h-12 rounded-lg object-cover flex-shrink-0"/>
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-shim-text clamp2 leading-snug">{c.character?.name}</p>
                        <p className="text-xs text-shim-muted mt-0.5">{c.role}</p>
                        {c.voice_actors?.[0]&&<p className="text-xs text-shim-muted">VA: {c.voice_actors[0].person?.name}</p>}
                      </div>
                    </div>
                  ))
                }
              </div>
            )}

            {/* Comments */}
            {tab==='Comments'&&(
              <div className="space-y-4">
                {user?(
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-shim-primary/20 flex items-center justify-center text-xs font-bold text-shim-accent flex-shrink-0">
                      {profile?.display_name?.[0]?.toUpperCase()||'U'}
                    </div>
                    <div className="flex-1">
                      <textarea value={cmtText} onChange={e=>setCmtText(e.target.value)} placeholder="Share your thoughts..." rows={3}
                        className="input-base resize-none mb-2"/>
                      <button onClick={postComment} disabled={posting||!cmtText.trim()} className="btn-primary">
                        {posting?'Posting...':'Post Comment'}
                      </button>
                    </div>
                  </div>
                ):(
                  <p className="text-shim-muted text-sm"><Link href="/login" className="text-shim-primary hover:text-shim-accent">Login</Link> to comment.</p>
                )}
                <div className="space-y-3 mt-4">
                  {comments.length===0&&<p className="text-shim-muted text-sm">No comments yet. Be the first!</p>}
                  {comments.map(c=>(
                    <div key={c.id} className="flex gap-3 p-4 rounded-xl bg-shim-card border border-shim-border">
                      <div className="w-8 h-8 rounded-full bg-shim-primary/20 flex items-center justify-center text-xs font-bold text-shim-accent flex-shrink-0">
                        {c.display_name?.[0]?.toUpperCase()||'U'}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <span className="text-sm font-medium text-shim-text">{c.display_name}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-shim-muted">{new Date(c.created_at).toLocaleDateString()}</span>
                            {user?.id===c.user_id&&(
                              <button onClick={()=>delComment(c.id)} className="text-xs text-red-400 hover:text-red-300 transition-colors">Delete</button>
                            )}
                          </div>
                        </div>
                        <p className="text-sm text-shim-textD leading-relaxed">{c.text}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
