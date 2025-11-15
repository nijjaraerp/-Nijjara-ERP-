# Customization Options

## Environment Variables
- `SYNC_BRANCH_PREFIX`: change branch naming prefix.
- `SYNC_PULL_INTERVAL_MS`: adjust auto-pull cadence.
- `SYNC_BACKUP_DIR`, `SYNC_LOG_DIR`, `SYNC_LOG_FILE`: relocate backups/logs.
- `SYNC_NOTIFY`: enable/disable GUI notifications.

## Script Parameters
- `scripts/sync/init-clasp.ps1` accepts `-ScriptId` and `-RootDir`.

## Ignored Paths
- `.claspignore` excludes logs, backups, `src/`, and `node_modules`. Modify as needed.

## Adding Validation
- Extend `Validate-AppManifest` or add linters before push.

