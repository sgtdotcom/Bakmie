export type Role = 'superadmin' | 'admin' | 'cashier' | 'waitress' | 'dapur'

export interface Category {
  id: string
  name: string
  emoji: string
  order: number
}

export interface User {
  id: number
  username: string
  password: string
  name: string
  role: Role
}

export interface MenuItem {
  id: number
  name: string
  category: string
  price: number
  emoji: string
  imageUrl: string
  description: string
  badge: 'bestseller' | 'new' | ''
}

export interface Table {
  id: string
  name: string
  type: 'indoor' | 'other'
}

export interface OrderItem {
  menuId: number
  name: string
  emoji: string
  price: number
  quantity: number
  note: string
  imageUrl: string
}

export interface TableOrder {
  tableId: string
  items: OrderItem[]
  isOrdered: boolean
}

export interface Transaction {
  id: string
  date: string        // YYYY-MM-DD untuk filter bulanan
  time: string        // HH:MM untuk tampilan
  tableName: string
  items: { name: string; quantity: number; price: number; note: string }[]
  subtotal: number
  discount: number
  total: number       // tanpa PPN
  paymentMethod: string
  cashReceived: number
  change: number
  cashierName: string
}
