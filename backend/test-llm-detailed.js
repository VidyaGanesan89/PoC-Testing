/**
 * Detailed LLM API Connection Test
 * Shows exact error details for debugging
 */

const claudeConfig = require('./config/claude');

async function detailedTest() {
  console.log('\n========================================');
  console.log('🔍 DETAILED LLM API DIAGNOSTICS');
  console.log('========================================\n');

  console.log('1. OpenAI Client Info:');
  console.log(`   - Client exists: ${!!claudeConfig.openai}`);
  console.log(`   - Client type: ${claudeConfig.openai?.constructor?.name || 'unknown'}`);
  
  // Check API key
  const apiKey = process.env.OPENAI_API_KEY || claudeConfig.openai?.apiKey;
  if (apiKey) {
    const keyPreview = apiKey.substring(0, 7) + '...' + apiKey.substring(apiKey.length - 4);
    console.log(`   - API Key: ${keyPreview}`);
  } else {
    console.log('   - API Key: ❌ NOT FOUND');
  }

  console.log('\n2. Testing API Call:');
  console.log('   Making request to OpenAI...\n');

  try {
    const response = await claudeConfig.openai.chat.completions.create({
      model: 'gpt-3.5-turbo',  // Using GPT-3.5-turbo (available on free tier)
      max_tokens: 50,
      messages: [
        { role: 'user', content: 'Reply with just: "API works"' }
      ]
    });

    console.log('   ✅ SUCCESS!');
    console.log(`   - Response: ${response.choices[0].message.content}`);
    console.log(`   - Model used: ${response.model}`);
    console.log('\n✅ LLM API IS WORKING - Your backend will generate clean code!\n');
    
  } catch (error) {
    console.log('   ❌ FAILED!');
    console.log(`   - Error Type: ${error.constructor.name}`);
    console.log(`   - Error Message: ${error.message}`);
    
    if (error.status) {
      console.log(`   - HTTP Status: ${error.status}`);
    }
    
    if (error.code) {
      console.log(`   - Error Code: ${error.code}`);
    }

    if (error.response) {
      console.log(`   - Response: ${JSON.stringify(error.response, null, 2)}`);
    }

    console.log('\n❌ LLM API NOT WORKING - Need to fix this!\n');
    console.log('Common fixes:');
    console.log('1. Check if API key is valid at: https://platform.openai.com/api-keys');
    console.log('2. Verify you have credits: https://platform.openai.com/usage');
    console.log('3. Check network/firewall settings');
    console.log('4. Try updating OpenAI package: npm update openai\n');
    
    // Print full error for debugging
    console.log('Full error details:');
    console.error(error);
  }

  console.log('========================================\n');
}

detailedTest().catch(err => {
  console.error('Unexpected error:', err);
  process.exit(1);
});
