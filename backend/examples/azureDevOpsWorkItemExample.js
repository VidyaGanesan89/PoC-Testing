const azureWorkItemAutomationService = require('../services/azureDevOps/azureWorkItemAutomationService');

async function runExample() {
  try {
    const context = await azureWorkItemAutomationService.syncGeneratedTest({
      testType: 'performance',
      prompt: 'Validate employee communications work item flow',
      testClassName: 'EmployeeCommsWorkItemTest',
      testFilePath: 'src/test/java/tests/EmployeeCommsWorkItemTest.java',
      relatedWorkItemIds: [10123, 10124],
      assignedTo: 'user@ups.com',
      priority: 2,
      state: 'Active',
      workItemType: 'Task'
    });

    console.log('Sync context:', context);

    await azureWorkItemAutomationService.postExecutionResult({
      context,
      testRunId: 'demo-run-id-001',
      testClassName: 'EmployeeCommsWorkItemTest',
      status: 'passed',
      duration: 42000
    });

    console.log('Posted test execution result comments/updates');
  } catch (error) {
    console.error('Azure DevOps example failed:', error.message);
  }
}

if (require.main === module) {
  runExample();
}
