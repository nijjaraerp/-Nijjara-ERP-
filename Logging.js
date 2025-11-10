/** =========================================================
 *  NIJJARA ERP – CENTRALIZED LOGGING MODULE
 *  Author: Mohamed / ChatGPT Assistant
 *  Purpose: Loud logging for all server operations
 *           Writes to: Apps Script Logger + SYS_Audit_Log
 *  ========================================================= */

/**
 * Logs an INFO level event
 * @param {string} actor - Who is performing the action (username or 'System')
 * @param {string} action - The action being performed (e.g., 'Create', 'Update', 'Login')
 * @param {string} entity - The entity being acted upon (e.g., 'PRJ_Main', 'SYS_Users')
 * @param {string} id - The ID of the entity (or 'N/A')
 * @param {string} details - Additional details about the action
 */
function logInfo_(actor, action, entity, id, details) {
  const timestamp = new Date().toLocaleString();
  const message = `[SERVER][INFO] ${timestamp} actor=${actor} action=${action} entity=${entity} id=${id} details='${details}'`;
  
  Logger.log(message);
  console.log(message);
  
  // Also write to audit log if appropriate
  if (shouldAudit_(action)) {
    writeToAuditLog_(actor, action, entity, id, details, 'INFO');
  }
}

/**
 * Logs an ERROR level event
 * @param {string} actor - Who was attempting the action
 * @param {string} action - The action that failed
 * @param {string} entity - The entity being acted upon
 * @param {string} id - The ID of the entity (or 'N/A')
 * @param {string} message - Error message
 * @param {Error|Object} errorObject - The error object (optional)
 */
function logError_(actor, action, entity, id, message, errorObject) {
  const timestamp = new Date().toLocaleString();
  const stack = errorObject ? (errorObject.stack || JSON.stringify(errorObject)) : 'N/A';
  const logMessage = `[SERVER][ERROR] ${timestamp} actor=${actor} action=${action} entity=${entity} id=${id} message='${message}' stack='${stack}'`;
  
  Logger.log(logMessage);
  console.error(logMessage);
  
  // Always write errors to audit log
  writeToAuditLog_(actor, action, entity, id, `ERROR: ${message}`, 'ERROR');
}

/**
 * Logs a WARNING level event
 * @param {string} actor - Who is performing the action
 * @param {string} action - The action being performed
 * @param {string} entity - The entity being acted upon
 * @param {string} id - The ID of the entity (or 'N/A')
 * @param {string} details - Warning details
 */
function logWarn_(actor, action, entity, id, details) {
  const timestamp = new Date().toLocaleString();
  const message = `[SERVER][WARN] ${timestamp} actor=${actor} action=${action} entity=${entity} id=${id} details='${details}'`;
  
  Logger.log(message);
  console.warn(message);
  
  if (shouldAudit_(action)) {
    writeToAuditLog_(actor, action, entity, id, details, 'WARN');
  }
}

/**
 * Determines if an action should be written to the audit log
 * @param {string} action - The action to check
 * @returns {boolean}
 */
function shouldAudit_(action) {
  const auditableActions = [
    'Create', 'Update', 'Delete', 'Login', 'Logout', 
    'Approve', 'Reject', 'Lock', 'Unlock', 'Assign',
    'Revoke', 'Grant', 'Deactivate', 'Activate'
  ];
  return auditableActions.includes(action);
}

/**
 * Writes an entry to SYS_Audit_Log sheet
 * @param {string} actor - The user performing the action
 * @param {string} action - The action performed
 * @param {string} entity - The entity affected
 * @param {string} entityId - The ID of the entity
 * @param {string} details - Additional details
 * @param {string} level - Log level (INFO, WARN, ERROR)
 */
function writeToAuditLog_(actor, action, entity, entityId, details, level) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const auditSheet = ss.getSheetByName('SYS_Audit_Log');
    
    if (!auditSheet) {
      console.warn('[SERVER][WARN] SYS_Audit_Log sheet not found. Skipping audit entry.');
      return;
    }
    
    const timestamp = new Date();
    const auditId = `AUD-${timestamp.getTime()}`;
    const sheetId = ss.getId();
    const sheetName = ss.getName();
    const ipAddress = 'N/A'; // Apps Script doesn't provide direct IP access
    
    // Column mapping based on Setup.js schema:
    // AUD_ID, AUD_Time_Stamp, USR_ID, USR_Name, USR_ACTion, ACT_Details, 
    // AUD_Entity, AUD_Entity_ID, AUD_Scope, AUD_Sheet_ID, AUD_Sheet_Name, IP_Address
    
    const rowData = [
      auditId,           // AUD_ID
      timestamp,         // AUD_Time_Stamp
      actor,             // USR_ID (or actor name)
      actor,             // USR_Name
      action,            // USR_ACTion
      details,           // ACT_Details
      entity,            // AUD_Entity
      entityId,          // AUD_Entity_ID
      level,             // AUD_Scope (using level as scope)
      sheetId,           // AUD_Sheet_ID
      sheetName,         // AUD_Sheet_Name
      ipAddress          // IP_Address
    ];
    
    auditSheet.appendRow(rowData);
  } catch (error) {
    // If audit logging fails, only log to console to avoid recursion
    console.error(`[SERVER][ERROR] Failed to write to audit log: ${error.message}`);
  }
}

/**
 * Creates a structured audit entry for important operations
 * @param {Object} params - Audit parameters
 * @returns {Object} - Audit result
 */
function auditAction(params) {
  const {
    actor,
    action,
    entity,
    entityId,
    details,
    success = true
  } = params;
  
  if (success) {
    logInfo_(actor, action, entity, entityId, details);
  } else {
    logError_(actor, action, entity, entityId, details, null);
  }
  
  return {
    success: success,
    timestamp: new Date(),
    actor: actor,
    action: action,
    entity: entity,
    entityId: entityId
  };
}

/**
 * Gets the current user email (for logging purposes)
 * @returns {string} - User email or 'System'
 */
function getCurrentUser_() {
  try {
    return Session.getActiveUser().getEmail() || Session.getEffectiveUser().getEmail() || 'System';
  } catch (error) {
    return 'System';
  }
}

/**
 * Logs function execution time (for performance monitoring)
 * @param {string} functionName - Name of the function
 * @param {Function} callback - Function to execute
 * @returns {*} - Result of the callback
 */
function logExecutionTime_(functionName, callback) {
  const startTime = new Date().getTime();
  const actor = getCurrentUser_();
  
  logInfo_(actor, 'Start', 'Function', functionName, `Execution started`);
  
  try {
    const result = callback();
    const endTime = new Date().getTime();
    const duration = endTime - startTime;
    
    logInfo_(actor, 'Complete', 'Function', functionName, `Execution completed in ${duration}ms`);
    return result;
  } catch (error) {
    const endTime = new Date().getTime();
    const duration = endTime - startTime;
    
    logError_(actor, 'Failed', 'Function', functionName, `Execution failed after ${duration}ms`, error);
    throw error;
  }
}
