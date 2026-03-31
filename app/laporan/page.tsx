'use client'
import { useStore } from '@/store'
import AppShell from '@/components/layout/AppShell'
import { formatRupiah } from '@/lib/utils'

export default function LaporanPage() {
  const transactions = useStore(s => s.transactions)

  const total = transactions.reduce((s, t) => s + t.total, 0)
  const count = transactions.length
  const avg = count ? total / count : 0
  const items = transactions.reduce((s, t) => s + t.items.reduce((ss, i) => ss + i.quantity, 0), 0)

  const menuCount: Record<string, number> = {}
  transactions.forEach(t => t.items.forEach(i => {
    menuCount[i.name] = (menuCount[i.name] || 0) + i.quantity
  }))
  const topMenu = Object.entries(menuCount).sort((a, b) => b[1] - a[1]).slice(0, 8)
  const maxQty = topMenu[0]?.[1] || 1

  const methodCount: Record<string, number> = {}
  transactions.forEach(t => {
    methodCount[t.paymentMethod] = (methodCount[t.paymentMethod] || 0) + t.total
  })

  const cards = [
    { label: 'Total Pendapatan', value: formatRupiah(total), color: 'border-[#1B4A3A]', sub: 'Hari ini' },
    { label: 'Jumlah Transaksi', value: count, color: 'border-[#E8B020]', sub: 'Selesai' },
    { label: 'Rata-rata Transaksi', value: formatRupiah(avg), color: 'border-blue-400', sub: 'Per transaksi' },
    { label: 'Total Item Terjual', value: items, color: 'border-red-400', sub: 'Porsi' },
  ]

  return (
    <AppShell showBack backLabel="Dashboard" backHref="/dashboard" allowedRoles={['admin']}>
      <div className="bg-[#1B4A3A] px-4 py-3 border-b-2 border-[#E8B020]/25 shrink-0">
        <h1 className="font-playfair text-base font-bold text-[#F5EDD8]">Laporan Harian</h1>
      </div>

      <div className="flex-1 overflow-y-auto p-3.5 flex flex-col gap-3.5">
        {/* Stat cards */}
        <div className="grid grid-cols-2 gap-2.5">
          {cards.map((c, i) => (
            <div key={i} className={`bg-white rounded-xl p-3.5 shadow-sm border-l-4 ${c.color}`}>
              <div className="text-[10px] text-[#7A6E5A] font-medium uppercase tracking-wide mb-1">{c.label}</div>
              <div className="font-playfair text-lg font-bold text-[#1A1208]">{c.value}</div>
              <div className="text-[10px] text-[#7A6E5A] mt-0.5">{c.sub}</div>
            </div>
          ))}
        </div>

        {/* Top menu */}
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="text-sm font-bold text-[#1A1208] mb-3">🏆 Menu Terlaris</div>
          {topMenu.length === 0 ? (
            <div className="text-xs text-[#7A6E5A]">Belum ada data</div>
          ) : topMenu.map(([name, qty], i) => (
            <div key={i} className="mb-3 last:mb-0">
              <div className="flex justify-between text-xs mb-1">
                <span className="font-semibold text-[#1A1208]">{i + 1}. {name}</span>
                <span className="font-bold text-[#1B4A3A]">{qty}×</span>
              </div>
              <div className="h-1.5 bg-[#EDE0C4] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#1B4A3A] rounded-full transition-all"
                  style={{ width: `${(qty / maxQty * 100).toFixed(0)}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Payment methods */}
        {Object.keys(methodCount).length > 0 && (
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="text-sm font-bold text-[#1A1208] mb-3">💳 Metode Pembayaran</div>
            {Object.entries(methodCount).map(([method, amount], i) => (
              <div key={i} className="flex justify-between items-center py-2 border-b border-[#F5EDD8] last:border-none">
                <span className="text-sm font-semibold text-[#1A1208]">{method}</span>
                <span className="text-sm font-bold text-[#1B4A3A]">{formatRupiah(amount)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  )
}
