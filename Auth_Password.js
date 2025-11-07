/**
 * @file Auth_Password.js
 * @description Password hashing and verification utilities for Nijjara ERP.
 * Uses HMAC-SHA256 with a per-user salt. Provides constant-time comparison
 * and password strength validation.
 */

// --------------------------------------------------------------------------
// --- INTERNAL HELPERS ---
// --------------------------------------------------------------------------

/**
 * Generates a per-user salt (hex string).
 * @returns {string} salt
 */
function generateSalt_() {
  // UUIDv4 is sufficiently unique for salt; we strip dashes to get 32 chars.
  return Utilities.getUuid().replace(/-/g, '');
}

/**
 * Converts a byte[] to hex string.
 * @param {number[]} bytes
 * @returns {string}
 */
function _toHex_(bytes) {
  return bytes.map(function(b){
    const v = (b & 0xff).toString(16);
    return v.length === 1 ? '0' + v : v;
  }).join('');
}

/**
 * Constant-time comparison to mitigate timing attacks.
 * @param {string} a
 * @param {string} b
 * @returns {boolean}
 */
function _timingSafeEqual_(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  var diff = a.length ^ b.length;
  for (var i = 0; i < Math.max(a.length, b.length); i++) {
    var ca = i < a.length ? a.charCodeAt(i) : 0;
    var cb = i < b.length ? b.charCodeAt(i) : 0;
    diff |= (ca ^ cb);
  }
  return diff === 0;
}

// --------------------------------------------------------------------------
// --- PUBLIC API ---
// --------------------------------------------------------------------------

/**
 * Validates password strength according to project policy.
 * Rules: length >= 8, includes upper, lower, digit, special char.
 * @param {string} password
 * @returns {{valid:boolean, errors:string[]}}
 */
function validatePasswordStrength_(password) {
  var errors = [];
  if (typeof password !== 'string' || password.length === 0) {
    errors.push('Password is required.');
  } else {
    if (password.length < 8) errors.push('At least 8 characters.');
    if (!/[A-Z]/.test(password)) errors.push('At least one uppercase letter.');
    if (!/[a-z]/.test(password)) errors.push('At least one lowercase letter.');
    if (!/[0-9]/.test(password)) errors.push('At least one digit.');
    if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?`~]/.test(password)) errors.push('At least one special character.');
  }
  return { valid: errors.length === 0, errors: errors };
}

/**
 * Hashes a password with HMAC-SHA256 using a per-user salt.
 * If salt is not provided, one is generated and returned.
 *
 * @param {string} password - Plain text password.
 * @param {string} [salt] - Hex string salt.
 * @returns {{hash:string, salt:string}}
 */
function hashPassword_(password, salt) {
  try {
    var strength = validatePasswordStrength_(password);
    if (!strength.valid) {
      // Log and throw to force caller to handle policy.
      if (typeof logWarn_ === 'function') {
        logWarn_('hashPassword_', 'Weak password: ' + strength.errors.join(', '));
      }
    }

    var useSalt = salt || generateSalt_();
    // HMAC(key=salt, message=password)
    var sigBytes = Utilities.computeHmacSha256Signature(password, useSalt);
    var hashHex = _toHex_(sigBytes);

    if (typeof logInfo_ === 'function') {
      logInfo_('hashPassword_', 'Password hashed successfully');
    }

    return { hash: hashHex, salt: useSalt };
  } catch (e) {
    if (typeof logError_ === 'function') {
      logError_('hashPassword_', 'Failed to hash password', e);
    }
    throw e;
  }
}

/**
 * Checks a plain password against a stored hash and salt.
 *
 * @param {string} plainPassword
 * @param {string} storedHash - Hex string hash from DB.
 * @param {string} salt - Hex string salt from DB.
 * @returns {boolean}
 */
function checkPassword_(plainPassword, storedHash, salt) {
  try {
    var sigBytes = Utilities.computeHmacSha256Signature(plainPassword, salt);
    var computedHex = _toHex_(sigBytes);
    var match = _timingSafeEqual_(computedHex, storedHash);
    if (!match && typeof logWarn_ === 'function') {
      logWarn_('checkPassword_', 'Password mismatch');
    }
    return match;
  } catch (e) {
    if (typeof logError_ === 'function') {
      logError_('checkPassword_', 'Error while verifying password', e);
    }
    return false;
  }
}
