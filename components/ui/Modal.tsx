'use client'
import { useEffect, useRef } from 'react'
import { X } from 'lucide-react'

interface ModalProps {
  open: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  maxWidth?: string
}

export default function Modal({ open, onClose, title, children, maxWidth = 'max-w-md' }: ModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    if (open) document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center bg-[#0E2820]/70 backdrop-blur-sm"
      onClick={e => { if (e.target === overlayRef.current) onClose() }}
    >
      <div className={`bg-white rounded-t-[18px] sm:rounded-2xl w-full ${maxWidth} max-h-[92vh] overflow-y-auto border-t-4 border-[#E8B020] shadow-2xl animate-slide-up sm:animate-fade-in`}>
        <div className="flex items-center justify-between px-5 pt-5 pb-3">
          <h2 className="font-playfair text-lg font-bold text-[#1A1208]">{title}</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-600">
            <X size={18} />
          </button>
        </div>
        <div className="px-5 pb-6">{children}</div>
      </div>
    </div>
  )
}
