# Nijjara ERP

A custom, serverless, web-based ERP platform built on Google Apps Script and Google Sheets.

## Prerequisites

- Node.js and npm installed
- Git installed
- Google account for Apps Script
- GitHub account (for version control)

## Initial Setup

### 1. Clone the Repository

```bash
git clone https://github.com/nijjaraerp/-Nijjara-ERP-.git
cd -Nijjara-ERP-
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Git Credentials (One-Time Setup)

To avoid authorization issues when pushing to GitHub, configure Git credential storage:

**Option A: Using Credential Helper (Recommended for local development)**
```bash
git config credential.helper store
```

After this, the first time you push, Git will ask for your credentials and then store them securely. You won't need to enter them again.

**Option B: Using SSH Keys (More Secure)**
1. Generate an SSH key if you don't have one:
   ```bash
   ssh-keygen -t ed25519 -C "your_email@example.com"
   ```
2. Add the SSH key to your GitHub account
3. Use SSH URL for the remote:
   ```bash
   git remote set-url origin git@github.com:nijjaraerp/-Nijjara-ERP-.git
   ```

**Option C: Using Personal Access Token**
1. Create a Personal Access Token (PAT) on GitHub (Settings → Developer settings → Personal access tokens)
2. When prompted for password, use the PAT instead
3. Optionally, store it using credential helper (Option A above)

### 4. Configure Google Apps Script (clasp)

```bash
# Login to Google Apps Script
npx clasp login

# If this is a new project, create the Apps Script project
npx clasp create --type standalone --title "Nijjara ERP"

# If joining an existing project, clasp pull will download the .clasp.json file
# (Make sure .clasp.json is not in .gitignore for team collaboration)
```

### 5. Verify Setup

```bash
npm run status
```

## Development Workflow

### Pull Latest Changes from Apps Script

```bash
npm run pull
```

### Push Code to Apps Script

```bash
npm run push
```

### Push Code to GitHub

```bash
npm run push:git
```

### Deploy to Both (Apps Script + GitHub)

```bash
npm run deploy
```

This command will:
1. Push your code to Google Apps Script
2. Push your code to GitHub

### Quick Save and Deploy

```bash
npm run save
```

This command will:
1. Stage all changes (`git add .`)
2. Commit with a "WIP" message
3. Deploy to both Apps Script and GitHub

## Project Structure

- **Code.js** - Main Apps Script code
- **Setup.js** - Database schema and setup
- **Seed_Data.js** - Initial data population
- **Seed_Functions.js** - Cell formula definitions
- **appsscript.json** - Apps Script configuration
- **package.json** - Node.js project configuration

## Troubleshooting

### Git Push Authorization Error

If you get "not authorized" when running `git push`:

1. Make sure your Git credentials are configured (see Option A, B, or C above)
2. Check your GitHub permissions for the repository
3. Verify your Git configuration:
   ```bash
   git config --list | grep credential
   ```

### Clasp Not Found

If clasp commands fail:

1. Make sure you've run `npm install`
2. Use `npx clasp` instead of `clasp` to run the locally installed version
3. Or install clasp globally: `npm install -g @google/clasp`

### Permission Denied (Apps Script)

1. Make sure you've run `npx clasp login`
2. Check that you have access to the Apps Script project
3. Verify the `.clasp.json` file contains the correct script ID

## Architecture

For detailed information about the system architecture, see [Project Overview.md](Project%20Overview.md).

## License

ISC
