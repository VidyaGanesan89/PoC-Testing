/**
 * Test Azure OpenAI Connection
 */

const openaiConfig = require('../RAG_ViewHistory/backend/config/openai');

async function testAzureOpenAI() {
  console.log('\n🔵 TESTING AZURE OPENAI CONNECTION\n');
  console.log('========================================');
  
  try {
    console.log('📡 Endpoint: https://diarymilk-5.openai.azure.com');
    console.log('📦 Deployment: gpt-4o');
    console.log('🔑 API Key: ' + '***' + openaiConfig.openai.apiKey.slice(-10));
    console.log('');
    
    console.log('⏳ Sending test request to Azure OpenAI...\n');
    
    // For Azure OpenAI with deployment in baseURL, use the actual model name
    const response = await openaiConfig.openai.chat.completions.create({
      model: 'gpt-4o',  // Actual model name (deployment already in baseURL)
      max_tokens: 100,
      messages: [
        { 
          role: 'system', 
          content: 'You are a helpful assistant that generates Java Selenium test code.' 
        },
        { 
          role: 'user', 
          content: 'Say "Hello! Azure OpenAI GlobalStandard is working!" and nothing else.' 
        }
      ]
    });
    
    console.log('✅ SUCCESS! Azure OpenAI is working!\n');
    console.log('Response:', response.choices[0].message.content);
    console.log('\n========================================');
    console.log('✅ Azure OpenAI Configuration: VALID');
    console.log('✅ API Connection: WORKING');
    console.log('✅ Model Deployment: ACCESSIBLE');
    console.log('========================================\n');
    
    return true;
  } catch (error) {
    console.log('\n❌ FAILED! Azure OpenAI Error:\n');
    console.log('Error Type:', error.constructor.name);
    console.log('Error Message:', error.message);
    console.log('Full Error:', JSON.stringify(error, null, 2));
    
    if (error.response) {
      console.log('\nAPI Response Status:', error.response.status);
      console.log('API Response Data:', JSON.stringify(error.response.data, null, 2));
    }
    
    if (error.code) {
      console.log('Error Code:', error.code);
    }
    
    console.log('\n========================================');
    console.log('❌ Azure OpenAI Configuration: INVALID');
    console.log('========================================\n');
    
    console.log('💡 TROUBLESHOOTING:');
    console.log('1. Verify endpoint URL is correct');
    console.log('2. Check API key is valid and not expired');
    console.log('3. Ensure deployment name "Diarymilk-5" exists');
    console.log('4. Verify Azure subscription has credits');
    console.log('5. Check network/firewall settings\n');
    
    return false;
  }
}

// Run test
testAzureOpenAI()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(err => {
    console.error('Unexpected error:', err);
    process.exit(1);
  });
