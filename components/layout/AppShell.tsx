'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useStore } from '@/store'
import { Role } from '@/types'
import Clock from '@/components/ui/Clock'
import { LogOut, ChevronLeft } from 'lucide-react'

interface AppShellProps {
  children: React.ReactNode
  allowedRoles?: Role[]
  showBack?: boolean
  backLabel?: string
  onBack?: () => void
  backHref?: string
}

const roleColors: Record<Role, string> = {
  admin: 'bg-[#E8B020]/20 text-[#E8B020] border border-[#E8B020]/30',
  cashier: 'bg-[#1B4A3A]/60 text-[#7ECDB0] border border-[#7ECDB0]/30',
  waitress: 'bg-[#3A7A60]/40 text-[#A8DCC8] border border-[#A8DCC8]/30',
}
const roleLabels: Record<Role, string> = {
  admin: '👑 Admin',
  cashier: '💰 Cashier',
  waitress: '🍽️ Waitress',
}

export default function AppShell({ children, allowedRoles, showBack, backLabel = 'Dashboard', onBack, backHref }: AppShellProps) {
  const router = useRouter()
  const currentUser = useStore(s => s.currentUser)
  const logout = useStore(s => s.logout)

  useEffect(() => {
    if (!currentUser) { router.replace('/login'); return }
    if (allowedRoles && !allowedRoles.includes(currentUser.role)) {
      router.replace('/dashboard')
    }
  }, [currentUser, allowedRoles, router])

  const handleLogout = () => { logout(); router.replace('/login') }

  const handleBack = () => {
    if (onBack) onBack()
    else if (backHref) router.push(backHref)
    else router.push('/dashboard')
  }

  if (!currentUser) return null

  return (
    <div className="fixed inset-0 flex flex-col overflow-hidden">
      {/* Header */}
      <header className="h-[54px] bg-[#0E2820] border-b-[3px] border-[#E8B020] flex items-center justify-between px-3 shrink-0 z-50 gap-2">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          {showBack && (
            <button
              onClick={handleBack}
              className="flex items-center gap-1 bg-white/10 border border-white/15 rounded-lg px-2 py-1.5 text-[#F5EDD8] text-xs font-semibold shrink-0 hover:bg-white/16 transition-colors"
            >
              <ChevronLeft size={14} />
              {backLabel}
            </button>
          )}
          {!showBack && (
            <>
              <div className="w-8 h-8 rounded-lg bg-[#E8B020] flex items-center justify-center font-playfair font-black text-xs text-[#0E2820] shrink-0">SA</div>
              <div className="min-w-0">
                <div className="font-playfair text-xs font-bold text-[#F5EDD8] truncate">
                  Warung Bakmie <span className="text-[#F5C840]">"SEKTOR ANTAPANI"</span>
                </div>
                <div className="text-[9px] text-white/40 truncate">📍 Jl. Terusan Jakarta No.78A, Antapani</div>
              </div>
            </>
          )}
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <span className={`text-[10px] font-bold px-2 py-1 rounded-lg hidden sm:block ${roleColors[currentUser.role]}`}>
            {roleLabels[currentUser.role]} — {currentUser.name}
          </span>
          <Clock />
          <button onClick={handleLogout} className="flex items-center gap-1 bg-white/8 border border-white/15 rounded-lg px-2 py-1.5 text-white/70 text-xs font-semibold hover:bg-red-900/40 hover:text-white hover:border-red-400/40 transition-colors">
            <LogOut size={12} />
            <span className="hidden sm:inline">Keluar</span>
          </button>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 overflow-hidden flex flex-col">
        {children}
      </main>
    </div>
  )
}
