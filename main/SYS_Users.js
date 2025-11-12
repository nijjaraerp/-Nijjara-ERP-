/** =========================================================
 *  NIJJARA ERP – SYS_USERS CRUD MODULE
 *  Author: Mohamed / ChatGPT Assistant
 *  Purpose: Complete CRUD operations for system users
 *  ========================================================= */

/**
 * Creates a new user
 * @param {Object} userData - User data object
 * @returns {Object} - Response object
 */
function createUser(userData) {
  const actor = getCurrentUser_();
  
  try {
    logInfo_(actor, 'Create', 'SYS_Users', 'NEW', 'Starting user creation');
    
    // Validate and sanitize
    const validation = validateAndSanitize_('SYS_Users', userData);
    if (!validation.valid) {
      throw new Error('Validation failed: ' + validation.errors.join(', '));
    }
    
    const data = validation.data;
    
    // Check if username or email already exists
    if (userExists_(data.USR_Name, data.EMP_Email)) {
      throw new Error('Username or email already exists');
    }
    
    // Hash password if provided
    let passwordHash = null;
    let passwordSalt = null;
    if (data.Password) {
      const { hash, salt } = hashPassword(data.Password);
      passwordHash = hash;
      passwordSalt = salt;
      delete data.Password; // Remove plain text password
    }
    
    // Generate user ID
    const userId = generateId_('USR');
    const timestamp = new Date();
    
    // Prepare row data
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const usersSheet = ss.getSheetByName('SYS_Users');
    
    if (!usersSheet) {
      throw new Error('SYS_Users sheet not found');
    }
    
    // Get headers to map data correctly
    const headers = usersSheet.getRange(1, 1, 1, usersSheet.getLastColumn()).getValues()[0];
    const rowData = new Array(headers.length).fill('');
    
    // Map data to row
    headers.forEach((header, index) => {
      if (header === 'USR_ID') rowData[index] = userId;
      else if (header === 'Password_Hash') rowData[index] = passwordHash || '';
      else if (header === 'Password_Salt') rowData[index] = passwordSalt || '';
      else if (header === 'USR_Is_Active') rowData[index] = data.USR_Is_Active !== false;
      else if (header === 'USR_Crt_At') rowData[index] = timestamp;
      else if (header === 'USR_Crt_By') rowData[index] = actor;
      else if (header === 'USR_Upd_At') rowData[index] = timestamp;
      else if (header === 'USR_Upd_By') rowData[index] = actor;
      else if (data.hasOwnProperty(header)) rowData[index] = data[header];
    });
    
    // Append row
    usersSheet.appendRow(rowData);
    
    logInfo_(actor, 'Create', 'SYS_Users', userId, 'User created successfully');
    writeToAuditLog_(actor, 'Create', 'SYS_Users', userId, `User ${data.USR_Name} created`, 'INFO');
    
    return createResponse_(true, { userId: userId }, 'User created successfully', []);
    
  } catch (error) {
    logError_(actor, 'Create', 'SYS_Users', 'NEW', 'Failed to create user', error);
    return createResponse_(false, null, error.message, ['CREATE_FAILED']);
  }
}

/**
 * Gets a user by ID
 * @param {string} userId - User ID
 * @returns {Object} - Response object with user data
 */
function getUserById(userId) {
  const actor = getCurrentUser_();
  
  try {
    if (isEmpty_(userId)) {
      throw new Error('User ID is required');
    }
    
    const user = findUserById_(userId);
    
    if (!user) {
      logWarn_(actor, 'Read', 'SYS_Users', userId, 'User not found');
      return createResponse_(false, null, 'User not found', ['USER_NOT_FOUND']);
    }
    
    // Remove sensitive data
    delete user.Password_Hash;
    delete user.Password_Salt;
    
    logInfo_(actor, 'Read', 'SYS_Users', userId, 'User retrieved');
    
    return createResponse_(true, user, 'User retrieved successfully', []);
    
  } catch (error) {
    logError_(actor, 'Read', 'SYS_Users', userId, 'Failed to get user', error);
    return createResponse_(false, null, error.message, ['READ_FAILED']);
  }
}

/**
 * Gets a user by username
 * @param {string} username - Username
 * @returns {Object} - Response object with user data
 */
function getUserByUsername(username) {
  const actor = getCurrentUser_();
  
  try {
    if (isEmpty_(username)) {
      throw new Error('Username is required');
    }
    
    const user = findUserByUsername_(username);
    
    if (!user) {
      logWarn_(actor, 'Read', 'SYS_Users', username, 'User not found');
      return createResponse_(false, null, 'User not found', ['USER_NOT_FOUND']);
    }
    
    // Remove sensitive data
    delete user.Password_Hash;
    delete user.Password_Salt;
    
    logInfo_(actor, 'Read', 'SYS_Users', username, 'User retrieved');
    
    return createResponse_(true, user, 'User retrieved successfully', []);
    
  } catch (error) {
    logError_(actor, 'Read', 'SYS_Users', username, 'Failed to get user', error);
    return createResponse_(false, null, error.message, ['READ_FAILED']);
  }
}

/**
 * Lists all users (with pagination)
 * @param {Object} options - Query options {active: boolean, role: string, limit: number, offset: number}
 * @returns {Object} - Response object with users array
 */
function listUsers(options = {}) {
  const actor = getCurrentUser_();
  
  try {
    const users = getSheetData_('SYS_Users', 1);
    let filtered = users;
    
    // Filter by active status
    if (options.active !== undefined) {
      filtered = filtered.filter(u => u.USR_Is_Active === options.active);
    }
    
    // Filter by role
    if (options.role) {
      filtered = filtered.filter(u => u.ROL_ID === options.role);
    }
    
    // Remove sensitive data
    filtered = filtered.map(u => {
      const user = { ...u };
      delete user.Password_Hash;
      delete user.Password_Salt;
      return user;
    });
    
    // Apply pagination
    const limit = options.limit || 50;
    const offset = options.offset || 0;
    const paginated = filtered.slice(offset, offset + limit);
    
    logInfo_(actor, 'List', 'SYS_Users', 'ALL', `Retrieved ${paginated.length} users`);
    
    return createResponse_(true, {
      users: paginated,
      total: filtered.length,
      limit: limit,
      offset: offset
    }, 'Users retrieved successfully', []);
    
  } catch (error) {
    logError_(actor, 'List', 'SYS_Users', 'ALL', 'Failed to list users', error);
    return createResponse_(false, null, error.message, ['LIST_FAILED']);
  }
}

/**
 * Updates a user
 * @param {string} userId - User ID
 * @param {Object} updates - Fields to update
 * @returns {Object} - Response object
 */
function updateUser(userId, updates) {
  const actor = getCurrentUser_();
  
  try {
    if (isEmpty_(userId)) {
      throw new Error('User ID is required');
    }
    
    logInfo_(actor, 'Update', 'SYS_Users', userId, 'Starting user update');
    
    // Validate updates
    const validation = validateAndSanitize_('SYS_Users', updates);
    if (!validation.valid) {
      throw new Error('Validation failed: ' + validation.errors.join(', '));
    }
    
    const data = validation.data;
    
    // Find user
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const usersSheet = ss.getSheetByName('SYS_Users');
    
    if (!usersSheet) {
      throw new Error('SYS_Users sheet not found');
    }
    
    const allData = usersSheet.getDataRange().getValues();
    const headers = allData[0];
    const userIdCol = headers.indexOf('USR_ID');
    
    let rowIndex = -1;
    for (let i = 2; i < allData.length; i++) {
      if (allData[i][userIdCol] === userId) {
        rowIndex = i + 1; // Convert to 1-based
        break;
      }
    }
    
    if (rowIndex === -1) {
      throw new Error('User not found');
    }
    
    // Update fields
    const timestamp = new Date();
    headers.forEach((header, colIndex) => {
      if (data.hasOwnProperty(header)) {
        usersSheet.getRange(rowIndex, colIndex + 1).setValue(data[header]);
      }
    });
    
    // Update metadata
    const updAtCol = headers.indexOf('USR_Upd_At') + 1;
    const updByCol = headers.indexOf('USR_Upd_By') + 1;
    usersSheet.getRange(rowIndex, updAtCol).setValue(timestamp);
    usersSheet.getRange(rowIndex, updByCol).setValue(actor);
    
    logInfo_(actor, 'Update', 'SYS_Users', userId, 'User updated successfully');
    writeToAuditLog_(actor, 'Update', 'SYS_Users', userId, 'User updated', 'INFO');
    
    return createResponse_(true, { userId: userId }, 'User updated successfully', []);
    
  } catch (error) {
    logError_(actor, 'Update', 'SYS_Users', userId, 'Failed to update user', error);
    return createResponse_(false, null, error.message, ['UPDATE_FAILED']);
  }
}

/**
 * Deactivates a user (soft delete)
 * @param {string} userId - User ID
 * @returns {Object} - Response object
 */
function deactivateUser(userId) {
  const actor = getCurrentUser_();
  
  try {
    if (isEmpty_(userId)) {
      throw new Error('User ID is required');
    }
    
    const result = updateUser(userId, { USR_Is_Active: false });
    
    if (result.success) {
      logInfo_(actor, 'Deactivate', 'SYS_Users', userId, 'User deactivated');
      writeToAuditLog_(actor, 'Deactivate', 'SYS_Users', userId, 'User deactivated', 'INFO');
    }
    
    return result;
    
  } catch (error) {
    logError_(actor, 'Deactivate', 'SYS_Users', userId, 'Failed to deactivate user', error);
    return createResponse_(false, null, error.message, ['DEACTIVATE_FAILED']);
  }
}

/**
 * Activates a user
 * @param {string} userId - User ID
 * @returns {Object} - Response object
 */
function activateUser(userId) {
  const actor = getCurrentUser_();
  
  try {
    if (isEmpty_(userId)) {
      throw new Error('User ID is required');
    }
    
    const result = updateUser(userId, { USR_Is_Active: true });
    
    if (result.success) {
      logInfo_(actor, 'Activate', 'SYS_Users', userId, 'User activated');
      writeToAuditLog_(actor, 'Activate', 'SYS_Users', userId, 'User activated', 'INFO');
    }
    
    return result;
    
  } catch (error) {
    logError_(actor, 'Activate', 'SYS_Users', userId, 'Failed to activate user', error);
    return createResponse_(false, null, error.message, ['ACTIVATE_FAILED']);
  }
}

/**
 * Checks if a user exists by username or email
 * @param {string} username - Username
 * @param {string} email - Email
 * @returns {boolean} - True if exists
 */
function userExists_(username, email) {
  try {
    const users = getSheetData_('SYS_Users', 1);
    return users.some(u => u.USR_Name === username || u.EMP_Email === email);
  } catch (error) {
    logError_(getCurrentUser_(), 'Check', 'SYS_Users', 'N/A', 'Failed to check user existence', error);
    return false;
  }
}

/**
 * Finds a user by ID
 * @param {string} userId - User ID
 * @returns {Object|null} - User object or null
 */
function findUserById_(userId) {
  try {
    const users = getSheetData_('SYS_Users', 1);
    return users.find(u => u.USR_ID === userId) || null;
  } catch (error) {
    logError_(getCurrentUser_(), 'Find', 'SYS_Users', userId, 'Failed to find user by ID', error);
    return null;
  }
}

/**
 * Updates the findUserByUsername_ stub from Auth.js
 * Finds a user by username or email
 * @param {string} username - Username or email
 * @returns {Object|null} - User object or null
 */
function findUserByUsername_(username) {
  try {
    const users = getSheetData_('SYS_Users', 1);
    return users.find(u => u.USR_Name === username || u.EMP_Email === username) || null;
  } catch (error) {
    logError_(getCurrentUser_(), 'Find', 'SYS_Users', username, 'Failed to find user by username', error);
    return null;
  }
}

/**
 * Updates the updateLastLogin_ stub from Auth.js
 * Updates user's last login timestamp
 * @param {string} userId - User ID
 * @param {Date} timestamp - Login timestamp
 */
function updateLastLogin_(userId, timestamp) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const usersSheet = ss.getSheetByName('SYS_Users');
    
    if (!usersSheet) return;
    
    const data = usersSheet.getDataRange().getValues();
    const headers = data[0];
    const idCol = headers.indexOf('USR_ID') + 1;
    const lastLoginCol = headers.indexOf('Last_Login') + 1;
    
    for (let i = 2; i < data.length; i++) {
      if (data[i][idCol - 1] === userId) {
        usersSheet.getRange(i + 1, lastLoginCol).setValue(timestamp);
        logInfo_('System', 'Update', 'SYS_Users', userId, 'Last login updated');
        break;
      }
    }
  } catch (error) {
    logError_('System', 'Update', 'SYS_Users', userId, 'Failed to update last login', error);
  }
}

/**
 * Finds a user by email
 * @param {string} email - Email address
 * @returns {Object|null} - User object or null
 */
function findUserByEmail_(email) {
  try {
    const users = getSheetData_('SYS_Users', 1);
    return users.find(u => u.EMP_Email === email) || null;
  } catch (error) {
    logError_(getCurrentUser_(), 'Find', 'SYS_Users', email, 'Failed to find user by email', error);
    return null;
  }
}
