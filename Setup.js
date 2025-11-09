/** =========================================================
 *  NIJJARA ERP – FULL SYSTEM SETUP SCRIPT
 *  Author: Mohamed / ChatGPT Assistant
 *  Purpose: One-click initialization of all system sheets
 *           with English (Row 1) and Arabic (Row 2) headers.
 *           Automatically freezes & protects both rows.
 *  Logging: Full detail to Logger + Console + UI alert.
 *  ========================================================= */

function setupAllSheets() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const time = new Date().toLocaleString();
  const activeUserEmail = Session.getActiveUser().getEmail();
  const effectiveUserEmail = Session.getEffectiveUser().getEmail();
  const runUser = activeUserEmail || effectiveUserEmail || "System";
  const editorEmail = activeUserEmail || effectiveUserEmail || null;
  const log = [];
  const errors = [];
  let createdCount = 0;
  let resetCount = 0;

  const removeHeaderProtections = (targetSheet, description) => {
    const protections = targetSheet.getProtections(SpreadsheetApp.ProtectionType.RANGE) || [];
    protections.forEach((protection) => {
      if (protection.getDescription() === description) {
        protection.remove();
      }
    });
  };

  // ──────────────────────────────────────────────
  // MASTER SCHEMA DEFINITIONS
  // Each entry: [SheetName, [English Headers], [Arabic Headers]]
  // ──────────────────────────────────────────────
  const schema = [

  // ===== SYS MODULE =====
  ["SYS_Dashboard",
  ["SYS_Dash_ID","SYS_Metric_Code","SYS_Metric_Value","SYS_Dash_Date","SYS_Dash_Notes"],
  ["معرف لوحة النظام","كود المقياس","قيمة المقياس","تاريخ اللوحة","ملاحظات اللوحة"]],

  ["SYS_Documents",
  ["DOC_ID","DOC_Entity","DOC_Entity_ID","DOC_File_Name","DOC_Label","DOC_Drive_File_ID","DOC_Drive_URL","DOC_Upload_By","DOC_Crt_At"],
  ["معرف المستند","الكيان","معرف الكيان","اسم الملف","التصنيف","معرف ملف Google Drive","رابط الملف","تم الرفع بواسطة","تاريخ الإنشاء"]],

  ["SYS_Dropdowns",
  ["DD_ID","DD_EN","DD_AR","DD_Is_Active","DD_Sort_Order"],
  ["معرف القائمة","القيمة بالإنجليزية","القيمة بالعربية","نشط","ترتيب الفرز"]],

  ["SYS_Users",
  ["USR_ID","EMP_Name_EN","USR_Name","EMP_Email","Job_Title","DEPT_Name","ROL_ID","USR_Is_Active","Password_Hash","Last_Login","USR_Crt_At","USR_Crt_By","USR_Upd_At","USR_Upd_By"],
  ["معرف المستخدم","اسم الموظف بالإنجليزية","اسم المستخدم","البريد الإلكتروني","المسمى الوظيفي","القسم","معرف الدور","نشط","كلمة المرور المشفرة","آخر تسجيل دخول","تاريخ الإنشاء","أنشأ بواسطة","تاريخ التحديث","تم التحديث بواسطة"]],

  ["SYS_Roles",
  ["ROL_ID","ROL_Title","ROL_Notes","ROL_Is_System","ROL_Crt_At","ROL_Crt_By","ROL_Upd_At","ROL_Upd_By"],
  ["معرف الدور","عنوان الدور","ملاحظات الدور","دور نظام","تاريخ الإنشاء","أنشأ بواسطة","تاريخ التحديث","تم التحديث بواسطة"]],

  ["SYS_Permissions",
  ["PRM_ID","PRM_Name","PRM_Notes","PRM_Catg","PRM_Crt_At","PRM_Crt_By","PRM_Upd_At","PRM_Upd_By"],
  ["معرف الصلاحية","اسم الصلاحية","ملاحظات الصلاحية","فئة الصلاحية","تاريخ الإنشاء","أنشأ بواسطة","تاريخ التحديث","تم التحديث بواسطة"]],

  ["SYS_Role_Permissions",
  ["ROL_ID","PRM_ID","SRP_Scope","SRP_Is_Allowed","SRP_Constraints","SRP_Crt_At","SRP_Crt_By","SRP_Upd_At","SRP_Upd_By"],
  ["معرف الدور","معرف الصلاحية","نطاق الصلاحية","مسموح","قيود","تاريخ الإنشاء","أنشأ بواسطة","تاريخ التحديث","تم التحديث بواسطة"]],

  ["SYS_Audit_Log",
  ["AUD_ID","AUD_Time_Stamp","USR_ID","USR_Name","USR_ACTion","ACT_Details","AUD_Entity","AUD_Entity_ID","AUD_Scope","AUD_Sheet_ID","AUD_Sheet_Name","IP_Address"],
  ["معرف السجل","الوقت","معرف المستخدم","اسم المستخدم","الإجراء","تفاصيل الإجراء","الكيان","معرف الكيان","النطاق","معرف الشيت","اسم الشيت","عنوان IP"]],

  ["SYS_Sessions",
  ["SESS_ID","USR_ID","EMP_Email","ACTor_USR_ID","SESS_Type","SESS_Status","USR_Device","IP_Address","Auth_Token","SESS_Start_At","SESS_End_At","SESS_Crt_At","SESS_Crt_By","SESS_Last_Seen","SESS_Revoked_At","SESS_Revoked_By","SESS_Metadata"],
  ["معرف الجلسة","معرف المستخدم","البريد الإلكتروني","معرف المنفذ","نوع الجلسة","حالة الجلسة","جهاز المستخدم","عنوان IP","رمز المصادقة","وقت البدء","وقت الانتهاء","تاريخ الإنشاء","أنشأ بواسطة","آخر ظهور","تاريخ الإلغاء","ألغيت بواسطة","بيانات إضافية"]],

  ["SYS_PubHolidays",
  ["PUBHOL_ID","Pub_Holiday_Date","Pub_Holiday_Name"],
  ["معرف العطلة","تاريخ العطلة","اسم العطلة"]],

  ["SYS_Analysis",
  ["SYS_ANA_ID","SYS_ANA_Date","SYS_ANA_Start","SYS_ANA_End","SYS_ANA_Item1","SYS_ANA_Item2","SYS_ANA_Item3","SYS_ANA_Item4","SYS_ANA_Item5","SYS_ANA_Item6","SYS_ANA_Item7","SYS_ANA_Item8","SYS_ANA_Item9"],
  ["معرف التحليل","تاريخ التحليل","البدء","الانتهاء","بند1","بند2","بند3","بند4","بند5","بند6","بند7","بند8","بند9"]],

  // ===== HRM MODULE =====
  ["HRM_Dashboard",
  ["HR_Dash_ID","HR_Metric_Code","HR_Metric_Value","HR_Dash_Date","HR_Dash_Notes"],
  ["معرف لوحة الموارد","كود المقياس","قيمة المقياس","تاريخ اللوحة","ملاحظات"]],

  ["HRM_Departments",
  ["DEPT_ID","DEPT_Name","DEPT_Is_Active","DEPT_Sort_Order","DEPT_Crt_At","DEPT_Crt_By","DEPT_Upd_At","DEPT_Upd_By"],
  ["معرف القسم","اسم القسم","نشط","ترتيب الفرز","تاريخ الإنشاء","أنشأ بواسطة","تاريخ التحديث","تم التحديث بواسطة"]],

  ["HRM_Employees",
  ["EMP_ID","EMP_Name_EN","EMP_Name_AR","Date_of_Birth","Gender","National_ID","Marital_Status","Military_Status","EMP_Mob_Main","EMP_Mob_Sub","Home_Address","EMP_Email","Emrgcy_Cont","EmrCont_Relation","EmrCont__Mob","Job_Title","DEPT_Name","Hire_Date","EMP_CONT_Type","EMP_Status","Basic_Salary","Allowances","Deducts","EMP_Crt_At","EMP_Crt_By","EMP_Upd_At","EMP_Upd_By"],
  ["معرف الموظف","الاسم بالإنجليزية","الاسم بالعربية","تاريخ الميلاد","النوع","الرقم القومي","الحالة الاجتماعية","الموقف من التجنيد","موبايل رئيسي","موبايل إضافي","العنوان","البريد الإلكتروني","رقم الطوارئ","صلة القرابة","هاتف الطوارئ","المسمى الوظيفي","القسم","تاريخ التعيين","نوع التعاقد","حالة الموظف","الراتب الأساسي","البدلات","الخصومات","تاريخ الإنشاء","أنشأ بواسطة","تاريخ التحديث","تم التحديث بواسطة"]],

  ["HRM_Attendance",
  ["ATT_ID","EMP_ID","ATT_Date","ATT_Check_In","ATT_Check_Out","ATT_Hours","ATT_Late_Mints","ATT_EarlyLV_Mints","ATT_OT_Mints","ATT_Notes","ATT_Status","ATT_Crt_At","ATT_Crt_By","ATT_Upd_At","ATT_Upd_By"],
  ["معرف الحضور","معرف الموظف","تاريخ الحضور","وقت الدخول","وقت الخروج","عدد الساعات","دقائق التأخير","دقائق الانصراف المبكر","دقائق العمل الإضافي","ملاحظات","حالة الحضور","تاريخ الإنشاء","أنشأ بواسطة","تاريخ التحديث","تم التحديث بواسطة"]],

  ["HRM_Leave",
  ["LV_ID","EMP_ID","LV_Type","LV_Start_Date","LV_End_Date","LV_NumDays","LV_Status","LV_Reason","LV_Approved_By","LV_Notes","LV_Crt_At","LV_Crt_By","LV_Upd_At","LV_Upd_By"],
  ["معرف الإجازة","معرف الموظف","نوع الإجازة","تاريخ البداية","تاريخ النهاية","عدد الأيام","حالة الإجازة","السبب","تمت الموافقة بواسطة","ملاحظات","تاريخ الإنشاء","أنشأ بواسطة","تاريخ التحديث","تم التحديث بواسطة"]],

  ["HRM_Advances",
  ["ADV_ID","EMP_ID","ADV_Issue_Date","ADV_Amnt","ADV_Setlmnt_Period","ADV_Instal","ADV_Notes","ADV_Status","ADV_Crt_At","ADV_Crt_By","ADV_Upd_At","ADV_Upd_By"],
  ["معرف السلفة","معرف الموظف","تاريخ الإصدار","قيمة السلفة","فترة التسوية","القسط","ملاحظات","حالة السلفة","تاريخ الإنشاء","أنشأ بواسطة","تاريخ التحديث","تم التحديث بواسطة"]],

  ["HRM_OverTime",
  ["OT_ID","EMP_ID","POL_OT_ID","ATT_Date","ATT_OT_Mints","OT_Amnt","OT_Crt_At","OT_Crt_By","OT_Upd_At","OT_Upd_By"],
  ["معرف العمل الإضافي","معرف الموظف","سياسة العمل الإضافي","تاريخ الحضور","دقائق العمل الإضافي","قيمة العمل الإضافي","تاريخ الإنشاء","أنشأ بواسطة","تاريخ التحديث","تم التحديث بواسطة"]],

  ["HRM_Deductions",
  ["DEDCT_ID","PEN_ID","PEN_Name","EMP_ID","DEDCT_Date","DEDCT_Amnt","DEDCT_Crt_At","DEDCT_Crt_By","DEDCT_Upd_At","DEDCT_Upd_By"],
  ["معرف الخصم","معرف الجزاء","اسم الجزاء","معرف الموظف","تاريخ الخصم","قيمة الخصم","تاريخ الإنشاء","أنشأ بواسطة","تاريخ التحديث","تم التحديث بواسطة"]],

  ["HRM_Analysis",
  ["HR_ANA_ID","HR_ANA_Date","HR_ANA_Start","HR_ANA_End","HR_ANA_Item1","HR_ANA_Item2","HR_ANA_Item3","HR_ANA_Item4","HR_ANA_Item5","HR_ANA_Item6","HR_ANA_Item7","HR_ANA_Item8","HR_ANA_Item9"],
  ["معرف التحليل","تاريخ التحليل","البدء","الانتهاء","بند1","بند2","بند3","بند4","بند5","بند6","بند7","بند8","بند9"]],

  // ===== PRJ MODULE =====
  ["PRJ_Dashboard",
  ["PRJ_Dash_ID","PRJ_Metric_Code","PRJ_Metric_Value","PRJ_Dash_Date","PRJ_Dash_Notes"],
  ["معرف لوحة المشاريع","كود المقياس","قيمة المقياس","تاريخ اللوحة","ملاحظات"]],

  ["PRJ_Main",
  ["PRJ_ID","PRJ_Name","CLI_ID","CLI_Name","PRJ_Status","PRJ_Type","PRJ_Budget","Plan_Num_Days","Plan_Start_Date","PRJ_Location","ADV_Crt_At","ADV_Crt_By","ADV_Upd_At","ADV_Upd_By"],
  ["معرف المشروع","اسم المشروع","معرف العميل","اسم العميل","حالة المشروع","نوع المشروع","ميزانية المشروع","عدد الأيام المخطط","تاريخ البدء المخطط","موقع المشروع","تاريخ الإنشاء","أنشأ بواسطة","تاريخ التحديث","تم التحديث بواسطة"]],

  ["PRJ_Clients",
  ["CLI_ID","CLI_Name","CLI_Mob_1","CLI_Mob_2","CLI_Email","ADV_Crt_At","ADV_Crt_By","ADV_Upd_At","ADV_Upd_By"],
  ["معرف العميل","اسم العميل","موبايل1","موبايل2","البريد الإلكتروني","تاريخ الإنشاء","أنشأ بواسطة","تاريخ التحديث","تم التحديث بواسطة"]],

  ["PRJ_Tasks",
  ["TSK_ID","PRJ_ID","TSK_Name","TSK_Priority","EMP_ID","TSK_Plan_Start","TSK_Plan_End","TSK_Start","TSK_End","TSK_Status","ADV_Crt_At","ADV_Crt_By","ADV_Upd_At","ADV_Upd_By"],
  ["معرف المهمة","معرف المشروع","اسم المهمة","الأولوية","معرف الموظف","بداية المخطط","نهاية المخطط","تاريخ البدء","تاريخ الانتهاء","حالة المهمة","تاريخ الإنشاء","أنشأ بواسطة","تاريخ التحديث","تم التحديث بواسطة"]],

  ["PRJ_Material",
  ["MAT_ID","MAT_Name","MAT_Catg","MAT_Sub1","MAT_Sub2","Default_Unit","Default_Price","MAT_Active","ADV_Crt_At","ADV_Crt_By","ADV_Upd_At","ADV_Upd_By"],
  ["معرف المادة","اسم المادة","الفئة","فرع1","فرع2","الوحدة الافتراضية","السعر الافتراضي","نشطة","تاريخ الإنشاء","أنشأ بواسطة","تاريخ التحديث","تم التحديث بواسطة"]],

  ["PRJ_IndirExp_Time_Alloc",
  ["ALO_TM_ID","InDiEXP_TM_ID","PRJ_ID","ALO_TM_Methd","ALO_TM_Percnt","ALO_TM_Amnt","ADV_Crt_At","ADV_Crt_By","ADV_Upd_At","ADV_Upd_By"],
  ["معرف التخصيص الزمني","معرف المصروف الزمني","معرف المشروع","طريقة التخصيص","النسبة","المبلغ","تاريخ الإنشاء","أنشأ بواسطة","تاريخ التحديث","تم التحديث بواسطة"]],

  ["PRJ_IndirExp_NoTime_Alloc",
  ["ALO_NT_ID","InDiEXP_NT_ID","PRJ_ID","ALO_NT_Methd","ALO_NT_Percnt","ALO_NT_Amnt","ADV_Crt_At","ADV_Crt_By","ADV_Upd_At","ADV_Upd_By"],
  ["معرف التخصيص غير الزمني","معرف المصروف غير الزمني","معرف المشروع","طريقة التخصيص","النسبة","المبلغ","تاريخ الإنشاء","أنشأ بواسطة","تاريخ التحديث","تم التحديث بواسطة"]],

  ["PRJ_Plan_vs_Actual",
  ["PvA_ID","PRJ_ID","PRJ_Name","Plan_Start_Date","Actual_Start_Date","Plan_Num_Days","Actual_Num_Days","Plan_End_Date","Actual_End_Date","Plan_Direct_Exp","Actual_Direct_Exp","Plan_MATs","Actual_MATs","ADV_Crt_At","ADV_Crt_By","ADV_Upd_At","ADV_Upd_By"],
  ["معرف المقارنة","معرف المشروع","اسم المشروع","تاريخ البدء المخطط","تاريخ البدء الفعلي","الأيام المخططة","الأيام الفعلية","تاريخ النهاية المخطط","تاريخ النهاية الفعلي","المصروفات المخططة","المصروفات الفعلية","الخامات المخططة","الخامات الفعلية","تاريخ الإنشاء","أنشأ بواسطة","تاريخ التحديث","تم التحديث بواسطة"]],

  ["PRJ_Analysis",
  ["PRJ_ANA_ID","PRJ_ANA_Date","PRJ_ANA_Start","PRJ_ANA_End","PRJ_ANA_Item1","PRJ_ANA_Item2","PRJ_ANA_Item3","PRJ_ANA_Item4","PRJ_ANA_Item5","PRJ_ANA_Item6","PRJ_ANA_Item7","PRJ_ANA_Item8","PRJ_ANA_Item9"],
  ["معرف التحليل","تاريخ التحليل","البدء","الانتهاء","بند1","بند2","بند3","بند4","بند5","بند6","بند7","بند8","بند9"]],

  // ===== FIN MODULE =====
  ["FIN_Dashboard",
  ["FIN_Dash_ID","FIN_Metric_Code","FIN_Metric_Value","FIN_Dash_Date","FIN_Dash_Notes"],
  ["معرف لوحة المالية","كود المقياس","قيمة المقياس","تاريخ اللوحة","ملاحظات"]],

  ["FIN_DirectExpenses",
  ["DiEXP_ID","PRJ_ID","PRJ_Name","DiEXP_Date","MAT_ID","MAT_Name","MAT_Catg","MAT_Sub1","MAT_Sub2","Default_Unit","Default_Price","MAT_Quantity","DiEXP_Total_VAT_Exc","DiEXP_Total_VAT_Inc","DiEXP_Pay_Status","DiEXP_Pay_Methd","DiEXP_Notes","ADV_Crt_At","ADV_Crt_By","ADV_Upd_At","ADV_Upd_By"],
  ["معرف المصروف","معرف المشروع","اسم المشروع","تاريخ المصروف","معرف المادة","اسم المادة","الفئة","فرع1","فرع2","الوحدة الافتراضية","السعر الافتراضي","الكمية","الإجمالي قبل الضريبة","الإجمالي بعد الضريبة","حالة الدفع","طريقة الدفع","ملاحظات","تاريخ الإنشاء","أنشأ بواسطة","تاريخ التحديث","تم التحديث بواسطة"]],

  ["FIN_InDirectExpenses_Time",
  ["InDiEXP_TM_ID","InDiEXP_TM_Catg","InDiEXP_TM_Sub1","InDiEXP_TM_Sub2","InDiEXP_Start","InDiEXP_End","InDiEXP_TM_Pay_Status","InDiEXP_TM_Pay_Methd","InDiEXP_TM_Notes","ADV_Crt_At","ADV_Crt_By","ADV_Upd_At","ADV_Upd_At"],
  ["معرف المصروف الزمني","الفئة","فرع1","فرع2","تاريخ البداية","تاريخ النهاية","حالة الدفع","طريقة الدفع","ملاحظات","تاريخ الإنشاء","أنشأ بواسطة","تاريخ التحديث","تم التحديث بواسطة"]],

  ["FIN_InDirectExpenses_NoTime",
  ["InDiEXP_NT_ID","InDiEXP_NT_Catg","InDiEXP_NT_Sub1","InDiEXP_NT_Sub2","Useful_Life_Months","Depreciation_Start_Date","InDiEXP_NT_Pay_Status","InDiEXP_NT_Pay_Methd","InDiEXP_NT_Notes","ADV_Crt_At","ADV_Crt_By","ADV_Upd_At","ADV_Upd_By"],
  ["معرف المصروف غير الزمني","الفئة","فرع1","فرع2","العمر الإنتاجي بالأشهر","تاريخ بدء الإهلاك","حالة الدفع","طريقة الدفع","ملاحظات","تاريخ الإنشاء","أنشأ بواسطة","تاريخ التحديث","تم التحديث بواسطة"]],

  ["FIN_PRJ_Revenue",
  ["REV_ID","PRJ_ID","REV_Date","REV_Amnt","REV_Type","REV_Source","REV_Notes","REV_Pay_Methd","REV_Invoice_Number","REV_Pay_Status","REV_Total","REV_Remain","ADV_Crt_At","ADV_Crt_By","ADV_Upd_At","ADV_Upd_By"],
  ["معرف الإيراد","معرف المشروع","تاريخ الإيراد","قيمة الإيراد","نوع الإيراد","المصدر","ملاحظات","طريقة الدفع","رقم الفاتورة","حالة الدفع","الإجمالي","المتبقي","تاريخ الإنشاء","أنشأ بواسطة","تاريخ التحديث","تم التحديث بواسطة"]],

  ["FIN_Custody",
  ["CSTD_ID","EMP_ID","EMP_Name","PRJ_ID","PRJ_Name","CSTD_Issue_Date","CSTD_Settl_Date","CSTD_Amnt","CSTD_Purpose","CSTD_Status","CSTD_Notes","ADV_Crt_At","ADV_Crt_By","ADV_Upd_At","ADV_Upd_By"],
  ["معرف العهدة","معرف الموظف","اسم الموظف","معرف المشروع","اسم المشروع","تاريخ الإصدار","تاريخ التسوية","قيمة العهدة","الغرض","الحالة","ملاحظات","تاريخ الإنشاء","أنشأ بواسطة","تاريخ التحديث","تم التحديث بواسطة"]],

  ["FIN_HRM_Payroll",
  ["PAY_ID","EMP_ID","EMP_Name","PAY_Start_Date","PAY_End_Date","Basic_Salary","Total_OT_Amnt","ADV_Instal","Total_DEDCT_Amnt","PAY_Net_Pay","PAY_Status","ADV_Crt_At","ADV_Crt_By","ADV_Upd_At","ADV_Upd_By"],
  ["معرف المرتب","معرف الموظف","اسم الموظف","تاريخ البداية","تاريخ النهاية","الراتب الأساسي","إجمالي الإضافي","قسط السلفة","إجمالي الخصومات","صافي الراتب","حالة الدفع","تاريخ الإنشاء","أنشأ بواسطة","تاريخ التحديث","تم التحديث بواسطة"]],

  ["FIN_P&L_Statements",
  ["P&L_ID","Rev_ID","DiEXP_ID","InDiEXP_TM_ID","InDiEXP_NT_ID","REV_Total","Total_DiEXP","Total_InDiEXP_TM","Total_InDiEXP_NT","P&L_Start_Date","P&L_End_Date","P&L_Amnt","ADV_Crt_At","ADV_Crt_By","ADV_Upd_At","ADV_Upd_By"],
  ["معرف الربح والخسارة","معرف الإيراد","معرف المصروف المباشر","معرف المصروف الزمني","معرف المصروف غير الزمني","إجمالي الإيرادات","إجمالي المصروفات المباشرة","إجمالي المصروفات الزمنية","إجمالي المصروفات غير الزمنية","تاريخ البداية","تاريخ النهاية","القيمة","تاريخ الإنشاء","أنشأ بواسطة","تاريخ التحديث","تم التحديث بواسطة"]],

  ["FIN_Analysis",
  ["FIN_ANA_ID","FIN_ANA_Date","FIN_ANA_Start","FIN_ANA_End","FIN_ANA_Item1","FIN_ANA_Item2","FIN_ANA_Item3","FIN_ANA_Item4","FIN_ANA_Item5","FIN_ANA_Item6","FIN_ANA_Item7","FIN_ANA_Item8","FIN_ANA_Item9"],
  ["معرف التحليل","تاريخ التحليل","البدء","الانتهاء","بند1","بند2","بند3","بند4","بند5","بند6","بند7","بند8","بند9"]]
  ];

  // ──────────────────────────────────────────────
  // MAIN LOOP
  // ──────────────────────────────────────────────
  schema.forEach(([name, en, ar]) => {
    const protectionDescription = `Protected Headers for ${name}`;
    try {
      let sheet = ss.getSheetByName(name);
      if (!sheet) {
        sheet = ss.insertSheet(name);
        createdCount += 1;
        log.push(`🆕 Created: ${name}`);
      } else {
        removeHeaderProtections(sheet, protectionDescription);
        sheet.clear();
        resetCount += 1;
        log.push(`♻️ Reset: ${name}`);
      }

      const columnCount = Math.max(en.length, ar.length);
      sheet.getRange(1, 1, 1, en.length).setValues([en]);
      sheet.getRange(2, 1, 1, ar.length).setValues([ar]);

      sheet.setFrozenRows(2);

      const headerRange = sheet.getRange(1, 1, 2, columnCount);
      headerRange.setFontWeight("bold").setBackground("#f2f2f2").setWrap(true);

      removeHeaderProtections(sheet, protectionDescription);
      const protection = headerRange.protect();
      protection.setDescription(protectionDescription);
      const editors = protection.getEditors();
      if (editors.length) {
        protection.removeEditors(editors);
      }
      if (editorEmail) {
        protection.addEditor(editorEmail);
      }
      if (protection.canDomainEdit()) {
        protection.setDomainEdit(false);
      }

      const msg = `✅ ${name} initialized (${en.length} columns).`;
      Logger.log(msg);
      log.push(msg);
    } catch (error) {
      const errMsg = `❌ ${name} failed: ${error.message || error}`;
      Logger.log(errMsg);
      console.error(error);
      log.push(errMsg);
      errors.push(errMsg);
    }
  });

  const finalStatus = errors.length ? "⚠️ Setup completed with warnings." : "✅ Setup completed successfully.";
  const summary = [
    "\n========= NIJJARA ERP SETUP SUMMARY =========",
    `Executed By  : ${runUser}`,
    `Timestamp    : ${time}`,
    `Total Sheets : ${schema.length}`,
    `Created      : ${createdCount}`,
    `Reset        : ${resetCount}`,
    `Failures     : ${errors.length}`,
    "--------------------------------------------",
    ...log,
    "--------------------------------------------",
    finalStatus
  ].join("\n");

  Logger.log(summary);
  console.log(summary);
  try {
    SpreadsheetApp.getUi().alert(summary);
  } catch (uiError) {
    ss.toast(finalStatus, "ERP Setup Summary", 30);
    Logger.log(`UI alert unavailable: ${uiError.message || uiError}`);
  }
  return summary;
}
