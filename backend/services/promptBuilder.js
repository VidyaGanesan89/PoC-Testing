/**
 * Prompt Builder Service
 * Converts user's simple test description into a complete, structured prompt
 * that ensures consistent code generation
 */

class PromptBuilder {
  isAzureBoardsWorkItemType(testType = 'functional') {
    const normalized = String(testType || '').toLowerCase();
    return normalized === 'performance'
      || normalized === 'azure-boards-work-item-management'
      || normalized.includes('work item management')
      || normalized.includes('azure boards');
  }

  /**
   * Build a complete structured prompt from user input
   * @param {string} userPrompt - Simple user description
   * @param {string} testType - Test type (functional, api, etc.)
   * @returns {string} - Formatted prompt with all rules and context
   */
  buildPrompt(userPrompt, testType = 'functional') {
    // Extract key information from user prompt
    const url = this.extractUrl(userPrompt);
    const steps = this.extractSteps(userPrompt);
    const testName = this.generateTestName(userPrompt);
    
    return this.formatFullPrompt(testName, url, steps, testType);
  }

  /**
   * Extract URL from user prompt
   */
  extractUrl(prompt) {
    const urlMatch = prompt.match(/https?:\/\/[^\s]+/);
    return urlMatch ? urlMatch[0] : 'https://parcelpro3.ams1907.com';
  }

  /**
   * Extract and normalize steps from user prompt
   */
  extractSteps(prompt) {
    const lines = prompt.split(/\n/).filter(l => l.trim());
    const steps = [];
    
    for (const line of lines) {
      const trimmed = line.trim();
      
      // Skip empty lines, headers, and non-step lines
      if (!trimmed || 
          trimmed.toLowerCase().includes('url:') ||
          trimmed.toLowerCase().includes('steps:') ||
          trimmed.toLowerCase().includes('test scenario') ||
          trimmed.toLowerCase().includes('====')) {
        continue;
      }
      
      // Extract numbered steps or treat as steps
      const numberMatch = trimmed.match(/^\d+\.?\s*(.+)/);
      if (numberMatch) {
        steps.push(numberMatch[1].trim());
      } else if (trimmed.length > 5) {
        // Non-numbered line that looks like a step
        steps.push(trimmed);
      }
    }
    
    return steps;
  }

  /**
   * Generate test class name from prompt
   */
  generateTestName(prompt) {
    // Extract meaningful name from prompt
    const lowerPrompt = prompt.toLowerCase();
    
    // Check offices FIRST before language (more specific)
    if (lowerPrompt.includes('office') || lowerPrompt.includes('country selector')) {
      return 'OfficesCountrySelectTest';
    }
    if (lowerPrompt.includes('contact')) {
      return 'ContactUsFormTest';
    }
    if (lowerPrompt.includes('login')) {
      return 'LoginTest';
    }
    if (lowerPrompt.includes('register') || lowerPrompt.includes('signup')) {
      return 'RegisterTest';
    }
    if (lowerPrompt.includes('checkout') || lowerPrompt.includes('cart')) {
      return 'CheckoutTest';
    }
    if (lowerPrompt.includes('language') || lowerPrompt.includes('locale')) {
      return 'LanguageSelectTest';
    }
    
    // Default name
    return 'WebTest';
  }

  /**
   * Format complete prompt with all rules and structure
   */
  formatFullPrompt(testName, url, steps, testType) {
    const azureBoardsMode = this.isAzureBoardsWorkItemType(testType);
    const azureBoardsInstructions = azureBoardsMode
      ? `
====================================================
AZURE BOARDS WORK ITEM MODE (MANDATORY)
====================================================
- Treat the input as requirements coming from an Azure DevOps work item.
- Map each acceptance criterion into explicit execution logic.
- Implement clear, numbered step logs in code (e.g., [STEP 1], [STEP 2], ...).
- For each step, include a concrete verification condition.
- Ensure final assertions validate business outcomes from acceptance criteria, not placeholder checks.
- Do NOT generate placeholder statements such as "future hook", "TODO", or always-true assertions.
`
      : '';

    return `You are a deterministic UPS Enterprise Selenium automation code generator.
You MUST generate CONSISTENT, STABLE Java Selenium test code
for the SAME prompt every time.

This is CRITICAL: the SAME prompt must NEVER generate a different
test structure, class name, or locator strategy.

====================================================
ABSOLUTE RULES (DO NOT VIOLATE)
====================================================
1. Generate EXACTLY TWO files: ONE Java TEST CLASS and ONE Java PAGE OBJECT CLASS.
2. The test class name and page object class name will be specified in the generation request.
   Use EXACTLY those names — DO NOT auto-generate timestamps or random names.

3. Test package MUST be: tests
   Page Object package MUST be: pageobjects

4. The TEST CLASS MUST:
   - extend UITestBase (import from testbase.UITestBase)
   - use TestNG @Test annotation
   - use common.Assert (NOT org.testng.Assert) for ALL assertions
   - use common.Reporter for step-level reporting with screenshots
   - use try-catch-finally inside the @Test method
   - call Reporter.startTestGroup() and Reporter.startTest() at the beginning
   - call Reporter.endTest() and Reporter.endTestGroup() in the finally block
   - NEVER override @BeforeMethod or @AfterMethod (UITestBase handles driver lifecycle)

5. REQUIRED IMPORTS FOR TEST CLASS (use ONLY imports you actually need):
   import org.testng.annotations.Test;
   import testbase.UITestBase;
   import common.Assert;
   import common.Reporter;
   import pageobjects.<EXACT_PAGE_OBJECT_CLASS_NAME>;
   import utility.Driver;
   // Add java.util.Properties + utility.Constants + utility.PropertyReader ONLY if reading a .properties file
   // Add org.openqa.selenium.* ONLY for classes directly referenced in the test

7. CRITICAL - Driver Lifecycle:
   - Driver.instance is initialized by UITestBase @BeforeMethod
   - Driver.instance is cleaned up by UITestBase @AfterMethod
   - Your test ONLY needs @Test method(s)
   - Create WebDriverWait INSIDE @Test method: new WebDriverWait(Driver.instance, Duration.ofSeconds(10))
   - DO NOT call Driver.quit() or Driver.close()
   - Use Driver.instance.manage().window().maximize() — NEVER setSize()

8. PAGE OBJECT CLASS MUST:
   - Use ALL static methods (no constructors, no instance creation)
   - Form input methods MUST return boolean (true=success, false=failure)
   - Navigation/action methods return void
   - Use private static final By for ALL locators at class top
   - Use WebDriverWait + ExpectedConditions inside EACH method
   - Use try-catch with debug logging in each method
   - Use ElementActions utility (from utility.ElementActions) for element interactions

9. DO NOT:
   - reference PageFactory
   - generate utility classes
   - change class name across runs
   - generate dynamic locators
   - introduce random waits or Thread.sleep
   - use org.testng.Assert (use common.Assert)
   - override @BeforeMethod or @AfterMethod

====================================================
UPS REPORTING PATTERN (MANDATORY)
====================================================
Every test MUST use common.Reporter for step-level HTML report with screenshots:

Reporter.startTestGroup("Test Suite Name");
Reporter.startTest("testMethodName", "Category", "Regression");
try {
    // After each significant step:
    Reporter.logInfo("Step Name", "Description", true);  // true = take screenshot
    Reporter.logPass("Step Name", "Success message", true);
    
    // On assertion pass (common.Assert auto-logs to Reporter):
    Assert.isTrue(condition, "Pass message");
    
} catch (Exception e) {
    Reporter.logFail("Failure", e.getMessage(), true);  // true = take screenshot
    Assert.fail("Test failed: " + e.getMessage());
} finally {
    Reporter.endTest();
    Reporter.endTestGroup();
}

====================================================
FRAMEWORK CONTEXT (LOCKED)
====================================================
- Java 11+
- Selenium WebDriver (latest)
- TestNG
- Driver lifecycle handled in UITestBase
- Reporting handled by common.Reporter (ExtentReports) — MUST integrate
- common.Assert wraps org.testng.Assert AND logs to Reporter automatically
- utility.ElementActions provides click, sendKeys, select utilities
- This test must run correctly under:
  - ups-selenium MCP
  - enhanced-selenium-mcp

====================================================
TEST SCENARIO (FIXED)
====================================================
URL: ${url}

Steps (DO NOT ADD OR REMOVE STEPS):
${steps.map((step, index) => `${index + 1}. ${step}`).join('\n')}

${azureBoardsInstructions}

====================================================
LOCATOR STRATEGY (UPS STANDARD)
====================================================
Locator priority (DO NOT CHANGE):
1. By.xpath("//tag[@aria-label='Label']") — PREFERRED for form fields
2. By.cssSelector("tag[attr='value']") — For buttons, iframes, links
3. By.xpath("//a[contains(text(),'Text')]") — For text-based links
4. By.id (ONLY if proven stable)
5. By.name

AVOID: index-based XPath, By.className alone, unstable IDs

All locators MUST be deterministic and reusable.

====================================================
CODING RULES (STRICT)
====================================================
- ONLY @Test method(s) in your test class
- UITestBase handles @BeforeMethod and @AfterMethod automatically
- @Test → full scenario logic wrapped in try-catch-finally
- Create WebDriverWait at start of @Test method
- NO Thread.sleep
- NO hard waits
- Explicit waits ONLY
- JavaDoc required for class and @Test method
- Use common.Assert for ALL assertions
- Use common.Reporter for ALL step logging with screenshots

====================================================
TEST DATA (UPS STANDARD)
====================================================
- If the prompt provides explicit values (names, emails, phone numbers, etc.) → hardcode them directly. Do NOT load a .properties file.
- If no explicit values are given AND the URL is parcelpro3.ams1907.com:
  Properties prop = PropertyReader.readPropertyFile(Constants.PARCEL_PRO_CONTACTUS);
  String value = prop.getProperty("fieldName", "defaultValue");
- If no explicit values are given AND the URL is insureshield3.ams1907.com → hardcode sensible defaults inline.
- NEVER reference Constants.PARCEL_PRO_CONTACTUS for InsureShield tests.

====================================================
IFRAME HANDLING (WHEN NEEDED)
====================================================
If the page under test has forms inside an iframe:
  Driver.instance.switchTo().frame("iframeName");
  // ... interact with form elements ...
  Driver.instance.switchTo().defaultContent();

====================================================
OUTPUT FORMAT (MANDATORY)
====================================================
Output TWO code blocks:

=== TEST CLASS ===
\`\`\`java
[Complete test class with Reporter integration]
\`\`\`

=== PAGE OBJECT ===
\`\`\`java
[Complete page object with static methods returning boolean]
\`\`\`

- NO explanations outside code blocks
- NO additional files
- NO randomness

====================================================
IMPORTANT STABILITY NOTE
====================================================
This prompt will be executed multiple times.
The generated Java code MUST remain IDENTICAL
across executions for the same prompt.
`;
  }
}

module.exports = PromptBuilder;
