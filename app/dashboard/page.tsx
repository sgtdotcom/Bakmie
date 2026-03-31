'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useStore } from '@/store'
import AppShell from '@/components/layout/AppShell'
import Toast, { showToast } from '@/components/ui/Toast'
import Modal from '@/components/ui/Modal'
import { formatRupiah } from '@/lib/utils'
import { Table } from '@/types'
import { Plus, Pencil, Trash2, UtensilsCrossed } from 'lucide-react'

/* ─── TABLE CARD ─── */
function TableCard({
  table,
  isAdmin,
  onClick,
  onEdit,
  onDelete,
}: {
  table: Table
  isAdmin: boolean
  onClick: () => void
  onEdit: () => void
  onDelete: () => void
}) {
  const tableOrders = useStore(s => s.tableOrders)
  const order = tableOrders[table.id]
  const isActive = order?.isOrdered && (order?.items?.length ?? 0) > 0
  const itemCount = order?.items?.reduce((s, i) => s + i.quantity, 0) ?? 0
  const total = order?.items?.reduce((s, i) => s + i.price * i.quantity, 0) ?? 0

  return (
    <div className="relative group">
      <div
        onClick={onClick}
        className={`relative rounded-2xl p-3 cursor-pointer transition-all duration-200 flex flex-col items-center gap-1.5 min-h-[100px] justify-center border-2 active:scale-95 select-none ${
          isActive
            ? 'bg-[#1B4A3A]/80 border-[#E8B020] shadow-[0_0_16px_rgba(232,176,32,0.22)]'
            : 'bg-white/5 border-white/7 hover:bg-white/9 hover:border-[#E8B020]/25'
        }`}
      >
        {isActive && itemCount > 0 && (
          <span className="absolute top-2 right-2 w-5 h-5 rounded-full bg-[#E8B020] text-[#0E2820] text-[10px] font-bold flex items-center justify-center z-10">
            {itemCount}
          </span>
        )}
        <span className="text-2xl">{isActive ? '🍜' : '🪑'}</span>
        <span className="font-playfair text-sm font-bold text-[#F5EDD8] text-center leading-tight">{table.name}</span>
        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
          isActive ? 'bg-[#E8B020] text-[#0E2820]' : 'bg-white/7 text-white/35'
        }`}>
          {isActive ? 'Ada Pesanan' : 'Kosong'}
        </span>
        {isActive && (
          <span className="text-[10px] text-white/65 font-semibold">{formatRupiah(total)}</span>
        )}
      </div>

      {/* Admin edit/delete overlay — shown on hover */}
      {isAdmin && (
        <div className="absolute top-1.5 left-1.5 hidden group-hover:flex gap-1 z-20">
          <button
            onClick={e => { e.stopPropagation(); onEdit() }}
            className="w-6 h-6 rounded-md bg-[#E8B020] text-[#0E2820] flex items-center justify-center shadow-md hover:bg-[#F5C840] transition-colors"
            title="Edit meja"
          >
            <Pencil size={11} strokeWidth={2.5} />
          </button>
          <button
            onClick={e => { e.stopPropagation(); onDelete() }}
            className="w-6 h-6 rounded-md bg-red-600 text-white flex items-center justify-center shadow-md hover:bg-red-500 transition-colors"
            title="Hapus meja"
          >
            <Trash2 size={11} strokeWidth={2.5} />
          </button>
        </div>
      )}
    </div>
  )
}

/* ─── OTHER BTN ─── */
function OtherBtn({
  table,
  isAdmin,
  onClick,
  onEdit,
  onDelete,
}: {
  table: Table
  isAdmin: boolean
  onClick: () => void
  onEdit: () => void
  onDelete: () => void
}) {
  const tableOrders = useStore(s => s.tableOrders)
  const order = tableOrders[table.id]
  const isActive = order?.isOrdered && (order?.items?.length ?? 0) > 0
  const itemCount = order?.items?.reduce((s, i) => s + i.quantity, 0) ?? 0
  const total = order?.items?.reduce((s, i) => s + i.price * i.quantity, 0) ?? 0
  const ico = table.name.toLowerCase().includes('gofood') || table.name.toLowerCase().includes('grab') ? '🛵' : '🛍️'

  return (
    <div className={`relative group w-full flex items-center gap-3 px-3.5 py-3 rounded-xl border text-left transition-all ${
      isActive
        ? 'bg-[#1B4A3A]/80 border-[#E8B020]'
        : 'bg-white/5 border-[#E8B020]/18 hover:bg-[#1B4A3A]/50 hover:border-[#E8B020]'
    }`}>
      <span className="text-xl w-9 text-center shrink-0">{ico}</span>
      <button onClick={onClick} className="flex-1 min-w-0 text-left">
        <div className="text-sm font-semibold text-[#F5EDD8]">{table.name}</div>
        <div className="text-xs text-white/45 mt-0.5">
          {isActive ? `${formatRupiah(total)} · ${itemCount} item` : 'Belum ada pesanan'}
        </div>
      </button>
      {isActive && (
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#E8B020] text-[#0E2820] shrink-0">Aktif</span>
      )}
      {isAdmin && (
        <div className="hidden group-hover:flex gap-1 shrink-0">
          <button onClick={e => { e.stopPropagation(); onEdit() }} className="w-7 h-7 rounded-lg bg-[#E8B020] text-[#0E2820] flex items-center justify-center hover:bg-[#F5C840] transition-colors">
            <Pencil size={12} />
          </button>
          <button onClick={e => { e.stopPropagation(); onDelete() }} className="w-7 h-7 rounded-lg bg-red-600 text-white flex items-center justify-center hover:bg-red-500 transition-colors">
            <Trash2 size={12} />
          </button>
        </div>
      )}
    </div>
  )
}

/* ─── MEJA MODAL ─── */
function MejaModal({
  open,
  onClose,
  editing,
}: {
  open: boolean
  onClose: () => void
  editing: Table | null
}) {
  const { addTable, updateTable } = useStore()
  const [name, setName] = useState(editing?.name ?? '')
  const [type, setType] = useState<'indoor' | 'other'>(editing?.type ?? 'indoor')

  // Reset when editing changes
  useEffect(() => {
    setName(editing?.name ?? '')
    setType(editing?.type ?? 'indoor')
  }, [editing, open])

  const save = () => {
    if (!name.trim()) { showToast('⚠️ Nama meja wajib diisi'); return }
    if (editing) {
      updateTable(editing.id, { name: name.trim(), type })
      showToast('✅ Meja berhasil diperbarui')
    } else {
      addTable({ name: name.trim(), type })
      showToast('✅ Meja berhasil ditambahkan')
    }
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} title={editing ? '✏️ Edit Meja' : '➕ Tambah Meja Baru'}>
      <div className="flex flex-col gap-4">
        <div>
          <label className="block text-xs font-semibold text-[#7A6E5A] uppercase tracking-wide mb-1.5">
            Nama Meja *
          </label>
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && save()}
            placeholder="Contoh: Meja 7, VIP Room, Teras..."
            autoFocus
            className="w-full border border-[#D9CCB0] rounded-xl px-3 py-2.5 text-sm bg-[#F5EDD8] text-[#1A1208] outline-none focus:border-[#1B4A3A] transition-colors"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-[#7A6E5A] uppercase tracking-wide mb-1.5">
            Tipe Meja
          </label>
          <div className="grid grid-cols-2 gap-2">
            {[
              { val: 'indoor', ico: '🪑', label: 'Indoor', sub: 'Meja di dalam ruangan' },
              { val: 'other', ico: '📦', label: 'Lainnya', sub: 'Take Away / Online order' },
            ].map(opt => (
              <button
                key={opt.val}
                onClick={() => setType(opt.val as any)}
                className={`flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl border-2 transition-colors ${
                  type === opt.val
                    ? 'border-[#1B4A3A] bg-[#EAF2EE]'
                    : 'border-[#EDE0C4] bg-[#F5EDD8] hover:border-[#1B4A3A]/50'
                }`}
              >
                <span className="text-2xl">{opt.ico}</span>
                <span className="text-xs font-bold text-[#1A1208]">{opt.label}</span>
                <span className="text-[10px] text-[#7A6E5A] text-center leading-tight">{opt.sub}</span>
              </button>
            ))}
          </div>
        </div>
        <div className="flex gap-2 pt-1">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 border border-[#EDE0C4] rounded-xl text-sm font-semibold text-[#7A6E5A] hover:bg-gray-50 transition-colors"
          >
            Batal
          </button>
          <button
            onClick={save}
            className="flex-[2] py-2.5 bg-[#1B4A3A] text-white rounded-xl text-sm font-bold hover:bg-[#153C2E] transition-colors"
          >
            💾 {editing ? 'Perbarui Meja' : 'Tambah Meja'}
          </button>
        </div>
      </div>
    </Modal>
  )
}

/* ─── MAIN DASHBOARD ─── */
export default function DashboardPage() {
  const router = useRouter()
  const { currentUser, tables, tableOrders, transactions, deleteTable } = useStore()

  const [mejaModal, setMejaModal] = useState<{ open: boolean; item: Table | null }>({
    open: false,
    item: null,
  })

  useEffect(() => {
    if (!currentUser) router.replace('/login')
  }, [currentUser, router])

  if (!currentUser) return null

  const isAdmin = currentUser.role === 'admin'
  const indoor = tables.filter(t => t.type === 'indoor')
  const others = tables.filter(t => t.type === 'other')

  const activeCount = tables.filter(t => {
    const o = tableOrders[t.id]
    return o?.isOrdered && (o?.items?.length ?? 0) > 0
  }).length
  const todayRev = transactions.reduce((s, t) => s + t.total, 0)

  const handleTableClick = (tableId: string) => {
    const order = tableOrders[tableId]
    const isActive = order?.isOrdered && (order?.items?.length ?? 0) > 0
    if (isActive && currentUser.role !== 'waitress') {
      router.push(`/bayar?table=${tableId}`)
    } else {
      router.push(`/menu?table=${tableId}`)
    }
  }

  const handleDeleteTable = (tableId: string, name: string) => {
    const order = tableOrders[tableId]
    const isActive = order?.isOrdered && (order?.items?.length ?? 0) > 0
    if (isActive) {
      showToast('⚠️ Tidak bisa hapus meja yang sedang aktif')
      return
    }
    if (confirm(`Hapus "${name}"?`)) {
      deleteTable(tableId)
      showToast('🗑 Meja dihapus')
    }
  }

  // Responsive grid: 2 cols on very small, 3 on normal mobile, 4 on tablet+
  const gridCols = indoor.length <= 6
    ? 'grid-cols-3 sm:grid-cols-3'
    : indoor.length <= 8
    ? 'grid-cols-3 sm:grid-cols-4'
    : 'grid-cols-3 sm:grid-cols-4 lg:grid-cols-5'

  return (
    <AppShell>
      <Toast />

      <div className="flex-1 overflow-y-auto pb-28" style={{ scrollbarWidth: 'thin' }}>

        {/* Stats */}
        <div className="px-3.5 pt-4 pb-3">
          <h1 className="font-playfair text-lg font-bold text-[#F5EDD8]">Dashboard Meja</h1>
          <p className="text-[11px] text-white/40 mt-0.5">
            {new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
          <div className="grid grid-cols-3 gap-2 mt-3">
            {[
              { num: activeCount, label: 'Aktif' },
              { num: transactions.length, label: 'Transaksi' },
              {
                num: todayRev >= 1000000
                  ? `${(todayRev / 1000000).toFixed(1)}jt`
                  : formatRupiah(todayRev).replace('Rp ', ''),
                label: 'Pendapatan',
              },
            ].map((s, i) => (
              <div key={i} className="bg-white/6 border border-[#E8B020]/18 rounded-xl p-2.5 text-center">
                <div className="font-playfair text-lg font-bold text-[#E8B020]">{s.num}</div>
                <div className="text-[10px] text-white/40 uppercase tracking-wide mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Indoor section header */}
        <div className="px-3.5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold text-[#E8B020] uppercase tracking-wider">
              Meja Dalam Ruangan
              <span className="ml-1.5 text-white/30 normal-case font-normal">({indoor.length} meja)</span>
            </span>
            {isAdmin && (
              <button
                onClick={() => setMejaModal({ open: true, item: null })}
                className="flex items-center gap-1.5 bg-[#E8B020]/15 border border-[#E8B020]/40 text-[#E8B020] text-[11px] font-bold px-2.5 py-1 rounded-lg hover:bg-[#E8B020]/25 transition-colors"
              >
                <Plus size={12} strokeWidth={2.5} />
                Tambah Meja
              </button>
            )}
          </div>

          {/* Responsive grid — auto-adjusts to number of tables */}
          <div className={`grid ${gridCols} gap-2.5 mb-5`}>
            {indoor.map(t => (
              <TableCard
                key={t.id}
                table={t}
                isAdmin={isAdmin}
                onClick={() => handleTableClick(t.id)}
                onEdit={() => setMejaModal({ open: true, item: t })}
                onDelete={() => handleDeleteTable(t.id, t.name)}
              />
            ))}
            {/* Add table shortcut card — admin only */}
            {isAdmin && (
              <div
                onClick={() => setMejaModal({ open: true, item: null })}
                className="rounded-2xl border-2 border-dashed border-[#E8B020]/25 min-h-[100px] flex flex-col items-center justify-center gap-1.5 cursor-pointer hover:border-[#E8B020]/60 hover:bg-white/4 transition-all group"
              >
                <Plus size={22} className="text-[#E8B020]/40 group-hover:text-[#E8B020]/80 transition-colors" />
                <span className="text-[10px] text-white/25 group-hover:text-white/50 transition-colors text-center leading-tight">
                  Tambah<br />Meja
                </span>
              </div>
            )}
          </div>

          {/* Other options */}
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold text-[#E8B020] uppercase tracking-wider">
              Pesanan Lain
            </span>
            {isAdmin && (
              <button
                onClick={() => setMejaModal({ open: true, item: null })}
                className="flex items-center gap-1.5 bg-[#E8B020]/15 border border-[#E8B020]/40 text-[#E8B020] text-[11px] font-bold px-2.5 py-1 rounded-lg hover:bg-[#E8B020]/25 transition-colors"
              >
                <Plus size={12} strokeWidth={2.5} />
                Tambah Opsi
              </button>
            )}
          </div>
          <div className="flex flex-col gap-2">
            {others.map(t => (
              <OtherBtn
                key={t.id}
                table={t}
                isAdmin={isAdmin}
                onClick={() => handleTableClick(t.id)}
                onEdit={() => setMejaModal({ open: true, item: t })}
                onDelete={() => handleDeleteTable(t.id, t.name)}
              />
            ))}
          </div>

          {/* Admin quick-access cards */}
          {isAdmin && (
            <div className="mt-5 mb-2">
              <div className="text-[11px] font-semibold text-[#E8B020] uppercase tracking-wider mb-2">
                Kelola Restoran
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  onClick={() => router.push('/admin?tab=menu')}
                  className="flex items-center gap-3 bg-[#1B4A3A]/60 border border-[#E8B020]/25 rounded-xl px-4 py-3.5 hover:bg-[#1B4A3A]/80 hover:border-[#E8B020]/50 transition-all text-left"
                >
                  <UtensilsCrossed size={20} className="text-[#E8B020] shrink-0" />
                  <div>
                    <div className="text-sm font-bold text-[#F5EDD8]">Kelola Menu</div>
                    <div className="text-[10px] text-white/40 mt-0.5">Tambah, edit, hapus menu</div>
                  </div>
                </button>
                <button
                  onClick={() => router.push('/admin?tab=users')}
                  className="flex items-center gap-3 bg-[#1B4A3A]/60 border border-[#E8B020]/25 rounded-xl px-4 py-3.5 hover:bg-[#1B4A3A]/80 hover:border-[#E8B020]/50 transition-all text-left"
                >
                  <span className="text-xl shrink-0">👤</span>
                  <div>
                    <div className="text-sm font-bold text-[#F5EDD8]">Kelola User</div>
                    <div className="text-[10px] text-white/40 mt-0.5">Kasir & pelayan</div>
                  </div>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom action bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-[#0E2820] via-[#0E2820]/90 to-transparent pt-8 pb-4 px-3.5">
        <div className="flex gap-2">
          {(currentUser.role === 'admin' || currentUser.role === 'cashier') && (
            <button
              onClick={() => router.push('/riwayat')}
              className="flex-1 py-2.5 rounded-xl border border-[#E8B020]/30 text-[#E8B020] text-xs font-semibold hover:bg-[#E8B020]/10 transition-colors"
            >
              📋 Riwayat
            </button>
          )}
          {isAdmin && (
            <>
              <button
                onClick={() => router.push('/laporan')}
                className="flex-1 py-2.5 rounded-xl bg-white/8 text-[#F5EDD8] text-xs font-semibold hover:bg-white/14 transition-colors"
              >
                📊 Laporan
              </button>
              <button
                onClick={() => router.push('/admin')}
                className="flex-1 py-2.5 rounded-xl bg-[#245E4A] text-[#F5EDD8] text-xs font-semibold hover:bg-[#3A7A60] transition-colors"
              >
                ⚙️ Admin
              </button>
            </>
          )}
        </div>
      </div>

      {/* Meja modal */}
      <MejaModal
        open={mejaModal.open}
        onClose={() => setMejaModal({ open: false, item: null })}
        editing={mejaModal.item}
      />
    </AppShell>
  )
}
