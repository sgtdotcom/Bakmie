import { Transaction } from '@/types'
import { formatRupiah } from '@/lib/utils'

interface ReceiptProps {
  transaction: Transaction
}

export default function Receipt({ transaction: t }: ReceiptProps) {
  return (
    <div className="font-sans text-xs bg-white p-3.5 rounded-xl border border-dashed border-[#D9CCB0]">
      <div className="text-center mb-2.5">
        <div className="font-playfair text-sm font-bold text-[#1B4A3A]">
          Warung Bakmie "SEKTOR ANTAPANI"
        </div>
        <div className="text-[10px] text-[#7A6E5A] mt-0.5">📍 Jl. Terusan Jakarta No.78A, Antapani</div>
        <div className="text-[10px] text-[#7A6E5A]">📞 (022) 555-7890</div>
      </div>

      <div className="border-t border-dashed border-[#D9CCB0] my-2" />

      <div className="flex justify-between mb-1"><span>{t.id}</span><span>{t.time}</span></div>
      <div className="flex justify-between font-bold mb-1"><span>Meja:</span><span>{t.tableName}</span></div>
      {t.cashierName && <div className="flex justify-between mb-1"><span>Kasir:</span><span>{t.cashierName}</span></div>}

      <div className="border-t border-dashed border-[#D9CCB0] my-2" />

      {t.items.map((item, i) => (
        <div key={i}>
          <div className="flex justify-between gap-1">
            <span>{item.quantity}× {item.name}</span>
            <span className="shrink-0">{formatRupiah(item.price * item.quantity)}</span>
          </div>
          {item.note && (
            <div className="text-[10px] text-[#7A6E5A] italic pl-2 mb-0.5">📝 {item.note}</div>
          )}
        </div>
      ))}

      <div className="border-t border-dashed border-[#D9CCB0] my-2" />

      <div className="flex justify-between mb-1"><span>Subtotal</span><span>{formatRupiah(t.subtotal)}</span></div>
      {t.discount > 0 && <div className="flex justify-between mb-1"><span>Diskon</span><span>-{formatRupiah(t.discount)}</span></div>}
      <div className="flex justify-between font-black text-sm text-[#1B4A3A] pt-1.5 border-t border-[#D9CCB0]">
        <span>TOTAL</span><span>{formatRupiah(t.total)}</span>
      </div>

      <div className="border-t border-dashed border-[#D9CCB0] my-2" />

      <div className="flex justify-between font-bold">
        <span>Bayar ({t.paymentMethod})</span>
        <span>{t.cashReceived ? formatRupiah(t.cashReceived) : t.paymentMethod}</span>
      </div>
      {t.change > 0 && (
        <div className="flex justify-between font-bold mt-0.5">
          <span>Kembalian</span><span>{formatRupiah(t.change)}</span>
        </div>
      )}

      <div className="text-center text-[10px] text-[#7A6E5A] mt-3 leading-relaxed">
        — Terima kasih atas kunjungan Anda —<br />Selamat menikmati! 🍜
      </div>
    </div>
  )
}
