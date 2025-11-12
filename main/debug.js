/** =========================================================
 *  NIJJARA ERP – CLIENT-SIDE DEBUG LOGGER
 *  Author: Mohamed / ChatGPT Assistant
 *  Purpose: Loud logging for all client operations
 *           Outputs to: Browser Console + Toast Messages
 *  ========================================================= */

const DBG = (function() {
  'use strict';
  
  // Log levels
  const LEVELS = {
    INFO: 'INFO',
    REQ: 'REQ',
    OK: 'OK',
    WARN: 'WARN',
    ERR: 'ERR'
  };
  
  /**
   * Format a log message
   * @param {string} level - Log level
   * @param {string} scope - Scope or module name
   * @param {string} msg - Message
   * @param {*} data - Additional data (optional)
   * @returns {string} - Formatted message
   */
  function formatMessage(level, scope, msg, data) {
    const timestamp = new Date().toLocaleTimeString();
    const prefix = `[CLIENT][${level.padEnd(4)}] ${timestamp}`;
    let message = `${prefix} ${scope} → ${msg}`;
    
    if (data !== undefined && data !== null) {
      message += ` | data: ${JSON.stringify(data)}`;
    }
    
    return message;
  }
  
  /**
   * Show toast notification (for warnings and errors)
   * @param {string} message - Message to display
   * @param {string} type - Type: 'info', 'warning', 'error'
   */
  function showToast(message, type = 'info') {
    // For now, use alert (will be replaced with proper toast UI later)
    if (type === 'error') {
      console.error('TOAST:', message);
      // alert('❌ ' + message);
    } else if (type === 'warning') {
      console.warn('TOAST:', message);
      // alert('⚠️ ' + message);
    } else {
      console.log('TOAST:', message);
    }
  }
  
  /**
   * Log an INFO level message
   * @param {string} scope - Scope or module name
   * @param {string} msg - Message
   * @param {*} data - Additional data (optional)
   */
  function logInfo(scope, msg, data) {
    const message = formatMessage(LEVELS.INFO, scope, msg, data);
    console.log(message);
  }
  
  /**
   * Log a REQUEST level message (API calls)
   * @param {string} scope - Scope or module name
   * @param {string} msg - Message
   * @param {*} data - Additional data (optional)
   */
  function logRequest(scope, msg, data) {
    const message = formatMessage(LEVELS.REQ, scope, msg, data);
    console.log(message);
  }
  
  /**
   * Log a SUCCESS level message (API responses)
   * @param {string} scope - Scope or module name
   * @param {string} msg - Message
   * @param {*} data - Additional data (optional)
   */
  function logSuccess(scope, msg, data) {
    const message = formatMessage(LEVELS.OK, scope, msg, data);
    console.log(message);
  }
  
  /**
   * Log a WARNING level message
   * @param {string} scope - Scope or module name
   * @param {string} msg - Message
   * @param {*} data - Additional data (optional)
   */
  function logWarn(scope, msg, data) {
    const message = formatMessage(LEVELS.WARN, scope, msg, data);
    console.warn(message);
    showToast(msg, 'warning');
  }
  
  /**
   * Log an ERROR level message
   * @param {string} scope - Scope or module name
   * @param {string} msg - Message
   * @param {*} data - Additional data (optional)
   */
  function logError(scope, msg, data) {
    const message = formatMessage(LEVELS.ERR, scope, msg, data);
    console.error(message);
    showToast(msg, 'error');
  }
  
  /**
   * Generic log function
   * @param {string} level - Log level
   * @param {string} scope - Scope or module name
   * @param {string} msg - Message
   * @param {*} data - Additional data (optional)
   */
  function log(level, scope, msg, data) {
    switch (level) {
      case LEVELS.INFO:
        logInfo(scope, msg, data);
        break;
      case LEVELS.REQ:
        logRequest(scope, msg, data);
        break;
      case LEVELS.OK:
        logSuccess(scope, msg, data);
        break;
      case LEVELS.WARN:
        logWarn(scope, msg, data);
        break;
      case LEVELS.ERR:
        logError(scope, msg, data);
        break;
      default:
        console.log(formatMessage(level, scope, msg, data));
    }
  }
  
  /**
   * Log API call start
   * @param {string} method - API method name
   * @param {Object} payload - Request payload
   */
  function logApiStart(method, payload) {
    logRequest('API', `Calling ${method}`, payload);
  }
  
  /**
   * Log API call success
   * @param {string} method - API method name
   * @param {*} response - Response data
   */
  function logApiSuccess(method, response) {
    logSuccess('API', `${method} completed`, response);
  }
  
  /**
   * Log API call error
   * @param {string} method - API method name
   * @param {Error|string} error - Error object or message
   */
  function logApiError(method, error) {
    const errorMsg = error.message || error.toString();
    logError('API', `${method} failed: ${errorMsg}`, error);
  }
  
  // Public API
  return {
    log: log,
    info: logInfo,
    request: logRequest,
    success: logSuccess,
    warn: logWarn,
    error: logError,
    apiStart: logApiStart,
    apiSuccess: logApiSuccess,
    apiError: logApiError,
    LEVELS: LEVELS
  };
})();

// Example usage:
// DBG.info('Auth', 'User login attempt', {username: 'admin'});
// DBG.request('API', 'createUser', {name: 'John', email: 'john@example.com'});
// DBG.success('API', 'User created', {id: 'USR-001'});
// DBG.warn('Validation', 'Empty field detected', {field: 'email'});
// DBG.error('API', 'Failed to create user', {error: 'Invalid email'});
