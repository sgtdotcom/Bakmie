export type Role = 'admin' | 'cashier' | 'waitress'

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
  time: string
  tableName: string
  items: { name: string; quantity: number; price: number; note: string }[]
  subtotal: number
  discount: number
  tax: number
  total: number
  paymentMethod: string
  cashReceived: number
  change: number
  cashierName: string
}
