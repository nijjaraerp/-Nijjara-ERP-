# 🚀 Nijjara ERP - Deployment Guide

## Quick Start (3 Steps)

### **Step 1: Setup Database** ⚙️
```javascript
// In Google Apps Script Editor:

1. Open Setup.js
2. Run function: runInitialSetup()
   ✅ Creates all sheets with correct schema

3. Open Seed_Data.js  
4. Run function: runSeedAllData()
   ✅ Populates all data (roles, permissions, admin user, etc.)

5. Open Seed_Functions.js
6. Run function: runApplyAllFormulas()
   ✅ Links Arabic view columns to English engine columns
```

**Expected Result**: All sheets created and populated with:
- **SYS_Users**: Admin user `mkhoraiby` with password `210388`
- **SYS_Roles**: ROLE-0001 (Admin)
- **SYS_Permissions**: Full CRUD permissions for admin
- **EMP_Employee_Registry**: Sample employee (linked to admin user)
- **SET_Tab_Register**: Tab configurations
- **SET_Dynamic_Forms**: Form metadata (future use)
- All other sheets ready

---

### **Step 2: Deploy Web App** 🌐
```
1. In Apps Script Editor, click "Deploy" → "New deployment"

2. Settings:
   - Type: "Web app"
   - Description: "Nijjara ERP v1.0"
   - Execute as: "Me" (your account)
   - Who has access: 
     * Testing: "Anyone"
     * Production: "Anyone in [your-domain].com"

3. Click "Deploy"

4. If prompted "Authorize access":
   - Click "Authorize access"
   - Select your Google account
   - Click "Advanced" → "Go to [project name] (unsafe)"
   - Click "Allow"

5. Copy the "Web app URL" (looks like: https://script.google.com/macros/s/[ID]/exec)
```

**Expected Result**: You have a deployable web app URL

---

### **Step 3: Test the System** ✅
```
1. Open the Web App URL in your browser

2. You should see:
   ✅ Loading screen (briefly)
   ✅ Login view with dark theme
   ✅ Cairo font loaded
   ✅ RTL layout (Arabic text aligned right)

3. Login with default credentials:
   Username: mkhoraiby
   Password: 210388

4. On successful login:
   ✅ Success toast: "تم تسجيل الدخول بنجاح"
   ✅ Workspace view appears
   ✅ Top navigation with user menu
   ✅ Sidebar (currently empty - Phase 3)
   ✅ Main content area

5. Test logout:
   ✅ Click user icon (top left)
   ✅ Click "تسجيل خروج"
   ✅ Confirm logout
   ✅ Returns to login view
```

---

## 🔧 Troubleshooting

### **Issue: "Authorization required"**
**Solution**:
1. Go to Apps Script Editor
2. Run any function manually (e.g., `testSystem()` in Code.js)
3. Click "Review permissions"
4. Authorize the script
5. Redeploy web app

---

### **Issue: "Loading screen stuck"**
**Possible Causes**:
1. **No internet connection** - Check network
2. **Script not authorized** - See above
3. **JavaScript error** - Open browser console (F12), check for errors

**Solution**:
- Hard refresh: Ctrl + Shift + R (Windows) or Cmd + Shift + R (Mac)
- Clear browser cache
- Try incognito/private mode

---

### **Issue: "Login fails with correct credentials"**
**Check**:
1. Open Google Sheet
2. Go to SYS_Users sheet
3. Verify row exists:
   - username: mkhoraiby
   - password_hash: (should be filled)
   - password_salt: (should be filled)
   - is_active: TRUE

**Fix**:
1. Delete the row with mkhoraiby
2. Re-run `runSeedAllData()` in Seed_Data.js
3. Verify password_hash and password_salt columns are populated

---

### **Issue: "Wrong password" but you're using 210388**
**Cause**: Seed data didn't populate correctly or password was changed

**Fix**:
1. Open Seed_Data.js
2. Find the `seedAdminUser_()` function
3. Verify the password is set to: `'210388'`
4. Re-run `runSeedAllData()`
5. Check SYS_Users sheet - password_hash and password_salt should change

---

### **Issue: "Blank page after login"**
**Check**:
1. Open browser console (F12)
2. Look for JavaScript errors
3. Common causes:
   - `WorkspaceModule is not defined` - Normal, Phase 3 will implement this
   - `google.script.run not available` - You're in development mode (localhost)

**Solution**:
- If on deployed web app URL: Should work fine
- If testing locally: Won't work (google.script.run only available when deployed)

---

## 📱 Browser Compatibility

| Browser | Version | Status |
|---------|---------|--------|
| **Chrome** | Latest | ✅ Recommended |
| **Edge** | Latest | ✅ Fully Supported |
| **Firefox** | Latest | ✅ Fully Supported |
| **Safari** | Latest | ⚠️ May need cache clear |
| **Mobile Chrome** | Latest | ✅ Responsive Design |
| **Mobile Safari** | Latest | ⚠️ Touch events may need optimization |

---

## 🔐 Security Checklist

Before deploying to production:

- [ ] Change default admin password from `210388` to a strong password
- [ ] Set "Who has access" to "Anyone in [your-domain].com" (not "Anyone")
- [ ] Review SYS_Permissions to ensure roles have correct permissions
- [ ] Enable 2-factor authentication on Google account
- [ ] Set up regular backups of Google Sheet
- [ ] Review Logging.js logs in SYS_Error_Log sheet periodically

---

## 📊 System Requirements

**Server**:
- Google Workspace account (free tier works)
- Google Sheets API enabled (automatic)
- Apps Script enabled (automatic)

**Client**:
- Modern web browser (Chrome, Firefox, Edge, Safari)
- JavaScript enabled
- Cookies/localStorage enabled
- Internet connection

**Recommended**:
- Screen resolution: 1280x720 or higher
- Stable internet connection (>1 Mbps)

---

## 🎯 Testing Checklist

After deployment, verify:

### **Login Flow**:
- [ ] Login page loads with dark theme
- [ ] Cairo font displays correctly
- [ ] RTL layout works (text right-aligned)
- [ ] Username/password fields accept input
- [ ] Password visibility toggle works
- [ ] "Remember Me" checkbox works
- [ ] Invalid credentials show error message in Arabic
- [ ] Valid credentials (mkhoraiby/210388) log in successfully
- [ ] Success toast appears
- [ ] Workspace view displays

### **Session Management**:
- [ ] Login once, close tab, reopen URL → Auto-login (session active)
- [ ] Check "Remember Me", logout, login again → Username pre-filled
- [ ] Logout clears session
- [ ] After logout, reopening URL shows login view

### **UI/UX**:
- [ ] Loading spinner animates smoothly
- [ ] Toast notifications appear and auto-dismiss
- [ ] Top navigation displays correctly
- [ ] User menu icon clickable
- [ ] Responsive design works on mobile (test on phone)
- [ ] All Material Icons display correctly

### **Error Handling**:
- [ ] Disconnect internet, try login → User-friendly error message
- [ ] Wrong credentials → "اسم المستخدم أو كلمة المرور غير صحيحة"
- [ ] Global errors caught and displayed as toast

---

## 📞 Support

**For Issues**:
1. Check SYS_Error_Log sheet in Google Sheets
2. Open browser console (F12) and check for JavaScript errors
3. Review this troubleshooting guide

**Common Fixes**:
- Re-run `runInitialSetup()` → `runSeedAllData()` → `runApplyAllFormulas()`
- Hard refresh browser (Ctrl + Shift + R)
- Clear browser cache
- Try incognito/private mode
- Redeploy web app

---

## 🎉 Success Criteria

Your deployment is successful when:

✅ You can access the web app URL  
✅ Login page displays with dark theme and Cairo font  
✅ You can login with `mkhoraiby` / `210388`  
✅ Workspace view appears after successful login  
✅ User menu in top-left displays your username  
✅ Logout works and returns to login page  
✅ Session persists across browser tabs  

---

## 🚀 Next Phase

**Phase 3: Dynamic Content Rendering**
- Tab navigation (reading from SET_Tab_Register)
- Dynamic form rendering (reading from SET_Dynamic_Forms)
- CRUD operations (create, read, update, delete records)
- Data tables with search, filter, sort
- Permissions enforcement (hide/show buttons based on user role)

Stay tuned! 🎊
