/** =========================================================
 *  NIJJARA ERP – HRM_LEAVE MODULE
 *  Author: Mohamed / ChatGPT Assistant
 *  Purpose: Employee leave request management with policy integration
 *  ========================================================= */

/**
 * Creates a leave request
 * @param {Object} leaveData - Leave request data
 * @param {string} userId - Acting user ID
 * @returns {Object} - Response object
 */
function createLeaveRequest(leaveData, userId) {
  const actor = getCurrentUser_();
  
  try {
    // Permission check
    ensurePermission_(userId, 'Create_Leave');
    
    logInfo_(actor, 'Create', 'HRM_Leave', 'NEW', 'Creating leave request');
    
    // Validate required fields
    if (isEmpty_(leaveData.EMP_ID)) {
      throw new Error('Employee ID is required');
    }
    
    if (isEmpty_(leaveData.LV_Type)) {
      throw new Error('Leave type is required');
    }
    
    if (isEmpty_(leaveData.LV_Start_Date) || isEmpty_(leaveData.LV_End_Date)) {
      throw new Error('Start and end dates are required');
    }
    
    // Validate leave type exists in policy
    const leaveTypes = getLeaveTypes_();
    const validType = leaveTypes.find(lt => lt.LV_Type_Name === leaveData.LV_Type);
    
    if (!validType) {
      throw new Error(`Invalid leave type: ${leaveData.LV_Type}. Please check POLICY_Leave_Types sheet.`);
    }
    
    // Calculate number of days
    const startDate = new Date(leaveData.LV_Start_Date);
    const endDate = new Date(leaveData.LV_End_Date);
    const numDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
    
    if (numDays <= 0) {
      throw new Error('End date must be after start date');
    }
    
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const leaveSheet = ss.getSheetByName('HRM_Leave');
    
    if (!leaveSheet) {
      throw new Error('HRM_Leave sheet not found');
    }
    
    const leaveId = generateId_('LV');
    const timestamp = new Date();
    
    const rowData = [
      leaveId,                              // LV_ID
      leaveData.EMP_ID || '',               // EMP_ID
      leaveData.LV_Type || '',              // LV_Type
      leaveData.LV_Start_Date || '',        // LV_Start_Date
      leaveData.LV_End_Date || '',          // LV_End_Date
      numDays,                              // LV_NumDays
      'Pending',                            // LV_Status
      leaveData.LV_Reason || '',            // LV_Reason
      '',                                   // LV_Approved_By (empty until approved)
      leaveData.LV_Notes || '',             // LV_Notes
      timestamp,                            // LV_Crt_At
      actor,                                // LV_Crt_By
      '',                                   // LV_Upd_At
      ''                                    // LV_Upd_By
    ];
    
    leaveSheet.appendRow(rowData);
    
    logInfo_(actor, 'Create', 'HRM_Leave', leaveId, `Leave request created for ${leaveData.EMP_ID}: ${numDays} days`);
    writeToAuditLog_(actor, 'Create', 'HRM_Leave', leaveId, `Leave request: ${leaveData.LV_Type}, ${numDays} days`, 'INFO');
    
    return createResponse_(true, { leaveId: leaveId, numDays: numDays }, 'Leave request created', []);
    
  } catch (error) {
    logError_(actor, 'Create', 'HRM_Leave', 'NEW', 'Failed to create leave request', error);
    return createResponse_(false, null, error.message, ['CREATE_FAILED']);
  }
}

/**
 * Approves a leave request
 * @param {string} leaveId - Leave ID
 * @param {string} userId - Acting user ID (approver)
 * @returns {Object} - Response object
 */
function approveLeave(leaveId, userId) {
  const actor = getCurrentUser_();
  
  try {
    // Permission check
    ensurePermission_(userId, 'Approve_Leave');
    
    if (isEmpty_(leaveId)) {
      throw new Error('Leave ID is required');
    }
    
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const leaveSheet = ss.getSheetByName('HRM_Leave');
    
    if (!leaveSheet) {
      throw new Error('HRM_Leave sheet not found');
    }
    
    const data = leaveSheet.getDataRange().getValues();
    const headers = data[0];
    const idCol = headers.indexOf('LV_ID');
    const statusCol = headers.indexOf('LV_Status');
    const approvedByCol = headers.indexOf('LV_Approved_By');
    const updAtCol = headers.indexOf('LV_Upd_At');
    const updByCol = headers.indexOf('LV_Upd_By');
    
    let rowIndex = -1;
    for (let i = 2; i < data.length; i++) {
      if (data[i][idCol] === leaveId) {
        rowIndex = i;
        break;
      }
    }
    
    if (rowIndex === -1) {
      throw new Error('Leave request not found');
    }
    
    // Check current status
    const currentStatus = data[rowIndex][statusCol];
    if (currentStatus === 'Approved') {
      throw new Error('Leave request already approved');
    }
    if (currentStatus === 'Rejected') {
      throw new Error('Cannot approve a rejected leave request');
    }
    
    // Update status
    const timestamp = new Date();
    leaveSheet.getRange(rowIndex + 1, statusCol + 1).setValue('Approved');
    leaveSheet.getRange(rowIndex + 1, approvedByCol + 1).setValue(actor);
    leaveSheet.getRange(rowIndex + 1, updAtCol + 1).setValue(timestamp);
    leaveSheet.getRange(rowIndex + 1, updByCol + 1).setValue(actor);
    
    logInfo_(actor, 'Approve', 'HRM_Leave', leaveId, 'Leave request approved');
    writeToAuditLog_(actor, 'Approve', 'HRM_Leave', leaveId, `Leave approved by ${actor}`, 'INFO');
    
    return createResponse_(true, { leaveId: leaveId }, 'Leave request approved', []);
    
  } catch (error) {
    logError_(actor, 'Approve', 'HRM_Leave', leaveId, 'Failed to approve leave', error);
    return createResponse_(false, null, error.message, ['APPROVE_FAILED']);
  }
}

/**
 * Rejects a leave request
 * @param {string} leaveId - Leave ID
 * @param {string} reason - Rejection reason
 * @param {string} userId - Acting user ID
 * @returns {Object} - Response object
 */
function rejectLeave(leaveId, reason, userId) {
  const actor = getCurrentUser_();
  
  try {
    // Permission check
    ensurePermission_(userId, 'Approve_Leave');
    
    if (isEmpty_(leaveId)) {
      throw new Error('Leave ID is required');
    }
    
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const leaveSheet = ss.getSheetByName('HRM_Leave');
    
    if (!leaveSheet) {
      throw new Error('HRM_Leave sheet not found');
    }
    
    const data = leaveSheet.getDataRange().getValues();
    const headers = data[0];
    const idCol = headers.indexOf('LV_ID');
    const statusCol = headers.indexOf('LV_Status');
    const notesCol = headers.indexOf('LV_Notes');
    const updAtCol = headers.indexOf('LV_Upd_At');
    const updByCol = headers.indexOf('LV_Upd_By');
    
    let rowIndex = -1;
    for (let i = 2; i < data.length; i++) {
      if (data[i][idCol] === leaveId) {
        rowIndex = i;
        break;
      }
    }
    
    if (rowIndex === -1) {
      throw new Error('Leave request not found');
    }
    
    const currentStatus = data[rowIndex][statusCol];
    if (currentStatus === 'Approved') {
      throw new Error('Cannot reject an approved leave request');
    }
    
    // Update status and add rejection reason to notes
    const timestamp = new Date();
    const existingNotes = data[rowIndex][notesCol] || '';
    const rejectionNote = `Rejected by ${actor}: ${reason}`;
    const updatedNotes = existingNotes ? `${existingNotes}\n${rejectionNote}` : rejectionNote;
    
    leaveSheet.getRange(rowIndex + 1, statusCol + 1).setValue('Rejected');
    leaveSheet.getRange(rowIndex + 1, notesCol + 1).setValue(updatedNotes);
    leaveSheet.getRange(rowIndex + 1, updAtCol + 1).setValue(timestamp);
    leaveSheet.getRange(rowIndex + 1, updByCol + 1).setValue(actor);
    
    logInfo_(actor, 'Reject', 'HRM_Leave', leaveId, 'Leave request rejected');
    writeToAuditLog_(actor, 'Reject', 'HRM_Leave', leaveId, `Leave rejected: ${reason}`, 'INFO');
    
    return createResponse_(true, { leaveId: leaveId }, 'Leave request rejected', []);
    
  } catch (error) {
    logError_(actor, 'Reject', 'HRM_Leave', leaveId, 'Failed to reject leave', error);
    return createResponse_(false, null, error.message, ['REJECT_FAILED']);
  }
}

/**
 * Lists leave requests with optional filtering
 * @param {string} empId - Employee ID (optional)
 * @param {string} status - Status filter (Pending, Approved, Rejected, All)
 * @param {string} userId - Acting user ID
 * @returns {Object} - Response object
 */
function listLeaveRequests(empId = null, status = 'All', userId) {
  const actor = getCurrentUser_();
  
  try {
    // Permission check
    ensurePermission_(userId, 'View_Leave');
    
    const allLeave = getSheetData_('HRM_Leave', 1);
    let filtered = allLeave;
    
    // Filter by employee if provided
    if (!isEmpty_(empId)) {
      filtered = filtered.filter(lv => lv.EMP_ID === empId);
    }
    
    // Filter by status
    if (status !== 'All') {
      filtered = filtered.filter(lv => lv.LV_Status === status);
    }
    
    // Sort by date descending
    filtered.sort((a, b) => new Date(b.LV_Crt_At) - new Date(a.LV_Crt_At));
    
    logInfo_(actor, 'List', 'HRM_Leave', empId || 'ALL', `Retrieved ${filtered.length} leave requests`);
    
    return createResponse_(true, { leaveRequests: filtered }, 'Leave requests retrieved', []);
    
  } catch (error) {
    logError_(actor, 'List', 'HRM_Leave', empId || 'ALL', 'Failed to list leave requests', error);
    return createResponse_(false, null, error.message, ['LIST_FAILED']);
  }
}

/**
 * Helper: Get available leave types from policy
 * @private
 */
function getLeaveTypes_() {
  try {
    const leaveTypes = getSheetData_('POLICY_Leave_Types', 1);
    return leaveTypes;
  } catch (error) {
    logError_('System', 'getLeaveTypes_', 'POLICY_Leave_Types', 'N/A', 'Failed to get leave types', error);
    return [];
  }
}

/**
 * Get leave balance for an employee by type
 * @param {string} empId - Employee ID
 * @param {string} leaveType - Leave type
 * @param {string} userId - Acting user ID
 * @returns {Object} - Response with balance info
 */
function getLeaveBalance(empId, leaveType, userId) {
  const actor = getCurrentUser_();
  
  try {
    // Permission check
    ensurePermission_(userId, 'View_Leave');
    
    if (isEmpty_(empId) || isEmpty_(leaveType)) {
      throw new Error('Employee ID and leave type are required');
    }
    
    // Get policy info
    const leaveTypes = getLeaveTypes_();
    const policy = leaveTypes.find(lt => lt.LV_Type_Name === leaveType);
    
    if (!policy) {
      throw new Error('Leave type not found in policy');
    }
    
    const annualAllowance = policy.LV_Allowance_Days || 0;
    
    // Get approved leaves for current year
    const currentYear = new Date().getFullYear();
    const allLeave = getSheetData_('HRM_Leave', 1);
    const approvedLeaves = allLeave.filter(lv => {
      if (lv.EMP_ID !== empId || lv.LV_Type !== leaveType || lv.LV_Status !== 'Approved') {
        return false;
      }
      const leaveYear = new Date(lv.LV_Start_Date).getFullYear();
      return leaveYear === currentYear;
    });
    
    const usedDays = approvedLeaves.reduce((sum, lv) => sum + (lv.LV_NumDays || 0), 0);
    const remainingDays = annualAllowance - usedDays;
    
    logInfo_(actor, 'GetBalance', 'HRM_Leave', empId, `Leave balance: ${remainingDays} of ${annualAllowance} days`);
    
    return createResponse_(true, {
      empId: empId,
      leaveType: leaveType,
      annualAllowance: annualAllowance,
      usedDays: usedDays,
      remainingDays: remainingDays
    }, 'Leave balance retrieved', []);
    
  } catch (error) {
    logError_(actor, 'GetBalance', 'HRM_Leave', empId, 'Failed to get leave balance', error);
    return createResponse_(false, null, error.message, ['BALANCE_FAILED']);
  }
}
