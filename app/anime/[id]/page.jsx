import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import AnimeDetail from '@/components/AnimeDetail_fixed'
import { getAnimeById, getEpisodes, getCharacters, getRecommend } from '@/lib/jikan'
import { notFound } from 'next/navigation'

export async function generateMetadata({ params }) {
  try {
    const d = await getAnimeById(params.id)
    return { title: `${d.data?.title_english||d.data?.title} — ShimuAnime` }
  } catch { return { title: 'Anime — ShimuAnime' } }
}

export default async function AnimePage({ params }) {
  let anime, episodes, characters, recs
  try {
    const [a,e,c,r] = await Promise.allSettled([
      getAnimeById(params.id), getEpisodes(params.id),
      getCharacters(params.id), getRecommend(params.id),
    ])
    anime      = a.status==='fulfilled' ? a.value?.data       : null
    episodes   = e.status==='fulfilled' ? e.value?.data||[]   : []
    characters = c.status==='fulfilled' ? c.value?.data?.slice(0,12)||[] : []
    recs       = r.status==='fulfilled' ? r.value?.data?.slice(0,6)||[]  : []
  } catch { notFound() }
  if (!anime) notFound()
  return (
    <div className="min-h-screen bg-shim-bg">
      <Navbar/>
      <AnimeDetail anime={anime} episodes={episodes} characters={characters} recs={recs}/>
      <Footer/>
    </div>
  )
}
