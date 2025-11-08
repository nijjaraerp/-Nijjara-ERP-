# Nijjara ERP - Quick Reference

## One-Time Setup

```bash
# 1. Install dependencies
npm install

# 2. Run the automated setup
./setup.sh

# OR use the npm setup script
npm run setup

# 3. Configure Git credentials (choose ONE option)

# Option A: Store credentials (simple)
git config credential.helper store

# Option B: Cache for 1 hour
git config credential.helper 'cache --timeout=3600'

# Option C: Use SSH (most secure)
ssh-keygen -t ed25519 -C "your@email.com"
# Then add to GitHub and change remote URL:
git remote set-url origin git@github.com:nijjaraerp/-Nijjara-ERP-.git

# 4. Login to Google Apps Script
npx clasp login

# 5. Link to Apps Script project (if not already)
# For NEW project:
npx clasp create --type standalone --title "Nijjara ERP"
# For EXISTING project: make sure .clasp.json exists with script ID
```

## Daily Development Commands

```bash
# Check status (Git + clasp)
npm run status

# Pull latest from Apps Script
npm run pull

# Push to Apps Script only
npm run push

# Push to GitHub only
npm run push:git

# Deploy to BOTH Apps Script AND GitHub
npm run deploy

# Quick save: stage all, commit as WIP, and deploy
npm run save
```

## Common Workflows

### Making Changes to Code

```bash
# 1. Edit files (Code.js, Setup.js, etc.)
# 2. Check what changed
npm run status

# 3. Deploy everywhere
npm run deploy
```

### Quick Save Work in Progress

```bash
# Stages, commits, and deploys in one command
npm run save
```

### Sync with Remote Apps Script

```bash
# Pull changes made in Apps Script editor
npm run pull

# Push local changes to Apps Script
npm run push
```

## Troubleshooting

### "git push: not authorized"
- Make sure you configured Git credentials (see One-Time Setup #3)
- Check: `git config credential.helper`
- If using PAT, make sure it has repo permissions

### "clasp: command not found"
- Make sure you ran `npm install`
- Use `npx clasp` instead of `clasp`

### "clasp: not logged in"
- Run: `npx clasp login`
- Follow browser authentication flow

### Changes not showing in Apps Script
- Make sure you're running `npm run push`
- Check that .clasp.json points to correct script ID
- Verify clasp is logged in: `npx clasp status`

## Files Not to Commit

These are already in .gitignore:
- `.clasp.json` (contains your script ID, different per developer)
- `.clasp.token.json` (your auth token)
- `node_modules/` (npm dependencies)
- `credentials.json` (Google Cloud credentials)

## Getting Help

- See `README.md` for detailed documentation
- Check `Project Overview.md` for architecture details
- Run `./setup.sh` for guided setup
