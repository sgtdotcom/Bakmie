'use client'
import { useState, useRef, useEffect, useCallback } from 'react'
import Image from 'next/image'
import { useStore } from '@/store'
import { useSearchParams } from 'next/navigation'
import AppShell from '@/components/layout/AppShell'
import Modal from '@/components/ui/Modal'
import Toast, { showToast } from '@/components/ui/Toast'
import { formatRupiah } from '@/lib/utils'
import { MenuItem, Table, User, Role } from '@/types'
import { MENU_CATEGORIES } from '@/lib/data'
import { Pencil, Trash2, Plus, Camera } from 'lucide-react'

type AdminTab = 'menu' | 'meja' | 'users'

/* ─── MENU MODAL ─── */
function MenuModal({ open, onClose, editing }: { open: boolean; onClose: () => void; editing: MenuItem | null }) {
  const { addMenuItem, updateMenuItem } = useStore()
  const fileRef = useRef<HTMLInputElement>(null)
  const [form, setForm] = useState<Partial<MenuItem>>(editing || { emoji: '🍜', category: 'Menu Utama', badge: '' })
  // imgPreview: shows current saved URL or a local blob URL before upload
  const [imgPreview, setImgPreview] = useState(editing?.imageUrl || '')
  const [pendingFile, setPendingFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)

  // Reset state when modal opens/closes
  useEffect(() => {
    setForm(editing || { emoji: '🍜', category: 'Menu Utama', badge: '' })
    setImgPreview(editing?.imageUrl || '')
    setPendingFile(null)
    setUploading(false)
  }, [editing, open])

  const set = (k: keyof MenuItem, v: any) => setForm(f => ({ ...f, [k]: v }))

  // When user picks a file — show local preview instantly, defer actual upload until save
  const handleImg = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    // Validate type client-side too
    if (!file.type.startsWith('image/')) { showToast('⚠️ Hanya file gambar yang diizinkan'); return }
    if (file.size > 5 * 1024 * 1024) { showToast('⚠️ Ukuran file maksimal 5MB'); return }
    // Show local preview with object URL (instant, no upload yet)
    const localUrl = URL.createObjectURL(file)
    setImgPreview(localUrl)
    setPendingFile(file)
  }

  const save = async () => {
    if (!form.name?.trim() || !form.price) { showToast('⚠️ Nama & harga wajib diisi'); return }
    setUploading(true)

    try {
      let finalImageUrl = editing?.imageUrl || ''

      // If user picked a new file, upload it now
      if (pendingFile) {
        const { uploadImage, deleteImage } = await import('@/lib/uploadImage')
        // Delete old image from server if replacing
        if (editing?.imageUrl && editing.imageUrl.startsWith('/uploads/')) {
          await deleteImage(editing.imageUrl)
        }
        finalImageUrl = await uploadImage(pendingFile)
      }

      const data = {
        name: form.name!.trim(),
        category: form.category || 'Menu Utama',
        price: Number(form.price),
        emoji: form.emoji || '🍜',
        imageUrl: finalImageUrl,
        description: form.description || '',
        badge: (form.badge || '') as any,
      }

      if (editing) updateMenuItem(editing.id, data)
      else addMenuItem(data)

      showToast(editing ? '✅ Menu berhasil diperbarui' : '✅ Menu berhasil ditambahkan')
      onClose()
    } catch (err: any) {
      showToast('❌ Gagal upload gambar: ' + (err.message || 'Error'))
    } finally {
      setUploading(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={editing ? 'Edit Menu' : 'Tambah Menu Baru'}>
      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImg} />
      <div className="flex flex-col gap-3">

        {/* Image upload */}
        <div>
          <label className="block text-xs font-semibold text-[#7A6E5A] uppercase tracking-wide mb-1.5">
            Foto Menu
            <span className="ml-1 font-normal normal-case text-[#C8BFAD]">(JPG/PNG/WebP, maks 5MB)</span>
          </label>
          <div
            onClick={() => !uploading && fileRef.current?.click()}
            className={`relative h-32 border-2 border-dashed rounded-xl overflow-hidden flex items-center justify-center bg-[#F5EDD8] transition-colors ${
              uploading ? 'opacity-60 cursor-wait' : 'cursor-pointer hover:border-[#E8B020]'
            } ${imgPreview ? 'border-[#1B4A3A]' : 'border-[#D9CCB0]'}`}
          >
            {imgPreview && (
              // next/image tidak support blob: URL (preview lokal sebelum upload ke server)
              // eslint-disable-next-line @next/next/no-img-element
              <img src={imgPreview} alt="Preview foto menu" className="absolute inset-0 w-full h-full object-cover" />
            )}
            <div className={`relative z-10 flex flex-col items-center gap-1 ${imgPreview ? 'bg-black/55 text-white rounded-xl px-4 py-2' : 'text-[#7A6E5A]'}`}>
              {uploading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  <span className="text-xs font-medium">Mengupload...</span>
                </>
              ) : (
                <>
                  <Camera size={22} />
                  <span className="text-xs font-medium">{imgPreview ? '📷 Ganti Foto' : '📷 Upload Foto'}</span>
                  {pendingFile && !uploading && (
                    <span className="text-[10px] opacity-75">{pendingFile.name}</span>
                  )}
                </>
              )}
            </div>
          </div>
          {/* Show where image is stored */}
          {imgPreview && !pendingFile && editing?.imageUrl?.startsWith('/uploads/') && (
            <p className="text-[10px] text-[#7A6E5A] mt-1">
              📁 Tersimpan di server: <code className="bg-[#F5EDD8] px-1 rounded">{editing.imageUrl}</code>
            </p>
          )}
          {pendingFile && (
            <p className="text-[10px] text-[#E8B020] mt-1">
              ⏳ Foto baru akan diupload saat klik Simpan
            </p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs font-semibold text-[#7A6E5A] uppercase tracking-wide mb-1">Emoji</label>
            <input value={form.emoji || ''} onChange={e => set('emoji', e.target.value)} maxLength={4} placeholder="🍜" className="w-full border border-[#D9CCB0] rounded-lg px-3 py-2 text-sm bg-[#F5EDD8] outline-none focus:border-[#1B4A3A]" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#7A6E5A] uppercase tracking-wide mb-1">Label</label>
            <select value={form.badge || ''} onChange={e => set('badge', e.target.value)} className="w-full border border-[#D9CCB0] rounded-lg px-2 py-2 text-sm bg-[#F5EDD8] outline-none focus:border-[#1B4A3A]">
              <option value="">— Tidak ada —</option>
              <option value="bestseller">⭐ Best Seller</option>
              <option value="new">🆕 Baru</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#7A6E5A] uppercase tracking-wide mb-1">Nama Menu *</label>
          <input value={form.name || ''} onChange={e => set('name', e.target.value)} placeholder="Nama menu..." className="w-full border border-[#D9CCB0] rounded-lg px-3 py-2 text-sm bg-[#F5EDD8] outline-none focus:border-[#1B4A3A]" />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs font-semibold text-[#7A6E5A] uppercase tracking-wide mb-1">Kategori</label>
            <select value={form.category || ''} onChange={e => set('category', e.target.value)} className="w-full border border-[#D9CCB0] rounded-lg px-2 py-2 text-sm bg-[#F5EDD8] outline-none focus:border-[#1B4A3A]">
              {MENU_CATEGORIES.filter(c => c !== 'Semua').map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#7A6E5A] uppercase tracking-wide mb-1">Harga (Rp) *</label>
            <input type="number" value={form.price || ''} onChange={e => set('price', e.target.value)} placeholder="25000" className="w-full border border-[#D9CCB0] rounded-lg px-3 py-2 text-sm bg-[#F5EDD8] outline-none focus:border-[#1B4A3A]" />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#7A6E5A] uppercase tracking-wide mb-1">Deskripsi</label>
          <textarea value={form.description || ''} onChange={e => set('description', e.target.value)} rows={2} placeholder="Deskripsi singkat..." className="w-full border border-[#D9CCB0] rounded-lg px-3 py-2 text-sm bg-[#F5EDD8] outline-none focus:border-[#1B4A3A] resize-none" />
        </div>

        <div className="flex gap-2 pt-1">
          <button onClick={onClose} disabled={uploading} className="flex-1 py-2.5 border border-[#EDE0C4] rounded-xl text-sm font-semibold text-[#7A6E5A] disabled:opacity-50">Batal</button>
          <button
            onClick={save}
            disabled={uploading}
            className="flex-grow-[2] py-2.5 bg-[#1B4A3A] text-white rounded-xl text-sm font-bold hover:bg-[#153C2E] disabled:opacity-60 disabled:cursor-wait flex items-center justify-center gap-2"
          >
            {uploading ? (
              <><div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Mengupload...</>
            ) : (
              '💾 Simpan'
            )}
          </button>
        </div>
      </div>
    </Modal>
  )
}

/* ─── MEJA MODAL ─── */
function MejaModal({ open, onClose, editing }: { open: boolean; onClose: () => void; editing: Table | null }) {
  const { addTable, updateTable } = useStore()
  const [name, setName] = useState(editing?.name || '')
  const [type, setType] = useState<'indoor' | 'other'>(editing?.type || 'indoor')

  const save = () => {
    if (!name.trim()) { showToast('⚠️ Nama wajib diisi'); return }
    if (editing) updateTable(editing.id, { name, type })
    else addTable({ name, type })
    showToast(editing ? '✅ Meja diperbarui' : '✅ Meja ditambahkan')
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} title={editing ? 'Edit Meja' : 'Tambah Meja'}>
      <div className="flex flex-col gap-3">
        <div>
          <label className="block text-xs font-semibold text-[#7A6E5A] uppercase tracking-wide mb-1">Nama Meja</label>
          <input value={name} onChange={e => setName(e.target.value)} placeholder="Meja 7 / VIP Room / dll..." className="w-full border border-[#D9CCB0] rounded-lg px-3 py-2 text-sm bg-[#F5EDD8] outline-none focus:border-[#1B4A3A]" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-[#7A6E5A] uppercase tracking-wide mb-1">Tipe</label>
          <select value={type} onChange={e => setType(e.target.value as any)} className="w-full border border-[#D9CCB0] rounded-lg px-3 py-2 text-sm bg-[#F5EDD8] outline-none focus:border-[#1B4A3A]">
            <option value="indoor">🪑 Indoor</option>
            <option value="other">📦 Lainnya (Take Away / Online)</option>
          </select>
        </div>
        <div className="flex gap-2 pt-1">
          <button onClick={onClose} className="flex-1 py-2.5 border border-[#EDE0C4] rounded-xl text-sm font-semibold text-[#7A6E5A]">Batal</button>
          <button onClick={save} className="flex-grow-[2] py-2.5 bg-[#1B4A3A] text-white rounded-xl text-sm font-bold">💾 Simpan</button>
        </div>
      </div>
    </Modal>
  )
}

/* ─── USER MODAL ─── */
function UserModal({ open, onClose, editing, editIdx }: { open: boolean; onClose: () => void; editing: User | null; editIdx: number }) {
  const { addUser, updateUser } = useStore()
  const [name, setName] = useState(editing?.name || '')
  const [username, setUsername] = useState(editing?.username || '')
  const [pass, setPass] = useState('')
  const [role, setRole] = useState<Role>(editing?.role || 'cashier')

  const save = () => {
    if (!name.trim()) { showToast('⚠️ Nama wajib diisi'); return }
    if (!editing && !pass) { showToast('⚠️ Password wajib untuk user baru'); return }
    if (editing) {
      updateUser(editing.id, { name, username: username || name.toLowerCase().replace(/\s/g, ''), role, ...(pass ? { password: pass } : {}) })
    } else {
      addUser({ name, username: username || name.toLowerCase().replace(/\s/g, ''), password: pass, role })
    }
    showToast(editing ? '✅ User diperbarui' : '✅ User ditambahkan')
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} title={editing ? 'Edit User' : 'Tambah User'}>
      <div className="flex flex-col gap-3">
        <div>
          <label className="block text-xs font-semibold text-[#7A6E5A] uppercase tracking-wide mb-1">Nama Lengkap</label>
          <input value={name} onChange={e => setName(e.target.value)} placeholder="Nama..." className="w-full border border-[#D9CCB0] rounded-lg px-3 py-2 text-sm bg-[#F5EDD8] outline-none focus:border-[#1B4A3A]" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-[#7A6E5A] uppercase tracking-wide mb-1">Username</label>
          <input value={username} onChange={e => setUsername(e.target.value)} placeholder="username (opsional, auto-generate)" className="w-full border border-[#D9CCB0] rounded-lg px-3 py-2 text-sm bg-[#F5EDD8] outline-none focus:border-[#1B4A3A]" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-[#7A6E5A] uppercase tracking-wide mb-1">Password {editing ? '(kosong = tidak diubah)' : '*'}</label>
          <input type="password" value={pass} onChange={e => setPass(e.target.value)} placeholder="password..." className="w-full border border-[#D9CCB0] rounded-lg px-3 py-2 text-sm bg-[#F5EDD8] outline-none focus:border-[#1B4A3A]" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-[#7A6E5A] uppercase tracking-wide mb-1">Role</label>
          <select value={role} onChange={e => setRole(e.target.value as Role)} className="w-full border border-[#D9CCB0] rounded-lg px-3 py-2 text-sm bg-[#F5EDD8] outline-none focus:border-[#1B4A3A]">
            <option value="cashier">💰 Cashier</option>
            <option value="waitress">🍽️ Waitress</option>
            <option value="admin">👑 Admin</option>
          </select>
        </div>
        <div className="flex gap-2 pt-1">
          <button onClick={onClose} className="flex-1 py-2.5 border border-[#EDE0C4] rounded-xl text-sm font-semibold text-[#7A6E5A]">Batal</button>
          <button onClick={save} className="flex-grow-[2] py-2.5 bg-[#1B4A3A] text-white rounded-xl text-sm font-bold">💾 Simpan</button>
        </div>
      </div>
    </Modal>
  )
}

/* ─── MAIN PAGE ─── */
export default function AdminPage() {
  const { menu, tables, users, deleteMenuItem, deleteTable, deleteUser } = useStore()
  const searchParams = useSearchParams()
  const initialTab = (searchParams.get('tab') as AdminTab) || 'menu'
  const [tab, setTab] = useState<AdminTab>(initialTab)
  const [search, setSearch] = useState('')

  // Sync tab when URL param changes
  useEffect(() => {
    const t = searchParams.get('tab') as AdminTab
    if (t && ['menu', 'meja', 'users'].includes(t)) setTab(t)
  }, [searchParams])
  const [menuModal, setMenuModal] = useState<{ open: boolean; item: MenuItem | null }>({ open: false, item: null })
  const [mejaModal, setMejaModal] = useState<{ open: boolean; item: Table | null }>({ open: false, item: null })
  const [userModal, setUserModal] = useState<{ open: boolean; user: User | null; idx: number }>({ open: false, user: null, idx: -1 })

  const TABS: { key: AdminTab; label: string }[] = [
    { key: 'menu', label: '📋 Menu' },
    { key: 'meja', label: '🪑 Meja' },
    { key: 'users', label: '👤 User' },
  ]

  return (
    <AppShell showBack backLabel="Dashboard" backHref="/dashboard" allowedRoles={['admin']}>
      <Toast />

      {/* Tabs */}
      <div className="flex bg-[#153C2E] border-b-2 border-[#E8B020]/25 shrink-0">
        {TABS.map(t => (
          <button
            key={t.key}
            onClick={() => { setTab(t.key); setSearch('') }}
            className={`flex-1 py-3 text-xs font-semibold transition-colors border-b-2 ${tab === t.key ? 'text-[#E8B020] border-[#E8B020]' : 'text-white/50 border-transparent hover:text-white/80'}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-3.5 flex flex-col gap-3">

        {/* ── MENU TAB ── */}
        {tab === 'menu' && (
          <>
            <div className="flex gap-2">
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍 Cari menu..." className="flex-1 border border-[#D9CCB0] rounded-xl px-3 py-2 text-sm bg-[#F5EDD8] outline-none focus:border-[#1B4A3A]" />
              <button onClick={() => setMenuModal({ open: true, item: null })} className="flex items-center gap-1.5 px-3 py-2 bg-[#1B4A3A] text-white text-xs font-bold rounded-xl hover:bg-[#153C2E] shrink-0">
                <Plus size={14} /> Tambah
              </button>
            </div>
            <div className="flex flex-col gap-2.5">
              {menu.filter(m => m.name.toLowerCase().includes(search.toLowerCase()) || m.category.toLowerCase().includes(search.toLowerCase())).map(m => (
                <div key={m.id} className="bg-white rounded-xl p-3 shadow-sm flex items-center gap-3">
                  {/* Image thumbnail */}
                  <div
                    className="w-12 h-12 rounded-xl bg-[#EDE0C4] flex items-center justify-center overflow-hidden relative shrink-0 cursor-pointer border-2 border-dashed border-[#D9CCB0] hover:border-[#E8B020] transition-colors"
                    onClick={() => setMenuModal({ open: true, item: m })}
                    title="Klik untuk edit foto"
                  >
                    {m.imageUrl ? (
                      <Image
                        src={m.imageUrl}
                        alt={m.name}
                        fill
                        className="object-cover"
                        unoptimized
                        sizes="48px"
                      />
                    ) : null}
                    <span className="text-xl relative z-10" style={{ opacity: m.imageUrl ? 0.15 : 1 }}>{m.emoji}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-[#1A1208] truncate">{m.name}</div>
                    <div className="text-xs text-[#7A6E5A]">{m.category}</div>
                    <div className="text-sm font-bold text-[#1B4A3A]">{formatRupiah(m.price)}</div>
                  </div>
                  <div className="flex gap-1.5 shrink-0">
                    <button onClick={() => setMenuModal({ open: true, item: m })} className="p-1.5 border border-[#EDE0C4] rounded-lg text-[#7A6E5A] hover:border-[#1B4A3A] hover:text-[#1B4A3A] transition-colors">
                      <Pencil size={13} />
                    </button>
                    <button onClick={() => { if (confirm('Hapus menu ini?')) { deleteMenuItem(m.id); showToast('🗑 Menu dihapus') } }} className="p-1.5 border border-[#EDE0C4] rounded-lg text-[#7A6E5A] hover:border-red-400 hover:text-red-500 transition-colors">
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* ── MEJA TAB ── */}
        {tab === 'meja' && (
          <>
            <button onClick={() => setMejaModal({ open: true, item: null })} className="flex items-center gap-1.5 px-3 py-2 bg-[#1B4A3A] text-white text-xs font-bold rounded-xl hover:bg-[#153C2E] self-start">
              <Plus size={14} /> Tambah Meja
            </button>
            {(['indoor', 'other'] as const).map(type => (
              <div key={type}>
                <div className="text-xs font-semibold text-[#7A6E5A] uppercase tracking-wider mb-2">
                  {type === 'indoor' ? 'Meja Indoor' : 'Lainnya'}
                </div>
                <div className="flex flex-col gap-2">
                  {tables.filter(t => t.type === type).map(t => (
                    <div key={t.id} className="bg-white rounded-xl px-4 py-3 shadow-sm flex items-center gap-3">
                      <span className="text-xl">{type === 'indoor' ? '🪑' : t.name.includes('GoFood') ? '🛵' : '🛍️'}</span>
                      <div className="flex-1">
                        <div className="text-sm font-semibold text-[#1A1208]">{t.name}</div>
                        <div className="text-xs text-[#7A6E5A]">{type === 'indoor' ? 'Indoor' : 'Lainnya'}</div>
                      </div>
                      <div className="flex gap-1.5">
                        <button onClick={() => setMejaModal({ open: true, item: t })} className="p-1.5 border border-[#EDE0C4] rounded-lg text-[#7A6E5A] hover:border-[#1B4A3A] hover:text-[#1B4A3A] transition-colors">
                          <Pencil size={13} />
                        </button>
                        <button onClick={() => { if (confirm('Hapus meja ini?')) { deleteTable(t.id); showToast('🗑 Meja dihapus') } }} className="p-1.5 border border-[#EDE0C4] rounded-lg text-[#7A6E5A] hover:border-red-400 hover:text-red-500 transition-colors">
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </>
        )}

        {/* ── USERS TAB ── */}
        {tab === 'users' && (
          <>
            <button onClick={() => setUserModal({ open: true, user: null, idx: -1 })} className="flex items-center gap-1.5 px-3 py-2 bg-[#1B4A3A] text-white text-xs font-bold rounded-xl hover:bg-[#153C2E] self-start">
              <Plus size={14} /> Tambah User
            </button>
            <div className="flex flex-col gap-2">
              {users.map((u, i) => (
                <div key={u.id} className="bg-white rounded-xl px-4 py-3 shadow-sm flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#EDE0C4] flex items-center justify-center text-lg shrink-0">
                    {{ admin: '👑', cashier: '💰', waitress: '🍽️' }[u.role]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-[#1A1208]">{u.name} <span className="text-xs text-[#7A6E5A]">({u.username})</span></div>
                    <div className="text-xs text-[#7A6E5A]">{{ admin: 'Administrator', cashier: 'Kasir', waitress: 'Pelayan' }[u.role]}</div>
                  </div>
                  <div className="flex gap-1.5">
                    <button onClick={() => setUserModal({ open: true, user: u, idx: i })} className="p-1.5 border border-[#EDE0C4] rounded-lg text-[#7A6E5A] hover:border-[#1B4A3A] hover:text-[#1B4A3A] transition-colors">
                      <Pencil size={13} />
                    </button>
                    {u.username !== 'admin' && (
                      <button onClick={() => { if (confirm('Hapus user ini?')) { deleteUser(u.id); showToast('🗑 User dihapus') } }} className="p-1.5 border border-[#EDE0C4] rounded-lg text-[#7A6E5A] hover:border-red-400 hover:text-red-500 transition-colors">
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Modals */}
      <MenuModal open={menuModal.open} onClose={() => setMenuModal({ open: false, item: null })} editing={menuModal.item} />
      <MejaModal open={mejaModal.open} onClose={() => setMejaModal({ open: false, item: null })} editing={mejaModal.item} />
      <UserModal open={userModal.open} onClose={() => setUserModal({ open: false, user: null, idx: -1 })} editing={userModal.user} editIdx={userModal.idx} />
    </AppShell>
  )
}
