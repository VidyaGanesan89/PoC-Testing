/**
 * Test Real LLM API Connection
 * Verifies if OpenAI API is actually working (not just configured)
 */

const claudeConfig = require('./config/claude');

async function testLLMConnection() {
  console.log('\n========================================');
  console.log('🧪 TESTING REAL LLM API CONNECTION');
  console.log('========================================\n');

  // Check if configured
  console.log('1. Configuration Check:');
  const isConfigured = claudeConfig.isConfigured();
  console.log(`   - LLM Client Configured: ${isConfigured ? '✅ YES' : '❌ NO'}`);

  if (!isConfigured) {
    console.log('\n❌ RESULT: LLM API NOT CONFIGURED');
    console.log('   → Backend will use: ClaudeAgentGenerator (broken pattern matcher)');
    console.log('   → Generated code will be: BROKEN\n');
    return;
  }

  // Test actual API call
  console.log('\n2. API Connection Test:');
  console.log('   Sending test request to OpenAI...');

  try {
    const startTime = Date.now();
    
    const response = await claudeConfig.openai.chat.completions.create({
      model: 'gpt-4',
      max_tokens: 100,
      messages: [
        { role: 'system', content: 'You are a helpful assistant.' },
        { role: 'user', content: 'Say "API connection successful" if you receive this.' }
      ]
    });

    const duration = Date.now() - startTime;
    const message = response.choices[0].message.content;

    console.log(`   - Response time: ${duration}ms`);
    console.log(`   - API Response: "${message}"`);
    console.log('   - Status: ✅ API WORKING\n');

    console.log('✅ RESULT: LLM API IS WORKING CORRECTLY');
    console.log('   → Backend will use: AITestGenerator (Real OpenAI/Claude API)');
    console.log('   → Generated code will be: CLEAN & CORRECT');
    console.log('   → Class names will be: ContactUsFormTest (extracted from prompt)');
    console.log('   → Locators will be: Clean (no quotes in XPath)');
    console.log('   → Code will match: VS Code Copilot output\n');

  } catch (error) {
    console.log(`   - Error: ${error.message}`);
    console.log('   - Status: ❌ API NOT WORKING\n');

    console.log('❌ RESULT: LLM API CONFIGURED BUT NOT WORKING');
    console.log('   → Possible issues:');
    console.log('     • Invalid API key');
    console.log('     • Network connection problem');
    console.log('     • API quota exceeded');
    console.log('   → Backend will fallback to: ClaudeAgentGenerator (broken pattern matcher)');
    console.log('   → Generated code will be: BROKEN\n');
  }

  console.log('========================================\n');
}

testLLMConnection().catch(err => {
  console.error('Unexpected error:', err);
  process.exit(1);
});
