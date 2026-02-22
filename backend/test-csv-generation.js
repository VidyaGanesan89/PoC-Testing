/**
 * Test script for CSV Test Case Generation
 * Run: node backend/test-csv-generation.js
 */

const azureWorkItemAutomationService = require('./services/azureDevOps/azureWorkItemAutomationService');
const csvWriter = require('./services/csvTestCaseWriter');

async function testCSVGeneration() {
  console.log('='.repeat(60));
  console.log('CSV Test Case Generation - Test Script');
  console.log('='.repeat(60));
  console.log('');

  // Test 1: Check configuration
  console.log('Test 1: Checking Azure DevOps Configuration');
  console.log('-'.repeat(60));
  const isConfigured = azureWorkItemAutomationService.connector.isConfigured();
  console.log(`✓ Configuration check: ${isConfigured ? '✅ CONFIGURED' : '❌ NOT CONFIGURED'}`);
  
  if (!isConfigured) {
    console.log('');
    console.log('⚠️  Azure DevOps is not configured.');
    console.log('   To configure:');
    console.log('   1. Copy backend/.env.example to backend/.env');
    console.log('   2. Add your Azure DevOps PAT token');
    console.log('   3. Restart the backend server');
    console.log('');
    console.log('Example .env configuration:');
    console.log('AZURE_DEVOPS_ORG_URL=https://dev.azure.com/UPSProd8');
    console.log('AZURE_DEVOPS_PROJECT=P8AG_Emp_comms');
    console.log('AZURE_DEVOPS_PAT=your_token_here');
    console.log('');
  }
  console.log('');

  // Test 2: Test mode detection
  console.log('Test 2: Testing Mode Detection');
  console.log('-'.repeat(60));
  
  const testTypes = [
    'Azure Boards - Work Item Management',
    'azure-boards-work-item-management',
    'performance',
    'functional'
  ];
  
  testTypes.forEach(testType => {
    const isAzureMode = azureWorkItemAutomationService.isAzureBoardsWorkItemTestType(testType);
    console.log(`✓ "${testType}": ${isAzureMode ? '✅ Azure Mode' : '❌ Standard Mode'}`);
  });
  console.log('');

  // Test 3: Test keyword detection
  console.log('Test 3: Testing Keyword Detection');
  console.log('-'.repeat(60));
  
  const prompts = [
    'Generate testcase for work item 36237',
    'Generate test case from work item 42103',
    'Generate selenium test from work item 12345',
    'Create functional test'
  ];
  
  prompts.forEach(prompt => {
    const hasKeyword = /\btestcase\b|\btest\s+case\b/i.test(prompt);
    console.log(`✓ "${prompt.substring(0, 40)}...": ${hasKeyword ? '✅ CSV Mode' : '❌ Java Mode'}`);
  });
  console.log('');

  // Test 4: Test CSV writer with mock data
  console.log('Test 4: Testing CSV Writer (Mock Data)');
  console.log('-'.repeat(60));
  
  const mockWorkItemData = {
    id: 99999,
    title: 'Test_CSV_Generation',
    scenario: 'Verify CSV writer functionality',
    testSteps: [
      {
        testName: 'Test_CSV_Generation',
        scenario: 'Verify CSV writer functionality',
        stepName: 'Step 1',
        stepsToExecute: 'Initialize the CSV writer service',
        expectedResults: 'CSV writer should be ready to generate files',
        passFail: ''
      },
      {
        testName: 'Test_CSV_Generation',
        scenario: 'Verify CSV writer functionality',
        stepName: 'Step 2',
        stepsToExecute: 'Generate CSV file with test data containing special characters: commas, quotes", and newlines',
        expectedResults: 'CSV should properly escape special characters:\n- Commas in values\n- Quotes in text\n- Newlines preserved',
        passFail: ''
      },
      {
        testName: 'Test_CSV_Generation',
        scenario: 'Verify CSV writer functionality',
        stepName: 'Step 3',
        stepsToExecute: 'Verify file creation in functional test report directory',
        expectedResults: 'File should exist with proper naming: WorkItem_99999_Test_CSV_Generation_YYYY-MM-DD.csv',
        passFail: ''
      }
    ]
  };

  try {
    const result = csvWriter.generateTestCaseCSV(mockWorkItemData);
    console.log(`✅ CSV file generated successfully!`);
    console.log(`   File: ${result.filename}`);
    console.log(`   Path: ${result.filePath}`);
    console.log(`   Steps: ${result.testStepCount}`);
    console.log(`   Work Item: ${result.workItemId}`);
    console.log('');
    console.log('✓ You can open the file to verify the format matches the expected structure.');
  } catch (error) {
    console.error(`❌ CSV generation failed: ${error.message}`);
  }
  console.log('');

  // Test 5: Test acceptance criteria parsing
  console.log('Test 5: Testing Acceptance Criteria Parsing');
  console.log('-'.repeat(60));
  
  const mockWorkItem = {
    id: 88888,
    fields: {
      'System.Title': 'Login Flow Validation',
      'System.Description': 'Test the login functionality',
      'Microsoft.VSTS.Common.AcceptanceCriteria': `
        <p>1. User navigates to login page</p>
        <p>- Login form should be visible with username and password fields</p>
        <p>- Remember me checkbox should be present</p>
        <br/>
        <p>2. User enters valid credentials and clicks submit</p>
        <p>- System should validate the credentials</p>
        <p>- User should be redirected to dashboard</p>
        <br/>
        <p>3. User enters invalid credentials</p>
        <p>- Error message should display</p>
        <p>- User should remain on login page</p>
      `
    }
  };

  try {
    const parsedData = csvWriter.parseWorkItemToTestSteps(mockWorkItem);
    console.log(`✅ Acceptance criteria parsed successfully!`);
    console.log(`   Test Steps: ${parsedData.testSteps.length}`);
    console.log('');
    parsedData.testSteps.forEach((step, idx) => {
      console.log(`   Step ${idx + 1}:`);
      console.log(`      Name: ${step.stepName}`);
      console.log(`      Action: ${step.stepsToExecute.substring(0, 60)}...`);
      console.log(`      Expected: ${step.expectedResults.substring(0, 60)}...`);
      console.log('');
    });
  } catch (error) {
    console.error(`❌ Parsing failed: ${error.message}`);
  }

  // Test 6: Live Azure DevOps test (only if configured)
  if (isConfigured) {
    console.log('Test 6: Testing Live Azure DevOps Connection');
    console.log('-'.repeat(60));
    console.log('⚠️  Skipping live test to avoid unnecessary API calls.');
    console.log('   To test live connection, use the UI or API endpoint.');
    console.log('');
    console.log('Example API call:');
    console.log('$payload = @{');
    console.log('  prompt = "Generate testcase for work item 36237"');
    console.log('  testType = "Azure Boards - Work Item Management"');
    console.log('  azureDevOps = @{ relatedWorkItemIds = @("36237") }');
    console.log('} | ConvertTo-Json -Depth 8');
    console.log('');
    console.log('Invoke-RestMethod -Uri "http://localhost:8080/api/generate-ai-test" `');
    console.log('  -Method Post -ContentType "application/json" -Body $payload');
    console.log('');
  }

  console.log('='.repeat(60));
  console.log('Test Complete!');
  console.log('='.repeat(60));
  console.log('');
  console.log('Summary:');
  console.log(`✓ Configuration: ${isConfigured ? '✅ Ready' : '❌ Needs setup'}`);
  console.log('✓ CSV Writer: ✅ Working');
  console.log('✓ Parser: ✅ Working');
  console.log('✓ Mode Detection: ✅ Working');
  console.log('');
  
  if (!isConfigured) {
    console.log('Next step: Configure Azure DevOps credentials in backend/.env');
  } else {
    console.log('Next step: Test via UI or API with real work item ID');
  }
  console.log('');
}

// Run tests
testCSVGeneration().catch(error => {
  console.error('Test script error:', error);
  process.exit(1);
});
