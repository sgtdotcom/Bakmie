import Image from 'next/image'
import { MenuItem } from '@/types'
import { formatRupiah } from '@/lib/utils'

interface MenuCardProps {
  item: MenuItem
  onClick: () => void
}

export default function MenuCard({ item, onClick }: MenuCardProps) {
  return (
    <div
      onClick={onClick}
      className="bg-white rounded-xl overflow-hidden border-2 border-transparent cursor-pointer transition-all duration-150 shadow-[0_2px_16px_rgba(0,0,0,0.12)] flex flex-col active:scale-95 active:border-[#E8B020] hover:border-[#E8B020] hover:-translate-y-0.5 hover:shadow-lg"
    >
      {/* Image area */}
      <div className="h-16 bg-[#EDE0C4] flex items-center justify-center relative overflow-hidden shrink-0">
        {item.imageUrl ? (
          <Image
            src={item.imageUrl}
            alt={item.name}
            fill
            className="object-cover"
            unoptimized
            sizes="160px"
          />
        ) : null}
        <span className="text-3xl relative z-10" style={{ opacity: item.imageUrl ? 0.15 : 1 }}>
          {item.emoji}
        </span>
        {item.badge && (
          <span className="absolute top-1 right-1 z-20 text-[8px] font-bold px-1.5 py-0.5 rounded-md bg-[#E8B020] text-[#0E2820] uppercase">
            {item.badge === 'bestseller' ? '⭐ Best' : '🆕 Baru'}
          </span>
        )}
      </div>

      {/* Body */}
      <div className="p-2 flex flex-col gap-0.5 flex-1">
        <div className="text-[10px] text-[#7A6E5A]">{item.category}</div>
        <div className="text-xs font-semibold text-[#1A1208] leading-tight">{item.name}</div>
        <div className="text-[10px] text-[#7A6E5A] leading-tight mt-0.5 line-clamp-2">{item.description}</div>
        <div className="text-xs font-bold text-[#1B4A3A] mt-auto pt-1">{formatRupiah(item.price)}</div>
      </div>
    </div>
  )
}
