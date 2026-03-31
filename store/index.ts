'use client'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { User, MenuItem, Table, OrderItem, TableOrder, Transaction, Role } from '@/types'
import { INITIAL_USERS, INITIAL_TABLES, INITIAL_MENU, formatTime } from '@/lib/data'

interface AppState {
  // Auth
  currentUser: User | null
  login: (username: string, password: string, role: Role) => boolean
  logout: () => void

  // Data
  users: User[]
  tables: Table[]
  menu: MenuItem[]
  transactions: Transaction[]

  // Active orders per table
  tableOrders: Record<string, TableOrder>

  // Draft (current editing before "Pesan")
  draft: OrderItem[]
  activeTableId: string

  // Counters
  userCounter: number
  menuCounter: number
  tableCounter: number
  txCounter: number

  // User CRUD
  addUser: (u: Omit<User, 'id'>) => void
  updateUser: (id: number, u: Partial<User>) => void
  deleteUser: (id: number) => void

  // Menu CRUD
  addMenuItem: (m: Omit<MenuItem, 'id'>) => void
  updateMenuItem: (id: number, m: Partial<MenuItem>) => void
  deleteMenuItem: (id: number) => void

  // Table CRUD
  addTable: (t: Omit<Table, 'id'>) => void
  updateTable: (id: string, t: Partial<Table>) => void
  deleteTable: (id: string) => void

  // Draft ops
  setActiveTable: (tableId: string) => void
  addToDraft: (item: MenuItem) => void
  changeDraftQty: (index: number, delta: number) => void
  setDraftNote: (index: number, note: string) => void
  clearDraft: () => void

  // Order ops
  confirmOrder: () => OrderItem[]  // returns items sent to kitchen
  cancelTableOrder: (tableId: string) => void

  // Payment
  processPayment: (
    tableId: string,
    discount: number,
    paymentMethod: string,
    cashReceived: number
  ) => Transaction | null
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      currentUser: null,
      users: INITIAL_USERS,
      tables: INITIAL_TABLES,
      menu: INITIAL_MENU,
      transactions: [],
      tableOrders: {},
      draft: [],
      activeTableId: '',
      userCounter: 4,
      menuCounter: 54,
      tableCounter: 10,
      txCounter: 1,

      // ── AUTH ──
      login: (username, password, role) => {
        const user = get().users.find(
          u => u.username === username && u.password === password && u.role === role
        )
        if (!user) return false
        set({ currentUser: user })
        return true
      },
      logout: () => set({ currentUser: null, draft: [], activeTableId: '' }),

      // ── USERS ──
      addUser: (u) => set(s => ({
        users: [...s.users, { ...u, id: s.userCounter }],
        userCounter: s.userCounter + 1,
      })),
      updateUser: (id, u) => set(s => ({
        users: s.users.map(x => x.id === id ? { ...x, ...u } : x),
      })),
      deleteUser: (id) => set(s => ({
        users: s.users.filter(x => x.id !== id),
      })),

      // ── MENU ──
      addMenuItem: (m) => set(s => ({
        menu: [...s.menu, { ...m, id: s.menuCounter }],
        menuCounter: s.menuCounter + 1,
      })),
      updateMenuItem: (id, m) => set(s => ({
        menu: s.menu.map(x => x.id === id ? { ...x, ...m } : x),
      })),
      deleteMenuItem: (id) => set(s => ({
        menu: s.menu.filter(x => x.id !== id),
      })),

      // ── TABLES ──
      addTable: (t) => set(s => ({
        tables: [...s.tables, { ...t, id: 'meja' + s.tableCounter }],
        tableCounter: s.tableCounter + 1,
      })),
      updateTable: (id, t) => set(s => ({
        tables: s.tables.map(x => x.id === id ? { ...x, ...t } : x),
      })),
      deleteTable: (id) => set(s => ({
        tables: s.tables.filter(x => x.id !== id),
      })),

      // ── DRAFT ──
      setActiveTable: (tableId) => set({ activeTableId: tableId, draft: [] }),

      addToDraft: (item) => set(s => {
        const existing = s.draft.findIndex(d => d.menuId === item.id && d.note === '')
        if (existing >= 0) {
          const newDraft = [...s.draft]
          newDraft[existing] = { ...newDraft[existing], quantity: newDraft[existing].quantity + 1 }
          return { draft: newDraft }
        }
        return {
          draft: [...s.draft, {
            menuId: item.id,
            name: item.name,
            emoji: item.emoji,
            imageUrl: item.imageUrl,
            price: item.price,
            quantity: 1,
            note: '',
          }]
        }
      }),

      changeDraftQty: (index, delta) => set(s => {
        const newDraft = [...s.draft]
        newDraft[index] = { ...newDraft[index], quantity: newDraft[index].quantity + delta }
        return { draft: newDraft.filter(d => d.quantity > 0) }
      }),

      setDraftNote: (index, note) => set(s => {
        const newDraft = [...s.draft]
        newDraft[index] = { ...newDraft[index], note }
        return { draft: newDraft }
      }),

      clearDraft: () => set({ draft: [] }),

      // ── ORDER ──
      confirmOrder: () => {
        const { draft, activeTableId, tableOrders } = get()
        if (!draft.length || !activeTableId) return []

        const existing = tableOrders[activeTableId] || { tableId: activeTableId, items: [], isOrdered: false }
        const merged = [...existing.items]

        draft.forEach(d => {
          const idx = merged.findIndex(m => m.menuId === d.menuId && m.note === d.note)
          if (idx >= 0) merged[idx] = { ...merged[idx], quantity: merged[idx].quantity + d.quantity }
          else merged.push({ ...d })
        })

        const sentItems = [...draft]
        set(s => ({
          tableOrders: {
            ...s.tableOrders,
            [activeTableId]: { tableId: activeTableId, items: merged, isOrdered: true }
          },
          draft: [],
        }))
        return sentItems
      },

      cancelTableOrder: (tableId) => set(s => {
        const newOrders = { ...s.tableOrders }
        delete newOrders[tableId]
        return { tableOrders: newOrders }
      }),

      // ── PAYMENT ──
      processPayment: (tableId, discount, paymentMethod, cashReceived) => {
        const { tableOrders, tables, currentUser, txCounter } = get()
        const order = tableOrders[tableId]
        if (!order || !order.items.length) return null

        const table = tables.find(t => t.id === tableId)
        const subtotal = order.items.reduce((s, i) => s + i.price * i.quantity, 0)
        const discounted = Math.max(0, subtotal - discount)
        const tax = Math.round(discounted * 0.11)
        const total = discounted + tax

        if (paymentMethod === 'Tunai' && cashReceived < total) return null

        const trx: Transaction = {
          id: 'TRX' + String(txCounter).padStart(3, '0'),
          time: formatTime(new Date()),
          tableName: table?.name || tableId,
          items: order.items.map(i => ({
            name: i.name, quantity: i.quantity, price: i.price, note: i.note
          })),
          subtotal, discount, tax, total,
          paymentMethod,
          cashReceived: paymentMethod === 'Tunai' ? cashReceived : 0,
          change: paymentMethod === 'Tunai' ? Math.max(0, cashReceived - total) : 0,
          cashierName: currentUser?.name || '',
        }

        set(s => {
          const newOrders = { ...s.tableOrders }
          delete newOrders[tableId]
          return {
            transactions: [trx, ...s.transactions],
            tableOrders: newOrders,
            txCounter: s.txCounter + 1,
          }
        })

        return trx
      },
    }),
    {
      name: 'sektor-antapani-pos',
      partialize: (s) => ({
        users: s.users,
        tables: s.tables,
        menu: s.menu,
        transactions: s.transactions,
        tableOrders: s.tableOrders,
        userCounter: s.userCounter,
        menuCounter: s.menuCounter,
        tableCounter: s.tableCounter,
        txCounter: s.txCounter,
      }),
    }
  )
)
