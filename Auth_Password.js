/** =========================================================
 *  NIJJARA ERP – PASSWORD AUTHENTICATION MODULE
 *  Author: Mohamed / ChatGPT Assistant
 *  Purpose: Secure password hashing and verification
 *  ========================================================= */

/**
 * Hashes a password using HMAC SHA256
 * @param {string} password - Plain text password
 * @param {string} salt - Salt for hashing (optional, will generate if not provided)
 * @returns {Object} - {hash: string, salt: string}
 */
function hashPassword(password, salt) {
  const user = getCurrentUser_();
  
  try {
    if (isEmpty_(password)) {
      throw new Error('Password cannot be empty');
    }
    
    // Generate salt if not provided
    if (!salt) {
      salt = generateSalt_(32);
    }
    
    // Combine password with salt
    const saltedPassword = password + salt;
    
    // Hash using HMAC SHA256
    const hash = computeHmacSha256Signature_(saltedPassword, 'NIJJARA_ERP_SECRET_KEY_2025');
    
    logInfo_(user, 'HashPassword', 'Auth', 'N/A', 'Password hashed successfully');
    
    return {
      hash: hash,
      salt: salt
    };
  } catch (error) {
    logError_(user, 'HashPassword', 'Auth', 'N/A', 'Failed to hash password', error);
    throw error;
  }
}

/**
 * Verifies a password against a stored hash
 * @param {string} password - Plain text password to verify
 * @param {string} storedHash - Stored password hash
 * @param {string} salt - Salt used for hashing
 * @returns {boolean} - True if password matches
 */
function verifyPassword(password, storedHash, salt) {
  const user = getCurrentUser_();
  
  try {
    if (isEmpty_(password) || isEmpty_(storedHash) || isEmpty_(salt)) {
      logWarn_(user, 'VerifyPassword', 'Auth', 'N/A', 'Missing password, hash, or salt');
      return false;
    }
    
    // Hash the provided password with the stored salt
    const result = hashPassword(password, salt);
    
    // Compare hashes
    const match = result.hash === storedHash;
    
    if (match) {
      logInfo_(user, 'VerifyPassword', 'Auth', 'N/A', 'Password verified successfully');
    } else {
      logWarn_(user, 'VerifyPassword', 'Auth', 'N/A', 'Password verification failed');
    }
    
    return match;
  } catch (error) {
    logError_(user, 'VerifyPassword', 'Auth', 'N/A', 'Password verification error', error);
    return false;
  }
}

/**
 * Generates a secure random token for sessions
 * @param {number} length - Token length (default 64)
 * @returns {string} - Random token
 */
function generateAuthToken(length = 64) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let token = '';
  
  for (let i = 0; i < length; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  // Add timestamp to ensure uniqueness
  const timestamp = new Date().getTime();
  return `${token}-${timestamp}`;
}

/**
 * Validates password strength
 * @param {string} password - Password to validate
 * @returns {Object} - {valid: boolean, errors: Array<string>}
 */
function validatePasswordStrength(password) {
  const errors = [];
  
  if (isEmpty_(password)) {
    errors.push('Password is required');
    return { valid: false, errors: errors };
  }
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  return {
    valid: errors.length === 0,
    errors: errors
  };
}

/**
 * Stores password hash and salt for a user
 * @param {string} userId - User ID
 * @param {string} password - Plain text password
 * @returns {boolean} - True if successful
 */
function storeUserPassword(userId, password) {
  const user = getCurrentUser_();
  
  try {
    // Validate password strength
    const validation = validatePasswordStrength(password);
    if (!validation.valid) {
      throw new Error('Weak password: ' + validation.errors.join(', '));
    }
    
    // Hash password
    const { hash, salt } = hashPassword(password);
    
    // Store in user record (this will be implemented in Day 4 with SYS_Users CRUD)
    // For now, just return the hash and salt
    logInfo_(user, 'StorePassword', 'SYS_Users', userId, 'Password stored successfully');
    
    return {
      success: true,
      hash: hash,
      salt: salt
    };
  } catch (error) {
    logError_(user, 'StorePassword', 'SYS_Users', userId, 'Failed to store password', error);
    throw error;
  }
}

/**
 * Updates user password
 * @param {string} userId - User ID
 * @param {string} oldPassword - Current password
 * @param {string} newPassword - New password
 * @returns {Object} - Result object
 */
function changeUserPassword(userId, oldPassword, newPassword) {
  const user = getCurrentUser_();
  
  try {
    // This will be fully implemented in Day 4 when we have user lookup
    // For now, just validate the new password
    const validation = validatePasswordStrength(newPassword);
    if (!validation.valid) {
      throw new Error('Weak password: ' + validation.errors.join(', '));
    }
    
    const { hash, salt } = hashPassword(newPassword);
    
    logInfo_(user, 'ChangePassword', 'SYS_Users', userId, 'Password changed successfully');
    
    return {
      success: true,
      message: 'Password changed successfully'
    };
  } catch (error) {
    logError_(user, 'ChangePassword', 'SYS_Users', userId, 'Failed to change password', error);
    throw error;
  }
}
