'use client'
import { useEffect, useState, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useStore } from '@/store'
import { LogOut, ChefHat, CheckCircle, Bell } from 'lucide-react'

// ─── Item card per meja ───
function OrderCard({
  tableId,
  tableName,
  items,
  arrivedAt,
  onDone,
}: {
  tableId: string
  tableName: string
  items: { name: string; quantity: number; note: string }[]
  arrivedAt: string
  onDone: (tableId: string) => void
}) {
  const [marking, setMarking] = useState(false)
  const totalItems = items.reduce((s, i) => s + i.quantity, 0)

  const handleDone = () => {
    setMarking(true)
    setTimeout(() => onDone(tableId), 600)
  }

  return (
    <div className={`rounded-2xl border-2 flex flex-col overflow-hidden shadow-xl transition-all duration-500 ${
      marking
        ? 'border-green-500/80 opacity-60 scale-95'
        : 'border-[#E8B020]/70 bg-[#1B4A3A]/80'
    }`}>
      {/* Header meja */}
      <div className="px-4 py-3 flex items-center justify-between bg-[#0E2820] border-b border-[#E8B020]/25">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-[#E8B020] flex items-center justify-center shrink-0">
            <span className="text-lg font-black text-[#0E2820]">🍽️</span>
          </div>
          <div>
            <div className="font-playfair text-base font-bold text-[#F5EDD8]">{tableName}</div>
            <div className="text-[10px] text-white/45 mt-0.5">
              {totalItems} item · masuk {arrivedAt}
            </div>
          </div>
        </div>
        {/* Indikator baru */}
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-[#E8B020] animate-pulse" />
          <span className="text-[10px] text-[#E8B020] font-semibold">BARU</span>
        </div>
      </div>

      {/* Daftar item */}
      <div className="px-4 py-4 space-y-3 flex-1">
        {items.map((item, i) => (
          <div key={i} className="flex items-start gap-3">
            {/* Badge jumlah */}
            <div className="min-w-[36px] h-9 rounded-xl bg-[#E8B020] flex items-center justify-center shrink-0">
              <span className="text-sm font-black text-[#0E2820]">{item.quantity}×</span>
            </div>
            <div className="flex-1 min-w-0 pt-1">
              <div className="text-sm font-bold text-[#F5EDD8] leading-tight">{item.name}</div>
              {item.note && (
                <div className="mt-1.5 text-[11px] italic text-[#E8B020] bg-black/25 rounded-lg px-2.5 py-1.5 leading-tight border border-[#E8B020]/20">
                  📝 {item.note}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Tombol selesai */}
      <div className="px-4 pb-4">
        <button
          onClick={handleDone}
          disabled={marking}
          className="w-full py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 bg-green-600 hover:bg-green-500 text-white disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <CheckCircle size={16} />
          {marking ? 'Ditandai...' : 'Selesai Dimasak ✓'}
        </button>
      </div>
    </div>
  )
}

// ─── Main page ───
export default function DapurPage() {
  const router = useRouter()
  const { currentUser, logout, tables, tableOrders, cancelTableOrder } = useStore()
  // Simpan waktu masuk per tableId (deteksi pesanan baru)
  const [arrivals, setArrivals] = useState<Record<string, string>>({})
  const [tick, setTick] = useState(0)  // force re-render
  const prevOrderIds = useRef<Set<string>>(new Set())

  // Guard: hanya role yang boleh akses
  useEffect(() => {
    if (!currentUser) { router.replace('/login'); return }
    if (!['dapur', 'admin', 'superadmin'].includes(currentUser.role)) {
      router.replace('/dashboard')
    }
  }, [currentUser, router])

  // ─── Real-time polling: cek setiap 3 detik ───
  // Zustand store sudah reaktif — tapi untuk visual "kapan pesanan masuk" kita track sendiri
  useEffect(() => {
    const interval = setInterval(() => {
      setTick(t => t + 1)
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  // Deteksi pesanan baru → catat waktu masuk
  useEffect(() => {
    const currentIds = new Set(
      Object.keys(tableOrders).filter(id =>
        tableOrders[id]?.isOrdered && (tableOrders[id]?.items?.length ?? 0) > 0
      )
    )

    currentIds.forEach(id => {
      if (!prevOrderIds.current.has(id)) {
        // Pesanan baru!
        setArrivals(prev => ({
          ...prev,
          [id]: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
        }))
        // Notif visual (title blink)
        document.title = '🔔 Pesanan Baru! — Dapur SA'
        setTimeout(() => { document.title = 'Dapur — Sektor Antapani' }, 3000)
      }
    })

    prevOrderIds.current = currentIds
  }, [tableOrders, tick])

  if (!currentUser) return null

  const activeOrders = Object.entries(tableOrders)
    .filter(([, o]) => o?.isOrdered && (o?.items?.length ?? 0) > 0)
    .map(([tableId, order]) => {
      const table = tables.find(t => t.id === tableId)
      return {
        tableId,
        tableName: table?.name || tableId,
        items: order.items.map(i => ({ name: i.name, quantity: i.quantity, note: i.note })),
        arrivedAt: arrivals[tableId] || new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      }
    })
    .sort((a, b) => a.tableName.localeCompare(b.tableName))

  const handleDone = useCallback((tableId: string) => {
    cancelTableOrder(tableId)
    setArrivals(prev => { const n = { ...prev }; delete n[tableId]; return n })
  }, [cancelTableOrder])

  const handleLogout = () => { logout(); router.replace('/login') }

  return (
    <div className="fixed inset-0 flex flex-col" style={{ background: '#071510' }}>

      {/* Header */}
      <div className="shrink-0 flex items-center justify-between px-4 py-3 border-b-2 border-[#E8B020]/30"
        style={{ background: '#0E2820' }}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#E8B020] flex items-center justify-center">
            <ChefHat size={17} className="text-[#0E2820]" />
          </div>
          <div>
            <div className="font-playfair text-sm font-bold text-[#F5EDD8]">
              DAPUR — <span className="text-[#F5C840]">Sektor Antapani</span>
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              <span className="text-[10px] text-green-400 font-medium">Live · update otomatis</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Badge jumlah pesanan */}
          {activeOrders.length > 0 && (
            <div className="flex items-center gap-1.5 bg-[#E8B020]/20 border border-[#E8B020]/40 rounded-xl px-3 py-1.5">
              <Bell size={12} className="text-[#E8B020]" />
              <span className="text-xs font-bold text-[#E8B020]">{activeOrders.length} meja</span>
            </div>
          )}
          {/* Jam */}
          <div className="text-xs font-bold text-[#F5C840] tabular-nums hidden sm:block" id="dapurClock" />
          {/* Tombol dashboard (admin/superadmin saja) */}
          {currentUser.role !== 'dapur' && (
            <button
              onClick={() => router.push('/dashboard')}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1B4A3A] text-[#7ECDB0] text-xs font-semibold hover:bg-[#245E4A] transition-colors"
            >
              Dashboard
            </button>
          )}
          <button
            onClick={handleLogout}
            title="Keluar"
            className="p-2 rounded-lg bg-white/5 hover:bg-red-900/40 text-white/50 hover:text-white transition-colors"
          >
            <LogOut size={14} />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-3">
        {activeOrders.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-16">
            <div className="text-7xl mb-5 opacity-20">🍳</div>
            <div className="font-playfair text-xl font-bold text-white/30 mb-2">Tidak Ada Pesanan</div>
            <div className="text-sm text-white/20 max-w-xs leading-relaxed">
              Belum ada pesanan masuk. Halaman ini otomatis update setiap pesanan baru masuk.
            </div>
            <div className="mt-8 flex items-center gap-2 text-white/20 text-xs">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              Sedang menunggu pesanan...
            </div>
          </div>
        ) : (
          <div className="grid gap-3" style={{
            gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))',
          }}>
            {activeOrders.map(order => (
              <OrderCard
                key={order.tableId}
                {...order}
                onDone={handleDone}
              />
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="shrink-0 px-4 py-2 border-t border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-2 text-[10px] text-white/20">
          <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
          Real-time · tidak perlu refresh manual
        </div>
        <span className="text-[10px] text-white/20">
          {new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' })}
        </span>
      </div>

      {/* Clock updater (client-side only) */}
      <ClockUpdater />
    </div>
  )
}

function ClockUpdater() {
  useEffect(() => {
    const update = () => {
      const el = document.getElementById('dapurClock')
      if (el) el.textContent = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    }
    update()
    const id = setInterval(update, 1000)
    return () => clearInterval(id)
  }, [])
  return null
}
