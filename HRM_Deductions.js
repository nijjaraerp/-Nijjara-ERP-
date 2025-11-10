/** =========================================================
 *  NIJJARA ERP – HRM_DEDUCTIONS MODULE
 *  Author: Mohamed / ChatGPT Assistant
 *  Purpose: Employee deductions with POLICY_Penalties integration
 *  ========================================================= */

/**
 * Creates a deduction entry (linked to penalty policy)
 * @param {Object} deductData - Deduction data
 * @param {string} userId - Acting user ID
 * @returns {Object} - Response object
 */
function createDeduction(deductData, userId) {
  const actor = getCurrentUser_();
  
  try {
    // Permission check
    ensurePermission_(userId, 'Create_Deduction');
    
    logInfo_(actor, 'Create', 'HRM_Deductions', 'NEW', 'Creating deduction');
    
    // Validate required fields
    if (isEmpty_(deductData.EMP_ID)) {
      throw new Error('Employee ID is required');
    }
    
    if (isEmpty_(deductData.PEN_ID)) {
      throw new Error('Penalty ID is required');
    }
    
    // Get penalty details from POLICY_Penalties
    const penalty = getPenaltyById_(deductData.PEN_ID);
    
    if (!penalty) {
      throw new Error(`Penalty not found: ${deductData.PEN_ID}. Please check POLICY_Penalties sheet.`);
    }
    
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const deductSheet = ss.getSheetByName('HRM_Deductions');
    
    if (!deductSheet) {
      throw new Error('HRM_Deductions sheet not found');
    }
    
    const deductId = generateId_('DEDCT');
    const timestamp = new Date();
    
    // Use penalty amount or override if provided
    const deductAmount = deductData.DEDCT_Amnt || penalty.PEN_Amnt || 0;
    
    const rowData = [
      deductId,                             // DEDCT_ID
      deductData.PEN_ID || '',              // PEN_ID
      penalty.PEN_Name || '',               // PEN_Name (from policy)
      deductData.EMP_ID || '',              // EMP_ID
      deductData.DEDCT_Date || new Date(), // DEDCT_Date
      deductAmount,                         // DEDCT_Amnt
      timestamp,                            // DEDCT_Crt_At
      actor,                                // DEDCT_Crt_By
      '',                                   // DEDCT_Upd_At
      ''                                    // DEDCT_Upd_By
    ];
    
    deductSheet.appendRow(rowData);
    
    logInfo_(actor, 'Create', 'HRM_Deductions', deductId, `Deduction created for ${deductData.EMP_ID}: ${penalty.PEN_Name} (${deductAmount})`);
    writeToAuditLog_(actor, 'Create', 'HRM_Deductions', deductId, `Deduction: ${penalty.PEN_Name}, Amount: ${deductAmount}`, 'INFO');
    
    return createResponse_(true, { 
      deductId: deductId, 
      penaltyName: penalty.PEN_Name,
      amount: deductAmount 
    }, 'Deduction created', []);
    
  } catch (error) {
    logError_(actor, 'Create', 'HRM_Deductions', 'NEW', 'Failed to create deduction', error);
    return createResponse_(false, null, error.message, ['CREATE_FAILED']);
  }
}

/**
 * Lists deductions for an employee
 * @param {string} empId - Employee ID (optional)
 * @param {Date} startDate - Start date (optional)
 * @param {Date} endDate - End date (optional)
 * @param {string} userId - Acting user ID
 * @returns {Object} - Response object
 */
function listDeductions(empId = null, startDate = null, endDate = null, userId) {
  const actor = getCurrentUser_();
  
  try {
    // Permission check
    ensurePermission_(userId, 'View_Deduction');
    
    const allDeductions = getSheetData_('HRM_Deductions', 1);
    let filtered = allDeductions;
    
    // Filter by employee if provided
    if (!isEmpty_(empId)) {
      filtered = filtered.filter(ded => ded.EMP_ID === empId);
    }
    
    // Filter by date range if provided
    if (startDate) {
      filtered = filtered.filter(ded => new Date(ded.DEDCT_Date) >= new Date(startDate));
    }
    if (endDate) {
      filtered = filtered.filter(ded => new Date(ded.DEDCT_Date) <= new Date(endDate));
    }
    
    // Sort by date descending
    filtered.sort((a, b) => new Date(b.DEDCT_Date) - new Date(a.DEDCT_Date));
    
    // Calculate total
    const totalAmount = filtered.reduce((sum, ded) => sum + (parseFloat(ded.DEDCT_Amnt) || 0), 0);
    
    logInfo_(actor, 'List', 'HRM_Deductions', empId || 'ALL', `Retrieved ${filtered.length} deductions. Total: ${totalAmount}`);
    
    return createResponse_(true, { 
      deductions: filtered,
      totalAmount: totalAmount,
      count: filtered.length
    }, 'Deductions retrieved', []);
    
  } catch (error) {
    logError_(actor, 'List', 'HRM_Deductions', empId || 'ALL', 'Failed to list deductions', error);
    return createResponse_(false, null, error.message, ['LIST_FAILED']);
  }
}

/**
 * Updates a deduction entry
 * @param {string} deductId - Deduction ID
 * @param {Object} updates - Fields to update
 * @param {string} userId - Acting user ID
 * @returns {Object} - Response object
 */
function updateDeduction(deductId, updates, userId) {
  const actor = getCurrentUser_();
  
  try {
    // Permission check
    ensurePermission_(userId, 'Edit_Deduction');
    
    if (isEmpty_(deductId)) {
      throw new Error('Deduction ID is required');
    }
    
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const deductSheet = ss.getSheetByName('HRM_Deductions');
    
    if (!deductSheet) {
      throw new Error('HRM_Deductions sheet not found');
    }
    
    const data = deductSheet.getDataRange().getValues();
    const headers = data[0];
    const idCol = headers.indexOf('DEDCT_ID');
    
    let rowIndex = -1;
    for (let i = 2; i < data.length; i++) {
      if (data[i][idCol] === deductId) {
        rowIndex = i;
        break;
      }
    }
    
    if (rowIndex === -1) {
      throw new Error('Deduction not found');
    }
    
    // Apply updates
    const timestamp = new Date();
    const updatedFields = [];
    
    for (const [field, value] of Object.entries(updates)) {
      const colIndex = headers.indexOf(field);
      if (colIndex !== -1 && field !== 'DEDCT_ID' && field !== 'DEDCT_Crt_At' && field !== 'DEDCT_Crt_By') {
        deductSheet.getRange(rowIndex + 1, colIndex + 1).setValue(value);
        updatedFields.push(field);
      }
    }
    
    // Update metadata
    const updAtCol = headers.indexOf('DEDCT_Upd_At');
    const updByCol = headers.indexOf('DEDCT_Upd_By');
    
    if (updAtCol !== -1) {
      deductSheet.getRange(rowIndex + 1, updAtCol + 1).setValue(timestamp);
    }
    if (updByCol !== -1) {
      deductSheet.getRange(rowIndex + 1, updByCol + 1).setValue(actor);
    }
    
    logInfo_(actor, 'Update', 'HRM_Deductions', deductId, `Deduction updated: ${updatedFields.join(', ')}`);
    writeToAuditLog_(actor, 'Update', 'HRM_Deductions', deductId, `Updated fields: ${updatedFields.join(', ')}`, 'INFO');
    
    return createResponse_(true, { deductId: deductId, updatedFields: updatedFields }, 'Deduction updated', []);
    
  } catch (error) {
    logError_(actor, 'Update', 'HRM_Deductions', deductId, 'Failed to update deduction', error);
    return createResponse_(false, null, error.message, ['UPDATE_FAILED']);
  }
}

/**
 * Deletes a deduction entry
 * @param {string} deductId - Deduction ID
 * @param {string} userId - Acting user ID
 * @returns {Object} - Response object
 */
function deleteDeduction(deductId, userId) {
  const actor = getCurrentUser_();
  
  try {
    // Permission check
    ensurePermission_(userId, 'Delete_Deduction');
    
    if (isEmpty_(deductId)) {
      throw new Error('Deduction ID is required');
    }
    
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const deductSheet = ss.getSheetByName('HRM_Deductions');
    
    if (!deductSheet) {
      throw new Error('HRM_Deductions sheet not found');
    }
    
    const data = deductSheet.getDataRange().getValues();
    const headers = data[0];
    const idCol = headers.indexOf('DEDCT_ID');
    
    for (let i = data.length - 1; i >= 2; i--) {
      if (data[i][idCol] === deductId) {
        deductSheet.deleteRow(i + 1);
        logInfo_(actor, 'Delete', 'HRM_Deductions', deductId, 'Deduction deleted');
        writeToAuditLog_(actor, 'Delete', 'HRM_Deductions', deductId, 'Deduction entry deleted', 'INFO');
        return createResponse_(true, null, 'Deduction deleted', []);
      }
    }
    
    throw new Error('Deduction not found');
    
  } catch (error) {
    logError_(actor, 'Delete', 'HRM_Deductions', deductId, 'Failed to delete deduction', error);
    return createResponse_(false, null, error.message, ['DELETE_FAILED']);
  }
}

/**
 * Helper: Get penalty details from POLICY_Penalties by ID
 * @private
 */
function getPenaltyById_(penaltyId) {
  try {
    const penalties = getSheetData_('POLICY_Penalties', 1);
    return penalties.find(pen => pen.PEN_ID === penaltyId) || null;
  } catch (error) {
    logError_('System', 'getPenaltyById_', 'POLICY_Penalties', penaltyId, 'Failed to get penalty', error);
    return null;
  }
}

/**
 * Lists all available penalties from policy
 * @param {string} userId - Acting user ID
 * @returns {Object} - Response object
 */
function listAvailablePenalties(userId) {
  const actor = getCurrentUser_();
  
  try {
    // Permission check
    ensurePermission_(userId, 'View_Deduction');
    
    const penalties = getSheetData_('POLICY_Penalties', 1);
    
    logInfo_(actor, 'List', 'POLICY_Penalties', 'N/A', `Retrieved ${penalties.length} penalties`);
    
    return createResponse_(true, { penalties: penalties }, 'Penalties retrieved', []);
    
  } catch (error) {
    logError_(actor, 'List', 'POLICY_Penalties', 'N/A', 'Failed to list penalties', error);
    return createResponse_(false, null, error.message, ['LIST_FAILED']);
  }
}

/**
 * Calculate total deductions for an employee in a period
 * @param {string} empId - Employee ID
 * @param {Date} startDate - Start date
 * @param {Date} endDate - End date
 * @param {string} userId - Acting user ID
 * @returns {Object} - Response with total amount
 */
function calculateTotalDeductions(empId, startDate, endDate, userId) {
  const actor = getCurrentUser_();
  
  try {
    // Permission check
    ensurePermission_(userId, 'View_Deduction');
    
    if (isEmpty_(empId)) {
      throw new Error('Employee ID is required');
    }
    
    const result = listDeductions(empId, startDate, endDate, userId);
    
    if (!result.success) {
      throw new Error(result.message);
    }
    
    logInfo_(actor, 'Calculate', 'HRM_Deductions', empId, `Total deductions: ${result.data.totalAmount}`);
    
    return createResponse_(true, {
      empId: empId,
      startDate: startDate,
      endDate: endDate,
      totalAmount: result.data.totalAmount,
      count: result.data.count
    }, 'Total deductions calculated', []);
    
  } catch (error) {
    logError_(actor, 'Calculate', 'HRM_Deductions', empId, 'Failed to calculate deductions', error);
    return createResponse_(false, null, error.message, ['CALCULATE_FAILED']);
  }
}
