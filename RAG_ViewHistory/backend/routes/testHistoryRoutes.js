const express = require('express');
const router = express.Router();
const testHistoryService = require('../services/testHistoryService');
const simpleQueryService = require('../services/simpleQueryService');
// const ragService = require('../services/ragService'); // Disabled - requires valid OpenAI key

/**
 * GET /api/test-history
 * Get all test runs with optional filters
 */
router.get('/', async (req, res) => {
  try {
    const { limit, testType, status, startDate, endDate } = req.query;

    let testRuns;

    if (testType || status || startDate || endDate) {
      testRuns = await testHistoryService.getTestRunsByFilter({
        testType,
        status,
        startDate,
        endDate
      });
    } else {
      testRuns = await testHistoryService.getAllTestRuns(parseInt(limit) || 100);
    }

    res.json({
      success: true,
      count: testRuns.length,
      testRuns: testRuns.map(run => run.toJSON())
    });
  } catch (error) {
    console.error('Error getting test history:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/test-history/stats
 * Get test run statistics
 */
router.get('/stats', async (req, res) => {
  try {
    const stats = await testHistoryService.getStatistics();

    res.json({
      success: true,
      stats
    });
  } catch (error) {
    console.error('Error getting statistics:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/test-history/:runId
 * Get a single test run by ID
 */
router.get('/:runId', async (req, res) => {
  try {
    const { runId } = req.params;
    const testRun = await testHistoryService.getTestRun(runId);

    if (!testRun) {
      return res.status(404).json({
        success: false,
        error: 'Test run not found'
      });
    }

    res.json({
      success: true,
      testRun: testRun.toJSON()
    });
  } catch (error) {
    console.error('Error getting test run:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/test-history
 * Save a new test run
 */
router.post('/', async (req, res) => {
  try {
    const testRun = await testHistoryService.saveTestRun(req.body);

    // Simple mode - no embedding needed
    // await ragService.addTestRun(testRun);

    res.json({
      success: true,
      testRun: testRun.toJSON()
    });
  } catch (error) {
    console.error('Error saving test run:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/test-history/query
 * Query test history using keywords (Simple Mode - No OpenAI required)
 */
router.post('/query', async (req, res) => {
  try {
    const { question } = req.body;

    if (!question) {
      return res.status(400).json({
        success: false,
        error: 'Question is required'
      });
    }

    // Use simple query service (keyword-based, no OpenAI)
    const result = await simpleQueryService.query(question);

    res.json(result);
  } catch (error) {
    console.error('Error querying:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/test-history/initialize
 * Initialize service (Simple mode - no embedding needed)
 */
router.post('/initialize', async (req, res) => {
  try {
    // Simple mode - just confirm service is ready
    const testRuns = await testHistoryService.getAllTestRuns(10);
    
    res.json({
      success: true,
      message: 'Simple query service initialized successfully',
      stats: {
        vectorCount: testRuns.length,
        initialized: true,
        mode: 'keyword-based (no OpenAI required)'
      }
    });
  } catch (error) {
    console.error('Error initializing:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/test-history/rag/stats
 * Get RAG service statistics
 */
router.get('/rag/stats', (req, res) => {
  try {
    const stats = ragService.getStats();

    res.json({
      success: true,
      stats
    });
  } catch (error) {
    console.error('Error getting RAG stats:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
