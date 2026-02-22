/**
 * Test if Azure OpenAI is being used in the generation endpoint
 */

const AITestGenerator = require('./services/aiTestGenerator');
const claudeConfig = require('./config/claude');

console.log('\n🔍 CHECKING AI GENERATOR CONFIGURATION\n');

console.log('1. Check if claudeConfig is configured:');
console.log('   isConfigured():', claudeConfig.isConfigured());
console.log('   hasOpenAI client:', !!claudeConfig.openai);

if (claudeConfig.openai) {
  console.log('   OpenAI client type:', claudeConfig.openai.constructor.name);
  console.log('   Has chat API:', !!claudeConfig.openai.chat);
  console.log('   Has completions:', !!claudeConfig.openai.chat?.completions);
}

console.log('\n2. Creating AITestGenerator instance:');
try {
  const aiGenerator = new AITestGenerator({
    llmClient: claudeConfig.openai,
    mcpAvailable: true
  });
  console.log('   ✅ AITestGenerator created successfully');
  
  console.log('\n3. Testing code generation:');
  
  const testPrompt = 'Create a simple Selenium test that opens google.com and searches for "test"';
  
  aiGenerator.generateTestCode(testPrompt, 'functional')
    .then(result => {
      console.log('\n   ✅ Generation successful!');
      console.log('   Has testContent:', !!result.testContent);
      console.log('   Test content length:', result.testContent?.length || 0);
      console.log('   First 200 chars:', result.testContent?.substring(0, 200));
      
      // Check if it's fallback template
      const isFallback = result.testContent?.includes('AI generation failed - using fallback template');
      console.log('   Is fallback template:', isFallback);
      
      if (isFallback) {
        console.log('\n   ❌ PROBLEM: Still using fallback template!');
      } else {
        console.log('\n   ✅ SUCCESS: Real AI-generated code!');
      }
    })
    .catch(error => {
      console.log('\n   ❌ Generation failed:');
      console.log('   Error:', error.message);
      console.log('   Stack:', error.stack);
    });
  
} catch (error) {
  console.log('   ❌ Failed to create AITestGenerator:', error.message);
}
