/** =========================================================
 *  NIJJARA ERP – PERMISSIONS ENFORCEMENT MODULE
 *  Author: Mohamed / ChatGPT Assistant
 *  Purpose: Role-based access control and permission checking
 *  ========================================================= */

/**
 * Checks if a user has a specific permission
 * @param {string} userId - User ID
 * @param {string} permissionName - Permission name (e.g., 'View_Employee') or ID (e.g., 'PRM-HRM-001')
 * @returns {boolean} - True if user has permission
 */
function userHasPermission(userId, permissionName) {
  const actor = getCurrentUser_();
  
  try {
    if (isEmpty_(userId) || isEmpty_(permissionName)) {
      return false;
    }
    
    // Get user's role
    const user = findUserById_(userId);
    if (!user || !user.ROL_ID) {
      logWarn_(actor, 'CheckPermission', 'SYS_Permissions', userId, 'User or role not found');
      return false;
    }
    
    // Check if user is active
    if (user.USR_Is_Active === false) {
      logWarn_(actor, 'CheckPermission', 'SYS_Permissions', userId, 'Inactive user denied');
      return false;
    }
    
    // Get permission ID from name
    const permissionId = getPermissionIdByName_(permissionName);
    if (!permissionId) {
      logWarn_(actor, 'CheckPermission', 'SYS_Permissions', userId, `Permission ${permissionName} not found`);
      return false;
    }
    
    // Get role permissions
    const rolePermissions = getRolePermissions_(user.ROL_ID);
    const hasPermission = rolePermissions.some(rp => 
      rp.PRM_ID === permissionId && rp.SRP_Is_Allowed === true
    );
    
    if (hasPermission) {
      logInfo_(actor, 'CheckPermission', 'SYS_Permissions', userId, `Permission ${permissionName} granted`);
    } else {
      logWarn_(actor, 'CheckPermission', 'SYS_Permissions', userId, `Permission ${permissionName} denied`);
    }
    
    return hasPermission;
    
  } catch (error) {
    logError_(actor, 'CheckPermission', 'SYS_Permissions', userId, 'Permission check failed', error);
    return false; // Fail closed
  }
}

/**
 * Gets permission ID by permission name
 * @param {string} permissionName - Permission name (e.g., 'View_Employee')
 * @returns {string|null} - Permission ID or null if not found
 */
function getPermissionIdByName_(permissionName) {
  try {
    // If it's already an ID (starts with PRM-), return it
    if (permissionName && permissionName.startsWith('PRM-')) {
      return permissionName;
    }
    
    const permissions = getSheetData_('SYS_Permissions', 1);
    const perm = permissions.find(p => p.PRM_Name === permissionName);
    return perm ? perm.PRM_ID : null;
  } catch (error) {
    logError_(getCurrentUser_(), 'GetPermissionId', 'SYS_Permissions', permissionName, 'Failed to get permission ID', error);
    return null;
  }
}

/**
 * Ensures user has permission, throws error if not
 * @param {string} userId - User ID
 * @param {string} permissionName - Permission name or ID
 * @throws {Error} - If permission denied
 */
function ensurePermission_(userId, permissionName) {
  if (!userHasPermission(userId, permissionName)) {
    const error = new Error(`ACCESS DENIED: Permission ${permissionName} required`);
    logError_(userId, 'AccessDenied', 'SYS_Permissions', permissionName, 'Access denied', null);
    throw error;
  }
}

/**
 * Gets all permissions for a role
 * @param {string} roleId - Role ID
 * @returns {Array<Object>} - Array of role permission objects
 */
function getRolePermissions_(roleId) {
  try {
    const rolePerms = getSheetData_('SYS_Role_Permissions', 1);
    return rolePerms.filter(rp => rp.ROL_ID === roleId);
  } catch (error) {
    logError_(getCurrentUser_(), 'GetPermissions', 'SYS_Role_Permissions', roleId, 'Failed to get role permissions', error);
    return [];
  }
}

/**
 * Grants a permission to a role
 * @param {string} roleId - Role ID
 * @param {string} permissionId - Permission ID
 * @param {Object} options - Optional parameters {scope, constraints}
 * @returns {Object} - Response object
 */
function grantPermissionToRole(roleId, permissionId, options = {}) {
  const actor = getCurrentUser_();
  
  try {
    logInfo_(actor, 'Grant', 'SYS_Role_Permissions', `${roleId}-${permissionId}`, 'Granting permission');
    
    if (isEmpty_(roleId) || isEmpty_(permissionId)) {
      throw new Error('Role ID and Permission ID are required');
    }
    
    // Check if already exists
    const existing = getRolePermissions_(roleId);
    if (existing.some(rp => rp.PRM_ID === permissionId)) {
      throw new Error('Permission already granted to this role');
    }
    
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName('SYS_Role_Permissions');
    
    if (!sheet) {
      throw new Error('SYS_Role_Permissions sheet not found');
    }
    
    const timestamp = new Date();
    const rowData = [
      roleId,                           // ROL_ID
      permissionId,                     // PRM_ID
      options.scope || 'ALL',           // SRP_Scope
      true,                             // SRP_Is_Allowed
      options.constraints || '',        // SRP_Constraints
      timestamp,                        // SRP_Crt_At
      actor,                            // SRP_Crt_By
      timestamp,                        // SRP_Upd_At
      actor                             // SRP_Upd_By
    ];
    
    sheet.appendRow(rowData);
    
    logInfo_(actor, 'Grant', 'SYS_Role_Permissions', `${roleId}-${permissionId}`, 'Permission granted');
    writeToAuditLog_(actor, 'Grant', 'SYS_Role_Permissions', `${roleId}-${permissionId}`, `Permission ${permissionId} granted to role ${roleId}`, 'INFO');
    
    return createResponse_(true, null, 'Permission granted successfully', []);
    
  } catch (error) {
    logError_(actor, 'Grant', 'SYS_Role_Permissions', `${roleId}-${permissionId}`, 'Failed to grant permission', error);
    return createResponse_(false, null, error.message, ['GRANT_FAILED']);
  }
}

/**
 * Revokes a permission from a role
 * @param {string} roleId - Role ID
 * @param {string} permissionId - Permission ID
 * @returns {Object} - Response object
 */
function revokePermissionFromRole(roleId, permissionId) {
  const actor = getCurrentUser_();
  
  try {
    logInfo_(actor, 'Revoke', 'SYS_Role_Permissions', `${roleId}-${permissionId}`, 'Revoking permission');
    
    if (isEmpty_(roleId) || isEmpty_(permissionId)) {
      throw new Error('Role ID and Permission ID are required');
    }
    
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName('SYS_Role_Permissions');
    
    if (!sheet) {
      throw new Error('SYS_Role_Permissions sheet not found');
    }
    
    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    const roleCol = headers.indexOf('ROL_ID');
    const permCol = headers.indexOf('PRM_ID');
    
    for (let i = data.length - 1; i >= 2; i--) {
      if (data[i][roleCol] === roleId && data[i][permCol] === permissionId) {
        sheet.deleteRow(i + 1);
        logInfo_(actor, 'Revoke', 'SYS_Role_Permissions', `${roleId}-${permissionId}`, 'Permission revoked');
        writeToAuditLog_(actor, 'Revoke', 'SYS_Role_Permissions', `${roleId}-${permissionId}`, `Permission ${permissionId} revoked from role ${roleId}`, 'INFO');
        return createResponse_(true, null, 'Permission revoked successfully', []);
      }
    }
    
    throw new Error('Permission assignment not found');
    
  } catch (error) {
    logError_(actor, 'Revoke', 'SYS_Role_Permissions', `${roleId}-${permissionId}`, 'Failed to revoke permission', error);
    return createResponse_(false, null, error.message, ['REVOKE_FAILED']);
  }
}

/**
 * Lists all permissions for a role
 * @param {string} roleId - Role ID
 * @returns {Object} - Response object with permissions array
 */
function listRolePermissions(roleId) {
  const actor = getCurrentUser_();
  
  try {
    if (isEmpty_(roleId)) {
      throw new Error('Role ID is required');
    }
    
    const permissions = getRolePermissions_(roleId);
    
    logInfo_(actor, 'List', 'SYS_Role_Permissions', roleId, `Retrieved ${permissions.length} permissions`);
    
    return createResponse_(true, { permissions: permissions }, 'Permissions retrieved successfully', []);
    
  } catch (error) {
    logError_(actor, 'List', 'SYS_Role_Permissions', roleId, 'Failed to list permissions', error);
    return createResponse_(false, null, error.message, ['LIST_FAILED']);
  }
}

/**
 * Gets all available permissions in the system
 * @returns {Object} - Response object with permissions array
 */
function listAllPermissions() {
  const actor = getCurrentUser_();
  
  try {
    const permissions = getSheetData_('SYS_Permissions', 1);
    
    logInfo_(actor, 'List', 'SYS_Permissions', 'ALL', `Retrieved ${permissions.length} permissions`);
    
    return createResponse_(true, { permissions: permissions }, 'Permissions retrieved successfully', []);
    
  } catch (error) {
    logError_(actor, 'List', 'SYS_Permissions', 'ALL', 'Failed to list permissions', error);
    return createResponse_(false, null, error.message, ['LIST_FAILED']);
  }
}

/**
 * Gets all roles in the system
 * @returns {Object} - Response object with roles array
 */
function listAllRoles() {
  const actor = getCurrentUser_();
  
  try {
    const roles = getSheetData_('SYS_Roles', 1);
    
    logInfo_(actor, 'List', 'SYS_Roles', 'ALL', `Retrieved ${roles.length} roles`);
    
    return createResponse_(true, { roles: roles }, 'Roles retrieved successfully', []);
    
  } catch (error) {
    logError_(actor, 'List', 'SYS_Roles', 'ALL', 'Failed to list roles', error);
    return createResponse_(false, null, error.message, ['LIST_FAILED']);
  }
}

/**
 * Assigns full admin permissions to a role
 * @param {string} roleId - Role ID (typically ROL-ADMIN)
 * @returns {Object} - Response object
 */
function assignAdminPermissions(roleId) {
  const actor = getCurrentUser_();
  
  try {
    logInfo_(actor, 'AssignAdmin', 'SYS_Role_Permissions', roleId, 'Assigning admin permissions');
    
    // Get all permissions
    const allPermissions = getSheetData_('SYS_Permissions', 1);
    
    let granted = 0;
    let skipped = 0;
    
    allPermissions.forEach(perm => {
      const result = grantPermissionToRole(roleId, perm.PRM_ID, { scope: 'ALL' });
      if (result.success) {
        granted++;
      } else {
        skipped++;
      }
    });
    
    logInfo_(actor, 'AssignAdmin', 'SYS_Role_Permissions', roleId, `Granted ${granted} permissions, skipped ${skipped}`);
    
    return createResponse_(true, { granted: granted, skipped: skipped }, 'Admin permissions assigned', []);
    
  } catch (error) {
    logError_(actor, 'AssignAdmin', 'SYS_Role_Permissions', roleId, 'Failed to assign admin permissions', error);
    return createResponse_(false, null, error.message, ['ASSIGN_FAILED']);
  }
}
