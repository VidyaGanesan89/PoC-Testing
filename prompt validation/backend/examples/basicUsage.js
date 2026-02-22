/**
 * Basic Usage Example
 * Demonstrates core functionality of the prompt validation system
 */

const { initializePromptValidation } = require('../index');

async function main() {
  console.log('=== Prompt Validation System - Basic Example ===\n');

  // Step 1: Initialize
  console.log('1. Initializing system...');
  const handler = await initializePromptValidation({
    // No test generator/executor for this example
    testGenerator: null,
    testExecutor: null
  });
  console.log('✓ System initialized\n');

  // Step 2: First request (will generate new test)
  console.log('2. Processing first request...');
  const result1 = await handler.processTestRequest({
    prompt: "Test login functionality with valid credentials",
    testType: "functional",
    browser: "chrome"
  });
  
  console.log('Result 1:');
  console.log('  - Reused:', result1.reused);
  console.log('  - Class:', result1.className);
  console.log('  - Hash:', result1.hash.substring(0, 16) + '...');
  console.log('');

  // Step 3: Exact duplicate (will reuse)
  console.log('3. Processing exact duplicate...');
  const result2 = await handler.processTestRequest({
    prompt: "Test login functionality with valid credentials",
    testType: "functional",
    browser: "chrome"
  });
  
  console.log('Result 2:');
  console.log('  - Reused:', result2.reused);
  console.log('  - Same class?', result2.className === result1.className);
  console.log('');

  // Step 4: Similar request (may reuse based on similarity)
  console.log('4. Processing similar request...');
  const result3 = await handler.processTestRequest({
    prompt: "Verify login feature works with correct username and password",
    testType: "functional",
    browser: "chrome"
  });
  
  console.log('Result 3:');
  console.log('  - Reused:', result3.reused);
  console.log('  - Class:', result3.className);
  console.log('');

  // Step 5: Different request (will generate new)
  console.log('5. Processing different request...');
  const result4 = await handler.processTestRequest({
    prompt: "Test user registration form validation",
    testType: "functional",
    browser: "chrome"
  });
  
  console.log('Result 4:');
  console.log('  - Reused:', result4.reused);
  console.log('  - Class:', result4.className);
  console.log('');

  // Step 6: Registry statistics
  console.log('6. Registry statistics:');
  const stats = handler.getStats();
  console.log('  - Total entries:', stats.totalEntries);
  console.log('  - Registry path:', stats.registryPath);
  console.log('');

  console.log('=== Example Complete ===');
}

// Run example
main().catch(error => {
  console.error('Error:', error);
  process.exit(1);
});
