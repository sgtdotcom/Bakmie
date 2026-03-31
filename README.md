# Sektor Antapani — POS System (Next.js)

Aplikasi Point of Sale untuk Warung Bakmie "Sektor Antapani" dibangun dengan Next.js 14, TypeScript, Tailwind CSS, dan Zustand.

---

## 🚀 Cara Menjalankan

```bash
# 1. Extract zip
unzip sektor-antapani-pos.zip
cd sektor-antapani-pos

# 2. Install dependencies
npm install

# 3. Jalankan development server
npm run dev

# 4. Buka browser
http://localhost:3000
```

---

## 🖼️ Sistem Penyimpanan Gambar Menu

Gambar menu disimpan di **server disk** (bukan localStorage browser), sehingga:

- ✅ Gambar **tidak hilang** saat pindah ke VPS
- ✅ Gambar bisa dilihat oleh **semua perangkat** yang mengakses aplikasi
- ✅ Upload sekali, tersedia di mana saja

### Cara kerjanya:
1. Admin klik "Upload Foto" di form tambah/edit menu
2. File dikirim ke API Route `/api/upload`
3. File disimpan di folder `public/uploads/` di server
4. URL yang tersimpan di database adalah `/uploads/nama-file.jpg` (path relatif)
5. Gambar otomatis tersedia di `http://domain-anda.com/uploads/nama-file.jpg`

### Migrasi dari localhost ke VPS:
```bash
# Cukup copy folder uploads ke VPS:
scp -r public/uploads/ user@vps-ip:/path/to/app/public/uploads/

# Atau gunakan rsync:
rsync -avz public/uploads/ user@vps-ip:/path/to/app/public/uploads/
```

---

## 🚀 Deploy ke VPS

### 1. Siapkan VPS (Ubuntu 20.04+)
```bash
# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 (process manager)
sudo npm install -g pm2
```

### 2. Upload project ke VPS
```bash
# Option A: via Git
git clone https://github.com/anda/sektor-antapani-pos.git
cd sektor-antapani-pos

# Option B: via SCP (langsung dari zip)
scp sektor-antapani-pos.zip user@vps-ip:~/
ssh user@vps-ip
unzip sektor-antapani-pos.zip
cd sektor-antapani-pos
```

### 3. Install & Build
```bash
npm install
npm run build
```

### 4. Jalankan dengan PM2
```bash
pm2 start npm --name "sektor-antapani" -- start
pm2 startup   # auto-start saat server reboot
pm2 save
```

### 5. Setup Nginx (reverse proxy)
```nginx
server {
    listen 80;
    server_name domain-anda.com www.domain-anda.com;

    # Upload size limit (sesuaikan dengan kebutuhan)
    client_max_body_size 10M;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Serve uploaded images directly (lebih cepat)
    location /uploads/ {
        alias /path/to/app/public/uploads/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

### 6. HTTPS dengan Certbot
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d domain-anda.com
```

---

## 📁 Struktur Project

```
sektor-antapani-pos/
├── app/
│   ├── api/
│   │   ├── upload/route.ts       → API upload gambar ke server
│   │   └── delete-image/route.ts → API hapus gambar lama
│   ├── login/          → Halaman login
│   ├── dashboard/      → Dashboard meja
│   ├── menu/           → Halaman pilih menu
│   ├── bayar/          → Halaman pembayaran
│   ├── riwayat/        → Riwayat transaksi
│   ├── laporan/        → Laporan keuangan (admin only)
│   └── admin/          → Admin panel
├── components/
│   ├── layout/AppShell → Header + auth guard
│   ├── ui/             → Modal, Toast, dll
│   └── pos/            → MenuCard, OrderPanel, Receipt
├── lib/
│   ├── data.ts         → Data awal (seed)
│   ├── utils.ts        → Helper functions
│   └── uploadImage.ts  → Client upload helper
├── public/
│   └── uploads/        → 📁 Folder gambar yang diupload
├── store/index.ts      → Zustand state management
└── types/index.ts      → TypeScript interfaces
```

---

## 👤 Akun Default

| Role | Username | Password | Akses |
|------|----------|----------|-------|
| 👑 Admin | `admin` | `admin123` | Semua + Laporan + Admin Panel |
| 💰 Cashier | `cashier1` | `cash123` | Dashboard, Pesan, Bayar, Riwayat |
| 🍽️ Waitress | `waitress1` | `wait123` | Dashboard & Pesan saja |

---

## ⚠️ Catatan Penting

### Data tersimpan di localStorage
Menu, meja, user, dan transaksi tersimpan di **localStorage browser** via Zustand persist.
- ✅ Data tetap ada setelah refresh
- ⚠️ Data per-browser (tidak sinkron antar perangkat)

Untuk produksi skala besar, ganti dengan database (PostgreSQL/MySQL) + API Routes.

### Gambar tersimpan di server
Foto menu disimpan di `public/uploads/` di server.
- ✅ Tersedia untuk semua perangkat
- ✅ Tidak hilang saat migrasi (cukup copy folder)

