############################################################
# 📄 DOCUMENT 1 — FULL SYSTEM DESCRIPTION
# 💼 Nijjara ERP — Static, Bilingual, Multi-File ERP System
############################################################

📍 Built for: Manufacturing & Contracting  
📍 Platform: Google Workspace (App Script + Sheets + HTML/JS/CSS)  
📍 Type: Bilingual, Static, Fully Auditable, Loud-Logging SPA  

---

## 1️⃣ INTRODUCTION

                ┌──────────────────────────────┐
                │        Nijjara ERP           │
                │  Static + Predictable Logic │
                └──────────────────────────────┘
                         ▲
                         │
        ┌────────────────┼────────────────┐
        │                │                │
        ▼                ▼                ▼
   Human UI (Arabic)  Debugging Logs  English Backend (Code)

🧭 Objectives:

- ✅ High Reliability
- ✅ Predictable, No Surprises
- ✅ 100% Auditability
- ✅ Loud Debugging (Client + Server)
- ✅ Dual-Language: Arabic UI / English Logic
- ✅ No Hidden Automation
- ✅ Role-Based Security
- ✅ No Metadata Engines

🔧 Architecture Summary:

| Component  | Description                                     |
|------------|-------------------------------------------------|
| Backend    | `Google Apps Script (.gs/.js)`                 |
| Frontend   | `Multi-file Static SPA (HTML, JS, CSS)`        |
| Database   | `Google Sheets (2-row bilingual model)`        |
| Logging    | `App Script Logs + Browser Console Logs`       |
| Security   | `Sessions, Roles, Protected Actions`           |

---

## 2️⃣ SYSTEM PURPOSE

    ┌──────────┐   ┌────────────┐   ┌──────────┐   ┌─────────┐
    │  SYS     │   │    HRM     │   │   PRJ    │   │   FIN   │
    └──────────┘   └────────────┘   └──────────┘   └─────────┘
      System       Human Resource     Projects      Finance
  Administration     Management       Workflow      & P&L

🛠️ Built using **only static screens & forms** — no dynamic generation. Each screen is *explicitly coded* for speed and clarity.

---

## 3️⃣ FRONTEND ARCHITECTURE — Multi-File SPA

📁 Directory Structure:

frontend/
│
├── App.html                (Main SPA frame)
├── Login.html              (Login UI)
├── Dashboard.html          (Summary / Home)
├── HRM_Employees.html      (Employee table/forms)
├── PRJ_Main.html           (Project forms/views)
├── FIN_DirectExp.html      (Finance interface)
├── SYS_Users.html          (User + Role Management)
│
├── js/
│   ├── global.js           (Shared utilities)
│   ├── auth.js             (Session logic)
│   ├── forms.js            (Form open/close)
│   ├── tables.js           (Table rendering)
│   ├── api.js              (Script API Wrappers)
│   └── debug.js            (Client logs)
│
└── css/
    ├── base.css            (Dark mode, fonts, layout)
    ├── forms.css
    ├── tables.css
    └── navigation.css

🧭 SPA Routing Behavior:

Click Tab → Inject HTML fragment into container → Avoids reloads → Modern App feel

---

## 4️⃣ BACKEND ARCHITECTURE — Apps Script

📁 Backend File Overview:

| File Name         | Responsibility                            |
|------------------|--------------------------------------------|
| `Code.js`         | Main router (doGet)                        |
| `Auth.js`         | Auth, sessions, token handling             |
| `SYS_Users.js`    | SYS module CRUD                            |
| `HRM_Employees.js`| HR module CRUD                             |
| `PRJ_Main.js`     | Projects module CRUD                       |
| `FIN_DirectExp.js`| Finance module CRUD                        |
| `Logging.js`      | `logInfo`, `logError`, `auditAction`      |
| `Setup.js`        | Initial sheet + bilingual header creation |
| `Validation.js`   | Input checking + sanitization             |
| `Utilities.js`    | Reusable functions                        |

⚙️ Function Flow:

[Input] → Validate → Map Headers → Write to Row 3+ → Log → Return structured response

---

## 5️⃣ DATABASE STRUCTURE — 2-Row Bilingual Sheets

📊 Sheet Layout:

| Row | Purpose              |
|-----|----------------------|
|  1  | English Headers      |
|  2  | Arabic Headers       |
| 3+  | Data Rows            |

🧾 Example (Employee Sheet):

Row 1:  EMP_ID | EMP_Name_EN | EMP_Email | DEPT_Name | Hire_Date  
Row 2:  معرف_الموظف | اسم_الموظف_بالإنجليزية | البريد_الإلكتروني | القسم | تاريخ_التعيين  
Row 3+: (Actual data rows)

🛡️ Protection:

- ❄️ Rows 1 & 2 are Frozen + Protected
- ⚙️ Only `Setup.js` can modify

---

## 6️⃣ POLICY SHEETS — 3 Column Static Format

📐 Format:

| Column    | Description               |
|-----------|---------------------------|
| A         | `Policy_ID`               |
| B         | `Policy_Description`      |
| C         | `Policy_Value`            |

📌 Example:

| Policy_ID   | Policy_Description                | Policy_Value |
|-------------|----------------------------------|--------------|
| OT_RATE_STD | Standard overtime per hour       | 1.5          |

🧠 Usage Logic:

Trigger → Lookup Policy_ID → Fetch Policy_Value → Apply → Log in SYS_Audit_Log

---

## 7️⃣ LOUD DEBUGGING — Core Principle

📂 App Script Logs:

```js
logInfo("User created", {userId: "...", role:"Admin"});
logError("Invalid password", {username:"..."});
auditAction("mkhoraiby", "CREATE", "HRM_Employees", "EMP-1034", "Manual");
🖥️ Browser Console:

less
Copy code
[CLIENT-INFO] Loading employee list...
[CLIENT-ERROR] Failed to load employees: SERVER_TIMEOUT
[CLIENT-EVENT] Opened form: Add Project
🎯 Goals:

🕵️ Detect mapping errors

🧩 Understand workflows

🛠️ Debug API/UI mismatches

8️⃣ SECURITY MODEL
🔐 Layered Security Enforcement:

Layer	Description
Login	Username + Password
Hashing	Salted Hashes
Sessions	Stored in SYS_Sessions
Role Checks	On every server call
Audit Logs	Logs who did what and when
Timeout	Auto-logout inactive users
Suspicious Event	Forced logout & audit

9️⃣ MODULE OVERVIEW
🛠️ SYS MODULE
Users, Roles, Permissions

Session Management

Audit Log Viewer

System Settings

👥 HRM MODULE
Employee Registry

Attendance + Leaves

Overtime + Penalties

Salaries, Departments

🏗️ PRJ MODULE
Projects, Clients

Tasks, Materials

Indirect Allocations

Plan vs Actual Reviews

💰 FIN MODULE
Direct & Indirect Expenses

Revenue Records

Custody Management

Payroll + Profit & Loss

🔟 STATIC UI — User Experience
🎨 Every screen includes:

Arabic headers

Form modals

Filters

Toasts

Inline validation

Console logs

🛠️ Every screen is explicitly built, no dynamic generation, full control.

🔁 AUDITABILITY & TRACEABILITY
🔍 Every operation logs to:

SYS_Audit_Log (Google Sheet)

Browser Console (JS logs)

Apps Script Execution Log

📋 Metadata for rows:

Field	Description
Created_At	Timestamp
Created_By	User who added
Updated_At	Last updated
Updated_By	Who updated

🚀 DEPLOYMENT MODEL
🧪 Versioning + Clean Sync:

GitHub-based source control

CLASP for syncing App Script

Multi-file architecture

Deployment via Web App Versions

📦 Workflow:

Edit code → Commit → CLASP push → Version Deploy → Test

✅ END OF DOCUMENT 1 — NIJJARA ERP SYSTEM OVERVIEW