# Nijjara ERP System

A serverless ERP system built entirely on the Google Workspace platform (Apps Script + Google Sheets).

## 🏗️ Architecture

- **Backend**: Google Apps Script (`.js` files)
- **Database**: Google Sheets (2-row bilingual model)
- **Frontend**: Static Single-Page Application (HTML/JS/CSS)
- **Logging**: Centralized loud logging (server + client)
- **Language**: Bilingual (English backend / Arabic UI)

## 📊 Project Status

### ✅ Completed Work (as of Day 4)
- [x] Core infrastructure (Code.js, Logging.js, Utilities.js)
- [x] Centralized logging with SYS_Audit_Log integration
- [x] Client-side debug logger (DBG.js)
- [x] Admin menu with setup and seed functions
- [x] Schema definition (Setup.js) with 4 modules + 4 policy sheets
- [x] Validation framework (Validation.js)
- [x] Schema Guard with field whitelisting (SchemaGuard.js)
- [x] Seed data for policies and system roles/permissions
- [x] **SYS Module Complete**: Users, Roles, Permissions, Sessions, Documents
- [x] Authentication system with password hashing
- [x] Role-Based Access Control (RBAC) with 36 permissions

### 🚀 5-Day Reboot Plan
A comprehensive implementation plan has been created to complete the remaining modules:

**Day 1** (8 hours): HRM Core + Policy Engine
- Policy lookup engine with caching
- Employee CRUD frontend
- Attendance management with policy enforcement

**Day 2** (8 hours): HRM Advanced + Payroll
- Leave management system
- Deductions with policy integration
- Complete payroll calculation engine

**Day 3** (8 hours): PRJ Module Complete
- Client and project management
- Task tracking with dependencies
- Materials catalog
- Plan vs Actual reporting

**Day 4** (8 hours): FIN Module Complete
- Direct and indirect expenses
- Revenue tracking and invoicing
- Custody management
- Financial dashboard and reporting

**Day 5** (8 hours): Integration, Testing, Deployment
- End-to-end testing (50+ test cases)
- Security hardening and optimization
- Complete documentation
- Production deployment and UAT

📋 **See the detailed plans in**:
- [5-Day Reboot Plan.md](5-Day%20Reboot%20Plan.md)
- [5-Day Task Checklist.md](5-Day%20Task%20Checklist.md)
- [5-Day Visual Roadmap.md](5-Day%20Visual%20Roadmap.md)

### 📋 Next Immediate Action
Begin Day 1: HRM Core + Policy Engine implementation

## 🗂️ File Structure

```
nijjara-erp/
├── Code.js                 # Main entry point, menu handler
├── Setup.js                # Schema setup (creates all sheets)
├── Logging.js              # Server-side logging
├── Utilities.js            # Helper functions
├── Validation.js           # Business rule validation
├── SchemaGuard.js          # Schema validation & field whitelisting
├── Seed_Data.js            # Initial data seeding
├── frontend/
│   ├── js/
│   │   └── debug.js        # Client-side logging
│   └── css/
└── .Project Documents/     # Architecture & planning docs
```

## 📦 Database Schema

### Modules
1. **SYS** - System Administration (Users, Roles, Permissions, Audit, Sessions)
2. **HRM** - Human Resources (Employees, Attendance, Leave, Overtime, Deductions)
3. **PRJ** - Projects (Clients, Projects, Tasks, Materials, Plan vs Actual)
4. **FIN** - Finance (Direct/Indirect Expenses, Revenue, Custody, Payroll, P&L)

### Policy Sheets (3-Column Model)
- `POLICY_Penalties` - Penalty definitions
- `POLICY_Overtime` - Overtime rates
- `POLICY_Salary` - Salary components
- `POLICY_Deductions` - Deduction rules

### Bilingual Headers
Every data sheet has:
- **Row 1**: English headers (engine-facing)
- **Row 2**: Arabic headers (user-facing)
- **Row 3+**: Data rows

## 🔧 Setup Instructions

### Prerequisites
- Google Account with Google Sheets access
- Node.js and npm installed
- `clasp` CLI tool (`npm install -g @google/clasp`)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repo-url>
   cd nijjara-erp
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Login to clasp**
   ```bash
   clasp login
   ```

4. **Push code to Apps Script**
   ```bash
   npm run push
   ```

5. **Open the spreadsheet and run setup**
   - Open your Google Sheet
   - Go to menu: **⚙️ Nijjara ERP Admin → 🔧 Run Initial Setup**
   - Then: **⚙️ Nijjara ERP Admin → 🌱 Seed All Initial Data**

## 🚀 Development Workflow

### NPM Scripts
- `npm run pull` - Pull latest code from Apps Script
- `npm run push` - Push local changes to Apps Script
- `npm run deploy` - Push to Apps Script + Push to GitHub
- `npm run save` - Quick save (add all, commit "WIP", deploy)

### Logging Standards

#### Server-Side (Apps Script)
```javascript
logInfo_(actor, action, entity, id, details);
logError_(actor, action, entity, id, message, errorObject);
logWarn_(actor, action, entity, id, details);
```

#### Client-Side (Browser)
```javascript
DBG.info('Auth', 'Login attempt', {username: 'admin'});
DBG.request('API', 'createUser', payload);
DBG.success('API', 'User created', response);
DBG.warn('Validation', 'Missing field', {field: 'email'});
DBG.error('API', 'Failed to create user', error);
```

## 📋 Validation & Schema

### Schema Guard
All entities are validated against `ERP_SCHEMA` in `SchemaGuard.js`:
- Field whitelisting (unknown fields rejected)
- Type checking (string, number, boolean, date)
- Required field validation

### Business Rules
Entity-specific validation in `Validation.js`:
- Email format validation
- Date range validation
- Foreign key validation
- Numeric constraints

## 🔐 Security (Coming in Day 3)
- Password hashing with HMAC SHA256
- Session management with tokens
- Role-based access control
- Permission gating on all operations

## 📚 Documentation

### 🚀 Implementation Plans
- **[5-Day Reboot Plan](5-Day%20Reboot%20Plan.md)** - Complete implementation guide (48K chars)
- **[5-Day Task Checklist](5-Day%20Task%20Checklist.md)** - Quick reference checklist (15K chars)
- **[5-Day Visual Roadmap](5-Day%20Visual%20Roadmap.md)** - Visual guide with diagrams (33K chars)
- **[Action Plan](Action%20Plan.md)** - Original 9-day action plan (reference)

### 📖 System Documentation
- **[FULL SYSTEM DESCRIPTION](FULL%20SYSTEM%20DESCRIPTION.md)** - Complete architecture overview
- **[SYSTEM WALKTHROUGH](SYSTEM%20WALKTHROUGH.md)** - Step-by-step system guide
- **[PROJECT_STATUS](PROJECT_STATUS.md)** - Current implementation status

### 🗺️ Module Diagrams
- **[SYS_Module_Diagram](SYS_Module_Diagram.md)** - System Administration module
- **[HRM_Module_Diagram](HRM_Module_Diagram.md)** - Human Resources module
- **[PRJ_Module_Diagram](PRJ_Module_Diagram.md)** - Projects module
- **[FIN_Module_Diagram](FIN_Module_Diagram.md)** - Finance module
- **[Module Relationship Diagram](Module%20Relationship%20Diagram.md)** - Inter-module connections

### ✅ Completion Records
- **[Day 4 - COMPLETED](Day%204%20-%20COMPLETED.md)** - SYS Module completion log
- **[Restoration_Log](Restoration_Log.md)** - System restoration history

## 🤝 Contributing
This is a private project for Nijjara Company. For internal contributions:
1. Create a feature branch
2. Make changes with descriptive commits
3. Test thoroughly
4. Create a pull request

## 📄 License
Proprietary - All rights reserved by Nijjara Company

## 👨‍💻 Author
Mohamed Khoraiby (with AI assistance)

---
**Last Updated**: Day 1 Complete (November 10, 2025)
