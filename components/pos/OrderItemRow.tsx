'use client'
import { OrderItem } from '@/types'
import { formatRupiah } from '@/lib/utils'
import { Minus, Plus } from 'lucide-react'

interface OrderItemRowProps {
  item: OrderItem
  index: number
  onChangeQty: (index: number, delta: number) => void
  onChangeNote: (index: number, note: string) => void
}

export default function OrderItemRow({ item, index, onChangeQty, onChangeNote }: OrderItemRowProps) {
  return (
    <div className="bg-[#F5EDD8] border border-[#EDE0C4] rounded-xl mb-2">
      <div className="flex items-center gap-2 px-2.5 pt-2.5 pb-1.5">
        <span className="text-base shrink-0">{item.emoji}</span>
        <div className="flex-1 min-w-0">
          <div className="text-xs font-semibold text-[#1A1208] truncate">{item.name}</div>
          <div className="text-xs font-bold text-[#1B4A3A]">{formatRupiah(item.price * item.quantity)}</div>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={() => onChangeQty(index, -1)}
            className="w-6 h-6 rounded-md bg-[#EDE0C4] text-[#7A6E5A] flex items-center justify-center transition-colors hover:bg-red-500 hover:text-white active:bg-red-600"
          >
            <Minus size={13} strokeWidth={2.5} />
          </button>
          <span className="text-xs font-bold min-w-[16px] text-center text-[#1A1208]">{item.quantity}</span>
          <button
            onClick={() => onChangeQty(index, 1)}
            className="w-6 h-6 rounded-md bg-[#1B4A3A] text-white flex items-center justify-center transition-colors hover:bg-[#153C2E] active:bg-[#0E2820]"
          >
            <Plus size={13} strokeWidth={2.5} />
          </button>
        </div>
      </div>
      <div className="px-2.5 pb-2.5">
        <textarea
          rows={1}
          value={item.note}
          onChange={e => onChangeNote(index, e.target.value)}
          placeholder="📝 Catatan... (tidak pedas, tanpa es, extra saus)"
          className="w-full border border-[#D9CCB0] rounded-lg px-2 py-1.5 text-[11px] bg-white text-[#1A1208] outline-none focus:border-[#E8B020] resize-none placeholder:text-[#C8BFAD]"
        />
      </div>
    </div>
  )
}
