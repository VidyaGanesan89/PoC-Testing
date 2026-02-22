/**
 * Full Integration Example
 * Complete Express.js server with prompt validation
 */

const express = require('express');
const { initializePromptValidation } = require('../index');

const app = express();
app.use(express.json());

let promptHandler;

// Mock test generator (replace with your real generator)
const mockTestGenerator = {
  generateTest: async (config) => {
    console.log('Generating test for:', config.prompt);
    
    const timestamp = Date.now();
    const className = `GeneratedTest_${timestamp}`;
    const filePath = `/mock/tests/${className}.java`;
    
    // In real implementation, generate actual Java file here
    
    return { className, filePath };
  }
};

// Mock test executor (replace with your real executor)
const mockTestExecutor = {
  executeTest: async (config) => {
    console.log('Executing test:', config.className);
    
    // Simulate test execution
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return {
      status: 'PASSED',
      duration: 1000,
      tests: { total: 1, passed: 1, failed: 0 }
    };
  }
};

// Initialize prompt validation on startup
async function startServer() {
  try {
    // Initialize prompt validation system
    promptHandler = await initializePromptValidation({
      testGenerator: mockTestGenerator,
      testExecutor: mockTestExecutor,
      registryPath: './data/test-registry.json'
    });

    console.log('✓ Prompt validation initialized');

    // Start server
    app.listen(8080, () => {
      console.log('✓ Server running on http://localhost:8080');
      console.log('\nTry these requests:');
      console.log('  POST http://localhost:8080/api/test/run');
      console.log('  GET  http://localhost:8080/api/test/stats');
    });

  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Routes

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', promptValidation: promptHandler ? 'enabled' : 'disabled' });
});

// Run test with duplicate detection
app.post('/api/test/run', async (req, res) => {
  try {
    const { prompt, testType = 'functional', browser = 'chrome' } = req.body;

    if (!prompt) {
      return res.status(400).json({
        success: false,
        error: 'Prompt is required'
      });
    }

    console.log('\n=== New Test Request ===');
    console.log('Prompt:', prompt);

    // Process with duplicate detection
    const result = await promptHandler.processTestRequest({
      prompt,
      testType,
      browser
    });

    console.log('Result:', result.reused ? 'REUSED' : 'NEW');

    res.json({
      success: true,
      ...result
    });

  } catch (error) {
    console.error('Error processing request:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get registry statistics
app.get('/api/test/stats', async (req, res) => {
  try {
    const stats = promptHandler.getStats();
    
    res.json({
      success: true,
      stats: {
        totalTests: stats.totalEntries,
        registryPath: stats.registryPath,
        loaded: stats.loaded
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Example requests for testing
app.get('/examples', (req, res) => {
  res.json({
    examples: [
      {
        description: 'Generate new test',
        method: 'POST',
        url: '/api/test/run',
        body: {
          prompt: 'Test login functionality',
          testType: 'functional',
          browser: 'chrome'
        }
      },
      {
        description: 'Reuse test (exact match)',
        method: 'POST',
        url: '/api/test/run',
        body: {
          prompt: 'Test login functionality',
          testType: 'functional',
          browser: 'chrome'
        }
      },
      {
        description: 'Reuse test (similar)',
        method: 'POST',
        url: '/api/test/run',
        body: {
          prompt: 'Verify login feature works correctly',
          testType: 'functional',
          browser: 'chrome'
        }
      }
    ]
  });
});

// Start the server
startServer();
