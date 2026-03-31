'use client'
import { useState, useEffect } from 'react'

export default function Clock() {
  const [time, setTime] = useState('')
  useEffect(() => {
    const update = () => setTime(new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }))
    update()
    const id = setInterval(update, 1000)
    return () => clearInterval(id)
  }, [])
  return <span className="text-[11px] font-bold text-[#F5C840] tabular-nums hidden sm:block">{time}</span>
}
