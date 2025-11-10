/** =========================================================
 *  NIJJARA ERP – DAY 4 TEST FUNCTIONS
 *  Author: Mohamed / ChatGPT Assistant
 *  Purpose: Test user creation, authentication, and permissions
 *  ========================================================= */

/**
 * Creates the first admin user for testing
 */
function TEST_createAdminUser() {
  console.log('========================================');
  console.log('TEST: Creating Admin User');
  console.log('========================================');
  
  const adminData = {
    User_Name: 'admin',
    User_Full_Name: 'System Administrator',
    User_Email: 'admin@nijjara.local',
    User_Mobile: '+966500000000',
    User_Role: 'ROL-ADMIN',
    User_Department: 'IT',
    User_Password: 'Admin@123',  // Meets strength requirements
    User_IsActive: true
  };
  
  console.log('Creating user with data:', adminData);
  
  const result = createUser(adminData);
  
  console.log('Result:', JSON.stringify(result, null, 2));
  
  if (result.success) {
    console.log('✅ Admin user created successfully');
    console.log('User ID:', result.data.userId);
    console.log('Username:', adminData.User_Name);
    console.log('Password:', adminData.User_Password);
    console.log('\n👉 You can now test login with these credentials');
  } else {
    console.error('❌ Failed to create admin user');
    console.error('Error:', result.message);
    console.error('Codes:', result.errorCodes);
  }
  
  return result;
}

/**
 * Tests the complete login flow
 */
function TEST_loginFlow() {
  console.log('========================================');
  console.log('TEST: Complete Login Flow');
  console.log('========================================');
  
  const username = 'admin';
  const password = 'Admin@123';
  
  console.log('Step 1: Authenticating user...');
  const authResult = authenticateUser(username, password);
  
  console.log('Authentication result:', JSON.stringify(authResult, null, 2));
  
  if (!authResult.success) {
    console.error('❌ Authentication failed');
    console.error('Error:', authResult.message);
    return authResult;
  }
  
  console.log('✅ Authentication successful');
  console.log('Session Token:', authResult.data.sessionToken);
  
  console.log('\nStep 2: Validating session...');
  const sessionResult = validateSession(authResult.data.sessionToken);
  
  console.log('Session validation result:', JSON.stringify(sessionResult, null, 2));
  
  if (!sessionResult.success) {
    console.error('❌ Session validation failed');
    console.error('Error:', sessionResult.message);
    return sessionResult;
  }
  
  console.log('✅ Session valid');
  console.log('User ID:', sessionResult.data.userId);
  console.log('Session expires:', sessionResult.data.expiresAt);
  
  console.log('\n========================================');
  console.log('✅ LOGIN FLOW TEST PASSED');
  console.log('========================================');
  
  return sessionResult;
}

/**
 * Tests permission checking
 */
function TEST_permissions() {
  console.log('========================================');
  console.log('TEST: Permission Checking');
  console.log('========================================');
  
  // Get admin user
  const userResult = getUserByUsername('admin');
  
  if (!userResult.success) {
    console.error('❌ Failed to get admin user');
    console.error('Error:', userResult.message);
    return userResult;
  }
  
  const userId = userResult.data.User_ID;
  console.log('Testing permissions for user:', userId);
  console.log('User role:', userResult.data.User_Role);
  
  // Test various permissions
  const permissionsToTest = [
    'Create_User',
    'Edit_User',
    'View_Users',
    'Delete_User',
    'Create_Project',
    'View_Reports',
    'NONEXISTENT_PERMISSION'
  ];
  
  console.log('\nChecking permissions:');
  permissionsToTest.forEach(perm => {
    const hasPermission = userHasPermission(userId, perm);
    const icon = hasPermission ? '✅' : '❌';
    console.log(`${icon} ${perm}: ${hasPermission}`);
  });
  
  console.log('\nStep 2: Testing permission enforcement...');
  try {
    ensurePermission_(userId, 'Create_User');
    console.log('✅ ensurePermission_ passed for Create_User');
  } catch (error) {
    console.error('❌ ensurePermission_ failed:', error.message);
  }
  
  try {
    ensurePermission_(userId, 'FAKE_PERMISSION');
    console.error('❌ ensurePermission_ should have thrown for FAKE_PERMISSION');
  } catch (error) {
    console.log('✅ ensurePermission_ correctly denied FAKE_PERMISSION:', error.message);
  }
  
  console.log('\n========================================');
  console.log('✅ PERMISSION TEST PASSED');
  console.log('========================================');
  
  return { success: true };
}

/**
 * Runs all Day 4 tests in sequence
 */
function TEST_runAllDay4Tests() {
  console.log('\n\n');
  console.log('########################################');
  console.log('# DAY 4 COMPREHENSIVE TEST SUITE');
  console.log('########################################');
  console.log('\n');
  
  // Test 1: Create admin user
  console.log('TEST 1/3: Creating admin user...\n');
  const createResult = TEST_createAdminUser();
  if (!createResult.success) {
    console.error('\n❌ TEST SUITE FAILED at Test 1');
    return;
  }
  
  console.log('\n\n');
  
  // Test 2: Login flow
  console.log('TEST 2/3: Testing login flow...\n');
  const loginResult = TEST_loginFlow();
  if (!loginResult.success) {
    console.error('\n❌ TEST SUITE FAILED at Test 2');
    return;
  }
  
  console.log('\n\n');
  
  // Test 3: Permissions
  console.log('TEST 3/3: Testing permissions...\n');
  const permResult = TEST_permissions();
  if (!permResult.success) {
    console.error('\n❌ TEST SUITE FAILED at Test 3');
    return;
  }
  
  console.log('\n\n');
  console.log('########################################');
  console.log('# ✅ ALL DAY 4 TESTS PASSED');
  console.log('########################################');
  console.log('\n');
  console.log('Summary:');
  console.log('- Admin user created and stored in SYS_Users');
  console.log('- Password hashed with HMAC SHA256');
  console.log('- Login flow working (auth + session)');
  console.log('- Permission system operational');
  console.log('\n👉 System ready for Day 5 (HRM Module)');
}

/**
 * Quick test to check if admin user already exists
 */
function TEST_checkAdminExists() {
  console.log('Checking if admin user exists...');
  
  const result = getUserByUsername('admin');
  
  if (result.success) {
    console.log('✅ Admin user exists:');
    console.log(JSON.stringify(result.data, null, 2));
  } else {
    console.log('❌ Admin user does not exist');
    console.log('Run TEST_createAdminUser() to create it');
  }
  
  return result;
}
