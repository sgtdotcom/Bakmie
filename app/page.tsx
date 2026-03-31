'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useStore } from '@/store'

export default function Root() {
  const router = useRouter()
  const currentUser = useStore(s => s.currentUser)

  useEffect(() => {
    if (currentUser) router.replace('/dashboard')
    else router.replace('/login')
  }, [currentUser, router])

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-[#0E2820]">
      <div className="text-[#E8B020] text-4xl animate-spin">⚙</div>
    </div>
  )
}
