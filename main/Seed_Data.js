/** =========================================================
 *  NIJJARA ERP – SEED DATA MODULE
 *  Author: Mohamed / ChatGPT Assistant
 *  Purpose: Initial seed data for policy sheets and system data
 *  ========================================================= */

/**
 * Seeds all policy sheets with initial data
 */
function seedAllPolicySheets() {
  const user = getCurrentUser_();
  logInfo_(user, 'SeedStart', 'POLICY', 'ALL', 'Starting policy seed operation');
  
  try {
    seedPenalties_();
    seedOvertime_();
    seedSalary_();
    seedDeductions_();
    
    logInfo_(user, 'SeedComplete', 'POLICY', 'ALL', 'All policy sheets seeded successfully');
    SpreadsheetApp.getUi().alert('✅ Policy sheets seeded successfully!');
  } catch (error) {
    logError_(user, 'SeedFailed', 'POLICY', 'ALL', 'Failed to seed policy sheets', error);
    SpreadsheetApp.getUi().alert('❌ Error: ' + error.message);
  }
}

/**
 * Seeds system permissions and creates admin role
 * RUN THIS ONCE to initialize the permission system
 */
function seedPermissionsAndRoles() {
  const user = getCurrentUser_();
  logInfo_(user, 'SeedStart', 'PERMISSIONS', 'ALL', 'Starting permissions seed');
  
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    
    // Seed permissions
    const permSheet = ss.getSheetByName('SYS_Permissions');
    if (!permSheet) throw new Error('SYS_Permissions sheet not found');
    
    const permissions = [
      // HRM Permissions
      ['PRM-HRM-001', 'View_Employee', 'View employee records', 'HRM'],
      ['PRM-HRM-002', 'Create_Employee', 'Create new employees', 'HRM'],
      ['PRM-HRM-003', 'Update_Employee', 'Update employee records', 'HRM'],
      ['PRM-HRM-004', 'Delete_Employee', 'Deactivate employees', 'HRM'],
      ['PRM-HRM-005', 'View_Attendance', 'View attendance records', 'HRM'],
      ['PRM-HRM-006', 'Manage_Attendance', 'Clock in/out and manage attendance', 'HRM'],
      ['PRM-HRM-007', 'View_Leave', 'View leave requests', 'HRM'],
      ['PRM-HRM-008', 'Manage_Leave', 'Create and approve leave requests', 'HRM'],
      ['PRM-HRM-009', 'View_Deductions', 'View deductions', 'HRM'],
      ['PRM-HRM-010', 'Manage_Deductions', 'Create and manage deductions', 'HRM'],
      ['PRM-HRM-011', 'View_Overtime', 'View overtime records', 'HRM'],
      ['PRM-HRM-012', 'Manage_Overtime', 'Create and manage overtime', 'HRM'],
      ['PRM-HRM-013', 'View_Advances', 'View employee advances', 'HRM'],
      ['PRM-HRM-014', 'Manage_Advances', 'Create and manage advances', 'HRM'],
      ['PRM-HRM-015', 'View_Payroll', 'View payroll data', 'HRM'],
      ['PRM-HRM-016', 'Process_Payroll', 'Process and manage payroll', 'HRM'],
      
      // PRJ Permissions
      ['PRM-PRJ-001', 'View_Project', 'View project records', 'PRJ'],
      ['PRM-PRJ-002', 'Create_Project', 'Create new projects', 'PRJ'],
      ['PRM-PRJ-003', 'Update_Project', 'Update project records', 'PRJ'],
      ['PRM-PRJ-004', 'Delete_Project', 'Delete projects', 'PRJ'],
      ['PRM-PRJ-005', 'View_Client', 'View client records', 'PRJ'],
      ['PRM-PRJ-006', 'Manage_Client', 'Create and manage clients', 'PRJ'],
      
      // FIN Permissions
      ['PRM-FIN-001', 'View_Expense', 'View expenses', 'FIN'],
      ['PRM-FIN-002', 'Create_Expense', 'Create expenses', 'FIN'],
      ['PRM-FIN-003', 'View_Income', 'View income records', 'FIN'],
      ['PRM-FIN-004', 'Create_Income', 'Create income records', 'FIN'],
      
      // SYS Permissions
      ['PRM-SYS-001', 'View_Audit_Log', 'View system audit logs', 'SYS'],
      ['PRM-SYS-002', 'Manage_Users', 'Create and manage users', 'SYS'],
      ['PRM-SYS-003', 'Manage_Roles', 'Create and manage roles', 'SYS'],
      ['PRM-SYS-004', 'Manage_Permissions', 'Assign permissions to roles', 'SYS']
    ];
    
    const timestamp = new Date();
    permissions.forEach(perm => {
      permSheet.appendRow([
        perm[0],  // PRM_ID
        perm[1],  // PRM_Name
        perm[2],  // PRM_Notes
        perm[3],  // PRM_Catg
        timestamp, // PRM_Crt_At
        user,     // PRM_Crt_By
        '',       // PRM_Upd_At
        ''        // PRM_Upd_By
      ]);
    });
    
    logInfo_(user, 'Seed', 'PERMISSIONS', 'ALL', `Seeded ${permissions.length} permissions`);
    
    // Create Admin role
    const roleSheet = ss.getSheetByName('SYS_Roles');
    if (!roleSheet) throw new Error('SYS_Roles sheet not found');
    
    roleSheet.appendRow([
      'ROL-ADMIN',              // ROL_ID
      'System Administrator',   // ROL_Title
      'Full system access',     // ROL_Notes
      'TRUE',                   // ROL_Is_System
      timestamp,                // ROL_Crt_At
      user,                     // ROL_Crt_By
      '',                       // ROL_Upd_At
      ''                        // ROL_Upd_By
    ]);
    
    // Assign all permissions to Admin role
    const rolePermSheet = ss.getSheetByName('SYS_Role_Permissions');
    if (!rolePermSheet) throw new Error('SYS_Role_Permissions sheet not found');
    
    permissions.forEach(perm => {
      rolePermSheet.appendRow([
        'ROL-ADMIN',  // ROL_ID
        perm[0],      // PRM_ID
        'ALL',        // SRP_Scope
        'TRUE',       // SRP_Is_Allowed
        '',           // SRP_Constraints
        timestamp,    // SRP_Crt_At
        user,         // SRP_Crt_By
        '',           // SRP_Upd_At
        ''            // SRP_Upd_By
      ]);
    });
    
    logInfo_(user, 'Seed', 'ROLES', 'ADMIN', 'Created admin role with all permissions');
    
    // Update test user to have admin role
    const userSheet = ss.getSheetByName('SYS_Users');
    if (userSheet) {
      const userData = userSheet.getDataRange().getValues();
      for (let i = 1; i < userData.length; i++) {
        if (userData[i][2] === 'mkhoraiby') { // USR_Name column
          userSheet.getRange(i + 1, 7).setValue('ROL-ADMIN'); // ROL_ID column
          logInfo_(user, 'Update', 'USERS', 'mkhoraiby', 'Assigned admin role');
          break;
        }
      }
    }
    
    SpreadsheetApp.getUi().alert('✅ Permissions seeded successfully!\n\n' +
      `Created ${permissions.length} permissions\n` +
      'Created Admin role\n' +
      'Assigned admin role to mkhoraiby');
      
  } catch (error) {
    logError_(user, 'SeedFailed', 'PERMISSIONS', 'ALL', 'Failed to seed permissions', error);
    SpreadsheetApp.getUi().alert('❌ Error: ' + error.message);
  }
}

/**
 * Seeds POLICY_Penalties sheet
 */
function seedPenalties_() {
  const sheetName = 'POLICY_Penalties';
  const data = [
    ['PEN-LATE-001', 'Late arrival (15 minutes)', 50],
    ['PEN-LATE-002', 'Late arrival (30 minutes)', 100],
    ['PEN-LATE-003', 'Late arrival (60 minutes)', 200],
    ['PEN-ABSENT-001', 'Unexcused absence (1 day)', 500],
    ['PEN-EARLY-001', 'Early departure (15 minutes)', 50],
    ['PEN-EARLY-002', 'Early departure (30 minutes)', 100]
  ];
  
  seedSheet_(sheetName, data);
}

/**
 * Seeds POLICY_Overtime sheet
 */
function seedOvertime_() {
  const sheetName = 'POLICY_Overtime';
  const data = [
    ['OT-RATE-STD', 'Standard overtime rate (per hour)', 1.5],
    ['OT-RATE-NIGHT', 'Night shift overtime rate (per hour)', 2.0],
    ['OT-RATE-WEEKEND', 'Weekend overtime rate (per hour)', 2.0],
    ['OT-RATE-HOLIDAY', 'Holiday overtime rate (per hour)', 2.5]
  ];
  
  seedSheet_(sheetName, data);
}

/**
 * Seeds POLICY_Salary sheet
 */
function seedSalary_() {
  const sheetName = 'POLICY_Salary';
  const data = [
    ['SAL-MIN-BASE', 'Minimum base salary', 3000],
    ['SAL-TRANSPORT', 'Transportation allowance', 500],
    ['SAL-HOUSING', 'Housing allowance', 1000],
    ['SAL-FOOD', 'Food allowance', 300],
    ['SAL-SOCIAL-INS', 'Social insurance deduction rate (%)', 14],
    ['SAL-TAX-RATE', 'Income tax rate (%)', 10]
  ];
  
  seedSheet_(sheetName, data);
}

/**
 * Seeds POLICY_Deductions sheet
 */
function seedDeductions_() {
  const sheetName = 'POLICY_Deductions';
  const data = [
    ['DED-SOCIAL-INS', 'Social insurance deduction', 14],
    ['DED-TAX-BASE', 'Base tax deduction rate (%)', 10],
    ['DED-LOAN-INT', 'Loan interest rate (%)', 5]
  ];
  
  seedSheet_(sheetName, data);
}

/**
 * Generic function to seed a sheet with data
 * @param {string} sheetName - Name of the sheet
 * @param {Array<Array>} data - Data to insert (array of rows)
 */
function seedSheet_(sheetName, data) {
  const user = getCurrentUser_();
  
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(sheetName);
    
    if (!sheet) {
      throw new Error(`Sheet ${sheetName} not found. Please run Setup first.`);
    }
    
    // Check if sheet already has data (beyond the 2 header rows)
    const lastRow = sheet.getLastRow();
    if (lastRow > 2) {
      logWarn_(user, 'SeedSkip', sheetName, 'N/A', 'Sheet already contains data, skipping seed');
      return;
    }
    
    // Insert data starting from row 3
    const startRow = 3;
    const numRows = data.length;
    const numCols = data[0].length;
    
    sheet.getRange(startRow, 1, numRows, numCols).setValues(data);
    
    logInfo_(user, 'SeedComplete', sheetName, 'N/A', `Seeded ${numRows} rows`);
  } catch (error) {
    logError_(user, 'SeedFailed', sheetName, 'N/A', 'Failed to seed sheet', error);
    throw error;
  }
}

/**
 * Seeds initial system roles
 */
function seedSystemRoles() {
  const sheetName = 'SYS_Roles';
  const user = getCurrentUser_();
  const timestamp = new Date();
  
  const data = [
    ['ROL-ADMIN', 'Administrator', 'Full system access', true, timestamp, user, timestamp, user],
    ['ROL-MANAGER', 'Manager', 'Management level access', true, timestamp, user, timestamp, user],
    ['ROL-SUPERVISOR', 'Supervisor', 'Supervisory access', true, timestamp, user, timestamp, user],
    ['ROL-EMPLOYEE', 'Employee', 'Basic employee access', true, timestamp, user, timestamp, user],
    ['ROL-VIEWER', 'Viewer', 'Read-only access', true, timestamp, user, timestamp, user]
  ];
  
  try {
    seedSheet_(sheetName, data);
    logInfo_(user, 'SeedComplete', sheetName, 'ALL', 'System roles seeded successfully');
    SpreadsheetApp.getUi().alert('✅ System roles seeded successfully!');
  } catch (error) {
    logError_(user, 'SeedFailed', sheetName, 'ALL', 'Failed to seed system roles', error);
    SpreadsheetApp.getUi().alert('❌ Error: ' + error.message);
  }
}

/**
 * Seeds initial system permissions
 */
function seedSystemPermissions() {
  const sheetName = 'SYS_Permissions';
  const user = getCurrentUser_();
  const timestamp = new Date();
  
  const data = [
    // SYS Module Permissions
    ['PRM-SYS-USER-CREATE', 'Create users', 'User management', 'SYS', timestamp, user, timestamp, user],
    ['PRM-SYS-USER-UPDATE', 'Update users', 'User management', 'SYS', timestamp, user, timestamp, user],
    ['PRM-SYS-USER-DELETE', 'Delete users', 'User management', 'SYS', timestamp, user, timestamp, user],
    ['PRM-SYS-ROLE-MANAGE', 'Manage roles', 'Role management', 'SYS', timestamp, user, timestamp, user],
    ['PRM-SYS-AUDIT-VIEW', 'View audit logs', 'Audit access', 'SYS', timestamp, user, timestamp, user],
    
    // HRM Module Permissions
    ['PRM-HRM-EMP-CREATE', 'Create employees', 'Employee management', 'HRM', timestamp, user, timestamp, user],
    ['PRM-HRM-EMP-UPDATE', 'Update employees', 'Employee management', 'HRM', timestamp, user, timestamp, user],
    ['PRM-HRM-EMP-DELETE', 'Delete employees', 'Employee management', 'HRM', timestamp, user, timestamp, user],
    ['PRM-HRM-ATT-MANAGE', 'Manage attendance', 'Attendance management', 'HRM', timestamp, user, timestamp, user],
    ['PRM-HRM-LEAVE-APPROVE', 'Approve leave', 'Leave management', 'HRM', timestamp, user, timestamp, user],
    
    // PRJ Module Permissions
    ['PRM-PRJ-CREATE', 'Create projects', 'Project management', 'PRJ', timestamp, user, timestamp, user],
    ['PRM-PRJ-UPDATE', 'Update projects', 'Project management', 'PRJ', timestamp, user, timestamp, user],
    ['PRM-PRJ-DELETE', 'Delete projects', 'Project management', 'PRJ', timestamp, user, timestamp, user],
    ['PRM-PRJ-TASK-ASSIGN', 'Assign tasks', 'Task management', 'PRJ', timestamp, user, timestamp, user],
    
    // FIN Module Permissions
    ['PRM-FIN-EXP-CREATE', 'Create expenses', 'Expense management', 'FIN', timestamp, user, timestamp, user],
    ['PRM-FIN-EXP-APPROVE', 'Approve expenses', 'Expense management', 'FIN', timestamp, user, timestamp, user],
    ['PRM-FIN-REV-VIEW', 'View revenue', 'Revenue access', 'FIN', timestamp, user, timestamp, user],
    ['PRM-FIN-PAYROLL-RUN', 'Run payroll', 'Payroll management', 'FIN', timestamp, user, timestamp, user]
  ];
  
  try {
    seedSheet_(sheetName, data);
    logInfo_(user, 'SeedComplete', sheetName, 'ALL', 'System permissions seeded successfully');
    SpreadsheetApp.getUi().alert('✅ System permissions seeded successfully!');
  } catch (error) {
    logError_(user, 'SeedFailed', sheetName, 'ALL', 'Failed to seed system permissions', error);
    SpreadsheetApp.getUi().alert('❌ Error: ' + error.message);
  }
}

/**
 * Master seed function - seeds all required initial data
 */
function seedAllInitialData() {
  const user = getCurrentUser_();
  logInfo_(user, 'MasterSeedStart', 'System', 'ALL', 'Starting master seed operation');
  
  try {
    seedAllPolicySheets();
    seedSystemRoles();
    seedSystemPermissions();
    
    logInfo_(user, 'MasterSeedComplete', 'System', 'ALL', 'All initial data seeded successfully');
    SpreadsheetApp.getUi().alert('✅ All initial data seeded successfully!');
  } catch (error) {
    logError_(user, 'MasterSeedFailed', 'System', 'ALL', 'Failed to seed initial data', error);
    SpreadsheetApp.getUi().alert('❌ Error: ' + error.message);
  }
}
