/** =========================================================
 *  NIJJARA ERP – HRM_EMPLOYEES MODULE
 *  Author: Mohamed / ChatGPT Assistant
 *  Purpose: Employee master data management with RBAC
 *  ========================================================= */

/**
 * Creates a new employee
 * @param {Object} empData - Employee data
 * @param {string} userId - Acting user ID
 * @returns {Object} - Response object
 */
function createEmployee(empData, userId) {
  const actor = getCurrentUser_();
  
  try {
    // Permission check
    ensurePermission_(userId, 'Create_Employee');
    
    logInfo_(actor, 'Create', 'HRM_Employees', 'NEW', 'Creating employee');
    
    // Validate required fields
    if (isEmpty_(empData.EMP_Name_EN) || isEmpty_(empData.EMP_Name_AR)) {
      throw new Error('Employee name (EN and AR) is required');
    }
    
    if (isEmpty_(empData.Job_Title) || isEmpty_(empData.DEPT_Name)) {
      throw new Error('Job title and department are required');
    }
    
    if (isEmpty_(empData.Hire_Date)) {
      throw new Error('Hire date is required');
    }
    
    // Check for duplicate National ID if provided
    if (!isEmpty_(empData.National_ID)) {
      if (employeeExistsByNationalId_(empData.National_ID)) {
        throw new Error('Employee with this National ID already exists');
      }
    }
    
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const empSheet = ss.getSheetByName('HRM_Employees');
    
    if (!empSheet) {
      throw new Error('HRM_Employees sheet not found');
    }
    
    const empId = generateId_('EMP');
    const timestamp = new Date();
    
    const rowData = [
      empId,                                    // EMP_ID
      empData.EMP_Name_EN || '',                // EMP_Name_EN
      empData.EMP_Name_AR || '',                // EMP_Name_AR
      empData.Date_of_Birth || '',              // Date_of_Birth
      empData.Gender || '',                     // Gender
      empData.National_ID || '',                // National_ID
      empData.Marital_Status || '',             // Marital_Status
      empData.Military_Status || '',            // Military_Status
      empData.EMP_Mob_Main || '',               // EMP_Mob_Main
      empData.EMP_Mob_Sub || '',                // EMP_Mob_Sub
      empData.Home_Address || '',               // Home_Address
      empData.EMP_Email || '',                  // EMP_Email
      empData.Emrgcy_Cont || '',                // Emrgcy_Cont
      empData.EmrCont_Relation || '',           // EmrCont_Relation
      empData.EmrCont__Mob || '',               // EmrCont__Mob
      empData.Job_Title || '',                  // Job_Title
      empData.DEPT_Name || '',                  // DEPT_Name
      empData.Hire_Date || '',                  // Hire_Date
      empData.EMP_CONT_Type || '',              // EMP_CONT_Type
      empData.EMP_Status || 'Active',           // EMP_Status
      empData.Basic_Salary || 0,                // Basic_Salary
      empData.Allowances || 0,                  // Allowances
      empData.Deducts || 0,                     // Deducts
      timestamp,                                // EMP_Crt_At
      actor,                                    // EMP_Crt_By
      '',                                       // EMP_Upd_At
      ''                                        // EMP_Upd_By
    ];
    
    empSheet.appendRow(rowData);
    
    logInfo_(actor, 'Create', 'HRM_Employees', empId, 'Employee created successfully');
    writeToAuditLog_(actor, 'Create', 'HRM_Employees', empId, `Employee ${empData.EMP_Name_EN} created`, 'INFO');
    
    return createResponse_(true, { empId: empId }, 'Employee created successfully', []);
    
  } catch (error) {
    logError_(actor, 'Create', 'HRM_Employees', 'NEW', 'Failed to create employee', error);
    return createResponse_(false, null, error.message, ['CREATE_FAILED']);
  }
}

/**
 * Gets employee by ID
 * @param {string} empId - Employee ID
 * @param {string} userId - Acting user ID
 * @returns {Object} - Response object
 */
function getEmployeeById(empId, userId) {
  const actor = getCurrentUser_();
  
  try {
    // Permission check
    ensurePermission_(userId, 'View_Employee');
    
    if (isEmpty_(empId)) {
      throw new Error('Employee ID is required');
    }
    
    const employees = getSheetData_('HRM_Employees', 1);
    const employee = employees.find(emp => emp.EMP_ID === empId);
    
    if (!employee) {
      throw new Error('Employee not found');
    }
    
    logInfo_(actor, 'Read', 'HRM_Employees', empId, 'Employee retrieved');
    
    return createResponse_(true, employee, 'Employee retrieved', []);
    
  } catch (error) {
    logError_(actor, 'Read', 'HRM_Employees', empId, 'Failed to get employee', error);
    return createResponse_(false, null, error.message, ['READ_FAILED']);
  }
}

/**
 * Lists all employees with optional filtering
 * @param {string} status - Filter by status (Active, Inactive, All)
 * @param {string} department - Filter by department (optional)
 * @param {number} page - Page number (default 1)
 * @param {number} pageSize - Items per page (default 50)
 * @param {string} userId - Acting user ID
 * @returns {Object} - Response object with employees array
 */
function listEmployees(status = 'All', department = null, page = 1, pageSize = 50, userId) {
  const actor = getCurrentUser_();
  
  try {
    // Permission check
    ensurePermission_(userId, 'View_Employee');
    
    const allEmployees = getSheetData_('HRM_Employees', 1);
    
    // Filter by status
    let filtered = allEmployees;
    if (status !== 'All') {
      filtered = filtered.filter(emp => emp.EMP_Status === status);
    }
    
    // Filter by department if provided
    if (!isEmpty_(department)) {
      filtered = filtered.filter(emp => emp.DEPT_Name === department);
    }
    
    // Pagination
    const totalCount = filtered.length;
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const paginatedEmployees = filtered.slice(start, end);
    
    logInfo_(actor, 'List', 'HRM_Employees', 'N/A', `Retrieved ${paginatedEmployees.length} of ${totalCount} employees`);
    
    return createResponse_(true, {
      employees: paginatedEmployees,
      pagination: {
        page: page,
        pageSize: pageSize,
        totalCount: totalCount,
        totalPages: Math.ceil(totalCount / pageSize)
      }
    }, 'Employees retrieved', []);
    
  } catch (error) {
    logError_(actor, 'List', 'HRM_Employees', 'N/A', 'Failed to list employees', error);
    return createResponse_(false, null, error.message, ['LIST_FAILED']);
  }
}

/**
 * Updates an employee
 * @param {string} empId - Employee ID
 * @param {Object} updates - Fields to update
 * @param {string} userId - Acting user ID
 * @returns {Object} - Response object
 */
function updateEmployee(empId, updates, userId) {
  const actor = getCurrentUser_();
  
  try {
    // Permission check
    ensurePermission_(userId, 'Edit_Employee');
    
    if (isEmpty_(empId)) {
      throw new Error('Employee ID is required');
    }
    
    if (!updates || Object.keys(updates).length === 0) {
      throw new Error('No updates provided');
    }
    
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const empSheet = ss.getSheetByName('HRM_Employees');
    
    if (!empSheet) {
      throw new Error('HRM_Employees sheet not found');
    }
    
    const data = empSheet.getDataRange().getValues();
    const headers = data[0];
    const idCol = headers.indexOf('EMP_ID');
    
    if (idCol === -1) {
      throw new Error('EMP_ID column not found');
    }
    
    // Find employee row
    let rowIndex = -1;
    for (let i = 2; i < data.length; i++) {
      if (data[i][idCol] === empId) {
        rowIndex = i;
        break;
      }
    }
    
    if (rowIndex === -1) {
      throw new Error('Employee not found');
    }
    
    // Apply updates
    const timestamp = new Date();
    const updatedFields = [];
    
    for (const [field, value] of Object.entries(updates)) {
      const colIndex = headers.indexOf(field);
      if (colIndex !== -1 && field !== 'EMP_ID' && field !== 'EMP_Crt_At' && field !== 'EMP_Crt_By') {
        empSheet.getRange(rowIndex + 1, colIndex + 1).setValue(value);
        updatedFields.push(field);
      }
    }
    
    // Update metadata
    const updAtCol = headers.indexOf('EMP_Upd_At');
    const updByCol = headers.indexOf('EMP_Upd_By');
    
    if (updAtCol !== -1) {
      empSheet.getRange(rowIndex + 1, updAtCol + 1).setValue(timestamp);
    }
    if (updByCol !== -1) {
      empSheet.getRange(rowIndex + 1, updByCol + 1).setValue(actor);
    }
    
    logInfo_(actor, 'Update', 'HRM_Employees', empId, `Employee updated: ${updatedFields.join(', ')}`);
    writeToAuditLog_(actor, 'Update', 'HRM_Employees', empId, `Updated fields: ${updatedFields.join(', ')}`, 'INFO');
    
    return createResponse_(true, { empId: empId, updatedFields: updatedFields }, 'Employee updated successfully', []);
    
  } catch (error) {
    logError_(actor, 'Update', 'HRM_Employees', empId, 'Failed to update employee', error);
    return createResponse_(false, null, error.message, ['UPDATE_FAILED']);
  }
}

/**
 * Deactivates an employee (soft delete)
 * @param {string} empId - Employee ID
 * @param {string} userId - Acting user ID
 * @returns {Object} - Response object
 */
function deactivateEmployee(empId, userId) {
  const actor = getCurrentUser_();
  
  try {
    // Permission check
    ensurePermission_(userId, 'Delete_Employee');
    
    const result = updateEmployee(empId, { EMP_Status: 'Inactive' }, userId);
    
    if (result.success) {
      logInfo_(actor, 'Deactivate', 'HRM_Employees', empId, 'Employee deactivated');
      writeToAuditLog_(actor, 'Deactivate', 'HRM_Employees', empId, 'Employee set to Inactive', 'INFO');
    }
    
    return result;
    
  } catch (error) {
    logError_(actor, 'Deactivate', 'HRM_Employees', empId, 'Failed to deactivate employee', error);
    return createResponse_(false, null, error.message, ['DEACTIVATE_FAILED']);
  }
}

/**
 * Activates an employee
 * @param {string} empId - Employee ID
 * @param {string} userId - Acting user ID
 * @returns {Object} - Response object
 */
function activateEmployee(empId, userId) {
  const actor = getCurrentUser_();
  
  try {
    // Permission check
    ensurePermission_(userId, 'Edit_Employee');
    
    const result = updateEmployee(empId, { EMP_Status: 'Active' }, userId);
    
    if (result.success) {
      logInfo_(actor, 'Activate', 'HRM_Employees', empId, 'Employee activated');
      writeToAuditLog_(actor, 'Activate', 'HRM_Employees', empId, 'Employee set to Active', 'INFO');
    }
    
    return result;
    
  } catch (error) {
    logError_(actor, 'Activate', 'HRM_Employees', empId, 'Failed to activate employee', error);
    return createResponse_(false, null, error.message, ['ACTIVATE_FAILED']);
  }
}

/**
 * Helper: Check if employee exists by National ID
 * @private
 */
function employeeExistsByNationalId_(nationalId) {
  try {
    const employees = getSheetData_('HRM_Employees', 1);
    return employees.some(emp => emp.National_ID === nationalId);
  } catch (error) {
    logError_('System', 'employeeExistsByNationalId_', 'HRM_Employees', 'N/A', 'Failed to check National ID', error);
    return false;
  }
}

/**
 * Helper: Get employee by National ID
 * @private
 */
function getEmployeeByNationalId_(nationalId) {
  try {
    const employees = getSheetData_('HRM_Employees', 1);
    return employees.find(emp => emp.National_ID === nationalId) || null;
  } catch (error) {
    logError_('System', 'getEmployeeByNationalId_', 'HRM_Employees', 'N/A', 'Failed to get employee by National ID', error);
    return null;
  }
}
