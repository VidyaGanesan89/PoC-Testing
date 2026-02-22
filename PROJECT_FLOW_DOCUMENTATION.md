# Final_AI Project Flow Documentation

## 1) Project Purpose
This repository is an AI-assisted Selenium functional testing platform for ParcelPro.

It combines:
- A React dashboard for test generation/execution and history analysis
- A Node.js backend API with WebSocket progress streaming
- A Java + Maven + TestNG Selenium test framework
- A dedicated RAG/history service for long-term run storage and natural-language querying
- A prompt-validation subsystem to detect and reuse matching test scripts

---

## 2) High-Level Architecture

```text
[Frontend React :3000]
        |
        | HTTP + WebSocket
        v
[Backend API + Socket.IO :8080]
        |
        | spawn mvn clean test -Dtest=...
        v
[Java Selenium + TestNG + Maven]
        |
        | surefire XML + console markers
        v
[target/surefire-reports]
        |
        | parse and POST
        v
[RAG History Service :8081]
        |
        | JSON index + run files
        v
[RAG_ViewHistory/data/test-runs]
```

---

## 3) Top-Level Structure and Responsibilities

- [backend](backend)
  - Main API, test execution orchestration, WebSocket progress, AI generation, RAG proxy calls
- [frontend](frontend)
  - Dashboard UI, test submission, metrics, artifacts, progress display, history insights/chat
- [src/test](src/test)
  - Java Selenium framework and test classes (Page Object Model + TestNG)
- [RAG_ViewHistory](RAG_ViewHistory)
  - Separate Express service for test-run persistence/statistics/query
- [prompt validation](prompt%20validation)
  - Duplicate/similarity detection registry and request handling
- [functional test report](functional%20test%20report)
  - Generated HTML reports
- [functional test screenshots](functional%20test%20screenshots)
  - Captured screenshots from test runs

---

## 4) Runtime Services, Ports, and Startup

### Services
- Frontend: http://localhost:3000
- Backend API + WebSocket: http://localhost:8080
- RAG history service: http://localhost:8081

### Startup script
- [start-all-servers.bat](start-all-servers.bat)
  - Starts backend via `npm run dev`
  - Starts RAG server via `node server.js`
  - Starts frontend via `npm start`

### Shutdown script
- [stop-all-servers.bat](stop-all-servers.bat)
  - Kills all Node processes

---

## 5) Main End-to-End Flow (Generate New AI Test)

### Step A: User submits prompt
1. UI form in [frontend/src/App.js](frontend/src/App.js) calls `handleRunTest`.
2. Frontend first checks match candidates via:
   - POST `/api/testcases/matches` (backend)

### Step B: Match detection
1. Backend route [backend/routes/api.js](backend/routes/api.js) receives prompt.
2. It initializes `TestRequestHandler` from prompt-validation module.
3. It computes:
   - Prompt hash (exact-match key)
   - Embedding (OpenAI if available, deterministic fallback otherwise)
4. It returns:
   - `exactMatches[]`
   - `similarMatches[]` (cosine similarity + keyword-context checks)

### Step C: User decision in UI
- If matches exist:
  - UI shows selection panel (`TestCaseMatches`) and user chooses:
    - Reuse existing test, or
    - Create new anyway (`forceNew: true`)
- If no matches:
  - UI directly requests generation

### Step D: AI generation request
1. Frontend POSTs `/api/generate-ai-test`.
2. Backend in [backend/routes/api.js](backend/routes/api.js):
   - Structures prompt with `PromptBuilder` (if not already structured)
   - Selects generator:
     - `AITestGenerator` (Azure/OpenAI client configured), else
     - `ClaudeAgentGenerator` (pattern-driven local generation)
   - Calls `TestRequestHandler.processTestRequest(...)`

### Step E: TestRequestHandler behavior
In [prompt validation/backend/services/testRequestHandler.js](prompt%20validation/backend/services/testRequestHandler.js):
- If `forceNew = true`: skip reuse checks and generate/register new test
- Else:
  - Exact hash match -> reuse
  - Similarity match >= threshold -> reuse
  - Otherwise generate/register new test
- Registry persistence handled by [prompt validation/backend/services/testRegistryManager.js](prompt%20validation/backend/services/testRegistryManager.js)

### Step F: Background Maven execution
1. Backend immediately starts test run asynchronously via `testExecutor.runTest(...)`.
2. [backend/services/testExecutor.js](backend/services/testExecutor.js) spawns:
   - `mvn clean test -Dtest=<class or class#method>`
3. Progress is streamed by Socket.IO event `test-progress`.

### Step G: Frontend progress + completion
1. [frontend/src/services/websocket.js](frontend/src/services/websocket.js) subscribes to test updates.
2. UI updates progress panel until status becomes `passed` or `failed`.
3. UI refreshes metrics and history after completion.

### Step H: Post-run persistence and RAG ingest
On process close in `testExecutor`:
1. Save execution to backend history JSON:
   - [backend/data/test-history.json](backend/data/test-history.json)
2. Call RAG integration service:
   - [backend/services/ragIntegrationService.js](backend/services/ragIntegrationService.js)
3. RAG integration parses surefire XML for:
   - pass/fail counts
   - step markers (`[STEP n]`)
   - screenshot markers (`[SCREENSHOT] Saved:`)
4. POST run payload to RAG server `/api/test-history`

---

## 6) Reuse Existing Test Flow

1. UI displays match list and user clicks “Run Existing”.
2. Frontend POSTs `/api/run` with `testClass`.
3. Backend invokes `testExecutor.runTest(testClass, ...)`.
4. No new Java file generation occurs.
5. WebSocket + history + RAG reporting still occur after execution.

---

## 7) RAG/History Query Flow

### Backend as proxy (frontend-facing)
- GET `/api/test-history/stats`
- GET `/api/test-history`
- POST `/api/rag/query`

### RAG server internals
- Entry: [RAG_ViewHistory/backend/server.js](RAG_ViewHistory/backend/server.js)
- Routes: [RAG_ViewHistory/backend/routes/testHistoryRoutes.js](RAG_ViewHistory/backend/routes/testHistoryRoutes.js)
- Storage service: [RAG_ViewHistory/backend/services/testHistoryService.js](RAG_ViewHistory/backend/services/testHistoryService.js)
- Query service: [RAG_ViewHistory/backend/services/simpleQueryService.js](RAG_ViewHistory/backend/services/simpleQueryService.js)

### Data persistence format
- One JSON file per run: [RAG_ViewHistory/data/test-runs](RAG_ViewHistory/data/test-runs)
- Summary index: [RAG_ViewHistory/data/test-runs/index.json](RAG_ViewHistory/data/test-runs/index.json)

---

## 8) Frontend Screen-to-API Mapping

### Main dashboard orchestration
- [frontend/src/App.js](frontend/src/App.js)
  - `handleRunTest` -> match detection first
  - `createNewTest` -> AI generation + websocket tracking
  - `handleRunExistingTest` -> direct run
  - `loadMetrics` -> GET `/api/metrics`
  - `loadHistory` -> GET `/api/history`

### API client
- [frontend/src/services/api.js](frontend/src/services/api.js)

### AI test-history assistant UI
- [frontend/src/components/TestHistoryChat.jsx](frontend/src/components/TestHistoryChat.jsx)
  - Sends natural-language question to backend `/api/rag/query`

### History insights UI
- [frontend/src/components/HistoryInsights.jsx](frontend/src/components/HistoryInsights.jsx)
  - Loads stats and run list from proxied test-history endpoints

---

## 9) Java Test Framework Flow

### Build and execution
- Maven project: [pom.xml](pom.xml)
- Surefire uses TestNG suite file under `src/test/resources/testng.xml`

### Core sample test flow
- Test class: [src/test/java/parcelprotests/ParcelProLanguageSelectTest.java](src/test/java/parcelprotests/ParcelProLanguageSelectTest.java)
- Page object: [src/test/java/pageobjects/ParcelProLanguageSelectorPage.java](src/test/java/pageobjects/ParcelProLanguageSelectorPage.java)

### Artifacts generated each run
- XML reports in [target/surefire-reports](target/surefire-reports)
- Optional HTML report generation script:
  - [generate-report.bat](generate-report.bat)
  - PowerShell renderer: [scripts/Generate-CustomReport.ps1](scripts/Generate-CustomReport.ps1)

---

## 10) Data Stores and Their Meaning

### Backend local history (execution-centric)
- [backend/data/test-history.json](backend/data/test-history.json)
- Updated by `testExecutor.saveTestHistory`
- Used by `/api/metrics` and `/api/history`

### Prompt registry (generation/reuse-centric)
- [prompt validation/backend/data/test-registry.json](prompt%20validation/backend/data/test-registry.json)
- Stores hash, embedding, class/file paths, timestamps
- Drives duplicate and similarity matching

### RAG test history (analysis-centric)
- [RAG_ViewHistory/data/test-runs](RAG_ViewHistory/data/test-runs)
- Used for filtered stats and natural language Q&A

---

## 11) API Surface Summary

### Backend API (port 8080)
- GET `/api/health`
- GET `/api/generator-status`
- GET `/api/metrics`
- GET `/api/history`
- POST `/api/testcases/matches`
- POST `/api/generate-ai-test`
- POST `/api/run`
- GET `/api/test-status/:id`
- GET `/api/llms`
- GET `/api/rag/stats`
- POST `/api/rag/query`
- GET `/api/test-history/stats` (proxy)
- GET `/api/test-history` (proxy)

### RAG service API (port 8081)
- GET `/health`
- GET `/api/test-history`
- GET `/api/test-history/stats`
- GET `/api/test-history/:runId`
- POST `/api/test-history`
- POST `/api/test-history/query`

---

## 12) Important Configuration and Dependency Notes

- LLM configuration bridge:
  - [backend/config/claude.js](backend/config/claude.js)
  - Reuses OpenAI config from RAG side
- Embedding fallback behavior:
  - [prompt validation/backend/utils/embeddingUtil.js](prompt%20validation/backend/utils/embeddingUtil.js)
  - Works even without live OpenAI embeddings by deterministic vector fallback
- Backend CORS allows local frontends 3000/3001
- Socket.IO server is hosted with backend process

---

## 13) Operational Playbook

### Start all services
1. Run [start-all-servers.bat](start-all-servers.bat)
2. Open http://localhost:3000

### Execute tests
- From UI: submit prompt or run existing test
- From CLI: run [run-tests.bat](run-tests.bat) or Maven command directly

### Generate/open reports
- Generate: [generate-report.bat](generate-report.bat)
- Open latest report: [open-report.bat](open-report.bat)

### Stop services
- Run [stop-all-servers.bat](stop-all-servers.bat)

---

## 14) Quick Mental Model

Think in four loops:
1. Generate or reuse test script from prompt.
2. Execute Maven/TestNG and stream live progress.
3. Persist run data locally and in RAG store.
4. Analyze history through dashboard metrics and NLQ assistant.

That is the core flow of this project.