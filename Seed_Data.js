/**
 * @file Seed_Data.js
 * @description Populates initial core data (roles, employees, admin user) for Nijjara ERP.
 * Run AFTER schema setup. Provides rollback on failure to maintain integrity.
 */

// ---------------------------------------------------------------------------
// --- CONFIG / CONSTANTS ---
// ---------------------------------------------------------------------------

const SEED_ADMIN_ROLE_NAME = 'Admin';
const SEED_EMPLOYEE_FULL_NAME = 'Mohamed Sherif Amin Elkhoraiby';
const SEED_ADMIN_USER_ID = 'mkhoraiby';
const SEED_ADMIN_EMAIL = 'm.elkhoraiby@gmail.com';
const SEED_ADMIN_PASSWORD = '210388'; // Will be hashed; consider replacing after initial seed.

// ---------------------------------------------------------------------------
// --- MASTER ORCHESTRATOR ---
// ---------------------------------------------------------------------------

/**
 * Master seeding function. Executes in dependency order with rollback.
 * Order: Roles -> Employee -> Admin User.
 */
function runSeedAllData() {
	logInfo_('runSeedAllData', 'Starting master seed process');
	const ss = SpreadsheetApp.getActiveSpreadsheet();

	const rollbackStack = []; // Each entry: { sheetName, rowNumber }

	try {
		const roleId = seedRoles_(ss, rollbackStack);
		const employeeId = seedEmployee_(ss, rollbackStack);
		seedAdminUser_(ss, roleId, employeeId, rollbackStack);

		logInfo_('runSeedAllData', 'Seed process completed successfully');
	} catch (e) {
		logError_('runSeedAllData', 'Seeding failed. Initiating rollback.', e);
		rollback_(ss, rollbackStack);
		throw e; // Surface failure for visibility.
	}
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

	// Generate role ID
	const roleId = 'ROLE-' + new Date().getTime();
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

	const employeeId = 'EMP-' + new Date().getTime();
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
	if ([userIdIdx, emailIdx, roleIdIdx, employeeIdIdx, fullNameIdx, passwordHashIdx].some(i => i === -1)) {
		throw new Error('Required headers missing in SYS_Users');
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
		full_name: SEED_EMPLOYEE_FULL_NAME,
		role_id: roleId,
		employee_id: employeeId,
		is_active: true,
		phone: '',
		created_at: new Date(),
		is_deleted: false,
		record_notes: 'Initial admin seed',
		// Store salt in an extension column if schema later adds it; for now log it.
	});
	sheet.appendRow(newRow);
	const appendedRowNumber = sheet.getLastRow();
	rollbackStack.push({ sheetName: 'SYS_Users', rowNumber: appendedRowNumber });
	logInfo_('seedAdminUser_', 'Inserted admin user ' + SEED_ADMIN_USER_ID + ' with role ' + roleId);
	logInfo_('seedAdminUser_', 'Admin user salt (store separately if schema extended): ' + salt);
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

