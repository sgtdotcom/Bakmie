import { MenuItem, Table, User } from '@/types'

export const INITIAL_USERS: User[] = [
  { id: 1, username: 'admin', password: 'admin123', name: 'Administrator', role: 'admin' },
  { id: 2, username: 'cashier1', password: 'cash123', name: 'Kasir 1', role: 'cashier' },
  { id: 3, username: 'waitress1', password: 'wait123', name: 'Pelayan 1', role: 'waitress' },
]

export const INITIAL_TABLES: Table[] = [
  { id: 'meja1', name: 'Meja 1', type: 'indoor' },
  { id: 'meja2', name: 'Meja 2', type: 'indoor' },
  { id: 'meja3', name: 'Meja 3', type: 'indoor' },
  { id: 'meja4', name: 'Meja 4', type: 'indoor' },
  { id: 'meja5', name: 'Meja 5', type: 'indoor' },
  { id: 'meja6', name: 'Meja 6', type: 'indoor' },
  { id: 'takeaway', name: 'Take Away', type: 'other' },
  { id: 'gofood', name: 'GoFood / GrabFood', type: 'other' },
]

export const MENU_CATEGORIES = [
  'Semua', 'Menu Utama', 'Tambahan', 'Roti Bakar',
  'Dimsum', 'Jus', 'Smoothies', 'Kopi', 'Milk Based', 'Teh', 'Yoghurt',
]

export const INITIAL_MENU: MenuItem[] = [
  { id: 1, name: 'Bakmie Ayam', category: 'Menu Utama', price: 26000, emoji: '🍜', imageUrl: '', description: 'Bakmie ayam + bakso sapi + pangsit rebus.', badge: 'bestseller' },
  { id: 2, name: 'Nasi Tim', category: 'Menu Utama', price: 20000, emoji: '🍱', imageUrl: '', description: 'Nasi kukus + topping ayam + telur rebus, kuah gurih.', badge: '' },
  { id: 3, name: 'Menchi Katsu Matah', category: 'Menu Utama', price: 32000, emoji: '🍛', imageUrl: '', description: 'Daging ayam Jepang + sambal matah + telur mata sapi.', badge: 'bestseller' },
  { id: 4, name: 'Menchi Katsu Curry', category: 'Menu Utama', price: 32000, emoji: '🍛', imageUrl: '', description: 'Daging ayam Jepang + saus curry.', badge: '' },
  { id: 5, name: 'Menchi Katsu Saus Keju', category: 'Menu Utama', price: 32000, emoji: '🍛', imageUrl: '', description: 'Daging ayam Jepang + saus keju + telur mata sapi.', badge: '' },
  { id: 6, name: 'Nasi Goreng Hongkong', category: 'Menu Utama', price: 22000, emoji: '🍳', imageUrl: '', description: 'Nasi goreng + ayam fillet dadu + mix vegetable + telur ceplok.', badge: '' },
  { id: 7, name: 'Nasi Ayam Bawang Putih', category: 'Menu Utama', price: 26000, emoji: '🍗', imageUrl: '', description: 'Ayam goreng bumbu bawang putih & rempah + saus ranch.', badge: '' },
  { id: 8, name: 'Bakso', category: 'Tambahan', price: 8000, emoji: '🥩', imageUrl: '', description: 'Bakso sapi.', badge: '' },
  { id: 9, name: 'Pangsit Rebus', category: 'Tambahan', price: 8000, emoji: '🥟', imageUrl: '', description: 'Pangsit rebus.', badge: '' },
  { id: 10, name: 'Saus Mayo', category: 'Tambahan', price: 6000, emoji: '🫙', imageUrl: '', description: 'Saus mayo.', badge: '' },
  { id: 11, name: 'Saus Ranch', category: 'Tambahan', price: 6000, emoji: '🫙', imageUrl: '', description: 'Saus ranch.', badge: '' },
  { id: 12, name: 'Roti Bakar Srikaya', category: 'Roti Bakar', price: 19000, emoji: '🍞', imageUrl: '', description: 'Roti bakar selai srikaya.', badge: 'bestseller' },
  { id: 13, name: 'Roti Bakar Kacang', category: 'Roti Bakar', price: 21000, emoji: '🍞', imageUrl: '', description: 'Roti bakar selai kacang.', badge: '' },
  { id: 14, name: 'Roti Bakar Cokelat', category: 'Roti Bakar', price: 19000, emoji: '🍫', imageUrl: '', description: 'Roti bakar cokelat.', badge: '' },
  { id: 15, name: 'Roti Bakar Keju', category: 'Roti Bakar', price: 24000, emoji: '🧀', imageUrl: '', description: 'Roti bakar keju.', badge: 'bestseller' },
  { id: 16, name: 'Roti Bakar Gula Mentega', category: 'Roti Bakar', price: 16000, emoji: '🍞', imageUrl: '', description: 'Roti bakar gula & mentega.', badge: '' },
  { id: 17, name: 'Dimsum Udang', category: 'Dimsum', price: 24000, emoji: '🦐', imageUrl: '', description: 'Dimsum udang + saus mentai + chilli oil.', badge: '' },
  { id: 18, name: 'Dimsum Ayam', category: 'Dimsum', price: 24000, emoji: '🫕', imageUrl: '', description: 'Dimsum ayam + saus mentai + chilli oil.', badge: '' },
  { id: 19, name: 'Dimsum Kepiting', category: 'Dimsum', price: 24000, emoji: '🦀', imageUrl: '', description: 'Dimsum ayam topping kepiting + saus mentai.', badge: '' },
  { id: 20, name: 'Dimsum Mozarella', category: 'Dimsum', price: 24000, emoji: '🫕', imageUrl: '', description: 'Dimsum ayam topping mozarella + saus mentai.', badge: '' },
  { id: 21, name: 'Jus Mangga', category: 'Jus', price: 18000, emoji: '🥭', imageUrl: '', description: 'Jus mangga segar.', badge: '' },
  { id: 22, name: 'Jus Sirsak', category: 'Jus', price: 18000, emoji: '🍈', imageUrl: '', description: 'Jus sirsak segar.', badge: '' },
  { id: 23, name: 'Jus Buah Naga', category: 'Jus', price: 18000, emoji: '🐉', imageUrl: '', description: 'Jus buah naga segar.', badge: '' },
  { id: 24, name: 'Jus Strawberry', category: 'Jus', price: 18000, emoji: '🍓', imageUrl: '', description: 'Jus strawberry segar.', badge: '' },
  { id: 25, name: 'Jus Alpukat', category: 'Jus', price: 18000, emoji: '🥑', imageUrl: '', description: 'Jus alpukat segar.', badge: '' },
  { id: 26, name: 'Jus Jambu', category: 'Jus', price: 18000, emoji: '🍎', imageUrl: '', description: 'Jus jambu segar.', badge: '' },
  { id: 27, name: 'Smoothies Pisang', category: 'Smoothies', price: 25000, emoji: '🍌', imageUrl: '', description: 'Smoothies pisang.', badge: '' },
  { id: 28, name: 'Smoothies Strawberry', category: 'Smoothies', price: 25000, emoji: '🍓', imageUrl: '', description: 'Smoothies strawberry.', badge: '' },
  { id: 29, name: 'Smoothies Naga', category: 'Smoothies', price: 25000, emoji: '🐉', imageUrl: '', description: 'Smoothies buah naga.', badge: '' },
  { id: 30, name: 'Mixed Smoothies', category: 'Smoothies', price: 28000, emoji: '🫐', imageUrl: '', description: 'Mixed smoothies berbagai buah.', badge: '' },
  { id: 31, name: 'Butterscotch', category: 'Kopi', price: 25000, emoji: '☕', imageUrl: '', description: 'Manis legit, creamy, aroma mentega hangat.', badge: '' },
  { id: 32, name: 'Caramel Latte', category: 'Kopi', price: 25000, emoji: '☕', imageUrl: '', description: 'Latte karamel.', badge: '' },
  { id: 33, name: 'Salted Caramel', category: 'Kopi', price: 26000, emoji: '☕', imageUrl: '', description: 'Karamel creamy + sea salt.', badge: '' },
  { id: 34, name: 'Es Kopi Latte', category: 'Kopi', price: 21000, emoji: '🧋', imageUrl: '', description: 'Es kopi latte.', badge: '' },
  { id: 35, name: 'Es Kopi Gula Aren', category: 'Kopi', price: 23000, emoji: '🧋', imageUrl: '', description: 'Es kopi gula aren.', badge: '' },
  { id: 36, name: 'Matcha Espresso', category: 'Kopi', price: 27000, emoji: '🍵', imageUrl: '', description: 'Matcha bertemu espresso.', badge: '' },
  { id: 37, name: 'Americano', category: 'Kopi', price: 20000, emoji: '☕', imageUrl: '', description: 'Espresso dengan air.', badge: '' },
  { id: 38, name: 'Tambahan Espresso', category: 'Kopi', price: 5000, emoji: '☕', imageUrl: '', description: 'Shot espresso tambahan.', badge: '' },
  { id: 39, name: 'Tambahan Gula Aren', category: 'Kopi', price: 4000, emoji: '🍯', imageUrl: '', description: 'Gula aren tambahan.', badge: '' },
  { id: 40, name: 'Green Tea', category: 'Milk Based', price: 20000, emoji: '🍵', imageUrl: '', description: 'Milk green tea.', badge: '' },
  { id: 41, name: 'Thai Tea', category: 'Milk Based', price: 18000, emoji: '🧡', imageUrl: '', description: 'Thai tea susu.', badge: '' },
  { id: 42, name: 'Cokelat', category: 'Milk Based', price: 18000, emoji: '🍫', imageUrl: '', description: 'Milk cokelat.', badge: '' },
  { id: 43, name: 'Milk Boba Brown Sugar', category: 'Milk Based', price: 20000, emoji: '🧋', imageUrl: '', description: 'Milk boba brown sugar.', badge: '' },
  { id: 44, name: 'Strawberry Green Tea', category: 'Milk Based', price: 22000, emoji: '🍓', imageUrl: '', description: 'Strawberry + green tea.', badge: '' },
  { id: 45, name: 'Es Teh', category: 'Teh', price: 9000, emoji: '🍹', imageUrl: '', description: 'Es teh manis.', badge: '' },
  { id: 46, name: 'Teh Lemon', category: 'Teh', price: 14000, emoji: '🍋', imageUrl: '', description: 'Teh perasan lemon.', badge: '' },
  { id: 47, name: 'Teh Leci', category: 'Teh', price: 21000, emoji: '🫧', imageUrl: '', description: 'Teh rasa leci.', badge: '' },
  { id: 48, name: 'Es Jeruk', category: 'Teh', price: 11000, emoji: '🍊', imageUrl: '', description: 'Es jeruk peras.', badge: '' },
  { id: 49, name: 'Yoghurt Leci', category: 'Yoghurt', price: 16000, emoji: '🥛', imageUrl: '', description: 'Yoghurt leci.', badge: '' },
  { id: 50, name: 'Yoghurt Strawberry', category: 'Yoghurt', price: 16000, emoji: '🍓', imageUrl: '', description: 'Yoghurt strawberry.', badge: '' },
  { id: 51, name: 'Yoghurt Mangga', category: 'Yoghurt', price: 16000, emoji: '🥭', imageUrl: '', description: 'Yoghurt mangga.', badge: '' },
  { id: 52, name: 'Yoghurt Blueberry', category: 'Yoghurt', price: 16000, emoji: '🫐', imageUrl: '', description: 'Yoghurt blueberry.', badge: '' },
  { id: 53, name: 'Yoghurt Anggur', category: 'Yoghurt', price: 16000, emoji: '🍇', imageUrl: '', description: 'Yoghurt anggur.', badge: '' },
]

export const formatRupiah = (n: number) =>
  'Rp ' + Math.round(n).toLocaleString('id-ID')

export const formatTime = (d: Date) =>
  d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
