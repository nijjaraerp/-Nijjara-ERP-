/* ============================================
   NIJJARA ERP - AUTHENTICATION MODULE
   Server-side authentication, session management, security checks
   ============================================ */

/**
 * Authenticate user with username and password
 * @param {string} username - The username
 * @param {string} password - The password
 * @returns {Object} Authentication response with session token and user data
 */
function authenticateUser(username, password) {
  const functionName = 'authenticateUser';
  logInfo_(functionName, `Authentication attempt for user: ${username}`);
  
  try {
    // Input validation
    if (!username || !password) {
      logWarn_(functionName, 'Missing username or password');
      return {
        success: false,
        message: 'يرجى إدخال اسم المستخدم وكلمة المرور'
      };
    }
    
    // Sanitize username
    username = username.toString().trim().toLowerCase();
    
    // Get SYS_Users sheet
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const usersSheet = ss.getSheetByName('SYS_Users');
    
    if (!usersSheet) {
      logError_(functionName, 'SYS_Users sheet not found');
      return {
        success: false,
        message: 'خطأ في النظام. يرجى الاتصال بالدعم الفني.'
      };
    }
    
    // Get all user data
    const data = usersSheet.getDataRange().getValues();
    const headers = data[0];
    const rows = data.slice(1);
    
    // Find column indices
    const usernameCol = headers.indexOf('username');
    const passwordHashCol = headers.indexOf('password_hash');
    const passwordSaltCol = headers.indexOf('password_salt');
    const isActiveCol = headers.indexOf('is_active');
    const employeeIdCol = headers.indexOf('employee_id');
    const roleIdCol = headers.indexOf('role_id');
    
    // Validate required columns exist
    if (usernameCol === -1 || passwordHashCol === -1 || passwordSaltCol === -1) {
      logError_(functionName, 'Required columns not found in SYS_Users');
      return {
        success: false,
        message: 'خطأ في تكوين النظام'
      };
    }
    
    // Find user by username
    let userRow = null;
    let userIndex = -1;
    
    for (let i = 0; i < rows.length; i++) {
      if (rows[i][usernameCol] && rows[i][usernameCol].toString().toLowerCase() === username) {
        userRow = rows[i];
        userIndex = i + 2; // +2 because of header row and 0-based index
        break;
      }
    }
    
    // Check if user exists
    if (!userRow) {
      logWarn_(functionName, `User not found: ${username}`);
      return {
        success: false,
        message: 'اسم المستخدم أو كلمة المرور غير صحيحة'
      };
    }
    
    // Check if user is active
    if (isActiveCol !== -1 && !userRow[isActiveCol]) {
      logWarn_(functionName, `Inactive user attempted login: ${username}`);
      return {
        success: false,
        message: 'هذا الحساب غير نشط. يرجى الاتصال بالمسؤول.'
      };
    }
    
    // Get stored password hash and salt
    const storedHash = userRow[passwordHashCol];
    const storedSalt = userRow[passwordSaltCol];
    
    if (!storedHash || !storedSalt) {
      logError_(functionName, `Missing password data for user: ${username}`);
      return {
        success: false,
        message: 'خطأ في بيانات المستخدم'
      };
    }
    
    // Verify password using Auth_Password.js
    const isPasswordValid = checkPassword_(password, storedHash, storedSalt);
    
    if (!isPasswordValid) {
      logWarn_(functionName, `Invalid password for user: ${username}`);
      return {
        success: false,
        message: 'اسم المستخدم أو كلمة المرور غير صحيحة'
      };
    }
    
    // Password is valid - proceed with authentication
    logInfo_(functionName, `Authentication successful for user: ${username}`);
    
    // Generate session token
    const sessionToken = generateSessionToken_();
    
    // Get user details
    const employeeId = userRow[employeeIdCol];
    const roleId = userRow[roleIdCol];
    
    // Get employee details (name, etc.)
    const employeeDetails = getEmployeeDetails_(employeeId);
    
    // Get role details and permissions
    const roleDetails = getRoleDetails_(roleId);
    
    // Build user object
    const user = {
      username: username,
      employeeId: employeeId,
      employeeName: employeeDetails.name || username,
      roleId: roleId,
      roleName: roleDetails.name || 'مستخدم',
      email: employeeDetails.email || '',
      department: employeeDetails.department || ''
    };
    
    // Get bootstrap data (tabs, settings, etc.)
    const bootstrapData = getBootstrapData_(roleId);
    
    // Update last login timestamp (optional)
    updateLastLogin_(username);
    
    // Return success response
    return {
      success: true,
      message: 'تم تسجيل الدخول بنجاح',
      sessionToken: sessionToken,
      user: user,
      permissions: bootstrapData.permissions,
      tabs: bootstrapData.tabs,
      settings: bootstrapData.settings
    };
    
  } catch (error) {
    logError_(functionName, 'Authentication error', error);
    return {
      success: false,
      message: 'حدث خطأ أثناء تسجيل الدخول'
    };
  }
}

/**
 * Generate a session token
 * @returns {string} Session token
 */
function generateSessionToken_() {
  const timestamp = new Date().getTime();
  const random = Math.random().toString(36).substring(2);
  return `${timestamp}-${random}`;
}

/**
 * Get employee details by ID
 * @param {string} employeeId - Employee ID
 * @returns {Object} Employee details
 */
function getEmployeeDetails_(employeeId) {
  try {
    if (!employeeId) {
      return { name: '', email: '', department: '' };
    }
    
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const employeeSheet = ss.getSheetByName('EMP_Employee_Registry');
    
    if (!employeeSheet) {
      logWarn_('getEmployeeDetails_', 'EMP_Employee_Registry sheet not found');
      return { name: '', email: '', department: '' };
    }
    
    const data = employeeSheet.getDataRange().getValues();
    const headers = data[0];
    const rows = data.slice(1);
    
    const idCol = headers.indexOf('employee_id');
    const nameCol = headers.indexOf('full_name_english');
    const emailCol = headers.indexOf('email');
    const deptCol = headers.indexOf('department');
    
    for (let i = 0; i < rows.length; i++) {
      if (rows[i][idCol] === employeeId) {
        return {
          name: rows[i][nameCol] || '',
          email: rows[i][emailCol] || '',
          department: rows[i][deptCol] || ''
        };
      }
    }
    
    return { name: '', email: '', department: '' };
    
  } catch (error) {
    logError_('getEmployeeDetails_', 'Error fetching employee details', error);
    return { name: '', email: '', department: '' };
  }
}

/**
 * Get role details and name
 * @param {string} roleId - Role ID
 * @returns {Object} Role details
 */
function getRoleDetails_(roleId) {
  try {
    if (!roleId) {
      return { name: 'مستخدم' };
    }
    
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const rolesSheet = ss.getSheetByName('SYS_Roles');
    
    if (!rolesSheet) {
      logWarn_('getRoleDetails_', 'SYS_Roles sheet not found');
      return { name: 'مستخدم' };
    }
    
    const data = rolesSheet.getDataRange().getValues();
    const headers = data[0];
    const rows = data.slice(1);
    
    const idCol = headers.indexOf('role_id');
    const nameCol = headers.indexOf('role_name_arabic');
    
    for (let i = 0; i < rows.length; i++) {
      if (rows[i][idCol] === roleId) {
        return {
          name: rows[i][nameCol] || 'مستخدم'
        };
      }
    }
    
    return { name: 'مستخدم' };
    
  } catch (error) {
    logError_('getRoleDetails_', 'Error fetching role details', error);
    return { name: 'مستخدم' };
  }
}

/**
 * Get bootstrap data for workspace (tabs, permissions, settings)
 * @param {string} roleId - User's role ID
 * @returns {Object} Bootstrap data
 */
function getBootstrapData_(roleId) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    
    // Get permissions for this role
    const permissions = getRolePermissions_(roleId);
    
    // Get tabs accessible to this role
    const tabs = getAccessibleTabs_(roleId, permissions);
    
    // Get system settings
    const settings = getSystemSettings_();
    
    return {
      permissions: permissions,
      tabs: tabs,
      settings: settings
    };
    
  } catch (error) {
    logError_('getBootstrapData_', 'Error fetching bootstrap data', error);
    return {
      permissions: [],
      tabs: [],
      settings: {}
    };
  }
}

/**
 * Get permissions for a role
 * @param {string} roleId - Role ID
 * @returns {Array} Array of permission objects
 */
function getRolePermissions_(roleId) {
  try {
    if (!roleId) {
      return [];
    }
    
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const permissionsSheet = ss.getSheetByName('SYS_Permissions');
    
    if (!permissionsSheet) {
      logWarn_('getRolePermissions_', 'SYS_Permissions sheet not found');
      return [];
    }
    
    const data = permissionsSheet.getDataRange().getValues();
    const headers = data[0];
    const rows = data.slice(1);
    
    const roleIdCol = headers.indexOf('role_id');
    const resourceCol = headers.indexOf('resource');
    const canCreateCol = headers.indexOf('can_create');
    const canReadCol = headers.indexOf('can_read');
    const canUpdateCol = headers.indexOf('can_update');
    const canDeleteCol = headers.indexOf('can_delete');
    
    const permissions = [];
    
    for (let i = 0; i < rows.length; i++) {
      if (rows[i][roleIdCol] === roleId) {
        permissions.push({
          resource: rows[i][resourceCol],
          canCreate: rows[i][canCreateCol] || false,
          canRead: rows[i][canReadCol] || false,
          canUpdate: rows[i][canUpdateCol] || false,
          canDelete: rows[i][canDeleteCol] || false
        });
      }
    }
    
    return permissions;
    
  } catch (error) {
    logError_('getRolePermissions_', 'Error fetching permissions', error);
    return [];
  }
}

/**
 * Get accessible tabs for a role
 * @param {string} roleId - Role ID
 * @param {Array} permissions - User's permissions
 * @returns {Array} Array of tab configurations
 */
function getAccessibleTabs_(roleId, permissions) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const tabsSheet = ss.getSheetByName('SET_Tab_Register');
    
    if (!tabsSheet) {
      logWarn_('getAccessibleTabs_', 'SET_Tab_Register sheet not found');
      return [];
    }
    
    const data = tabsSheet.getDataRange().getValues();
    const headers = data[0];
    const rows = data.slice(1);
    
    const isActiveCol = headers.indexOf('is_active');
    const tabIdCol = headers.indexOf('tab_id');
    const tabNameCol = headers.indexOf('tab_name_arabic');
    const iconCol = headers.indexOf('icon');
    const categoryCol = headers.indexOf('category');
    
    const tabs = [];
    
    // Get resources user has read permission for
    const readableResources = permissions
      .filter(p => p.canRead)
      .map(p => p.resource);
    
    for (let i = 0; i < rows.length; i++) {
      // Check if tab is active
      if (!rows[i][isActiveCol]) {
        continue;
      }
      
      const tabId = rows[i][tabIdCol];
      
      // Check if user has read permission for this tab
      // For now, we'll allow all active tabs. In future, implement tab-level permissions
      
      tabs.push({
        id: tabId,
        name: rows[i][tabNameCol] || '',
        icon: rows[i][iconCol] || 'article',
        category: rows[i][categoryCol] || 'أخرى'
      });
    }
    
    return tabs;
    
  } catch (error) {
    logError_('getAccessibleTabs_', 'Error fetching tabs', error);
    return [];
  }
}

/**
 * Get system settings
 * @returns {Object} System settings
 */
function getSystemSettings_() {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const settingsSheet = ss.getSheetByName('SET_System_Settings');
    
    if (!settingsSheet) {
      logWarn_('getSystemSettings_', 'SET_System_Settings sheet not found');
      return {};
    }
    
    const data = settingsSheet.getDataRange().getValues();
    const headers = data[0];
    const rows = data.slice(1);
    
    const keyCol = headers.indexOf('setting_key');
    const valueCol = headers.indexOf('setting_value');
    
    const settings = {};
    
    for (let i = 0; i < rows.length; i++) {
      const key = rows[i][keyCol];
      const value = rows[i][valueCol];
      
      if (key) {
        settings[key] = value;
      }
    }
    
    return settings;
    
  } catch (error) {
    logError_('getSystemSettings_', 'Error fetching settings', error);
    return {};
  }
}

/**
 * Update last login timestamp for user
 * @param {string} username - Username
 */
function updateLastLogin_(username) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const usersSheet = ss.getSheetByName('SYS_Users');
    
    if (!usersSheet) {
      return;
    }
    
    const data = usersSheet.getDataRange().getValues();
    const headers = data[0];
    
    const usernameCol = headers.indexOf('username');
    const lastLoginCol = headers.indexOf('last_login');
    
    if (usernameCol === -1 || lastLoginCol === -1) {
      return;
    }
    
    // Find user row
    for (let i = 1; i < data.length; i++) {
      if (data[i][usernameCol] && data[i][usernameCol].toString().toLowerCase() === username) {
        // Update last login timestamp
        usersSheet.getRange(i + 1, lastLoginCol + 1).setValue(new Date());
        logInfo_('updateLastLogin_', `Updated last login for user: ${username}`);
        break;
      }
    }
    
  } catch (error) {
    logError_('updateLastLogin_', 'Error updating last login', error);
    // Non-critical error, don't throw
  }
}

/**
 * Logout user (optional - can be used to invalidate session on server)
 * @returns {boolean} Success status
 */
function logoutUser() {
  const functionName = 'logoutUser';
  logInfo_(functionName, 'User logout');
  
  // In a more advanced implementation, you could:
  // 1. Store active sessions in a sheet
  // 2. Invalidate the session token on logout
  // 3. Track logout events for auditing
  
  return true;
}

/**
 * Verify session token (optional - for future session validation)
 * @param {string} token - Session token
 * @returns {Object} Session validity status
 */
function verifySessionToken(token) {
  const functionName = 'verifySessionToken';
  
  try {
    if (!token) {
      return {
        valid: false,
        message: 'No token provided'
      };
    }
    
    // In a more advanced implementation, you would:
    // 1. Store active sessions in a sheet
    // 2. Verify the token exists and is not expired
    // 3. Return user data associated with the token
    
    // For now, we'll implement basic token validation
    // Token format: timestamp-random
    const parts = token.split('-');
    
    if (parts.length !== 2) {
      return {
        valid: false,
        message: 'Invalid token format'
      };
    }
    
    const timestamp = parseInt(parts[0]);
    const now = new Date().getTime();
    const age = now - timestamp;
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours
    
    if (age > maxAge) {
      return {
        valid: false,
        message: 'Token expired'
      };
    }
    
    return {
      valid: true,
      message: 'Token valid'
    };
    
  } catch (error) {
    logError_(functionName, 'Error verifying token', error);
    return {
      valid: false,
      message: 'Token verification error'
    };
  }
}
