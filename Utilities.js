/** =========================================================
 *  NIJJARA ERP – UTILITIES MODULE
 *  Author: Mohamed / ChatGPT Assistant
 *  Purpose: Reusable utility functions
 *  ========================================================= */

/**
 * Generates a unique ID with prefix
 * @param {string} prefix - ID prefix (e.g., 'EMP', 'PRJ', 'USR')
 * @returns {string} - Unique ID
 */
function generateId_(prefix) {
  const timestamp = new Date().getTime();
  const random = Math.floor(Math.random() * 1000);
  return `${prefix}-${timestamp}-${random}`;
}

/**
 * Gets current timestamp in ISO format
 * @returns {string} - ISO timestamp
 */
function getCurrentTimestamp_() {
  return new Date().toISOString();
}

/**
 * Safely gets a value from an object or returns default
 * @param {Object} obj - Source object
 * @param {string} key - Property key
 * @param {*} defaultValue - Default value if not found
 * @returns {*} - Property value or default
 */
function safeGet_(obj, key, defaultValue = null) {
  return obj && obj.hasOwnProperty(key) ? obj[key] : defaultValue;
}

/**
 * Checks if a value is empty (null, undefined, empty string)
 * @param {*} value - Value to check
 * @returns {boolean} - True if empty
 */
function isEmpty_(value) {
  return value === null || value === undefined || value === '' || 
         (typeof value === 'string' && value.trim() === '');
}

/**
 * Validates email format
 * @param {string} email - Email to validate
 * @returns {boolean} - True if valid
 */
function isValidEmail_(email) {
  if (isEmpty_(email)) return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Formats a date to YYYY-MM-DD
 * @param {Date} date - Date to format
 * @returns {string} - Formatted date
 */
function formatDate_(date) {
  if (!(date instanceof Date)) return '';
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Parses a date string (YYYY-MM-DD or ISO format)
 * @param {string} dateString - Date string to parse
 * @returns {Date|null} - Parsed date or null
 */
function parseDate_(dateString) {
  if (isEmpty_(dateString)) return null;
  try {
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? null : date;
  } catch (error) {
    return null;
  }
}

/**
 * Converts a sheet range to an array of objects with headers as keys
 * @param {Range} range - The range to convert
 * @param {number} headerRow - Row number of headers (1-based, default 1)
 * @returns {Array<Object>} - Array of row objects
 */
function rangeToObjects_(range, headerRow = 1) {
  const values = range.getValues();
  if (values.length < headerRow) return [];
  
  const headers = values[headerRow - 1];
  const dataRows = values.slice(headerRow);
  
  return dataRows.map(row => {
    const obj = {};
    headers.forEach((header, index) => {
      obj[header] = row[index];
    });
    return obj;
  });
}

/**
 * Finds a column index by header name
 * @param {Sheet} sheet - The sheet to search
 * @param {string} headerName - The header name to find
 * @param {number} headerRow - Row number of headers (1-based, default 1)
 * @returns {number} - Column index (1-based) or -1 if not found
 */
function findColumnByHeader_(sheet, headerName, headerRow = 1) {
  try {
    const headers = sheet.getRange(headerRow, 1, 1, sheet.getLastColumn()).getValues()[0];
    const index = headers.indexOf(headerName);
    return index === -1 ? -1 : index + 1; // Convert to 1-based
  } catch (error) {
    return -1;
  }
}

/**
 * Gets data from a sheet as array of objects
 * @param {string} sheetName - Name of the sheet
 * @param {number} headerRow - Row number of headers (default 1)
 * @returns {Array<Object>} - Array of row objects
 */
function getSheetData_(sheetName, headerRow = 1) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(sheetName);
    
    if (!sheet) {
      throw new Error(`Sheet ${sheetName} not found`);
    }
    
    const lastRow = sheet.getLastRow();
    if (lastRow < headerRow + 1) {
      return []; // No data rows
    }
    
    const range = sheet.getRange(headerRow, 1, lastRow - headerRow + 1, sheet.getLastColumn());
    return rangeToObjects_(range, 1);
  } catch (error) {
    logError_(getCurrentUser_(), 'Read', sheetName, 'N/A', 'Failed to get sheet data', error);
    throw error;
  }
}

/**
 * Sanitizes a string to prevent injection attacks
 * @param {string} input - Input string
 * @returns {string} - Sanitized string
 */
function sanitizeString_(input) {
  if (typeof input !== 'string') return input;
  return input.replace(/[<>\"']/g, '');
}

/**
 * Creates a response object for API-like returns
 * @param {boolean} success - Success status
 * @param {*} data - Response data
 * @param {string} message - Response message
 * @param {Array<string>} errors - Array of error messages
 * @returns {Object} - Response object
 */
function createResponse_(success, data = null, message = '', errors = []) {
  return {
    success: success,
    data: data,
    message: message,
    errors: errors,
    timestamp: new Date().toISOString()
  };
}

/**
 * Computes HMAC SHA256 signature for password hashing
 * @param {string} value - Value to hash
 * @param {string} key - Secret key
 * @returns {string} - Base64 encoded signature
 */
function computeHmacSha256Signature_(value, key) {
  try {
    const signature = Utilities.computeHmacSha256Signature(value, key);
    return Utilities.base64Encode(signature);
  } catch (error) {
    logError_(getCurrentUser_(), 'Hash', 'Password', 'N/A', 'Failed to compute hash', error);
    throw error;
  }
}

/**
 * Generates a random salt for password hashing
 * @param {number} length - Length of salt (default 16)
 * @returns {string} - Random salt
 */
function generateSalt_(length = 16) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let salt = '';
  for (let i = 0; i < length; i++) {
    salt += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return salt;
}

/**
 * Gets the current user info
 * @returns {Object} - User info object
 */
function getCurrentUserInfo_() {
  try {
    const activeEmail = Session.getActiveUser().getEmail();
    const effectiveEmail = Session.getEffectiveUser().getEmail();
    
    return {
      email: activeEmail || effectiveEmail || 'unknown',
      isActive: !!activeEmail,
      timestamp: new Date()
    };
  } catch (error) {
    return {
      email: 'System',
      isActive: false,
      timestamp: new Date()
    };
  }
}

/**
 * Validates a required field
 * @param {*} value - Value to validate
 * @param {string} fieldName - Name of the field
 * @throws {Error} - If validation fails
 */
function validateRequired_(value, fieldName) {
  if (isEmpty_(value)) {
    throw new Error(`${fieldName} is required`);
  }
}

/**
 * Validates a numeric field
 * @param {*} value - Value to validate
 * @param {string} fieldName - Name of the field
 * @param {number} min - Minimum value (optional)
 * @param {number} max - Maximum value (optional)
 * @throws {Error} - If validation fails
 */
function validateNumeric_(value, fieldName, min = null, max = null) {
  if (isEmpty_(value)) return; // Allow empty for optional fields
  
  const num = Number(value);
  if (isNaN(num)) {
    throw new Error(`${fieldName} must be a number`);
  }
  
  if (min !== null && num < min) {
    throw new Error(`${fieldName} must be at least ${min}`);
  }
  
  if (max !== null && num > max) {
    throw new Error(`${fieldName} must be at most ${max}`);
  }
}

/**
 * Validates a date field
 * @param {*} value - Value to validate
 * @param {string} fieldName - Name of the field
 * @throws {Error} - If validation fails
 */
function validateDate_(value, fieldName) {
  if (isEmpty_(value)) return; // Allow empty for optional fields
  
  const date = parseDate_(value);
  if (!date) {
    throw new Error(`${fieldName} must be a valid date`);
  }
}
