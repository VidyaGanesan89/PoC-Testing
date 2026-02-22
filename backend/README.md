# ParcelPro Express.js Backend

Backend server for ParcelPro test automation dashboard.

## Features

- REST API endpoints for test execution and metrics
- WebSocket support for real-time test progress updates
- Maven test execution integration
- Test history and metrics tracking

## Installation

```bash
cd backend
npm install
```

## Running the Server

```bash
# Production mode
npm start

# Development mode with auto-reload
npm run dev
```

Server runs on **http://localhost:8080**

## API Endpoints

### GET /api/metrics
Get test execution metrics (total, passed, failed, pass rate, etc.)

### GET /api/history
Get test execution history

### POST /api/run
Run a test
```json
{
  "testClass": "parcelprotests.ParcelProLanguageSelectTest",
  "testMethod": "verifyLanguageSelection"
}
```

### POST /api/generate-ai-test
Generate AI test (placeholder)
```json
{
  "prompt": "Test description",
  "llm": "gpt-4"
}
```

### GET /api/test-status/:id
Get test execution status by ID

### GET /api/llms
Get available LLM models

### GET /api/health
Health check endpoint

## WebSocket Events

### Client -> Server
- `connection` - Connect to WebSocket

### Server -> Client
- `test-progress` - Real-time test execution updates
  ```json
  {
    "testId": "uuid",
    "status": "running|passed|failed",
    "message": "Progress message",
    "timestamp": "ISO date"
  }
  ```

## Project Structure

```
backend/
├── server.js              # Express server & Socket.io setup
├── routes/
│   └── api.js            # REST API routes
├── services/
│   ├── testExecutor.js   # Maven test execution
│   └── metricsService.js # Metrics & history management
└── data/
    └── test-history.json # Test execution history (auto-generated)
```

## Integration with Frontend

Frontend connects to:
- REST API: `http://localhost:8080/api`
- WebSocket: `http://localhost:8080`

Make sure both frontend (port 3000) and backend (port 8080) are running.
