# Azure DevOps Work Item Management Integration

## Target Organization and Project
- Organization: `https://dev.azure.com/UPSProd8`
- Project: `P8AG_Emp_comms`

## Environment Variables
Set these in backend runtime environment:

- `AZURE_DEVOPS_ORG_URL=https://dev.azure.com/UPSProd8`
- `AZURE_DEVOPS_PROJECT=P8AG_Emp_comms`
- `AZURE_DEVOPS_PAT=<token>` **or** `AZURE_DEVOPS_OAUTH_TOKEN=<token>`
- `AZURE_DEVOPS_TEST_STATUS_FIELD=Custom.TestStatus` (optional)
- `AZURE_DEVOPS_API_VERSION=7.1` (optional)
- `AZURE_DEVOPS_TIMEOUT_MS=15000` (optional)

## Reusable Service Module
- Connector: `services/azureDevOps/azureDevOpsMcpConnector.js`
- Orchestrator: `services/azureDevOps/azureWorkItemAutomationService.js`

The service supports:
- Read work items (User Stories, Bugs, Tasks)
- Create work items
- Update work item fields (`State`, `Assigned To`, `Priority`, `Test Status`)
- Link generated test case work items with related work items
- Post test execution comments after run completion

## API Integration Layer
These endpoints are exposed under backend `/api`:

- `GET /api/azure-devops/work-items?types=User Story,Bug,Task&top=20`
- `POST /api/azure-devops/work-items`
- `PATCH /api/azure-devops/work-items/:id`
- `POST /api/azure-devops/work-items/:id/comments`
- `POST /api/azure-devops/work-items/:id/link`

## Generate Test Integration Behavior
When `testType` is work-item mode (`performance` or Azure Boards label), `/api/generate-ai-test` will:
1. Generate test files
2. Create a test-related work item
3. Link to provided related work item IDs
4. Update related work item fields
5. Run test
6. Post execution result comments + update test status field

### Example request payload for `/api/generate-ai-test`
```json
{
  "prompt": "Validate work item workflow and comments",
  "testType": "performance",
  "llm": "GPT-4o",
  "azureDevOps": {
    "relatedWorkItemIds": [10123, 10124],
    "assignedTo": "qa.user@ups.com",
    "priority": 2,
    "state": "Active",
    "workItemType": "Task"
  }
}
```

## MCP Connector Config
See `config/mcp/azure-devops-mcp.config.json` for connector configuration used by this service abstraction.

## Unit Tests
Run from `backend` directory:

```bash
npm run test:unit
```
