┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃ 📘 DOCUMENT 3 — Nine-Day Action Plan (Static ERP)   ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

> This is a strictly static implementation plan.  
> No dynamic UI builders. Every form/view is coded explicitly.  
> All actions produce **loud logs**:
> - Server: Apps Script Logger + `SYS_Audit_Log`
> - Client: Console + Toast messages

---

## 🧭 LEGEND

| Symbol | Meaning                   |
| ------ | ------------------------- |
| [ ]    | To-do                     |
| [~]    | In-progress               |
| [x]    | Done                      |
| ⇢      | Flow                      |
| →      | Next step                 |
| ⛔      | Blocker                   |
| ┌─┐    | Box / Visual grouping     |
| └─┘    | Section end               |
| ║      | Pipe / Vertical separator |
| ──     | Line / Sequence           |
| ◉      | Node / Event              |
| ★      | Milestone                 |

---

## 🔊 LOUD DEBUGGING STANDARD

### 🔧 Server Logging

```js
logInfo_(actor, action, entity, id, details)
logError_(actor, action, entity, id, message, stack)
→ Writes to: Logger, SYS_Audit_Log (when appropriate)

Example:

pgsql
Copy code
[SERVER][INFO] 2025-11-09 12:11 actor=mkh action=Create entity=PRJ_Main id=PRJ-001 details='insert row 18'
[SERVER][ERROR] 2025-11-09 12:12 actor=mkh action=Create entity=PRJ_Main id=PRJ-001 message='validation failed'
💻 Client Logging
js
Copy code
DBG.log(level, scope, msg, data)
→ Mirrors to browser console
→ WARN and ERROR also show toast

Example:

csharp
Copy code
[CLIENT][REQ]  Create→PRJ_Main payload:{...}
[CLIENT][OK ]  Create→PRJ_Main row=18
[CLIENT][ERR]  Create→PRJ_Main 400 'Budget < 0'
📂 POLICY SHEETS (STATIC 3-COLUMN MODEL)
Sheets:

Policy_Penalties

Policy_Overtime

Policy_Salary

Policy_Deductions

Fixed Columns:

Column	Description
A	Policy_ID (e.g., PEN-LATE-001)
B	Description ("Late 15 minutes")
C	Numeric_Value (e.g., 50)

Linking:
HRM event → stores Policy_ID → Server applies Numeric_Value as needed
(e.g. overtime pay, salary calc, penalties, etc.)

🗺️ NINE-DAY HIGH-LEVEL MAP
pgsql
Copy code
Day1 ──┬─ Setup/Scaffold ★
      └→ Loud Logging Core
Day2 ──┬─ Schema Build (static) ★
      └→ Freeze/Protect/Validate
Day3 ──┬─ Auth Backend + Sessions
      └→ Login UI + Loud logs
Day4 ──┬─ SYS (Users/Roles/Perms) CRUD
      └→ Documents stub
Day5 ──┬─ HRM (Employees/Attendance/Leave) CRUD
      └→ Policy sheets wiring
Day6 ──┬─ PRJ (Main/Clients/Tasks/Material) CRUD
      └→ Simple PvA read view
Day7 ──┬─ FIN (Direct/Indirect/Rev) CRUD
      └→ Custody/Payroll skeleton
Day8 ──┬─ Hardening & E2E smoke
      └→ Access control checks
Day9 ──┬─ UAT scripts, fix & ship ★
      └→ Backup + Tag + Handover
📅 DETAILED 9-DAY PLAN
🟦 DAY 1 — PROJECT BOOTSTRAP ★
✅ Tasks
 D1.T1 Create Apps Script project + repo structure

 D1.T2 Add Logging.js (logInfo_, logError_) + Audit writer

 D1.T3 Add DBG.js (toaster + console mirror)

 D1.T4 Setup Setup.js (sheet creator, 2-row headers, freeze + protect)

 D1.T5 Wire Admin Menu (Run Setup, Open Logs)

⚙️ Subtasks
Clone repo; create Code.js, Setup.js, Logging.js, DBG.js

Inject menu entries in onOpen()

Wrap menu actions with try/catch → log both sides

🧪 Tests
Run Setup → verify sheets, headers, protection

Trigger menu from UI → expect:

css
Copy code
[CLIENT][REQ] ...
[CLIENT][OK ]
Inspect SYS_Audit_Log for menu actions

🟦 DAY 2 — STATIC SCHEMA & VALIDATORS ★
✅ Tasks
 D2.T1 Finalize ERP_SCHEMA map (EN + AR columns)

 D2.T2 Make Setup.js idempotent (reset safely)

 D2.T3 Add SchemaGuard.js (field whitelist/type checks)

 D2.T4 Create 4 policy sheets (3-column model)

⚙️ Subtasks
Serialize schema to ERP_SCHEMA constant

Create SchemaGuard.validate(entity, record)

Fixed headers: Policy_ID | Description | Numeric_Value

🧪 Tests
Insert policy row with bad types → expect server ERROR

Run Setup.js multiple times → protections preserved

🟦 DAY 3 — AUTHENTICATION & SESSIONS
✅ Tasks
 D3.T1 Add Auth_Password.js (hash/check)

 D3.T2 Add Auth.js (authenticateUser, rate limit, sessions)

 D3.T3 SYS_Sessions: write + revoke

 D3.T4 Login UI with console + toast logging

⚙️ Subtasks
Use Utilities.computeHmacSha256Signature + salt

Lockout after 3 failures

Generate Auth_Token + append to SYS_Sessions

🧪 Tests
Correct login → token issued → [OK] shown

3 wrong attempts → locked → toast + server WARN/ERROR

Logout → session revoked → Last_Seen updated

🟦 DAY 4 — SYSTEM CORE (USERS / ROLES / PERMS / DOCS)
✅ Tasks
 D4.T1 SYS_Users: CRUD + deactivate

 D4.T2 SYS_Roles + SYS_Permissions: static seeds

 D4.T3 Role → Permission enforcement

 D4.T4 SYS_Documents stub (metadata + URL)

⚙️ Subtasks
Add ensurePerm_() inside each service

Seed Admin role + assign baseline perms

🧪 Tests
Admin can create user

Non-admin blocked → ACCESS_DENIED in logs

Docs: store Drive metadata row (URLs optional)

🟦 DAY 5 — HRM + POLICY WIRING
✅ Tasks
 D5.T1 HRM_Employees CRUD

 D5.T2 Attendance / Leave import

 D5.T3 Policy API + application hooks

⚙️ Subtasks
Attendance late → lookup Policy_Penalties

Add HRM_Deductions suggestion (admin must confirm)

🧪 Tests
Add employee → Arabic row visible, EN used in backend

Add attendance with late → calculated deduction row

Invalid policy → WARN + no deduction

🟦 DAY 6 — PROJECTS (CRUD) + PvA VIEW
✅ Tasks
 D6.T1 PRJ_Clients, PRJ_Main CRUD

 D6.T2 PRJ_Tasks CRUD

 D6.T3 PRJ_Material catalog

 D6.T4 PRJ_Plan_vs_Actual read view

⚙️ Subtasks
Validate CLI_ID, date logic, budget ≥ 0

PvA reads from PRJ + FIN sheets

🧪 Tests
Create client → link to project → assign tasks

Open PvA → confirm logs: query scope + row count

🟦 DAY 7 — FINANCE CORE + PAYROLL SKELETON
✅ Tasks
 D7.T1 FIN_DirectExpenses CRUD

 D7.T2 FIN_InDirectExpenses (with/without time)

 D7.T3 FIN_PRJ_Revenue CRUD

 D7.T4 FIN_Custody, FIN_HRM_Payroll stub

⚙️ Subtasks
Validate PRJ_ID exists

Apply Policy_* for overtime etc.

Define payroll schema (used in Day 8)

🧪 Tests
Enter DirectExpense → visible in PvA cost

Enter Indirect (NoTime) → show depreciation note (warn only)

🟦 DAY 8 — HARDENING, E2E, CALCS
✅ Tasks
 D8.T1 Finalize access matrix

 D8.T2 Payroll minimal calc (basic + OT - deductions)

 D8.T3 E2E Smoke: Auth → SYS → HRM → PRJ → FIN

 D8.T4 Performance check: batch read/writes

🧪 Tests
Unauthorized write → blocked with message

Payroll: sample HRM + policy → logs for each component

🟦 DAY 9 — UAT, FIX, BACKUP, SHIP ★
✅ Tasks
 D9.T1 UAT script execution

 D9.T2 Fix + retest loop

 D9.T3 Backup spreadsheet (copy)

 D9.T4 Tag v1.0 + release notes

✅ UAT DAILY SMOKE CHECK
pgsql
Copy code
◉ Auth: login fail → login success → logs REQ/OK/ERR
◉ SYS: create temp role → assign → delete
◉ HRM: add employee → mark attendance → link policy
◉ PRJ: client → project → task → material → PvA
◉ FIN: post direct expense → validate cost view
📑 MODULE-SPECIFIC CHECKLISTS
┌──────────────────┐
│ AUTH / SESSIONS │
└──────────────────┘
 Wrong pass lockout

 Token create + revoke

 Last_Seen updates

 Audit logs append

┌──────────────────┐
│ SYS │
└──────────────────┘
 Role CRUD

 Permission gating

 User deactivate

 Documents stub

┌──────────────────┐
│ HRM │
└──────────────────┘
 Employee CRUD

 Attendance import

 Policy lookup fallback

 Deductions suggestion

┌──────────────────┐
│ PRJ │
└──────────────────┘
 Client→Project FK

 Task dates validate

 Material searchable

 PvA loads + logs

┌──────────────────┐
│ FIN │
└──────────────────┘
 PRJ_ID validation

 Rev/Exp view loads

 Payroll path runs

 Custody log path

🛠️ ASCII TABLE EXAMPLE
scss
Copy code
┌───────────────────────────────────────────────────────────────────────────┐
│  المشاريع (Projects)                                                      │
├───────────┬───────────────┬─────────────┬───────────┬──────────┬─────────┤
│ معرف      │ اسم           │ عميل        │ الحالة     │ النوع     │ الميزانية │
├───────────┼───────────────┼─────────────┼───────────┼──────────┼─────────┤
│ PRJ-0001  │ مطبخ شقة 12   │ أحمد خالد   │ جاري       │ مطبخ      │ 150,000  │
└───────────┴───────────────┴─────────────┴───────────┴──────────┴─────────┘
🔧 ROLLBACK STRATEGY
All writes go through dbWrite_() wrapper

Capture pre-write snapshot

On error: revert snapshot + log error + stack trace

For UAT issues:

Isolate last commit/tag

Use git revert

Re-run smoke tests

📦 DAILY DELIVERABLES SUMMARY
Day	Deliverables Summary
1	Repo, Script, Menu, Logging, DBG
2	Full Setup.js, Policy Sheets
3	Auth End-to-End
4	SYS Users/Roles/Perms CRUD + Permission Guards
5	HRM CRUD + Attendance + Policy Lookup
6	PRJ CRUD + PvA Read View
7	FIN CRUD + Payroll/Custody Skeleton
8	Access Matrix + Payroll Calc + E2E Tests
9	UAT + Backup + v1.0 Tag

🔌 AGENT-EXECUTABLE TASK FORMAT
Scriptable Function Format (Apps Script):

js
Copy code
createUser({ name, email, role })
createProject({ name, clientId, budget })
seedPolicyRow("PEN-LATE", "Late arrival", 50)
CLI (clasp):

bash
Copy code
npm run push
npx clasp run runSmokeAuth --nondev
Assertion Return Format:

json
Copy code
{
  "ok": true,
  "id": "EMP-0002",
  "logs": ["created row", "wrote to audit"],
  "warn": []
}