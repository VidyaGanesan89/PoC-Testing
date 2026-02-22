# RAG Integration Guide

## Overview

The test automation framework now integrates with the RAG (Retrieval-Augmented Generation) server to automatically track and store test execution history with detailed metrics.

## Architecture

```
┌─────────────────┐         ┌──────────────────┐         ┌─────────────────┐
│   Test Runner   │────────▶│  Backend Server  │────────▶│   RAG Server    │
│  (Maven/TestNG) │         │   (Port 8080)    │         │   (Port 8081)   │
└─────────────────┘         └──────────────────┘         └─────────────────┘
         │                           │                            │
         │                           │                            │
         ▼                           ▼                            ▼
  Surefire Reports          RAG Integration            Test History DB
  (XML/TestNG)              Service                    (JSON Files)
```

## Features

### Automatic Test Execution Tracking
- ✅ **Test Results**: Total tests, passed, failed, skipped counts
- ✅ **Execution Duration**: Millisecond precision timing
- ✅ **Test Steps**: Detailed step-by-step execution log
- ✅ **Screenshots**: Automatic screenshot capture tracking
- ✅ **Metadata**: Browser, framework, MCP server information

### Data Captured

Each test execution sends the following data to RAG:

```json
{
  "runId": "test_1706202345678",
  "testClass": "parcelprotests.GeneratedTest_1769341723522",
  "testType": "selenium",
  "status": "passed",
  "timestamp": "2026-01-25T18:30:45.678Z",
  "duration": 34630,
  "results": {
    "totalTests": 1,
    "passed": 1,
    "failed": 0,
    "skipped": 0
  },
  "steps": [
    {
      "stepNumber": 1,
      "description": "Launch the Url - https://parcelpro3.ams1907.com",
      "status": "completed"
    },
    {
      "stepNumber": 2,
      "description": "In the home page click on drop down arrow near United States - English in header",
      "status": "completed"
    }
  ],
  "screenshots": [
    {
      "filename": "Step1_20260125_175933.png",
      "path": "functional test screenshots\\Step1_20260125_175933.png",
      "timestamp": "2026-01-25T18:30:45.678Z"
    }
  ],
  "metadata": {
    "browser": "chrome",
    "framework": "TestNG + Selenium",
    "mcpServer": "ups-selenium",
    "reportGenerated": true
  }
}
```

## API Endpoints

### Get RAG Statistics
```http
GET http://localhost:8080/api/rag/stats


```

**Response:**
```json
{
  "totalTestRuns": 15,
  "passRate": 0.87,
  "avgDuration": 32500,
  "recentTests": 10
}
```

### Query Test History
```http
POST http://localhost:8080/api/rag/query
Content-Type: application/json

{
  "question": "Show me all failed tests from last week"
}
```

**Response:**
```json
{
  "success": true,
  "answer": "Based on your test history...",
  "matchedRuns": [...],
  "count": 3
}
```

## Integration Points

### 1. Test Executor Service
File: `backend/services/testExecutor.js`

Automatically sends test execution data to RAG after each test run:

```javascript
mvnProcess.on('close', async (code) => {
  // ... existing code ...
  
  // Send to RAG server (non-blocking)
  ragIntegrationService.reportTestExecution(
    testClass,
    code,
    testExecution.duration
  ).catch(err => console.error('Failed to send to RAG:', err));
});
```

### 2. RAG Integration Service
File: `backend/services/ragIntegrationService.js`

Handles all communication with the RAG server:
- Parses TestNG XML results
- Extracts test steps from surefire reports
- Captures screenshot metadata
- Sends structured data to RAG API

### 3. API Routes
File: `backend/routes/api.js`

New endpoints for RAG interaction:
- `GET /api/rag/stats` - Get test statistics
- `POST /api/rag/query` - Query test history

## Usage

### Start All Servers
```bash
.\start-all-servers.bat
```

This starts:
- Backend Server (Port 8080)
- RAG Server (Port 8081)
- Frontend (Port 3000)

### Run Tests
```bash
.\run-tests.bat
```

Tests automatically send data to RAG upon completion.

### View RAG Data
1. **Via API**:
```bash
curl http://localhost:8080/api/rag/stats
```

2. **Via Frontend**:
Navigate to http://localhost:3000 and use the test history view.

## Configuration

### RAG Server URL
Default: `http://localhost:8081/api/test-history`

To change, edit `backend/services/ragIntegrationService.js`:
```javascript
constructor() {
  this.ragServerUrl = 'http://your-rag-server:8081/api/test-history';
}
```

### Timeout Settings
Default: 5 seconds for statistics, 10 seconds for queries

```javascript
const response = await axios.post(url, data, {
  timeout: 5000  // milliseconds
});
```

## Error Handling

The integration is designed to be non-blocking:

✅ **Tests continue** even if RAG server is unavailable
✅ **Warnings logged** instead of errors
✅ **Graceful degradation** if network issues occur

Example log when RAG is unavailable:
```
⚠️  RAG server not available at http://localhost:8081/api/test-history
```

## Data Storage

RAG stores test history in JSON files:
```
RAG_ViewHistory/
  data/
    test-runs/
      test_1706202345678.json
      test_1706202346789.json
      ...
    index.json
```

### Index File Structure
```json
[
  {
    "runId": "test_1706202345678",
    "testType": "selenium",
    "status": "passed",
    "timestamp": "2026-01-25T18:30:45.678Z",
    "duration": 34630
  }
]
```

## Benefits

1. **Historical Analysis**: Query past test executions
2. **Trend Tracking**: Monitor pass/fail rates over time
3. **Debugging**: Access detailed step-by-step logs
4. **Screenshot Archive**: Complete visual test evidence
5. **Performance Metrics**: Track execution duration trends

## Troubleshooting

### RAG Server Not Receiving Data

Check if RAG server is running:
```bash
curl http://localhost:8081/health
```

Expected response:
```json
{
  "status": "ok",
  "service": "RAG Test History",
  "timestamp": "2026-01-25T18:30:45.678Z"
}
```

### Network Errors

Verify ports are not blocked:
```powershell
Test-NetConnection -ComputerName localhost -Port 8081
```

### Missing Test Data

Ensure tests are generating surefire reports:
```bash
dir target\surefire-reports\TEST-*.xml
```

## Future Enhancements

- [ ] Real-time test execution streaming
- [ ] Advanced analytics dashboard
- [ ] ML-based test failure prediction
- [ ] Automatic flaky test detection
- [ ] Cross-browser execution tracking

## Related Documentation

- [HOW_TO_GENERATE_TESTS.md](HOW_TO_GENERATE_TESTS.md)
- [REPORT_GENERATION_GUIDE.md](REPORT_GENERATION_GUIDE.md)
- [FILE_PATHS_CONFIGURATION.md](FILE_PATHS_CONFIGURATION.md)
- [RAG_ViewHistory/README.md](RAG_ViewHistory/README.md)
