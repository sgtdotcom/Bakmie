'use client'
import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useStore } from '@/store'
import AppShell from '@/components/layout/AppShell'
import Modal from '@/components/ui/Modal'
import Receipt from '@/components/pos/Receipt'
import Toast, { showToast } from '@/components/ui/Toast'
import { formatRupiah, quickCashOptions } from '@/lib/utils'
import { Transaction } from '@/types'

const METHODS = ['Tunai', 'QRIS', 'Debit/ATM', 'Transfer']
const METHOD_ICONS: Record<string, string> = { Tunai: '💵', QRIS: '📱', 'Debit/ATM': '💳', Transfer: '🏦' }

export default function BayarPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const tableId = searchParams.get('table') || ''

  const { tables, tableOrders, processPayment, currentUser } = useStore()

  const [discount, setDiscount] = useState(0)
  const [method, setMethod] = useState('Tunai')
  const [cash, setCash] = useState(0)
  const [receiptTrx, setReceiptTrx] = useState<Transaction | null>(null)
  const [receiptOpen, setReceiptOpen] = useState(false)

  const table = tables.find(t => t.id === tableId)
  const order = tableOrders[tableId]

  useEffect(() => {
    if (!currentUser) { router.replace('/login'); return }
    if (currentUser.role === 'waitress') { router.replace('/dashboard'); return }
    if (!order?.items?.length) { router.replace('/dashboard') }
  }, [currentUser, order, router])

  if (!order?.items?.length || !table) return null

  const subtotal = order.items.reduce((s, i) => s + i.price * i.quantity, 0)
  const total = Math.max(0, subtotal - discount)
  const change = Math.max(0, cash - total)
  const cashOk = method !== 'Tunai' || cash >= total

  const handleConfirm = () => {
    if (!cashOk) { showToast('⚠️ Uang tidak cukup!'); return }
    const trx = processPayment(tableId, discount, method, cash)
    if (!trx) { showToast('⚠️ Gagal memproses pembayaran'); return }
    setReceiptTrx(trx)
    setReceiptOpen(true)
    showToast('✅ Pembayaran berhasil!')
  }

  const handleReceiptClose = () => {
    setReceiptOpen(false)
    router.push('/dashboard')
  }

  return (
    <AppShell showBack backLabel="Dashboard" backHref="/dashboard" allowedRoles={['admin', 'cashier']}>
      <Toast />

      {/* Header */}
      <div className="bg-[#1B4A3A] px-4 py-3 border-b-2 border-[#E8B020]/25 shrink-0">
        <div className="font-playfair text-lg font-bold text-[#F5EDD8]">💳 {table.name}</div>
        <div className="text-xs text-white/45 mt-0.5">
          Siap untuk pembayaran · {new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3.5 flex flex-col gap-3 pb-6">

        {/* Order items */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <div className="text-[11px] font-bold text-[#7A6E5A] uppercase tracking-wider mb-3">Detail Pesanan</div>
          {order.items.map((item, i) => (
            <div key={i} className="flex justify-between items-start gap-2 pb-2.5 mb-2.5 border-b border-[#F5EDD8] last:border-none last:mb-0 last:pb-0">
              <div className="flex-1">
                <div className="text-sm font-semibold text-[#1A1208]">{item.name}</div>
                <div className="text-xs text-[#7A6E5A] mt-0.5">{item.quantity}× × {formatRupiah(item.price)}</div>
                {item.note && (
                  <div className="text-[10px] text-[#7A6E5A] italic mt-1 bg-[#F5EDD8] rounded-md px-1.5 py-0.5 inline-block">
                    📝 {item.note}
                  </div>
                )}
              </div>
              <div className="text-sm font-bold text-[#1B4A3A] shrink-0">{formatRupiah(item.price * item.quantity)}</div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <div className="text-[11px] font-bold text-[#7A6E5A] uppercase tracking-wider mb-3">Ringkasan</div>
          <div className="flex justify-between text-sm text-[#7A6E5A] mb-2"><span>Subtotal</span><span>{formatRupiah(subtotal)}</span></div>
          <div className="flex justify-between items-center text-sm text-[#7A6E5A] mb-2">
            <span>Diskon (Rp)</span>
            <input
              type="number"
              min={0}
              value={discount || ''}
              onChange={e => setDiscount(parseInt(e.target.value) || 0)}
              placeholder="0"
              className="w-24 border border-[#D9CCB0] rounded-lg px-2 py-1 text-right text-sm bg-[#F5EDD8] outline-none focus:border-[#E8B020]"
            />
          </div>
          <div className="flex justify-between text-lg font-bold text-[#1A1208] border-t-2 border-[#F5EDD8] pt-3">
            <span>TOTAL</span>
            <span className="font-playfair text-xl text-[#1B4A3A]">{formatRupiah(total)}</span>
          </div>
        </div>

        {/* Payment method */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <div className="text-[11px] font-bold text-[#7A6E5A] uppercase tracking-wider mb-3">Metode Pembayaran</div>
          <div className="grid grid-cols-2 gap-2">
            {METHODS.map(m => (
              <button
                key={m}
                onClick={() => { setMethod(m); setCash(0) }}
                className={`py-3 rounded-xl border-2 flex flex-col items-center gap-1 transition-colors ${
                  method === m ? 'border-[#1B4A3A] bg-[#EAF2EE]' : 'border-[#EDE0C4] bg-[#F5EDD8]'
                }`}
              >
                <span className="text-xl">{METHOD_ICONS[m]}</span>
                <span className="text-xs font-semibold text-[#1A1208]">{m}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Cash section */}
        {method === 'Tunai' && (
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <div className="text-[11px] font-bold text-[#7A6E5A] uppercase tracking-wider mb-3">Uang Diterima</div>
            <div className="flex gap-2 items-center mb-3">
              <span className="text-sm text-[#7A6E5A]">Rp</span>
              <input
                type="number"
                inputMode="numeric"
                value={cash || ''}
                onChange={e => setCash(parseInt(e.target.value) || 0)}
                placeholder="0"
                className="flex-1 border border-[#D9CCB0] rounded-xl px-3 py-2.5 text-right text-base font-bold text-[#1A1208] bg-[#F5EDD8] outline-none focus:border-[#1B4A3A]"
              />
            </div>
            {/* Quick cash buttons */}
            <div className="flex flex-wrap gap-1.5 mb-3">
              {quickCashOptions(total).map(opt => (
                <button
                  key={opt}
                  onClick={() => setCash(opt)}
                  className="px-3 py-1.5 rounded-lg border border-[#EDE0C4] bg-[#F5EDD8] text-xs font-semibold text-[#7A6E5A] hover:border-[#1B4A3A] hover:text-[#1B4A3A] transition-colors"
                >
                  {formatRupiah(opt)}
                </button>
              ))}
            </div>
            {/* Change display */}
            {cash > 0 && (
              <div className={`flex justify-between items-center px-4 py-3 rounded-xl font-bold text-sm ${cash >= total ? 'bg-[#1B4A3A] text-white' : 'bg-red-600 text-white'}`}>
                <span>Kembalian:</span>
                <span className="text-base">{formatRupiah(Math.max(0, change))}</span>
              </div>
            )}
          </div>
        )}

        {/* Confirm button */}
        <button
          onClick={handleConfirm}
          disabled={!cashOk}
          className="w-full py-4 rounded-2xl bg-[#1B4A3A] text-white text-base font-bold transition-colors hover:bg-[#153C2E] disabled:bg-[#C8BFAD] disabled:cursor-not-allowed disabled:text-[#7A6E5A]"
        >
          ✅ Konfirmasi Pembayaran
        </button>
      </div>

      {/* Receipt modal */}
      {receiptTrx && (
        <Modal open={receiptOpen} onClose={handleReceiptClose} title="🧾 Struk Pembayaran">
          <Receipt transaction={receiptTrx} />
          <div className="flex gap-2 mt-4">
            <button onClick={handleReceiptClose} className="flex-1 py-2.5 border border-[#EDE0C4] rounded-xl text-sm font-semibold text-[#7A6E5A]">
              Tutup
            </button>
            <button onClick={() => window.print()} className="flex-1 py-2.5 bg-[#1B4A3A] text-white rounded-xl text-sm font-bold">
              🖨 Cetak
            </button>
          </div>
        </Modal>
      )}
    </AppShell>
  )
}
