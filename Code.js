/** =========================================================
 *  NIJJARA ERP – MAIN ENTRY POINT & ROUTER
 *  Author: Mohamed / ChatGPT Assistant
 *  Purpose: Main doGet handler and menu initialization
 *  ========================================================= */

/**
 * Creates custom menu on spreadsheet open
 */
function onOpen() {
  const ui = SpreadsheetApp.getUi();
  
  try {
    ui.createMenu('⚙️ Nijjara ERP Admin')
      .addItem('🔧 Run Initial Setup', 'setupAllSheets')
      .addItem('🌱 Seed All Initial Data', 'seedAllInitialData')
      .addSeparator()
      .addSubMenu(ui.createMenu('📋 Seed Individual Sheets')
        .addItem('Policy Sheets', 'seedAllPolicySheets')
        .addItem('System Roles', 'seedSystemRoles')
        .addItem('System Permissions', 'seedSystemPermissions'))
      .addSeparator()
      .addSubMenu(ui.createMenu('🧪 Test Functions')
        .addItem('Test Password Hashing', 'testPasswordHashing')
        .addItem('Test Session Creation', 'testSessionCreation'))
      .addSeparator()
      .addItem('📊 Open Audit Log', 'openAuditLog')
      .addItem('📋 View System Info', 'showSystemInfo')
      .addItem('🌐 Open Web App', 'openWebApp')
      .addSeparator()
      .addItem('🔄 Refresh Menu', 'onOpen')
      .addToUi();
    
    logInfo_('System', 'onOpen', 'Menu', 'N/A', 'Admin menu initialized successfully');
  } catch (error) {
    logError_('System', 'onOpen', 'Menu', 'N/A', 'Failed to initialize menu', error);
  }
}

/**
 * Opens the Audit Log sheet
 */
function openAuditLog() {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const auditSheet = ss.getSheetByName('SYS_Audit_Log');
    
    if (auditSheet) {
      auditSheet.activate();
      logInfo_('System', 'openAuditLog', 'SYS_Audit_Log', 'N/A', 'Audit log opened');
      SpreadsheetApp.getUi().alert('✅ Audit Log opened successfully.');
    } else {
      SpreadsheetApp.getUi().alert('⚠️ Audit Log sheet not found. Please run Setup first.');
      logError_('System', 'openAuditLog', 'SYS_Audit_Log', 'N/A', 'Sheet not found', null);
    }
  } catch (error) {
    logError_('System', 'openAuditLog', 'SYS_Audit_Log', 'N/A', 'Failed to open audit log', error);
    SpreadsheetApp.getUi().alert('❌ Error: ' + error.message);
  }
}

/**
 * Shows system information
 */
function showSystemInfo() {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const user = Session.getActiveUser().getEmail() || Session.getEffectiveUser().getEmail();
    const sheetCount = ss.getSheets().length;
    const timezone = ss.getSpreadsheetTimeZone();
    
    const info = [
      '📊 NIJJARA ERP SYSTEM INFO',
      '================================',
      `Spreadsheet: ${ss.getName()}`,
      `ID: ${ss.getId()}`,
      `Sheets: ${sheetCount}`,
      `Timezone: ${timezone}`,
      `Current User: ${user}`,
      `Timestamp: ${new Date().toLocaleString()}`,
      '================================'
    ].join('\n');
    
    SpreadsheetApp.getUi().alert(info);
    logInfo_('System', 'showSystemInfo', 'System', 'N/A', 'System info displayed');
  } catch (error) {
    logError_('System', 'showSystemInfo', 'System', 'N/A', 'Failed to show system info', error);
    SpreadsheetApp.getUi().alert('❌ Error: ' + error.message);
  }
}

/**
 * Opens the web app in a new tab
 */
function openWebApp() {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const url = ScriptApp.getService().getUrl();
    
    const html = HtmlService.createHtmlOutput(
      `<html><body><script>window.open('${url}', '_blank'); google.script.host.close();</script></body></html>`
    ).setWidth(200).setHeight(100);
    
    SpreadsheetApp.getUi().showModalDialog(html, 'Opening Web App...');
    logInfo_('System', 'openWebApp', 'WebApp', 'N/A', 'Web app URL opened');
  } catch (error) {
    logError_('System', 'openWebApp', 'WebApp', 'N/A', 'Failed to open web app', error);
    SpreadsheetApp.getUi().alert('❌ Error: ' + error.message);
  }
}

/**
 * Test function: Password hashing
 */
function testPasswordHashing() {
  try {
    const testPassword = 'TestPass123!';
    const result = hashPassword(testPassword);
    
    const info = [
      '🔐 PASSWORD HASHING TEST',
      '================================',
      `Password: ${testPassword}`,
      `Salt: ${result.salt.substring(0, 20)}...`,
      `Hash: ${result.hash.substring(0, 40)}...`,
      '',
      'Verifying password...',
      `Match: ${verifyPassword(testPassword, result.hash, result.salt) ? '✅ YES' : '❌ NO'}`,
      `Wrong Password: ${verifyPassword('WrongPass', result.hash, result.salt) ? '✅ YES' : '❌ NO'}`,
      '================================'
    ].join('\n');
    
    SpreadsheetApp.getUi().alert(info);
    logInfo_('System', 'testPasswordHashing', 'Auth', 'N/A', 'Password hashing test completed');
  } catch (error) {
    logError_('System', 'testPasswordHashing', 'Auth', 'N/A', 'Test failed', error);
    SpreadsheetApp.getUi().alert('❌ Error: ' + error.message);
  }
}

/**
 * Test function: Session creation
 */
function testSessionCreation() {
  try {
    // Create a dummy user object
    const dummyUser = {
      USR_ID: 'TEST-USER-001',
      USR_Name: 'testuser',
      EMP_Email: 'test@nijjara.com',
      ROL_ID: 'ROL-ADMIN',
      USR_Is_Active: true
    };
    
    const session = createSession_(dummyUser, '127.0.0.1');
    
    const info = [
      '🎟️ SESSION CREATION TEST',
      '================================',
      `Session ID: ${session.id}`,
      `Token: ${session.token.substring(0, 40)}...`,
      '',
      'Check SYS_Sessions sheet for details',
      '================================'
    ].join('\n');
    
    SpreadsheetApp.getUi().alert(info);
    logInfo_('System', 'testSessionCreation', 'SYS_Sessions', session.id, 'Session test completed');
  } catch (error) {
    logError_('System', 'testSessionCreation', 'SYS_Sessions', 'N/A', 'Test failed', error);
    SpreadsheetApp.getUi().alert('❌ Error: ' + error.message);
  }
}

/**
 * Main web app entry point (for future SPA deployment)
 */
function doGet(e) {
  try {
    logInfo_('System', 'doGet', 'WebApp', 'N/A', 'Web app accessed');
    
    // Serve the login page
    const template = HtmlService.createTemplateFromFile('frontend/Login');
    const html = template.evaluate()
      .setTitle('Nijjara ERP - Login')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
      .addMetaTag('viewport', 'width=device-width, initial-scale=1');
    
    return html;
  } catch (error) {
    logError_('System', 'doGet', 'WebApp', 'N/A', 'Failed to load web app', error);
    return HtmlService.createHtmlOutput('<h1>Error</h1><p>' + error.message + '</p>');
  }
}
