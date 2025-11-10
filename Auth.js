/** =========================================================
 *  NIJJARA ERP – AUTHENTICATION & SESSION MODULE
 *  Author: Mohamed / ChatGPT Assistant
 *  Purpose: User authentication, session management, rate limiting
 *  ========================================================= */

// Rate limiting configuration
const RATE_LIMIT = {
  MAX_ATTEMPTS: 3,
  LOCKOUT_DURATION_MINUTES: 15,
  ATTEMPT_WINDOW_MINUTES: 5
};

/**
 * Authenticates a user with username and password
 * @param {string} username - Username or email
 * @param {string} password - Plain text password
 * @param {string} ipAddress - Client IP address (optional)
 * @returns {Object} - Authentication result
 */
function authenticateUser(username, password, ipAddress = 'N/A') {
  const timestamp = new Date();
  
  logInfo_('System', 'Login', 'Auth', username, `Login attempt from ${ipAddress}`);
  
  try {
    // Validate inputs
    if (isEmpty_(username) || isEmpty_(password)) {
      throw new Error('Username and password are required');
    }
    
    // Check rate limiting
    const rateLimitCheck = checkRateLimit_(username, ipAddress);
    if (!rateLimitCheck.allowed) {
      logWarn_('System', 'Login', 'Auth', username, `Rate limit exceeded: ${rateLimitCheck.message}`);
      return createResponse_(false, null, rateLimitCheck.message, ['RATE_LIMIT_EXCEEDED']);
    }
    
    // Find user (this will be fully implemented in Day 4)
    const user = findUserByUsername_(username);
    
    if (!user) {
      recordFailedAttempt_(username, ipAddress);
      logWarn_('System', 'Login', 'Auth', username, 'User not found');
      return createResponse_(false, null, 'Invalid username or password', ['INVALID_CREDENTIALS']);
    }
    
    // Check if user is active
    if (user.USR_Is_Active === false) {
      logWarn_('System', 'Login', 'Auth', username, 'Inactive user attempted login');
      return createResponse_(false, null, 'Account is inactive', ['ACCOUNT_INACTIVE']);
    }
    
    // Verify password
    const passwordValid = verifyPassword(password, user.Password_Hash, user.Password_Salt);
    
    if (!passwordValid) {
      recordFailedAttempt_(username, ipAddress);
      logError_('System', 'Login', 'Auth', username, 'Invalid password', null);
      return createResponse_(false, null, 'Invalid username or password', ['INVALID_CREDENTIALS']);
    }
    
    // Clear failed attempts
    clearFailedAttempts_(username);
    
    // Create session
    const session = createSession_(user, ipAddress);
    
    // Update last login
    updateLastLogin_(user.USR_ID, timestamp);
    
    // Audit log
    writeToAuditLog_('System', 'Login', 'SYS_Users', user.USR_ID, `Successful login from ${ipAddress}`, 'INFO');
    
    logInfo_('System', 'Login', 'Auth', username, 'Authentication successful');
    
    return createResponse_(true, {
      userId: user.USR_ID,
      username: user.USR_Name,
      email: user.EMP_Email,
      role: user.ROL_ID,
      sessionToken: session.token,
      sessionId: session.id
    }, 'Authentication successful', []);
    
  } catch (error) {
    logError_('System', 'Login', 'Auth', username, 'Authentication error', error);
    return createResponse_(false, null, 'Authentication failed: ' + error.message, ['AUTH_ERROR']);
  }
}

/**
 * Creates a new session for authenticated user
 * @param {Object} user - User object
 * @param {string} ipAddress - Client IP address
 * @returns {Object} - Session object
 */
function createSession_(user, ipAddress) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sessionsSheet = ss.getSheetByName('SYS_Sessions');
    
    if (!sessionsSheet) {
      throw new Error('SYS_Sessions sheet not found');
    }
    
    const timestamp = new Date();
    const sessionId = generateId_('SESS');
    const authToken = generateAuthToken();
    
    // Session data based on Setup.js schema
    const sessionData = [
      sessionId,                    // SESS_ID
      user.USR_ID,                  // USR_ID
      user.EMP_Email,               // EMP_Email
      user.USR_ID,                  // ACTor_USR_ID
      'LOGIN',                      // SESS_Type
      'ACTIVE',                     // SESS_Status
      'Web',                        // USR_Device
      ipAddress,                    // IP_Address
      authToken,                    // Auth_Token
      timestamp,                    // SESS_Start_At
      null,                         // SESS_End_At
      timestamp,                    // SESS_Crt_At
      'System',                     // SESS_Crt_By
      timestamp,                    // SESS_Last_Seen
      null,                         // SESS_Revoked_At
      null,                         // SESS_Revoked_By
      JSON.stringify({              // SESS_Metadata
        userAgent: 'Apps Script',
        loginTime: timestamp.toISOString()
      })
    ];
    
    sessionsSheet.appendRow(sessionData);
    
    logInfo_('System', 'Create', 'SYS_Sessions', sessionId, `Session created for user ${user.USR_ID}`);
    
    return {
      id: sessionId,
      token: authToken
    };
  } catch (error) {
    logError_('System', 'Create', 'SYS_Sessions', 'N/A', 'Failed to create session', error);
    throw error;
  }
}

/**
 * Validates a session token
 * @param {string} sessionToken - Session token to validate
 * @returns {Object} - Validation result with user info
 */
function validateSession(sessionToken) {
  try {
    if (isEmpty_(sessionToken)) {
      return createResponse_(false, null, 'Session token required', ['INVALID_TOKEN']);
    }
    
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sessionsSheet = ss.getSheetByName('SYS_Sessions');
    
    if (!sessionsSheet) {
      throw new Error('SYS_Sessions sheet not found');
    }
    
    // Find session by token
    const data = getSheetData_('SYS_Sessions', 1);
    const session = data.find(row => row.Auth_Token === sessionToken && row.SESS_Status === 'ACTIVE');
    
    if (!session) {
      logWarn_('System', 'Validate', 'SYS_Sessions', 'N/A', 'Invalid or expired session token');
      return createResponse_(false, null, 'Invalid or expired session', ['INVALID_SESSION']);
    }
    
    // Update last seen
    updateSessionLastSeen_(session.SESS_ID);
    
    logInfo_('System', 'Validate', 'SYS_Sessions', session.SESS_ID, 'Session validated');
    
    return createResponse_(true, {
      sessionId: session.SESS_ID,
      userId: session.USR_ID,
      email: session.EMP_Email
    }, 'Session valid', []);
    
  } catch (error) {
    logError_('System', 'Validate', 'SYS_Sessions', 'N/A', 'Session validation error', error);
    return createResponse_(false, null, 'Session validation failed', ['VALIDATION_ERROR']);
  }
}

/**
 * Revokes/logs out a session
 * @param {string} sessionToken - Session token to revoke
 * @returns {Object} - Result
 */
function revokeSession(sessionToken) {
  const user = getCurrentUser_();
  
  try {
    if (isEmpty_(sessionToken)) {
      return createResponse_(false, null, 'Session token required', ['INVALID_TOKEN']);
    }
    
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sessionsSheet = ss.getSheetByName('SYS_Sessions');
    
    if (!sessionsSheet) {
      throw new Error('SYS_Sessions sheet not found');
    }
    
    // Find session
    const data = sessionsSheet.getDataRange().getValues();
    const headers = data[0];
    const tokenCol = headers.indexOf('Auth_Token') + 1;
    const statusCol = headers.indexOf('SESS_Status') + 1;
    const revokedAtCol = headers.indexOf('SESS_Revoked_At') + 1;
    const revokedByCol = headers.indexOf('SESS_Revoked_By') + 1;
    const endAtCol = headers.indexOf('SESS_End_At') + 1;
    
    for (let i = 2; i < data.length; i++) { // Start from row 3 (index 2)
      if (data[i][tokenCol - 1] === sessionToken) {
        const timestamp = new Date();
        sessionsSheet.getRange(i + 1, statusCol).setValue('REVOKED');
        sessionsSheet.getRange(i + 1, revokedAtCol).setValue(timestamp);
        sessionsSheet.getRange(i + 1, revokedByCol).setValue(user);
        sessionsSheet.getRange(i + 1, endAtCol).setValue(timestamp);
        
        logInfo_(user, 'Logout', 'SYS_Sessions', data[i][0], 'Session revoked');
        writeToAuditLog_(user, 'Logout', 'SYS_Sessions', data[i][0], 'User logged out', 'INFO');
        
        return createResponse_(true, null, 'Logged out successfully', []);
      }
    }
    
    return createResponse_(false, null, 'Session not found', ['SESSION_NOT_FOUND']);
    
  } catch (error) {
    logError_(user, 'Logout', 'SYS_Sessions', 'N/A', 'Failed to revoke session', error);
    return createResponse_(false, null, 'Logout failed', ['LOGOUT_ERROR']);
  }
}

/**
 * Checks rate limiting for login attempts
 * @param {string} username - Username
 * @param {string} ipAddress - IP address
 * @returns {Object} - {allowed: boolean, message: string}
 */
function checkRateLimit_(username, ipAddress) {
  try {
    const scriptProperties = PropertiesService.getScriptProperties();
    const key = `rate_limit_${username}_${ipAddress}`;
    const attemptsData = scriptProperties.getProperty(key);
    
    if (!attemptsData) {
      return { allowed: true, message: '' };
    }
    
    const attempts = JSON.parse(attemptsData);
    const now = new Date().getTime();
    
    // Check if lockout period has expired
    if (attempts.lockedUntil && now < attempts.lockedUntil) {
      const remainingMinutes = Math.ceil((attempts.lockedUntil - now) / 60000);
      return { 
        allowed: false, 
        message: `Account locked. Try again in ${remainingMinutes} minutes.` 
      };
    }
    
    // Clear old attempts outside the window
    const windowStart = now - (RATE_LIMIT.ATTEMPT_WINDOW_MINUTES * 60000);
    const recentAttempts = attempts.timestamps.filter(t => t > windowStart);
    
    if (recentAttempts.length >= RATE_LIMIT.MAX_ATTEMPTS) {
      // Lock the account
      const lockedUntil = now + (RATE_LIMIT.LOCKOUT_DURATION_MINUTES * 60000);
      scriptProperties.setProperty(key, JSON.stringify({
        timestamps: recentAttempts,
        lockedUntil: lockedUntil
      }));
      
      return { 
        allowed: false, 
        message: `Too many failed attempts. Account locked for ${RATE_LIMIT.LOCKOUT_DURATION_MINUTES} minutes.` 
      };
    }
    
    return { allowed: true, message: '' };
    
  } catch (error) {
    logError_('System', 'RateLimit', 'Auth', username, 'Rate limit check error', error);
    return { allowed: true, message: '' }; // Fail open on error
  }
}

/**
 * Records a failed login attempt
 * @param {string} username - Username
 * @param {string} ipAddress - IP address
 */
function recordFailedAttempt_(username, ipAddress) {
  try {
    const scriptProperties = PropertiesService.getScriptProperties();
    const key = `rate_limit_${username}_${ipAddress}`;
    const attemptsData = scriptProperties.getProperty(key);
    const now = new Date().getTime();
    
    let attempts = attemptsData ? JSON.parse(attemptsData) : { timestamps: [], lockedUntil: null };
    attempts.timestamps.push(now);
    
    scriptProperties.setProperty(key, JSON.stringify(attempts));
    
    logWarn_('System', 'Login', 'Auth', username, 'Failed login attempt recorded');
  } catch (error) {
    logError_('System', 'RecordAttempt', 'Auth', username, 'Failed to record attempt', error);
  }
}

/**
 * Clears failed login attempts for a user
 * @param {string} username - Username
 */
function clearFailedAttempts_(username) {
  try {
    const scriptProperties = PropertiesService.getScriptProperties();
    // Clear for all IP addresses (simplified)
    const keys = scriptProperties.getKeys();
    keys.forEach(key => {
      if (key.startsWith(`rate_limit_${username}_`)) {
        scriptProperties.deleteProperty(key);
      }
    });
  } catch (error) {
    logError_('System', 'ClearAttempts', 'Auth', username, 'Failed to clear attempts', error);
  }
}

/**
 * Finds user by username (stub - will be fully implemented in Day 4)
 * @param {string} username - Username or email
 * @returns {Object|null} - User object or null
 */
function findUserByUsername_(username) {
  // This is a stub that will be replaced in Day 4
  // For now, return null (no users exist yet)
  return null;
}

/**
 * Updates user's last login timestamp
 * @param {string} userId - User ID
 * @param {Date} timestamp - Login timestamp
 */
function updateLastLogin_(userId, timestamp) {
  // Will be implemented in Day 4 with SYS_Users CRUD
  logInfo_('System', 'Update', 'SYS_Users', userId, 'Last login updated');
}

/**
 * Updates session last seen timestamp
 * @param {string} sessionId - Session ID
 */
function updateSessionLastSeen_(sessionId) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sessionsSheet = ss.getSheetByName('SYS_Sessions');
    
    if (!sessionsSheet) return;
    
    const data = sessionsSheet.getDataRange().getValues();
    const headers = data[0];
    const idCol = headers.indexOf('SESS_ID') + 1;
    const lastSeenCol = headers.indexOf('SESS_Last_Seen') + 1;
    
    for (let i = 2; i < data.length; i++) {
      if (data[i][idCol - 1] === sessionId) {
        sessionsSheet.getRange(i + 1, lastSeenCol).setValue(new Date());
        break;
      }
    }
  } catch (error) {
    logError_('System', 'Update', 'SYS_Sessions', sessionId, 'Failed to update last seen', error);
  }
}
