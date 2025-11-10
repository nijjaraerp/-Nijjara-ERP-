# 🧩 POLICY SHEETS — Static Business Rules

pgsql
Copy code
┌──────────────────────────────┐
│ Policy Engine (Read-Only)    │
└────────────┬────────────────┘
             ▼
┌───────────────────────────────────────────┐
│ Used by: │
│ - HRM_Attendance │
│ - HRM_Deductions │
│ - FIN_HRM_Payroll │
│ - FIN_DirectExpenses (if rates used) │
└───────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│ [Policy_Penalties] ⇠ Late arrivals, absences │
│ [Policy_Overtime] ⇠ Hourly OT rate │
│ [Policy_Salary] ⇠ Fixed bonuses or salary caps │
│ [Policy_Deductions] ⇠ Tax, legal, or internal deductions │
└──────────────────────────────────────────────────────────────┘

Each Sheet Format:

Policy_ID	Description	Numeric_Value
PEN-LATE-001	Late arrival per 15 mins	50
OT_RATE_STD	Overtime per hour	1.5

❗ Policies are never modified by UI
✅ Admin-only via sheet