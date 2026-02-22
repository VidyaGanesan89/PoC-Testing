# RAG-Powered Test History Viewer

AI-powered test history analysis using Retrieval Augmented Generation (RAG) with OpenAI embeddings and GPT-4.

## 🎯 Overview

This module adds intelligent test history querying to your Selenium test automation platform. Users can ask natural language questions about past test runs and get AI-generated insights.

## 📁 Project Structure

```
RAG_ViewHistory/
├── backend/
│   ├── config/
│   │   └── openai.js              # OpenAI client configuration
│   ├── models/
│   │   └── testRun.js             # Test run data model
│   ├── services/
│   │   ├── testHistoryService.js  # Test run persistence & retrieval
│   │   └── ragService.js          # RAG implementation (embeddings + LLM)
│   ├── routes/
│   │   └── testHistoryRoutes.js   # API endpoints
│   └── package.json               # Dependencies
│
├── frontend/
│   └── components/
│       ├── TestHistoryChat.jsx    # Chat interface for RAG queries
│       └── HistoryInsights.jsx    # Statistics & test run table
│
└── data/
    ├── test-runs/                 # JSON storage for test runs
    │   ├── index.json             # Index file
    │   └── run_*.json             # Individual test runs
    └── example-testrun.json       # Example data schema
```

## 🚀 Quick Start

### 1. Install Dependencies

```bash
cd RAG_ViewHistory/backend
npm install
```

Dependencies installed:
- `openai` (v4.0.0) - OpenAI API client
- `express` (v4.18.2) - Web framework
- `cors` (v2.8.5) - CORS middleware

### 2. Set OpenAI API Key

Already configured in `backend/config/openai.js`:
```javascript
OPENAI_API_KEY=YOUR_OPENAI_API_KEY_HERE
```

Or set as environment variable:
```bash
export OPENAI_API_KEY=your_key_here
```

### 3. Integrate with Existing Backend

Add to your main `backend/server.js`:

```javascript
// Import RAG routes
const testHistoryRoutes = require('../RAG_ViewHistory/backend/routes/testHistoryRoutes');

// Add route
app.use('/api/test-history', testHistoryRoutes);
```

### 4. Initialize RAG Service

On first run, initialize the RAG service:

```bash
POST http://localhost:8080/api/test-history/initialize
```

This will:
- Load all existing test runs
- Generate embeddings for each run
- Build the vector store

## 📡 API Endpoints

### Get All Test Runs
```
GET /api/test-history
Query Params: ?limit=100&testType=Functional&status=Passed
```

### Get Single Test Run
```
GET /api/test-history/:runId
```

### Save New Test Run
```
POST /api/test-history
Body: { testType, prompt, status, duration, ... }
```

### Query with Natural Language (RAG)
```
POST /api/test-history/query
Body: { "question": "Why did the last test fail?" }
```

### Get Statistics
```
GET /api/test-history/stats
```

### Initialize RAG Service
```
POST /api/test-history/initialize
```

### Get RAG Statistics
```
GET /api/test-history/rag/stats
```

## 💬 Example Queries

Try these natural language questions:

- "Why did the last test fail?"
- "Show all failures related to language selection"
- "Summarize functional test failures from last week"
- "What are the most common errors?"
- "Show performance tests from today"
- "Which tests have been failing repeatedly?"
- "What was the average test duration yesterday?"

## 🎨 Frontend Integration

### 1. Copy Components to Your Frontend

```bash
cp RAG_ViewHistory/frontend/components/* ../frontend/src/components/
```

### 2. Install Frontend Dependencies

```bash
cd frontend
npm install lucide-react
```

### 3. Add to Your UI

```javascript
import TestHistoryChat from './components/TestHistoryChat';
import HistoryInsights from './components/HistoryInsights';

// In your "View History" page:
<TestHistoryChat apiBaseUrl="http://localhost:8080/api" />
<HistoryInsights apiBaseUrl="http://localhost:8080/api" />
```

## 🗄️ Data Schema

### TestRun Model

```javascript
{
  runId: string,           // Unique ID (auto-generated)
  testType: string,        // 'Functional' | 'Performance'
  prompt: string,          // Original test generation prompt
  testClass: string,       // Java test class name
  testMethod: string,      // Test method name
  status: string,          // 'Passed' | 'Failed' | 'Running'
  duration: number,        // Milliseconds
  timestamp: string,       // ISO 8601 date
  errorLogs: string[],     // Error messages
  reportPath: string,      // Path to HTML report
  screenshots: string[],   // Screenshot paths
  exitCode: number,        // Process exit code
  metrics: object          // Custom metrics
}
```

## 🔧 How It Works

### 1. **Data Persistence**
- Test runs saved as JSON files in `data/test-runs/`
- Index file tracks all runs for fast lookup
- Automatic cleanup (keeps last 1000 runs)

### 2. **Embedding Generation**
- Each test run converted to searchable text
- OpenAI `text-embedding-3-small` model generates embeddings
- Stored in in-memory vector store with metadata

### 3. **Semantic Search**
- User question → OpenAI embedding
- Cosine similarity finds top 5 related test runs
- Full test run details retrieved from storage

### 4. **Answer Generation**
- Relevant test runs used as context
- GPT-4 generates natural language answer
- Cites specific test runs in response

### 5. **Vector Store**
- In-memory implementation (no external dependencies)
- Cosine similarity for relevance scoring
- Fast lookup for real-time queries

## 🔄 Integration with Test Executor

Modify your `testExecutor.js` to save runs:

```javascript
const testHistoryService = require('../RAG_ViewHistory/backend/services/testHistoryService');
const ragService = require('../RAG_ViewHistory/backend/services/ragService');

// After test completes:
const testRun = await testHistoryService.saveTestRun({
  testType: 'Functional',
  prompt: userPrompt,
  testClass: testClass,
  testMethod: testMethod,
  status: exitCode === 0 ? 'Passed' : 'Failed',
  duration: endTime - startTime,
  timestamp: new Date().toISOString(),
  errorLogs: errors,
  reportPath: reportPath,
  screenshots: screenshots,
  exitCode: exitCode
});

// Add to RAG index
await ragService.addTestRun(testRun);
```

## 🎯 Key Features

✅ **Natural Language Queries** - Ask questions in plain English
✅ **Semantic Search** - Find relevant tests by meaning, not keywords
✅ **AI-Powered Insights** - GPT-4 analyzes patterns and trends
✅ **Automatic Embedding** - New tests indexed automatically
✅ **Local Storage** - No cloud database required
✅ **Real-Time Stats** - Dashboard with pass/fail rates
✅ **Failure Analysis** - Track and analyze test failures
✅ **Modular Design** - Easily integrate with existing platform

## 🔒 Security

- API key stored in config file (use environment variables in production)
- No sensitive test data sent to OpenAI (only summaries)
- Local storage for test run details
- CORS configured for your frontend

## 🚦 Performance

- Embeddings cached in memory (no re-computation)
- Fast cosine similarity search (~O(n) where n = # vectors)
- Lazy initialization (loads on first query)
- Index file for quick metadata lookup

## 🧪 Testing

### Save a Test Run
```bash
curl -X POST http://localhost:8080/api/test-history \
  -H "Content-Type: application/json" \
  -d '{
    "testType": "Functional",
    "prompt": "Test login functionality",
    "status": "Passed",
    "duration": 3000,
    "testClass": "LoginTest",
    "testMethod": "testValidLogin"
  }'
```

### Query RAG
```bash
curl -X POST http://localhost:8080/api/test-history/query \
  -H "Content-Type: application/json" \
  -d '{"question": "What tests passed today?"}'
```

## 🔧 Configuration

Edit `backend/config/openai.js`:

```javascript
const config = {
  embeddingModel: 'text-embedding-3-small',  // Fast, cost-effective
  chatModel: 'gpt-4',                        // Best quality
  maxTokens: 1000,                           // Response length
  temperature: 0.7                           // Creativity level
};
```

## 📊 Monitoring

Check RAG service status:
```bash
GET http://localhost:8080/api/test-history/rag/stats
```

Response:
```json
{
  "success": true,
  "stats": {
    "vectorCount": 150,
    "initialized": true
  }
}
```

## 🐛 Troubleshooting

### RAG not initialized
```bash
POST http://localhost:8080/api/test-history/initialize
```

### OpenAI API errors
- Check API key is valid
- Ensure sufficient credits
- Verify network connectivity

### Empty results
- Initialize RAG service first
- Check test runs exist in `data/test-runs/`
- Verify index.json is not empty

## 🚀 Future Enhancements

- [ ] FAISS integration for larger datasets
- [ ] Multi-language support
- [ ] Custom embedding fine-tuning
- [ ] Historical trend analysis
- [ ] Automated failure categorization
- [ ] Slack/Teams notifications
- [ ] Export insights as PDF

## 📝 License

Internal use only.

---

**Created**: January 24, 2026
**Author**: Automation Team
**Contact**: For questions about RAG implementation
