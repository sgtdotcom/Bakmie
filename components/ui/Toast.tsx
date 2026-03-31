'use client'
import { useState, useCallback, useEffect, useRef } from 'react'

let globalShowToast: ((msg: string) => void) | null = null

export function showToast(msg: string) {
  globalShowToast?.(msg)
}

export default function Toast() {
  const [msg, setMsg] = useState('')
  const [visible, setVisible] = useState(false)
  const timerRef = useRef<NodeJS.Timeout>()

  const show = useCallback((m: string) => {
    setMsg(m)
    setVisible(true)
    clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => setVisible(false), 2300)
  }, [])

  useEffect(() => { globalShowToast = show }, [show])

  return (
    <div className={`fixed top-16 left-1/2 z-[500] -translate-x-1/2 bg-[#0E2820] text-[#F5EDD8] px-4 py-2 rounded-xl text-sm font-medium shadow-2xl border-l-4 border-[#E8B020] pointer-events-none transition-all duration-300 whitespace-nowrap max-w-[88vw] text-center ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'}`}>
      {msg}
    </div>
  )
}
