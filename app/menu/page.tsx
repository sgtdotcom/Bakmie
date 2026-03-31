'use client'
import { useState, useEffect, useMemo } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useStore } from '@/store'
import AppShell from '@/components/layout/AppShell'
import MenuCard from '@/components/pos/MenuCard'
import OrderPanel from '@/components/pos/OrderPanel'
import BottomSheet from '@/components/ui/BottomSheet'
import DapurNotif from '@/components/ui/DapurNotif'
import OrderItemRow from '@/components/pos/OrderItemRow'
import Toast, { showToast } from '@/components/ui/Toast'
import { MENU_CATEGORIES } from '@/lib/data'
import { formatRupiah } from '@/lib/utils'
import { OrderItem } from '@/types'
import { ShoppingCart } from 'lucide-react'

export default function MenuPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const tableId = searchParams.get('table') || ''

  const { tables, menu, draft, addToDraft, changeDraftQty, setDraftNote, clearDraft, confirmOrder, setActiveTable, activeTableId } = useStore()

  const [cat, setCat] = useState('Semua')
  const [search, setSearch] = useState('')
  const [sheetOpen, setSheetOpen] = useState(false)
  const [dapurOpen, setDapurOpen] = useState(false)
  const [kitchenItems, setKitchenItems] = useState<OrderItem[]>([])

  const table = tables.find(t => t.id === tableId)

  useEffect(() => {
    if (!table) { router.replace('/dashboard'); return }
    if (activeTableId !== tableId) setActiveTable(tableId)
  }, [table, tableId, activeTableId, setActiveTable, router])

  const filtered = useMemo(() => menu.filter(m =>
    (cat === 'Semua' || m.category === cat) &&
    (m.name.toLowerCase().includes(search.toLowerCase()) || m.description.toLowerCase().includes(search.toLowerCase()))
  ), [menu, cat, search])

  const totalItems = draft.reduce((s, i) => s + i.quantity, 0)
  const totalPrice = draft.reduce((s, i) => s + i.price * i.quantity, 0)

  const handleAdd = (id: number) => {
    const item = menu.find(m => m.id === id)
    if (!item) return
    addToDraft(item)
    showToast(`✅ ${item.name} ditambahkan`)
  }

  const handleOrder = () => {
    if (!draft.length) return
    const sent = confirmOrder()
    setKitchenItems(sent)
    setSheetOpen(false)
    setDapurOpen(true)
  }

  const handleClear = () => {
    if (!draft.length) return
    if (confirm('Bersihkan semua item?')) { clearDraft(); showToast('🗑 Dibersihkan') }
  }

  const handleDapurClose = () => {
    setDapurOpen(false)
    router.push('/dashboard')
  }

  return (
    <AppShell showBack backLabel="Dashboard" backHref="/dashboard">
      <Toast />

      {/* Top bar */}
      <div className="bg-[#153C2E] border-b-2 border-[#E8B020]/25 shrink-0 px-3">
        <div className="flex items-center justify-between py-2 gap-2">
          <span className="font-playfair text-sm font-bold text-[#F5EDD8] shrink-0">
            📍 {table?.name || '—'}
          </span>
          <button
            onClick={() => setSheetOpen(true)}
            className="bg-[#E8B020] text-[#0E2820] text-xs font-bold px-3 py-1.5 rounded-full transition-colors hover:bg-[#F5C840] shrink-0"
          >
            🛒 {totalItems} item{totalItems > 0 ? ` · ${formatRupiah(totalPrice)}` : ''}
          </button>
        </div>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="🔍 Cari menu..."
          className="w-full bg-white/8 border border-[#E8B020]/25 rounded-xl px-3 py-2 text-sm text-[#F5EDD8] placeholder:text-white/35 outline-none focus:border-[#E8B020] mb-2"
          style={{ backgroundColor: 'rgba(255,255,255,0.08)' }}
        />
      </div>

      {/* Categories */}
      <div className="flex gap-1.5 px-3 py-2 overflow-x-auto bg-[#0E2820] border-b border-[#E8B020]/18 shrink-0 scrollbar-hide" style={{ scrollbarWidth: 'none' }}>
        {MENU_CATEGORIES.map(c => (
          <button
            key={c}
            onClick={() => setCat(c)}
            className={`shrink-0 px-3 py-1 rounded-full border text-xs font-medium transition-colors whitespace-nowrap ${
              cat === c
                ? 'bg-[#E8B020] border-[#E8B020] text-[#0E2820] font-bold'
                : 'border-[#E8B020]/22 text-white/60 hover:border-[#E8B020] hover:text-white'
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Body: grid + tablet order panel */}
      <div className="flex flex-1 overflow-hidden">
        {/* Menu grid */}
        <div className="flex-1 overflow-y-auto p-2.5 grid gap-2" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', alignContent: 'start' }}>
          {filtered.length === 0 ? (
            <div className="col-span-full text-center py-12 text-[#7A6E5A] text-sm">Tidak ada menu</div>
          ) : filtered.map(item => (
            <MenuCard key={item.id} item={item} onClick={() => handleAdd(item.id)} />
          ))}
        </div>

        {/* Tablet order panel */}
        <div className="hidden sm:flex w-[290px] lg:w-[310px] shrink-0 flex-col bg-white border-l-2 border-[#EDE0C4]">
          <div className="px-3 py-2.5 bg-[#1B4A3A] border-b border-[#E8B020]/25 flex items-center justify-between shrink-0">
            <span className="font-playfair text-sm font-bold text-[#F5EDD8]">Pesanan</span>
            <span className="text-xs font-semibold text-[#E8B020]">{table?.name}</span>
          </div>
          <OrderPanel tableName={table?.name || ''} onOrder={handleOrder} onClear={handleClear} />
        </div>
      </div>

      {/* Mobile FAB */}
      {totalItems > 0 && (
        <button
          onClick={() => setSheetOpen(true)}
          className="sm:hidden fixed bottom-4 right-4 z-50 w-14 h-14 rounded-full bg-[#1B4A3A] border-2 border-[#E8B020] shadow-2xl flex items-center justify-center text-xl"
        >
          🛒
          <span className="absolute top-0 right-0 w-5 h-5 rounded-full bg-[#E8B020] text-[#0E2820] text-[10px] font-bold flex items-center justify-center">
            {totalItems}
          </span>
        </button>
      )}

      {/* Mobile bottom sheet */}
      <BottomSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        title={<>🛒 Pesanan — <span className="text-[#E8B020]">{table?.name}</span></>}
        height="h-[74vh]"
      >
        <div className="flex flex-col h-full overflow-hidden">
          <OrderPanel tableName={table?.name || ''} onOrder={handleOrder} onClear={handleClear} />
        </div>
      </BottomSheet>

      {/* Dapur notification */}
      <DapurNotif
        open={dapurOpen}
        tableName={table?.name || ''}
        items={kitchenItems}
        onClose={handleDapurClose}
      />
    </AppShell>
  )
}
