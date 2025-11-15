# Troubleshooting

## Network Issues
- Verify connectivity: `Test-Connection 8.8.8.8 -Count 1`
- Restart watcher after restoring network.

## Authentication Failures
- Re-login: `clasp login`
- Recreate `.clasp.json`: `pwsh scripts/sync/init-clasp.ps1`

## Git Conflicts
- Branches are timestamped and force-pushed. If remote exists, fetch and inspect: `git fetch --all`
- Adjust remote or remove conflicting branch.

## Apps Script Quotas
- If push errors mention quota, wait and retry; watcher logs the failure.

## Missing Remote
- Add remote: `git remote add origin <url>` and rerun watcher.

## Logs
- See `logs/sync.log` for all events and errors.

