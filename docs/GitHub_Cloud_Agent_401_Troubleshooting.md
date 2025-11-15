# GitHub Cloud Agent 401 (Unauthorized) – Troubleshooting Guide

This guide helps resolve the error:

> Received invalid response 401 from cloud agent

The 401 indicates the agent backend rejected the request due to missing/expired credentials, insufficient org entitlement, or policy restrictions.

## Quick Checklist

1) Verify latest code is pushed
- Push your branch so the agent can access files and open a PR.

2) Sign in to GitHub in VS Code
- Accounts (Status Bar) → GitHub → Sign in
- Command Palette → "GitHub: Sign in"

3) Sign in to GitHub Copilot
- Command Palette → "Copilot: Sign in to GitHub"

4) Confirm entitlements (Copilot Enterprise)
- Org owner must assign you a Copilot Enterprise seat
- Check: https://github.com/settings/copilot → "Your Copilot" shows Enterprise or Business

5) Enable the Coding Agent in org policy
- Org Settings → Copilot → Policies/Features → Enable "GitHub Copilot coding agent"

6) Approve SSO for tokens (if applicable)
- If your org enforces SSO, approve the token for the org when prompted in the browser.

7) Ensure repository permissions
- Your user must have write access to create branches and PRs in this repo.

8) Network / Proxy
- Ensure VS Code can reach GitHub domains (api.github.com, api.githubcopilot.com, models.github.ai). Configure proxy in VS Code if required.

## Deep Dive Fix Steps

1. Refresh tokens
- Command Palette → "GitHub: Sign out" (all accounts)
- Command Palette → "Copilot: Sign out"
- Restart VS Code
- Command Palette → "GitHub: Sign in" (allow repo scope)
- Command Palette → "Copilot: Sign in to GitHub"

2. Verify auth
- Accounts (Status Bar) should show both GitHub and Copilot signed-in
- If you use CLI: `gh auth status` should show logged in with `repo` scope (optional)

3. Check org feature flags
- Org owner: Settings → Copilot → Features → Enable coding agent for the org/repo

4. Check repo protections
- Branch protection should allow the agent to push a new branch from your user

5. Retry delegation
- Open a file or issue with a clear task
- Use the Copilot command to delegate, or in this project ask the assistant to trigger delegation (requires org enablement)

## Validation

- A successful run will create a new branch and an open Pull Request by the Copilot Agent on your behalf.
- If failure persists, capture logs: VS Code → Output → "GitHub Copilot" and "GitHub" channels, and include timestamps.

## Notes

- The Copilot Coding Agent is available for Copilot Enterprise (and select configurations). If you are on personal Copilot, the agent feature may not be enabled.
- If your org uses SSO, the GitHub OAuth flow must be SSO-authorized for the org that hosts the repository.