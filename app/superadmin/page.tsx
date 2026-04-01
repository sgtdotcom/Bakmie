'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useStore } from '@/store'
import AppShell from '@/components/layout/AppShell'
import Toast, { showToast } from '@/components/ui/Toast'
import { formatRupiah } from '@/lib/utils'
import { AlertTriangle, Trash2, RefreshCw, ShieldAlert, Database } from 'lucide-react'

// ─── Confirm Dialog ───
function ConfirmDialog({
  open,
  title,
  description,
  confirmText,
  confirmWord,
  danger,
  onConfirm,
  onCancel,
}: {
  open: boolean
  title: string
  description: string
  confirmText: string
  confirmWord: string   // user must type this word exactly
  danger?: boolean
  onConfirm: () => void
  onCancel: () => void
}) {
  const [typed, setTyped] = useState('')

  if (!open) return null

  const matches = typed.trim().toLowerCase() === confirmWord.toLowerCase()

  return (
    <div className="fixed inset-0 z-[300] bg-[#0A1610]/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-5 w-full max-w-sm shadow-2xl border-t-4 border-red-500 animate-fade-in">
        <div className="flex items-center gap-2.5 mb-3">
          <div className="w-9 h-9 rounded-xl bg-red-100 flex items-center justify-center shrink-0">
            <ShieldAlert size={18} className="text-red-600" />
          </div>
          <h3 className="font-playfair text-base font-bold text-[#1A1208]">{title}</h3>
        </div>

        <p className="text-sm text-[#7A6E5A] mb-4 leading-relaxed">{description}</p>

        <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-4">
          <p className="text-xs text-red-700 mb-2">
            Ketik <strong>"{confirmWord}"</strong> untuk konfirmasi:
          </p>
          <input
            type="text"
            value={typed}
            onChange={e => setTyped(e.target.value)}
            placeholder={confirmWord}
            autoFocus
            className="w-full border border-red-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-red-500 bg-white"
          />
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => { setTyped(''); onCancel() }}
            className="flex-1 py-2.5 border border-[#EDE0C4] rounded-xl text-sm font-semibold text-[#7A6E5A] hover:bg-gray-50 transition-colors"
          >
            Batal
          </button>
          <button
            onClick={() => { if (matches) { setTyped(''); onConfirm() } }}
            disabled={!matches}
            className="flex-[2] py-2.5 bg-red-600 text-white rounded-xl text-sm font-bold transition-colors hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function SuperAdminPage() {
  const router = useRouter()
  const {
    transactions,
    menu,
    tables,
    users,
    currentUser,
    clearAllTransactions,
    resetAllData,
  } = useStore()

  const [dialog, setDialog] = useState<null | 'clearTrx' | 'resetAll'>(null)

  const totalRev = transactions.reduce((s, t) => s + t.total, 0)
  const oldestTrx = transactions.length > 0
    ? transactions[transactions.length - 1].date
    : null
  const newestTrx = transactions.length > 0
    ? transactions[0].date
    : null

  const handleClearTransactions = () => {
    clearAllTransactions()
    setDialog(null)
    showToast('✅ Semua transaksi berhasil dihapus')
  }

  const handleResetAll = () => {
    resetAllData()
    setDialog(null)
    showToast('✅ Semua data berhasil direset ke awal')
    setTimeout(() => router.push('/dashboard'), 1000)
  }

  return (
    <AppShell showBack backLabel="Dashboard" backHref="/dashboard" allowedRoles={['superadmin']}>
      <Toast />

      {/* Header */}
      <div className="bg-purple-900/80 border-b-2 border-purple-400/40 px-4 py-3 flex-shrink-0">
        <div className="flex items-center gap-2.5">
          <ShieldAlert size={18} className="text-purple-300" />
          <div>
            <div className="font-playfair text-base font-bold text-white">Panel Super Admin</div>
            <div className="text-[10px] text-purple-300/70 mt-0.5">Akses terbatas — hanya untuk {currentUser?.name}</div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3.5 flex flex-col gap-4">

        {/* Warning banner */}
        <div className="bg-red-50 border border-red-200 rounded-xl p-3.5 flex items-start gap-2.5">
          <AlertTriangle size={16} className="text-red-500 shrink-0 mt-0.5" />
          <div>
            <div className="text-xs font-bold text-red-700 mb-0.5">⚠️ Zona Berbahaya</div>
            <div className="text-[11px] text-red-600 leading-relaxed">
              Tindakan di halaman ini bersifat <strong>permanen dan tidak dapat dibatalkan</strong>.
              Pastikan Anda sudah membackup data penting sebelum melanjutkan.
            </div>
          </div>
        </div>

        {/* Data overview */}
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <Database size={14} className="text-[#1B4A3A]" />
            <div className="text-sm font-bold text-[#1A1208]">Ringkasan Data Saat Ini</div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: 'Total Transaksi', value: transactions.length, icon: '🧾' },
              { label: 'Total Pendapatan', value: formatRupiah(totalRev), icon: '💰' },
              { label: 'Item Menu', value: menu.length, icon: '🍜' },
              { label: 'Jumlah Meja', value: tables.length, icon: '🪑' },
              { label: 'Jumlah User', value: users.length, icon: '👤' },
              { label: 'Periode Data', value: oldestTrx && newestTrx ? `${oldestTrx} s/d ${newestTrx}` : '—', icon: '📅' },
            ].map((item, i) => (
              <div key={i} className="bg-[#F5EDD8] rounded-xl p-3">
                <div className="text-lg mb-1">{item.icon}</div>
                <div className="text-[10px] text-[#7A6E5A] mb-0.5">{item.label}</div>
                <div className="text-xs font-bold text-[#1A1208]">{item.value}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Action: Clear transactions */}
        <div className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-orange-400">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-orange-100 flex items-center justify-center shrink-0 mt-0.5">
              <Trash2 size={16} className="text-orange-600" />
            </div>
            <div className="flex-1">
              <div className="text-sm font-bold text-[#1A1208] mb-1">Hapus Semua Transaksi & Laporan</div>
              <div className="text-[11px] text-[#7A6E5A] mb-3 leading-relaxed">
                Menghapus seluruh riwayat transaksi dan data laporan keuangan.
                Menu, meja, dan user <strong>tidak akan terhapus</strong>.
                Biasanya dilakukan di awal periode baru (tahun baru, bulan baru).
              </div>
              <div className="flex items-center gap-2 text-[11px] text-orange-600 mb-3">
                <AlertTriangle size={11} />
                <span>Akan menghapus {transactions.length} transaksi senilai {formatRupiah(totalRev)}</span>
              </div>
              <button
                onClick={() => setDialog('clearTrx')}
                disabled={transactions.length === 0}
                className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Trash2 size={13} />
                Hapus Semua Transaksi
              </button>
            </div>
          </div>
        </div>

        {/* Action: Reset all data */}
        <div className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-red-500">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-red-100 flex items-center justify-center shrink-0 mt-0.5">
              <RefreshCw size={16} className="text-red-600" />
            </div>
            <div className="flex-1">
              <div className="text-sm font-bold text-[#1A1208] mb-1">Reset Semua Data ke Awal</div>
              <div className="text-[11px] text-[#7A6E5A] mb-3 leading-relaxed">
                Reset <strong>transaksi, menu, dan meja</strong> kembali ke data awal (default).
                User dan password <strong>tidak akan direset</strong>.
                Gunakan hanya jika ingin memulai dari nol.
              </div>
              <div className="flex items-center gap-2 text-[11px] text-red-600 mb-3">
                <AlertTriangle size={11} />
                <span>Tindakan ini tidak dapat diurungkan!</span>
              </div>
              <button
                onClick={() => setDialog('resetAll')}
                className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-colors"
              >
                <RefreshCw size={13} />
                Reset Semua Data
              </button>
            </div>
          </div>
        </div>

        {/* Info box */}
        <div className="bg-[#1B4A3A]/10 border border-[#1B4A3A]/20 rounded-xl p-3.5">
          <div className="text-xs font-bold text-[#1B4A3A] mb-2">💡 Tips Sebelum Reset Data</div>
          <ul className="text-[11px] text-[#7A6E5A] space-y-1.5 leading-relaxed">
            <li>• Screenshot atau cetak laporan bulanan/tahunan terlebih dahulu</li>
            <li>• Pastikan semua transaksi hari ini sudah selesai diproses</li>
            <li>• Hapus transaksi di awal bulan/tahun baru untuk laporan yang bersih</li>
            <li>• Gambar menu yang sudah diupload <strong>tidak akan terhapus</strong> dari server</li>
          </ul>
        </div>

      </div>

      {/* Dialogs */}
      <ConfirmDialog
        open={dialog === 'clearTrx'}
        title="Hapus Semua Transaksi?"
        description={`Ini akan menghapus ${transactions.length} transaksi senilai ${formatRupiah(totalRev)} secara permanen. Menu, meja, dan user tidak terpengaruh.`}
        confirmText="Ya, Hapus Semua Transaksi"
        confirmWord="HAPUS"
        danger
        onConfirm={handleClearTransactions}
        onCancel={() => setDialog(null)}
      />

      <ConfirmDialog
        open={dialog === 'resetAll'}
        title="Reset Semua Data?"
        description="Ini akan mereset transaksi, menu, dan meja ke data awal. User tidak akan direset. Tindakan ini TIDAK DAPAT dibatalkan."
        confirmText="Ya, Reset Semua Data"
        confirmWord="RESET"
        danger
        onConfirm={handleResetAll}
        onCancel={() => setDialog(null)}
      />
    </AppShell>
  )
}
