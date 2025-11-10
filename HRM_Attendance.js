/** =========================================================
 *  NIJJARA ERP – HRM_ATTENDANCE MODULE
 *  Author: Mohamed / ChatGPT Assistant
 *  Purpose: Employee time tracking and attendance management
 *  ========================================================= */

/**
 * Records clock-in for an employee
 * @param {string} empId - Employee ID
 * @param {Date} checkInTime - Clock-in time (defaults to now)
 * @param {string} userId - Acting user ID
 * @returns {Object} - Response object
 */
function clockIn(empId, checkInTime = null, userId) {
  const actor = getCurrentUser_();
  
  try {
    // Permission check
    ensurePermission_(userId, 'Create_Attendance');
    
    if (isEmpty_(empId)) {
      throw new Error('Employee ID is required');
    }
    
    const timestamp = checkInTime || new Date();
    const dateOnly = new Date(timestamp.getFullYear(), timestamp.getMonth(), timestamp.getDate());
    
    // Check if already clocked in today
    const existingAttendance = getAttendanceByDate_(empId, dateOnly);
    if (existingAttendance) {
      throw new Error('Employee already clocked in today');
    }
    
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const attSheet = ss.getSheetByName('HRM_Attendance');
    
    if (!attSheet) {
      throw new Error('HRM_Attendance sheet not found');
    }
    
    const attId = generateId_('ATT');
    const createdAt = new Date();
    
    const rowData = [
      attId,                    // ATT_ID
      empId,                    // EMP_ID
      dateOnly,                 // ATT_Date
      timestamp,                // ATT_Check_In
      '',                       // ATT_Check_Out (empty until clock-out)
      '',                       // ATT_Hours
      '',                       // ATT_Late_Mints
      '',                       // ATT_EarlyLV_Mints
      '',                       // ATT_OT_Mints
      '',                       // ATT_Notes
      'Clocked In',             // ATT_Status
      createdAt,                // ATT_Crt_At
      actor,                    // ATT_Crt_By
      '',                       // ATT_Upd_At
      ''                        // ATT_Upd_By
    ];
    
    attSheet.appendRow(rowData);
    
    logInfo_(actor, 'ClockIn', 'HRM_Attendance', attId, `Employee ${empId} clocked in at ${timestamp}`);
    writeToAuditLog_(actor, 'ClockIn', 'HRM_Attendance', attId, `Clock-in for ${empId}`, 'INFO');
    
    return createResponse_(true, { attId: attId, checkInTime: timestamp }, 'Clocked in successfully', []);
    
  } catch (error) {
    logError_(actor, 'ClockIn', 'HRM_Attendance', empId, 'Failed to clock in', error);
    return createResponse_(false, null, error.message, ['CLOCKIN_FAILED']);
  }
}

/**
 * Records clock-out for an employee
 * @param {string} empId - Employee ID
 * @param {Date} checkOutTime - Clock-out time (defaults to now)
 * @param {string} userId - Acting user ID
 * @returns {Object} - Response object
 */
function clockOut(empId, checkOutTime = null, userId) {
  const actor = getCurrentUser_();
  
  try {
    // Permission check
    ensurePermission_(userId, 'Edit_Attendance');
    
    if (isEmpty_(empId)) {
      throw new Error('Employee ID is required');
    }
    
    const timestamp = checkOutTime || new Date();
    const dateOnly = new Date(timestamp.getFullYear(), timestamp.getMonth(), timestamp.getDate());
    
    // Find today's attendance record
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const attSheet = ss.getSheetByName('HRM_Attendance');
    
    if (!attSheet) {
      throw new Error('HRM_Attendance sheet not found');
    }
    
    const data = attSheet.getDataRange().getValues();
    const headers = data[0];
    
    const empIdCol = headers.indexOf('EMP_ID');
    const dateCol = headers.indexOf('ATT_Date');
    const checkInCol = headers.indexOf('ATT_Check_In');
    const checkOutCol = headers.indexOf('ATT_Check_Out');
    const hoursCol = headers.indexOf('ATT_Hours');
    const statusCol = headers.indexOf('ATT_Status');
    const updAtCol = headers.indexOf('ATT_Upd_At');
    const updByCol = headers.indexOf('ATT_Upd_By');
    const attIdCol = headers.indexOf('ATT_ID');
    
    let rowIndex = -1;
    let attId = null;
    let checkInTime = null;
    
    for (let i = 2; i < data.length; i++) {
      const rowDate = new Date(data[i][dateCol]);
      const rowDateOnly = new Date(rowDate.getFullYear(), rowDate.getMonth(), rowDate.getDate());
      
      if (data[i][empIdCol] === empId && rowDateOnly.getTime() === dateOnly.getTime()) {
        rowIndex = i;
        attId = data[i][attIdCol];
        checkInTime = new Date(data[i][checkInCol]);
        break;
      }
    }
    
    if (rowIndex === -1) {
      throw new Error('No clock-in record found for today. Please clock in first.');
    }
    
    // Check if already clocked out
    if (data[rowIndex][checkOutCol] !== '') {
      throw new Error('Already clocked out for today');
    }
    
    // Calculate hours worked
    const hoursWorked = (timestamp - checkInTime) / (1000 * 60 * 60); // in hours
    
    // Update the row
    attSheet.getRange(rowIndex + 1, checkOutCol + 1).setValue(timestamp);
    attSheet.getRange(rowIndex + 1, hoursCol + 1).setValue(hoursWorked.toFixed(2));
    attSheet.getRange(rowIndex + 1, statusCol + 1).setValue('Completed');
    attSheet.getRange(rowIndex + 1, updAtCol + 1).setValue(new Date());
    attSheet.getRange(rowIndex + 1, updByCol + 1).setValue(actor);
    
    logInfo_(actor, 'ClockOut', 'HRM_Attendance', attId, `Employee ${empId} clocked out at ${timestamp}. Hours: ${hoursWorked.toFixed(2)}`);
    writeToAuditLog_(actor, 'ClockOut', 'HRM_Attendance', attId, `Clock-out for ${empId}. Hours worked: ${hoursWorked.toFixed(2)}`, 'INFO');
    
    return createResponse_(true, { 
      attId: attId, 
      checkOutTime: timestamp, 
      hoursWorked: parseFloat(hoursWorked.toFixed(2))
    }, 'Clocked out successfully', []);
    
  } catch (error) {
    logError_(actor, 'ClockOut', 'HRM_Attendance', empId, 'Failed to clock out', error);
    return createResponse_(false, null, error.message, ['CLOCKOUT_FAILED']);
  }
}

/**
 * Updates attendance record with late/early/OT minutes
 * @param {string} attId - Attendance ID
 * @param {Object} updates - Fields to update
 * @param {string} userId - Acting user ID
 * @returns {Object} - Response object
 */
function updateAttendance(attId, updates, userId) {
  const actor = getCurrentUser_();
  
  try {
    // Permission check
    ensurePermission_(userId, 'Edit_Attendance');
    
    if (isEmpty_(attId)) {
      throw new Error('Attendance ID is required');
    }
    
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const attSheet = ss.getSheetByName('HRM_Attendance');
    
    if (!attSheet) {
      throw new Error('HRM_Attendance sheet not found');
    }
    
    const data = attSheet.getDataRange().getValues();
    const headers = data[0];
    const idCol = headers.indexOf('ATT_ID');
    
    let rowIndex = -1;
    for (let i = 2; i < data.length; i++) {
      if (data[i][idCol] === attId) {
        rowIndex = i;
        break;
      }
    }
    
    if (rowIndex === -1) {
      throw new Error('Attendance record not found');
    }
    
    // Apply updates
    const timestamp = new Date();
    const updatedFields = [];
    
    for (const [field, value] of Object.entries(updates)) {
      const colIndex = headers.indexOf(field);
      if (colIndex !== -1 && field !== 'ATT_ID' && field !== 'ATT_Crt_At' && field !== 'ATT_Crt_By') {
        attSheet.getRange(rowIndex + 1, colIndex + 1).setValue(value);
        updatedFields.push(field);
      }
    }
    
    // Update metadata
    const updAtCol = headers.indexOf('ATT_Upd_At');
    const updByCol = headers.indexOf('ATT_Upd_By');
    
    if (updAtCol !== -1) {
      attSheet.getRange(rowIndex + 1, updAtCol + 1).setValue(timestamp);
    }
    if (updByCol !== -1) {
      attSheet.getRange(rowIndex + 1, updByCol + 1).setValue(actor);
    }
    
    logInfo_(actor, 'Update', 'HRM_Attendance', attId, `Attendance updated: ${updatedFields.join(', ')}`);
    writeToAuditLog_(actor, 'Update', 'HRM_Attendance', attId, `Updated fields: ${updatedFields.join(', ')}`, 'INFO');
    
    return createResponse_(true, { attId: attId, updatedFields: updatedFields }, 'Attendance updated', []);
    
  } catch (error) {
    logError_(actor, 'Update', 'HRM_Attendance', attId, 'Failed to update attendance', error);
    return createResponse_(false, null, error.message, ['UPDATE_FAILED']);
  }
}

/**
 * Lists attendance records for an employee
 * @param {string} empId - Employee ID
 * @param {Date} startDate - Start date (optional)
 * @param {Date} endDate - End date (optional)
 * @param {string} userId - Acting user ID
 * @returns {Object} - Response object
 */
function listAttendance(empId, startDate = null, endDate = null, userId) {
  const actor = getCurrentUser_();
  
  try {
    // Permission check
    ensurePermission_(userId, 'View_Attendance');
    
    if (isEmpty_(empId)) {
      throw new Error('Employee ID is required');
    }
    
    const allAttendance = getSheetData_('HRM_Attendance', 1);
    let filtered = allAttendance.filter(att => att.EMP_ID === empId);
    
    // Filter by date range if provided
    if (startDate) {
      filtered = filtered.filter(att => new Date(att.ATT_Date) >= new Date(startDate));
    }
    if (endDate) {
      filtered = filtered.filter(att => new Date(att.ATT_Date) <= new Date(endDate));
    }
    
    // Sort by date descending
    filtered.sort((a, b) => new Date(b.ATT_Date) - new Date(a.ATT_Date));
    
    logInfo_(actor, 'List', 'HRM_Attendance', empId, `Retrieved ${filtered.length} attendance records`);
    
    return createResponse_(true, { attendance: filtered }, 'Attendance records retrieved', []);
    
  } catch (error) {
    logError_(actor, 'List', 'HRM_Attendance', empId, 'Failed to list attendance', error);
    return createResponse_(false, null, error.message, ['LIST_FAILED']);
  }
}

/**
 * Helper: Get attendance record by employee and date
 * @private
 */
function getAttendanceByDate_(empId, date) {
  try {
    const allAttendance = getSheetData_('HRM_Attendance', 1);
    return allAttendance.find(att => {
      if (att.EMP_ID !== empId) return false;
      const attDate = new Date(att.ATT_Date);
      const attDateOnly = new Date(attDate.getFullYear(), attDate.getMonth(), attDate.getDate());
      return attDateOnly.getTime() === date.getTime();
    }) || null;
  } catch (error) {
    logError_('System', 'getAttendanceByDate_', 'HRM_Attendance', empId, 'Failed to get attendance by date', error);
    return null;
  }
}
