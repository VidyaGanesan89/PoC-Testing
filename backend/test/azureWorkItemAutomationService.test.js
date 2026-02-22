const test = require('node:test');
const assert = require('node:assert/strict');
const { AzureWorkItemAutomationService } = require('../services/azureDevOps/azureWorkItemAutomationService');

function createMockConnector() {
  const calls = {
    createWorkItem: [],
    updateWorkItem: [],
    linkWorkItems: [],
    addComment: []
  };

  return {
    calls,
    isConfigured: () => true,
    project: 'P8AG_Emp_comms',
    organizationUrl: 'https://dev.azure.com/UPSProd8',
    async createWorkItem(type, fields) {
      calls.createWorkItem.push({ type, fields });
      return { id: 9001, fields };
    },
    async updateWorkItem(workItemId, fields) {
      calls.updateWorkItem.push({ workItemId, fields });
      return { id: workItemId, fields };
    },
    async linkWorkItems(sourceId, targetId, linkType, comment) {
      calls.linkWorkItems.push({ sourceId, targetId, linkType, comment });
      return { sourceId, targetId };
    },
    async addComment(workItemId, text) {
      calls.addComment.push({ workItemId, text });
      return { id: 1, text };
    },
    async getWorkItems() {
      return [];
    }
  };
}

test('detects Azure Boards work-item management test type', () => {
  const mock = createMockConnector();
  const service = new AzureWorkItemAutomationService({ connector: mock });

  assert.equal(service.isAzureBoardsWorkItemTestType('performance'), true);
  assert.equal(service.isAzureBoardsWorkItemTestType('Azure Boards – Work Item Management'), true);
  assert.equal(service.isAzureBoardsWorkItemTestType('functional'), false);
});

test('syncGeneratedTest creates and links work items', async () => {
  const mock = createMockConnector();
  const service = new AzureWorkItemAutomationService({ connector: mock });

  const context = await service.syncGeneratedTest({
    testType: 'performance',
    prompt: 'Create work item integration test',
    testClassName: 'WorkItemFlowTest',
    testFilePath: 'src/test/java/WorkItemFlowTest.java',
    relatedWorkItemIds: [101, 102],
    assignedTo: 'qa.user@ups.com',
    priority: 2,
    state: 'Active'
  });

  assert.equal(context.enabled, true);
  assert.equal(context.testCaseWorkItemId, 9001);
  assert.deepEqual(context.linkedWorkItemIds, [101, 102]);

  assert.equal(mock.calls.createWorkItem.length, 1);
  assert.equal(mock.calls.updateWorkItem.length, 2);
  assert.equal(mock.calls.linkWorkItems.length, 2);
});

test('postExecutionResult comments and updates test status', async () => {
  const mock = createMockConnector();
  const service = new AzureWorkItemAutomationService({ connector: mock });

  await service.postExecutionResult({
    context: {
      enabled: true,
      testCaseWorkItemId: 9001,
      linkedWorkItemIds: [101, 102]
    },
    testRunId: 'run-123',
    testClassName: 'WorkItemFlowTest',
    status: 'passed',
    duration: 5000
  });

  assert.equal(mock.calls.addComment.length, 3);
  assert.equal(mock.calls.updateWorkItem.length, 3);
  assert.ok(mock.calls.addComment[0].text.includes('Status: PASSED'));
});
