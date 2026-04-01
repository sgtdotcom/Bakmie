'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useStore } from '@/store'

export default function Root() {
  const router = useRouter()
  const currentUser = useStore(s => s.currentUser)

  useEffect(() => {
    if (!currentUser) { router.replace('/login'); return }
    if (currentUser.role === 'dapur') router.replace('/dapur')
    else router.replace('/dashboard')
  }, [currentUser, router])

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-[#0E2820]">
      <div className="text-[#E8B020] text-4xl animate-spin">⚙</div>
    </div>
  )
}
