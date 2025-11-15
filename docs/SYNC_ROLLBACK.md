# Rollback Procedures

## Restore From Backup
1. Identify backup folder under `backups/YYYYMMDD-HHMMSS/`.
2. Copy files back to `main/`.
3. Push to Apps Script: `clasp push --force`.
4. Create a rollback branch: `git checkout -b rollback/<timestamp>` and commit.

## Revert Git Branch
- Checkout previous branch and revert commit: `git revert <commit>` or `git reset --hard <commit>`.
- Push correction: `git push --force`.

## Re-sync Remote
- Run `clasp pull` to align local with Apps Script if divergence occurred.

