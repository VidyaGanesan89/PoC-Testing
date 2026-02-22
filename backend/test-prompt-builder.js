/**
 * Test script to verify PromptBuilder transforms prompts correctly
 */

const PromptBuilder = require('./services/promptBuilder');

const promptBuilder = new PromptBuilder();

// Simulate user's raw prompt from UI
const rawPrompt = `URL: https://parcelpro3.ams1907.com

Steps:
1. Launch URL https://parcelpro3.ams1907.com
2. Click "Contact Us" link on the home page
3. Verify navigation to: https://parcelpro3.ams1907.com/contactUs
4. Fill "First Name" with value: Vidya
5. Fill "Last Name" with value: Ganesan
6. Fill "Company" with value: Automation
7. Fill "Phone Number" with value: 1234567890
8. Fill "Email" with value: vidya@automation.com
9. Fill "Comments" with value: Automated Test
10. Select radio button "Option 1"
11. Select from dropdown "Category" the value: "Support"
12. Click "Submit" button
13. Verify confirmation message: "Thank you for contacting us!"`;

console.log('='.repeat(80));
console.log('TESTING PROMPT BUILDER');
console.log('='.repeat(80));

console.log('\n📝 ORIGINAL PROMPT (from UI):');
console.log('-'.repeat(80));
console.log(rawPrompt);
console.log('-'.repeat(80));
console.log(`Length: ${rawPrompt.length} characters\n`);

const structuredPrompt = promptBuilder.buildPrompt(rawPrompt, 'functional');

console.log('\n📋 STRUCTURED PROMPT (transformed):');
console.log('-'.repeat(80));
console.log(structuredPrompt);
console.log('-'.repeat(80));
console.log(`Length: ${structuredPrompt.length} characters\n`);

console.log('\n✅ KEY CHECKS:');
console.log('-'.repeat(80));
console.log('✓ URL extracted:', promptBuilder.extractUrl(rawPrompt));
console.log('✓ Test name:', promptBuilder.generateTestName(rawPrompt));
console.log('✓ Steps extracted:', promptBuilder.extractSteps(rawPrompt).length, 'steps');
console.log('\nExtracted steps:');
promptBuilder.extractSteps(rawPrompt).forEach((step, i) => {
  console.log(`  ${i + 1}. ${step}`);
});
console.log('-'.repeat(80));

console.log('\n🎯 EXPECTED OUTCOMES:');
console.log('- Class name should be: ContactUsFormTest');
console.log('- Should include all coding rules and constraints');
console.log('- Should include locator strategy');
console.log('- Should NOT have timestamps in class name');
console.log('- Prompt should be much longer (detailed rules added)');

const hasContactUsName = structuredPrompt.includes('ContactUsFormTest');
const hasLocatorRules = structuredPrompt.includes('LOCATOR STRATEGY');
const hasCodingRules = structuredPrompt.includes('CODING RULES');
const hasNoTimestamp = !structuredPrompt.includes('GeneratedTest_');

console.log('\n✅ VALIDATION:');
console.log('- ContactUsFormTest name:', hasContactUsName ? '✅ PASS' : '❌ FAIL');
console.log('- Locator rules:', hasLocatorRules ? '✅ PASS' : '❌ FAIL');
console.log('- Coding rules:', hasCodingRules ? '✅ PASS' : '❌ FAIL');
console.log('- No timestamp:', hasNoTimestamp ? '✅ PASS' : '❌ FAIL');

if (hasContactUsName && hasLocatorRules && hasCodingRules && hasNoTimestamp) {
  console.log('\n🎉 ALL CHECKS PASSED! PromptBuilder is working correctly.');
} else {
  console.log('\n⚠️ Some checks failed. Review the structured prompt above.');
}
