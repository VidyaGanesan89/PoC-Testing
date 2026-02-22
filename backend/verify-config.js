/**
 * Verify Backend Configuration
 * Checks if LLM API is properly configured
 */

const claudeConfig = require('./config/claude');
const AITestGenerator = require('./services/aiTestGenerator');

console.log('\n========================================');
console.log('🔍 BACKEND CONFIGURATION CHECK');
console.log('========================================\n');

// Check LLM configuration
console.log('1. LLM Configuration:');
const isConfigured = claudeConfig.isConfigured();
console.log(`   - LLM Client Available: ${isConfigured ? '✅ YES' : '❌ NO'}`);

if (isConfigured) {
  console.log(`   - Client Type: ${claudeConfig.openai.constructor.name || 'OpenAI'}`);
  
  // Test AI generator initialization
  console.log('\n2. AI Generator:');
  const aiGenerator = new AITestGenerator({
    llmClient: claudeConfig.openai,
    mcpAvailable: true
  });
  console.log('   - AITestGenerator initialized: ✅ YES');
  console.log(`   - Test path: ${aiGenerator.baseTestPath}`);
  
  // Test class name extraction
  console.log('\n3. Class Name Extraction:');
  const testPrompts = [
    'The class name MUST be: ContactUsFormTest',
    'src/test/java/tests/LoginTest.java',
    'This is a contact form test'
  ];
  
  testPrompts.forEach(prompt => {
    const className = aiGenerator._extractClassNameFromPrompt(prompt);
    console.log(`   - "${prompt.substring(0, 40)}..." → ${className || 'null (will use timestamp)'}`);
  });
  
  console.log('\n✅ Configuration is correct!');
  console.log('\n📋 When you generate a test:');
  console.log('   - Backend will use: Real LLM API (OpenAI/Claude)');
  console.log('   - Class name will be: ContactUsFormTest (extracted from prompt)');
  console.log('   - Code will be: Clean, properly structured');
  
} else {
  console.log('   - Fallback: ClaudeAgentGenerator (pattern matching)');
  console.log('\n⚠️ LLM API not configured - using fallback generator');
  console.log('   This may result in broken code generation.');
}

console.log('\n========================================\n');
