/**
 * @file Seed_Data.js
 * @description Populates ALL initial data for Nijjara ERP.
 * Run AFTER Setup.js schema setup. Provides rollback on failure to maintain integrity.
 * 
 * EXECUTION ORDER:
 * 1. Setup.js - runInitialSetup() - Creates all sheets and headers
 * 2. Seed_Data.js - runSeedAllData() - Seeds ALL initial data
 * 3. Seed_Functions.js - runApplyAllFormulas() - Links Arabic columns to English
 */

// ---------------------------------------------------------------------------
// --- CONFIG / CONSTANTS ---
// ---------------------------------------------------------------------------

const SEED_ADMIN_ROLE_NAME = 'Admin';
const SEED_EMPLOYEE_FULL_NAME = 'Mohamed Sherif Amin Elkhoraiby';
const SEED_ADMIN_USER_ID = 'mkhoraiby';
const SEED_ADMIN_EMAIL = 'm.elkhoraiby@gmail.com';
const SEED_ADMIN_PASSWORD = '210388'; // Will be hashed; change after first login.

const HRM_TAB_REGISTER_ENTRIES = [
	{
		tab_id: 'HRM',
		tab_label_arabic: 'الموارد البشرية',
		sub_tab_id: '',
		sub_tab_label_arabic: '',
		sort_order: 100,
		icon_name: 'groups',
		source_sheet: '',
		view_columns_arabic: '',
		form_id_add: '',
		form_id_view: '',
		add_button_label_arabic: '',
		required_permission: ''
	},
	{
		tab_id: 'HRM',
		tab_label_arabic: 'الموارد البشرية',
		sub_tab_id: 'HRM_EMPLOYEES',
		sub_tab_label_arabic: 'الموظفين',
		sort_order: 101,
		icon_name: 'badge',
		source_sheet: 'HRM_Employees',
		view_columns_arabic: 'كود الموظف,اسم الموظف,المسمى الوظيفي,الإدارة,الحالة',
		form_id_add: 'FORM_ADD_EMPLOYEE',
		form_id_view: 'FORM_VIEW_EMPLOYEE',
		add_button_label_arabic: 'إضافة موظف جديد',
		required_permission: 'hr_read'
	}
];

// ---------------------------------------------------------------------------
// --- ID GENERATION UTILITIES ---
// ---------------------------------------------------------------------------

/**
 * Generates a sequential ID in the format PREFIX-0001, PREFIX-0002, etc.
 * Scans existing IDs in the specified column and returns the next available number.
 * 
 * @param {GoogleAppsScript.Spreadsheet.Sheet} sheet - The sheet to scan
 * @param {string[]} headers - The header row
 * @param {string} idColumnName - The name of the ID column (e.g., 'role_id')
 * @param {string} prefix - The prefix for the ID (e.g., 'ROLE')
 * @returns {string} The next sequential ID (e.g., 'ROLE-0001')
 */
function generateSequentialId_(sheet, headers, idColumnName, prefix) {
	const idIdx = headers.indexOf(idColumnName);
	if (idIdx === -1) throw new Error(`Column ${idColumnName} not found in headers`);
	
	const data = getDataBody_(sheet, headers);
	let maxNumber = 0;
	
	// Scan all existing IDs to find the highest number
	for (let r = 0; r < data.length; r++) {
		const existingId = String(data[r][idIdx] || '').trim();
		if (existingId.startsWith(prefix + '-')) {
			const numPart = existingId.substring(prefix.length + 1);
			const num = parseInt(numPart, 10);
			if (!isNaN(num) && num > maxNumber) {
				maxNumber = num;
			}
		}
	}
	
	// Generate next ID with zero-padding
	const nextNumber = maxNumber + 1;
	const paddedNumber = String(nextNumber).padStart(4, '0');
	return prefix + '-' + paddedNumber;
}

// ---------------------------------------------------------------------------
// --- MASTER ORCHESTRATOR ---
// ---------------------------------------------------------------------------

/**
 * Master seeding function. Executes ALL seeding in dependency order with rollback.
 * Order: Settings → Tab Register → Dropdowns → Departments → Roles → Permissions → Employee → Admin User
 */
function runSeedAllData() {
	logInfo_('runSeedAllData', 'Starting COMPLETE seed process for ALL data');
	const ss = SpreadsheetApp.getActiveSpreadsheet();
	const rollbackStack = []; // Each entry: { sheetName, rowNumber }

	try {
		// 1. Seed System Settings
		seedSystemSettings_(ss, rollbackStack);
		
		// 2. Seed Tab Register for HRM module navigation
		seedTabRegister_(ss, rollbackStack);
		
		// 3. Seed Dropdowns
		seedDropdowns_(ss, rollbackStack);
		
		// 4. Seed Departments
		seedDepartments_(ss, rollbackStack);
		
		// 5. Seed Roles
		const roleId = seedRoles_(ss, rollbackStack);
		
		// 6. Seed Permissions
		seedPermissions_(ss, rollbackStack);
		
		// 7. Seed Employee
		const employeeId = seedEmployee_(ss, rollbackStack);
		
		// 8. Seed Admin User
		seedAdminUser_(ss, roleId, employeeId, rollbackStack);

		logInfo_('runSeedAllData', 'COMPLETE seed process finished successfully');
		logInfo_('runSeedAllData', '✅ ALL DATA SEEDED - System ready for use');
		
	} catch (e) {
		logError_('runSeedAllData', 'Seeding failed. Initiating rollback.', e);
		rollback_(ss, rollbackStack);
		throw e; // Surface failure for visibility.
	}
}

// ---------------------------------------------------------------------------
// --- SYSTEM SETTINGS SEEDING ---
// ---------------------------------------------------------------------------

/**
 * Seeds essential system settings.
 * @param {SpreadsheetApp.Spreadsheet} ss
 * @param {Array} rollbackStack
 */
function seedSystemSettings_(ss, rollbackStack) {
	const sheet = getSheetOrThrow_(ss, 'SET_Settings');
	const headers = getHeaders_(sheet);
	
	// Check if already seeded
	const data = getDataBody_(sheet, headers);
	if (data.length > 0) {
		logInfo_('seedSystemSettings_', 'System settings already exist. Skipping.');
		return;
	}
	
	const settings = [
		{ setting_key: 'company_name', setting_value: 'Nijjara ERP Company', description: 'Company name for reports and branding' },
		{ setting_key: 'default_currency', setting_value: 'EGP', description: 'Default currency for financial calculations' },
		{ setting_key: 'fiscal_year_start', setting_value: '01-01', description: 'Fiscal year start date (MM-DD)' },
		{ setting_key: 'timezone', setting_value: 'Africa/Cairo', description: 'System timezone' },
		{ setting_key: 'date_format', setting_value: 'DD/MM/YYYY', description: 'Default date format' },
		{ setting_key: 'language', setting_value: 'ar', description: 'Default system language' }
	];
	
	settings.forEach(setting => {
		const newRow = buildRow_(headers, setting);
		sheet.appendRow(newRow);
		rollbackStack.push({ sheetName: 'SET_Settings', rowNumber: sheet.getLastRow() });
	});
	
	logInfo_('seedSystemSettings_', `Seeded ${settings.length} system settings`);
}

// ---------------------------------------------------------------------------
// --- TAB REGISTER SEEDING ---
// ---------------------------------------------------------------------------

/**
 * Seeds SET_Tab_Register with HRM navigation entries if missing.
 * @param {SpreadsheetApp.Spreadsheet} ss
 * @param {Array} rollbackStack
 */
function seedTabRegister_(ss, rollbackStack) {
	const sheet = getSheetOrThrow_(ss, 'SET_Tab_Register');
	const headers = getHeaders_(sheet);
	const tabIdIdx = headers.indexOf('tab_id');
	const subTabIdIdx = headers.indexOf('sub_tab_id');
	if (tabIdIdx === -1 || subTabIdIdx === -1) {
		throw new Error('Required headers missing in SET_Tab_Register');
	}

	const data = getDataBody_(sheet, headers);
	const existingKeys = data.map(row => ({
		tabId: String(row[tabIdIdx] || '').trim().toLowerCase(),
		subTabId: String(row[subTabIdIdx] || '').trim().toLowerCase()
	}));

	let insertedCount = 0;
	HRM_TAB_REGISTER_ENTRIES.forEach(entry => {
		const targetTabId = entry.tab_id.toLowerCase();
		const targetSubTabId = (entry.sub_tab_id || '').toLowerCase();
		const alreadyExists = existingKeys.some(record => record.tabId === targetTabId && record.subTabId === targetSubTabId);
		if (alreadyExists) {
			return;
		}

		const newRow = buildRow_(headers, entry);
		sheet.appendRow(newRow);
		rollbackStack.push({ sheetName: 'SET_Tab_Register', rowNumber: sheet.getLastRow() });
		existingKeys.push({ tabId: targetTabId, subTabId: targetSubTabId });
		insertedCount++;
	});

	if (insertedCount === 0) {
		logInfo_('seedTabRegister_', 'HRM tab register entries already exist. Skipping.');
		return;
	}

	logInfo_('seedTabRegister_', `Inserted ${insertedCount} HRM tab register entries into SET_Tab_Register.`);
}

// ---------------------------------------------------------------------------
// --- DROPDOWNS SEEDING ---
// ---------------------------------------------------------------------------

/**
 * Seeds dropdown values for the system.
 * @param {SpreadsheetApp.Spreadsheet} ss
 * @param {Array} rollbackStack
 */
function seedDropdowns_(ss, rollbackStack) {
	const sheet = getSheetOrThrow_(ss, 'SET_Dropdowns');
	const headers = getHeaders_(sheet);
	
	// Check if already seeded
	const data = getDataBody_(sheet, headers);
	if (data.length > 0) {
		logInfo_('seedDropdowns_', 'Dropdowns already exist. Skipping.');
		return;
	}
	
	const dropdowns = [
		// Leave types
		{ list_id: 'leave_type', value_engine: 'annual', display_arabic: 'إجازة سنوية', sort_order: 1 },
		{ list_id: 'leave_type', value_engine: 'sick', display_arabic: 'إجازة مرضية', sort_order: 2 },
		{ list_id: 'leave_type', value_engine: 'emergency', display_arabic: 'إجازة طارئة', sort_order: 3 },
		{ list_id: 'leave_type', value_engine: 'maternity', display_arabic: 'إجازة أمومة', sort_order: 4 },
		// Project status
		{ list_id: 'project_status', value_engine: 'planning', display_arabic: 'تخطيط', sort_order: 1 },
		{ list_id: 'project_status', value_engine: 'active', display_arabic: 'نشط', sort_order: 2 },
		{ list_id: 'project_status', value_engine: 'on_hold', display_arabic: 'متوقف', sort_order: 3 },
		{ list_id: 'project_status', value_engine: 'completed', display_arabic: 'مكتمل', sort_order: 4 },
		{ list_id: 'project_status', value_engine: 'cancelled', display_arabic: 'ملغي', sort_order: 5 },
		// Task priority
		{ list_id: 'task_priority', value_engine: 'low', display_arabic: 'منخفضة', sort_order: 1 },
		{ list_id: 'task_priority', value_engine: 'medium', display_arabic: 'متوسطة', sort_order: 2 },
		{ list_id: 'task_priority', value_engine: 'high', display_arabic: 'عالية', sort_order: 3 },
		{ list_id: 'task_priority', value_engine: 'urgent', display_arabic: 'عاجلة', sort_order: 4 },
		// Expense categories
		{ list_id: 'expense_category', value_engine: 'materials', display_arabic: 'مواد', sort_order: 1 },
		{ list_id: 'expense_category', value_engine: 'labor', display_arabic: 'عمالة', sort_order: 2 },
		{ list_id: 'expense_category', value_engine: 'equipment', display_arabic: 'معدات', sort_order: 3 },
		{ list_id: 'expense_category', value_engine: 'transportation', display_arabic: 'مواصلات', sort_order: 4 },
		{ list_id: 'expense_category', value_engine: 'other', display_arabic: 'أخرى', sort_order: 5 }
	];
	
	dropdowns.forEach(dropdown => {
		const newRow = buildRow_(headers, dropdown);
		sheet.appendRow(newRow);
		rollbackStack.push({ sheetName: 'SET_Dropdowns', rowNumber: sheet.getLastRow() });
	});
	
	logInfo_('seedDropdowns_', `Seeded ${dropdowns.length} dropdown values`);
}

// ---------------------------------------------------------------------------
// --- DEPARTMENTS SEEDING ---
// ---------------------------------------------------------------------------

/**
 * Seeds sample departments.
 * @param {SpreadsheetApp.Spreadsheet} ss
 * @param {Array} rollbackStack
 */
function seedDepartments_(ss, rollbackStack) {
	const sheet = getSheetOrThrow_(ss, 'HRM_Departments');
	const headers = getHeaders_(sheet);
	
	// Check if already seeded
	const data = getDataBody_(sheet, headers);
	if (data.length > 0) {
		logInfo_('seedDepartments_', 'Departments already exist. Skipping.');
		return;
	}
	
	const departments = [
		{ department_id: generateSequentialId_(sheet, headers, 'department_id', 'DEPT'), department_name_english: 'Human Resources', manager_employee_id: '', created_at: new Date(), is_deleted: false, record_notes: 'Auto-generated' },
		{ department_id: generateSequentialId_(sheet, headers, 'department_id', 'DEPT'), department_name_english: 'Information Technology', manager_employee_id: '', created_at: new Date(), is_deleted: false, record_notes: 'Auto-generated' },
		{ department_id: generateSequentialId_(sheet, headers, 'department_id', 'DEPT'), department_name_english: 'Finance', manager_employee_id: '', created_at: new Date(), is_deleted: false, record_notes: 'Auto-generated' },
		{ department_id: generateSequentialId_(sheet, headers, 'department_id', 'DEPT'), department_name_english: 'Operations', manager_employee_id: '', created_at: new Date(), is_deleted: false, record_notes: 'Auto-generated' },
		{ department_id: generateSequentialId_(sheet, headers, 'department_id', 'DEPT'), department_name_english: 'Sales', manager_employee_id: '', created_at: new Date(), is_deleted: false, record_notes: 'Auto-generated' }
	];
	
	departments.forEach(dept => {
		const newRow = buildRow_(headers, dept);
		sheet.appendRow(newRow);
		rollbackStack.push({ sheetName: 'HRM_Departments', rowNumber: sheet.getLastRow() });
	});
	
	logInfo_('seedDepartments_', `Seeded ${departments.length} departments`);
}

// ---------------------------------------------------------------------------
// --- PERMISSIONS SEEDING ---
// ---------------------------------------------------------------------------

/**
 * Seeds system permissions.
 * @param {SpreadsheetApp.Spreadsheet} ss
 * @param {Array} rollbackStack
 */
function seedPermissions_(ss, rollbackStack) {
	const sheet = getSheetOrThrow_(ss, 'SYS_Permissions');
	const headers = getHeaders_(sheet);
	
	// Check if already seeded
	const data = getDataBody_(sheet, headers);
	if (data.length > 0) {
		logInfo_('seedPermissions_', 'Permissions already exist. Skipping.');
		return;
	}
	
	const permissions = [
		{ permission_id: 'users_create', permission_group: 'Users', description: 'Create new users', created_at: new Date(), is_deleted: false },
		{ permission_id: 'users_read', permission_group: 'Users', description: 'View users', created_at: new Date(), is_deleted: false },
		{ permission_id: 'users_update', permission_group: 'Users', description: 'Edit user information', created_at: new Date(), is_deleted: false },
		{ permission_id: 'users_delete', permission_group: 'Users', description: 'Delete users', created_at: new Date(), is_deleted: false },
		{ permission_id: 'hr_read', permission_group: 'HR', description: 'View HR data', created_at: new Date(), is_deleted: false },
		{ permission_id: 'hr_manage', permission_group: 'HR', description: 'Manage HR data', created_at: new Date(), is_deleted: false },
		{ permission_id: 'projects_read', permission_group: 'Projects', description: 'View projects', created_at: new Date(), is_deleted: false },
		{ permission_id: 'projects_manage', permission_group: 'Projects', description: 'Manage projects', created_at: new Date(), is_deleted: false },
		{ permission_id: 'finance_read', permission_group: 'Finance', description: 'View financial data', created_at: new Date(), is_deleted: false },
		{ permission_id: 'finance_manage', permission_group: 'Finance', description: 'Manage financial data', created_at: new Date(), is_deleted: false }
	];
	
	permissions.forEach(perm => {
		const newRow = buildRow_(headers, perm);
		sheet.appendRow(newRow);
		rollbackStack.push({ sheetName: 'SYS_Permissions', rowNumber: sheet.getLastRow() });
	});
	
	logInfo_('seedPermissions_', `Seeded ${permissions.length} permissions`);
}

// ---------------------------------------------------------------------------
// --- ROLE SEEDING ---
// ---------------------------------------------------------------------------

/**
 * Inserts the Admin role if it does not already exist.
 * @param {SpreadsheetApp.Spreadsheet} ss
 * @param {Array} rollbackStack
 * @returns {string} roleId
 */
function seedRoles_(ss, rollbackStack) {
	const sheet = getSheetOrThrow_(ss, 'SYS_Roles');
	const headers = getHeaders_(sheet);
	const roleNameIdx = headers.indexOf('role_name_english');
	const roleIdIdx = headers.indexOf('role_id');
	if (roleNameIdx === -1 || roleIdIdx === -1) throw new Error('Required headers missing in SYS_Roles');

	const data = getDataBody_(sheet, headers);
	for (let r = 0; r < data.length; r++) {
		if ((data[r][roleNameIdx] + '').trim().toLowerCase() === SEED_ADMIN_ROLE_NAME.toLowerCase()) {
			const existingId = data[r][roleIdIdx];
			logInfo_('seedRoles_', 'Admin role already exists: ' + existingId);
			return existingId;
		}
	}

	// Generate sequential role ID (ROLE-0001, ROLE-0002, etc.)
	const roleId = generateSequentialId_(sheet, headers, 'role_id', 'ROLE');
	const newRow = buildRow_(headers, {
		role_id: roleId,
		role_name_english: SEED_ADMIN_ROLE_NAME,
		description: 'System Administrator Role',
		created_at: new Date(),
		is_deleted: false
	});
	sheet.appendRow(newRow);
	const appendedRowNumber = sheet.getLastRow();
	rollbackStack.push({ sheetName: 'SYS_Roles', rowNumber: appendedRowNumber });
	logInfo_('seedRoles_', 'Inserted Admin role with ID ' + roleId);
	return roleId;
}

// ---------------------------------------------------------------------------
// --- EMPLOYEE SEEDING ---
// ---------------------------------------------------------------------------

/**
 * Inserts seed employee if missing.
 * @param {SpreadsheetApp.Spreadsheet} ss
 * @param {Array} rollbackStack
 * @returns {string} employeeId
 */
function seedEmployee_(ss, rollbackStack) {
	const sheet = getSheetOrThrow_(ss, 'HRM_Employees');
	const headers = getHeaders_(sheet);
	const fullNameEnglishIdx = headers.indexOf('full_name_english');
	const employeeIdIdx = headers.indexOf('employee_id');
	if (fullNameEnglishIdx === -1 || employeeIdIdx === -1) throw new Error('Required headers missing in HRM_Employees');

	const data = getDataBody_(sheet, headers);
	for (let r = 0; r < data.length; r++) {
		if ((data[r][fullNameEnglishIdx] + '').trim().toLowerCase() === SEED_EMPLOYEE_FULL_NAME.toLowerCase()) {
			const existingId = data[r][employeeIdIdx];
			logInfo_('seedEmployee_', 'Seed employee already exists: ' + existingId);
			return existingId;
		}
	}

	// Generate sequential employee ID (EMP-0001, EMP-0002, etc.)
	const employeeId = generateSequentialId_(sheet, headers, 'employee_id', 'EMP');
	const newRow = buildRow_(headers, {
		employee_id: employeeId,
		full_name_english: SEED_EMPLOYEE_FULL_NAME,
		full_name_arabic: 'محمد شريف أمين الخرِيبي',
		national_id: 'N/A',
		job_title: 'System Administrator',
		status: 'ACTIVE',
		hire_date: new Date(),
		created_at: new Date(),
		is_deleted: false
	});
	sheet.appendRow(newRow);
	const appendedRowNumber = sheet.getLastRow();
	rollbackStack.push({ sheetName: 'HRM_Employees', rowNumber: appendedRowNumber });
	logInfo_('seedEmployee_', 'Inserted seed employee with ID ' + employeeId);
	return employeeId;
}

// ---------------------------------------------------------------------------
// --- ADMIN USER SEEDING ---
// ---------------------------------------------------------------------------

/**
 * Seeds SYS_Users with the initial admin user.
 * @param {SpreadsheetApp.Spreadsheet} ss
 * @param {string} roleId
 * @param {string} employeeId
 * @param {Array} rollbackStack
 */
function seedAdminUser_(ss, roleId, employeeId, rollbackStack) {
	const sheet = getSheetOrThrow_(ss, 'SYS_Users');
	const headers = getHeaders_(sheet);
	const userIdIdx = headers.indexOf('user_id');
	const emailIdx = headers.indexOf('email');
	const roleIdIdx = headers.indexOf('role_id');
	const employeeIdIdx = headers.indexOf('employee_id');
	const fullNameIdx = headers.indexOf('full_name');
	const passwordHashIdx = headers.indexOf('password_hash');
	const passwordSaltIdx = headers.indexOf('password_salt');
	
	if ([userIdIdx, emailIdx, roleIdIdx, employeeIdIdx, fullNameIdx, passwordHashIdx, passwordSaltIdx].some(i => i === -1)) {
		throw new Error('Required headers missing in SYS_Users. Please check that password_salt column exists.');
	}

	// Check existing user uniqueness
	const data = getDataBody_(sheet, headers);
	for (let r = 0; r < data.length; r++) {
		const existingUserId = (data[r][userIdIdx] + '').trim().toLowerCase();
		const existingEmail = (data[r][emailIdx] + '').trim().toLowerCase();
		if (existingUserId === SEED_ADMIN_USER_ID.toLowerCase() || existingEmail === SEED_ADMIN_EMAIL.toLowerCase()) {
			logInfo_('seedAdminUser_', 'Admin user already exists. Skipping creation.');
			return;
		}
	}

	// Basic email format validation
	if (!/^\S+@\S+\.\S+$/.test(SEED_ADMIN_EMAIL)) {
		throw new Error('Seed admin email format invalid: ' + SEED_ADMIN_EMAIL);
	}

	// Hash password
	const { hash, salt } = hashPassword_(SEED_ADMIN_PASSWORD);

	const newRow = buildRow_(headers, {
		user_id: SEED_ADMIN_USER_ID,
		email: SEED_ADMIN_EMAIL,
		password_hash: hash,
		password_salt: salt,
		full_name: SEED_EMPLOYEE_FULL_NAME,
		role_id: roleId,
		employee_id: employeeId,
		is_active: true,
		phone: '',
		created_at: new Date(),
		is_deleted: false,
		record_notes: 'Initial admin seed - Password: 210388 (CHANGE IMMEDIATELY AFTER FIRST LOGIN)'
	});
	sheet.appendRow(newRow);
	const appendedRowNumber = sheet.getLastRow();
	rollbackStack.push({ sheetName: 'SYS_Users', rowNumber: appendedRowNumber });
	logInfo_('seedAdminUser_', 'Inserted admin user ' + SEED_ADMIN_USER_ID + ' with role ' + roleId);
	logInfo_('seedAdminUser_', '⚠️ DEFAULT PASSWORD: 210388 - MUST BE CHANGED AFTER FIRST LOGIN');
}

// ---------------------------------------------------------------------------
// --- ROLLBACK ENGINE ---
// ---------------------------------------------------------------------------

/**
 * Rolls back appended rows in reverse order.
 * @param {SpreadsheetApp.Spreadsheet} ss
 * @param {Array<{sheetName:string,rowNumber:number}>} stack
 */
function rollback_(ss, stack) {
	for (let i = stack.length - 1; i >= 0; i--) {
		const { sheetName, rowNumber } = stack[i];
		try {
			const sheet = ss.getSheetByName(sheetName);
			if (sheet && rowNumber > 1) {
				sheet.deleteRow(rowNumber);
				logWarn_('rollback_', 'Deleted row ' + rowNumber + ' from ' + sheetName);
			}
		} catch (e) {
			logError_('rollback_', 'Failed to delete row ' + rowNumber + ' from ' + sheetName, e);
		}
	}
}

// ---------------------------------------------------------------------------
// --- UTILITIES ---
// ---------------------------------------------------------------------------

function getSheetOrThrow_(ss, name) {
	const sheet = ss.getSheetByName(name);
	if (!sheet) throw new Error('Sheet not found: ' + name);
	return sheet;
}

function getHeaders_(sheet) {
	return sheet.getRange(1, 1, 1, sheet.getMaxColumns()).getValues()[0];
}

/**
 * Builds a row array aligned with headers; fills unspecified cells blank.
 * @param {string[]} headers
 * @param {Object} values
 */
function buildRow_(headers, values) {
	return headers.map(h => {
		const v = values.hasOwnProperty(h) ? values[h] : '';
		return v;
	});
}

/**
 * Safely reads the data rows under headers. Returns [] when no rows.
 * @param {GoogleAppsScript.Spreadsheet.Sheet} sheet
 * @param {string[]} headers
 * @returns {any[][]}
 */
function getDataBody_(sheet, headers) {
	const lastRow = sheet.getLastRow();
	if (lastRow <= 1) return [];
	const numRows = lastRow - 1;
	return sheet.getRange(2, 1, numRows, headers.length).getValues();
}

