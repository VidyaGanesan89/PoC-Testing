const HashUtil = require('../utils/hashUtil');
const EmbeddingUtil = require('../utils/embeddingUtil');
const TestRegistryManager = require('./testRegistryManager');

/**
 * Test Request Handler
 * Orchestrates duplicate detection and test generation/reuse logic
 */
class TestRequestHandler {
  /**
   * @param {object} options - Configuration
   * @param {object} options.openaiClient - Optional OpenAI client
   * @param {object} options.testGenerator - Test generator service
   * @param {object} options.testExecutor - Test executor service
   * @param {string} options.registryPath - Custom registry path
   */
  constructor(options = {}) {
    this.embeddingUtil = new EmbeddingUtil(options.openaiClient);
    this.registryManager = new TestRegistryManager(options.registryPath);
    this.testGenerator = options.testGenerator;
    this.testExecutor = options.testExecutor;
    
    this.SIMILARITY_THRESHOLD = 0.85; // 85% similarity to reuse (prevents cross-site false matches)
    this.initialized = false;
    
    // Java test file paths
    this.pageObjectsPath = 'C:\\Users\\GWJ6DMZ\\Desktop\\FINAL_AI\\FINAL FUNCTIONAL TEST Using UPS MCP\\src\\test\\java\\pageobjects';
    this.testsPath = 'C:\\Users\\GWJ6DMZ\\Desktop\\FINAL_AI\\FINAL FUNCTIONAL TEST Using UPS MCP\\src\\test\\java\\parcelprotests';
  }

  /**
   * Initialize the handler
   */
  async initialize() {
    try {
      await this.registryManager.initialize();
      this.initialized = true;
      console.log('TestRequestHandler initialized');
    } catch (error) {
      console.error('Error initializing TestRequestHandler:', error);
      throw error;
    }
  }

  /**
   * Process a test request with duplicate detection
   * @param {object} request - Test request
   * @param {string} request.prompt - User prompt
   * @param {string} request.testType - Test type (functional, performance)
   * @param {string} request.browser - Browser name
   * @param {boolean} request.forceNew - Force creation of new test, skip matching
   * @returns {Promise<object>} - Result with test execution status and metadata
   */
  async processTestRequest(request) {
    if (!this.initialized) {
      throw new Error('Handler not initialized. Call initialize() first.');
    }

    const { prompt, originalPrompt = prompt, testType = 'functional', browser = 'chrome', forceNew = false } = request;

    if (!prompt) {
      throw new Error('Prompt is required');
    }

    try {
      console.log('\n=== Processing Test Request ===');
      console.log('Prompt:', prompt);
      console.log('Original prompt:', originalPrompt);
      console.log('Force new test:', forceNew);

      // Step 1: Generate hash
      const hash = HashUtil.generateHash(originalPrompt);
      console.log('Hash:', hash);

      // If forceNew is true, skip matching and generate new test
      if (forceNew) {
        console.log('⚠ Force new test requested - Skipping match detection');
        const embedding = await this.embeddingUtil.generateEmbedding(originalPrompt);
        return await this.generateNewTest(prompt, hash, embedding, request, true, originalPrompt);
      }

      // Step 2: Check for exact match
      const exactMatch = this.registryManager.findByHash(hash);
      
      if (exactMatch) {
        console.log('✓ Exact match found - Reusing existing test');
        return await this.reuseExistingTest(exactMatch, request);
      }

      // Step 3: Generate embedding
      console.log('No exact match - Generating embedding...');
      const embedding = await this.embeddingUtil.generateEmbedding(originalPrompt);
      console.log('Embedding dimension:', embedding.length);

      // Step 4: Check for semantic similarity
      const similarMatch = this.registryManager.findMostSimilar(
        embedding,
        this.SIMILARITY_THRESHOLD
      );

      if (similarMatch) {
        console.log(`✓ Similar test found (${(similarMatch.similarity * 100).toFixed(2)}%) - Reusing`);
        return await this.reuseExistingTest(similarMatch.entry, request);
      }

      // Step 5: Generate new test
      console.log('✗ No similar test found - Generating new test');
      return await this.generateNewTest(prompt, hash, embedding, request, false, originalPrompt);

    } catch (error) {
      console.error('Error processing test request:', error);
      throw new Error(`Test request processing failed: ${error.message}`);
    }
  }

  /**
   * Reuse existing test file
   * @param {object} entry - Registry entry
   * @param {object} request - Original request
   * @returns {Promise<object>} - Execution result
   */
  async reuseExistingTest(entry, request) {
    try {
      console.log(`Reusing test: ${entry.className}`);
      console.log(`Page Object: ${entry.pageObjectPath}`);
      console.log(`Test File: ${entry.testFilePath}`);
      console.log(`Created: ${entry.createdAt}`);

      // Read file contents for reused tests
      const fs = require('fs').promises;
      let testContent = '';
      let pageObjectContent = '';
      
      try {
        testContent = await fs.readFile(entry.testFilePath, 'utf8');
        console.log(`✓ Read test file content (${testContent.length} bytes)`);
      } catch (error) {
        console.warn(`Could not read test file: ${error.message}`);
      }
      
      try {
        pageObjectContent = await fs.readFile(entry.pageObjectPath, 'utf8');
        console.log(`✓ Read page object content (${pageObjectContent.length} bytes)`);
      } catch (error) {
        console.warn(`Could not read page object file: ${error.message}`);
      }

      // Execute existing test
      const executionResult = {
        reused: true,
        className: entry.className,
        testClassName: entry.className,
        pageObjectPath: entry.pageObjectPath,
        testFilePath: entry.testFilePath,
        testContent,
        pageObjectContent,
        testFileName: entry.testFilePath.split('\\').pop(),
        pageObjectFileName: entry.pageObjectPath.split('\\').pop(),
        hash: entry.hash,
        createdAt: entry.createdAt,
        testType: request.testType,
        browser: request.browser
      };

      // If test executor is available, run the test
      if (this.testExecutor) {
        console.log('Executing test...');
        const testResult = await this.testExecutor.executeTest({
          className: entry.className,
          filePath: entry.filePath,
          browser: request.browser
        });

        executionResult.testResult = testResult;
        executionResult.status = testResult.status || 'COMPLETED';
      } else {
        executionResult.status = 'REUSED';
        executionResult.message = 'Test file reused, execution skipped (no executor configured)';
      }

      return executionResult;

    } catch (error) {
      console.error('Error reusing test:', error);
      throw new Error(`Test reuse failed: ${error.message}`);
    }
  }

  /**
   * Generate and register new test
   * @param {string} prompt - User prompt
   * @param {string} hash - Prompt hash
   * @param {number[]} embedding - Prompt embedding
   * @param {object} request - Original request
   * @param {boolean} forceNew - Force creation even if hash exists
   * @returns {Promise<object>} - Generation and execution result
   */
  async generateNewTest(prompt, hash, embedding, request, forceNew = false, originalPrompt = prompt) {
    try {
      console.log('Generating new test file...');

      // Generate test class (delegated to existing test generator)
      let className, pageObjectPath, testFilePath, testContent, pageObjectContent, testFileName, pageObjectFileName;

      console.log('[DEBUG] testGenerator exists:', !!this.testGenerator);
      console.log('[DEBUG] testGenerator type:', typeof this.testGenerator);

      if (this.testGenerator) {
        console.log('[DEBUG] Calling testGenerator.generateTest()...');
        const generated = await this.testGenerator.generateTest({
          prompt,
          originalPrompt,  // Pass original (unstructured) prompt for class name extraction
          testType: request.testType,
          browser: request.browser,
          forceNew          // Pass forceNew so overwrite protection is bypassed when user explicitly requests new generation
        });
        console.log('[DEBUG] Generated result:', {
          hasClassName: !!generated.className,
          hasTestContent: !!generated.testContent,
          hasPageObjectContent: !!generated.pageObjectContent,
          testContentLength: generated.testContent?.length || 0
        });

        className = generated.className;
        pageObjectPath = generated.pageObjectPath;
        testFilePath = generated.testFilePath;
        testContent = generated.testContent;
        pageObjectContent = generated.pageObjectContent;
        testFileName = generated.testFileName;
        pageObjectFileName = generated.pageObjectFileName;
      } else {
        // Fallback: generate file names based on actual project structure
        const timestamp = Date.now();
        className = `GeneratedTest_${timestamp}`;
        const pageObjectName = `${className}Page`;
        pageObjectPath = `${this.pageObjectsPath}\\${pageObjectName}.java`;
        testFilePath = `${this.testsPath}\\${className}.java`;
        testFileName = `${className}.java`;
        pageObjectFileName = `${pageObjectName}.java`;
        testContent = '';
        pageObjectContent = '';
        console.warn('No test generator configured - using placeholder paths');
      }

      console.log('Generated class:', className);
      console.log('Page Object path:', pageObjectPath);
      console.log('Test File path:', testFilePath);

      // Register in registry
      let entry;
      if (forceNew) {
        // Check if entry with this hash already exists
        const existingEntry = this.registryManager.findByHash(hash);
        if (existingEntry) {
          console.log('⚠ Force new: Updating existing registry entry');
          // Update the existing entry with new file paths
          entry = await this.registryManager.updateEntry(hash, {
            className,
            pageObjectPath,
            testFilePath,
            updatedAt: new Date().toISOString()
          });
        } else {
          // No existing entry, add new one
          entry = await this.registryManager.addEntry({
            hash,
            embedding,
            className,
            pageObjectPath,
            testFilePath,
            prompt: originalPrompt
          });
        }
      } else {
        // Normal flow: add new entry
        entry = await this.registryManager.addEntry({
          hash,
          embedding,
          className,
          pageObjectPath,
          testFilePath,
          prompt: originalPrompt // Store full original prompt for matching/reference
        });
      }

      console.log('✓ Test registered in registry');

      const result = {
        reused: false,
        newlyGenerated: true,
        className,
        testClassName: className,
        pageObjectPath,
        testFilePath,
        testContent,
        pageObjectContent,
        testFileName,
        pageObjectFileName,
        hash,
        createdAt: entry.createdAt,
        testType: request.testType,
        browser: request.browser
      };

      // Execute if executor available
      if (this.testExecutor) {
        console.log('Executing new test...');
        const testResult = await this.testExecutor.executeTest({
          className,
          filePath,
          browser: request.browser
        });

        result.testResult = testResult;
        result.status = testResult.status || 'COMPLETED';
      } else {
        result.status = 'GENERATED';
        result.message = 'Test generated, execution skipped (no executor configured)';
      }

      return result;

    } catch (error) {
      console.error('Error generating new test:', error);
      throw new Error(`Test generation failed: ${error.message}`);
    }
  }

  /**
   * Get registry statistics
   * @returns {object} - Registry stats
   */
  getStats() {
    return this.registryManager.getStats();
  }
}

module.exports = TestRequestHandler;
