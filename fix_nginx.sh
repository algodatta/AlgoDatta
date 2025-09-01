#!/bin/bash
set -euo pipefail

LOG_FILE="/var/log/fix_nginx.log"
BACKUP_DIR="/etc/nginx/backup-$(date +%Y%m%d-%H%M%S)"

log() {
  echo "[$(date '+%F %T')] $*" | sudo tee -a "$LOG_FILE"
}

trap 'log "[ERROR] Script failed on line $LINENO. Rolling back..."; rollback_nginx; rollback_docker; exit 1' ERR

rollback_docker() {
  log "[ROLLBACK] Restarting Docker backend/frontend..."
  sudo docker compose stop backend frontend || true
  sudo docker compose up -d backend frontend || true
}

rollback_nginx() {
  log "[ROLLBACK] Restoring previous Nginx configs..."
  sudo cp -a "$BACKUP_DIR"/* /etc/nginx/sites-available/ || true
  sudo cp -a "$BACKUP_DIR"/* /etc/nginx/sites-enabled/ || true
  sudo nginx -t && sudo systemctl reload nginx || true
}

log "==== Starting fix_nginx.sh ===="

sudo mkdir -p "$BACKUP_DIR"

log "[*] Backing up existing configs to $BACKUP_DIR..."
for f in /etc/nginx/sites-available/api.algodatta.com \
         /etc/nginx/sites-available/www.algodatta.com \
         /etc/nginx/sites-enabled/api.algodatta.com \
         /etc/nginx/sites-enabled/www.algodatta.com \
         /etc/nginx/sites-enabled/20-api-ssl.conf*; do
  if [ -f "$f" ] || [ -L "$f" ]; then
    sudo cp -a "$f" "$BACKUP_DIR/" || true
  fi
done

log "[*] Cleaning old/conflicting configs..."
sudo rm -f /etc/nginx/sites-enabled/20-api-ssl.conf /etc/nginx/sites-enabled/20-api-ssl.conf.disabled || true
find /etc/nginx/sites-enabled -xtype l -exec sudo rm -f {} \;

log "[1/8] Writing clean api.algodatta.com config..."
sudo tee /etc/nginx/sites-available/api.algodatta.com > /dev/null <<'CONF'
server {
    listen 80;
    server_name api.algodatta.com;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name api.algodatta.com;

    ssl_certificate     /etc/letsencrypt/live/api.algodatta.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.algodatta.com/privkey.pem;

    location = /healthz {
        proxy_pass http://127.0.0.1:8000/api/healthz;
    }

    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection $connection_upgrade;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto https;
    }
}
CONF

log "[2/8] Writing clean www.algodatta.com config..."
sudo tee /etc/nginx/sites-available/www.algodatta.com > /dev/null <<'CONF'
server {
    listen 80;
    server_name algodatta.com www.algodatta.com;
    return 301 https://www.algodatta.com$request_uri;
}

server {
    listen 443 ssl http2;
    server_name algodatta.com www.algodatta.com;

    ssl_certificate     /etc/letsencrypt/live/algodatta.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/algodatta.com/privkey.pem;

    location / {
        proxy_pass http://127.0.0.1:3000;
    }

    location /login {
        proxy_pass http://127.0.0.1:3000/login;
    }
}
CONF

log "[3/8] Enabling configs..."
sudo ln -sf /etc/nginx/sites-available/api.algodatta.com /etc/nginx/sites-enabled/api.algodatta.com
sudo ln -sf /etc/nginx/sites-available/www.algodatta.com /etc/nginx/sites-enabled/www.algodatta.com

log "[4/8] Restarting Docker backend + frontend..."
sudo docker compose up -d --build backend frontend

log "[5/8] Testing Nginx config (dry run)..."
if sudo nginx -t; then
  log "[OK] Nginx configs are valid"
  log "[*] Reloading Nginx..."
  sudo systemctl reload nginx
else
  log "[ERROR] Invalid Nginx config, rolling back"
  rollback_nginx
  rollback_docker
  exit 1
fi

log "[6/8] Running API health check..."
STATUS=$(curl -sk -o /tmp/healthz_output -w "%{http_code}" https://api.algodatta.com/healthz || true)
log "API Health: $STATUS"
cat /tmp/healthz_output || true

log "[7/8] Running frontend login check..."
LOGIN_HEADERS=$(mktemp)
curl -sk -o /dev/null -D "$LOGIN_HEADERS" -w "%{http_code}" https://www.algodatta.com/login || true
cat "$LOGIN_HEADERS"

log "[8/8] Finished successfully!"
