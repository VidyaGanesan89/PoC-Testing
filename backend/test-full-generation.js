/**
 * Comprehensive Azure OpenAI Generation Test
 * This simulates the full generation flow to see where it fails
 */

const fs = require('fs').promises;
const path = require('path');
const AITestGenerator = require('./services/aiTestGenerator');
const claudeConfig = require('./config/claude');
const PromptBuilder = require('./services/promptBuilder');

const LOG_FILE = path.join(__dirname, 'azure-openai-debug.log');

async function log(message) {
  const timestamp = new Date().toISOString();
  const logLine = `[${timestamp}] ${message}\n`;
  console.log(message);
  await fs.appendFile(LOG_FILE, logLine);
}

async function runFullTest() {
  try {
    // Clear previous log
    await fs.writeFile(LOG_FILE, '='.repeat(80) + '\n');
    await fs.appendFile(LOG_FILE, 'AZURE OPENAI FULL GENERATION TEST\n');
    await fs.appendFile(LOG_FILE, '='.repeat(80) + '\n\n');
    
    await log('1. Checking configuration...');
    await log(`   isConfigured: ${claudeConfig.isConfigured()}`);
    await log(`   Has OpenAI client: ${!!claudeConfig.openai}`);
    
    if (!claudeConfig.isConfigured()) {
      await log('❌ Configuration failed!');
      return;
    }
    
    await log('   ✅ Configuration OK\n');
    
    await log('2. Creating AITestGenerator...');
    const aiGen = new AITestGenerator({
      llmClient: claudeConfig.openai,
      mcpAvailable: true
    });
    await log('   ✅ AITestGenerator created\n');
    
    await log('3. Building test prompt...');
    const promptBuilder = new PromptBuilder();
    const userPrompt = 'Create a simple Selenium test that opens https://parcelpro3.ams1907.com and clicks Contact Us link';
    const structuredPrompt = promptBuilder.buildPrompt(userPrompt, 'functional');
    await log(`   User prompt length: ${userPrompt.length}`);
    await log(`   Structured prompt length: ${structuredPrompt.length}\n`);
    
    await log('4. Calling aiGen.generateTest()...');
    const startTime = Date.now();
    
    const result = await aiGen.generateTest({
      prompt: structuredPrompt,
      testType: 'functional',
      llm: 'GPT-4o'
    });
    
    const duration = Date.now() - startTime;
    await log(`   ✅ Generation completed in ${duration}ms\n`);
    
    await log('5. Analyzing result...');
    await log(`   className: ${result.className}`);
    await log(`   testFileName: ${result.testFileName}`);
    await log(`   testContent length: ${result.testContent?.length || 0}`);
    await log(`   pageObjectContent length: ${result.pageObjectContent?.length || 0}\n`);
    
    await log('6. Checking if fallback template was used...');
    const isFallback = result.testContent?.includes('AI generation failed - using fallback template');
    const hasRealCode = result.testContent?.includes('WebDriverWait') || 
                        result.testContent?.includes('ExpectedConditions');
    
    await log(`   Is fallback template: ${isFallback}`);
    await log(`   Has real Selenium code: ${hasRealCode}\n`);
    
    if (isFallback) {
      await log('❌ PROBLEM: Still using fallback template!');
      await log('   This means Azure OpenAI failed during generation');
      await log('   Check backend logs for error details\n');
    } else if (hasRealCode) {
      await log('✅ SUCCESS: Real AI-generated code!');
      await log('   Azure OpenAI is working correctly\n');
    } else {
      await log('⚠️  UNKNOWN: Code generated but unclear if from AI or fallback\n');
    }
    
    await log('7. Sample of generated code (first 500 chars):');
    await log('---------------------------------------------------');
    await log(result.testContent.substring(0, 500));
    await log('---------------------------------------------------\n');
    
    await log('='.repeat(80));
    await log('TEST COMPLETE');
    await log('='.repeat(80));
    await log(`\nFull log saved to: ${LOG_FILE}`);
    
  } catch (error) {
    await log('\n❌ ERROR OCCURRED:');
    await log(`   Type: ${error.constructor.name}`);
    await log(`   Message: ${error.message}`);
    await log(`   Stack: ${error.stack}`);
  }
}

runFullTest();
