const EmbeddingUtil = require('./prompt validation/backend/utils/embeddingUtil');
const HashUtil = require('./prompt validation/backend/utils/hashUtil');

console.log('='.repeat(60));
console.log('📝 EMBEDDING GENERATION DEMONSTRATION');
console.log('='.repeat(60));

const examplePrompt = "test login functionality with email and password";

console.log('\n1️⃣  USER PROMPT:');
console.log(`   "${examplePrompt}"`);

console.log('\n2️⃣  HASH GENERATION (SHA-256):');
const hash = HashUtil.generateHash(examplePrompt);
console.log(`   ${hash}`);
console.log('   Purpose: Exact duplicate detection');

console.log('\n3️⃣  EMBEDDING GENERATION:');
const embeddingUtil = new EmbeddingUtil();
const embedding = embeddingUtil.generateFallbackEmbedding(examplePrompt);

console.log(`   Dimensions: ${embedding.length}`);
console.log(`   Type: ${Array.isArray(embedding) ? 'Array of numbers' : typeof embedding}`);
console.log(`   First 10 values: [${embedding.slice(0, 10).map(v => v.toFixed(4)).join(', ')}]`);
console.log(`   Last 10 values: [${embedding.slice(-10).map(v => v.toFixed(4)).join(', ')}]`);

// Calculate statistics
const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
const min = Math.min(...embedding);
const max = Math.max(...embedding);
const avg = embedding.reduce((sum, val) => sum + val, 0) / embedding.length;

console.log('\n4️⃣  EMBEDDING STATISTICS:');
console.log(`   Magnitude (should be ~1.0): ${magnitude.toFixed(6)}`);
console.log(`   Min value: ${min.toFixed(6)}`);
console.log(`   Max value: ${max.toFixed(6)}`);
console.log(`   Average value: ${avg.toFixed(6)}`);
console.log(`   Range: ${min.toFixed(3)} to ${max.toFixed(3)}`);

// Check uniqueness
const uniqueValues = new Set(embedding.map(v => Math.round(v * 1000000) / 1000000));
console.log(`   Unique values: ${uniqueValues.size} / ${embedding.length} (${(uniqueValues.size/embedding.length*100).toFixed(1)}%)`);

console.log('\n5️⃣  HOW EMBEDDING IS USED:');
console.log('   ✓ Compare with stored embeddings in test-registry.json');
console.log('   ✓ Calculate cosine similarity (0.0 to 1.0)');
console.log('   ✓ If similarity > 50%, reuse existing test');
console.log('   ✓ If similarity < 50%, generate new test');
console.log('   ✓ Store new test with its embedding for future matching');

console.log('\n6️⃣  EXAMPLE SIMILARITY COMPARISON:');

// Generate embeddings for similar prompts
const prompt1 = "test login functionality";
const prompt2 = "verify user authentication";
const prompt3 = "test shopping cart checkout";

const emb1 = embeddingUtil.generateFallbackEmbedding(prompt1);
const emb2 = embeddingUtil.generateFallbackEmbedding(prompt2);
const emb3 = embeddingUtil.generateFallbackEmbedding(prompt3);

// Calculate cosine similarity
function cosineSimilarity(vecA, vecB) {
  const dotProduct = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
  const magA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
  const magB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));
  return dotProduct / (magA * magB);
}

const sim1_2 = cosineSimilarity(emb1, emb2);
const sim1_3 = cosineSimilarity(emb1, emb3);

console.log(`\n   Prompt A: "${prompt1}"`);
console.log(`   Prompt B: "${prompt2}"`);
console.log(`   Similarity: ${(sim1_2 * 100).toFixed(2)}% ${sim1_2 > 0.5 ? '✓ REUSE' : '✗ NEW TEST'}`);

console.log(`\n   Prompt A: "${prompt1}"`);
console.log(`   Prompt C: "${prompt3}"`);
console.log(`   Similarity: ${(sim1_3 * 100).toFixed(2)}% ${sim1_3 > 0.5 ? '✓ REUSE' : '✗ NEW TEST'}`);

console.log('\n' + '='.repeat(60));
console.log('✅ EMBEDDING GENERATION COMPLETE');
console.log('='.repeat(60));
console.log('\nKey Points:');
console.log('• Each prompt becomes a 384-dimensional vector');
console.log('• Similar prompts have similar embeddings (high cosine similarity)');
console.log('• System uses this to avoid regenerating similar tests');
console.log('• Fixed version ensures all 384 values are unique (no repetition)');
console.log('');
