#!/usr/bin/env bash
# Re-deploy ECHO to the Vultr VM. Assumes:
#   - $ECHO_VM is set to root@<ip> (or your user@<ip>)
#   - the VM already has the initial clone, .env, and pm2 setup per SETUP_REQUIRED.md
# Usage: ECHO_VM=root@1.2.3.4 ./scripts/deploy.sh
set -euo pipefail

if [ -z "${ECHO_VM:-}" ]; then
  echo "ECHO_VM env var not set. e.g. ECHO_VM=root@1.2.3.4 ./scripts/deploy.sh"
  exit 1
fi

ssh "$ECHO_VM" bash -lc "'
  set -euo pipefail
  cd ~/echo
  git fetch --all
  git reset --hard origin/main
  pnpm install --frozen-lockfile
  cd apps/echo
  pnpm db:migrate
  pnpm build
  pm2 restart echo || pm2 start \"pnpm start\" --name echo
  pm2 save
  echo \"Deploy done — \$(date -u +%FT%TZ)\"
'"
