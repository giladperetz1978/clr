#!/usr/bin/env bash
set -Eeuo pipefail

DOMAIN='caloritrack.144.91.96.77.sslip.io'
APP_ROOT='/var/www/caloritrack'
SITE='/etc/nginx/sites-available/caloritrack'

if [[ "${EUID}" -ne 0 ]]; then
  echo 'Run this setup script as root.' >&2
  exit 1
fi
if [[ ! -f "${APP_ROOT}/current/index.html" ]]; then
  echo "Upload a release to ${APP_ROOT}/current before installing the site." >&2
  exit 1
fi

apt-get update
DEBIAN_FRONTEND=noninteractive apt-get install -y nginx certbot python3-certbot-nginx

if ! id caloritrack >/dev/null 2>&1; then
  useradd --system --home-dir /var/lib/caloritrack --shell /usr/sbin/nologin caloritrack
fi
install -d -o caloritrack -g caloritrack -m 0700 /var/lib/caloritrack
install -d -o root -g root -m 0700 /etc/credstore.encrypted
systemd-creds setup
if [[ ! -e /etc/credstore.encrypted/caloritrack-backup-encryption-key ]]; then
  openssl rand -hex 32 |
    systemd-creds encrypt --with-key=host --name=backup-encryption-key - \
      /etc/credstore.encrypted/caloritrack-backup-encryption-key
  chown root:root /etc/credstore.encrypted/caloritrack-backup-encryption-key
  chmod 0600 /etc/credstore.encrypted/caloritrack-backup-encryption-key
fi

install -o root -g root -m 0644 ops/caloritrack.service /etc/systemd/system/caloritrack.service
install -o root -g root -m 0750 ops/set-gemini-key.sh /usr/local/sbin/caloritrack-set-gemini-key
systemctl daemon-reload

cat >"${SITE}" <<'NGINX_HTTP'
server {
    listen 80;
    listen [::]:80;
    server_name caloritrack.144.91.96.77.sslip.io;
    root /var/www/caloritrack/current;
    index index.html;
    client_max_body_size 5m;

    location /api/ {
        proxy_pass http://127.0.0.1:38741;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 70s;
    }

    location / {
        try_files $uri $uri/ =404;
    }
}
NGINX_HTTP

ln -sfn "${SITE}" /etc/nginx/sites-enabled/caloritrack
nginx -t
systemctl reload nginx
certbot certonly --nginx --non-interactive --agree-tos --register-unsafely-without-email \
  --no-eff-email --cert-name caloritrack -d "${DOMAIN}"

cat >"${SITE}" <<'NGINX_TLS'
server {
    listen 80;
    listen [::]:80;
    server_name caloritrack.144.91.96.77.sslip.io;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name caloritrack.144.91.96.77.sslip.io;
    root /var/www/caloritrack/current;
    index index.html;
    client_max_body_size 5m;

    ssl_certificate /etc/letsencrypt/live/caloritrack/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/caloritrack/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_session_timeout 1d;
    ssl_session_cache shared:CaloriTrackTLS:10m;
    ssl_session_tickets off;

    add_header Strict-Transport-Security "max-age=31536000" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-Frame-Options "DENY" always;
    add_header Referrer-Policy "no-referrer" always;
    add_header Permissions-Policy "camera=(), microphone=(self), geolocation=()" always;
    add_header Content-Security-Policy "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com data:; img-src 'self' data:; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'; object-src 'none'" always;

    location /api/ {
        proxy_pass http://127.0.0.1:38741;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 70s;
    }

    location = /index.html {
        expires -1;
        try_files $uri =404;
    }

    location = /sw.js {
        expires -1;
        try_files $uri =404;
    }

    location ~ /\.(?!well-known) {
        deny all;
    }

    location ~* \.(?:sqlite|db|pem|key|sh)$ {
        deny all;
    }

    location / {
        try_files $uri $uri/ =404;
    }
}
NGINX_TLS

nginx -t
systemctl reload nginx
systemctl enable caloritrack.service
echo 'TLS and the CaloriTrack service unit are installed. The service intentionally awaits the Gemini credential.'
