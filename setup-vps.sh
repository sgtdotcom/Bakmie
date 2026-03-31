#!/bin/bash
# ============================================================
# SETUP VPS OTOMATIS untuk Sektor Antapani POS
# Jalankan SEKALI saja di VPS baru
# Usage: bash setup-vps.sh
# ============================================================

set -e  # stop jika ada error
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

log() { echo -e "${GREEN}[SETUP]${NC} $1"; }
warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
err() { echo -e "${RED}[ERROR]${NC} $1"; exit 1; }

# ── KONFIGURASI ── (edit sesuai kebutuhan)
GITHUB_REPO="https://github.com/sgtdotcom/Bakmie.git"
APP_DIR="/var/www/bakmie"
APP_PORT=3000
DOMAIN=""   # kosongkan jika pakai IP langsung
NODE_VERSION=20

# ═══════════════════════════════════════════════════════════
log "1/8 Update system..."
sudo apt-get update -qq && sudo apt-get upgrade -y -qq

# ═══════════════════════════════════════════════════════════
log "2/8 Install Node.js $NODE_VERSION..."
if ! command -v node &>/dev/null; then
  curl -fsSL https://deb.nodesource.com/setup_${NODE_VERSION}.x | sudo -E bash -
  sudo apt-get install -y nodejs
fi
log "Node.js $(node --version) terinstall"

# ═══════════════════════════════════════════════════════════
log "3/8 Install PM2 (process manager)..."
sudo npm install -g pm2 --quiet
log "PM2 $(pm2 --version) terinstall"

# ═══════════════════════════════════════════════════════════
log "4/8 Install Nginx..."
sudo apt-get install -y nginx
sudo systemctl enable nginx
sudo systemctl start nginx
log "Nginx terinstall"

# ═══════════════════════════════════════════════════════════
log "5/8 Clone repository dari GitHub..."
sudo mkdir -p $APP_DIR
sudo chown $USER:$USER $APP_DIR

if [ -d "$APP_DIR/.git" ]; then
  warn "Folder sudah ada, skip clone — jalankan git pull manual"
else
  git clone $GITHUB_REPO $APP_DIR
fi

cd $APP_DIR

# ═══════════════════════════════════════════════════════════
log "6/8 Install dependencies dan build..."
npm install
npm run build

# Buat folder uploads kalau belum ada
mkdir -p public/uploads

# ═══════════════════════════════════════════════════════════
log "7/8 Start aplikasi dengan PM2..."
pm2 delete sektor-antapani 2>/dev/null || true
pm2 start npm --name "sektor-antapani" -- start
pm2 save
pm2 startup | tail -1 | sudo bash   # auto-start saat reboot

# ═══════════════════════════════════════════════════════════
log "8/8 Setup Nginx reverse proxy..."

NGINX_CONF="/etc/nginx/sites-available/sektor-antapani"

if [ -n "$DOMAIN" ]; then
  SERVER_NAME="$DOMAIN www.$DOMAIN"
else
  SERVER_NAME="_"  # catch-all (pakai IP langsung)
fi

sudo tee $NGINX_CONF > /dev/null <<EOF
server {
    listen 80;
    server_name $SERVER_NAME;

    # Upload size limit (5MB sesuai API)
    client_max_body_size 10M;

    # Proxy ke Next.js
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

    # Serve gambar upload langsung via Nginx (lebih cepat)
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
sudo nginx -t && sudo systemctl reload nginx

# ═══════════════════════════════════════════════════════════
echo ""
echo -e "${GREEN}════════════════════════════════════════${NC}"
echo -e "${GREEN}✅ SETUP SELESAI!${NC}"
echo -e "${GREEN}════════════════════════════════════════${NC}"
echo ""
echo "Aplikasi berjalan di:"
if [ -n "$DOMAIN" ]; then
  echo "  🌐 http://$DOMAIN"
else
  echo "  🌐 http://129.226.195.6"
fi
echo "  🔧 Port internal: $APP_PORT"
echo "  📁 Folder: $APP_DIR"
echo ""
echo "Perintah berguna:"
echo "  pm2 status              → cek status aplikasi"
echo "  pm2 logs sektor-antapani → lihat log"
echo "  pm2 restart sektor-antapani → restart manual"
echo ""
echo -e "${YELLOW}LANGKAH SELANJUTNYA:${NC}"
echo "1. Setup SSH key untuk GitHub Actions (lihat DEPLOY_GUIDE.md)"
echo "2. Tambahkan GitHub Secrets di repository"
echo "3. Push kode → deploy otomatis!"
