'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useStore } from '@/store'
import { formatRupiah } from '@/lib/utils'
import Clock from '@/components/ui/Clock'
import { LogOut, ChefHat, RefreshCw, CheckCircle } from 'lucide-react'

// Komponen satu kartu pesanan per meja
function OrderCard({
  tableId,
  tableName,
  items,
  onDone,
}: {
  tableId: string
  tableName: string
  items: { name: string; quantity: number; price: number; note: string }[]
  onDone: (tableId: string) => void
}) {
  const total = items.reduce((s, i) => s + i.price * i.quantity, 0)
  const [done, setDone] = useState(false)

  return (
    <div
      className={`rounded-2xl border-2 flex flex-col overflow-hidden shadow-lg transition-all duration-300 ${
        done
          ? 'border-green-500 bg-green-900/30 opacity-70'
          : 'border-[#E8B020]/60 bg-[#1B4A3A]/70'
      }`}
    >
      {/* Header */}
      <div className={`px-4 py-3 flex items-center justify-between ${done ? 'bg-green-800/40' : 'bg-[#153C2E]'}`}>
        <div className="flex items-center gap-2.5">
          <span className="text-2xl">{done ? '✅' : '🍽️'}</span>
          <div>
            <div className="font-playfair text-base font-bold text-[#F5EDD8]">{tableName}</div>
            <div className="text-[10px] text-white/50 mt-0.5">{items.length} jenis · {items.reduce((s,i)=>s+i.quantity,0)} item</div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-xs font-bold text-[#E8B020]">{formatRupiah(total)}</div>
          <div className="text-[10px] text-white/40 mt-0.5">{new Date().toLocaleTimeString('id-ID',{hour:'2-digit',minute:'2-digit'})}</div>
        </div>
      </div>

      {/* Items */}
      <div className="flex-1 px-4 py-3 space-y-2.5">
        {items.map((item, i) => (
          <div key={i} className="flex items-start gap-3">
            {/* Quantity badge */}
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-black shrink-0 ${
              done ? 'bg-green-700 text-green-100' : 'bg-[#E8B020] text-[#0E2820]'
            }`}>
              {item.quantity}×
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold text-[#F5EDD8] leading-tight">{item.name}</div>
              {item.note && (
                <div className="mt-1 text-[11px] text-[#E8B020] italic bg-black/20 rounded-lg px-2 py-1 leading-tight">
                  📝 {item.note}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Action button */}
      <div className="px-4 pb-4 pt-1">
        {done ? (
          <div className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-green-700/60 text-green-100 text-sm font-semibold">
            <CheckCircle size={15} />
            Sudah Diproses
          </div>
        ) : (
          <button
            onClick={() => {
              setDone(true)
              setTimeout(() => onDone(tableId), 1200)
            }}
            className="w-full py-2.5 rounded-xl bg-[#E8B020] hover:bg-[#F5C840] text-[#0E2820] text-sm font-bold transition-colors flex items-center justify-center gap-2"
          >
            <CheckCircle size={15} />
            Tandai Selesai Dimasak
          </button>
        )}
      </div>
    </div>
  )
}

export default function DapurPage() {
  const router = useRouter()
  const { currentUser, logout, tables, tableOrders, cancelTableOrder } = useStore()
  const [lastRefresh, setLastRefresh] = useState(new Date())

  useEffect(() => {
    if (!currentUser) { router.replace('/login'); return }
    // Hanya role dapur, admin, superadmin yang boleh akses
    if (!['dapur','admin','superadmin'].includes(currentUser.role)) {
      router.replace('/dashboard')
    }
  }, [currentUser, router])

  // Auto refresh setiap 30 detik
  useEffect(() => {
    const interval = setInterval(() => setLastRefresh(new Date()), 30000)
    return () => clearInterval(interval)
  }, [])

  if (!currentUser) return null

  // Ambil semua meja yang punya pesanan aktif
  const activeOrders = Object.entries(tableOrders)
    .filter(([, order]) => order.isOrdered && order.items.length > 0)
    .map(([tableId, order]) => {
      const table = tables.find(t => t.id === tableId)
      return {
        tableId,
        tableName: table?.name || tableId,
        items: order.items.map(i => ({
          name: i.name,
          quantity: i.quantity,
          price: i.price,
          note: i.note,
        })),
      }
    })
    .sort((a, b) => a.tableName.localeCompare(b.tableName))

  const handleLogout = () => { logout(); router.replace('/login') }

  const handleDone = (tableId: string) => {
    // Tandai pesanan sudah selesai dimasak — hapus dari antrian dapur
    // Meja tetap aktif untuk proses pembayaran oleh kasir
    // Di sini kita hanya menghapus flag isOrdered agar tidak muncul lagi di dapur
    // Tapi data order tetap ada untuk kasir
    cancelTableOrder(tableId)
  }

  return (
    <div className="fixed inset-0 flex flex-col overflow-hidden" style={{ background: '#0A1F17' }}>

      {/* Header */}
      <div className="shrink-0 px-4 py-3 flex items-center justify-between border-b-2 border-[#E8B020]/30"
        style={{ background: '#0E2820' }}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#E8B020] flex items-center justify-center">
            <ChefHat size={18} className="text-[#0E2820]" />
          </div>
          <div>
            <div className="font-playfair text-sm font-bold text-[#F5EDD8]">
              Dapur — <span className="text-[#F5C840]">Sektor Antapani</span>
            </div>
            <div className="text-[10px] text-white/40">
              {currentUser.name} · {activeOrders.length} meja aktif
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Clock />
          <button
            onClick={() => setLastRefresh(new Date())}
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-colors"
            title="Refresh"
          >
            <RefreshCw size={14} />
          </button>
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
            className="flex items-center gap-1 p-2 rounded-lg bg-white/5 hover:bg-red-900/40 text-white/60 hover:text-white transition-colors"
            title="Keluar"
          >
            <LogOut size={14} />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-3">
        {activeOrders.length === 0 ? (
          // Empty state
          <div className="flex flex-col items-center justify-center h-full text-center py-16">
            <div className="text-7xl mb-5 opacity-30">🍳</div>
            <div className="font-playfair text-xl font-bold text-white/40 mb-2">Tidak Ada Pesanan</div>
            <div className="text-sm text-white/25 max-w-xs leading-relaxed">
              Belum ada pesanan masuk dari meja manapun saat ini.
              Halaman akan otomatis update setiap 30 detik.
            </div>
            <div className="mt-6 text-[11px] text-white/20">
              Terakhir refresh: {lastRefresh.toLocaleTimeString('id-ID')}
            </div>
          </div>
        ) : (
          <>
            {/* Summary bar */}
            <div className="flex items-center gap-3 mb-3 px-1">
              <div className="flex items-center gap-2 text-[#E8B020]">
                <div className="w-2 h-2 rounded-full bg-[#E8B020] animate-pulse" />
                <span className="text-xs font-semibold">
                  {activeOrders.length} pesanan aktif
                </span>
              </div>
              <span className="text-white/20 text-xs">·</span>
              <span className="text-xs text-white/30">
                Total {activeOrders.reduce((s,o)=>s+o.items.reduce((ss,i)=>ss+i.quantity,0),0)} item
              </span>
              <div className="ml-auto text-[10px] text-white/20">
                {lastRefresh.toLocaleTimeString('id-ID')}
              </div>
            </div>

            {/* Order cards grid */}
            <div className="grid gap-3" style={{
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            }}>
              {activeOrders.map(order => (
                <OrderCard
                  key={order.tableId}
                  tableId={order.tableId}
                  tableName={order.tableName}
                  items={order.items}
                  onDone={handleDone}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Footer info */}
      <div className="shrink-0 px-4 py-2 border-t border-white/5 flex items-center justify-between">
        <span className="text-[10px] text-white/20">Auto-refresh setiap 30 detik</span>
        <span className="text-[10px] text-white/20">
          {new Date().toLocaleDateString('id-ID', { weekday:'long', day:'numeric', month:'long' })}
        </span>
      </div>
    </div>
  )
}
