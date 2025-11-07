# Nijjara ERP - Copilot Instructions

## 1. Core Architecture & Philosophy

This is a serverless ERP system built entirely on the Google Workspace platform.

- **Backend**: Google Apps Script (`.js` files).
- **Database**: Google Sheets. Each sheet is a table.
- **Frontend**: A Single-Page Application (`App.html`) that is dynamically built at runtime.

The core principle is a **Metadata-Driven UI**. The frontend is not static; it is rendered based on configuration defined in the `SET_` sheets (e.g., `SET_Tab_Register`, `SET_Dynamic_Forms`).

**Key File**: `Project Overview.md` contains the full architectural details.

## 2. The Bilingual Column Model (CRITICAL CONCEPT)

This is the most important rule for database interaction. In any data sheet (e.g., `PRJ_Clients`), there are two types of columns:

1.  **Engine-Facing (English Headers)**:
    -   **Headers**: Strict, programmatic English (e.g., `client_id`, `contact_name`).
    -   **Purpose**: Data integrity and backend logic.
    -   **Rule**: The backend **ONLY** reads from and writes to these columns.

2.  **User-Facing (Arabic Headers)**:
    -   **Headers**: User-friendly Arabic.
    -   **Purpose**: UI display.
    -   **Rule**: The frontend **ONLY** reads from these columns. These columns are typically populated by `ARRAYFORMULA`s that reference their English counterparts.

## 3. Database Interaction: NO MANUAL EDITS

**Never edit the Google Sheet database directly.** All interactions are programmatic and controlled by three key files:

-   `Setup.js`: The single source of truth for the database **schema**. To add or modify a column or sheet, you MUST edit the `ERP_SCHEMA` object in this file and run `runInitialSetup()`.
-   `Seed_Data.js`: The source for all initial database **data**. Use this to populate `SET_` sheets.
-   `Seed_Functions.js`: The source for all spreadsheet **formulas**. This is used to link the User-Facing (Arabic) columns to the Engine-Facing (English) columns.

## 4. Development Workflow & Deployment

This project uses `clasp` to manage Google Apps Script files. The workflow is defined in `package.json`:

-   `npm run pull`: Pulls the latest code from the Google Apps Script project to your local files.
-   `npm run push`: Pushes your local changes to the Google Apps Script project.
-   `npm run deploy`: Pushes to Apps Script, then pushes the code to the `origin main` GitHub branch.
-   `npm run save`: A quick-save command. It adds all files, commits with "WIP", and runs the `deploy` script.

**Always use these scripts to keep your local, Apps Script, and GitHub repositories in sync.**

## 5. Logging

All server-side code **must** use the centralized logging functions from `Logging.js`.

-   `logInfo(functionName, message)`: For general application flow events.
-   `logError(functionName, message, errorObject)`: For handled exceptions and errors.

Logs are written to the `SYS_Error_Log` sheet. This is critical for debugging.
