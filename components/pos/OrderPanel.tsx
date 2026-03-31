'use client'
import { useStore } from '@/store'
import { formatRupiah } from '@/lib/utils'
import OrderItemRow from './OrderItemRow'
import { Trash2 } from 'lucide-react'

interface OrderPanelProps {
  tableName: string
  onOrder: () => void
  onClear: () => void
}

export default function OrderPanel({ tableName, onOrder, onClear }: OrderPanelProps) {
  const draft = useStore(s => s.draft)
  const changeDraftQty = useStore(s => s.changeDraftQty)
  const setDraftNote = useStore(s => s.setDraftNote)

  const subtotal = draft.reduce((s, i) => s + i.price * i.quantity, 0)
  const isEmpty = draft.length === 0

  return (
    <div className="flex flex-col h-full">
      {/* Items */}
      <div className="flex-1 overflow-y-auto p-2">
        {isEmpty ? (
          <div className="text-center py-10 text-[#7A6E5A]">
            <div className="text-4xl mb-3 opacity-30">🍽️</div>
            <div className="text-sm font-semibold">Belum ada item</div>
            <div className="text-xs mt-1 text-[#C8BFAD]">Ketuk menu untuk menambah</div>
          </div>
        ) : (
          draft.map((item, i) => (
            <OrderItemRow
              key={i}
              item={item}
              index={i}
              onChangeQty={changeDraftQty}
              onChangeNote={setDraftNote}
            />
          ))
        )}
      </div>

      {/* Summary */}
      <div className="border-t-2 border-[#EDE0C4] bg-[#F5EDD8] px-3 py-2.5 shrink-0">
        <div className="flex justify-between text-xs text-[#7A6E5A] mb-1">
          <span>Subtotal</span>
          <span>{formatRupiah(subtotal)}</span>
        </div>
        <div className="flex justify-between text-sm font-bold text-[#1A1208] border-t border-[#EDE0C4] pt-2 mt-1">
          <span>Subtotal</span>
          <span className="font-playfair text-[#1B4A3A]">{formatRupiah(subtotal)}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="px-3 pb-3 pt-2 flex flex-col gap-2 border-t border-[#EDE0C4] bg-white shrink-0">
        <button
          onClick={onOrder}
          disabled={isEmpty}
          className="w-full py-3 rounded-xl bg-[#1B4A3A] text-white text-sm font-bold transition-colors hover:bg-[#153C2E] disabled:bg-[#C8BFAD] disabled:cursor-not-allowed disabled:text-[#7A6E5A]"
        >
          🍽️ Pesan ke Dapur
        </button>
        <button
          onClick={onClear}
          disabled={isEmpty}
          className="w-full py-2 rounded-xl border border-[#EDE0C4] bg-white text-xs font-semibold text-[#7A6E5A] flex items-center justify-center gap-1.5 hover:border-red-300 hover:text-red-500 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Trash2 size={12} /> Bersihkan
        </button>
      </div>
    </div>
  )
}
