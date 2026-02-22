/**
 * Test Suite for Prompt Validation System
 * Validates all core functionality
 */

const { HashUtil, EmbeddingUtil, SimilarityUtil, TestRegistryManager, TestRequestHandler } = require('../index');
const fs = require('fs').promises;
const path = require('path');

// Test utilities
const assert = (condition, message) => {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
};

const assertEqual = (actual, expected, message) => {
  if (actual !== expected) {
    throw new Error(`${message}\n  Expected: ${expected}\n  Actual: ${actual}`);
  }
};

// Test counter
let testsRun = 0;
let testsPassed = 0;
let testsFailed = 0;

async function runTest(name, testFn) {
  testsRun++;
  try {
    await testFn();
    console.log(`✓ ${name}`);
    testsPassed++;
  } catch (error) {
    console.error(`✗ ${name}`);
    console.error(`  ${error.message}`);
    testsFailed++;
  }
}

// === Hash Utility Tests ===

async function testHashNormalization() {
  const input1 = "  Test Login!!  ";
  const input2 = "test login";
  const input3 = "TEST   LOGIN???";

  const normalized1 = HashUtil.normalizePrompt(input1);
  const normalized2 = HashUtil.normalizePrompt(input2);
  const normalized3 = HashUtil.normalizePrompt(input3);

  assertEqual(normalized1, "test login", "Normalization 1");
  assertEqual(normalized2, "test login", "Normalization 2");
  assertEqual(normalized3, "test login", "Normalization 3");
}

async function testHashDeterminism() {
  const prompt = "Test login functionality";
  
  const hash1 = HashUtil.generateHash(prompt);
  const hash2 = HashUtil.generateHash(prompt);
  const hash3 = HashUtil.generateHash("TEST LOGIN FUNCTIONALITY!!!");

  assertEqual(hash1, hash2, "Hashes should be identical");
  assertEqual(hash1, hash3, "Normalized hashes should match");
  assert(hash1.length === 64, "Hash should be 64 characters (SHA-256)");
}

async function testHashVerification() {
  const prompt = "Test user registration";
  const hash = HashUtil.generateHash(prompt);

  assert(HashUtil.verifyHash(prompt, hash), "Hash should verify");
  assert(HashUtil.verifyHash("TEST USER REGISTRATION", hash), "Normalized hash should verify");
  assert(!HashUtil.verifyHash("Different prompt", hash), "Different prompt should not verify");
}

// === Embedding Utility Tests ===

async function testFallbackEmbedding() {
  const embedder = new EmbeddingUtil(null);
  
  const embedding1 = embedder.generateFallbackEmbedding("Test login");
  const embedding2 = embedder.generateFallbackEmbedding("Test login");

  assert(Array.isArray(embedding1), "Should return array");
  assert(embedding1.length === 384, "Should have 384 dimensions");
  assertEqual(embedding1.length, embedding2.length, "Embeddings should have same length");
  
  // Check determinism
  for (let i = 0; i < embedding1.length; i++) {
    assertEqual(embedding1[i], embedding2[i], `Embedding value at index ${i} should match`);
  }
}

async function testEmbeddingNormalization() {
  const embedder = new EmbeddingUtil(null);
  const embedding = embedder.generateFallbackEmbedding("Test");

  // Calculate magnitude
  const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));

  assert(Math.abs(magnitude - 1.0) < 0.0001, "Embedding should be normalized (magnitude ≈ 1)");
}

// === Similarity Utility Tests ===

async function testCosineSimilarityIdentical() {
  const vectorA = [1, 2, 3, 4, 5];
  const vectorB = [1, 2, 3, 4, 5];

  const similarity = SimilarityUtil.cosineSimilarity(vectorA, vectorB);

  assert(Math.abs(similarity - 1.0) < 0.0001, "Identical vectors should have similarity = 1");
}

async function testCosineSimilarityOrthogonal() {
  const vectorA = [1, 0, 0];
  const vectorB = [0, 1, 0];

  const similarity = SimilarityUtil.cosineSimilarity(vectorA, vectorB);

  assert(Math.abs(similarity - 0.0) < 0.0001, "Orthogonal vectors should have similarity = 0");
}

async function testCosineSimilarityOpposite() {
  const vectorA = [1, 2, 3];
  const vectorB = [-1, -2, -3];

  const similarity = SimilarityUtil.cosineSimilarity(vectorA, vectorB);

  assert(Math.abs(similarity - (-1.0)) < 0.0001, "Opposite vectors should have similarity = -1");
}

async function testFindMostSimilar() {
  const queryVector = [1, 0, 0];
  const entries = [
    { embedding: [0.9, 0.1, 0], name: 'A' },
    { embedding: [0, 1, 0], name: 'B' },
    { embedding: [1, 0, 0], name: 'C' }
  ];

  const result = SimilarityUtil.findMostSimilar(queryVector, entries);

  assert(result !== null, "Should find a match");
  assertEqual(result.entry.name, 'C', "Should find exact match");
  assert(Math.abs(result.similarity - 1.0) < 0.0001, "Similarity should be 1.0");
}

// === Registry Manager Tests ===

async function testRegistryInitialization() {
  const testRegistryPath = path.join(__dirname, '../data/test-registry-temp.json');
  
  // Clean up if exists
  try {
    await fs.unlink(testRegistryPath);
  } catch (e) {}

  const registry = new TestRegistryManager(testRegistryPath);
  await registry.initialize();

  assert(registry.loaded, "Registry should be loaded");
  assertEqual(registry.getAllEntries().length, 0, "New registry should be empty");

  // Clean up
  await fs.unlink(testRegistryPath);
}

async function testRegistryAddEntry() {
  const testRegistryPath = path.join(__dirname, '../data/test-registry-temp2.json');
  
  try {
    await fs.unlink(testRegistryPath);
  } catch (e) {}

  const registry = new TestRegistryManager(testRegistryPath);
  await registry.initialize();

  const entry = await registry.addEntry({
    hash: 'abc123',
    embedding: [1, 2, 3],
    className: 'TestClass',
    filePath: '/path/to/test'
  });

  assert(entry.createdAt, "Entry should have timestamp");
  assertEqual(registry.getAllEntries().length, 1, "Registry should have 1 entry");

  // Clean up
  await fs.unlink(testRegistryPath);
}

async function testRegistryFindByHash() {
  const testRegistryPath = path.join(__dirname, '../data/test-registry-temp3.json');
  
  try {
    await fs.unlink(testRegistryPath);
  } catch (e) {}

  const registry = new TestRegistryManager(testRegistryPath);
  await registry.initialize();

  await registry.addEntry({
    hash: 'hash123',
    embedding: [1, 2, 3],
    className: 'TestClass',
    filePath: '/path/to/test'
  });

  const found = registry.findByHash('hash123');
  assert(found !== null, "Should find entry by hash");
  assertEqual(found.className, 'TestClass', "Should return correct entry");

  const notFound = registry.findByHash('nonexistent');
  assertEqual(notFound, null, "Should return null for nonexistent hash");

  // Clean up
  await fs.unlink(testRegistryPath);
}

// === Request Handler Tests ===

async function testRequestHandlerInitialization() {
  const handler = new TestRequestHandler();
  await handler.initialize();

  assert(handler.initialized, "Handler should be initialized");
  
  const stats = handler.getStats();
  assert(stats.loaded, "Registry should be loaded");
}

// === Run All Tests ===

async function runAllTests() {
  console.log('\n=== Running Prompt Validation Tests ===\n');

  console.log('Hash Utility Tests:');
  await runTest('Hash normalization', testHashNormalization);
  await runTest('Hash determinism', testHashDeterminism);
  await runTest('Hash verification', testHashVerification);

  console.log('\nEmbedding Utility Tests:');
  await runTest('Fallback embedding generation', testFallbackEmbedding);
  await runTest('Embedding normalization', testEmbeddingNormalization);

  console.log('\nSimilarity Utility Tests:');
  await runTest('Cosine similarity - identical', testCosineSimilarityIdentical);
  await runTest('Cosine similarity - orthogonal', testCosineSimilarityOrthogonal);
  await runTest('Cosine similarity - opposite', testCosineSimilarityOpposite);
  await runTest('Find most similar', testFindMostSimilar);

  console.log('\nRegistry Manager Tests:');
  await runTest('Registry initialization', testRegistryInitialization);
  await runTest('Registry add entry', testRegistryAddEntry);
  await runTest('Registry find by hash', testRegistryFindByHash);

  console.log('\nRequest Handler Tests:');
  await runTest('Request handler initialization', testRequestHandlerInitialization);

  console.log('\n=== Test Summary ===');
  console.log(`Total: ${testsRun}`);
  console.log(`Passed: ${testsPassed} ✓`);
  console.log(`Failed: ${testsFailed} ✗`);

  if (testsFailed > 0) {
    process.exit(1);
  }
}

runAllTests().catch(error => {
  console.error('Test suite error:', error);
  process.exit(1);
});
