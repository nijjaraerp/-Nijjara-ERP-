/** =========================================================
 *  NIJJARA ERP – VALIDATION MODULE
 *  Author: Mohamed / ChatGPT Assistant
 *  Purpose: Input validation and sanitization for all modules
 *  ========================================================= */

/**
 * Validates user input data
 * @param {string} entityType - Type of entity (e.g., 'SYS_Users', 'HRM_Employees')
 * @param {Object} data - Data object to validate
 * @returns {Object} - Validation result {valid: boolean, errors: Array}
 */
function validateEntity_(entityType, data) {
  const errors = [];
  
  try {
    switch (entityType) {
      case 'SYS_Users':
        validateUser_(data, errors);
        break;
      case 'HRM_Employees':
        validateEmployee_(data, errors);
        break;
      case 'PRJ_Main':
        validateProject_(data, errors);
        break;
      case 'PRJ_Clients':
        validateClient_(data, errors);
        break;
      case 'FIN_DirectExpenses':
        validateDirectExpense_(data, errors);
        break;
      default:
        errors.push(`Unknown entity type: ${entityType}`);
    }
  } catch (error) {
    errors.push(`Validation error: ${error.message}`);
  }
  
  return {
    valid: errors.length === 0,
    errors: errors
  };
}

/**
 * Validates user data
 * @param {Object} data - User data
 * @param {Array} errors - Errors array to populate
 */
function validateUser_(data, errors) {
  // Required fields
  if (isEmpty_(data.EMP_Name_EN)) {
    errors.push('Employee name (English) is required');
  }
  
  if (isEmpty_(data.USR_Name)) {
    errors.push('Username is required');
  } else if (data.USR_Name.length < 3) {
    errors.push('Username must be at least 3 characters');
  }
  
  if (isEmpty_(data.EMP_Email)) {
    errors.push('Email is required');
  } else if (!isValidEmail_(data.EMP_Email)) {
    errors.push('Invalid email format');
  }
  
  if (isEmpty_(data.Job_Title)) {
    errors.push('Job title is required');
  }
  
  if (isEmpty_(data.DEPT_Name)) {
    errors.push('Department is required');
  }
  
  if (isEmpty_(data.ROL_ID)) {
    errors.push('Role is required');
  }
}

/**
 * Validates employee data
 * @param {Object} data - Employee data
 * @param {Array} errors - Errors array to populate
 */
function validateEmployee_(data, errors) {
  // Required fields
  if (isEmpty_(data.EMP_Name_EN)) {
    errors.push('Employee name (English) is required');
  }
  
  if (isEmpty_(data.EMP_Name_AR)) {
    errors.push('Employee name (Arabic) is required');
  }
  
  if (isEmpty_(data.Date_of_Birth)) {
    errors.push('Date of birth is required');
  } else {
    const dob = parseDate_(data.Date_of_Birth);
    if (!dob) {
      errors.push('Invalid date of birth format');
    } else {
      const age = (new Date() - dob) / (1000 * 60 * 60 * 24 * 365);
      if (age < 18) {
        errors.push('Employee must be at least 18 years old');
      }
    }
  }
  
  if (isEmpty_(data.National_ID)) {
    errors.push('National ID is required');
  }
  
  if (isEmpty_(data.Job_Title)) {
    errors.push('Job title is required');
  }
  
  if (isEmpty_(data.DEPT_Name)) {
    errors.push('Department is required');
  }
  
  if (isEmpty_(data.Hire_Date)) {
    errors.push('Hire date is required');
  } else if (!parseDate_(data.Hire_Date)) {
    errors.push('Invalid hire date format');
  }
  
  // Validate salary if provided
  if (!isEmpty_(data.Basic_Salary)) {
    validateNumeric_(data.Basic_Salary, 'Basic salary', 0);
  }
  
  // Validate contact information
  if (!isEmpty_(data.EMP_Email) && !isValidEmail_(data.EMP_Email)) {
    errors.push('Invalid email format');
  }
}

/**
 * Validates project data
 * @param {Object} data - Project data
 * @param {Array} errors - Errors array to populate
 */
function validateProject_(data, errors) {
  // Required fields
  if (isEmpty_(data.PRJ_Name)) {
    errors.push('Project name is required');
  }
  
  if (isEmpty_(data.CLI_ID)) {
    errors.push('Client ID is required');
  }
  
  if (isEmpty_(data.PRJ_Status)) {
    errors.push('Project status is required');
  }
  
  if (isEmpty_(data.PRJ_Type)) {
    errors.push('Project type is required');
  }
  
  // Validate budget
  if (!isEmpty_(data.PRJ_Budget)) {
    try {
      validateNumeric_(data.PRJ_Budget, 'Project budget', 0);
    } catch (error) {
      errors.push(error.message);
    }
  }
  
  // Validate dates
  if (!isEmpty_(data.Plan_Start_Date)) {
    if (!parseDate_(data.Plan_Start_Date)) {
      errors.push('Invalid planned start date format');
    }
  }
}

/**
 * Validates client data
 * @param {Object} data - Client data
 * @param {Array} errors - Errors array to populate
 */
function validateClient_(data, errors) {
  // Required fields
  if (isEmpty_(data.CLI_Name)) {
    errors.push('Client name is required');
  }
  
  // Validate email if provided
  if (!isEmpty_(data.CLI_Email) && !isValidEmail_(data.CLI_Email)) {
    errors.push('Invalid email format');
  }
}

/**
 * Validates direct expense data
 * @param {Object} data - Direct expense data
 * @param {Array} errors - Errors array to populate
 */
function validateDirectExpense_(data, errors) {
  // Required fields
  if (isEmpty_(data.PRJ_ID)) {
    errors.push('Project ID is required');
  }
  
  if (isEmpty_(data.DiEXP_Date)) {
    errors.push('Expense date is required');
  } else if (!parseDate_(data.DiEXP_Date)) {
    errors.push('Invalid expense date format');
  }
  
  if (isEmpty_(data.MAT_ID)) {
    errors.push('Material ID is required');
  }
  
  // Validate numeric fields
  if (!isEmpty_(data.MAT_Quantity)) {
    try {
      validateNumeric_(data.MAT_Quantity, 'Quantity', 0);
    } catch (error) {
      errors.push(error.message);
    }
  }
  
  if (!isEmpty_(data.Default_Price)) {
    try {
      validateNumeric_(data.Default_Price, 'Price', 0);
    } catch (error) {
      errors.push(error.message);
    }
  }
}

/**
 * Sanitizes input data to prevent injection
 * @param {Object} data - Data object to sanitize
 * @returns {Object} - Sanitized data
 */
function sanitizeData_(data) {
  const sanitized = {};
  
  for (const key in data) {
    if (data.hasOwnProperty(key)) {
      const value = data[key];
      
      // Sanitize strings
      if (typeof value === 'string') {
        sanitized[key] = sanitizeString_(value);
      } else {
        sanitized[key] = value;
      }
    }
  }
  
  return sanitized;
}

/**
 * Validates and sanitizes data in one call
 * @param {string} entityType - Type of entity
 * @param {Object} data - Data to validate and sanitize
 * @returns {Object} - Result {valid: boolean, data: Object, errors: Array}
 */
function validateAndSanitize_(entityType, data) {
  // First sanitize
  const sanitized = sanitizeData_(data);
  
  // Then validate
  const validation = validateEntity_(entityType, sanitized);
  
  return {
    valid: validation.valid,
    data: sanitized,
    errors: validation.errors
  };
}

/**
 * Checks if a value exists in a sheet column (for FK validation)
 * @param {string} sheetName - Sheet name
 * @param {string} columnHeader - Column header (English)
 * @param {*} value - Value to check
 * @returns {boolean} - True if value exists
 */
function valueExistsInColumn_(sheetName, columnHeader, value) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(sheetName);
    
    if (!sheet) {
      return false;
    }
    
    const colIndex = findColumnByHeader_(sheet, columnHeader, 1);
    if (colIndex === -1) {
      return false;
    }
    
    const lastRow = sheet.getLastRow();
    if (lastRow < 3) {
      return false; // No data rows (rows 1-2 are headers)
    }
    
    const values = sheet.getRange(3, colIndex, lastRow - 2, 1).getValues();
    return values.some(row => row[0] === value);
  } catch (error) {
    logError_(getCurrentUser_(), 'Validate', sheetName, 'N/A', 'FK check failed', error);
    return false;
  }
}

/**
 * Validates foreign key relationship
 * @param {string} fkValue - Foreign key value
 * @param {string} targetSheet - Target sheet name
 * @param {string} targetColumn - Target column header
 * @param {string} fieldName - Field name for error message
 * @throws {Error} - If FK validation fails
 */
function validateForeignKey_(fkValue, targetSheet, targetColumn, fieldName) {
  if (isEmpty_(fkValue)) {
    return; // Allow empty for optional FKs
  }
  
  if (!valueExistsInColumn_(targetSheet, targetColumn, fkValue)) {
    throw new Error(`${fieldName} '${fkValue}' does not exist in ${targetSheet}`);
  }
}
