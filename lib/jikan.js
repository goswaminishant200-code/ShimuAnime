const B = 'https://api.jikan.moe/v4'
const jf = (p) => fetch(`${B}${p}`, { next: { revalidate: 3600 } }).then(r => r.json())

export const getTrending   = ()       => jf('/top/anime?filter=airing&limit=10')
export const getSeasonal   = ()       => jf('/seasons/now?limit=12')
export const getTopAnime   = (pg=1)   => jf(`/top/anime?page=${pg}&limit=20`)
export const getAnimeById  = (id)     => jf(`/anime/${id}/full`)
export const getEpisodes   = (id,pg=1)=> jf(`/anime/${id}/episodes?page=${pg}`)
export const getCharacters = (id)     => jf(`/anime/${id}/characters`)
export const getRecommend  = (id)     => jf(`/anime/${id}/recommendations`)
export const searchAnime   = (q,pg=1) => jf(`/anime?q=${encodeURIComponent(q)}&page=${pg}&limit=20`)
export const getByGenre    = (g,pg=1) => jf(`/anime?genres=${g}&page=${pg}&limit=20`)
export const getAnimeNews  = (id)     => jf(`/anime/${id}/news?limit=5`)

export const GENRES = [
  {id:1,name:'Action'},{id:2,name:'Adventure'},{id:4,name:'Comedy'},
  {id:8,name:'Drama'},{id:10,name:'Fantasy'},{id:14,name:'Horror'},
  {id:7,name:'Mystery'},{id:22,name:'Romance'},{id:24,name:'Sci-Fi'},
  {id:36,name:'Slice of Life'},{id:30,name:'Sports'},{id:37,name:'Supernatural'},
]
