# Selenium Prompt Validation System

## Overview

Enterprise-grade duplicate detection system for Selenium test generation. Prevents generating duplicate Java test files when the same or semantically similar test requests are received.

## Features

✅ **Hash-based Exact Match Detection**
- SHA-256 hashing of normalized prompts
- Instant duplicate detection (O(1) lookup)

✅ **Semantic Similarity Matching**
- Vector embeddings (OpenAI with deterministic fallback)
- Cosine similarity calculation
- 50% threshold for intelligent reuse

✅ **Persistent Registry**
- Atomic file operations
- JSON-based storage
- Automatic initialization

✅ **Production-Ready**
- Comprehensive error handling
- Clean architecture
- Zero external dependencies (except optional OpenAI)

## Architecture

```
prompt validation/
├── backend/
│   ├── utils/
│   │   ├── hashUtil.js          # SHA-256 hashing
│   │   ├── embeddingUtil.js     # Vector embeddings
│   │   └── similarityUtil.js    # Cosine similarity
│   ├── services/
│   │   ├── testRegistryManager.js    # Registry management
│   │   └── testRequestHandler.js     # Request orchestration
│   ├── data/
│   │   └── test-registry.json        # Persistent storage (auto-created)
│   ├── index.js                      # Main export
│   └── package.json
└── README.md
```

## Usage

### Basic Integration

```javascript
const { initializePromptValidation } = require('./prompt validation/backend');

// Initialize system
const handler = await initializePromptValidation({
  openaiClient: null,        // Optional: OpenAI client
  testGenerator: myGenerator, // Your test generator
  testExecutor: myExecutor    // Your test executor
});

// Process test request
const result = await handler.processTestRequest({
  prompt: "Test login with valid credentials",
  testType: "functional",
  browser: "chrome"
});

console.log(result);
// {
//   reused: true/false,
//   className: "LoginTest_12345",
//   filePath: "/path/to/LoginTest_12345.java",
//   hash: "abc123...",
//   status: "COMPLETED"
// }
```

### Express.js Integration

```javascript
const express = require('express');
const { initializePromptValidation } = require('./prompt validation/backend');

const app = express();
let promptHandler;

// Initialize on startup
app.listen(8080, async () => {
  promptHandler = await initializePromptValidation({
    testGenerator: yourTestGenerator,
    testExecutor: yourTestExecutor
  });
  console.log('Server ready with prompt validation');
});

// Handle test requests
app.post('/api/test/run', async (req, res) => {
  try {
    const result = await promptHandler.processTestRequest({
      prompt: req.body.prompt,
      testType: req.body.testType,
      browser: req.body.browser
    });

    res.json({
      success: true,
      ...result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});
```

## How It Works

### 1. Exact Match Detection (Hash-based)

```
User Prompt → Normalize → SHA-256 Hash → Registry Lookup
                                              ↓
                                       Exact Match?
                                       ↓         ↓
                                     YES       NO
                                       ↓         ↓
                                    Reuse    Continue
```

**Normalization Steps:**
- Convert to lowercase
- Trim whitespace
- Remove punctuation
- Normalize multiple spaces

### 2. Semantic Similarity (Embedding-based)

```
No Exact Match → Generate Embedding → Compare with All Stored Embeddings
                                              ↓
                                    Cosine Similarity ≥ 50%?
                                       ↓         ↓
                                     YES       NO
                                       ↓         ↓
                                    Reuse    Generate New
```

**Embedding Strategy:**
- **Primary**: OpenAI text-embedding-3-small (if API key provided)
- **Fallback**: Deterministic word-based hashing (no API required)

### 3. Registry Entry Structure

```json
{
  "hash": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
  "embedding": [0.123, -0.456, 0.789, ...],
  "className": "LoginTest_1737820800000",
  "pageObjectPath": "C:\\...\\src\\test\\java\\pageobjects\\LoginTest_1737820800000Page.java",
  "testFilePath": "C:\\...\\src\\test\\java\\parcelprotests\\LoginTest_1737820800000.java",
  "prompt": "Test login with valid credentials",
  "createdAt": "2026-01-25T10:00:00.000Z"
}
```

## API Reference

### HashUtil

```javascript
const { HashUtil } = require('./prompt validation/backend');

// Normalize prompt
const normalized = HashUtil.normalizePrompt("Test Login!!");
// → "test login"

// Generate hash
const hash = HashUtil.generateHash("Test Login");
// → "e3b0c44..."

// Verify hash
const isValid = HashUtil.verifyHash("Test Login", hash);
// → true
```

### EmbeddingUtil

```javascript
const { EmbeddingUtil } = require('./prompt validation/backend');

const embedder = new EmbeddingUtil(openaiClient);

// Generate embedding (OpenAI or fallback)
const embedding = await embedder.generateEmbedding("Test login");
// → [0.123, -0.456, ...]

// Force fallback
const fallbackEmbedding = embedder.generateFallbackEmbedding("Test login");
```

### SimilarityUtil

```javascript
const { SimilarityUtil } = require('./prompt validation/backend');

// Calculate similarity
const similarity = SimilarityUtil.cosineSimilarity(vectorA, vectorB);
// → 0.95 (95% similar)

// Find most similar
const result = SimilarityUtil.findMostSimilar(queryVector, allEntries);
// → { entry: {...}, similarity: 0.95 }
```

### TestRegistryManager

```javascript
const { TestRegistryManager } = require('./prompt validation/backend');

const registry = new TestRegistryManager();
await registry.initialize();

// Find by hash
const entry = registry.findByHash(hash);

// Find by similarity
const similar = registry.findMostSimilar(embedding, 0.9);

// Add entry
await registry.addEntry({
  hash,
  embedding,
  className: "MyTest",
  filePath: "/path/to/MyTest.java"
});

// Get stats
const stats = registry.getStats();
// → { totalEntries: 42, registryPath: "...", loaded: true }
```

## Configuration

### Similarity Threshold

Default: **0.50 (50%)**

```javascript
const handler = new TestRequestHandler({...});
handler.SIMILARITY_THRESHOLD = 0.60; // Increase to 60%
```

### Custom Registry Path

```javascript
const handler = await initializePromptValidation({
  registryPath: '/custom/path/registry.json'
});
```

### OpenAI Integration

```javascript
const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const handler = await initializePromptValidation({
  openaiClient: openai
});
```

## Error Handling

All methods use try-catch blocks and provide detailed error messages:

```javascript
try {
  const result = await handler.processTestRequest({...});
} catch (error) {
  console.error('Error:', error.message);
  // Error: Test request processing failed: Prompt is required
}
```

## Performance

- **Hash lookup**: O(1) - instant
- **Similarity search**: O(n) where n = registry size
- **Embedding generation**: ~500ms (OpenAI) or ~10ms (fallback)

**Optimization**: For large registries (>10,000 entries), consider indexing strategies like:
- Hash-based partitioning
- Approximate nearest neighbor search (HNSW, Annoy)

## Testing

### Manual Test

```javascript
const { TestRequestHandler } = require('./prompt validation/backend');

async function test() {
  const handler = new TestRequestHandler();
  await handler.initialize();

  // First request - generates new test
  const result1 = await handler.processTestRequest({
    prompt: "Test login functionality",
    testType: "functional",
    browser: "chrome"
  });
  console.log('First:', result1.reused); // false

  // Second request - exact match
  const result2 = await handler.processTestRequest({
    prompt: "Test login functionality",
    testType: "functional",
    browser: "chrome"
  });
  console.log('Second:', result2.reused); // true

  // Third request - similar (90%+)
  const result3 = await handler.processTestRequest({
    prompt: "Verify login feature works correctly",
    testType: "functional",
    browser: "chrome"
  });
  console.log('Third:', result3.reused); // true (if similarity ≥ 0.9)
}

test();
```

## Production Deployment

### 1. Install Dependencies

```bash
cd "prompt validation/backend"
npm install
```

### 2. Set Environment Variables

```bash
export OPENAI_API_KEY=sk-...  # Optional
```

### 3. Integrate with Existing Backend

```javascript
// In your existing backend/server.js
const { initializePromptValidation } = require('../prompt validation/backend');

let promptHandler;

app.listen(PORT, async () => {
  // Initialize prompt validation
  promptHandler = await initializePromptValidation({
    testGenerator: yourExistingGenerator,
    testExecutor: yourExistingExecutor
  });
  
  console.log('✓ Prompt validation active');
});

// Modify your test endpoint
app.post('/api/test/run', async (req, res) => {
  const result = await promptHandler.processTestRequest(req.body);
  res.json(result);
});
```

## Limitations & Considerations

1. **Registry Growth**: Linear search O(n) - consider indexing for >10k entries
2. **Embedding Quality**: Fallback embeddings are deterministic but less accurate than OpenAI
3. **Threshold Tuning**: 50% threshold provides broader matching - adjust based on your domain
4. **File System**: Registry stored in JSON - consider database for distributed systems
5. **Dual File Generation**: System tracks both Page Object and Test files for Selenium tests

## Troubleshooting

### Registry Not Loading

```javascript
// Check registry path
const stats = handler.getStats();
console.log(stats.registryPath);

// Manually initialize
await handler.registryManager.initialize();
```

### Low Similarity Scores

```javascript
// Adjust threshold as needed
handler.SIMILARITY_THRESHOLD = 0.40; // 40% for more aggressive matching
handler.SIMILARITY_THRESHOLD = 0.70; // 70% for stricter matching
```

### OpenAI Errors

System automatically falls back to deterministic embeddings. Check logs:

```
OpenAI embedding failed, using fallback: Connection timeout
```

## License

ISC

## Support

For issues or questions, check the implementation files for detailed inline documentation.
