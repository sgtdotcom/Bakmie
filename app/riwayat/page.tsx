'use client'
import { useState } from 'react'
import { useStore } from '@/store'
import AppShell from '@/components/layout/AppShell'
import Modal from '@/components/ui/Modal'
import Receipt from '@/components/pos/Receipt'
import { formatRupiah } from '@/lib/utils'
import { Transaction } from '@/types'

export default function RiwayatPage() {
  const transactions = useStore(s => s.transactions)
  const [selected, setSelected] = useState<Transaction | null>(null)

  return (
    <AppShell showBack backLabel="Dashboard" backHref="/dashboard" allowedRoles={['admin', 'cashier']}>
      <div className="bg-[#1B4A3A] px-4 py-3 border-b-2 border-[#E8B020]/25 shrink-0">
        <h1 className="font-playfair text-base font-bold text-[#F5EDD8]">Riwayat Transaksi</h1>
        <p className="text-xs text-white/40 mt-0.5">
          {new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2.5">
        {transactions.length === 0 ? (
          <div className="text-center py-16 text-[#7A6E5A]">
            <div className="text-4xl mb-3 opacity-30">📋</div>
            <div className="text-sm font-semibold text-[#F5EDD8]/60">Belum ada transaksi</div>
          </div>
        ) : (
          transactions.map((t, i) => (
            <div key={i} className="bg-white rounded-xl p-3.5 shadow-sm border-l-4 border-[#245E4A]">
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs font-bold text-[#1A1208]">{t.id}</span>
                <span className="text-xs text-[#7A6E5A]">{t.time}</span>
              </div>
              <div className="text-xs font-semibold text-[#1B4A3A] mb-1.5">📍 {t.tableName}</div>
              <div className="text-xs text-[#7A6E5A] mb-2.5 leading-relaxed">
                {t.items.map(x => `${x.quantity}× ${x.name}${x.note ? ` (${x.note})` : ''}`).join(' · ')}
              </div>
              <div className="flex items-center justify-between flex-wrap gap-2">
                <span className="text-sm font-bold text-[#1B4A3A]">{formatRupiah(t.total)}</span>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] text-[#7A6E5A] bg-[#F5EDD8] px-2 py-0.5 rounded-full">{t.paymentMethod}</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#E3F0EB] text-[#1B4A3A]">Lunas</span>
                  <button
                    onClick={() => setSelected(t)}
                    className="text-[10px] font-semibold px-2 py-0.5 rounded-full border border-[#EDE0C4] bg-white text-[#7A6E5A] hover:border-[#1B4A3A] hover:text-[#1B4A3A] transition-colors"
                  >
                    🧾 Struk
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {selected && (
        <Modal open={!!selected} onClose={() => setSelected(null)} title="🧾 Struk Pembayaran">
          <Receipt transaction={selected} />
          <div className="flex gap-2 mt-4">
            <button onClick={() => setSelected(null)} className="flex-1 py-2.5 border border-[#EDE0C4] rounded-xl text-sm font-semibold text-[#7A6E5A]">Tutup</button>
            <button onClick={() => window.print()} className="flex-1 py-2.5 bg-[#1B4A3A] text-white rounded-xl text-sm font-bold">🖨 Cetak</button>
          </div>
        </Modal>
      )}
    </AppShell>
  )
}
