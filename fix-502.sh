#!/bin/bash
# ============================================================
# FIX 502 BAD GATEWAY — Sektor Antapani POS
# Jalankan di VPS: bash fix-502.sh
# ============================================================

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

log()  { echo -e "${GREEN}[FIX]${NC} $1"; }
warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
err()  { echo -e "${RED}[ERROR]${NC} $1"; }

APP_DIR="/var/www/bakmie"
APP_NAME="sektor-antapani"
APP_PORT=3000

echo ""
echo "====================================="
echo "  Diagnosa 502 Bad Gateway"
echo "====================================="
echo ""

# 1. Cek apakah PM2 running
log "1. Cek status PM2..."
if pm2 list | grep -q "$APP_NAME"; then
  STATUS=$(pm2 list | grep "$APP_NAME" | awk '{print $18}')
  echo "   PM2 process: $APP_NAME — status: $STATUS"
  if [ "$STATUS" != "online" ]; then
    warn "   App tidak online! Coba restart..."
    pm2 restart $APP_NAME
    sleep 3
  fi
else
  err "   App '$APP_NAME' tidak ditemukan di PM2!"
  log "   Mencoba start ulang..."
  cd $APP_DIR
  pm2 start npm --name "$APP_NAME" -- start
  sleep 3
fi

# 2. Cek apakah port 3000 listening
log "2. Cek port $APP_PORT..."
if ss -tlnp | grep -q ":$APP_PORT"; then
  echo "   ✅ Port $APP_PORT aktif"
else
  err "   ❌ Port $APP_PORT tidak aktif — app belum jalan"
  log "   Cek log PM2:"
  pm2 logs $APP_NAME --lines 20 --nostream
fi

# 3. Cek Nginx config
log "3. Cek Nginx..."
if sudo nginx -t 2>/dev/null; then
  echo "   ✅ Nginx config OK"
else
  err "   ❌ Nginx config error!"
  sudo nginx -t
fi

# 4. Cek apakah .next folder ada (sudah di-build?)
log "4. Cek build Next.js..."
if [ -d "$APP_DIR/.next" ]; then
  echo "   ✅ Folder .next ada"
else
  err "   ❌ Folder .next tidak ada — belum pernah di-build!"
  log "   Menjalankan npm run build..."
  cd $APP_DIR
  npm install
  npm run build
fi

# 5. Pastikan Nginx punya proxy config yang benar
log "5. Periksa konfigurasi Nginx..."
NGINX_CONF="/etc/nginx/sites-available/bakmie"

if [ ! -f "$NGINX_CONF" ]; then
  warn "   Config Nginx belum ada, membuat ulang..."
  sudo tee $NGINX_CONF > /dev/null <<EOF
server {
    listen 80;
    server_name _;

    client_max_body_size 10M;

    location / {
        proxy_pass http://localhost:$APP_PORT;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        proxy_read_timeout 60s;
    }

    location /uploads/ {
        alias $APP_DIR/public/uploads/;
        expires 1y;
        add_header Cache-Control "public, immutable";
        try_files \$uri =404;
    }
}
EOF
  sudo ln -sf $NGINX_CONF /etc/nginx/sites-enabled/
  sudo rm -f /etc/nginx/sites-enabled/default
fi

# 6. Restart semua
log "6. Restart PM2 + Nginx..."
cd $APP_DIR
pm2 restart $APP_NAME || pm2 start npm --name "$APP_NAME" -- start
pm2 save
sudo nginx -t && sudo systemctl reload nginx

# 7. Final check
sleep 2
echo ""
echo "====================================="
echo "  Hasil Akhir"
echo "====================================="
log "PM2 status:"
pm2 list | grep $APP_NAME

log "Test koneksi lokal:"
if curl -s -o /dev/null -w "%{http_code}" http://localhost:$APP_PORT | grep -q "200\|301\|302"; then
  echo "   ✅ App merespons di localhost:$APP_PORT"
else
  echo "   ⚠️  App belum merespons, cek log:"
  pm2 logs $APP_NAME --lines 30 --nostream
fi

echo ""
log "Selesai! Coba buka http://129.226.195.6 di browser."
echo ""
echo "Jika masih error, jalankan: pm2 logs $APP_NAME"
