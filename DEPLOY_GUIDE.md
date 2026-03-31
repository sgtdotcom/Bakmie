# 🚀 Panduan Deploy — Warung Bakmie Sektor Antapani

## Info Project
- **Folder lokal:** `D:\Personal\Project\bakmie`
- **GitHub:** `https://github.com/sgtdotcom/Bakmie`
- **VPS IP:** `129.226.195.6`
- **Tujuan:** setiap `git push` → website otomatis update

---

## Alur CI/CD

```
💻 Edit kode di D:\Personal\Project\bakmie
        ↓
git push ke github.com/sgtdotcom/Bakmie
        ↓
GitHub Actions otomatis berjalan
        ↓
SSH masuk ke VPS 129.226.195.6
        ↓
git pull + npm install + npm build + pm2 restart
        ↓
✅ http://129.226.195.6 langsung update!
```

---

## TAHAP 1 — Copy File Baru ke Project Lokal

Dari zip ini, copy file-file berikut ke `D:\Personal\Project\bakmie`:

```
D:\Personal\Project\bakmie\
├── .github\
│   └── workflows\
│       └── deploy.yml      ← BARU: CI/CD workflow
├── setup-vps.sh            ← BARU: script setup server
└── DEPLOY_GUIDE.md         ← BARU: panduan ini
```

Kemudian push ke GitHub dari PowerShell:

```powershell
cd D:\Personal\Project\bakmie
git add .
git commit -m "feat: tambah CI/CD auto deploy"
git push origin main
```

---

## TAHAP 2 — Setup VPS (lakukan sekali saja)

### 2.1 Login ke VPS
Buka PowerShell / Terminal, lalu:
```bash
ssh root@129.226.195.6
```

### 2.2 Jalankan script setup
```bash
# Download script dari GitHub Anda
wget https://raw.githubusercontent.com/sgtdotcom/Bakmie/main/setup-vps.sh

# Beri izin dan jalankan
chmod +x setup-vps.sh
bash setup-vps.sh
```

Script otomatis:
- Install Node.js 20, PM2, Nginx
- Clone `github.com/sgtdotcom/Bakmie` ke `/var/www/bakmie`
- Build dan start aplikasi
- Setup Nginx di port 80

Setelah selesai, coba buka: **http://129.226.195.6** — harusnya sudah muncul!

---

## TAHAP 3 — Buat SSH Key untuk GitHub Actions

### 3.1 Di terminal VPS, jalankan:
```bash
# Buat SSH key khusus deploy
ssh-keygen -t ed25519 -C "github-actions" -f ~/.ssh/deploy_key -N ""

# Daftarkan key ke VPS
cat ~/.ssh/deploy_key.pub >> ~/.ssh/authorized_keys

# Tampilkan PRIVATE key — COPY SEMUA
cat ~/.ssh/deploy_key
```

Copy seluruh output mulai dari `-----BEGIN` sampai `-----END`:
```
-----BEGIN OPENSSH PRIVATE KEY-----
b3BlbnNzaC1rZXktdjEAAAAA...
-----END OPENSSH PRIVATE KEY-----
```

### 3.2 Tambah Secrets di GitHub

Buka: **https://github.com/sgtdotcom/Bakmie/settings/secrets/actions**

Klik **"New repository secret"**, tambahkan 5 secrets ini:

| Name | Value |
|------|-------|
| `VPS_HOST` | `129.226.195.6` |
| `VPS_USER` | `root` |
| `VPS_SSH_KEY` | *(paste seluruh private key dari langkah 3.1)* |
| `VPS_PORT` | `22` |
| `VPS_APP_PATH` | `/var/www/bakmie` |

---

## TAHAP 4 — Test Deploy

```powershell
# Di D:\Personal\Project\bakmie
git add .
git commit -m "test: coba auto deploy"
git push origin main
```

Pantau di: **https://github.com/sgtdotcom/Bakmie/actions**

Tunggu ~2-3 menit → buka **http://129.226.195.6** ✅

---

## Setelah Setup: Cara Pakai Sehari-hari

```powershell
# 1. Edit kode di D:\Personal\Project\bakmie
# 2. Push ke GitHub:
cd D:\Personal\Project\bakmie
git add .
git commit -m "update: perubahan apa saja"
git push origin main
# 3. Tunggu ~2-3 menit → website otomatis update!
```

---

## Perintah Berguna di VPS

```bash
ssh root@129.226.195.6     # login VPS

pm2 status                 # cek status app
pm2 logs sektor-antapani   # lihat log
pm2 restart sektor-antapani # restart manual

# Update manual (tanpa GitHub Actions)
cd /var/www/bakmie && git pull && npm install && npm run build && pm2 restart sektor-antapani
```

---

## Troubleshooting

### ❌ Actions gagal "Permission denied (publickey)"
```bash
# Di VPS — perbaiki permission
chmod 700 ~/.ssh
chmod 600 ~/.ssh/authorized_keys
cat ~/.ssh/authorized_keys  # pastikan ada baris "github-actions"
```

### ❌ Build gagal "out of memory"
```bash
# Di VPS — tambah swap 2GB
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile && sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

### ❌ Website tidak muncul
```bash
pm2 status
pm2 logs sektor-antapani
sudo systemctl status nginx
```

### ❌ Gambar menu hilang setelah VPS baru
```powershell
# Dari PowerShell laptop — copy folder uploads ke VPS
scp -r D:\Personal\Project\bakmie\public\uploads\* root@129.226.195.6:/var/www/bakmie/public/uploads/
```
