import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const formatRupiah = (n: number) =>
  'Rp ' + Math.round(n).toLocaleString('id-ID')

export const formatTime = (d: Date) =>
  d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })

export const quickCashOptions = (total: number): number[] => {
  const denoms = [10000, 20000, 50000, 100000, 200000]
  const opts = denoms.filter(d => d >= total).slice(0, 4)
  if (!opts.length) opts.push(Math.ceil(total / 10000) * 10000)
  return opts
}
