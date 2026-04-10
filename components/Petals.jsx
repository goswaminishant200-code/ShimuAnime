'use client'
import { useEffect } from 'react'
export default function Petals() {
  useEffect(() => {
    const ps = Array.from({ length: 18 }, () => {
      const p = document.createElement('div')
      const s = 6 + Math.random() * 6
      p.className = 'sakura-petal'
      p.style.cssText = `left:${Math.random()*100}vw;width:${s}px;height:${s}px;animation-duration:${7+Math.random()*10}s;animation-delay:${Math.random()*12}s`
      document.body.appendChild(p); return p
    })
    return () => ps.forEach(p => p.remove())
  }, [])
  return null
}
