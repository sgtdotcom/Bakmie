'use client'
import { OrderItem } from '@/types'

interface DapurNotifProps {
  open: boolean
  tableName: string
  items: OrderItem[]
  onClose: () => void
}

export default function DapurNotif({ open, tableName, items, onClose }: DapurNotifProps) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-[300] bg-[#0A1610]/75 backdrop-blur-sm flex items-center justify-center p-5">
      <div className="bg-[#153C2E] border-2 border-[#E8B020] rounded-2xl p-6 w-full max-w-sm shadow-[0_10px_50px_rgba(0,0,0,0.5)] animate-fade-in">
        <div className="font-playfair text-lg font-bold text-[#F5EDD8] mb-1">👨‍🍳 Masuk ke Dapur!</div>
        <div className="text-xs font-semibold text-[#E8B020] mb-4">
          📍 {tableName} — {new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
        </div>

        <div className="bg-black/20 rounded-xl p-3 mb-4 space-y-1">
          {items.map((item, i) => (
            <div key={i} className="text-sm text-[#F5EDD8] py-1 border-b border-white/6 last:border-none leading-relaxed">
              <span className="font-bold">{item.quantity}×</span> {item.name}
              {item.note && (
                <div className="text-xs text-[#E8B020] italic pl-3">📝 {item.note}</div>
              )}
            </div>
          ))}
        </div>

        <button
          onClick={onClose}
          className="w-full bg-[#E8B020] hover:bg-[#F5C840] text-[#0E2820] font-bold text-sm py-3 rounded-xl transition-colors"
        >
          ✅ OK — Kembali ke Dashboard
        </button>
      </div>
    </div>
  )
}
