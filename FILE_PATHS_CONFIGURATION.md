# ParcelPro Test Automation Framework - File Paths Configuration

## Automated Test Generation & Execution Workflow

When you submit a test prompt from the **Frontend UI** (http://localhost:3000), the following automated workflow executes:

---

## 📁 File Generation Paths

### 1. **Test Files**
- **Path**: `C:\Users\GWJ6DMZ\Desktop\FINAL_AI\FINAL FUNCTIONAL TEST Using UPS MCP\src\test\java\parcelprotests`
- **Files**: `GeneratedTest_[timestamp].java`
- **Description**: TestNG test classes with actual test implementation
- **Auto-generated**: ✅ Yes (from frontend prompt)

### 2. **Page Object Files**
- **Path**: `C:\Users\GWJ6DMZ\Desktop\FINAL_AI\FINAL FUNCTIONAL TEST Using UPS MCP\src\test\java\pageobjects`
- **Files**: `GeneratedTest_[timestamp]Page.java`
- **Description**: Page Object Model classes for element interactions
- **Auto-generated**: ✅ Yes (from frontend prompt)

### 3. **Screenshots**
- **Path**: `C:\Users\GWJ6DMZ\Desktop\FINAL_AI\FINAL FUNCTIONAL TEST Using UPS MCP\functional test screenshots`
- **Files**: `Step[number]_[timestamp].png`
- **Description**: Captured after each test step during execution
- **Auto-captured**: ✅ Yes (during test execution)
- **Naming**: `Step1_20260125_175242.png`

### 4. **Test Reports**
- **Path**: `C:\Users\GWJ6DMZ\Desktop\FINAL_AI\FINAL FUNCTIONAL TEST Using UPS MCP\functional test report`
- **Files**: 
  - `Test_Report_[timestamp].html` (Full report with screenshots)
  - `Test_Report_[timestamp]_email.html` (Email-friendly summary)
- **Auto-generated**: ✅ Yes (after test execution)
- **Format**: Beautiful modern UI with embedded screenshots

---

## 🔄 Complete Workflow (Frontend to Report)

### Step 1: Generate Test (Frontend UI)
```
User inputs prompt → Frontend sends to Backend API
↓
Backend: JavaTestGenerator creates files
↓
✅ Test file: src/test/java/parcelprotests/GeneratedTest_[timestamp].java
✅ Page Object: src/test/java/pageobjects/GeneratedTest_[timestamp]Page.java
```

### Step 2: Execute Test
```
User clicks "Run Test" OR runs: .\run-tests.bat
↓
Maven compiles and runs TestNG tests
↓
During execution:
  - Each step captures screenshot → functional test screenshots/
  - Console logs test progress
```

### Step 3: Generate Report
```
Test completes → generate-report.bat runs automatically
↓
PowerShell script reads:
  - TestNG results (target/surefire-reports/testng-results.xml)
  - Console logs (target/surefire-reports/TestSuite.txt)
  - Screenshots (functional test screenshots/)
↓
✅ Creates: functional test report/Test_Report_[timestamp].html
✅ Embeds all screenshots in report
✅ Opens report in browser
```

---

## 📋 Path Summary Table

| Resource | Path | Auto-Generated | Format |
|----------|------|---------------|--------|
| **Test Files** | `src\test\java\parcelprotests` | ✅ Yes | `.java` |
| **Page Objects** | `src\test\java\pageobjects` | ✅ Yes | `.java` |
| **Screenshots** | `functional test screenshots` | ✅ Yes | `.png` |
| **Reports** | `functional test report` | ✅ Yes | `.html` |
| **Raw TestNG** | `target\surefire-reports` | ✅ Yes | `.xml`, `.html` |

---

## 🎯 Configuration Files

### Test Generation Paths
**File**: `backend/services/javaTestGenerator.js`
```javascript
baseTestPath: '../../src/test/java/parcelprotests'
basePageObjectPath: '../../src/test/java/pageobjects'
```

### Screenshot Path
**File**: `src/test/java/utility/Driver.java`
```java
Path screenshotsDir = Paths.get("functional test screenshots");
```

### Report Path
**File**: `generate-report.bat` & `scripts/Generate-CustomReport.ps1`
```batch
Output: "functional test report\%REPORT_NAME%.html"
```

---

## ✅ Verification Checklist

- [x] Frontend UI generates tests in correct folders
- [x] Tests compile successfully with Maven
- [x] Screenshots capture during execution
- [x] Screenshots save to dedicated folder
- [x] Reports generate with embedded screenshots
- [x] Reports open automatically in browser
- [x] All paths are relative to project root
- [x] No hardcoded absolute paths (portable)

---

## 🚀 Quick Commands

### Run All Tests
```bash
.\run-tests.bat
```
**Result**: Runs all tests + generates report with screenshots

### Generate Report Only
```bash
.\generate-report.bat
```
**Result**: Creates report from last test execution

### View Latest Report
```bash
.\open-report.bat
```
**Result**: Opens most recent report in browser

---

## 📝 Notes

- All paths are **relative to project root** for portability
- Timestamps ensure **no file overwrites**
- Screenshots are **automatically embedded** in reports
- Reports include **clickable full-size screenshots**
- Old files are **never deleted** (manual cleanup required)

---

## 🎨 Report Features

✅ Modern gradient UI design  
✅ Test statistics dashboard  
✅ Step-by-step breakdown  
✅ Embedded screenshots (click to enlarge)  
✅ Pass/Fail status badges  
✅ Execution timeline  
✅ Browser compatibility  

---

**Last Updated**: January 25, 2026  
**Status**: ✅ Fully Configured & Operational
