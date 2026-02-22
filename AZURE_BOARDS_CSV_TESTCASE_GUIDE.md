# Azure Boards CSV Test Case Generation

## Overview
This feature enables automatic generation of CSV test case files from Azure DevOps work items when using "Azure Boards - Work Item Management" test type.

## CSV Format
Generated files follow this structure matching manual test case format:

| S.No | Test Name | Scenario | Step Name | Steps to Execute | Expected Results | Pass/Fail |
|------|-----------|----------|-----------|------------------|-----------------|-----------|
| 1    | Register_Validations | User registration validation | Step 1 | Navigate to registration page... | Form fields should display... | |
| 2    | Register_Validations | User registration validation | Step 2 | Fill in user details... | Data should be accepted... | |

## How It Works

### Activation Conditions
CSV test case generation activates when **both** conditions are met:
1. **Test Type**: "Azure Boards - Work Item Management" 
2. **Keyword**: Prompt contains "testcase" or "test case"

### Workflow
1. User selects "Azure Boards - Work Item Management" test type
2. Enters prompt with work item ID and "testcase" keyword:
   ```
   Use Azure DevOps work item 36237 to generate testcase
   ```
3. System connects to Azure DevOps at https://dev.azure.com/UPSProd8/P8AG_Emp_comms/
4. Fetches work item acceptance criteria
5. Parses criteria into structured test steps
6. Generates CSV file in `functional test report/` directory
7. **No Java files are created**

## Configuration

### 1. Set Environment Variables
Copy `.env.example` to `.env` and configure:

```bash
# Required
AZURE_DEVOPS_ORG_URL=https://dev.azure.com/UPSProd8
AZURE_DEVOPS_PROJECT=P8AG_Emp_comms
AZURE_DEVOPS_PAT=your_personal_access_token_here

# Optional
AZURE_DEVOPS_API_VERSION=7.1
AZURE_DEVOPS_TIMEOUT_MS=15000
```

### 2. Get Personal Access Token (PAT)
1. Go to https://dev.azure.com/UPSProd8/_usersSettings/tokens
2. Click "New Token"
3. Required scopes:
   - **Work Items**: Read & Write
   - **Code**: Read
4. Copy token and add to `.env` file
5. Restart backend server

### 3. Verify Configuration
```powershell
# Test connection
cd backend
node -e "const svc = require('./services/azureDevOps/azureWorkItemAutomationService'); svc.connector.isConfigured() ? console.log('✅ Configured') : console.log('❌ Not configured')"
```

## Usage Examples

### From UI
1. Open test generation form
2. Select test type: **"Azure Boards - Work Item Management"**
3. Enter prompt:
   ```
   Generate testcase for work item 36237
   ```
4. Click "Generate Test"
5. CSV file created in `functional test report/` directory

### From API
```powershell
$payload = @{
  prompt = "Generate testcase for work item 36237"
  testType = "Azure Boards - Work Item Management"
  llm = "GPT-4o"
  azureDevOps = @{
    relatedWorkItemIds = @("36237")
  }
} | ConvertTo-Json -Depth 8

$response = Invoke-RestMethod -Uri "http://localhost:8080/api/generate-ai-test" `
  -Method Post `
  -ContentType "application/json" `
  -Body $payload

$response
```

## Response Format
```json
{
  "success": true,
  "mode": "csv-testcase",
  "message": "CSV test case generated from Azure DevOps work item",
  "csvFilePath": "C:\\...\\functional test report\\WorkItem_36237_TestCase_2026-02-16.csv",
  "csvFileName": "WorkItem_36237_TestCase_2026-02-16.csv",
  "testStepCount": 5,
  "workItemId": 36237,
  "workItemTitle": "User Registration Validation",
  "artifacts": [
    {
      "fileName": "WorkItem_36237_TestCase_2026-02-16.csv",
      "filePath": "...",
      "type": "CSV Test Case",
      "timestamp": "2026-02-16T10:30:00.000Z",
      "description": "Test case for work item 36237: User Registration Validation"
    }
  ]
}
```

## Acceptance Criteria Parsing

The service parses work item acceptance criteria into test steps:

### Input (Azure DevOps Acceptance Criteria)
```
1. User navigates to registration page
   - Registration form should be visible
   - All required fields must be present

2. User fills in registration details
   - Name, email, password fields should accept input
   - Email validation should trigger on blur

3. User submits form
   - Form should validate all fields
   - Success message should display
   - User should be redirected to dashboard
```

### Output (CSV Rows)
```csv
S.No,Test Name,Scenario,Step Name,Steps to Execute,Expected Results,Pass/Fail
1,User Registration,Registration flow,Step 1,User navigates to registration page,"Registration form should be visible
All required fields must be present",
2,User Registration,Registration flow,Step 2,User fills in registration details,"Name, email, password fields should accept input
Email validation should trigger on blur",
3,User Registration,Registration flow,Step 3,User submits form,"Form should validate all fields
Success message should display
User should be redirected to dashboard",
```

## File Naming Convention
```
WorkItem_{workItemId}_{sanitizedTitle}_{date}.csv
```

Examples:
- `WorkItem_36237_User_Registration_Validation_2026-02-16.csv`
- `WorkItem_42103_Login_Flow_Test_2026-02-16.csv`

## Troubleshooting

### Error: "Azure DevOps integration is not configured"
- Check `.env` file exists in `backend/` directory
- Verify `AZURE_DEVOPS_PAT` is set
- Restart backend server

### Error: "No work item ID provided"
- Include work item ID in prompt: `"work item 36237"`
- OR provide in API call: `azureDevOps.relatedWorkItemIds: ["36237"]`

### Error: "Failed to fetch work item"
- Verify work item ID exists in project
- Check PAT has "Work Items (Read)" permission
- Verify organization/project URLs are correct

### CSV file not generated
- Check both conditions: Azure Boards test type + "testcase" keyword
- Verify backend server is running
- Check console logs for errors
- Ensure `functional test report/` directory exists

## File Structure
```
backend/
├── services/
│   ├── csvTestCaseWriter.js (NEW)
│   └── azureDevOps/
│       ├── azureDevOpsMcpConnector.js
│       └── azureWorkItemAutomationService.js (UPDATED)
├── routes/
│   └── api.js (UPDATED)
└── .env.example (NEW)

functional test report/ (output directory)
└── WorkItem_*.csv
```

## API Endpoints

### Generate CSV Test Case
**POST** `/api/generate-ai-test`

**Activates CSV mode when:**
- `testType`: Contains "Azure Boards" or "Work Item Management"
- `prompt`: Contains "testcase" or "test case"

**Otherwise:** Generates Java Selenium test (default behavior)

## Benefits
✅ **No Java code** - Direct CSV output for manual test documentation  
✅ **Work item integration** - Pulls from Azure DevOps acceptance criteria  
✅ **Structured format** - Matches manual test case template  
✅ **Multi-step support** - Each acceptance criterion becomes a test step  
✅ **Auto-parsing** - Extracts steps and expected results  
✅ **Ready for import** - CSV can be imported to test management tools  

## Limitations
- Requires valid Azure DevOps PAT
- Work item must have acceptance criteria or description
- Parsing quality depends on acceptance criteria structure
- Maximum 12 steps per test case (configurable)

## See Also
- [Azure DevOps Integration Guide](./backend/docs/AZURE_DEVOPS_INTEGRATION.md)
- [Security Best Practices](./backend/docs/AZURE_DEVOPS_SECURITY_BEST_PRACTICES.md)
- Backend API documentation: `/backend/README.md`
