/**
 * @file Logging.js
 * @description Centralized logging functions for the Nijjara ERP system.
 * This module provides structured logging for errors, info, and debug messages
 * to the 'SYS_Error_Log' sheet in the Google Sheet database.
 */

// --------------------------------------------------------------------------
// --- CONSTANTS ---
// --------------------------------------------------------------------------

const LOG_SHEET_NAME = 'SYS_Error_Log';

/**
 * Enum for log levels.
 * @readonly
 * @enum {string}
 */
const LOG_LEVEL = {
  DEBUG: 'DEBUG',
  INFO: 'INFO',
  WARN: 'WARN',
  ERROR: 'ERROR',
  CRITICAL: 'CRITICAL'
};

// --------------------------------------------------------------------------
// --- PUBLIC LOGGING FUNCTIONS ---
// --------------------------------------------------------------------------

/**
 * Logs an informational message.
 * Use this for general application flow events, like starting a process or
 * successful completion of a major step.
 *
 * @param {string} functionName - The name of the function where the event occurred.
 * @param {string} message - The informational message to log.
 */
function logInfo(functionName, message) {
  _log(LOG_LEVEL.INFO, functionName, message);
}

/**
 * Logs a warning message.
 * Use this for non-critical issues that should be noted, but don't prevent
 * the application from continuing.
 *
 * @param {string} functionName - The name of the function where the event occurred.
 * @param {string} message - The warning message to log.
 */
function logWarn(functionName, message) {
  _log(LOG_LEVEL.WARN, functionName, message);
}

/**
 * Logs an error message.
 * Use this for errors that are caught and handled but represent a failure
 * in a specific operation.
 *
 * @param {string} functionName - The name of the function where the error occurred.
 * @param {string} message - A descriptive error message.
 * @param {Error|Object|string} [errorObject] - The caught error object or related data.
 */
function logError(functionName, message, errorObject) {
  let details = message;
  if (errorObject) {
    // If errorObject is an Error, get its stack. Otherwise, stringify it.
    const errorDetails = errorObject instanceof Error ? errorObject.stack : JSON.stringify(errorObject, null, 2);
    details += ` | Details: ${errorDetails}`;
  }
  _log(LOG_LEVEL.ERROR, functionName, details);
}

// --------------------------------------------------------------------------
// --- PRIVATE CORE LOGGING ENGINE ---
// --------------------------------------------------------------------------

/**
 * Core logging engine that writes a structured entry to the log sheet.
 * It captures user context, timestamp, and formats the log entry.
 *
 * @private
 * @param {LOG_LEVEL} level - The severity level of the log entry.
 * @param {string} functionName - The name of the function originating the log.
 * @param {string} message - The log message.
 */
function _log(level, functionName, message) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const logSheet = ss.getSheetByName(LOG_SHEET_NAME);

    // If the log sheet doesn't exist, we can't log.
    // This is a fallback to prevent the system from crashing if logging fails.
    if (!logSheet) {
      console.error(`[CRITICAL] Log sheet "${LOG_SHEET_NAME}" not found. Cannot write log entry.`);
      return;
    }

    const timestamp = new Date();
    const user = Session.getActiveUser().getEmail() || 'UNKNOWN_USER';

    // The row data must match the order of headers in the SYS_Error_Log sheet
    // as defined in Setup.js: [log_id, timestamp, user, log_level, function_name, message]
    // 'log_id' is typically handled by a formula or trigger, so we leave it blank.
    const logEntry = [
      '', // log_id (A) - often a formula like =ROW()-1
      timestamp, // timestamp (B)
      user, // user (C)
      level, // log_level (D)
      functionName, // function_name (E)
      message // message (F)
    ];

    // Append the new log entry to the sheet
    logSheet.appendRow(logEntry);

  } catch (e) {
    // If logging itself fails, log to the built-in Apps Script logger as a last resort.
    console.error(`[CRITICAL] Failed to write to log sheet "${LOG_SHEET_NAME}". ` +
      `Original Level: ${level}, Function: ${functionName}, Message: ${message}. ` +
      `Logging Error: ${e.stack}`);
  }
}

// --------------------------------------------------------------------------
// --- COMPATIBILITY WRAPPERS (Underscore API) ---
// --------------------------------------------------------------------------

/**
 * Wrapper to maintain compatibility with specs referencing logInfo_.
 * @param {string} functionName
 * @param {string} message
 */
function logInfo_(functionName, message) {
  return logInfo(functionName, message);
}

/**
 * Wrapper to maintain compatibility with specs referencing logError_.
 * @param {string} functionName
 * @param {string} message
 * @param {Error|Object|string} [errorObject]
 */
function logError_(functionName, message, errorObject) {
  return logError(functionName, message, errorObject);
}

/**
 * Optional wrappers for other levels used by some modules.
 */
function logWarn_(functionName, message) {
  return logWarn(functionName, message);
}

function logDebug_(functionName, message) {
  return _log(LOG_LEVEL.DEBUG, functionName, message);
}

