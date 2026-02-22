# Integration Guide - Prompt Validation System

## Quick Start: Integrate with Existing Backend

### Step 1: Install in Your Project

```bash
# From your main project directory
cd backend
npm install openai  # Optional, for embeddings
```

### Step 2: Update Your Server (backend/server.js)

```javascript
const express = require('express');
const { initializePromptValidation } = require('../prompt validation/backend');

// Your existing imports
const testExecutor = require('./services/testExecutor');
const testGenerator = require('./services/testGenerator');  // If you have one

const app = express();
let promptHandler;

// Initialize on server startup
app.listen(8080, async () => {
  try {
    // Initialize prompt validation system
    promptHandler = await initializePromptValidation({
      testGenerator: testGenerator || null,
      testExecutor: testExecutor,
      registryPath: './data/test-registry.json'  // Custom path
    });

    console.log('✓ Server running with prompt validation');
  } catch (error) {
    console.error('Failed to initialize prompt validation:', error);
    process.exit(1);
  }
});
```

### Step 3: Modify Test Endpoint (backend/routes/api.js)

**Before:**

```javascript
router.post('/test/run', async (req, res) => {
  try {
    const { prompt, testType, browser } = req.body;

    // OLD: Always generate new test
    const testFile = await generateTest(prompt);
    const result = await executeTest(testFile);

    res.json({ success: true, result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

**After:**

```javascript
router.post('/test/run', async (req, res) => {
  try {
    const { prompt, testType, browser } = req.body;

    // NEW: Use prompt validation (handles deduplication)
    const result = await global.promptHandler.processTestRequest({
      prompt,
      testType: testType || 'functional',
      browser: browser || 'chrome'
    });

    // Result includes:
    // - reused: true/false
    // - className: "LoginTest_123"
    // - filePath: "/path/to/test"
    // - testResult: execution results

    res.json({
      success: true,
      ...result
    });
  } catch (error) {
    console.error('Test request error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});
```

### Step 4: Make Handler Globally Available

```javascript
// In server.js after initialization
app.listen(8080, async () => {
  global.promptHandler = await initializePromptValidation({...});
  console.log('✓ Prompt handler ready');
});
```

### Step 5: (Optional) Add Statistics Endpoint

```javascript
// Get registry stats
router.get('/test/stats', async (req, res) => {
  try {
    const stats = global.promptHandler.getStats();
    res.json({
      success: true,
      stats: {
        totalTests: stats.totalEntries,
        registryPath: stats.registryPath
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});
```

## Integration Patterns

### Pattern 1: No Test Generator (Manual Tests)

```javascript
const handler = await initializePromptValidation({
  testGenerator: null,  // No generator
  testExecutor: myExecutor
});

// System will use placeholder class names
// You handle test creation manually
```

### Pattern 2: With Custom Test Generator

```javascript
const myGenerator = {
  generateTest: async (config) => {
    // Your generation logic
    const className = `Test_${Date.now()}`;
    const filePath = `/tests/${className}.java`;
    
    // Generate Java file here
    await fs.writeFile(filePath, javaCode);

    return { className, filePath };
  }
};

const handler = await initializePromptValidation({
  testGenerator: myGenerator,
  testExecutor: myExecutor
});
```

### Pattern 3: With OpenAI Embeddings

```javascript
const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const handler = await initializePromptValidation({
  openaiClient: openai,  // Enable better embeddings
  testGenerator: myGenerator,
  testExecutor: myExecutor
});
```

## Expected Behavior

### Scenario 1: First Request

```javascript
Input:  { prompt: "Test login with valid credentials" }
Output: {
  reused: false,
  newlyGenerated: true,
  className: "LoginTest_1737820800",
  filePath: "/tests/LoginTest_1737820800.java",
  status: "COMPLETED"
}
```

### Scenario 2: Exact Duplicate

```javascript
Input:  { prompt: "Test login with valid credentials" }  // Same
Output: {
  reused: true,
  className: "LoginTest_1737820800",  // Same file
  filePath: "/tests/LoginTest_1737820800.java",
  status: "COMPLETED"
}
```

### Scenario 3: Semantically Similar

```javascript
Input:  { prompt: "Verify login functionality works" }  // Similar
Output: {
  reused: true,  // Reused due to 90%+ similarity
  className: "LoginTest_1737820800",
  filePath: "/tests/LoginTest_1737820800.java",
  similarity: 0.94,
  status: "COMPLETED"
}
```

## Testing Your Integration

### Test Script

```javascript
// tests/testPromptValidation.js
const { initializePromptValidation } = require('../prompt validation/backend');

async function runTests() {
  const handler = await initializePromptValidation();

  console.log('\n=== Test 1: Generate New ===');
  const result1 = await handler.processTestRequest({
    prompt: "Test user registration form",
    testType: "functional"
  });
  console.log('Reused?', result1.reused);  // false

  console.log('\n=== Test 2: Exact Match ===');
  const result2 = await handler.processTestRequest({
    prompt: "Test user registration form",
    testType: "functional"
  });
  console.log('Reused?', result2.reused);  // true

  console.log('\n=== Test 3: Similar Match ===');
  const result3 = await handler.processTestRequest({
    prompt: "Verify user signup page functionality",
    testType: "functional"
  });
  console.log('Reused?', result3.reused);  // likely true

  console.log('\n=== Registry Stats ===');
  console.log(handler.getStats());
}

runTests().catch(console.error);
```

Run:
```bash
node tests/testPromptValidation.js
```

## Troubleshooting

### Issue: "Handler not initialized"

**Solution**: Ensure `initialize()` is called:

```javascript
const handler = new TestRequestHandler();
await handler.initialize();  // Don't forget!
```

### Issue: Tests not being reused

**Solution**: Check similarity threshold:

```javascript
// Lower threshold temporarily for testing
handler.SIMILARITY_THRESHOLD = 0.80;
```

### Issue: Registry file not found

**Solution**: Check path and permissions:

```javascript
const stats = handler.getStats();
console.log('Registry path:', stats.registryPath);
// Ensure directory exists and is writable
```

### Issue: OpenAI errors

**Solution**: System auto-falls back to deterministic embeddings. To verify:

```javascript
// Check logs for:
// "OpenAI embedding failed, using fallback: ..."
```

## Performance Tips

1. **Initialize Once**: Create handler at server startup, not per request
2. **Registry Size**: Monitor with `getStats()`, consider archiving old entries
3. **Async Operations**: All methods are async, use `await` properly
4. **Error Handling**: Always wrap in try-catch

## Security Considerations

1. **File Paths**: Validate all file paths before execution
2. **Registry Access**: Ensure registry file has proper permissions
3. **API Keys**: Store OpenAI key in environment variables
4. **Input Validation**: Sanitize prompts before processing

## Next Steps

1. ✅ Install and integrate
2. ✅ Test with sample requests
3. ✅ Monitor registry growth
4. ✅ Adjust similarity threshold if needed
5. ✅ Add logging and metrics
6. ✅ Deploy to production

## Complete Example

See the full working example in `examples/fullIntegration.js` for a complete Express.js server with all features integrated.
