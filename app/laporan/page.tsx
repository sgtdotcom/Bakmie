'use client'
import { useState, useMemo } from 'react'
import { useStore } from '@/store'
import AppShell from '@/components/layout/AppShell'
import Modal from '@/components/ui/Modal'
import Receipt from '@/components/pos/Receipt'
import { formatRupiah } from '@/lib/utils'
import { Transaction } from '@/types'
import { ChevronLeft, ChevronRight } from 'lucide-react'

const MONTHS = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des']
const MONTHS_FULL = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember']

function StatCard({ label, value, sub, color }: { label: string; value: string | number; sub?: string; color?: string }) {
  return (
    <div className={`bg-white rounded-xl p-3.5 shadow-sm border-l-4 ${color || 'border-[#1B4A3A]'}`}>
      <div className="text-[10px] text-[#7A6E5A] font-medium uppercase tracking-wide mb-1">{label}</div>
      <div className="font-playfair text-lg font-bold text-[#1A1208] leading-tight">{value}</div>
      {sub && <div className="text-[10px] text-[#7A6E5A] mt-0.5">{sub}</div>}
    </div>
  )
}

export default function LaporanPage() {
  const { transactions } = useStore()

  const now = new Date()
  const [viewYear, setViewYear] = useState(now.getFullYear())
  const [viewMonth, setViewMonth] = useState(now.getMonth()) // 0-indexed
  const [tab, setTab] = useState<'harian' | 'bulanan' | 'tahunan'>('bulanan')
  const [selectedTrx, setSelectedTrx] = useState<Transaction | null>(null)

  // --- Filter helpers ---
  const trxThisMonth = useMemo(() =>
    transactions.filter(t => {
      if (!t.date) return false
      const [y, m] = t.date.split('-').map(Number)
      return y === viewYear && m === viewMonth + 1
    }),
  [transactions, viewYear, viewMonth])

  const trxThisYear = useMemo(() =>
    transactions.filter(t => {
      if (!t.date) return false
      return Number(t.date.split('-')[0]) === viewYear
    }),
  [transactions, viewYear])

  // --- Stats calculator ---
  const stats = (trxs: Transaction[]) => {
    const rev = trxs.reduce((s, t) => s + t.total, 0)
    const cnt = trxs.length
    const avg = cnt ? rev / cnt : 0
    const items = trxs.reduce((s, t) => s + t.items.reduce((ss, i) => ss + i.quantity, 0), 0)
    return { rev, cnt, avg, items }
  }

  // --- Top menu ---
  const topMenu = (trxs: Transaction[]) => {
    const mc: Record<string, number> = {}
    trxs.forEach(t => t.items.forEach(i => { mc[i.name] = (mc[i.name] || 0) + i.quantity }))
    const sorted = Object.entries(mc).sort((a, b) => b[1] - a[1]).slice(0, 5)
    const max = sorted[0]?.[1] || 1
    return { sorted, max }
  }

  // --- Monthly breakdown for year view ---
  const monthlyBreakdown = useMemo(() =>
    MONTHS.map((label, m) => {
      const trxs = transactions.filter(t => {
        if (!t.date) return false
        const [y, mo] = t.date.split('-').map(Number)
        return y === viewYear && mo === m + 1
      })
      return { label, ...stats(trxs) }
    }),
  [transactions, viewYear])

  // --- Daily breakdown for month view ---
  const dailyBreakdown = useMemo(() => {
    const days: Record<string, Transaction[]> = {}
    trxThisMonth.forEach(t => {
      if (!t.date) return
      days[t.date] = days[t.date] || []
      days[t.date].push(t)
    })
    return Object.entries(days)
      .sort((a, b) => b[0].localeCompare(a[0]))
      .map(([date, trxs]) => ({ date, ...stats(trxs), trxs }))
  }, [trxThisMonth])

  const monthStats = stats(trxThisMonth)
  const yearStats = stats(trxThisYear)
  const { sorted: topMonthMenu, max: topMonthMax } = topMenu(trxThisMonth)
  const { sorted: topYearMenu, max: topYearMax } = topMenu(trxThisYear)

  const methodBreakdown = (trxs: Transaction[]) => {
    const mc: Record<string, number> = {}
    trxs.forEach(t => { mc[t.paymentMethod] = (mc[t.paymentMethod] || 0) + t.total })
    return Object.entries(mc).sort((a, b) => b[1] - a[1])
  }

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1) }
    else setViewMonth(m => m - 1)
  }
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1) }
    else setViewMonth(m => m + 1)
  }

  return (
    <AppShell showBack backLabel="Dashboard" backHref="/dashboard" allowedRoles={['admin', 'superadmin']}>

      {/* Tabs */}
      <div className="flex bg-[#153C2E] border-b-2 border-[#E8B020]/25 shrink-0">
        {(['harian', 'bulanan', 'tahunan'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-2.5 text-xs font-semibold transition-colors border-b-2 capitalize ${
              tab === t ? 'text-[#E8B020] border-[#E8B020]' : 'text-white/50 border-transparent hover:text-white/80'
            }`}
          >
            {t === 'harian' ? '📅 Harian' : t === 'bulanan' ? '📆 Bulanan' : '📊 Tahunan'}
          </button>
        ))}
      </div>

      {/* ════ BULANAN ════ */}
      {tab === 'bulanan' && (
        <div className="flex-1 overflow-y-auto p-3.5 flex flex-col gap-3">
          {/* Month navigator */}
          <div className="flex items-center justify-between bg-[#1B4A3A]/60 border border-[#E8B020]/25 rounded-xl px-4 py-2.5">
            <button onClick={prevMonth} className="p-1 text-[#E8B020] hover:text-[#F5C840] transition-colors">
              <ChevronLeft size={18} />
            </button>
            <div className="text-center">
              <div className="font-playfair text-base font-bold text-[#F5EDD8]">
                {MONTHS_FULL[viewMonth]} {viewYear}
              </div>
              <div className="text-[10px] text-white/40">{monthStats.cnt} transaksi</div>
            </div>
            <button onClick={nextMonth} className="p-1 text-[#E8B020] hover:text-[#F5C840] transition-colors">
              <ChevronRight size={18} />
            </button>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-2 gap-2.5">
            <StatCard label="Pendapatan" value={formatRupiah(monthStats.rev)} sub="Bulan ini" color="border-[#1B4A3A]" />
            <StatCard label="Transaksi" value={monthStats.cnt} sub="Selesai" color="border-[#E8B020]" />
            <StatCard label="Rata-rata" value={formatRupiah(monthStats.avg)} sub="Per transaksi" color="border-blue-400" />
            <StatCard label="Item Terjual" value={monthStats.items} sub="Porsi" color="border-red-400" />
          </div>

          {/* Top menu bulan ini */}
          {topMonthMenu.length > 0 && (
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <div className="text-sm font-bold text-[#1A1208] mb-3">🏆 Menu Terlaris Bulan Ini</div>
              {topMonthMenu.map(([name, qty], i) => (
                <div key={i} className="mb-3 last:mb-0">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-semibold text-[#1A1208]">{i + 1}. {name}</span>
                    <span className="font-bold text-[#1B4A3A]">{qty}×</span>
                  </div>
                  <div className="h-1.5 bg-[#EDE0C4] rounded-full overflow-hidden">
                    <div className="h-full bg-[#1B4A3A] rounded-full" style={{ width: `${(qty / topMonthMax * 100).toFixed(0)}%` }} />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Metode pembayaran */}
          {methodBreakdown(trxThisMonth).length > 0 && (
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <div className="text-sm font-bold text-[#1A1208] mb-3">💳 Metode Pembayaran</div>
              {methodBreakdown(trxThisMonth).map(([method, amount]) => (
                <div key={method} className="flex justify-between items-center py-2 border-b border-[#F5EDD8] last:border-none">
                  <span className="text-sm font-semibold text-[#1A1208]">{method}</span>
                  <span className="text-sm font-bold text-[#1B4A3A]">{formatRupiah(amount)}</span>
                </div>
              ))}
            </div>
          )}

          {/* Daily breakdown */}
          {dailyBreakdown.length > 0 && (
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <div className="text-sm font-bold text-[#1A1208] mb-3">📅 Rincian Per Hari</div>
              {dailyBreakdown.map(({ date, rev, cnt, trxs: dayTrxs }) => (
                <div key={date} className="py-2.5 border-b border-[#F5EDD8] last:border-none">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="text-xs font-bold text-[#1A1208]">
                        {new Date(date + 'T00:00:00').toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' })}
                      </div>
                      <div className="text-[10px] text-[#7A6E5A] mt-0.5">{cnt} transaksi</div>
                    </div>
                    <div className="text-sm font-bold text-[#1B4A3A]">{formatRupiah(rev)}</div>
                  </div>
                  {/* Transaction list for this day */}
                  <div className="mt-2 space-y-1.5">
                    {dayTrxs.map((t, i) => (
                      <div key={i} className="flex justify-between items-center bg-[#F5EDD8] rounded-lg px-2.5 py-1.5">
                        <div>
                          <span className="text-[10px] font-bold text-[#1A1208]">{t.id}</span>
                          <span className="text-[10px] text-[#7A6E5A] ml-2">{t.time} · {t.tableName}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-bold text-[#1B4A3A]">{formatRupiah(t.total)}</span>
                          <button onClick={() => setSelectedTrx(t)} className="text-[9px] border border-[#D9CCB0] bg-white rounded-md px-1.5 py-0.5 text-[#7A6E5A] hover:border-[#1B4A3A] hover:text-[#1B4A3A]">🧾</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {monthStats.cnt === 0 && (
            <div className="text-center py-12 text-white/40">
              <div className="text-4xl mb-3">📭</div>
              <div className="text-sm">Tidak ada transaksi bulan ini</div>
            </div>
          )}
        </div>
      )}

      {/* ════ TAHUNAN ════ */}
      {tab === 'tahunan' && (
        <div className="flex-1 overflow-y-auto p-3.5 flex flex-col gap-3">
          {/* Year navigator */}
          <div className="flex items-center justify-between bg-[#1B4A3A]/60 border border-[#E8B020]/25 rounded-xl px-4 py-2.5">
            <button onClick={() => setViewYear(y => y - 1)} className="p-1 text-[#E8B020] hover:text-[#F5C840]">
              <ChevronLeft size={18} />
            </button>
            <div className="text-center">
              <div className="font-playfair text-lg font-bold text-[#F5EDD8]">Tahun {viewYear}</div>
              <div className="text-[10px] text-white/40">{yearStats.cnt} transaksi</div>
            </div>
            <button onClick={() => setViewYear(y => y + 1)} className="p-1 text-[#E8B020] hover:text-[#F5C840]">
              <ChevronRight size={18} />
            </button>
          </div>

          {/* Year stats */}
          <div className="grid grid-cols-2 gap-2.5">
            <StatCard label="Total Pendapatan" value={formatRupiah(yearStats.rev)} sub={`Tahun ${viewYear}`} color="border-[#1B4A3A]" />
            <StatCard label="Total Transaksi" value={yearStats.cnt} sub="Selesai" color="border-[#E8B020]" />
            <StatCard label="Rata-rata/Transaksi" value={formatRupiah(yearStats.avg)} sub="Per transaksi" color="border-blue-400" />
            <StatCard label="Total Item" value={yearStats.items} sub="Porsi terjual" color="border-red-400" />
          </div>

          {/* Monthly chart */}
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="text-sm font-bold text-[#1A1208] mb-4">📊 Pendapatan Per Bulan</div>
            {(() => {
              const maxRev = Math.max(...monthlyBreakdown.map(m => m.rev), 1)
              return (
                <div className="space-y-2.5">
                  {monthlyBreakdown.map((m, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <span className="text-[10px] font-semibold text-[#7A6E5A] w-8 shrink-0">{m.label}</span>
                      <div className="flex-1 h-5 bg-[#F5EDD8] rounded-full overflow-hidden relative">
                        <div
                          className="h-full bg-[#1B4A3A] rounded-full transition-all flex items-center"
                          style={{ width: m.rev ? `${(m.rev / maxRev * 100).toFixed(0)}%` : '0%', minWidth: m.rev ? '2px' : 0 }}
                        />
                      </div>
                      <span className="text-[10px] font-bold text-[#1B4A3A] w-20 text-right shrink-0">
                        {m.rev ? formatRupiah(m.rev) : '—'}
                      </span>
                    </div>
                  ))}
                </div>
              )
            })()}
          </div>

          {/* Top menu tahun ini */}
          {topYearMenu.length > 0 && (
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <div className="text-sm font-bold text-[#1A1208] mb-3">🏆 Menu Terlaris Tahun Ini</div>
              {topYearMenu.map(([name, qty], i) => (
                <div key={i} className="mb-3 last:mb-0">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-semibold text-[#1A1208]">{i + 1}. {name}</span>
                    <span className="font-bold text-[#1B4A3A]">{qty}×</span>
                  </div>
                  <div className="h-1.5 bg-[#EDE0C4] rounded-full overflow-hidden">
                    <div className="h-full bg-[#1B4A3A] rounded-full" style={{ width: `${(qty / topYearMax * 100).toFixed(0)}%` }} />
                  </div>
                </div>
              ))}
            </div>
          )}

          {yearStats.cnt === 0 && (
            <div className="text-center py-12 text-white/40">
              <div className="text-4xl mb-3">📭</div>
              <div className="text-sm">Tidak ada transaksi tahun {viewYear}</div>
            </div>
          )}
        </div>
      )}

      {/* ════ HARIAN (semua transaksi dengan filter) ════ */}
      {tab === 'harian' && (
        <div className="flex-1 overflow-y-auto p-3.5 flex flex-col gap-3">
          {/* Month navigator */}
          <div className="flex items-center justify-between bg-[#1B4A3A]/60 border border-[#E8B020]/25 rounded-xl px-4 py-2.5">
            <button onClick={prevMonth} className="p-1 text-[#E8B020] hover:text-[#F5C840]">
              <ChevronLeft size={18} />
            </button>
            <span className="font-playfair text-sm font-bold text-[#F5EDD8]">
              {MONTHS_FULL[viewMonth]} {viewYear}
            </span>
            <button onClick={nextMonth} className="p-1 text-[#E8B020] hover:text-[#F5C840]">
              <ChevronRight size={18} />
            </button>
          </div>

          {trxThisMonth.length === 0 ? (
            <div className="text-center py-12 text-white/40">
              <div className="text-4xl mb-3">📭</div>
              <div className="text-sm">Tidak ada transaksi bulan ini</div>
            </div>
          ) : (
            trxThisMonth.map((t, i) => (
              <div key={i} className="bg-white rounded-xl p-3.5 shadow-sm border-l-4 border-[#245E4A]">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-bold text-[#1A1208]">{t.id}</span>
                  <span className="text-[10px] text-[#7A6E5A]">{t.date} · {t.time}</span>
                </div>
                <div className="text-[11px] font-semibold text-[#1B4A3A] mb-1">📍 {t.tableName}</div>
                <div className="text-[10px] text-[#7A6E5A] mb-2 leading-relaxed">
                  {t.items.map(x => `${x.quantity}× ${x.name}`).join(' · ')}
                </div>
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <span className="text-sm font-bold text-[#1B4A3A]">{formatRupiah(t.total)}</span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-[#7A6E5A] bg-[#F5EDD8] px-2 py-0.5 rounded-full">{t.paymentMethod}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#E3F0EB] text-[#1B4A3A]">Lunas</span>
                    <button onClick={() => setSelectedTrx(t)} className="text-[10px] border border-[#EDE0C4] bg-white px-2 py-0.5 rounded-full text-[#7A6E5A] hover:border-[#1B4A3A] hover:text-[#1B4A3A]">🧾 Struk</button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Receipt modal */}
      {selectedTrx && (
        <Modal open={!!selectedTrx} onClose={() => setSelectedTrx(null)} title="🧾 Struk Pembayaran">
          <Receipt transaction={selectedTrx} />
          <div className="flex gap-2 mt-4">
            <button onClick={() => setSelectedTrx(null)} className="flex-1 py-2.5 border border-[#EDE0C4] rounded-xl text-sm font-semibold text-[#7A6E5A]">Tutup</button>
            <button onClick={() => window.print()} className="flex-1 py-2.5 bg-[#1B4A3A] text-white rounded-xl text-sm font-bold">🖨 Cetak</button>
          </div>
        </Modal>
      )}
    </AppShell>
  )
}
