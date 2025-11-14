# ✅ Nijjara ERP 5-Day Reboot - Task Checklist

**Quick Reference Guide for Daily Tasks**

---

## 📅 DAY 1: HRM Core + Policy Engine

### Morning Session (4 hours)
- [ ] **D1.1: Policy Engine Integration** (2 hours)
  - [ ] Create `main/POLICY_Engine.js`
  - [ ] Implement `getPolicyValue()` function
  - [ ] Implement `applyPenalty()` function
  - [ ] Implement `calculateOvertime()` function
  - [ ] Implement `getSalaryComponents()` function
  - [ ] Add 5-minute TTL caching mechanism
  - [ ] Test policy lookups with sample data
  - [ ] Add audit logging for all policy operations
  - [ ] Test graceful handling of missing policies

- [ ] **D1.2: Employee CRUD Frontend** (2 hours)
  - [ ] Create `frontend/HRM_Employees.html`
  - [ ] Create `frontend/forms/EmployeeCreateForm.html`
  - [ ] Design employee list table (Arabic headers)
  - [ ] Build "Add Employee" form with validation
  - [ ] Wire up form to `HRM_Employees.js` backend
  - [ ] Add toast notifications (success/error)
  - [ ] Implement pagination (50 per page)
  - [ ] Add search/filter functionality
  - [ ] Add Deactivate/Activate toggle
  - [ ] Test permission enforcement

### Afternoon Session (4 hours)
- [ ] **D1.3: Attendance Management** (2 hours)
  - [ ] Create `frontend/HRM_Attendance.html`
  - [ ] Enhance `main/HRM_Attendance.js`
  - [ ] Build attendance list view with filters
  - [ ] Create "Clock In/Out" form
  - [ ] Implement late arrival detection
  - [ ] Auto-calculate hours, late minutes, overtime
  - [ ] Link to POLICY_Penalties for suggestions
  - [ ] Add bulk CSV import functionality
  - [ ] Display attendance summary dashboard
  - [ ] Test with various scenarios

- [ ] **D1.4: Testing & Validation** (1.5 hours)
  - [ ] Test policy engine (all POLICY sheets)
  - [ ] Test employee CRUD operations
  - [ ] Test attendance calculations
  - [ ] Test bulk import (50+ records)
  - [ ] Verify performance benchmarks met
  - [ ] Check audit logs for all operations
  - [ ] Verify zero console errors

### End of Day 1
- [ ] Run `npm run save` to sync changes
- [ ] Update `PROJECT_STATUS.md`
- [ ] Tag commit: `v1.1-hrm-core`
- [ ] Review with team/stakeholders

**Day 1 Status**: [ ] Not Started | [ ] In Progress | [ ] Complete

---

## 📅 DAY 2: HRM Advanced + Payroll

### Morning Session (4 hours)
- [ ] **D2.1: Leave Management System** (2.5 hours)
  - [ ] Create `frontend/HRM_Leave.html`
  - [ ] Enhance `main/HRM_Leave.js`
  - [ ] Build leave request form
  - [ ] Implement leave type dropdown (from POLICY)
  - [ ] Add leave balance tracking
  - [ ] Build approval workflow (Pending → Approved → Rejected)
  - [ ] Calculate working days (exclude weekends/holidays)
  - [ ] Link to SYS_PubHolidays
  - [ ] Add leave calendar view
  - [ ] Implement notification system
  - [ ] Test leave request → approval flow

- [ ] **D2.2: Deductions System** (1.5 hours)
  - [ ] Create `frontend/HRM_Deductions.html`
  - [ ] Enhance `main/HRM_Deductions.js`
  - [ ] Build deductions entry form
  - [ ] Link to POLICY_Penalties
  - [ ] Implement deduction types (Penalty, Loan, Tax, etc.)
  - [ ] Add approval workflow for manual deductions
  - [ ] Build recurring deductions feature
  - [ ] Calculate total deductions per employee/month
  - [ ] Display deductions history with filtering
  - [ ] Test all deduction scenarios

### Afternoon Session (4 hours)
- [ ] **D2.3: Payroll Calculation Engine** (2.5 hours)
  - [ ] Create `frontend/HRM_Payroll.html`
  - [ ] Create `main/HRM_Payroll.js`
  - [ ] Build payroll calculation function
  - [ ] Fetch basic salary from HRM_Employees
  - [ ] Calculate overtime pay from attendance
  - [ ] Add allowances from employee record
  - [ ] Subtract deductions from HRM_Deductions
  - [ ] Calculate taxes (if applicable)
  - [ ] Generate per-employee payroll report
  - [ ] Build monthly payroll summary
  - [ ] Add export to CSV/PDF
  - [ ] Implement payroll lock mechanism
  - [ ] Test complete payroll cycle

- [ ] **D2.4: HRM Testing Suite** (1 hour)
  - [ ] Run complete HRM workflow test
  - [ ] Test policy integration (change policy → verify effect)
  - [ ] Test permission enforcement
  - [ ] Run performance tests (500 employees, 100 payroll calc)
  - [ ] Verify all audit logs correct
  - [ ] Check for console errors

### End of Day 2
- [ ] Run full HRM test suite
- [ ] Verify payroll accuracy
- [ ] Run `npm run save` to sync
- [ ] Update `PROJECT_STATUS.md`
- [ ] Tag commit: `v1.2-hrm-complete`

**Day 2 Status**: [ ] Not Started | [ ] In Progress | [ ] Complete

---

## 📅 DAY 3: PRJ Module Complete

### Morning Session (4 hours)
- [ ] **D3.1: Client Management** (1.5 hours)
  - [ ] Create `frontend/PRJ_Clients.html`
  - [ ] Create `main/PRJ_Clients.js`
  - [ ] Build client entry form
  - [ ] Implement client search/filter
  - [ ] Add client contact details
  - [ ] Build client history view (linked projects)
  - [ ] Add client categorization (Gov/Private/Individual)
  - [ ] Implement credit limit tracking
  - [ ] Test client CRUD operations

- [ ] **D3.2: Project Management** (2 hours)
  - [ ] Create `frontend/PRJ_Main.html`
  - [ ] Enhance `main/PRJ_Main.js`
  - [ ] Build project entry form
  - [ ] Link project to client (dropdown)
  - [ ] Implement status workflow
  - [ ] Add budget tracking
  - [ ] Build project timeline view
  - [ ] Calculate project progress percentage
  - [ ] Link to SYS_Documents
  - [ ] Implement project search/filter
  - [ ] Test project lifecycle

### Afternoon Session (4 hours)
- [ ] **D3.3: Task Management** (2 hours)
  - [ ] Create `frontend/PRJ_Tasks.html`
  - [ ] Create `main/PRJ_Tasks.js`
  - [ ] Build task entry form
  - [ ] Link tasks to projects
  - [ ] Assign tasks to employees
  - [ ] Implement task status workflow
  - [ ] Add task priority system
  - [ ] Build task dependencies feature
  - [ ] Calculate task completion percentage
  - [ ] Add task comments/notes
  - [ ] Display filtered task lists
  - [ ] Test task dependencies blocking

- [ ] **D3.4: Materials Catalog** (1 hour)
  - [ ] Create `frontend/PRJ_Materials.html`
  - [ ] Create `main/PRJ_Materials.js`
  - [ ] Build materials catalog form
  - [ ] Categorize materials
  - [ ] Add material pricing (unit price, supplier)
  - [ ] Link materials to projects (BOM)
  - [ ] Calculate material costs per project
  - [ ] Track material usage vs planned
  - [ ] Implement material search/filter
  - [ ] Test material cost calculations

- [ ] **D3.5: Plan vs Actual Reporting** (1 hour)
  - [ ] Create `frontend/PRJ_PvA.html`
  - [ ] Create `main/PRJ_PvA.js`
  - [ ] Build PvA report layout
  - [ ] Calculate planned costs (budget breakdown)
  - [ ] Calculate actual costs (from FIN_DirectExpenses)
  - [ ] Display variance (Planned - Actual)
  - [ ] Calculate variance percentage
  - [ ] Add time variance
  - [ ] Generate PvA charts
  - [ ] Add PDF export
  - [ ] Test PvA accuracy

### End of Day 3
- [ ] Test complete project lifecycle
- [ ] Verify PvA report accuracy
- [ ] Run `npm run save` to sync
- [ ] Update `PROJECT_STATUS.md`
- [ ] Tag commit: `v1.3-prj-complete`

**Day 3 Status**: [ ] Not Started | [ ] In Progress | [ ] Complete

---

## 📅 DAY 4: FIN Module Complete

### Morning Session (4 hours)
- [ ] **D4.1: Direct Expenses** (2 hours)
  - [ ] Create `frontend/FIN_DirectExpenses.html`
  - [ ] Create `main/FIN_DirectExpenses.js`
  - [ ] Build direct expense entry form
  - [ ] Link expenses to projects
  - [ ] Categorize expenses (Labor, Materials, etc.)
  - [ ] Add receipt/invoice upload (SYS_Documents)
  - [ ] Implement approval workflow
  - [ ] Calculate total expenses per project
  - [ ] Build expense report with filters
  - [ ] Add CSV/PDF export
  - [ ] Test expense tracking

- [ ] **D4.2: Indirect Expenses** (1.5 hours)
  - [ ] Create `frontend/FIN_InDirectExpenses.html`
  - [ ] Create `main/FIN_InDirectExpenses.js`
  - [ ] Build indirect expense entry form
  - [ ] Categorize indirect expenses (Rent, Utilities, etc.)
  - [ ] Track time-based expenses
  - [ ] Track event-based expenses
  - [ ] Calculate monthly overhead rate
  - [ ] Add optional project allocation
  - [ ] Build indirect expense report
  - [ ] Test overhead calculations

### Afternoon Session (4 hours)
- [ ] **D4.3: Revenue Tracking** (1.5 hours)
  - [ ] Create `frontend/FIN_Revenue.html`
  - [ ] Create `main/FIN_Revenue.js`
  - [ ] Build revenue entry form
  - [ ] Link revenue to projects
  - [ ] Track revenue stages (Quotation → Invoice → Payment)
  - [ ] Add payment terms
  - [ ] Calculate total revenue per project
  - [ ] Track outstanding invoices (A/R)
  - [ ] Build revenue report with filters
  - [ ] Generate revenue vs expenses chart
  - [ ] Test revenue tracking

- [ ] **D4.4: Custody Management** (1.5 hours)
  - [ ] Create `frontend/FIN_Custody.html`
  - [ ] Create `main/FIN_Custody.js`
  - [ ] Build custody entry form
  - [ ] Link custody to employees
  - [ ] Track custody types (Cash, Material, Equipment)
  - [ ] Implement custody status workflow
  - [ ] Calculate outstanding custody per employee
  - [ ] Build custody settlement form
  - [ ] Add overdue custody alerts
  - [ ] Build custody report with filters
  - [ ] Test custody tracking

- [ ] **D4.5: Financial Integration & Reporting** (1 hour)
  - [ ] Create `frontend/FIN_Dashboard.html`
  - [ ] Create `main/FIN_Reports.js`
  - [ ] Build financial dashboard
  - [ ] Display total revenue, expenses, profit
  - [ ] Show cash flow chart
  - [ ] Integrate with PRJ for PvA accuracy
  - [ ] Build profit & loss statement
  - [ ] Generate balance sheet
  - [ ] Add financial charts
  - [ ] Add PDF export
  - [ ] Test financial reports

### End of Day 4
- [ ] Test complete financial workflow
- [ ] Verify PvA integration accuracy
- [ ] Run `npm run save` to sync
- [ ] Update `PROJECT_STATUS.md`
- [ ] Tag commit: `v1.4-fin-complete`

**Day 4 Status**: [ ] Not Started | [ ] In Progress | [ ] Complete

---

## 📅 DAY 5: Integration, Testing, Deployment

### Morning Session (4 hours)
- [ ] **D5.1: End-to-End Testing** (2 hours)
  - [ ] Run complete business workflow test (14 steps)
  - [ ] Test all 36 permissions across all roles
  - [ ] Test data integrity (bilingual sync, FKs, validation)
  - [ ] Run performance tests (1000 employees, 500 projects)
  - [ ] Verify search across all modules
  - [ ] Check all audit logs
  - [ ] Document any issues found
  - [ ] Fix critical issues

- [ ] **D5.2: Security Hardening** (1.5 hours)
  - [ ] Test authentication security (hashing, session timeout)
  - [ ] Test authorization security (permission checks)
  - [ ] Test data security (sheet protections, sanitization)
  - [ ] Verify audit logging immutability
  - [ ] Add CSP headers
  - [ ] Implement rate limiting
  - [ ] Add CSRF token validation
  - [ ] Configure Apps Script permissions
  - [ ] Run security audit

### Afternoon Session (4 hours)
- [ ] **D5.3: Performance Optimization** (1.5 hours)
  - [ ] Implement caching (policies, permissions)
  - [ ] Optimize sheet read operations (batch reads)
  - [ ] Add indexes (lookup sheets)
  - [ ] Prune old audit logs
  - [ ] Minify JavaScript and CSS
  - [ ] Implement lazy loading for tables
  - [ ] Add pagination to all list views
  - [ ] Optimize Apps Script execution time
  - [ ] Test performance benchmarks

- [ ] **D5.4: Documentation Complete** (1.5 hours)
  - [ ] Write User Manual (`docs/User_Manual.md`)
  - [ ] Write Admin Manual (`docs/Admin_Manual.md`)
  - [ ] Write Developer Guide (`docs/Developer_Guide.md`)
  - [ ] Write API Reference (`docs/API_Reference.md`)
  - [ ] Create Changelog (`CHANGELOG.md`)
  - [ ] Add screenshots to documentation
  - [ ] Review all documentation
  - [ ] Get documentation approved

- [ ] **D5.5: Production Deployment & UAT** (0.5 hours)
  - [ ] Complete pre-deployment checklist
  - [ ] Run `npm run save`
  - [ ] Create web app deployment (`npm run deploy:web:new`)
  - [ ] Test web app URL
  - [ ] Tag release: `v1.0-production`
  - [ ] Create backup spreadsheet
  - [ ] Run post-deployment verification
  - [ ] Conduct UAT with 3-5 test users
  - [ ] Collect feedback
  - [ ] Fix critical issues
  - [ ] Document non-critical issues for future

### End of Day 5
- [ ] All modules complete and integrated
- [ ] All tests passed
- [ ] Documentation complete
- [ ] Production deployment successful
- [ ] UAT completed with approval
- [ ] System ready for live use! 🎉

**Day 5 Status**: [ ] Not Started | [ ] In Progress | [ ] Complete

---

## 📊 Overall Progress Tracker

```
┌─────────────────────────────────────────┐
│  NIJJARA ERP 5-DAY REBOOT PROGRESS     │
└─────────────────────────────────────────┘

Day 1: HRM Core          [          ] 0%
Day 2: HRM Advanced      [          ] 0%
Day 3: PRJ Module        [          ] 0%
Day 4: FIN Module        [          ] 0%
Day 5: Integration       [          ] 0%
─────────────────────────────────────────
Total Progress:          [          ] 0%
```

**Update this tracker as you complete each day!**

---

## 🎯 Success Criteria Summary

### Day 1 Success Criteria
- ✅ Policy engine returns correct values from POLICY sheets
- ✅ Employee CRUD operations functional with permissions
- ✅ Attendance calculations accurate (late, overtime)
- ✅ All operations logged in SYS_Audit_Log

### Day 2 Success Criteria
- ✅ Leave request/approval workflow functional
- ✅ Deductions system integrated with policies
- ✅ Payroll calculation accurate for all components
- ✅ Complete HRM test suite passes

### Day 3 Success Criteria
- ✅ Client management functional
- ✅ Project lifecycle complete (create → assign → complete)
- ✅ Task dependencies enforced
- ✅ PvA report displays accurate variances

### Day 4 Success Criteria
- ✅ Direct expenses linked to projects
- ✅ Revenue tracking functional
- ✅ Custody system tracks employee advances
- ✅ Financial dashboard displays accurate metrics

### Day 5 Success Criteria
- ✅ E2E test passes all scenarios
- ✅ Security audit passes all checks
- ✅ Performance benchmarks met
- ✅ Documentation complete
- ✅ Production deployment successful
- ✅ UAT approval received

---

## 📝 Daily Sign-Off Template

```
═══════════════════════════════════════════
  DAY [X] COMPLETION SIGN-OFF
═══════════════════════════════════════════

Date: _______________
Developer: _______________

DELIVERABLES COMPLETED:
□ [Deliverable 1]
□ [Deliverable 2]
□ [Deliverable 3]

TESTS PASSED:
□ [Test 1]
□ [Test 2]
□ [Test 3]

CODE FILES CREATED: _____
CODE FILES MODIFIED: _____
LINES OF CODE: ~_____

DEPLOYMENT STATUS:
□ Code synced (npm run save)
□ Git tagged
□ PROJECT_STATUS.md updated

BLOCKERS/ISSUES:
_______________________________________________
_______________________________________________

NOTES FOR NEXT DAY:
_______________________________________________
_______________________________________________

STATUS: [ ] Complete [ ] Incomplete
SIGNATURE: _______________
═══════════════════════════════════════════
```

---

## 🚀 Quick Commands Reference

```bash
# Sync all changes to Apps Script and GitHub
npm run save

# Pull latest from Apps Script
npm run pull

# Push to Apps Script only
npm run push

# Create new web app deployment
npm run deploy:web:new

# Check repository status
npm run status

# Create Git tag
git tag -a v1.X-description -m "Message"
git push origin v1.X-description
```

---

**Ready to start? Pick a day and begin checking off tasks! 🎯**

**Last Updated**: 2025-11-14
