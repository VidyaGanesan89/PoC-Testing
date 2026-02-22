const EmbeddingUtil = require('./prompt validation/backend/utils/embeddingUtil');

async function testEmbedding() {
  const embeddingUtil = new EmbeddingUtil();
  
  const testPrompt = "Create a test for the contact form submission with validation";
  
  console.log('Generating embedding for test prompt...');
  const embedding = embeddingUtil.generateFallbackEmbedding(testPrompt);
  
  console.log('Embedding length:', embedding.length);
  console.log('First 10 values:', embedding.slice(0, 10));
  console.log('Last 10 values:', embedding.slice(-10));
  
  // Check for repetition patterns
  console.log('\n=== Checking for repetition patterns ===');
  
  let foundRepetition = false;
  for (let patternSize of [16, 32, 64, 128]) {
    const firstChunk = embedding.slice(0, patternSize);
    let isRepeating = true;
    let repeatCount = 0;
    
    for (let i = 0; i < embedding.length; i += patternSize) {
      const chunk = embedding.slice(i, i + patternSize);
      if (chunk.length < patternSize) break;
      
      repeatCount++;
      for (let j = 0; j < patternSize; j++) {
        if (Math.abs(firstChunk[j] - chunk[j]) > 0.0000001) {
          isRepeating = false;
          break;
        }
      }
      if (!isRepeating) break;
    }
    
    if (isRepeating && repeatCount > 1) {
      console.log(`❌ REPETITION FOUND: ${patternSize} values repeat ${repeatCount} times`);
      foundRepetition = true;
      break;
    }
  }
  
  if (!foundRepetition) {
    console.log('✓ No repetition patterns detected - embedding is correctly distributed!');
  }
  
  // Calculate unique values (with small tolerance for floating point)
  const uniqueGroups = new Set();
  embedding.forEach(val => {
    const rounded = Math.round(val * 1000000) / 1000000;
    uniqueGroups.add(rounded);
  });
  
  console.log(`\nUnique values: ${uniqueGroups.size} out of ${embedding.length}`);
  console.log(`Uniqueness ratio: ${(uniqueGroups.size / embedding.length * 100).toFixed(2)}%`);
  
  // Check L2 normalization
  const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
  console.log(`\nVector magnitude (should be ~1.0): ${magnitude.toFixed(6)}`);
  
  // Value range check
  const min = Math.min(...embedding);
  const max = Math.max(...embedding);
  console.log(`Value range: ${min.toFixed(6)} to ${max.toFixed(6)}`);
}

testEmbedding().catch(console.error);
