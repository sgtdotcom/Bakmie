'use client'
import { useRef } from 'react'
import { X } from 'lucide-react'

interface BottomSheetProps {
  open: boolean
  onClose: () => void
  title: React.ReactNode
  children: React.ReactNode
  height?: string
}

export default function BottomSheet({ open, onClose, title, children, height = 'h-[72vh]' }: BottomSheetProps) {
  const overlayRef = useRef<HTMLDivElement>(null)

  if (!open) return null

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[70] bg-[#0A1610]/60"
      onClick={e => { if (e.target === overlayRef.current) onClose() }}
    >
      <div className={`absolute bottom-0 left-0 right-0 ${height} bg-white rounded-t-[18px] shadow-[0_-4px_32px_rgba(0,0,0,0.3)] flex flex-col animate-slide-up`}>
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-2.5 bg-[#1B4A3A] rounded-t-[18px] shrink-0 border-b border-[#E8B020]/30">
          <div className="w-8 h-1 bg-white/25 rounded-full mx-auto absolute left-1/2 -translate-x-1/2 top-2" />
          <div className="font-playfair text-sm font-bold text-[#F5EDD8]">{title}</div>
          <button onClick={onClose} className="text-white/60 hover:text-white p-1">
            <X size={17} />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}
