# Sync System Setup

## Requirements
- Node.js and npm
- Global clasp: `npm i -g @google/clasp`
- Apps Script authentication: `clasp login`
- Set `CLASP_SCRIPT_ID` to your Apps Script project ID

## Initialize
1. From repo root: `pwsh scripts/sync/init-clasp.ps1`
2. Start watcher: `pwsh scripts/sync/watch-and-sync.ps1`
3. Ensure `origin` remote exists: `git remote add origin <url>`

## Environment Variables (optional)
- `CLASP_SCRIPT_ID`: Apps Script project ID
- `SYNC_BRANCH_PREFIX`: default `feature`
- `SYNC_PULL_INTERVAL_MS`: default `300000`
- `SYNC_BACKUP_DIR`: default `backups`
- `SYNC_LOG_DIR`: default `logs`
- `SYNC_LOG_FILE`: default `sync.log`
- `SYNC_NOTIFY`: `true` or `false`

