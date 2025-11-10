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
      .addItem('📊 Open Audit Log', 'openAuditLog')
      .addItem('📋 View System Info', 'showSystemInfo')
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
 * Main web app entry point (for future SPA deployment)
 */
function doGet(e) {
  try {
    logInfo_('System', 'doGet', 'WebApp', 'N/A', 'Web app accessed');
    
    // For now, return a simple HTML page
    const html = HtmlService.createHtmlOutput('<h1>Nijjara ERP</h1><p>System is being configured...</p>')
      .setTitle('Nijjara ERP')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
    
    return html;
  } catch (error) {
    logError_('System', 'doGet', 'WebApp', 'N/A', 'Failed to load web app', error);
    return HtmlService.createHtmlOutput('<h1>Error</h1><p>' + error.message + '</p>');
  }
}
