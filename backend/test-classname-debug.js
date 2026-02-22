const AITestGenerator = require('./services/aiTestGenerator');
const PromptBuilder = require('./services/promptBuilder');
const ClaudeAgentGenerator = require('./services/claudeAgentGenerator');

// Test prompt from UI (as shown in screenshot)
const userPrompt = `1. Launch the Url - https://parcelpro3.ams1907.com
2. In the home page hover-on About and click on offices
3. after navigating to offices page - https://parcelpro3.ams1907.com/us/en/about-us/offices.html
4. click on United Status near select country and select Germany
consinder LanguageSelectTestPage.java as base present in path: FINAL_AI\\FINAL FUNCTIONAL TEST Using UPS MCP\\src\\test\\java\\pageobjects to generate script`;

console.log('='.repeat(80));
console.log('TESTING CLASS NAME EXTRACTION');
console.log('='.repeat(80));
console.log('\nUSER PROMPT:');
console.log(userPrompt);
console.log('\n' + '='.repeat(80));

// Test 1: PromptBuilder
const promptBuilder = new PromptBuilder();
const testName1 = promptBuilder.generateTestName(userPrompt);
console.log('\n1. PromptBuilder.generateTestName():');
console.log('   Result:', testName1);
console.log('   Expected: OfficesCountrySelectTest');
console.log('   Match:', testName1 === 'OfficesCountrySelectTest' ? '✅ PASS' : '❌ FAIL');

// Test 2: AITestGenerator
const aiGenerator = new AITestGenerator({ llmClient: null });
const className2 = aiGenerator._extractClassNameFromPrompt(userPrompt);
console.log('\n2. AITestGenerator._extractClassNameFromPrompt():');
console.log('   Result:', className2 || 'null (will use timestamp)');
console.log('   Expected: OfficesCountrySelectTest');
console.log('   Match:', className2 === 'OfficesCountrySelectTest' ? '✅ PASS' : '❌ FAIL');

// Test 3: ClaudeAgentGenerator
const claudeAgent = new ClaudeAgentGenerator();
const className3 = claudeAgent._extractClassName(userPrompt);
console.log('\n3. ClaudeAgentGenerator._extractClassName():');
console.log('   Result:', className3);
console.log('   Expected: OfficesCountrySelectTest');
console.log('   Match:', className3 === 'OfficesCountrySelectTest' ? '✅ PASS' : '❌ FAIL');

// Debug: Check what the prompt contains
console.log('\n' + '='.repeat(80));
console.log('DEBUG: Prompt analysis');
console.log('='.repeat(80));
const lower = userPrompt.toLowerCase();
console.log('Contains "office":', lower.includes('office'));
console.log('Contains "language":', lower.includes('language'));
console.log('Contains "contact":', lower.includes('contact'));
console.log('Contains "country selector":', lower.includes('country selector'));

console.log('\n' + '='.repeat(80));
console.log('TEST COMPLETE');
console.log('='.repeat(80));
