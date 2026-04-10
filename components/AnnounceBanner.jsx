'use client'
import { useEffect, useState } from 'react'
import { getAnnouncements } from '@/lib/db'

export default function AnnounceBanner() {
  const [list,    setList]    = useState([])
  const [cur,     setCur]     = useState(0)
  const [visible, setVisible] = useState(true)

  useEffect(() => { getAnnouncements().then(setList).catch(()=>{}) }, [])
  useEffect(() => {
    if (list.length <= 1) return
    const t = setInterval(() => setCur(c => (c+1)%list.length), 5000)
    return () => clearInterval(t)
  }, [list])

  if (!visible || !list.length) return null
  const ann = list[cur]

  return (
    <div className="fixed top-16 left-0 right-0 z-40 flex items-center justify-center px-4 py-2 border-b border-shim-primary/30" style={{background:'linear-gradient(90deg,rgba(155,48,85,0.9),rgba(200,68,106,0.9),rgba(155,48,85,0.9))'}}>
      <div className="flex items-center gap-3 text-sm text-white max-w-3xl w-full">
        <span>📢</span>
        <div className="flex-1 truncate"><span className="font-semibold mr-2">{ann.title}:</span><span className="opacity-90">{ann.message}</span></div>
        {list.length > 1 && <span className="text-xs opacity-60 flex-shrink-0">{cur+1}/{list.length}</span>}
        <button onClick={() => setVisible(false)} className="opacity-60 hover:opacity-100 transition-opacity flex-shrink-0">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
        </button>
      </div>
    </div>
  )
}
