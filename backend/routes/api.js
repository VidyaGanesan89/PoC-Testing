const express = require('express');
const router = express.Router();
const testExecutor = require('../services/testExecutor');
const metricsService = require('../services/metricsService');
const jmeterService = require('../services/jmeterService');
const JavaTestGenerator = require('../services/javaTestGenerator');
const AITestGenerator = require('../services/aiTestGenerator');
const ClaudeAgentGenerator = require('../services/claudeAgentGenerator');
const PromptBuilder = require('../services/promptBuilder');
const claudeConfig = require('../config/claude');
const openaiConfig = require('../../RAG_ViewHistory/backend/config/openai');
const ragIntegrationService = require('../services/ragIntegrationService');
const azureWorkItemAutomationService = require('../services/azureDevOps/azureWorkItemAutomationService');
const path = require('path');
const fs = require('fs');

// Import prompt validation utilities
const promptValidationPath = path.join(__dirname, '../../prompt validation/backend');
const { TestRequestHandler } = require(promptValidationPath);

// Initialize prompt builder
const promptBuilder = new PromptBuilder();

const MATCH_STOP_WORDS = new Set([
  'the', 'and', 'for', 'with', 'that', 'this', 'from', 'into', 'your', 'you', 'are', 'must', 'should', 'will',
  'use', 'using', 'create', 'complete', 'test', 'tests', 'testing', 'automation', 'selenium', 'java', 'code',
  'generator', 'assistant', 'framework', 'script', 'scripts', 'based', 'ensure', 'accurate', 'maintain'
]);

function extractSignalTokens(text = '') {
  return new Set(
    text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter(token => token.length >= 3 && !MATCH_STOP_WORDS.has(token))
  );
}

function splitClassNameTokens(className = '') {
  return className
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .split(/[^a-zA-Z0-9]+/)
    .map(token => token.toLowerCase())
    .filter(token => token.length >= 3 && !MATCH_STOP_WORDS.has(token));
}

function hasSufficientSignalOverlap(queryTokens, candidateTokens) {
  if (!queryTokens.size || !candidateTokens.size) {
    return false;
  }

  let overlap = 0;
  for (const token of queryTokens) {
    if (candidateTokens.has(token)) {
      overlap += 1;
    }
  }

  if (overlap === 0) {
    return false;
  }

  const minSize = Math.min(queryTokens.size, candidateTokens.size);
  if (minSize <= 2) {
    return overlap >= 1;
  }

  const unionSize = new Set([...queryTokens, ...candidateTokens]).size;
  const jaccard = overlap / unionSize;
  const overlapRatio = overlap / minSize;

  return overlap >= 2 && (jaccard >= 0.12 || overlapRatio >= 0.34);
}

// Initialize generators
const javaGenerator = new JavaTestGenerator();
const claudeAgent = new ClaudeAgentGenerator();

// ── Dual LLM Generators ──────────────────────────────────────────────────────
// Both GPT-4o and Claude Sonnet 4.6 run simultaneously.
// The correct one is selected per-request based on the `llm` field.

// 1. Azure OpenAI — GPT-4o
let gptGenerator = null;
if (openaiConfig && openaiConfig.openai) {
  gptGenerator = new AITestGenerator({
    llmClient: openaiConfig.openai,
    mcpAvailable: true
  });
  console.log('✅ Initialized: GPT-4o (Azure OpenAI)');
}

// 2. Anthropic — Claude Sonnet 4.6
let claudeGenerator = null;
if (claudeConfig.isConfigured()) {
  claudeGenerator = new AITestGenerator({
    llmClient: claudeConfig.claudeClient,
    mcpAvailable: true
  });
  console.log('✅ Initialized: Claude Sonnet 4.6 (Anthropic)');
}

// Default active generator (Claude preferred, falls back to GPT-4o)
let aiGenerator = claudeGenerator || gptGenerator;
let llmProvider = claudeGenerator ? 'claude' : (gptGenerator ? 'openai' : 'none');

console.log('🤖 Default generator:', llmProvider);

// Health check
router.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// GET /api/csv-content - Read CSV file content
router.get('/csv-content', (req, res) => {
  const csvFilePath = req.query.filePath;
  
  if (!csvFilePath) {
    return res.status(400).json({ error: 'File path is required' });
  }
  
  // Validate file path to prevent directory traversal attacks
  const normalizedPath = path.normalize(csvFilePath);
  if (!normalizedPath.includes('functional test report') || !normalizedPath.endsWith('.csv')) {
    return res.status(400).json({ error: 'Invalid CSV file path' });
  }
  
  try {
    if (!fs.existsSync(normalizedPath)) {
      return res.status(404).json({ error: 'CSV file not found' });
    }
    
    const csvContent = fs.readFileSync(normalizedPath, 'utf8');
    res.json({ 
      success: true, 
      content: csvContent,
      filePath: normalizedPath 
    });
  } catch (error) {
    console.error('Error reading CSV file:', error);
    res.status(500).json({ error: 'Failed to read CSV file', details: error.message });
  }
});

// GET /api/test-file/:testClass - Get test file content
router.get('/test-file/:testClass', (req, res) => {
  const { testClass } = req.params;
  
  if (!testClass) {
    return res.status(400).json({ error: 'Test class name is required' });
  }
  
  // Validate test class name to prevent directory traversal
  if (testClass.includes('..') || testClass.includes('/') || testClass.includes('\\')) {
    return res.status(400).json({ error: 'Invalid test class name' });
  }
  
  try {
    const projectRoot = path.join(__dirname, '../..');
    const testFilePath = path.join(projectRoot, 'src/test/java/tests', `${testClass}.java`);
    const pageObjectPath = path.join(projectRoot, 'src/test/java/pageobjects', `${testClass}Page.java`);
    
    let testContent = null;
    let pageObjectContent = null;
    
    // Try to read test file
    if (fs.existsSync(testFilePath)) {
      testContent = fs.readFileSync(testFilePath, 'utf8');
    }
    
    // Try to read page object file
    if (fs.existsSync(pageObjectPath)) {
      pageObjectContent = fs.readFileSync(pageObjectPath, 'utf8');
    }
    
    if (!testContent && !pageObjectContent) {
      return res.status(404).json({ 
        error: 'Test files not found',
        details: `Neither ${testClass}.java nor ${testClass}Page.java exists`
      });
    }
    
    res.json({ 
      success: true, 
      testClass,
      testContent,
      pageObjectContent
    });
  } catch (error) {
    console.error('Error reading test file:', error);
    res.status(500).json({ error: 'Failed to read test file', details: error.message });
  }
});

// GET /api/generator-status - Check which generator is active
router.get('/generator-status', (req, res) => {
  const both = claudeGenerator && gptGenerator;
  res.json({
    aiGeneratorConfigured: !!aiGenerator,
    llmProvider: llmProvider,
    claudeConfigured: claudeConfig.isConfigured(),
    gptConfigured: !!(openaiConfig && openaiConfig.openai),
    generatorInUse: both
      ? 'Both (Claude Sonnet 4.6 + GPT-4o available — selected per request)'
      : (aiGenerator && llmProvider === 'claude') ? 'AITestGenerator (Claude Sonnet 4.6)'
      : (aiGenerator && llmProvider === 'openai')  ? 'AITestGenerator (Azure OpenAI)'
      : 'ClaudeAgentGenerator (Pattern Matcher)'
  });
});

// GET /api/metrics - Get test metrics
router.get('/metrics', async (req, res) => {
  try {
    const metrics = await metricsService.getMetrics();
    res.json(metrics);
  } catch (error) {
    console.error('Error getting metrics:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/history - Get test history
router.get('/history', async (req, res) => {
  try {
    const history = await metricsService.getHistory();
    res.json(history);
  } catch (error) {
    console.error('Error getting history:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/testcases/matches - Find matching test cases for a prompt
router.post('/testcases/matches', async (req, res) => {
  try {
    let { prompt, testType = 'functional' } = req.body;

    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({ 
        error: 'Prompt is required and must be a string' 
      });
    }

    // Store original user prompt for matching
    const originalPrompt = prompt;
    
    // DO NOT structure the prompt for matching - use original user input
    // The registry should store original prompts, not structured templates
    console.log('[MATCH] Finding matches for original prompt:', originalPrompt.substring(0, 100));

    // Initialize prompt validation handler
    const handler = new TestRequestHandler();
    await handler.initialize();

    // Get registry and utilities
    const { HashUtil, EmbeddingUtil, SimilarityUtil } = require(promptValidationPath);
    
    // Match only on the original user prompt to avoid template-driven false positives.
    const matchHashes = [HashUtil.generateHash(originalPrompt)];
    const embeddingUtil = new EmbeddingUtil(null); // No OpenAI client
    const queryEmbedding = await embeddingUtil.generateEmbedding(originalPrompt);
    const queryTokens = extractSignalTokens(originalPrompt);

    // Get all entries from registry
    const allEntries = handler.registryManager.getAllEntries();

    // Find exact matches (by hash)
    const exactMatches = [];
    const similarMatches = [];

    for (const entry of allEntries) {
      if (matchHashes.includes(entry.hash)) {
        // Exact match
        exactMatches.push({
          className: entry.className,
          pageObjectPath: entry.pageObjectPath,
          testFilePath: entry.testFilePath,
          similarity: 1.0,
          lastRunStatus: entry.lastRunStatus || 'UNKNOWN',
          createdAt: entry.createdAt,
          prompt: entry.prompt
        });
      } else if (entry.embedding && Array.isArray(entry.embedding)) {
        // Calculate similarity
        try {
          const similarity = SimilarityUtil.cosineSimilarity(queryEmbedding, entry.embedding);
          
          // Include if similarity >= 75% (0.75 threshold for more precise matching)
          // Also check for keyword mismatch to avoid false positives
          const newPromptLower = originalPrompt.toLowerCase();
          const existingPromptLower = (entry.prompt || '').toLowerCase();
          
          // Define mutually exclusive keywords
          const keywordGroups = [
            ['login', 'signin', 'authenticate'],
            ['contact', 'form', 'inquiry'],
            ['search', 'find', 'query'],
            ['checkout', 'purchase', 'payment']
          ];
          
          const newHasAnyGroup = keywordGroups.some(group =>
            group.some(kw => newPromptLower.includes(kw))
          );
          const existingHasAnyGroup = keywordGroups.some(group =>
            group.some(kw => existingPromptLower.includes(kw))
          );

          // Check if prompts belong to different keyword groups.
          // Apply this only when both prompts contain recognized keywords,
          // otherwise legacy structured prompts would be unfairly penalized.
          let isDifferentContext = false;
          if (newHasAnyGroup && existingHasAnyGroup) {
            for (const group of keywordGroups) {
              const newHasGroup = group.some(kw => newPromptLower.includes(kw));
              const existingHasGroup = group.some(kw => existingPromptLower.includes(kw));

              // If one has keyword from group but other doesn't, they're different
              if (newHasGroup !== existingHasGroup) {
                isDifferentContext = true;
                break;
              }
            }
          }
          
          // Reduce similarity if keywords mismatch
          let adjustedSimilarity = similarity;
          if (isDifferentContext && similarity > 0.90) {
            adjustedSimilarity = similarity * 0.6; // Penalize mismatched context
          }
          
          const candidateTokens = extractSignalTokens(entry.prompt || '');
          for (const classToken of splitClassNameTokens(entry.className)) {
            candidateTokens.add(classToken);
          }

          const hasSignalOverlap = hasSufficientSignalOverlap(queryTokens, candidateTokens);

          // Require both high semantic similarity and lexical overlap.
          if (adjustedSimilarity >= 0.82 && hasSignalOverlap) {
            similarMatches.push({
              className: entry.className,
              pageObjectPath: entry.pageObjectPath,
              testFilePath: entry.testFilePath,
              similarity: adjustedSimilarity,
              lastRunStatus: entry.lastRunStatus || 'UNKNOWN',
              createdAt: entry.createdAt,
              prompt: entry.prompt
            });
          }
        } catch (err) {
          console.warn('Error calculating similarity for entry:', err.message);
        }
      }
    }

    // Sort similar matches by similarity descending
    similarMatches.sort((a, b) => b.similarity - a.similarity);

    res.json({
      exactMatches,
      similarMatches,
      totalMatches: exactMatches.length + similarMatches.length
    });

  } catch (error) {
    console.error('Error finding test case matches:', error);
    res.status(500).json({ 
      error: 'Failed to find matching test cases',
      details: error.message 
    });
  }
});

// POST /api/run - Run tests
router.post('/run', async (req, res) => {
  try {
    const { testClass, testMethod, testType = 'functional' } = req.body;
    const io = req.app.get('io');
    
    const testId = await testExecutor.runTest(testClass, testMethod, io, '', { testType });
    
    res.json({ 
      success: true, 
      testId,
      message: 'Test execution started'
    });
  } catch (error) {
    console.error('Error running test:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/generate-ai-test - Generate AI test with Claude Agent Mode
router.post('/generate-ai-test', async (req, res) => {
  console.log('');
  console.log('═══════════════════════════════════════════════════════');
  console.log('🎯 /api/generate-ai-test endpoint hit');
  console.log('═══════════════════════════════════════════════════════');
  
  try {
    let {
      prompt,
      testType = 'functional',
      llm = 'Claude Sonnet 4.6',
      forceNew = false,
      azureDevOps = {}
    } = req.body;
    const io = req.app.get('io');
    
    // Store the original user prompt before structuring (for RAG)
    const originalPrompt = prompt;
    
    console.log('📥 Request params:');
    console.log('   - testType:', testType);
    console.log('   - llm:', llm);
    console.log('   - forceNew:', forceNew);
    console.log('   - prompt length:', prompt.length);
    
    // Azure Boards mode ALWAYS generates CSV files only (no Java files)
    const isAzureBoardsMode = azureWorkItemAutomationService.isAzureBoardsWorkItemTestType(testType);
    
    if (isAzureBoardsMode) {
      console.log('🔵 Azure Boards CSV Test Case Generation Mode Detected');
      console.log('   - Generating CSV test case file ONLY (no Java files)');
      
      try {
        let csvResult;
        
        // Auto-detect work item ID from prompt if not provided
        if (!azureDevOps.relatedWorkItemIds || azureDevOps.relatedWorkItemIds.length === 0) {
          const idMatch = String(originalPrompt || '').match(/work\s*item\s*(?:id|#|number)?\s*[:#-]?\s*(\d+)/i);
          if (idMatch && idMatch[1]) {
            console.log(`🔍 Auto-detected work item ID from prompt: ${idMatch[1]}`);
            azureDevOps.relatedWorkItemIds = [idMatch[1]];
          }
        }
        
        // Check if Azure DevOps is configured and we have work item IDs
        if (!azureWorkItemAutomationService.connector.isConfigured() || 
            !azureDevOps.relatedWorkItemIds || 
            azureDevOps.relatedWorkItemIds.length === 0) {
          console.warn('⚠️  Azure DevOps not configured or no work item IDs - generating CSV from prompt directly');
          
          // Generate CSV from prompt without Azure DevOps connection
          const csvTestCaseWriter = require('../services/csvTestCaseWriter');
          csvResult = csvTestCaseWriter.generateCSVFromPrompt(originalPrompt);
          
          console.log('✅ CSV test case generated from prompt (no Azure DevOps)');
          console.log('   - File:', csvResult.filename);
          console.log('   - Steps:', csvResult.testStepCount);

          // Save to RAG history as Azure Boards test run (async, non-blocking)
          setImmediate(() => ragIntegrationService.sendToRAG({
            runId: `azure_boards_${Date.now()}`,
            testType: 'performance',
            prompt: originalPrompt,
            testClass: csvResult.filename || 'AzureBoardsCSV',
            status: 'passed',
            timestamp: new Date().toISOString(),
            duration: 0,
            results: { totalTests: csvResult.testStepCount || 1, passed: csvResult.testStepCount || 1, failed: 0, skipped: 0 },
            metadata: { mode: 'csv-testcase-prompt', csvFile: csvResult.filename }
          }).catch(() => {}));

          return res.json({
            success: true,
            mode: 'csv-testcase-prompt',
            message: 'CSV test case generated from prompt (Azure DevOps not configured)',
            csvFilePath: csvResult.filePath,
            csvFileName: csvResult.filename,
            testStepCount: csvResult.testStepCount,
            source: 'prompt',
            artifacts: [
              {
                fileName: csvResult.filename,
                filePath: csvResult.filePath,
                type: 'CSV Test Case',
                timestamp: new Date(),
                description: 'Test case generated from user prompt'
              }
            ]
          });
        }
        
        // Azure DevOps IS configured - fetch from work items
        csvResult = await azureWorkItemAutomationService.generateCSVTestCase({
          prompt: originalPrompt,
          relatedWorkItemIds: azureDevOps.relatedWorkItemIds || []
        });
        
        console.log('✅ CSV test case generated from Azure DevOps work item');
        console.log('   - File:', csvResult.csvFileName);
        console.log('   - Steps:', csvResult.testStepCount);
        console.log('   - Java file generation SKIPPED (Azure Boards mode)');

        // Save to RAG history as Azure Boards test run (async, non-blocking)
        setImmediate(() => ragIntegrationService.sendToRAG({
          runId: `azure_boards_${Date.now()}`,
          testType: 'performance',
          prompt: originalPrompt,
          testClass: csvResult.csvFileName || `WorkItem_${csvResult.workItemId}`,
          status: 'passed',
          timestamp: new Date().toISOString(),
          duration: 0,
          results: { totalTests: csvResult.testStepCount || 1, passed: csvResult.testStepCount || 1, failed: 0, skipped: 0 },
          metadata: {
            mode: 'csv-testcase-azuredevops',
            workItemId: csvResult.workItemId,
            workItemTitle: csvResult.workItemTitle,
            csvFile: csvResult.csvFileName
          }
        }).catch(() => {}));

        return res.json({
          success: true,
          mode: 'csv-testcase-azuredevops',
          message: 'CSV test case generated from Azure DevOps work item (no Java files created)',
          csvFilePath: csvResult.csvFilePath,
          csvFileName: csvResult.csvFileName,
          testStepCount: csvResult.testStepCount,
          workItemId: csvResult.workItemId,
          workItemTitle: csvResult.workItemTitle,
          source: 'azuredevops',
          artifacts: [
            {
              fileName: csvResult.csvFileName,
              filePath: csvResult.csvFilePath,
              type: 'CSV Test Case',
              timestamp: new Date(),
              description: `Test case for work item ${csvResult.workItemId}: ${csvResult.workItemTitle}`
            }
          ]
        });
      } catch (csvError) {
        console.error('❌ CSV test case generation failed:', csvError.message);
        return res.status(500).json({
          success: false,
          error: 'Failed to generate CSV test case',
          details: csvError.message
        });
      }
    }

    // Build structured prompt from user input ONLY if needed
    console.log('📝 Original user prompt length:', originalPrompt.length);
    
    // Check if prompt is already structured (contains framework rules)
    const isAlreadyStructured = prompt.includes('FRAMEWORK CONTEXT') || 
                                 prompt.includes('LOCATOR RULES') ||
                                 prompt.includes('CODING RULES');
    
    if (!isAlreadyStructured) {
      const structuredPrompt = promptBuilder.buildPrompt(prompt, testType);
      console.log('📋 Structured prompt length:', structuredPrompt.length);
      prompt = structuredPrompt;
    } else {
      console.log('📋 Prompt already structured, using as-is');
    }
    
    // Select generator based on `llm` field from the request
    let generator;
    if (llm === 'GPT-4o' && gptGenerator) {
      console.log('🤖 Using GPT-4o (Azure OpenAI) — selected by user');
      generator = gptGenerator;
    } else if ((llm === 'Claude Sonnet 4.6' || llm === 'Claude Sonnet 4.5') && claudeGenerator) {
      console.log('🤖 Using Claude Sonnet 4.6 (Anthropic) — selected by user');
      generator = claudeGenerator;
    } else if (llm === 'Pattern Matching') {
      console.log('🤖 Using Pattern Matcher (claudeAgent) — selected by user');
      generator = claudeAgent;
    } else {
      // Fallback: use default active generator
      generator = claudeGenerator || gptGenerator || claudeAgent;
      console.log('🤖 Using default generator:', generator === claudeGenerator ? 'Claude' : generator === gptGenerator ? 'GPT-4o' : 'Pattern Matcher');
    }
    
    // Initialize prompt validation handler with selected generator
    const handler = new TestRequestHandler({
      testGenerator: generator
    });
    await handler.initialize();
    
    console.log(`Generating ${testType} test with structured prompt`);
    console.log('Force new test:', forceNew);
    
    // Process the test request (generates files and registers in test-registry.json)
    const result = await handler.processTestRequest({
      prompt,
      originalPrompt,
      testType,
      llm,
      forceNew
    });

    let azureDevOpsContext = null;
    if (azureWorkItemAutomationService.isAzureBoardsWorkItemTestType(testType)) {
      try {
        azureDevOpsContext = await azureWorkItemAutomationService.syncGeneratedTest({
          testType,
          prompt: originalPrompt,
          testClassName: result.testClassName,
          testFilePath: result.testFilePath,
          relatedWorkItemIds: azureDevOps.relatedWorkItemIds || [],
          assignedTo: azureDevOps.assignedTo,
          priority: azureDevOps.priority,
          state: azureDevOps.state || 'Active',
          workItemType: azureDevOps.workItemType || 'Task'
        });
      } catch (integrationError) {
        console.error('Azure DevOps integration error:', integrationError.message);
        azureDevOpsContext = {
          enabled: false,
          error: integrationError.message
        };
      }
    }
    
    // Pre-generate testId so the frontend can subscribe BEFORE execution
    // starts and receive all WebSocket progress events.
    const { v4: uuidv4 } = require('uuid');
    const testId = uuidv4();
    
    // Skip test execution for Azure Boards mode (only used for work item management, not test execution)
    if (!isAzureBoardsMode) {
      // Start Maven test execution in background with original prompt
      const testClass = result.testClassName;
      setImmediate(() => {
        testExecutor.runTest(testClass, null, io, originalPrompt, { 
          azureDevOpsContext,
          testType,
          testId   // pass pre-generated ID so executor emits on the same ID
        }).catch(err => {
          console.error('Background test execution error:', err);
        });
      });
    } else {
      console.log('🔵 Azure Boards mode: Skipping test execution (work item management only)');
    }
    
    res.json({
      success: true,
      testId: testId,
      message: isAzureBoardsMode ? 'Test generated (execution skipped for Azure Boards mode)' : 'Test generated and execution started',
      artifacts: [
        {
          fileName: result.testFileName,
          filePath: result.testFilePath,
          type: 'Selenium Test',
          timestamp: new Date(),
          description: `Generated Selenium test for: ${prompt.substring(0, 50)}...`,
          content: result.testContent
        },
        {
          fileName: result.pageObjectFileName,
          filePath: result.pageObjectPath,
          type: 'Page Object',
          timestamp: new Date(),
          description: 'Page Object Model for test',
          content: result.pageObjectContent
        }
      ],
      testClassName: result.testClassName,
      testFilePath: result.testFilePath,
      pageObjectPath: result.pageObjectPath,
      azureDevOps: azureDevOpsContext
    });
  } catch (error) {
    console.error('Error generating AI test:', error);
    res.status(500).json({ 
      error: error.message,
      details: error.stack 
    });
  }
});

// POST /api/azure-devops/generate-acceptance-criteria - AI-generate Gherkin acceptance criteria
router.post('/azure-devops/generate-acceptance-criteria', async (req, res) => {
  const { title, description, workItemType = 'User Story' } = req.body;

  if (!title || !title.trim()) {
    return res.status(400).json({ success: false, error: 'Title is required' });
  }

  let generator = claudeGenerator || gptGenerator;
  if (!generator) {
    return res.status(503).json({ success: false, error: 'No AI model configured.' });
  }

  const systemPrompt = `You are an expert Agile Business Analyst. Generate clear, concise Acceptance Criteria in Gherkin (Given/When/Then) format for Azure DevOps work items. 
Rules:
- Write 3-5 scenarios covering happy path and key edge cases
- Use plain text Gherkin — no markdown, no code blocks, no extra formatting
- Start each scenario with "Scenario:" on its own line
- Each Given/When/Then on its own line
- Separate scenarios with a blank line
- Be specific to the title and description provided`;

  const userPrompt = `Work Item Type: ${workItemType}
Title: ${title.trim()}
${description && description.trim() ? `Description: ${description.trim()}` : ''}

Generate acceptance criteria in Gherkin format for this work item.`;

  try {
    let aiText;
    if (generator === gptGenerator && typeof generator._callOpenAI === 'function') {
      aiText = await generator._callOpenAI(systemPrompt, userPrompt);
    } else if (typeof generator._callClaude === 'function') {
      aiText = await generator._callClaude(systemPrompt, userPrompt);
    } else {
      throw new Error('Generator has no callable LLM method');
    }
    res.json({ success: true, acceptanceCriteria: aiText.trim() });
  } catch (e) {
    console.error('[GENERATE-AC] Error:', e.message);
    res.status(500).json({ success: false, error: e.message });
  }
});

// GET /api/azure-devops/work-items/:id - Fetch a single work item by ID
router.get('/azure-devops/work-items/:id', async (req, res) => {
  try {
    const workItemId = Number(req.params.id);
    if (!Number.isInteger(workItemId) || workItemId <= 0) {
      return res.status(400).json({ error: 'Invalid work item id' });
    }
    if (!azureWorkItemAutomationService.connector.isConfigured()) {
      return res.status(503).json({ error: 'Azure DevOps is not configured. Set AZURE_DEVOPS_PAT in your .env file.' });
    }
    const raw = await azureWorkItemAutomationService.connector.getWorkItemById(workItemId);
    const f = raw.fields || {};
    res.json({
      success: true,
      workItem: {
        id: raw.id,
        url: raw._links?.html?.href || raw.url,
        title: f['System.Title'] || '',
        type: f['System.WorkItemType'] || '',
        state: f['System.State'] || '',
        assignedTo: f['System.AssignedTo']?.displayName || f['System.AssignedTo'] || '',
        priority: f['Microsoft.VSTS.Common.Priority'] || '',
        description: f['System.Description'] || '',
        acceptanceCriteria: f['Microsoft.VSTS.Common.AcceptanceCriteria'] || ''
      }
    });
  } catch (error) {
    console.error('Error fetching Azure DevOps work item:', error.message);
    res.status(error.status || 500).json({ error: error.message });
  }
});

// GET /api/azure-devops/work-items - Read work items (User Stories, Bugs, Tasks)
router.get('/azure-devops/work-items', async (req, res) => {
  try {
    const { types = 'User Story,Bug,Task', top = 20 } = req.query;
    const workItems = await azureWorkItemAutomationService.listWorkItems({
      types: String(types).split(',').map((t) => t.trim()).filter(Boolean),
      top: Number(top) || 20
    });
    res.json({ success: true, count: workItems.length, workItems });
  } catch (error) {
    console.error('Error reading Azure DevOps work items:', error.message);
    res.status(error.status || 500).json({ error: error.message });
  }
});

// POST /api/azure-devops/work-items - Create a work item
router.post('/azure-devops/work-items', async (req, res) => {
  try {
    const { type = 'Task', fields = {} } = req.body || {};
    console.log('Creating Azure DevOps work item:', { type, fields });
    const workItem = await azureWorkItemAutomationService.createWorkItem({ type, fields });
    
    // Validate that we got a valid work item response with an ID
    if (!workItem || !workItem.id) {
      console.error('Invalid work item response - no ID:', workItem);
      throw new Error('Azure DevOps did not return a valid work item with an ID');
    }
    
    console.log('Work item created successfully:', { id: workItem.id, type: workItem.fields?.['System.WorkItemType'] });
    res.json({ success: true, workItem });
  } catch (error) {
    console.error('Error creating Azure DevOps work item:', {
      message: error.message,
      status: error.response?.status || error.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      details: error.details
    });
    
    // Provide helpful error messages for authentication issues
    let errorMessage = error.message;
    if (error.message.includes('authentication is not configured')) {
      errorMessage = 'Azure DevOps authentication is not configured. Please set AZURE_DEVOPS_PAT in your .env file. Get your PAT from: https://dev.azure.com/UPSProd8/_usersSettings/tokens';
    }
    
    res.status(error.status || 500).json({ 
      message: errorMessage, 
      error: error.message,
      details: error.response?.data || error.details
    });
  }
});

// PATCH /api/azure-devops/work-items/:id - Update a work item
router.patch('/azure-devops/work-items/:id', async (req, res) => {
  try {
    const workItemId = Number(req.params.id);
    const { fields = {} } = req.body || {};

    if (!Number.isInteger(workItemId) || workItemId <= 0) {
      return res.status(400).json({ error: 'Invalid work item id' });
    }

    const workItem = await azureWorkItemAutomationService.updateWorkItem(workItemId, fields);
    res.json({ success: true, workItem });
  } catch (error) {
    console.error('Error updating Azure DevOps work item:', error.message);
    res.status(error.status || 500).json({ error: error.message });
  }
});

// POST /api/azure-devops/work-items/:id/comments - Add test execution comment
router.post('/azure-devops/work-items/:id/comments', async (req, res) => {
  try {
    const workItemId = Number(req.params.id);
    const { text } = req.body || {};

    if (!Number.isInteger(workItemId) || workItemId <= 0) {
      return res.status(400).json({ error: 'Invalid work item id' });
    }
    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'Comment text is required' });
    }

    const comment = await azureWorkItemAutomationService.addWorkItemComment(workItemId, text);
    res.json({ success: true, comment });
  } catch (error) {
    console.error('Error posting Azure DevOps comment:', error.message);
    res.status(error.status || 500).json({ error: error.message });
  }
});

// POST /api/azure-devops/work-items/:id/link - Link work items
router.post('/azure-devops/work-items/:id/link', async (req, res) => {
  try {
    const sourceWorkItemId = Number(req.params.id);
    const { targetWorkItemId, linkType = 'System.LinkTypes.Related', comment = '' } = req.body || {};

    if (!Number.isInteger(sourceWorkItemId) || sourceWorkItemId <= 0) {
      return res.status(400).json({ error: 'Invalid source work item id' });
    }
    if (!Number.isInteger(Number(targetWorkItemId)) || Number(targetWorkItemId) <= 0) {
      return res.status(400).json({ error: 'Invalid target work item id' });
    }

    const linkResult = await azureWorkItemAutomationService.linkWorkItems(
      sourceWorkItemId,
      Number(targetWorkItemId),
      linkType,
      comment
    );

    res.json({ success: true, linkResult });
  } catch (error) {
    console.error('Error linking Azure DevOps work items:', error.message);
    res.status(error.status || 500).json({ error: error.message });
  }
});

// GET /api/test-status/:id - Get test execution status
router.get('/test-status/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const status = await testExecutor.getTestStatus(id);
    
    if (!status) {
      return res.status(404).json({ error: 'Test not found' });
    }
    
    res.json(status);
  } catch (error) {
    console.error('Error getting test status:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/llms - Get available LLM models
router.get('/llms', (req, res) => {
  const isAIConfigured = !!(aiGenerator && llmProvider !== 'none');
  res.json([
    {
      id: 'GPT-4o',
      name: 'GPT-4o (Azure OpenAI)',
      provider: 'Azure OpenAI',
      deployment: 'gpt-4o',
      endpoint: 'diarymilk-5.openai.azure.com',
      active: !!(openaiConfig && openaiConfig.openai),
      status: (openaiConfig && openaiConfig.openai) ? 'connected' : 'not configured'
    },
    {
      id: 'Claude Sonnet 4.6',
      name: 'Claude Sonnet 4.6 (Agent Mode)',
      provider: 'Anthropic',
      deployment: 'claude-sonnet-4-6',
      endpoint: 'api.anthropic.com',
      active: claudeConfig.isConfigured(),
      status: claudeConfig.isConfigured() ? 'connected' : 'not configured'
    },
    {
      id: 'Pattern Matching',
      name: 'Pattern Matching (Fallback)',
      provider: 'Local',
      deployment: 'claudeAgentGenerator',
      endpoint: 'local',
      active: true,
      status: 'available'
    }
  ]);
});

// GET /api/list-test-classes - Returns all generated test class names for the fix dropdown
router.get('/list-test-classes', (req, res) => {
  try {
    const testsDir = path.join(__dirname, '../../src/test/java/tests');
    if (!fs.existsSync(testsDir)) return res.json({ classes: [] });
    const classes = fs.readdirSync(testsDir)
      .filter(f => f.endsWith('.java') && !f.startsWith('Language') && !f.startsWith('ParcelPro'))
      .map(f => f.replace('.java', ''))
      .sort();
    res.json({ classes });
  } catch (e) {
    res.json({ classes: [] });
  }
});

// POST /api/fix-test-error - Feed an error message to Claude/GPT and let it fix the Java files
router.post('/fix-test-error', async (req, res) => {
  const { testClassName, errorMessage, llm = 'Claude Sonnet 4.6' } = req.body;

  if (!testClassName || !errorMessage) {
    return res.status(400).json({ success: false, error: 'testClassName and errorMessage are required' });
  }

  const projectRoot = path.join(__dirname, '../..');
  const testsDir    = path.join(projectRoot, 'src/test/java/tests');
  const poDir       = path.join(projectRoot, 'src/test/java/pageobjects');
  const testFile    = path.join(testsDir, `${testClassName}.java`);
  const poFile      = path.join(poDir,    `${testClassName}Page.java`);

  if (!fs.existsSync(testFile) && !fs.existsSync(poFile)) {
    return res.status(404).json({ success: false, error: `Neither ${testClassName}.java nor ${testClassName}Page.java found.` });
  }

  const testCode = fs.existsSync(testFile) ? fs.readFileSync(testFile, 'utf8') : null;
  const poCode   = fs.existsSync(poFile)   ? fs.readFileSync(poFile,   'utf8') : null;

  // Pick the generator
  let generator = null;
  if (llm === 'GPT-4o' && gptGenerator) generator = gptGenerator;
  else if (claudeGenerator) generator = claudeGenerator;
  else if (gptGenerator)    generator = gptGenerator;

  if (!generator) {
    return res.status(503).json({ success: false, error: 'No LLM configured. Check server status.' });
  }

  const systemPrompt = `You are an expert Java Selenium TestNG automation engineer.
You will be given:
1. A TestNG test file and/or its Page Object file that are failing
2. The exact error/stack trace from the test run

Your job is to fix ONLY what is broken. Keep everything else exactly the same.

RULES:
- Return the COMPLETE fixed file(s) inside fenced code blocks
- Use exactly these markers:
    === TEST FILE ===
    \`\`\`java
    <full fixed test class here>
    \`\`\`
    === PAGE OBJECT FILE ===
    \`\`\`java
    <full fixed page object here>
    \`\`\`
- If a file does not need changes, still return it unchanged inside its block
- Do NOT add explanations outside the code blocks
- Preserve the exact package, imports, class name, and all method signatures
- Fix locators, iframe switching, null pointer issues, missing methods — whatever the error requires
- Use the proven pattern: List<By> with multiple fallbacks, findFirstVisible(), try/catch per method
- For AEM iframe forms: always call driver.switchTo().frame("aemFormFrame") before field interactions`;

  const userPrompt = `ERROR FROM TEST RUN:
\`\`\`
${errorMessage.trim()}
\`\`\`

${testCode ? `CURRENT TEST FILE (${testClassName}.java):\n\`\`\`java\n${testCode}\n\`\`\`` : '(no test file)'}

${poCode ? `CURRENT PAGE OBJECT FILE (${testClassName}Page.java):\n\`\`\`java\n${poCode}\n\`\`\`` : '(no page object file)'}

Fix these files so the test passes. Return both complete files using the markers shown.`;

  try {
    console.log(`[FIX-TEST] Calling ${llm} to fix ${testClassName} ...`);
    // Route to the correct underlying API method based on which generator was selected
    let aiText;
    if (generator === gptGenerator && typeof generator._callOpenAI === 'function') {
      aiText = await generator._callOpenAI(systemPrompt, userPrompt);
    } else if (typeof generator._callClaude === 'function') {
      aiText = await generator._callClaude(systemPrompt, userPrompt);
    } else {
      throw new Error('Generator has no callable LLM method');
    }

    // Extract test file
    const testMatch = aiText.match(/=== TEST FILE ===[\s\S]*?```java\s*([\s\S]*?)```/);
    const poMatch   = aiText.match(/=== PAGE OBJECT FILE ===[\s\S]*?```java\s*([\s\S]*?)```/);

    let savedFiles = [];

    if (testMatch && testMatch[1] && testFile) {
      const fixed = testMatch[1].trim();
      fs.writeFileSync(testFile, fixed, 'utf8');
      savedFiles.push(`${testClassName}.java`);
      console.log(`[FIX-TEST] ✅ Wrote fixed test file: ${testFile}`);
    }
    if (poMatch && poMatch[1] && poFile) {
      const fixed = poMatch[1].trim();
      fs.writeFileSync(poFile, fixed, 'utf8');
      savedFiles.push(`${testClassName}Page.java`);
      console.log(`[FIX-TEST] ✅ Wrote fixed page object: ${poFile}`);
    }

    if (savedFiles.length === 0) {
      console.warn('[FIX-TEST] ⚠ LLM returned no parseable code blocks');
      return res.json({
        success: false,
        error: 'LLM did not return parseable code. Try again or paste a more specific error.',
        rawResponse: aiText.slice(0, 2000)
      });
    }

    res.json({
      success: true,
      message: `Fixed and saved: ${savedFiles.join(', ')}`,
      savedFiles,
      llmUsed: llm
    });
  } catch (e) {
    console.error('[FIX-TEST] Error calling LLM:', e.message);
    res.status(500).json({ success: false, error: e.message });
  }
});

// GET /api/rag/stats - Get RAG statistics
router.get('/rag/stats', async (req, res) => {
  try {
    const stats = await ragIntegrationService.getStatistics();
    
    if (!stats) {
      return res.status(503).json({ 
        error: 'RAG server not available',
        message: 'Please ensure RAG server is running on port 8081'
      });
    }
    
    res.json(stats);
  } catch (error) {
    console.error('Error getting RAG stats:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/rag/query - Query test history from RAG
router.post('/rag/query', async (req, res) => {
  try {
    console.log('🔍 RAG Query Request:', { question: req.body?.question, body: req.body });
    const { question } = req.body;
    
    if (!question) {
      console.log('❌ No question provided');
      return res.status(400).json({ error: 'Question is required' });
    }
    
    console.log('📞 Calling RAG service with question:', question);
    const result = await ragIntegrationService.queryHistory(question);
    
    if (!result) {
      return res.status(503).json({ 
        error: 'RAG server not available',
        message: 'Please ensure RAG server is running on port 8081'
      });
    }
    
    res.json(result);
  } catch (error) {
    console.error('Error querying RAG:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/test-history/stats - Proxy to RAG server
router.get('/test-history/stats', async (req, res) => {
  try {
    const stats = await ragIntegrationService.getStatistics();
    
    if (!stats) {
      return res.status(503).json({ 
        error: 'RAG server not available',
        message: 'Please ensure RAG server is running on port 8081'
      });
    }
    
    res.json(stats);
  } catch (error) {
    console.error('Error getting test history stats:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/test-history - Proxy to RAG server
router.get('/test-history', async (req, res) => {
  try {
    const result = await ragIntegrationService.getTestHistory(req.query);
    
    if (!result) {
      return res.status(503).json({ 
        error: 'RAG server not available',
        message: 'Please ensure RAG server is running on port 8081'
      });
    }
    
    res.json(result);
  } catch (error) {
    console.error('Error getting test history:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/health - Health check
router.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    service: 'ParcelPro Test API'
  });
});

// ─── Performance / JMeter endpoints ─────────────────────────────────────────

// GET /api/jmeter-status - Check if JMeter is installed
router.get('/jmeter-status', (req, res) => {
  const exe = jmeterService.findJMeter();
  res.json({
    installed: !!exe,
    executable: exe || null,
    message: exe ? `JMeter found at: ${exe}` : 'JMeter not found – simulation mode will be used',
    installGuide: 'https://jmeter.apache.org/download_jmeter.cgi',
    envHint: 'Set JMETER_HOME environment variable to your JMeter installation directory'
  });
});

// POST /api/performance-test - Launch a JMeter performance test
router.post('/performance-test', async (req, res) => {
  const io = req.app.get('io');
  try {
    const {
      prompt        = '',
      testName      = 'Performance Test',
      targetUrl,
      httpMethod    = 'GET',
      threads       = 10,
      rampUp        = 30,
      duration      = 60,
      requestBody   = '',
      contentType   = 'application/json',
      assertions    = [],
      endpoints     = [],
      scenarioType  = 'http-request'
    } = req.body;

    if (!targetUrl && endpoints.length === 0) {
      return res.status(400).json({ error: 'targetUrl is required for performance tests' });
    }

    const { v4: uuidv4 } = require('uuid');
    const testId = uuidv4();

    const config = {
      testName:    testName || (prompt ? prompt.substring(0, 60) : 'Performance Test'),
      targetUrl,
      httpMethod,
      threads:     parseInt(threads) || 10,
      rampUp:      parseInt(rampUp) || 30,
      duration:    parseInt(duration) || 60,
      requestBody,
      contentType,
      assertions,
      endpoints,
      scenarioType,
      prompt
    };

    // Launch async (non-blocking)
    setImmediate(() => {
      jmeterService.executePerformanceTest(testId, config, io);
    });

    res.json({
      success: true,
      testId,
      message: 'Performance test started',
      simulation: !jmeterService.findJMeter()
    });
  } catch (err) {
    console.error('Error starting performance test:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/performance-test/:testId - Get current status / results
router.get('/performance-test/:testId', (req, res) => {
  const run = jmeterService.getRunStatus(req.params.testId);
  if (!run) {
    return res.status(404).json({ error: 'Performance test not found' });
  }
  res.json({
    testId:       run.testId,
    status:       run.status,
    config:       run.config,
    result:       run.result,
    startedAt:    run.startedAt,
    completedAt:  run.completedAt,
    reportUrl:    run.reportUrl || null,
    jmxPath:      run.jmxPath,
    simulation:   !!(run.result && run.result.simulated)
  });
});

// GET /api/performance-test/:testId/logs - Stream run logs
router.get('/performance-test/:testId/logs', (req, res) => {
  const run = jmeterService.getRunStatus(req.params.testId);
  if (!run) return res.status(404).json({ error: 'Not found' });
  res.json({ testId: run.testId, logs: run.logs || [] });
});

module.exports = router;
