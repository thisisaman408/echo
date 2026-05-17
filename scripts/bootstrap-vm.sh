#!/usr/bin/env bash
# Echo VM bootstrap. Run ONCE on a fresh Ubuntu 24.04 LTS Vultr VM (Tokyo).
# Installs Postgres 16 + pgvector, Node 22, pnpm, pm2, Caddy. Creates the
# echo database + user. Opens UFW for 22/80/443. Prints DATABASE_URL.
#
# Usage (on the VM, as root):
#   curl -fsSL https://raw.githubusercontent.com/thisisaman408/echo/main/scripts/bootstrap-vm.sh -o bootstrap-vm.sh
#   chmod +x bootstrap-vm.sh
#   ECHO_DOMAIN=echo.resyl.app ./bootstrap-vm.sh
#
# Re-running is safe (idempotent). The Postgres password is generated once
# and persisted at /root/.echo-db-password.

set -euo pipefail

# ───────────────────────────────────────────────────────────────────────
# Configuration
# ───────────────────────────────────────────────────────────────────────
ECHO_DOMAIN="${ECHO_DOMAIN:-echo.resyl.app}"
DB_NAME="echo"
DB_USER="echo"
DB_PASSWORD_FILE="/root/.echo-db-password"

if [ "$EUID" -ne 0 ]; then
  echo "Run as root (or via sudo)." >&2
  exit 1
fi

log() { printf "\n\033[1;36m==> %s\033[0m\n" "$*"; }

# ───────────────────────────────────────────────────────────────────────
# Generate / load DB password (idempotent)
# ───────────────────────────────────────────────────────────────────────
if [ ! -f "$DB_PASSWORD_FILE" ]; then
  log "Generating Postgres password (saved to $DB_PASSWORD_FILE)"
  openssl rand -hex 24 > "$DB_PASSWORD_FILE"
  chmod 600 "$DB_PASSWORD_FILE"
fi
DB_PASSWORD="$(cat "$DB_PASSWORD_FILE")"

# ───────────────────────────────────────────────────────────────────────
# System update + base packages
# ───────────────────────────────────────────────────────────────────────
log "Updating apt and installing base packages"
export DEBIAN_FRONTEND=noninteractive
apt-get update -y
apt-get upgrade -y
apt-get install -y \
  ca-certificates curl git build-essential ufw \
  debian-keyring debian-archive-keyring apt-transport-https \
  gnupg lsb-release

# ───────────────────────────────────────────────────────────────────────
# PostgreSQL 16 + pgvector (PGDG apt repo — most up-to-date pgvector)
# ───────────────────────────────────────────────────────────────────────
log "Adding PostgreSQL APT repository"
install -d /usr/share/postgresql-common/pgdg
curl -fsSL https://www.postgresql.org/media/keys/ACCC4CF8.asc \
  -o /usr/share/postgresql-common/pgdg/apt.postgresql.org.asc
echo "deb [signed-by=/usr/share/postgresql-common/pgdg/apt.postgresql.org.asc] https://apt.postgresql.org/pub/repos/apt $(lsb_release -cs)-pgdg main" \
  > /etc/apt/sources.list.d/pgdg.list

log "Installing PostgreSQL 16 + pgvector"
apt-get update -y
apt-get install -y postgresql-16 postgresql-16-pgvector

systemctl enable --now postgresql

# ───────────────────────────────────────────────────────────────────────
# Create echo database + user, enable pgvector extension (idempotent)
# ───────────────────────────────────────────────────────────────────────
log "Configuring Postgres role and database"
sudo -u postgres psql -v ON_ERROR_STOP=1 <<SQL
DO \$\$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = '${DB_USER}') THEN
    CREATE ROLE ${DB_USER} LOGIN PASSWORD '${DB_PASSWORD}';
  ELSE
    ALTER ROLE ${DB_USER} WITH PASSWORD '${DB_PASSWORD}';
  END IF;
END
\$\$;
SQL

if ! sudo -u postgres psql -tAc "SELECT 1 FROM pg_database WHERE datname = '${DB_NAME}'" | grep -q 1; then
  sudo -u postgres createdb -O "${DB_USER}" "${DB_NAME}"
fi

sudo -u postgres psql -d "${DB_NAME}" -v ON_ERROR_STOP=1 -c "CREATE EXTENSION IF NOT EXISTS vector;"

# ───────────────────────────────────────────────────────────────────────
# Node.js 22 (NodeSource) + pnpm + pm2
# ───────────────────────────────────────────────────────────────────────
if ! command -v node >/dev/null 2>&1 || [ "$(node -v | cut -c2- | cut -d. -f1)" -lt 22 ]; then
  log "Installing Node.js 22"
  curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
  apt-get install -y nodejs
else
  log "Node.js $(node -v) already installed, skipping"
fi

log "Installing pnpm + pm2 globally"
npm install -g pnpm@10 pm2

# ───────────────────────────────────────────────────────────────────────
# Caddy (auto-TLS reverse proxy)
# ───────────────────────────────────────────────────────────────────────
if ! command -v caddy >/dev/null 2>&1; then
  log "Installing Caddy"
  curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' \
    | gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
  curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' \
    > /etc/apt/sources.list.d/caddy-stable.list
  apt-get update -y
  apt-get install -y caddy
else
  log "Caddy already installed, skipping"
fi

log "Writing Caddyfile for ${ECHO_DOMAIN}"
cat > /etc/caddy/Caddyfile <<CADDY
${ECHO_DOMAIN} {
  reverse_proxy 127.0.0.1:3000
  encode zstd gzip
}
CADDY
systemctl reload caddy || systemctl restart caddy

# ───────────────────────────────────────────────────────────────────────
# UFW (firewall)
# ───────────────────────────────────────────────────────────────────────
log "Configuring UFW"
ufw allow 22/tcp || true
ufw allow 80/tcp || true
ufw allow 443/tcp || true
ufw --force enable

# ───────────────────────────────────────────────────────────────────────
# Output: the DATABASE_URL to paste into .env
# ───────────────────────────────────────────────────────────────────────
DATABASE_URL="postgresql://${DB_USER}:${DB_PASSWORD}@127.0.0.1:5432/${DB_NAME}?sslmode=disable"

log "Bootstrap complete"
cat <<INFO

────────────────────────────────────────────────────────────────────────
  Echo VM bootstrap done.
────────────────────────────────────────────────────────────────────────

  DATABASE_URL (paste this into apps/echo/.env):

  ${DATABASE_URL}

  The DB password is also stored at ${DB_PASSWORD_FILE} (root only).

  Next steps:
    1. Point DNS A record  ${ECHO_DOMAIN}  →  $(curl -fsSL https://ifconfig.io 2>/dev/null || echo "<this-vm-ip>")
    2. Clone the repo:
         git clone https://github.com/thisisaman408/echo.git ~/echo
    3. Create apps/echo/.env with the 20 required values (08-env.example)
    4. From your laptop, run:
         ECHO_VM=root@<this-vm-ip> ./scripts/deploy.sh

────────────────────────────────────────────────────────────────────────
INFO
