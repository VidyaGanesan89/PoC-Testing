# Integration Guide for RAG View History

## Step-by-Step Integration with Existing Platform

### Backend Integration

#### 1. Update Main Server (backend/server.js)

Add this after your existing routes:

```javascript
// RAG Test History Routes
const testHistoryRoutes = require('../RAG_ViewHistory/backend/routes/testHistoryRoutes');
app.use('/api/test-history', testHistoryRoutes);
```

#### 2. Update Test Executor (backend/services/testExecutor.js)

Add imports at top:
```javascript
const testHistoryService = require('../../RAG_ViewHistory/backend/services/testHistoryService');
const ragService = require('../../RAG_ViewHistory/backend/services/ragService');
```

In the `mvnProcess.on('close', ...)` handler, add:
```javascript
mvnProcess.on('close', async (code) => {
  testExecution.exitCode = code;
  testExecution.endTime = new Date();
  testExecution.status = code === 0 ? 'Passed' : 'Failed';
  testExecution.duration = testExecution.endTime - testExecution.startTime;

  // Save to RAG history
  try {
    const testRun = await testHistoryService.saveTestRun({
      testType: 'Functional',
      testClass: testExecution.testClass,
      testMethod: testExecution.testMethod,
      status: testExecution.status,
      duration: testExecution.duration,
      timestamp: testExecution.startTime.toISOString(),
      errorLogs: testExecution.output.filter(line => line.includes('ERROR')),
      exitCode: code
    });
    
    await ragService.addTestRun(testRun);
  } catch (error) {
    console.error('Error saving to RAG:', error);
  }

  // ... rest of your existing code
});
```

#### 3. Install OpenAI Package in Main Backend

```bash
cd backend
npm install openai
```

### Frontend Integration

#### 1. Copy Components

Already created in `RAG_ViewHistory/frontend/components/`:
- `TestHistoryChat.jsx` - Chat interface
- `HistoryInsights.jsx` - Stats and table

#### 2. Install Dependencies

```bash
cd frontend
npm install lucide-react
```

(axios already installed)

#### 3. Create New Page or Update Existing

Option A: Create new "Test History" page:

```javascript
// frontend/src/pages/TestHistory.jsx
import TestHistoryChat from '../components/TestHistoryChat';
import HistoryInsights from '../components/HistoryInsights';

const TestHistory = () => {
  return (
    <div className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-8">
          Test History & Insights
        </h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <TestHistoryChat />
          <HistoryInsights />
        </div>
      </div>
    </div>
  );
};

export default TestHistory;
```

Option B: Add to existing App.js:

```javascript
import TestHistoryChat from './components/TestHistoryChat';

// In your render, add a new section:
<div className="mb-8">
  <h2 className="text-2xl font-bold text-white mb-4">Ask About Test History</h2>
  <TestHistoryChat apiBaseUrl="http://localhost:8080/api" />
</div>
```

### Environment Variables

Create `.env` file in backend/:
```
OPENAI_API_KEY=YOUR_OPENAI_API_KEY_HERE
PORT=8080
```

Update openai.js:
```javascript
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});
```

### First Run

1. Start backend:
```bash
cd backend
npm start
```

2. Initialize RAG (one-time):
```bash
curl -X POST http://localhost:8080/api/test-history/initialize
```

3. Start frontend:
```bash
cd frontend
npm start
```

4. Visit http://localhost:3000

### Testing the Integration

1. Run a Maven test:
```bash
mvn clean test
```

2. Check test was saved:
```bash
curl http://localhost:8080/api/test-history
```

3. Try RAG query:
```bash
curl -X POST http://localhost:8080/api/test-history/query \
  -H "Content-Type: application/json" \
  -d '{"question": "What was the last test run?"}'
```

4. Use UI:
- Open http://localhost:3000
- Find "Test History" section
- Ask: "Why did the last test fail?"

### Common Issues

**Issue**: RAG not initialized
**Fix**: `POST /api/test-history/initialize`

**Issue**: OpenAI API error
**Fix**: Check API key in `.env` or `config/openai.js`

**Issue**: No test history
**Fix**: Run at least one test first, then initialize RAG

**Issue**: Frontend can't connect
**Fix**: Check CORS in backend `server.js`
```javascript
app.use(cors({
  origin: ['http://localhost:3000'],
  credentials: true
}));
```

### File Checklist

Backend:
- [x] `RAG_ViewHistory/backend/config/openai.js`
- [x] `RAG_ViewHistory/backend/models/testRun.js`
- [x] `RAG_ViewHistory/backend/services/testHistoryService.js`
- [x] `RAG_ViewHistory/backend/services/ragService.js`
- [x] `RAG_ViewHistory/backend/routes/testHistoryRoutes.js`
- [x] `RAG_ViewHistory/backend/package.json`

Frontend:
- [x] `RAG_ViewHistory/frontend/components/TestHistoryChat.jsx`
- [x] `RAG_ViewHistory/frontend/components/HistoryInsights.jsx`

Data:
- [x] `RAG_ViewHistory/data/test-runs/` (auto-created)
- [x] `RAG_ViewHistory/data/example-testrun.json`

Documentation:
- [x] `RAG_ViewHistory/README.md`
- [x] `RAG_ViewHistory/INTEGRATION.md` (this file)

### Complete!

Your test automation platform now has AI-powered test history analysis!

Users can:
- Ask natural language questions about past tests
- Get insights from GPT-4
- View statistics and trends
- Filter and search test runs
- Track failures and patterns

All running locally with no cloud dependencies (except OpenAI API).
