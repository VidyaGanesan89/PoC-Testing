const PromptBuilder = require('./services/promptBuilder');
const AITestGenerator = require('./services/aiTestGenerator');
const ClaudeAgentGenerator = require('./services/claudeAgentGenerator');

// Simulate the exact flow from UI
const userPrompt = `1. Launch the Url - https://parcelpro3.ams1907.com
2. In the home page hover-on About and click on offices
3. after navigating to offices page - https://parcelpro3.ams1907.com/us/en/about-us/offices.html
4. click on United Status near select country and select Germany
consinder LanguageSelectTestPage.java as base present in path: FINAL_AI\\FINAL FUNCTIONAL TEST Using UPS MCP\\src\\test\\java\\pageobjects to generate script`;

console.log('='.repeat(80));
console.log('SIMULATING FULL UI -> BACKEND FLOW');
console.log('='.repeat(80));

console.log('\n1. USER PROMPT (from UI):');
console.log(userPrompt);

// Step 1: Build structured prompt (what backend does)
console.log('\n2. BUILDING STRUCTURED PROMPT...');
const promptBuilder = new PromptBuilder();
const testName = promptBuilder.generateTestName(userPrompt);
console.log('   Generated test name:', testName);
console.log('   ✅ Should be: OfficesCountrySelectTest');
console.log('   Match:', testName === 'OfficesCountrySelectTest' ? '✅ PASS' : '❌ FAIL');

const structuredPrompt = promptBuilder.buildPrompt(userPrompt, 'functional');
console.log('   Structured prompt length:', structuredPrompt.length);

// Check what class name is in the structured prompt
const classNameInPrompt = structuredPrompt.match(/class name.*?MUST be:\s*(\w+)/i);
console.log('   Class name in structured prompt:', classNameInPrompt ? classNameInPrompt[1] : 'NOT FOUND');

// Step 2: Extract class name (what generator does)
console.log('\n3. EXTRACTING CLASS NAME FROM STRUCTURED PROMPT...');
const aiGenerator = new AITestGenerator({ llmClient: null });
const extractedClassName = aiGenerator._extractClassNameFromPrompt(structuredPrompt);
console.log('   Extracted class name:', extractedClassName);
console.log('   ✅ Should be: OfficesCountrySelectTest');
console.log('   Match:', extractedClassName === 'OfficesCountrySelectTest' ? '✅ PASS' : '❌ FAIL');

// Step 3: Check Claude Agent Generator too
console.log('\n4. CHECKING CLAUDE AGENT GENERATOR...');
const claudeAgent = new ClaudeAgentGenerator();
const claudeClassName = claudeAgent._extractClassName(structuredPrompt);
console.log('   Extracted class name:', claudeClassName);
console.log('   ✅ Should be: OfficesCountrySelectTest');
console.log('   Match:', claudeClassName === 'OfficesCountrySelectTest' ? '✅ PASS' : '❌ FAIL');

console.log('\n' + '='.repeat(80));
console.log('CONCLUSION:');
console.log('='.repeat(80));
if (testName === 'OfficesCountrySelectTest' && 
    extractedClassName === 'OfficesCountrySelectTest' && 
    claudeClassName === 'OfficesCountrySelectTest') {
  console.log('✅ ALL CHECKS PASS - Logic is correct!');
  console.log('If UI still shows LanguageSelectTest, the issue is:');
  console.log('  1. Backend server not using new code (Node.js module cache)');
  console.log('  2. Browser cache');
  console.log('  3. Different code path being used');
} else {
  console.log('❌ LOGIC ERROR - Fix the extraction logic');
}
console.log('='.repeat(80));
