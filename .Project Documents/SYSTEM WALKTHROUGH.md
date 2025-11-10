# 🧪 Document 2 — Complete User Walkthrough & Behavioral Test Flow

This document simulates a full test session performed by a user inside the Nijjara ERP system.

---

## 📋 Scope

Describes:

- ✅ What the user sees
- ✅ What the user clicks
- ✅ What the backend does
- ✅ How Google Sheets change
- ✅ What appears in system logs
- ✅ What appears in the UI

> 🧭 All behavior described is static and repeatable. The same user input will always produce the same system response.

---

## 🔐 1. LOGIN SCREEN

### 1.1 User Action
- User opens: **Published Web App URL**

### 1.2 UI Display
A simple bilingual login form:

Username: ________
Password: ________
[ Login ]

shell
Copy code

### 1.3 User Enters Credentials
Username: admin
Password: ********

markdown
Copy code

### 1.4 Expected UI Feedback

- Button shows loading animation
- Console logs:

[CLIENT-INFO] Attempting login...
[CLIENT-DATA] Username entered: admin

bash
Copy code

### 1.5 Expected Backend Behavior

- Backend receives:

```json
{ "username": "admin", "password": "********", "requestId": "xyz123" }
Backend logs:

csharp
Copy code
[INFO] LOGIN_ATTEMPT | {"username":"admin","ip":"client-ip"}
Session is created

SYS_Sessions — new row appended (Row ≥ 3)

SYS_Audit_Log — new row:

Action	Entity	Entity_ID	Scope
LOGIN	USER	admin	AUTH

1.6 Successful Login (UI Feedback)
If login succeeds:

pgsql
Copy code
[CLIENT-SUCCESS] Login successful. Session active.
If login fails:

csharp
Copy code
[CLIENT-ERROR] Login failed: INVALID_CREDENTIALS
🧮 2. DASHBOARD SCREEN
2.1 UI Layout
A static dashboard with summary widgets:

👤 Total Employees

🏗️ Total Projects

💸 Total Expenses

💰 Total Revenue

📜 Last 5 Audit Logs

2.2 Logs
Frontend:

csharp
Copy code
[CLIENT-INFO] Loading Dashboard.html...
Backend:

csharp
Copy code
[INFO] DASHBOARD_LOAD | {"user":"admin"}
2.3 Backend Reads
Sheet	Purpose
HRM_Employees	Count rows
PRJ_Main	Count rows
FIN_DirectExpenses	Sum total amount
FIN_PRJ_Revenue	Sum total revenue
SYS_Audit_Log	Return 5 latest rows

2.4 Navigation
User clicks through:

HRM

PRJ

FIN

SYS

Console:

csharp
Copy code
[CLIENT-EVENT] Tab changed: HRM
👥 3. HRM MODULE — ADD EMPLOYEE
3.1 Navigation
Clicks: HRM → Employees

Console:

csharp
Copy code
[CLIENT-INFO] Loading HRM_Employees.html...
3.2 Viewing the Table
Arabic table headers loaded from Row 2:

Copy code
معرف الموظف | الاسم | القسم | الموبايل | تاريخ التعيين | ...
3.3 Add Action
Clicks: [Add Employee]

Modal opens. Console:

css
Copy code
[CLIENT-EVENT] Opened Add Employee Form
3.4 Sample Entry
Form Data:

text
Copy code
Name (EN): Ahmed Mohamed
Name (AR): احمد محمد
DOB: 1995-05-10
Gender: Male
Email: ahmed@example.com
Department: Carpentry
Mobile: 01023456789
Hire Date: 2025-01-01
3.5 User Clicks [Save]
3.6 Backend Behavior
Receives object:

json
Copy code
{
  "EMP_Name_EN": "Ahmed Mohamed",
  "EMP_Name_AR": "احمد محمد",
  "Gender": "Male",
  "EMP_Email": "ahmed@example.com",
  "Hire_Date": "2025-01-01",
  ...
}
Appends row to HRM_Employees at next available row (Row ≥ 3)

3.7 Server Logs
csharp
Copy code
[INFO] CREATE_EMPLOYEE | {"id":"EMP-0001","name":"Ahmed Mohamed"}
Audit Log row:

Action	Entity	Entity_ID	Scope
CREATE	HRM_Employees	EMP-0001	HRM

3.8 UI Feedback
csharp
Copy code
[CLIENT-SUCCESS] Employee added successfully.
Table reloads with new entry (Arabic row)

🔍 4. HRM MODULE — SEARCH & FILTER
4.1 Search
User types:

Copy code
احمد
Real-time table filtering

Console:

css
Copy code
[CLIENT-EVENT] Filter applied: {query:"احمد"}
4.2 Filter by Department
User selects:

makefile
Copy code
القسم: النجارة
Frontend calls backend:

js
Copy code
google.script.run.withSuccessHandler(...).filterEmployees("Carpentry")
Logs:

csharp
Copy code
[INFO] FILTER_EMPLOYEES | {"department":"Carpentry"}
🧾 5. PRJ MODULE — ADD CLIENT
5.1 Navigation
Click: PRJ → Clients

Console:

csharp
Copy code
[CLIENT-INFO] Loading PRJ_Clients.html...
5.2 Add Client
Enters:

Client Name: Hassan Furniture

Mobile 1: 01044556677

Email: hassan@client.com

5.3 Save → Backend
Row appended to PRJ_Clients

Audit log:

Action	Entity	Entity_ID
CREATE	PRJ_Clients	CLI-0001

Console:

arduino
Copy code
[CLIENT-SUCCESS] Client saved.
🧱 6. PRJ MODULE — ADD PROJECT
6.1 Add Project Form
Enters:

Project Name: Villa Kitchen

Client: Hassan Furniture

Budget: 150,000

Plan Days: 30

Start Date: 2025-02-01

Location: New Cairo

6.2 Save → Backend
Appends to PRJ_Main

Audit:

Action	Entity	Entity_ID
CREATE	PRJ_Main	PRJ-0001

Console:

csharp
Copy code
[CLIENT-SUCCESS] Project created.
💵 7. FIN MODULE — ADD DIRECT EXPENSE
7.1 Navigation
FIN → Direct Expenses

7.2 Add Expense
Fields:

Project: Villa Kitchen

Material: MDF Board

Quantity: 20

Unit Price: 900

VAT: Auto-calculated

Payment: Cash

7.3 Backend Calculation
DiEXP_Total_VAT_Exc = Qty * Price

DiEXP_Total_VAT_Inc = VAT formula applied

Audit:

Action	Entity	Entity_ID
CREATE	FIN_DirectExpenses	DiEXP-0001

Console:

csharp
Copy code
[CLIENT-SUCCESS] Expense recorded.
⚖️ 8. POLICY SHEET INTERACTION
8.1 Sample Use Case
User submits:

yaml
Copy code
Penalty Type: PEN_LATE_5MIN
Employee: Ahmed Mohamed
8.2 Backend Lookup
From Policy_Penalties:

Policy_ID	Description	Value
PEN_LATE_5MIN	Late 5 minutes	50

Backend applies:

ini
Copy code
Deduction = 50 EGP
Audit:

Action	Entity	Entity_ID
APPLY_POLICY	Policy_Penalties	PEN_LATE_5MIN

Console:

pgsql
Copy code
[CLIENT-INFO] Policy applied: PEN_LATE_5MIN (50 EGP)
📑 9. SYS MODULE — VIEW AUDIT LOG
9.1 Navigation
User opens: Audit Log screen

Static table loads

Backend:

csharp
Copy code
[INFO] GET_AUDIT_LOGS | {"limit":100}
Table headers come from Row 2:

Copy code
التاريخ | المستخدم | الإجراء | الكيان | ...
9.2 Filters
User filters by:

Action = CREATE

Entity = HRM_Employees

User = admin

Console:

css
Copy code
[CLIENT-EVENT] Audit filter applied.
🔚 10. LOGOUT
10.1 User Clicks Logout
Backend logs:

csharp
Copy code
[INFO] LOGOUT | {"user":"admin"}
SESS_Status = CLOSED

SESS_End_At = NOW

Audit:

Action	Entity	Entity_ID
LOGOUT	USER	admin

Console:

csharp
Copy code
[CLIENT-SUCCESS] Logged out successfully.
✅ 11. COMPLETE SUMMARY
11.1 What Users Can Do
Login / Logout

Navigate modules

Add employees

Add clients / projects

Record expenses

Apply policy logic

Search & filter

View full audit log

11.2 What Backend Does
Validates input

Appends to Row 3+

Protects header rows

Logs to:

Execution Log

SYS_Audit_Log

Prints debug logs

11.3 What UI Does
Loads HTML fragments

Displays Arabic headers

Renders tables, modals, filters

Real-time search + filtering

Shows toasts for success/fail

Mirrors server logs in browser console

📘 END OF DOCUMENT 2 — STATIC BEHAVIORAL CONTRACT