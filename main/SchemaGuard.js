/** =========================================================
 *  NIJJARA ERP – SCHEMA GUARD MODULE
 *  Author: Mohamed / ChatGPT Assistant
 *  Purpose: Schema validation and field whitelisting
 *           Ensures only valid fields are written to sheets
 *  ========================================================= */

/**
 * ERP Schema Definition
 * Maps entity types to their allowed fields with data types
 */
const ERP_SCHEMA = {
  // SYS Module
  'SYS_Users': {
    fields: {
      'USR_ID': 'string',
      'EMP_Name_EN': 'string',
      'USR_Name': 'string',
      'EMP_Email': 'string',
      'Job_Title': 'string',
      'DEPT_Name': 'string',
      'ROL_ID': 'string',
      'USR_Is_Active': 'boolean',
      'Password_Hash': 'string',
      'Last_Login': 'date',
      'USR_Crt_At': 'date',
      'USR_Crt_By': 'string',
      'USR_Upd_At': 'date',
      'USR_Upd_By': 'string'
    },
    required: ['EMP_Name_EN', 'USR_Name', 'EMP_Email', 'Job_Title', 'DEPT_Name', 'ROL_ID']
  },
  
  'SYS_Roles': {
    fields: {
      'ROL_ID': 'string',
      'ROL_Title': 'string',
      'ROL_Notes': 'string',
      'ROL_Is_System': 'boolean',
      'ROL_Crt_At': 'date',
      'ROL_Crt_By': 'string',
      'ROL_Upd_At': 'date',
      'ROL_Upd_By': 'string'
    },
    required: ['ROL_Title']
  },
  
  // HRM Module
  'HRM_Employees': {
    fields: {
      'EMP_ID': 'string',
      'EMP_Name_EN': 'string',
      'EMP_Name_AR': 'string',
      'Date_of_Birth': 'date',
      'Gender': 'string',
      'National_ID': 'string',
      'Marital_Status': 'string',
      'Military_Status': 'string',
      'EMP_Mob_Main': 'string',
      'EMP_Mob_Sub': 'string',
      'Home_Address': 'string',
      'EMP_Email': 'string',
      'Emrgcy_Cont': 'string',
      'EmrCont_Relation': 'string',
      'EmrCont__Mob': 'string',
      'Job_Title': 'string',
      'DEPT_Name': 'string',
      'Hire_Date': 'date',
      'EMP_CONT_Type': 'string',
      'EMP_Status': 'string',
      'Basic_Salary': 'number',
      'Allowances': 'number',
      'Deducts': 'number',
      'EMP_Crt_At': 'date',
      'EMP_Crt_By': 'string',
      'EMP_Upd_At': 'date',
      'EMP_Upd_By': 'string'
    },
    required: ['EMP_Name_EN', 'EMP_Name_AR', 'Date_of_Birth', 'National_ID', 'Job_Title', 'DEPT_Name', 'Hire_Date']
  },
  
  // PRJ Module
  'PRJ_Clients': {
    fields: {
      'CLI_ID': 'string',
      'CLI_Name': 'string',
      'CLI_Mob_1': 'string',
      'CLI_Mob_2': 'string',
      'CLI_Email': 'string',
      'ADV_Crt_At': 'date',
      'ADV_Crt_By': 'string',
      'ADV_Upd_At': 'date',
      'ADV_Upd_By': 'string'
    },
    required: ['CLI_Name']
  },
  
  'PRJ_Main': {
    fields: {
      'PRJ_ID': 'string',
      'PRJ_Name': 'string',
      'CLI_ID': 'string',
      'CLI_Name': 'string',
      'PRJ_Status': 'string',
      'PRJ_Type': 'string',
      'PRJ_Budget': 'number',
      'Plan_Num_Days': 'number',
      'Plan_Start_Date': 'date',
      'PRJ_Location': 'string',
      'ADV_Crt_At': 'date',
      'ADV_Crt_By': 'string',
      'ADV_Upd_At': 'date',
      'ADV_Upd_By': 'string'
    },
    required: ['PRJ_Name', 'CLI_ID', 'PRJ_Status', 'PRJ_Type']
  },
  
  // FIN Module
  'FIN_DirectExpenses': {
    fields: {
      'DiEXP_ID': 'string',
      'PRJ_ID': 'string',
      'PRJ_Name': 'string',
      'DiEXP_Date': 'date',
      'MAT_ID': 'string',
      'MAT_Name': 'string',
      'MAT_Catg': 'string',
      'MAT_Sub1': 'string',
      'MAT_Sub2': 'string',
      'Default_Unit': 'string',
      'Default_Price': 'number',
      'MAT_Quantity': 'number',
      'DiEXP_Total_VAT_Exc': 'number',
      'DiEXP_Total_VAT_Inc': 'number',
      'DiEXP_Pay_Status': 'string',
      'DiEXP_Pay_Methd': 'string',
      'DiEXP_Notes': 'string',
      'ADV_Crt_At': 'date',
      'ADV_Crt_By': 'string',
      'ADV_Upd_At': 'date',
      'ADV_Upd_By': 'string'
    },
    required: ['PRJ_ID', 'DiEXP_Date', 'MAT_ID']
  }
};

/**
 * Validates a record against the schema
 * @param {string} entityType - Entity type (e.g., 'SYS_Users')
 * @param {Object} record - Record to validate
 * @returns {Object} - {valid: boolean, errors: Array, sanitized: Object}
 */
function validateSchema_(entityType, record) {
  const errors = [];
  const sanitized = {};
  
  // Check if entity type exists in schema
  if (!ERP_SCHEMA[entityType]) {
    errors.push(`Unknown entity type: ${entityType}`);
    return { valid: false, errors: errors, sanitized: null };
  }
  
  const schema = ERP_SCHEMA[entityType];
  
  // Check for required fields
  schema.required.forEach(field => {
    if (isEmpty_(record[field])) {
      errors.push(`Required field missing: ${field}`);
    }
  });
  
  // Validate each field in the record
  for (const field in record) {
    if (!record.hasOwnProperty(field)) continue;
    
    // Check if field is allowed
    if (!schema.fields[field]) {
      errors.push(`Unknown field: ${field}`);
      continue;
    }
    
    const expectedType = schema.fields[field];
    const value = record[field];
    
    // Type validation
    const typeCheck = validateFieldType_(field, value, expectedType);
    if (!typeCheck.valid) {
      errors.push(typeCheck.error);
    } else {
      sanitized[field] = typeCheck.value;
    }
  }
  
  return {
    valid: errors.length === 0,
    errors: errors,
    sanitized: sanitized
  };
}

/**
 * Validates field type
 * @param {string} fieldName - Field name
 * @param {*} value - Field value
 * @param {string} expectedType - Expected type
 * @returns {Object} - {valid: boolean, error: string, value: *}
 */
function validateFieldType_(fieldName, value, expectedType) {
  // Allow null/undefined/empty for optional fields
  if (isEmpty_(value)) {
    return { valid: true, value: value };
  }
  
  switch (expectedType) {
    case 'string':
      if (typeof value !== 'string') {
        return { valid: false, error: `${fieldName} must be a string`, value: null };
      }
      return { valid: true, value: sanitizeString_(value) };
      
    case 'number':
      const num = Number(value);
      if (isNaN(num)) {
        return { valid: false, error: `${fieldName} must be a number`, value: null };
      }
      return { valid: true, value: num };
      
    case 'boolean':
      if (typeof value === 'boolean') {
        return { valid: true, value: value };
      }
      // Try to parse string booleans
      if (value === 'true' || value === '1' || value === 1) {
        return { valid: true, value: true };
      }
      if (value === 'false' || value === '0' || value === 0) {
        return { valid: true, value: false };
      }
      return { valid: false, error: `${fieldName} must be a boolean`, value: null };
      
    case 'date':
      const date = parseDate_(value);
      if (!date) {
        return { valid: false, error: `${fieldName} must be a valid date`, value: null };
      }
      return { valid: true, value: date };
      
    default:
      return { valid: false, error: `Unknown type: ${expectedType}`, value: null };
  }
}

/**
 * Filters a record to only include allowed fields
 * @param {string} entityType - Entity type
 * @param {Object} record - Record to filter
 * @returns {Object} - Filtered record
 */
function filterAllowedFields_(entityType, record) {
  if (!ERP_SCHEMA[entityType]) {
    return {};
  }
  
  const schema = ERP_SCHEMA[entityType];
  const filtered = {};
  
  for (const field in record) {
    if (record.hasOwnProperty(field) && schema.fields[field]) {
      filtered[field] = record[field];
    }
  }
  
  return filtered;
}

/**
 * Gets the list of allowed fields for an entity type
 * @param {string} entityType - Entity type
 * @returns {Array<string>} - Array of allowed field names
 */
function getAllowedFields_(entityType) {
  if (!ERP_SCHEMA[entityType]) {
    return [];
  }
  
  return Object.keys(ERP_SCHEMA[entityType].fields);
}

/**
 * Gets the required fields for an entity type
 * @param {string} entityType - Entity type
 * @returns {Array<string>} - Array of required field names
 */
function getRequiredFields_(entityType) {
  if (!ERP_SCHEMA[entityType]) {
    return [];
  }
  
  return ERP_SCHEMA[entityType].required || [];
}

/**
 * Checks if a field is required for an entity type
 * @param {string} entityType - Entity type
 * @param {string} fieldName - Field name
 * @returns {boolean} - True if required
 */
function isFieldRequired_(entityType, fieldName) {
  const required = getRequiredFields_(entityType);
  return required.includes(fieldName);
}

/**
 * Gets the expected type for a field
 * @param {string} entityType - Entity type
 * @param {string} fieldName - Field name
 * @returns {string|null} - Expected type or null if not found
 */
function getFieldType_(entityType, fieldName) {
  if (!ERP_SCHEMA[entityType]) {
    return null;
  }
  
  return ERP_SCHEMA[entityType].fields[fieldName] || null;
}

/**
 * Comprehensive validation: Schema + Business Rules
 * @param {string} entityType - Entity type
 * @param {Object} record - Record to validate
 * @returns {Object} - {valid: boolean, errors: Array, sanitized: Object}
 */
function validateRecord_(entityType, record) {
  // First, validate against schema
  const schemaValidation = validateSchema_(entityType, record);
  
  if (!schemaValidation.valid) {
    return schemaValidation;
  }
  
  // Then, apply business rule validation
  const businessValidation = validateEntity_(entityType, schemaValidation.sanitized);
  
  if (!businessValidation.valid) {
    return {
      valid: false,
      errors: businessValidation.errors,
      sanitized: schemaValidation.sanitized
    };
  }
  
  return {
    valid: true,
    errors: [],
    sanitized: schemaValidation.sanitized
  };
}
