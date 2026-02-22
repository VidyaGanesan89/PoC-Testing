/**
 * Prompt Validation System - Main Entry Point
 * 
 * This module provides duplicate detection for Selenium test generation
 * using hash-based and embedding-based similarity matching.
 */

const HashUtil = require('./utils/hashUtil');
const EmbeddingUtil = require('./utils/embeddingUtil');
const SimilarityUtil = require('./utils/similarityUtil');
const TestRegistryManager = require('./services/testRegistryManager');
const TestRequestHandler = require('./services/testRequestHandler');

/**
 * Initialize the prompt validation system
 * @param {object} config - Configuration
 * @param {object} config.openaiClient - Optional OpenAI client
 * @param {object} config.testGenerator - Test generator service
 * @param {object} config.testExecutor - Test executor service
 * @param {string} config.registryPath - Custom registry path
 * @returns {Promise<TestRequestHandler>} - Initialized handler
 */
async function initializePromptValidation(config = {}) {
  try {
    const handler = new TestRequestHandler({
      openaiClient: config.openaiClient || null,
      testGenerator: config.testGenerator || null,
      testExecutor: config.testExecutor || null,
      registryPath: config.registryPath || null
    });

    await handler.initialize();

    console.log('✓ Prompt validation system initialized');
    console.log('  - Hash-based duplicate detection: enabled');
    console.log('  - Embedding similarity matching: enabled');
    console.log('  - Similarity threshold: 50%');

    return handler;
  } catch (error) {
    console.error('Failed to initialize prompt validation:', error);
    throw error;
  }
}

module.exports = {
  // Main handler
  TestRequestHandler,
  
  // Core services
  TestRegistryManager,
  
  // Utilities
  HashUtil,
  EmbeddingUtil,
  SimilarityUtil,
  
  // Initialization helper
  initializePromptValidation
};
