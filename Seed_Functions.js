/**
 * @file Seed_Functions.js
 * @description This file programmatically inserts all Google Sheet formulas
 * (like ARRAYFORMULA) into the "View" (Arabic) columns to link them to
 * their "Engine" (English) counterparts.
 *
 * This is the single source of truth for all sheet formulas.
 * It is designed to be run *after* Setup.js.
 *
 * [VERSION 2.0 - CORRECTED 2025-11-08]
 */

// --------------------------------------------------------------------------
// --- MASTER FUNCTION TO RUN ---
// --------------------------------------------------------------------------

/**
 * [MASTER FUNCTION]
 * Select and run this function from the Apps Script Editor to apply
 * all required ARRAYFORMULA functions to the database sheets.
 *
 * This function is "idempotent" and can be run safely multiple times.
 */
function runApplyAllFormulas() {
  // Note: Assumes Logging.js is in the project.
  // We will proceed with console.log as a fallback for this file.
  const log = (message) => console.log(`(Seed_Functions) ${message}`);
  const errorLog = (func, err) => {
    console.error(`(Seed_Functions) !ERROR in ${func}: ${err.message}`, err.stack);
    // In a real scenario, this would call our "loud" logger:
    // logError_(func, err, 'SYSTEM_ADMIN');
  };

  log("Starting to apply all sheet formulas...");

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let successCount = 0;
  let failCount = 0;

  try {
    const allSheets = ss.getSheets();
    const allSheetNames = allSheets.map(sheet => sheet.getName());
    
    // Get all header data in one go to reduce API calls
    const allHeaders = {};
    allSheets.forEach(sheet => {
      const sheetName = sheet.getName();
      try {
        allHeaders[sheetName] = sheet.getRange(1, 1, 1, sheet.getMaxColumns()).getValues()[0];
      } catch (e) {
        errorLog(`runApplyAllFormulas (HeaderRead)`, `Could not read headers for ${sheetName}. ${e.message}`);
      }
    });

    log(`Found ${FORMULA_MAP.length} formulas to apply.`);

    FORMULA_MAP.forEach((entry, index) => {
      const { sheetName, viewHeader, engineHeader } = entry;
      
      log(`--- (${index + 1}/${FORMULA_MAP.length}) Processing: [${sheetName}] | ${viewHeader} -> ${engineHeader} ---`);
      
      if (!allSheetNames.includes(sheetName)) {
        log(`(WARN) Sheet [${sheetName}] not found. Skipping.`);
        failCount++;
        return;
      }
      
      const sheet = ss.getSheetByName(sheetName);
      const headers = allHeaders[sheetName];

      if (!headers) {
        log(`(WARN) Headers for [${sheetName}] could not be read. Skipping.`);
        failCount++;
        return;
      }

      try {
        // Find column indexes
        const engineColIndex = headers.indexOf(engineHeader) + 1; // 1-based
        const viewColIndex = headers.indexOf(viewHeader) + 1; // 1-based

        if (engineColIndex === 0) {
          throw new Error(`Engine header "${engineHeader}" not found in sheet "${sheetName}".`);
        }
        if (viewColIndex === 0) {
          throw new Error(`View header "${viewHeader}" not found in sheet "${sheetName}".`);
        }

        // Convert Engine column index to A1 notation (e.g., 3 -> "C")
        const engineColLetter = getColumnLetter_(engineColIndex);
        
        // Define the formula
        // This formula checks if the engine cell is blank. If so, it leaves the view cell blank.
        // Otherwise, it displays the engine cell's value.
        const formula = `=ARRAYFORMULA(IF(${engineColLetter}2:${engineColLetter}="",,${engineColLetter}2:${engineColLetter}))`;
        
        // Get the target cell (e.g., D2)
        const targetCell = sheet.getRange(2, viewColIndex);

        // Clear the entire column below the header (except the formula cell)
        // This prevents old data from sitting in cells below the array formula
        if (sheet.getMaxRows() > 2) {
          const clearRange = sheet.getRange(3, viewColIndex, sheet.getMaxRows() - 2, 1);
          clearRange.clearContent();
        }

        // Set the formula in the target cell
        targetCell.setFormula(formula);
        
        log(`(SUCCESS) Applied formula to [${sheetName}]!${targetCell.getA1Notation()}`);
        successCount++;

      } catch (e) {
        errorLog(`runApplyAllFormulas (Entry: ${sheetName})`, e);
        failCount++;
      }
    });

    log("--- Formula Application Complete ---");
    log(`Total Succeeded: ${successCount}`);
    log(`Total Failed: ${failCount}`);
    if(failCount > 0) {
      SpreadsheetApp.getUi().alert("Formula Seeding Complete", `Finished with ${failCount} errors. Check the logs for details.`);
    } else {
      SpreadsheetApp.getUi().alert("Formula Seeding Complete", `Successfully applied all ${successCount} formulas.`);
    }

  } catch (e) {
    errorLog('runApplyAllFormulas (MASTER)', e);
  }
}

/**
 * Helper function to convert a column index (1-based) to its A1 letter.
 * e.g., 1 -> "A", 27 -> "AA"
 * @param {number} colIndex - The 1-based column index.
 * @returns {string} The column letter(s).
 */
function getColumnLetter_(colIndex) {
  let letter = '', temp;
  while (colIndex > 0) {
    temp = (colIndex - 1) % 26;
    letter = String.fromCharCode(temp + 65) + letter;
    colIndex = (colIndex - temp - 1) / 26;
  }
  return letter;
}


// --------------------------------------------------------------------------
// --- (THE 'BRAIN') ---
// --- FORMULA_MAP Object ---
// --------------------------------------------------------------------------

/**
 * This is the "Single Source of Truth" for all formulas.
 * It maps the Arabic "View" header to its "Engine" (English) header.
 * The script will find these columns and link them.
 */
const FORMULA_MAP = [
  // --- SYS_Users ---
  { sheetName: "SYS_Users", viewHeader: "اسم المستخدم", engineHeader: "user_id" },
  { sheetName: "SYS_Users", viewHeader: "البريد الإلكتروني", engineHeader: "email" },
  { sheetName: "SYS_Users", viewHeader: "الاسم بالكامل", engineHeader: "full_name" },
  { sheetName: "SYS_Users", viewHeader: "الدور", engineHeader: "role_id" },
  { sheetName: "SYS_Users", viewHeader: "رقم الموظف", engineHeader: "employee_id" },
  { sheetName: "SYS_Users", viewHeader: "الحالة", engineHeader: "is_active" },
  { sheetName: "SYS_Users", viewHeader: "الهاتف", engineHeader: "phone" },
  // --- SYS_Roles ---
  { sheetName: "SYS_Roles", viewHeader: "معرف الدور", engineHeader: "role_id" },
  { sheetName: "SYS_Roles", viewHeader: "اسم الدور", engineHeader: "role_name_english" },
  { sheetName: "SYS_Roles", viewHeader: "الوصف", engineHeader: "description" },
  // --- SYS_Permissions ---
  { sheetName: "SYS_Permissions", viewHeader: "معرف الصلاحية", engineHeader: "permission_id" },
  { sheetName: "SYS_Permissions", viewHeader: "مجموعة الصلاحيات", engineHeader: "permission_group" },
  { sheetName: "SYS_Permissions", viewHeader: "الوصف", engineHeader: "description" },
  // --- HRM_Employees ---
  { sheetName: "HRM_Employees", viewHeader: "كود الموظف", engineHeader: "employee_id" },
  { sheetName: "HRM_Employees", viewHeader: "اسم الموظف", engineHeader: "full_name_arabic" },
  { sheetName: "HRM_Employees", viewHeader: "الرقم القومي", engineHeader: "national_id" },
  { sheetName: "HRM_Employees", viewHeader: "المسمى الوظيفي", engineHeader: "job_title" },
  { sheetName: "HRM_Employees", viewHeader: "الإدارة", engineHeader: "department_id" },
  { sheetName: "HRM_Employees", viewHeader: "تاريخ التعيين", engineHeader: "hire_date" },
  { sheetName: "HRM_Employees", viewHeader: "الراتب الأساسي", engineHeader: "salary_basic" },
  { sheetName: "HRM_Employees", viewHeader: "الحالة", engineHeader: "status" },
  { sheetName: "HRM_Employees", viewHeader: "البريد الشخصي", engineHeader: "personal_email" },
  { sheetName: "HRM_Employees", viewHeader: "الهاتف", engineHeader: "phone" },
  { sheetName: "HRM_Employees", viewHeader: "IBAN", engineHeader: "bank_iban" },
  // --- HRM_Departments ---
  { sheetName: "HRM_Departments", viewHeader: "كود الإدارة", engineHeader: "department_id" },
  { sheetName: "HRM_Departments", viewHeader: "اسم الإدارة", engineHeader: "department_name_english" },
  { sheetName: "HRM_Departments", viewHeader: "مدير الإدارة", engineHeader: "manager_employee_id" },
  // --- HRM_Attendance ---
  { sheetName: "HRM_Attendance", viewHeader: "الموظف", engineHeader: "employee_id" },
  { sheetName: "HRM_Attendance", viewHeader: "التاريخ", engineHeader: "date" },
  { sheetName: "HRM_Attendance", viewHeader: "وقت الحضور", engineHeader: "check_in_time" },
  { sheetName: "HRM_Attendance", viewHeader: "وقت الانصراف", engineHeader: "check_out_time" },
  { sheetName: "HRM_Attendance", viewHeader: "ساعات العمل", engineHeader: "hours_worked" },
  { sheetName: "HRM_Attendance", viewHeader: "الحالة", engineHeader: "status" },
  // --- HRM_OverTime ---
  { sheetName: "HRM_OverTime", viewHeader: "الموظف", engineHeader: "employee_id" },
  { sheetName: "HRM_OverTime", viewHeader: "التاريخ", engineHeader: "date" },
  { sheetName: "HRM_OverTime", viewHeader: "عدد الساعات", engineHeader: "hours" },
  { sheetName: "HRM_OverTime", viewHeader: "المعدل", engineHeader: "rate" },
  { sheetName: "HRM_OverTime", viewHeader: "الإجمالي", engineHeader: "total_amount" },
  { sheetName: "HRM_OverTime", viewHeader: "الحالة", engineHeader: "status" },
  // --- HRM_Leave_Requests ---
  { sheetName: "HRM_Leave_Requests", viewHeader: "الموظف", engineHeader: "employee_id" },
  { sheetName: "HRM_Leave_Requests", viewHeader: "نوع الإجازة", engineHeader: "leave_type" },
  { sheetName: "HRM_Leave_Requests", viewHeader: "تاريخ البدء", engineHeader: "start_date" },
  { sheetName: "HRM_Leave_Requests", viewHeader: "تاريخ الانتهاء", engineHeader: "end_date" },
  { sheetName: "HRM_Leave_Requests", viewHeader: "السبب", engineHeader: "reason" },
  { sheetName: "HRM_Leave_Requests", viewHeader: "الحالة", engineHeader: "status" },
  { sheetName: "HRM_Leave_Requests", viewHeader: "تمت الموافقة بواسطة", engineHeader: "approved_by" },
  // --- HRM_Advances ---
  { sheetName: "HRM_Advances", viewHeader: "الموظف", engineHeader: "employee_id" },
  { sheetName: "HRM_Advances", viewHeader: "التاريخ", engineHeader: "date" },
  { sheetName: "HRM_Advances", viewHeader: "المبلغ", engineHeader: "amount" },
  { sheetName: "HRM_Advances", viewHeader: "السبب", engineHeader: "reason" },
  { sheetName: "HRM_Advances", viewHeader: "الحالة", engineHeader: "status" },
  { sheetName: "HRM_Advances", viewHeader: "خصم من راتب", engineHeader: "deduct_from_payroll_id" },
  // --- HRM_Deductions ---
  { sheetName: "HRM_Deductions", viewHeader: "الموظف", engineHeader: "employee_id" },
  { sheetName: "HRM_Deductions", viewHeader: "التاريخ", engineHeader: "date" },
  { sheetName: "HRM_Deductions", viewHeader: "المبلغ", engineHeader: "amount" },
  { sheetName: "HRM_Deductions", viewHeader: "السبب", engineHeader: "reason" },
  { sheetName: "HRM_Deductions", viewHeader: "الحالة", engineHeader: "status" },
  { sheetName: "HRM_Deductions", viewHeader: "خصم من راتب", engineHeader: "deduct_from_payroll_id" },
  // --- HRM_Payroll ---
  { sheetName: "HRM_Payroll", viewHeader: "الموظف", engineHeader: "employee_id" },
  { sheetName: "HRM_Payroll", viewHeader: "شهر", engineHeader: "pay_period_month" },
  { sheetName: "HRM_Payroll", viewHeader: "سنة", engineHeader: "pay_period_year" },
  { sheetName: "HRM_Payroll", viewHeader: "الراتب الأساسي", engineHeader: "basic_salary" },
  { sheetName: "HRM_Payroll", viewHeader: "إجمالي السلف", engineHeader: "total_advances" },
  { sheetName: "HRM_Payroll", viewHeader: "إجمالي الخصومات", engineHeader: "total_deductions" },
  { sheetName: "HRM_Payroll", viewHeader: "إجمالي الإضافي", engineHeader: "total_overtime" },
  { sheetName: "HRM_Payroll", viewHeader: "إجمالي المكافآت", engineHeader: "total_bonus" },
  { sheetName: "HRM_Payroll", viewHeader: "صافي الراتب", engineHeader: "net_salary" },
  { sheetName: "HRM_Payroll", viewHeader: "الحالة", engineHeader: "status" },
  // --- HRM_Penalties_Policy ---
  { sheetName: "HRM_Penalties_Policy", viewHeader: "كود السياسة", engineHeader: "policy_id" },
  { sheetName: "HRM_Penalties_Policy", viewHeader: "اسم السياسة", engineHeader: "policy_name" },
  { sheetName: "HRM_Penalties_Policy", viewHeader: "الوصف", engineHeader: "description" },
  { sheetName: "HRM_Penalties_Policy", viewHeader: "الفئة", engineHeader: "category" },
  { sheetName: "HRM_Penalties_Policy", viewHeader: "نوع القيمة", engineHeader: "value_type" },
  { sheetName: "HRM_Penalties_Policy", viewHeader: "القيمة", engineHeader: "value" },
  // --- HRM_Bonus_Policy ---
  { sheetName: "HRM_Bonus_Policy", viewHeader: "كود السياسة", engineHeader: "policy_id" },
  { sheetName: "HRM_Bonus_Policy", viewHeader: "اسم السياسة", engineHeader: "policy_name" },
  { sheetName: "HRM_Bonus_Policy", viewHeader: "الوصف", engineHeader: "description" },
  { sheetName: "HRM_Bonus_Policy", viewHeader: "الفئة", engineHeader: "category" },
  { sheetName: "HRM_Bonus_Policy", viewHeader: "نوع القيمة", engineHeader: "value_type" },
  { sheetName: "HRM_Bonus_Policy", viewHeader: "القيمة", engineHeader: "value" },
  // --- PRJ_Main ---
  { sheetName: "PRJ_Main", viewHeader: "كود المشروع", engineHeader: "project_id" },
  { sheetName: "PRJ_Main", viewHeader: "اسم المشروع", engineHeader: "project_name" },
  { sheetName: "PRJ_Main", viewHeader: "العميل", engineHeader: "client_id" },
  { sheetName: "PRJ_Main", viewHeader: "مدير المشروع", engineHeader: "manager_employee_id" },
  { sheetName: "PRJ_Main", viewHeader: "تاريخ البدء", engineHeader: "start_date" },
  { sheetName: "PRJ_Main", viewHeader: "التاريخ المخطط للانتهاء", engineHeader: "end_date_planned" },
  { sheetName: "PRJ_Main", viewHeader: "التاريخ الفعلي للانتهاء", engineHeader: "end_date_actual" },
  { sheetName: "PRJ_Main", viewHeader: "الحالة", engineHeader: "status" },
  { sheetName: "PRJ_Main", viewHeader: "الميزانية المقدرة", engineHeader: "budget_estimated" },
  { sheetName: "PRJ_Main", viewHeader: "الميزانية الفعلية", engineHeader: "budget_actual" },
  { sheetName: "PRJ_Main", viewHeader: "الوصف", engineHeader: "description" },
  // --- PRJ_Clients ---
  { sheetName: "PRJ_Clients", viewHeader: "كود العميل", engineHeader: "client_id" },
  { sheetName: "PRJ_Clients", viewHeader: "اسم العميل", engineHeader: "client_name" },
  { sheetName: "PRJ_Clients", viewHeader: "الشخص المسؤول", engineHeader: "contact_person" },
  { sheetName: "PRJ_Clients", viewHeader: "البريد الإلكتروني", engineHeader: "email" },
  { sheetName: "PRJ_Clients", viewHeader: "الهاتف", engineHeader: "phone" },
  { sheetName: "PRJ_Clients", viewHeader: "العنوان", engineHeader: "address" },
  { sheetName: "PRJ_Clients", viewHeader: "نوع العميل", engineHeader: "client_type" },
  // --- PRJ_Tasks ---
  { sheetName: "PRJ_Tasks", viewHeader: "المهمة", engineHeader: "task_name" },
  { sheetName: "PRJ_Tasks", viewHeader: "المشروع", engineHeader: "project_id" },
  { sheetName: "PRJ_Tasks", viewHeader: "مسندة إلى", engineHeader: "assigned_to_employee_id" },
  { sheetName: "PRJ_Tasks", viewHeader: "تاريخ البدء", engineHeader: "start_date" },
  { sheetName: "PRJ_Tasks", viewHeader: "تاريخ الاستحقاق", engineHeader: "due_date" },
  { sheetName: "PRJ_Tasks", viewHeader: "الحالة", engineHeader: "status" },
  { sheetName: "PRJ_Tasks", viewHeader: "الأولوية", engineHeader: "priority" },
  // --- PRJ_Materials_Monitor ---
  { sheetName: "PRJ_Materials_Monitor", viewHeader: "المادة", engineHeader: "material_id" },
  { sheetName: "PRJ_Materials_Monitor", viewHeader: "المشروع", engineHeader: "project_id" },
  { sheetName: "PRJ_Materials_Monitor", viewHeader: "اسم البند", engineHeader: "item_name" },
  { sheetName: "PRJ_Materials_Monitor", viewHeader: "الوحدة", engineHeader: "unit" },
  { sheetName: "PRJ_Materials_Monitor", viewHeader: "الكمية المخططة", engineHeader: "qty_planned" },
  { sheetName: "PRJ_Materials_Monitor", viewHeader: "الكمية الفعلية", engineHeader: "qty_actual" },
  { sheetName: "PRJ_Materials_Monitor", viewHeader: "تكلفة الوحدة", engineHeader: "unit_cost" },
  { sheetName: "PRJ_Materials_Monitor", viewHeader: "التكلفة الإجمالية", engineHeader: "total_cost" },
  // --- PRJ_Expenses_Monitor ---
  { sheetName: "PRJ_Expenses_Monitor", viewHeader: "المصروف", engineHeader: "expense_id" },
  { sheetName: "PRJ_Expenses_Monitor", viewHeader: "المشروع", engineHeader: "project_id" },
  { sheetName: "PRJ_Expenses_Monitor", viewHeader: "التاريخ", engineHeader: "expense_date" },
  { sheetName: "PRJ_Expenses_Monitor", viewHeader: "الفئة", engineHeader: "category" },
  { sheetName: "PRJ_Expenses_Monitor", viewHeader: "الوصف", engineHeader: "description" },
  { sheetName: "PRJ_Expenses_Monitor", viewHeader: "المبلغ", engineHeader: "amount" },
  { sheetName: "PRJ_Expenses_Monitor", viewHeader: "المرفق", engineHeader: "receipt_doc_id" },
  
  // --- PRJ_Time_Line_Monitor --- [FIXED]
  { sheetName: "PRJ_Time_Line_Monitor", viewHeader: "المرحلة", engineHeader: "timeline_id" }, // <-- Was milestone_name
  { sheetName: "PRJ_Time_Line_Monitor", viewHeader: "المشروع", engineHeader: "project_id" },
  { sheetName: "PRJ_Time_Line_Monitor", viewHeader: "اسم المرحلة", engineHeader: "milestone_name" }, // <-- Correct
  { sheetName: "PRJ_Time_Line_Monitor", viewHeader: "التاريخ المخطط", engineHeader: "planned_date" },
  { sheetName: "PRJ_Time_Line_Monitor", viewHeader: "التاريخ الفعلي", engineHeader: "actual_date" },
  { sheetName: "PRJ_Time_Line_Monitor", viewHeader: "الحالة", engineHeader: "status" },
  { sheetName: "PRJ_Time_Line_Monitor", viewHeader: "ملاحظات", engineHeader: "notes" }, // <-- Typo `sheetName:Z` removed

  // --- PRJ_InDirExp_Allocations ---
  { sheetName: "PRJ_InDirExp_Allocations", viewHeader: "التخصيص", engineHeader: "allocation_id" },
  { sheetName: "PRJ_InDirExp_Allocations", viewHeader: "المشروع", engineHeader: "project_id" },
  { sheetName: "PRJ_InDirExp_Allocations", viewHeader: "المصروف غير المباشر", engineHeader: "indirect_expense_id" },
  { sheetName: "PRJ_InDirExp_Allocations", viewHeader: "نسبة التخصيص", engineHeader: "allocation_percentage" },
  { sheetName: "PRJ_InDirExp_Allocations", viewHeader: "المبلغ المخصص", engineHeader: "allocated_amount" },
  { sheetName: "PRJ_InDirExp_Allocations", viewHeader: "الفترة", engineHeader: "period" },
  
  // --- FIN_Direct_Expences ---
  { sheetName: "FIN_Direct_Expences", viewHeader: "كود المصروف", engineHeader: "expense_id" },
  { sheetName: "FIN_Direct_Expences", viewHeader: "المشروع", engineHeader: "project_id" },
  { sheetName: "FIN_Direct_Expences", viewHeader: "التاريخ", engineHeader: "expense_date" },
  { sheetName: "FIN_Direct_Expences", viewHeader: "الفئة", engineHeader: "category" },
  { sheetName: "FIN_Direct_Expences", viewHeader: "الوصف", engineHeader: "description" },
  { sheetName: "FIN_Direct_Expences", viewHeader: "المبلغ", engineHeader: "amount" },
  { sheetName: "FIN_Direct_Expences", viewHeader: "المرفق", engineHeader: "receipt_doc_id" },
  { sheetName: "FIN_Direct_Expences", viewHeader: "مدفوع بواسطة", engineHeader: "paid_by_employee_id" },
  { sheetName: "FIN_Direct_Expences", viewHeader: "الحالة", engineHeader: "status" },
  
  // --- FIN_Indirect_Expenses_ReOccurs ---
  { sheetName: "FIN_Indirect_Expenses_ReOccurs", viewHeader: "كود المصروف", engineHeader: "indirect_expense_id" },
  { sheetName: "FIN_Indirect_Expenses_ReOccurs", viewHeader: "التاريخ", engineHeader: "expense_date" },
  { sheetName: "FIN_Indirect_Expenses_ReOccurs", viewHeader: "الفئة", engineHeader: "category" },
  { sheetName: "FIN_Indirect_Expenses_ReOccurs", viewHeader: "الوصف", engineHeader: "description" },
  { sheetName: "FIN_Indirect_Expenses_ReOccurs", viewHeader: "المبلغ", engineHeader: "amount" },
  { sheetName: "FIN_Indirect_Expenses_ReOccurs", viewHeader: "تاريخ الاستحقاق", engineHeader: "due_date" }, // <-- Typo `sheetName:Storage:` removed
  { sheetName: "FIN_Indirect_Expenses_ReOccurs", viewHeader: "التكرار", engineHeader: "frequency" },
  
  // --- FIN_Indirect_Expenses_Once ---
  { sheetName: "FIN_Indirect_Expenses_Once", viewHeader: "كود المصروف", engineHeader: "indirect_expense_id" },
  { sheetName: "FIN_Indirect_Expenses_Once", viewHeader: "التاريخ", engineHeader: "expense_date" },
  { sheetName: "FIN_Indirect_Expenses_Once", viewHeader: "الفئة", engineHeader: "category" },
  { sheetName: "FIN_Indirect_Expenses_Once", viewHeader: "الوصف", engineHeader: "description" },
  { sheetName: "FIN_Indirect_Expenses_Once", viewHeader: "المبلغ", engineHeader: "amount" },
  
  // --- FIN_Project_Revenue ---
  { sheetName: "FIN_Project_Revenue", viewHeader: "كود الإيراد", engineHeader: "revenue_id" },
  { sheetName: "FIN_Project_Revenue", viewHeader: "المشروع", engineHeader: "project_id" },
  { sheetName: "FIN_Project_Revenue", viewHeader: "رقم الفاتورة", engineHeader: "invoice_id" },
  { sheetName: "FIN_Project_Revenue", viewHeader: "تاريخ الفاتورة", engineHeader: "invoice_date" },
  { sheetName: "FIN_Project_Revenue", viewHeader: "تاريخ الاستحقاق", engineHeader: "due_date" },
  { sheetName: "FIN_Project_Revenue", viewHeader: "المبلغ", engineHeader: "amount" },
  { sheetName: "FIN_Project_Revenue", viewHeader: "الحالة", engineHeader: "status" },
  
  // --- FIN_Employess_Custody ---
  { sheetName: "FIN_Employess_Custody", viewHeader: "كود العهدة", engineHeader: "custody_id" },
  { sheetName: "FIN_Employess_Custody", viewHeader: "الموظف", engineHeader: "employee_id" },
  { sheetName: "FIN_Employess_Custody", viewHeader: "تاريخ الاستلام", engineHeader: "date_issued" },
  { sheetName: "FIN_Employess_Custody", viewHeader: "المبلغ", engineHeader: "amount" },
  { sheetName: "FIN_Employess_Custody", viewHeader: "الوصف", engineHeader: "description" },
  { sheetName: "FIN_Employess_Custody", viewHeader: "الحالة", engineHeader: "status" },
  { sheetName: "FIN_Employess_Custody", viewHeader: "تاريخ التسوية", engineHeader: "settled_date" },
];