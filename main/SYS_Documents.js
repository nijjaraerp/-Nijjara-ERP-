/** =========================================================
 *  NIJJARA ERP – SYS_DOCUMENTS MODULE (STUB)
 *  Author: Mohamed / ChatGPT Assistant
 *  Purpose: Document metadata management (files stored in Google Drive)
 *  ========================================================= */

/**
 * Creates a document metadata entry
 * @param {Object} docData - Document data
 * @returns {Object} - Response object
 */
function createDocument(docData) {
  const actor = getCurrentUser_();
  
  try {
    logInfo_(actor, 'Create', 'SYS_Documents', 'NEW', 'Creating document entry');
    
    // Validate required fields
    if (isEmpty_(docData.DOC_Entity) || isEmpty_(docData.DOC_File_Name)) {
      throw new Error('Entity and file name are required');
    }
    
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const docsSheet = ss.getSheetByName('SYS_Documents');
    
    if (!docsSheet) {
      throw new Error('SYS_Documents sheet not found');
    }
    
    const docId = generateId_('DOC');
    const timestamp = new Date();
    
    const rowData = [
      docId,                              // DOC_ID
      docData.DOC_Entity || '',           // DOC_Entity (e.g., 'PRJ_Main', 'HRM_Employees')
      docData.DOC_Entity_ID || '',        // DOC_Entity_ID
      docData.DOC_File_Name || '',        // DOC_File_Name
      docData.DOC_Label || '',            // DOC_Label
      docData.DOC_Drive_File_ID || '',    // DOC_Drive_File_ID
      docData.DOC_Drive_URL || '',        // DOC_Drive_URL
      actor,                              // DOC_Upload_By
      timestamp                           // DOC_Crt_At
    ];
    
    docsSheet.appendRow(rowData);
    
    logInfo_(actor, 'Create', 'SYS_Documents', docId, 'Document entry created');
    writeToAuditLog_(actor, 'Create', 'SYS_Documents', docId, `Document ${docData.DOC_File_Name} uploaded for ${docData.DOC_Entity}`, 'INFO');
    
    return createResponse_(true, { docId: docId }, 'Document entry created', []);
    
  } catch (error) {
    logError_(actor, 'Create', 'SYS_Documents', 'NEW', 'Failed to create document entry', error);
    return createResponse_(false, null, error.message, ['CREATE_FAILED']);
  }
}

/**
 * Lists documents for an entity
 * @param {string} entity - Entity type (e.g., 'PRJ_Main')
 * @param {string} entityId - Entity ID (optional)
 * @returns {Object} - Response object with documents array
 */
function listDocuments(entity, entityId = null) {
  const actor = getCurrentUser_();
  
  try {
    if (isEmpty_(entity)) {
      throw new Error('Entity type is required');
    }
    
    const allDocs = getSheetData_('SYS_Documents', 1);
    let filtered = allDocs.filter(doc => doc.DOC_Entity === entity);
    
    if (entityId) {
      filtered = filtered.filter(doc => doc.DOC_Entity_ID === entityId);
    }
    
    logInfo_(actor, 'List', 'SYS_Documents', entity, `Retrieved ${filtered.length} documents`);
    
    return createResponse_(true, { documents: filtered }, 'Documents retrieved', []);
    
  } catch (error) {
    logError_(actor, 'List', 'SYS_Documents', entity, 'Failed to list documents', error);
    return createResponse_(false, null, error.message, ['LIST_FAILED']);
  }
}

/**
 * Deletes a document metadata entry
 * @param {string} docId - Document ID
 * @returns {Object} - Response object
 */
function deleteDocument(docId) {
  const actor = getCurrentUser_();
  
  try {
    if (isEmpty_(docId)) {
      throw new Error('Document ID is required');
    }
    
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const docsSheet = ss.getSheetByName('SYS_Documents');
    
    if (!docsSheet) {
      throw new Error('SYS_Documents sheet not found');
    }
    
    const data = docsSheet.getDataRange().getValues();
    const headers = data[0];
    const idCol = headers.indexOf('DOC_ID');
    
    for (let i = data.length - 1; i >= 2; i--) {
      if (data[i][idCol] === docId) {
        docsSheet.deleteRow(i + 1);
        logInfo_(actor, 'Delete', 'SYS_Documents', docId, 'Document entry deleted');
        writeToAuditLog_(actor, 'Delete', 'SYS_Documents', docId, 'Document metadata deleted', 'INFO');
        return createResponse_(true, null, 'Document entry deleted', []);
      }
    }
    
    throw new Error('Document not found');
    
  } catch (error) {
    logError_(actor, 'Delete', 'SYS_Documents', docId, 'Failed to delete document', error);
    return createResponse_(false, null, error.message, ['DELETE_FAILED']);
  }
}

/**
 * Gets document by ID
 * @param {string} docId - Document ID
 * @returns {Object} - Response object with document data
 */
function getDocumentById(docId) {
  const actor = getCurrentUser_();
  
  try {
    if (isEmpty_(docId)) {
      throw new Error('Document ID is required');
    }
    
    const docs = getSheetData_('SYS_Documents', 1);
    const doc = docs.find(d => d.DOC_ID === docId);
    
    if (!doc) {
      throw new Error('Document not found');
    }
    
    logInfo_(actor, 'Read', 'SYS_Documents', docId, 'Document retrieved');
    
    return createResponse_(true, doc, 'Document retrieved', []);
    
  } catch (error) {
    logError_(actor, 'Read', 'SYS_Documents', docId, 'Failed to get document', error);
    return createResponse_(false, null, error.message, ['READ_FAILED']);
  }
}
