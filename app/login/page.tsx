'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useStore } from '@/store'
import { Role } from '@/types'

const ROLES = [
  { value: 'admin', label: '👑 Admin' },
  { value: 'cashier', label: '💰 Cashier' },
  { value: 'waitress', label: '🍽️ Waitress' },
]

export default function LoginPage() {
  const router = useRouter()
  const { login, currentUser } = useStore()

  const [role, setRole] = useState<Role | ''>('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (currentUser) router.replace('/dashboard')
  }, [currentUser, router])

  const handleLogin = () => {
    if (!role) { setError(true); return }
    setLoading(true)
    setTimeout(() => {
      const ok = login(username, password, role as Role)
      if (ok) router.replace('/dashboard')
      else { setError(true); setLoading(false) }
    }, 300)
  }

  return (
    <div className="fixed inset-0 bg-[#0E2820] flex flex-col items-center justify-center p-6 animate-fade-in">
      {/* Logo */}
      <div className="w-18 h-18 rounded-2xl bg-[#E8B020] flex items-center justify-center mb-4 shadow-[0_8px_32px_rgba(232,176,32,0.35)]"
        style={{ width: 72, height: 72 }}>
        <span className="font-playfair font-black text-3xl text-[#0E2820]">SA</span>
      </div>

      <h1 className="font-playfair text-xl font-bold text-[#F5EDD8] text-center leading-tight mb-1">
        Warung Bakmie<br />
        <span className="text-[#F5C840]">"SEKTOR ANTAPANI"</span>
      </h1>
      <p className="text-[11px] text-white/40 text-center mb-8">📍 Jl. Terusan Jakarta No.78A, Antapani</p>

      {/* Card */}
      <div className="w-full max-w-sm bg-white/5 border border-[#E8B020]/20 rounded-2xl p-6 flex flex-col gap-4">
        {/* Role */}
        <div>
          <label className="block text-[11px] font-semibold text-[#E8B020] uppercase tracking-wider mb-1.5">
            Role / Jabatan
          </label>
          <select
            value={role}
            onChange={e => { setRole(e.target.value as Role); setError(false) }}
            className="w-full bg-white/7 border border-[#E8B020]/25 rounded-xl px-3 py-2.5 text-sm font-medium text-[#F5EDD8] outline-none focus:border-[#E8B020] transition-colors appearance-none"
            style={{ backgroundColor: 'rgba(255,255,255,0.07)' }}
          >
            <option value="" style={{ background: '#153C2E' }}>— Pilih Role —</option>
            {ROLES.map(r => (
              <option key={r.value} value={r.value} style={{ background: '#153C2E' }}>{r.label}</option>
            ))}
          </select>
        </div>

        {/* Username */}
        <div>
          <label className="block text-[11px] font-semibold text-[#E8B020] uppercase tracking-wider mb-1.5">Username</label>
          <input
            value={username}
            onChange={e => { setUsername(e.target.value); setError(false) }}
            onKeyDown={e => e.key === 'Enter' && document.getElementById('passInput')?.focus()}
            placeholder="Masukkan username..."
            className="w-full bg-white/7 border border-[#E8B020]/25 rounded-xl px-3 py-2.5 text-sm font-medium text-[#F5EDD8] outline-none focus:border-[#E8B020] transition-colors placeholder:text-white/30"
            style={{ backgroundColor: 'rgba(255,255,255,0.07)' }}
          />
        </div>

        {/* Password */}
        <div>
          <label className="block text-[11px] font-semibold text-[#E8B020] uppercase tracking-wider mb-1.5">Password</label>
          <input
            id="passInput"
            type="password"
            value={password}
            onChange={e => { setPassword(e.target.value); setError(false) }}
            onKeyDown={e => e.key === 'Enter' && handleLogin()}
            placeholder="Masukkan password..."
            className="w-full bg-white/7 border border-[#E8B020]/25 rounded-xl px-3 py-2.5 text-sm font-medium text-[#F5EDD8] outline-none focus:border-[#E8B020] transition-colors placeholder:text-white/30"
            style={{ backgroundColor: 'rgba(255,255,255,0.07)' }}
          />
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-900/20 border border-red-400/30 rounded-xl px-3 py-2 text-xs text-red-300 text-center">
            Username, password, atau role salah
          </div>
        )}

        {/* Submit */}
        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full bg-[#E8B020] hover:bg-[#F5C840] text-[#0E2820] font-bold text-sm py-3 rounded-xl transition-colors disabled:opacity-60 mt-1"
        >
          {loading ? 'Memproses...' : 'Masuk →'}
        </button>
      </div>

      <p className="mt-5 text-[11px] text-white/25 text-center">
        Demo: admin/admin123 · cashier1/cash123 · waitress1/wait123
      </p>
    </div>
  )
}
