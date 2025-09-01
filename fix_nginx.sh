#!/bin/bash
set -euo pipefail

BACKUP_DIR="/etc/nginx/backup-$(date +%Y%m%d-%H%M%S)"
mkdir -p "$BACKUP_DIR"

echo "[*] Backing up existing configs to $BACKUP_DIR..."
for f in /etc/nginx/sites-available/api.algodatta.com /etc/nginx/sites-available/www.algodatta.com /etc/nginx/sites-enabled/api.algodatta.com /etc/nginx/sites-enabled/www.algodatta.com; do
  if [ -f "$f" ] || [ -L "$f" ]; then
    sudo cp -a "$f" "$BACKUP_DIR/"
  fi
done

echo "[1/8] Writing clean api.algodatta.com config..."
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
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto https;
    }

    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection $connection_upgrade;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto https;
        proxy_read_timeout 300s;
        proxy_connect_timeout 60s;
    }
}
CONF

echo "[2/8] Writing clean www.algodatta.com config..."
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
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection $connection_upgrade;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto https;
    }

    location /login {
        proxy_pass http://127.0.0.1:3000/login;
    }
}
CONF

echo "[3/8] Enabling configs and cleaning up old ones..."
sudo ln -sf /etc/nginx/sites-available/api.algodatta.com /etc/nginx/sites-enabled/api.algodatta.com
sudo ln -sf /etc/nginx/sites-available/www.algodatta.com /etc/nginx/sites-enabled/www.algodatta.com
sudo rm -f /etc/nginx/sites-enabled/20-api-ssl.conf /etc/nginx/sites-enabled/20-api-ssl.conf.disabled || true

rollback_docker() {
  echo "[ROLLBACK] Restarting Docker backend/frontend with previous images..."
  docker compose stop backend frontend || true
  docker compose up -d backend frontend || true
}

rollback_nginx() {
  echo "[ROLLBACK] Restoring previous Nginx configs..."
  sudo cp -a "$BACKUP_DIR"/* /etc/nginx/sites-available/ || true
  sudo cp -a "$BACKUP_DIR"/* /etc/nginx/sites-enabled/ || true
  sudo nginx -t && sudo systemctl reload nginx
}

echo "[4/8] Restarting Docker backend + frontend (with build)..."
if ! docker compose up -d --build backend frontend; then
  rollback_docker
  rollback_nginx
  exit 1
fi

echo "[5/8] Testing and reloading Nginx..."
if sudo nginx -t; then
  sudo systemctl reload nginx
  echo "[OK] Nginx configs reloaded successfully (backup in $BACKUP_DIR)"
else
  rollback_nginx
  rollback_docker
  exit 1
fi

echo "[6/8] Running API health check..."
STATUS=$(curl -sk -o /tmp/healthz_output -w "%{http_code}" https://api.algodatta.com/healthz || true)
if [ "$STATUS" == "200" ]; then
  echo "[OK] API Health check passed: $(cat /tmp/healthz_output)"
else
  echo "[ERROR] API Health check failed with status $STATUS"
  cat /tmp/healthz_output
  rollback_docker
  rollback_nginx
  exit 1
fi

echo "[7/8] Running frontend login check..."
LOGIN_HEADERS=$(mktemp)
LOGIN_STATUS=$(curl -sk -o /dev/null -D "$LOGIN_HEADERS" -w "%{http_code}" https://www.algodatta.com/login || true)

if grep -qi "Location: https://ap-south-1xzrrrdj6d.auth.ap-south-1.amazoncognito.com" "$LOGIN_HEADERS"; then
  echo "[OK] Frontend login correctly redirects to Cognito Hosted UI"
else
  echo "[ERROR] Frontend login did not redirect to Cognito"
  echo "   HTTP status: $LOGIN_STATUS"
  echo "   Headers seen:"
  cat "$LOGIN_HEADERS"
  rollback_docker
  rollback_nginx
  exit 1
fi

echo "[8/8] All checks passed successfully!"
