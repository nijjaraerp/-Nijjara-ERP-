# Nijjara ERP Hard-Coded Implementation Plan

This plan rebuilds Nijjara ERP without dynamic metadata. Every module, form, and view will now be authored directly in Apps Script files. The goal is to deliver a stable, minimal MVP fast, with clear milestones for progressive enhancement.

## Phase 0 – Baseline Project Setup (0.5 day)
- Recreate the Apps Script project structure with a single entry point (`Code.js`) and supporting server files (`Auth.js`, `HRM.js`, etc.).
- Configure `appsscript.json` for required scopes.
- Establish a simple logging helper using `Logger.log` initially (replace with sheet logging later if time allows).
- Define constants for sheet names, hard-coded column indices, and reusable utility functions (e.g., row lookup, validation helpers).

## Phase 1 – Core Shell & Navigation (1 day)
- **Frontend**: Build a static `App.html` with:
  - Hard-coded sidebar markup listing all modules and sub-tabs (e.g., HRM → Employees).
  - Content area placeholders for each tab with hidden sections toggled via JS.
  - Basic CSS embedded in the same file (or a dedicated `CSS.html`) to reduce dependencies.
- **Client JS** (`JS_Main.html`):
  - Manage tab switching, loading indicators, and toast notifications.
  - Hard-code column headers and table layouts for each view.
- **Server Entry (`Code.js`)**:
  - Implement `doGet` to return the full UI.
  - Provide helper `getEmployeesViewData_()` etc. that call into module scripts.

## Phase 2 – Authentication (1.5 days)
- **Server (`Auth.js`)**:
  - Hard-code credential check against `SYS_Users` sheet using direct column indexes.
  - Implement password hashing with salt (reuse existing logic, but inline configuration).
  - Return a simplified session token kept in `CacheService` or an in-memory map (for rapid delivery).
- **Client (Login section)**:
  - Build hard-coded login form in `App.html`.
  - Use `google.script.run` calls to `loginUser` and manage success/failure flows with inline JS.

## Phase 3 – HRM Module: Employees (2 days)
- **Server (`HRM.js`)**:
  - Implement CRUD functions with direct sheet writes using fixed column positions.
  - Add validation helpers (required fields, status enumeration).
  - All responses return structured objects expected by the hard-coded UI (no generic metadata).
- **Client**:
  - Build `renderEmployeesTable` and `openEmployeeForm` functions with hard-coded HTML templates.
  - Create dedicated modals for "Add" and "Edit" employees (either inline HTML or generated via template literals).
  - Wire buttons to server calls (`createEmployee`, `updateEmployee`, `deleteEmployee`).
- **Sheets**:
  - Ensure English headers are in row 1; optional Arabic headers may be manually maintained if still useful for display.

## Phase 4 – Additional HRM Features (2–3 days)
- Repeat Phase 3 pattern for Attendance, Leave Requests, Departments:
  - Each module gets its own server file (`HRM_Attendance.js`, etc.) or grouped functions inside `HRM.js`.
  - Client code includes dedicated sections and tables for each feature.
  - Implement confirmation dialogs for destructive actions.

## Phase 5 – SYS Administration (1.5 days)
- **Roles & Permissions**: Hard-code roles in `SYS_Roles` and surface read-only views.
- **User Management**: Build simple UI for creating/editing users with direct role assignment.
- **Logging**: Upgrade logging helper to append to `SYS_Error_Log` if time remains.

## Phase 6 – Polish & QA (1 day)
- Smoke test every tab; ensure navigation and CRUD flows succeed without metadata.
- Add minimal error boundaries (try/catch with user-friendly messages).
- Prepare deployment checklist: confirm triggers, share settings, version description.

## Delivery Notes
- Every tab is explicitly coded—no `SET_` sheets or metadata lookups.
- Forms are static HTML blocks maintained per module.
- Future enhancements can reintroduce dynamic behaviors once MVP stabilizes.
