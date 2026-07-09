#!/usr/bin/env bash
set -Eeuo pipefail

APP_DIR="${APP_DIR:-$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)}"
SERVICE_NAME="${SERVICE_NAME:-iris-economy-bot}"
BACKUP_ROOT="${BACKUP_ROOT:-$APP_DIR/data/backups}"
BACKUP_RETENTION_DAYS="${BACKUP_RETENTION_DAYS:-30}"
REF="${DEPLOY_REF:-origin/main}"
SKIP_FETCH="${SKIP_FETCH:-0}"
SKIP_RESTART="${SKIP_RESTART:-0}"

cd "$APP_DIR"

ts() {
  date +%Y%m%d-%H%M%S
}

log() {
  printf '[deploy-safe] %s\n' "$*"
}

on_error() {
  local line="$1"
  log "FAILED at line $line. Service was not restarted after this failure."
}
trap 'on_error $LINENO' ERR

backup_data() {
  local stamp backup_dir count
  stamp="$(ts)"
  backup_dir="$BACKUP_ROOT/$stamp"
  mkdir -p "$backup_dir"

  count=0
  if [ -d "$APP_DIR/data" ]; then
    while IFS= read -r -d '' file; do
      cp -a "$file" "$backup_dir/"
      count=$((count + 1))
    done < <(find "$APP_DIR/data" -maxdepth 1 -type f \( -name '*.json' -o -name '*.db' -o -name '*.sqlite' \) -print0)
  fi

  if [ "$count" -eq 0 ]; then
    log "backup: no data files found under $APP_DIR/data"
  else
    log "backup: copied $count data file(s) to $backup_dir"
  fi
}

prune_old_backups() {
  if [ ! -d "$BACKUP_ROOT" ]; then
    log "backup prune: backup root does not exist; skipped"
    return
  fi

  if ! [[ "$BACKUP_RETENTION_DAYS" =~ ^[0-9]+$ ]]; then
    log "backup prune: invalid BACKUP_RETENTION_DAYS=$BACKUP_RETENTION_DAYS; skipped"
    return
  fi

  if [ "$BACKUP_RETENTION_DAYS" -eq 0 ]; then
    log "backup prune: BACKUP_RETENTION_DAYS=0; skipped"
    return
  fi

  local count
  count=0
  while IFS= read -r -d '' dir; do
    rm -rf "$dir"
    count=$((count + 1))
  done < <(find "$BACKUP_ROOT" -mindepth 1 -maxdepth 1 -type d -name '20??????-??????' -mtime +"$BACKUP_RETENTION_DAYS" -print0)

  log "backup prune: removed $count backup dir(s) older than $BACKUP_RETENTION_DAYS day(s)"
}

log "app: $APP_DIR"
log "service: $SERVICE_NAME"
log "ref: $REF"
log "backup retention: $BACKUP_RETENTION_DAYS day(s)"

if [ "$SKIP_FETCH" != "1" ]; then
  log "fetch/reset"
  git fetch origin
  git reset --hard "$REF"
fi

log "backup before install/patch"
backup_data
prune_old_backups

log "install production dependencies"
npm install --omit=dev

log "audit production dependencies"
npm audit --omit=dev

log "apply yado patch"
npm run patch:yado

log "syntax check"
npm run check

log "smoke test"
npm run smoke

if [ "$SKIP_RESTART" = "1" ]; then
  log "SKIP_RESTART=1; service restart skipped"
  exit 0
fi

log "restart service"
systemctl restart "$SERVICE_NAME"

log "service status"
systemctl is-active "$SERVICE_NAME"

log "done"
