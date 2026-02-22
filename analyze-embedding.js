const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'prompt validation', 'backend', 'data', 'test-registry-backup-20260126-230002.json');

try {
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  
  console.log('Total entries:', data.length);
  console.log('\nAnalyzing first entry embedding:');
  
  const firstEntry = data[0];
  const embedding = firstEntry.embedding;
  
  console.log('Embedding length:', embedding.length);
  console.log('ClassName:', firstEntry.className);
  console.log('Hash:', firstEntry.hash);
  
  // Check for repetition patterns
  console.log('\n=== Checking for repetition patterns ===');
  
  // Try different pattern sizes
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
      console.log(`✓ Pattern found: ${patternSize} values repeat ${repeatCount} times = ${patternSize * repeatCount} total dimensions`);
      console.log(`First 10 values of pattern:`, firstChunk.slice(0, 10));
      break;
    }
  }
  
  // Show first and last 10 values
  console.log('\nFirst 10 values:', embedding.slice(0, 10));
  console.log('Last 10 values:', embedding.slice(-10));
  
  // Analyze all entries
  console.log('\n=== All entries ===');
  data.forEach((entry, idx) => {
    console.log(`Entry ${idx + 1}: ${entry.className}, embedding length: ${entry.embedding.length}`);
  });
  
} catch (error) {
  console.error('Error:', error.message);
}
