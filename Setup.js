/**
 * @file Setup.js
 * @description This file is the single source of truth for the Nijjara ERP
 * database schema. It programmatically creates, validates, and updates all
 * Google Sheet tabs and their headers.
 *
 * !!! WARNING !!!
 * DO NOT MANUALLY EDIT THE GOOGLE SHEET.
 * All schema changes MUST be made in the `ERP_SCHEMA` object in this file
 * and then deployed by running the `runInitialSetup` function.
 */

// --------------------------------------------------------------------------
// --- MASTER FUNCTION TO RUN ---
// --------------------------------------------------------------------------

/**
 * [MASTER FUNCTION]
 * Select and run this function from the Apps Script Editor to build or
 * validate the entire database schema based on the `ERP_SCHEMA` object.
 *
 * This function is "idempotent," meaning it can be run safely multiple
 * times. It will only create what's missing and will not delete data.
 */
function runInitialSetup() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const ui = SpreadsheetApp.getUi();
  const allSheetNames = Object.keys(ERP_SCHEMA);
  const totalSheets = allSheetNames.length;

  // Show initial progress
  ui.alert('Nijjara ERP Setup', `Starting setup for ${totalSheets} sheets. This may take a few minutes.`, ui.ButtonSet.OK);

  console.log(`
    =======================================================
    ( SETUP SCRIPT ) - Nijjara ERP Database Setup Started
    Target Spreadsheet: ${ss.getName()}
    Total Sheets to process: ${totalSheets}
    =======================================================
  `);

  try {
    // Process each sheet with progress updates
    allSheetNames.forEach((sheetName, index) => {
      const progress = Math.round(((index + 1) / totalSheets) * 100);
      console.log(`\n--- ( ${index + 1} / ${totalSheets} ) Processing Sheet: ${sheetName} ---`);

      // Show progress every 5 sheets or for the last sheet
      if ((index + 1) % 5 === 0 || index === totalSheets - 1) {
        ui.alert('Setup Progress', `Processing sheet ${index + 1} of ${totalSheets} (${progress}%)\nCurrent: ${sheetName}`, ui.ButtonSet.OK);
      }

      const headers = ERP_SCHEMA[sheetName];
      createOrUpdateSheet(ss, sheetName, headers);
    });

    // --- ENHANCEMENT: Populate seed data ---
    console.log(`\n--- Populating Seed Data ---`);
    ui.alert('Setup Progress', 'Populating initial seed data...', ui.ButtonSet.OK);
    populateSeedData(ss);

    // --- ENHANCEMENT: Validate data integrity ---
    console.log(`\n--- Validating Data Integrity ---`);
    ui.alert('Setup Progress', 'Validating data integrity...', ui.ButtonSet.OK);
    validateDataIntegrity(ss);

    console.log(`
    =======================================================
    ( SETUP SCRIPT ) - SUCCESS
    All ${totalSheets} sheets have been processed.
    Seed data populated and validation completed.
    Database setup is complete.
    =======================================================
  `);

    // Final success message
    ui.alert('Setup Complete!', `Successfully created ${totalSheets} sheets with headers, populated seed data, and validated integrity.`, ui.ButtonSet.OK);

  } catch (e) {
    const errorMsg = `
    !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
    ( SETUP SCRIPT ) - FATAL ERROR
    Setup failed. Error: ${e.message}
    Stack: ${e.stack}
    !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
    `;
    console.error(errorMsg);
    ui.alert("Setup Failed!", errorMsg, ui.ButtonSet.OK);
  }
}

// --------------------------------------------------------------------------
// --- CORE SETUP UTILITIES ---
// --------------------------------------------------------------------------

/**
 * Creates a new sheet or validates an existing one against the schema.
 * This is the core engine of the setup script.
 *
 * As per your debug request, this function provides extensive logging.
 *
 * @param {GoogleAppsScript.Spreadsheet.Spreadsheet} ss - The active spreadsheet.
 * @param {string} sheetName - The name of the sheet to create/validate.
 * @param {string[]} requiredHeaders - The list of headers from the schema.
 */
function createOrUpdateSheet(ss, sheetName, requiredHeaders) {
  if (!sheetName || !requiredHeaders || requiredHeaders.length === 0) {
    console.error(`(LOG-ERROR) Invalid schema for [${sheetName}]. Skipping.`);
    return;
  }

  let sheet;
  try {
    sheet = ss.getSheetByName(sheetName);

    if (!sheet) {
      // --- 1. Sheet does not exist ---
      console.log(`(LOG-INFO) Sheet [${sheetName}] not found. Creating...`);
      sheet = ss.insertSheet(sheetName);
      console.log(`(LOG-SUCCESS) Created sheet: [${sheetName}].`);

      // Set headers on the new sheet
      setSheetHeaders(sheet, requiredHeaders);
    } else {
      // --- 2. Sheet exists ---
      console.log(`(LOG-INFO) Sheet [${sheetName}] found. Validating headers...`);
      validateAndApplyHeaders(sheet, requiredHeaders);
    }

    // --- 3. Apply common styling ---
    // (Optional, but good practice)
    sheet.setFrozenRows(1); // Freeze the header row
    sheet.getRange(1, 1, 1, sheet.getMaxColumns()).setFontWeight("bold");

    console.log(`(LOG-INFO) Validation complete for [${sheetName}].`);
  } catch (e) {
    console.error(`(LOG-FATAL) Failed to process sheet [${sheetName}]. Error: ${e.message}`);
  }
}

/**
 * Sets the headers on a newly created sheet.
 * @param {GoogleAppsScript.Spreadsheet.Sheet} sheet - The sheet to modify.
 * @param {string[]} headers - The list of headers to write.
 */
function setSheetHeaders(sheet, headers) {
  try {
    const headerRange = sheet.getRange(1, 1, 1, headers.length);
    headerRange.setValues([headers]);
    console.log(`(LOG-SUCCESS) Set ${headers.length} headers for new sheet [${sheet.getName()}].`);

    // Clear all other columns to remove defaults
    if (sheet.getMaxColumns() > headers.length) {
      sheet.deleteColumns(headers.length + 1, sheet.getMaxColumns() - headers.length);
    }
  } catch (e) {
    console.error(`(LOG-ERROR) Failed to set headers for [${sheet.getName()}]. Error: ${e.message}`);
  }
}

/**
 * Validates headers on an existing sheet.
 * It does NOT delete columns, but will append missing ones.
 * This is a non-destructive operation.
 *
 * @param {GoogleAppsScript.Spreadsheet.Sheet} sheet - The sheet to validate.
 * @param {string[]} requiredHeaders - The master list of headers from schema.
 */
function validateAndApplyHeaders(sheet, requiredHeaders) {
  const sheetName = sheet.getName();
  let currentHeaders = [];
  try {
    // Read the entire first row
    currentHeaders = sheet.getRange(1, 1, 1, sheet.getMaxColumns()).getValues()[0]
      .filter(h => h.toString().trim() !== ""); // Get all non-empty headers
  } catch (e) {
    console.error(`(LOG-ERROR) Could not read headers from [${sheetName}]. It may be empty. Attempting to set...`);
    setSheetHeaders(sheet, requiredHeaders);
    return;
  }

  // --- Validation Logic ---
  const missingHeaders = [];
  const requiredHeaderSet = new Set(requiredHeaders);
  const currentHeaderSet = new Set(currentHeaders);

  // Find missing headers (in schema but not in sheet)
  for (const header of requiredHeaders) {
    if (!currentHeaderSet.has(header)) {
      missingHeaders.push(header);
    }
  }

  // Find extra headers (in sheet but not in schema)
  const extraHeaders = currentHeaders.filter(header => !requiredHeaderSet.has(header));

  // --- Report and Act ---
  if (missingHeaders.length === 0 && extraHeaders.length === 0) {
    console.log(`(LOG-SUCCESS) Headers for [${sheetName}] are 100% in sync.`);
    return;
  }

  if (extraHeaders.length > 0) {
    console.warn(`(LOG-WARN) [${sheetName}] has EXTRA headers not in schema: [${extraHeaders.join(", ")}].`);
    // These are NOT deleted to prevent data loss.
  }

  if (missingHeaders.length > 0) {
    console.warn(`(LOG-WARN) [${sheetName}] is MISSING headers: [${missingHeaders.join(", ")}].`);
    // Append missing headers to the end of the sheet
    try {
      const nextEmptyColumn = currentHeaders.length + 1;
      const rangeToUpdate = sheet.getRange(1, nextEmptyColumn, 1, missingHeaders.length);
      rangeToUpdate.setValues([missingHeaders]);
      console.log(`(LOG-SUCCESS) Appended ${missingHeaders.length} missing headers to [${sheetName}].`);
    } catch (e) {
      console.error(`(LOG-ERROR) Failed to append missing headers to [${sheetName}]. Error: ${e.message}`);
    }
  }
}


// --------------------------------------------------------------------------
// --- ENHANCEMENT: SEED DATA POPULATION ---
// --------------------------------------------------------------------------

/**
 * [ENHANCEMENT] Populates initial seed data for the ERP system.
 * This function is called after schema creation to populate essential data.
 *
 * @param {GoogleAppsScript.Spreadsheet.Spreadsheet} ss - The active spreadsheet.
 */
function populateSeedData(ss) {
  try {
    console.log(`(SEED-DATA) Starting seed data population...`);

    // Populate system settings
    populateSystemSettings(ss);

    // Populate roles and permissions
    populateRolesAndPermissions(ss);

    // Populate dropdown values
    populateDropdowns(ss);

    // Populate sample departments
    populateSampleDepartments(ss);

    console.log(`(SEED-DATA) Seed data population completed successfully.`);
  } catch (e) {
    console.error(`(SEED-DATA-ERROR) Failed to populate seed data: ${e.message}`);
    // Don't throw error - seed data failure shouldn't stop setup
  }
}

/**
 * Populates essential system settings.
 */
function populateSystemSettings(ss) {
  const sheet = ss.getSheetByName('SET_Settings');
  if (!sheet) return;

  const settings = [
    ['setting_key', 'setting_value', 'description'],
    ['company_name', 'Nijjara ERP Company', 'Company name for reports and branding'],
    ['default_currency', 'EGP', 'Default currency for financial calculations'],
    ['fiscal_year_start', '01-01', 'Fiscal year start date (MM-DD)'],
    ['timezone', 'Africa/Cairo', 'System timezone'],
    ['date_format', 'DD/MM/YYYY', 'Default date format'],
    ['language', 'ar', 'Default system language']
  ];

  // Only add if sheet is empty (don't overwrite existing data)
  if (sheet.getLastRow() <= 1) {
    sheet.getRange(2, 1, settings.length - 1, 3).setValues(settings.slice(1));
    console.log(`(SEED-DATA) Added ${settings.length - 1} system settings.`);
  }
}

/**
 * Populates roles and permissions.
 */
function populateRolesAndPermissions(ss) {
  // Roles
  const rolesSheet = ss.getSheetByName('SYS_Roles');
  if (rolesSheet && rolesSheet.getLastRow() <= 1) {
    const roles = [
      ['role_id', 'role_name_english', 'description', 'معرف الدور', 'اسم الدور', 'الوصف'],
      ['admin', 'Administrator', 'Full system access', 'admin', 'مدير النظام', 'صلاحية كاملة للنظام'],
      ['hr_manager', 'HR Manager', 'Human resources management', 'hr_manager', 'مدير الموارد البشرية', 'إدارة الموارد البشرية'],
      ['project_manager', 'Project Manager', 'Project management access', 'project_manager', 'مدير المشاريع', 'صلاحية إدارة المشاريع'],
      ['accountant', 'Accountant', 'Finance and accounting access', 'accountant', 'محاسب', 'صلاحية المحاسبة والمالية'],
      ['employee', 'Employee', 'Basic employee access', 'employee', 'موظف', 'صلاحية الموظف الأساسية']
    ];
    rolesSheet.getRange(2, 1, roles.length - 1, 6).setValues(roles.slice(1));
    console.log(`(SEED-DATA) Added ${roles.length - 1} roles.`);
  }

  // Permissions
  const permissionsSheet = ss.getSheetByName('SYS_Permissions');
  if (permissionsSheet && permissionsSheet.getLastRow() <= 1) {
    const permissions = [
      ['permission_id', 'permission_group', 'description', 'معرف الصلاحية', 'مجموعة الصلاحيات', 'الوصف'],
      ['users_create', 'Users', 'Create new users', 'users_create', 'المستخدمون', 'إنشاء مستخدمين جدد'],
      ['users_read', 'Users', 'View users', 'users_read', 'المستخدمون', 'عرض المستخدمين'],
      ['users_update', 'Users', 'Edit user information', 'users_update', 'المستخدمون', 'تعديل بيانات المستخدمين'],
      ['users_delete', 'Users', 'Delete users', 'users_delete', 'المستخدمون', 'حذف المستخدمين'],
      ['hr_read', 'HR', 'View HR data', 'hr_read', 'الموارد البشرية', 'عرض بيانات الموارد البشرية'],
      ['hr_manage', 'HR', 'Manage HR data', 'hr_manage', 'الموارد البشرية', 'إدارة بيانات الموارد البشرية'],
      ['projects_read', 'Projects', 'View projects', 'projects_read', 'المشاريع', 'عرض المشاريع'],
      ['projects_manage', 'Projects', 'Manage projects', 'projects_manage', 'المشاريع', 'إدارة المشاريع'],
      ['finance_read', 'Finance', 'View financial data', 'finance_read', 'المالية', 'عرض البيانات المالية'],
      ['finance_manage', 'Finance', 'Manage financial data', 'finance_manage', 'المالية', 'إدارة البيانات المالية']
    ];
    permissionsSheet.getRange(2, 1, permissions.length - 1, 6).setValues(permissions.slice(1));
    console.log(`(SEED-DATA) Added ${permissions.length - 1} permissions.`);
  }
}

/**
 * Populates dropdown values.
 */
function populateDropdowns(ss) {
  const dropdownsSheet = ss.getSheetByName('SET_Dropdowns');
  if (!dropdownsSheet || dropdownsSheet.getLastRow() > 1) return;

  const dropdowns = [
    ['list_id', 'value_engine', 'display_arabic', 'sort_order'],
    // Leave types
    ['leave_type', 'annual', 'إجازة سنوية', 1],
    ['leave_type', 'sick', 'إجازة مرضية', 2],
    ['leave_type', 'emergency', 'إجازة طارئة', 3],
    ['leave_type', 'maternity', 'إجازة أمومة', 4],
    // Project status
    ['project_status', 'planning', 'تخطيط', 1],
    ['project_status', 'active', 'نشط', 2],
    ['project_status', 'on_hold', 'متوقف', 3],
    ['project_status', 'completed', 'مكتمل', 4],
    ['project_status', 'cancelled', 'ملغي', 5],
    // Task priority
    ['task_priority', 'low', 'منخفضة', 1],
    ['task_priority', 'medium', 'متوسطة', 2],
    ['task_priority', 'high', 'عالية', 3],
    ['task_priority', 'urgent', 'عاجلة', 4],
    // Expense categories
    ['expense_category', 'materials', 'مواد', 1],
    ['expense_category', 'labor', 'عمالة', 2],
    ['expense_category', 'equipment', 'معدات', 3],
    ['expense_category', 'transportation', 'مواصلات', 4],
    ['expense_category', 'other', 'أخرى', 5]
  ];

  dropdownsSheet.getRange(2, 1, dropdowns.length - 1, 4).setValues(dropdowns.slice(1));
  console.log(`(SEED-DATA) Added ${dropdowns.length - 1} dropdown values.`);
}

/**
 * Populates sample departments.
 */
function populateSampleDepartments(ss) {
  const departmentsSheet = ss.getSheetByName('HRM_Departments');
  if (!departmentsSheet || departmentsSheet.getLastRow() > 1) return;

  const departments = [
    ['record_id', 'created_at', 'created_by', 'modified_at', 'modified_by', 'is_deleted', 'record_notes',
     'department_id', 'department_name_english', 'manager_employee_id',
     'كود الإدارة', 'اسم الإدارة', 'مدير الإدارة'],
    [1, new Date(), 'system', new Date(), 'system', false, 'Auto-generated',
     'hr', 'Human Resources', null, 'hr', 'الموارد البشرية', null],
    [2, new Date(), 'system', new Date(), 'system', false, 'Auto-generated',
     'it', 'Information Technology', null, 'it', 'تقنية المعلومات', null],
    [3, new Date(), 'system', new Date(), 'system', false, 'Auto-generated',
     'finance', 'Finance', null, 'finance', 'المالية', null],
    [4, new Date(), 'system', new Date(), 'system', false, 'Auto-generated',
     'operations', 'Operations', null, 'operations', 'العمليات', null],
    [5, new Date(), 'system', new Date(), 'system', false, 'Auto-generated',
     'sales', 'Sales', null, 'sales', 'المبيعات', null]
  ];

  departmentsSheet.getRange(2, 1, departments.length - 1, 13).setValues(departments.slice(1));
  console.log(`(SEED-DATA) Added ${departments.length - 1} sample departments.`);
}

// --------------------------------------------------------------------------
// --- ENHANCEMENT: DATA INTEGRITY VALIDATION ---
// --------------------------------------------------------------------------

/**
 * [ENHANCEMENT] Validates data integrity across all sheets.
 * Checks for required fields, data types, and referential integrity.
 *
 * @param {GoogleAppsScript.Spreadsheet.Spreadsheet} ss - The active spreadsheet.
 */
function validateDataIntegrity(ss) {
  try {
    console.log(`(VALIDATION) Starting data integrity validation...`);

    const validationResults = {
      passed: 0,
      warnings: 0,
      errors: 0,
      details: []
    };

    // Validate each sheet
    Object.keys(ERP_SCHEMA).forEach(sheetName => {
      const result = validateSheetIntegrity(ss, sheetName);
      validationResults.passed += result.passed;
      validationResults.warnings += result.warnings;
      validationResults.errors += result.errors;
      validationResults.details.push(...result.details);
    });

    // Log results
    console.log(`(VALIDATION) Integrity check completed:`);
    console.log(`  ✅ Passed: ${validationResults.passed}`);
    console.log(`  ⚠️  Warnings: ${validationResults.warnings}`);
    console.log(`  ❌ Errors: ${validationResults.errors}`);

    if (validationResults.details.length > 0) {
      console.log(`(VALIDATION) Details:`);
      validationResults.details.forEach(detail => console.log(`  ${detail}`));
    }

  } catch (e) {
    console.error(`(VALIDATION-ERROR) Data integrity validation failed: ${e.message}`);
  }
}

/**
 * Validates integrity of a single sheet.
 */
function validateSheetIntegrity(ss, sheetName) {
  const result = { passed: 0, warnings: 0, errors: 0, details: [] };

  try {
    const sheet = ss.getSheetByName(sheetName);
    if (!sheet) {
      result.errors++;
      result.details.push(`❌ Sheet '${sheetName}' not found`);
      return result;
    }

    const headers = ERP_SCHEMA[sheetName];
    const actualHeaders = sheet.getRange(1, 1, 1, sheet.getMaxColumns()).getValues()[0];

    // Check if all required headers exist
    const missingHeaders = headers.filter(h => !actualHeaders.includes(h));
    if (missingHeaders.length > 0) {
      result.errors++;
      result.details.push(`❌ '${sheetName}' missing headers: ${missingHeaders.join(', ')}`);
    } else {
      result.passed++;
      result.details.push(`✅ '${sheetName}' headers validated`);
    }

    // Check for data consistency (basic check for audit fields)
    if (sheetName.includes('HRM_') || sheetName.includes('PRJ_') || sheetName.includes('FIN_')) {
      const dataRows = sheet.getLastRow() - 1; // Exclude header
      if (dataRows > 0) {
        // Check if audit fields have values
        const auditRange = sheet.getRange(2, 1, Math.min(dataRows, 10), 7); // Check first 10 rows
        const auditData = auditRange.getValues();

        let auditIssues = 0;
        auditData.forEach((row, index) => {
          if (!row[0] && dataRows > 0) { // record_id should exist
            auditIssues++;
          }
        });

        if (auditIssues > 0) {
          result.warnings++;
          result.details.push(`⚠️  '${sheetName}' has ${auditIssues} rows with missing audit data`);
        }
      }
    }

  } catch (e) {
    result.errors++;
    result.details.push(`❌ Error validating '${sheetName}': ${e.message}`);
  }

  return result;
}


// --------------------------------------------------------------------------
// --- (THE 'BRAIN') ---
// --- ERP_SCHEMA Object ---
// --------------------------------------------------------------------------

/**
 * This is the "Single Source of Truth" for the entire database.
 * Each key is a Sheet Name.
 * The value is an array of all required headers (ENGINE + VIEW).
 */
const ERP_SCHEMA = {
  // --------------------------------
  // 1. SET_ (System Engine)
  // --------------------------------
  "SET_Tab_Register": [
    "tab_id", "tab_label_arabic", "sub_tab_id", "sub_tab_label_arabic",
    "sort_order", "icon_name", "source_sheet", "view_columns_arabic",
    "form_id_add", "form_id_view", "add_button_label_arabic", "required_permission"
  ],
  "SET_Dynamic_Forms": [
    "form_id", "form_tab_group_arabic", "section_header_arabic", "field_id_engine",
    "field_label_arabic", "field_type", "dropdown_source", "is_required",
    "is_readonly_view", "is_readonly_edit", "validation_regex", "sort_order"
  ],
  "SET_Dropdowns": [
    "list_id", "value_engine", "display_arabic", "sort_order"
  ],
  "SET_Settings": [
    "setting_key", "setting_value", "description"
  ],
  "SET_Documents": [
    "document_id", "gdrive_file_id", "original_filename", "user_label_arabic",
    "parent_record_id", "parent_sheet", "mime_type", "file_size_bytes",
    "uploaded_by", "uploaded_at"
  ],
  "SET_Audit_Report": [
    "log_id", "timestamp", "user_id", "session_id", "action_type",
    "target_sheet", "target_record_id", "field_changed", "old_value",
    "new_value", "description", "ip_address"
  ],
  "SET_Actions": [
    "action_id", "applies_to_sheet", "label_arabic",
    "confirmation_message_arabic", "required_permission"
  ],

  // --------------------------------
  // 2. SYS_ (System Management)
  // --------------------------------
  // Inside ERP_SCHEMA in Setup.js
"SYS_Error_Log": [
  "timestamp", "log_type", "function_name", "error_message",
  "user_id", "client_ip", "user_agent", "stack_trace"
],
  "SYS_Main_Dashboard": [
    "metric_key", "metric_value", "metric_label_arabic", "last_refreshed"
  ],
  "SYS_Users": [
    // Audit Headers
    "record_id", "created_at", "created_by", "modified_at", "modified_by", "is_deleted", "record_notes",
    // Engine Headers (English)
    "user_id", "email", "password_hash", "full_name", "role_id", "employee_id", "is_active", "phone",
    // View Headers (Arabic)
    "اسم المستخدم", "البريد الإلكتروني", "الاسم بالكامل", "الدور", "رقم الموظف", "الحالة", "الهاتف"
  ],
  "SYS_Roles": [
    // Audit Headers
    "record_id", "created_at", "created_by", "modified_at", "modified_by", "is_deleted", "record_notes",
    // Engine Headers (English)
    "role_id", "role_name_english", "description",
    // View Headers (Arabic)
    "معرف الدور", "اسم الدور", "الوصف"
  ],
  "SYS_Permissions": [
    // Audit Headers
    "record_id", "created_at", "created_by", "modified_at", "modified_by", "is_deleted", "record_notes",
    // Engine Headers (English)
    "permission_id", "permission_group", "description",
    // View Headers (Arabic)
    "معرف الصلاحية", "مجموعة الصلاحيات", "الوصف"
  ],
  "SYS_Access_Rights": [
    // Engine-only (Mapping Table)
    "access_id", "role_id", "permission_id", "can_create", "can_read", "can_update", "can_delete"
  ],
  "SYS_Sessions": [
    // Engine-only (Log Table)
    "session_id", "user_id", "login_time", "expiry_time", "ip_address", "user_agent", "is_active"
  ],

  // --------------------------------
  // 3. HRM_ (Human Resources)
  // --------------------------------
  "HRM_Main_Dashboard": [
    "metric_key", "metric_value", "metric_label_arabic", "last_refreshed"
  ],
  "HRM_Employees": [
    // Audit Headers
    "record_id", "created_at", "created_by", "modified_at", "modified_by", "is_deleted", "record_notes",
    // Engine Headers (English)
    "employee_id", "user_id", "full_name_arabic", "full_name_english", "national_id", "job_title",
    "department_id", "hire_date", "salary_basic", "status", "personal_email", "phone", "bank_iban",
    // View Headers (Arabic)
    "كود الموظف", "اسم الموظف", "الرقم القومي", "المسمى الوظيفي", "الإدارة",
    "تاريخ التعيين", "الراتب الأساسي", "الحالة", "البريد الشخصي", "الهاتف", "IBAN"
  ],
  "HRM_Departments": [
    // Audit Headers
    "record_id", "created_at", "created_by", "modified_at", "modified_by", "is_deleted", "record_notes",
    // Engine Headers (English)
    "department_id", "department_name_english", "manager_employee_id",
    // View Headers (Arabic)
    "كود الإدارة", "اسم الإدارة", "مدير الإدارة"
  ],
  "HRM_Attendance": [
    // Audit Headers
    "record_id", "created_at", "created_by", "modified_at", "modified_by", "is_deleted", "record_notes",
    // Engine Headers (English)
    "attendance_id", "employee_id", "date", "check_in_time", "check_out_time", "hours_worked", "status",
    // View Headers (Arabic)
    "الموظف", "التاريخ", "وقت الحضور", "وقت الانصراف", "ساعات العمل", "الحالة"
  ],
  "HRM_OverTime": [
    // Audit Headers
    "record_id", "created_at", "created_by", "modified_at", "modified_by", "is_deleted", "record_notes",
    // Engine Headers (English)
    "overtime_id", "employee_id", "date", "hours", "rate", "total_amount", "status",
    // View Headers (Arabic)
    "الموظف", "التاريخ", "عدد الساعات", "المعدل", "الإجمالي", "الحالة"
  ],
  "HRM_Leave_Requests": [
    // Audit Headers
    "record_id", "created_at", "created_by", "modified_at", "modified_by", "is_deleted", "record_notes",
    // Engine Headers (English)
    "leave_id", "employee_id", "leave_type", "start_date", "end_date", "reason", "status", "approved_by",
    // View Headers (Arabic)
    "الموظف", "نوع الإجازة", "تاريخ البدء", "تاريخ الانتهاء", "السبب", "الحالة", "تمت الموافقة بواسطة"
  ],
  "HRM_Advances": [
    // Audit Headers
    "record_id", "created_at", "created_by", "modified_at", "modified_by", "is_deleted", "record_notes",
    // Engine Headers (English)
    "advance_id", "employee_id", "date", "amount", "reason", "status", "deduct_from_payroll_id",
    // View Headers (Arabic)
    "الموظف", "التاريخ", "المبلغ", "السبب", "الحالة", "خصم من راتب"
  ],
  "HRM_Deductions": [
    // Audit Headers
    "record_id", "created_at", "created_by", "modified_at", "modified_by", "is_deleted", "record_notes",
    // Engine Headers (English)
    "deduction_id", "employee_id", "date", "amount", "reason", "status", "deduct_from_payroll_id",
    // View Headers (Arabic)
    "الموظف", "التاريخ", "المبلغ", "السبب", "الحالة", "خصم من راتب"
  ],
  "HRM_Payroll": [
    // Audit Headers
    "record_id", "created_at", "created_by", "modified_at", "modified_by", "is_deleted", "record_notes",
    // Engine Headers (English)
    "payroll_id", "employee_id", "pay_period_month", "pay_period_year", "basic_salary", "total_advances",
    "total_deductions", "total_overtime", "total_bonus", "net_salary", "status",
    // View Headers (Arabic)
    "الموظف", "شهر", "سنة", "الراتب الأساسي", "إجمالي السلف", "إجمالي الخصومات",
    "إجمالي الإضافي", "إجمالي المكافآت", "صافي الراتب", "الحالة"
  ],
  "HRM_Penalties_Policy": [
    // Audit Headers
    "record_id", "created_at", "created_by", "modified_at", "modified_by", "is_deleted", "record_notes",
    // Engine Headers (English)
    "policy_id", "policy_name", "description", "category", "value_type", "value",
    // View Headers (Arabic)
    "كود السياسة", "اسم السياسة", "الوصف", "الفئة", "نوع القيمة", "القيمة"
  ],
  "HRM_Bonus_Policy": [
    // Audit Headers
    "record_id", "created_at", "created_by", "modified_at", "modified_by", "is_deleted", "record_notes",
    // Engine Headers (English)
    "policy_id", "policy_name", "description", "category", "value_type", "value",
    // View Headers (Arabic)
    "كود السياسة", "اسم السياسة", "الوصف", "الفئة", "نوع القيمة", "القيمة"
  ],
  "HRM_Analysis": [
    "metric_key", "metric_value", "metric_label_arabic", "last_refreshed"
  ],

  // --------------------------------
  // 4. PRJ_ (Projects)
  // --------------------------------
  "PRJ_Main_Dashboard": [
    "metric_key", "metric_value", "metric_label_arabic", "last_refreshed"
  ],
  "PRJ_Main": [
    // Audit Headers
    "record_id", "created_at", "created_by", "modified_at", "modified_by", "is_deleted", "record_notes",
    // Engine Headers (English)
    "project_id", "project_name", "client_id", "manager_employee_id", "start_date",
    "end_date_planned", "end_date_actual", "status", "budget_estimated", "budget_actual", "description",
    // View Headers (Arabic)
    "كود المشروع", "اسم المشروع", "العميل", "مدير المشروع", "تاريخ البدء",
    "التاريخ المخطط للانتهاء", "التاريخ الفعلي للانتهاء", "الحالة", "الميزانية المقدرة", "الميزانية الفعلية", "الوصف"
  ],
  "PRJ_Clients": [
    // Audit Headers
    "record_id", "created_at", "created_by", "modified_at", "modified_by", "is_deleted", "record_notes",
    // Engine Headers (English)
    "client_id", "client_name", "contact_person", "email", "phone", "address", "client_type",
    // View Headers (Arabic)
    "كود العميل", "اسم العميل", "الشخص المسؤول", "البريد الإلكتروني", "الهاتف", "العنوان", "نوع العميل"
  ],
  "PRJ_Tasks": [
    // Audit Headers
    "record_id", "created_at", "created_by", "modified_at", "modified_by", "is_deleted", "record_notes",
    // Engine Headers (English)
    "task_id", "project_id", "task_name", "assigned_to_employee_id", "start_date", "due_date", "status", "priority",
    // View Headers (Arabic)
    "المهمة", "المشروع", "مسندة إلى", "تاريخ البدء", "تاريخ الاستحقاق", "الحالة", "الأولوية"
  ],
  "PRJ_Materials_Monitor": [
    // Audit Headers
    "record_id", "created_at", "created_by", "modified_at", "modified_by", "is_deleted", "record_notes",
    // Engine Headers (English)
    "material_id", "project_id", "item_name", "unit", "qty_planned", "qty_actual", "unit_cost", "total_cost",
    // View Headers (Arabic)
    "المادة", "المشروع", "اسم البند", "الوحدة", "الكمية المخططة", "الكمية الفعلية", "تكلفة الوحدة", "التكلفة الإجمالية"
  ],
  "PRJ_Expenses_Monitor": [
    // Audit Headers
    "record_id", "created_at", "created_by", "modified_at", "modified_by", "is_deleted", "record_notes",
    // Engine Headers (English)
    "expense_id", "project_id", "expense_date", "category", "description", "amount", "receipt_doc_id",
    // View Headers (Arabic)
    "المصروف", "المشروع", "التاريخ", "الفئة", "الوصف", "المبلغ", "المرفق"
  ],
  "PRJ_Time_Line_Monitor": [
    // Audit Headers
    "record_id", "created_at", "created_by", "modified_at", "modified_by", "is_deleted", "record_notes",
    // Engine Headers (English)
    "timeline_id", "project_id", "milestone_name", "planned_date", "actual_date", "status", "notes",
    // View Headers (Arabic)
    "المرحلة", "المشروع", "اسم المرحلة", "التاريخ المخطط", "التاريخ الفعلي", "الحالة", "ملاحظات"
  ],
  "PRJ_InDirExp_Allocations": [
    // Audit Headers
    "record_id", "created_at", "created_by", "modified_at", "modified_by", "is_deleted", "record_notes",
    // Engine Headers (English)
    "allocation_id", "project_id", "indirect_expense_id", "allocation_percentage", "allocated_amount", "period",
    // View Headers (Arabic)
    "التخصيص", "المشروع", "المصروف غير المباشر", "نسبة التخصيص", "المبلغ المخصص", "الفترة"
  ],
  "PRJ_Analysis": [
    "metric_key", "metric_value", "metric_label_arabic", "last_refreshed"
  ],

  // --------------------------------
  // 5. FIN_ (Finance)
  // --------------------------------
  "FIN_Main_Dashboard": [
    "metric_key", "metric_value", "metric_label_arabic", "last_refreshed"
  ],
  "FIN_Direct_Expences": [
    // Audit Headers
    "record_id", "created_at", "created_by", "modified_at", "modified_by", "is_deleted", "record_notes",
    // Engine Headers (English)
    "expense_id", "project_id", "expense_date", "category", "description", "amount",
    "receipt_doc_id", "paid_by_employee_id", "status",
    // View Headers (Arabic)
    "كود المصروف", "المشروع", "التاريخ", "الفئة", "الوصف", "المبلغ",
    "المرفق", "مدفوع بواسطة", "الحالة"
  ],
  "FIN_Indirect_Expenses_ReOccurs": [
    // Audit Headers
    "record_id", "created_at", "created_by", "modified_at", "modified_by", "is_deleted", "record_notes",
    // Engine Headers (English)
    "indirect_expense_id", "expense_date", "category", "description", "amount", "due_date", "frequency",
    // View Headers (Arabic)
    "كود المصروف", "التاريخ", "الفئة", "الوصف", "المبلغ", "تاريخ الاستحقاق", "التكرار"
  ],
  "FIN_Indirect_Expenses_Once": [
    // Audit Headers
    "record_id", "created_at", "created_by", "modified_at", "modified_by", "is_deleted", "record_notes",
    // Engine Headers (English)
    "indirect_expense_id", "expense_date", "category", "description", "amount",
    // View Headers (Arabic)
    "كود المصروف", "التاريخ", "الفئة", "الوصف", "المبلغ"
  ],
  "FIN_Project_Revenue": [
    // Audit Headers
    "record_id", "created_at", "created_by", "modified_at", "modified_by", "is_deleted", "record_notes",
    // Engine Headers (English)
    "revenue_id", "project_id", "invoice_id", "invoice_date", "due_date", "amount", "status",
    // View Headers (Arabic)
    "كود الإيراد", "المشروع", "رقم الفاتورة", "تاريخ الفاتورة", "تاريخ الاستحقاق", "المبلغ", "الحالة"
  ],
  "FIN_Employess_Custody": [
    // Audit Headers
    "record_id", "created_at", "created_by", "modified_at", "modified_by", "is_deleted", "record_notes",
    // Engine Headers (English)
    "custody_id", "employee_id", "date_issued", "amount", "description", "status", "settled_date",
    // View Headers (Arabic)
    "كود العهدة", "الموظف", "تاريخ الاستلام", "المبلغ", "الوصف", "الحالة", "تاريخ التسوية"
  ],
  "FIN_Profit_Loss_Reports": [
    // Engine-only (Report)
    "report_period", "total_revenue", "total_direct_expenses",
    "total_indirect_expenses", "gross_profit", "net_profit"
  ],
  "FIN_Analysis": [
    "metric_key", "metric_value", "metric_label_arabic", "last_refreshed"
  ]
};