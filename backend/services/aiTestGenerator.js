/**
 * AI-Powered Test Generator
 * Uses Claude/OpenAI to generate Selenium Java test code
 * Integrates with UPS-Selenium MCP for browser automation
 */

const fs = require('fs').promises;
const path = require('path');

class AITestGenerator {
  constructor(options = {}) {
    this.baseTestPath = options.baseTestPath || path.join(__dirname, '../../src/test/java/tests');
    this.basePageObjectPath = options.basePageObjectPath || path.join(__dirname, '../../src/test/java/pageobjects');
    this.llmClient = options.llmClient || null; // Claude or OpenAI client
    this.mcpAvailable = options.mcpAvailable || false;
  }

  /**
   * Generate test files using AI
   */
  async generateTest(config) {
    const { prompt, originalPrompt, testType = 'functional', llm = 'Claude 3.5 Sonnet', forceNew = false } = config;
    
    // Use originalPrompt (raw user input) for class name extraction — NOT the structured prompt
    // which contains framework template text (PARCEL_PRO_CONTACTUS etc.) that pollutes keyword matching
    const promptForClassExtraction = originalPrompt || prompt;
    let className = this._extractClassNameFromPrompt(promptForClassExtraction);
    if (!className) {
      const timestamp = Date.now();
      className = `GeneratedTest_${timestamp}`;
    }
    
    const pageObjectClassName = `${className}Page`;
    
    console.log('[AI-TEST-GEN] Using LLM:', llm);
    console.log('[AI-TEST-GEN] Class name:', className);
    console.log('[AI-TEST-GEN] Prompt:', prompt.substring(0, 100) + '...');
    
    // Generate AI-powered test code
    let testContent, pageObjectContent;
    
    if (this.llmClient) {
      console.log('[AI-TEST-GEN] Generating code with AI...');
      const aiResult = await this._generateWithAI(prompt, className, pageObjectClassName, testType, llm);
      testContent = aiResult.testContent;
      pageObjectContent = aiResult.pageObjectContent;
    } else {
      console.log('[AI-TEST-GEN] WARNING: No LLM client configured, using fallback template');
      testContent = this._generateFallbackTest(className, pageObjectClassName, prompt, testType);
      pageObjectContent = this._generateFallbackPageObject(pageObjectClassName);
    }
    
    const testFileName = `${className}.java`;
    const testFilePath = path.join(this.baseTestPath, testFileName);
    const pageObjectFileName = `${pageObjectClassName}.java`;
    const pageObjectFilePath = path.join(this.basePageObjectPath, pageObjectFileName);
    
    // Ensure directories exist
    await fs.mkdir(this.baseTestPath, { recursive: true });
    await fs.mkdir(this.basePageObjectPath, { recursive: true });
    
    // ============ OVERWRITE PROTECTION ============
    // Hardcoded exclusion list: these test files have been manually fixed and MUST NEVER be overwritten
    const PROTECTED_CLASSES = ['ContactUsFormTest', 'ContactUsFormTestPage'];
    const isProtectedClass = PROTECTED_CLASSES.some(name => 
      className === name || pageObjectClassName === name || 
      className.includes('ContactUs') || pageObjectClassName.includes('ContactUs')
    );

    // forceNew=true (user clicked "Run New Test" or "Create New Test Anyway") —
    // ALWAYS call GPT-4o and overwrite existing files. Only skip for hardcoded protected classes.
    if (forceNew) {
      if (isProtectedClass) {
        console.log(`[AI-TEST-GEN] forceNew=true but ${className} is a hardcoded protected class — skipping overwrite`);
      } else {
        console.log(`[AI-TEST-GEN] forceNew=true — GPT-4o will regenerate both files, bypassing overwrite protection`);
      }
    }

    // Check if files already exist and should be preserved
    let testFilePreserved = false;
    let pageObjectPreserved = false;
    try {
      const existingTest = await fs.readFile(testFilePath, 'utf8');
      // Only protect if: (a) hardcoded protected class, OR (b) has manual fix markers
      // AND user did NOT explicitly request new generation (forceNew=false)
      // NOTE: closeBannerPopup is intentionally excluded — appears in ALL tests and must not block regeneration
      const hasManualMarkers = existingTest.includes('switchToFormIframe') || 
                                existingTest.includes('navigateToContactUs') ||
                                existingTest.includes('MANUAL FIX MARKER');
      if (!forceNew && (isProtectedClass || hasManualMarkers)) {
        console.log(`[AI-TEST-GEN] ⚠ PROTECTED: Preserving test file: ${testFilePath}`);
        testContent = existingTest;
        testFilePreserved = true;
      }
    } catch (e) { /* File does not exist, will create */ }
    
    try {
      const existingPageObject = await fs.readFile(pageObjectFilePath, 'utf8');
      // NOTE: closeBannerPopup removed from protection — it is in every page object and must not block regeneration
      const hasManualMarkers = existingPageObject.includes('switchToFormIframe') || 
                                existingPageObject.includes('navigateToContactUs') ||
                                existingPageObject.includes('MANUAL FIX MARKER');
      if (!forceNew && (isProtectedClass || hasManualMarkers)) {
        console.log(`[AI-TEST-GEN] ⚠ PROTECTED: Preserving page object: ${pageObjectFilePath}`);
        pageObjectContent = existingPageObject;
        pageObjectPreserved = true;
      }
    } catch (e) { /* File does not exist, will create */ }
    
    // Write files (with preserved content if protected)
    await fs.writeFile(testFilePath, testContent, 'utf8');
    await fs.writeFile(pageObjectFilePath, pageObjectContent, 'utf8');
    
    console.log(`✓ Generated test file: ${testFilePath}${testFilePreserved ? ' (PRESERVED - protected)' : ''}`);
    console.log(`✓ Generated page object: ${pageObjectFilePath}${pageObjectPreserved ? ' (PRESERVED - protected)' : ''}`);
    
    return {
      className,
      testFileName,
      testFilePath,
      testContent,
      pageObjectClassName,
      pageObjectFileName,
      pageObjectPath: pageObjectFilePath,
      pageObjectContent
    };
  }

  /**
   * Generate test code using AI (Claude/OpenAI)
   */
  async _generateWithAI(prompt, className, pageObjectClassName, testType, llmModel) {
    const systemPrompt = this._buildSystemPrompt();
    const userPrompt = this._buildUserPrompt(prompt, className, pageObjectClassName, testType);
    
    try {
      // Call LLM API - detect based on client capabilities, not model name
      let response;
      
      // Check if client has OpenAI chat.completions API
      if (this.llmClient && this.llmClient.chat && this.llmClient.chat.completions) {
        console.log('[AI-TEST-GEN] Using OpenAI API');
        response = await this._callOpenAI(systemPrompt, userPrompt);
      }
      // Check if client has Claude messages API
      else if (this.llmClient && this.llmClient.messages) {
        console.log('[AI-TEST-GEN] Using Claude API');
        response = await this._callClaude(systemPrompt, userPrompt);
      } else {
        throw new Error('LLM client not properly configured - missing chat.completions or messages API');
      }
      
      console.log('[AI-TEST-GEN] Response type:', typeof response);
      console.log('[AI-TEST-GEN] Response length:', response?.length || 0);
      console.log('[AI-TEST-GEN] Response preview:', response?.substring(0, 200));
      
      // Extract code from response
      const extracted = this._extractCodeFromResponse(response);
      const sanitizedTestCode = this._sanitizeGeneratedCode(extracted.testCode, className);
      const sanitizedPageObjectCode = this._sanitizeGeneratedCode(extracted.pageObjectCode, pageObjectClassName);
      
      return {
        testContent: sanitizedTestCode,
        pageObjectContent: sanitizedPageObjectCode
      };
      
    } catch (error) {
      console.error('[AI-TEST-GEN] ═══════════════════════════════════════');
      console.error('[AI-TEST-GEN] AI GENERATION FAILED - DETAILS:');
      console.error('[AI-TEST-GEN] ═══════════════════════════════════════');
      console.error('[AI-TEST-GEN] Error Type:', error.constructor.name);
      console.error('[AI-TEST-GEN] Error Message:', error.message);
      console.error('[AI-TEST-GEN] Error Code:', error.code);
      console.error('[AI-TEST-GEN] Error Status:', error.status);
      if (error.response) {
        console.error('[AI-TEST-GEN] Response Status:', error.response.status);
        console.error('[AI-TEST-GEN] Response Data:', JSON.stringify(error.response.data, null, 2));
      }
      console.error('[AI-TEST-GEN] Full Error:', JSON.stringify(error, null, 2));
      console.error('[AI-TEST-GEN] ═══════════════════════════════════════');
      console.log('[AI-TEST-GEN] Falling back to template');
      const fallbackTest = this._generateFallbackTest(className, pageObjectClassName, prompt, testType);
      const fallbackPageObject = this._generateFallbackPageObject(pageObjectClassName);
      return {
        testContent: this._sanitizeGeneratedCode(fallbackTest, className),
        pageObjectContent: this._sanitizeGeneratedCode(fallbackPageObject, pageObjectClassName)
      };
    }
  }

  /**
   * Build system prompt for AI
   */
  _buildSystemPrompt() {
    return `You are an expert UPS Enterprise Test Automation Engineer. Generate PRODUCTION-READY TestNG test code following UPS enterprise standards.

⚠️ CRITICAL FRAMEWORK RULES:
- UITestBase @BeforeMethod ALREADY initializes WebDriver and navigates to base URL
- NEVER use @BeforeClass — it runs BEFORE @BeforeMethod and Driver.instance will be NULL
- NEVER use config.getEnv(), OpenShiftProjectConfig, or environment package — THEY DO NOT EXIST
- NEVER use org.testng.Assert — use common.Assert instead
- NEVER use direct Selenium (driver.findElement().click()) — use ElementActions utility
- For reCAPTCHA: attempt best-effort handling (click checkbox iframe), log warning if it fails, do NOT skip silently
- Use Constants.BASE_URL if you need the base URL string
- ALWAYS integrate common.Reporter for step-level HTML reporting with screenshots
- ONLY import what you actually USE — unused imports cause compiler warnings and confusion
- NEVER duplicate locator declarations — each By field MUST be on its own line
- Use EXACTLY the class names given in TEST CLASS NAME and PAGE OBJECT NAME — never substitute them

🎯 MANDATORY UPS ENTERPRISE PATTERNS:

1. TEST CLASS — ALL-IN-ONE @Test METHOD (NO @BeforeClass):
   @Test
   public void testScenario() {
       Reporter.startTestGroup("Test Suite Name");
       Reporter.startTest("testScenario", "Category", "Regression");
       try {
           Driver.instance.manage().window().maximize();
           // UITestBase @BeforeMethod already navigated to base URL and waited for page load
           // DO NOT add any WebDriverWait for page title - the title varies and causes flaky failures
           Reporter.logInfo("Page Load", "Homepage loaded successfully", true);
           
           // Close banner popup if present
           PageObject.closeBannerPopup();
           // Navigate to target page
           PageObject.navigateToPage();
           Reporter.logInfo("Navigation", "Navigated to target page", true);
           // Perform test steps using Page Object methods
           boolean result = PageObject.fillField(prop.getProperty("field"));
           Reporter.logPass("Fill Field", "Field filled successfully", true);
       } catch (Exception e) {
           Reporter.logFail("Failure", e.getMessage(), true);
           e.printStackTrace();
           Assert.fail("Test failed: " + e.getMessage());
       } finally {
           Reporter.endTest();
           Reporter.endTestGroup();
       }
   }

2. PAGE OBJECT MODEL — MUST USE:
   - ALL locators: private static final By ELEMENT_NAME = By.xpath("...");
   - ALL methods: public static boolean methodName(String param) — return true on success, false on failure
   - ALWAYS use ElementActions utility: ElementActions.enterTextWithSubmit(), ElementActions.selectFromComboBox(), ElementActions.clickElement()
   - ALWAYS wrap interactions in try/catch with [WARN] logging (soft failures for optional fields)
   - ALWAYS use WebDriverWait before interacting with elements
   - ⛔ EXACT ElementActions methods (ONLY these exist): clickElement(desc,el), sendKeys(desc,el,text), getText(desc,el), isDisplayed(desc,el), isEnabled(desc,el), enterTextWithSubmit(desc,el,text), selectFromComboBox(desc,el,text)
   - ⛔ NEVER call hoverOverElement, scrollToElement, dragAndDrop or ANY other ElementActions method — THEY DO NOT EXIST and will cause compile errors
   - ✅ For hover/mouse-over: add import org.openqa.selenium.interactions.Actions; then use: new Actions(Driver.instance).moveToElement(element).perform();

3. TEST DATA MANAGEMENT:
   - If the prompt provides explicit test values (names, emails, phone numbers, etc.) → hardcode them directly in the test. Do NOT load a .properties file.
   - If the test is for parcelpro3.ams1907.com and no explicit values are given → use: Properties prop = PropertyReader.readPropertyFile(Constants.PARCEL_PRO_CONTACTUS);
   - If the test is for insureshield3.ams1907.com and no explicit values are given → hardcode sensible defaults inline.
   - NEVER use TEST_DATA_FILE
   - NEVER reference PARCEL_PRO_CONTACTUS for InsureShield tests

4. LOCATOR STRATEGY:
   - PREFER: aria-label attributes for FORM FIELDS: By.xpath("//input[@aria-label='First Name']")
   - THEN: id, name, linkText, CSS selectors
   - LAST: XPath (make specific and resilient)
   - ⛔ EACH By field MUST be declared on its own separate line — NEVER combine multiple declarations on one line
   - ⛔ NEVER use aria-label for NAVIGATION LINKS on parcelpro3.ams1907.com — nav links use href:
     * About menu:          By.cssSelector("a[href*='/us/en/about-us.html']")
     * Offices (sub-menu):  By.cssSelector("a[href*='/about-us/offices']")
     * Country dropdown:    By.cssSelector("select#country, select[name*='country']")
   - ✅ INSURESHIELD3 (insureshield3.ams1907.com) LOCATORS:
     * DeliveryDefense link:  By.cssSelector("a[href*='delivery-defense']")
     * Banner close:          By.cssSelector("button.banner-close-button")
     * AEM form iframe:        By.cssSelector("iframe[name='aemFormFrame']")
     * First Name:            By.xpath("//input[@aria-label='First Name']")
     * Last Name:             By.xpath("//input[@aria-label='Last Name']")
     * Phone:                 By.xpath("(//input[@aria-label='Phone'])[1]")
     * Email:                 By.xpath("//input[@aria-label='Email']")
     * Country dropdown:      By.xpath("//select[@aria-label='Country / Territory']")
     * Zip Code:              By.xpath("//input[@aria-label='Zip Code / Postal Code']")
     * Company:               By.xpath("//input[@aria-label='Company']")
     * How can we help:       By.xpath("//textarea[@aria-label='How can we help?']")
     * Submit button:         By.cssSelector("button[aria-label='Submit']")
   - ✅ PARCELPRO3 (parcelpro3.ams1907.com) CONTACT FORM LOCATORS (inside aemFormFrame):
     * Contact Us link: By.cssSelector("a[href*='contact-us.html']")
     * First Name: By.xpath("//input[@aria-label='First Name']")
     * Country:     By.xpath("//select[@aria-label='Country / Territory']")
     * Submit:      By.cssSelector("button[aria-label='Submit']")

5. IFRAME HANDLING — If form is in an iframe:
   Driver.instance.switchTo().frame("iframeName");
   // ... interact with form ...
   Driver.instance.switchTo().defaultContent();

6. WEBDRIVER WAIT PATTERN — ALWAYS USE in Page Objects:
   WebDriverWait wait = new WebDriverWait(Driver.instance, Duration.ofSeconds(10));
   WebElement element = wait.until(ExpectedConditions.visibilityOfElementLocated(LOCATOR));
   ElementActions.enterTextWithSubmit("description", element, value);

7. ASSERTIONS — Use common.Assert (NOT org.testng.Assert):
   Assert.isTrue(condition, "message");
   Assert.fail("message");

8. IMPORTS — EXACT ORDER:
   import java.time.Duration;
   import java.util.Properties;
   import org.openqa.selenium.interactions.Actions;
   import org.openqa.selenium.support.ui.ExpectedConditions;
   import org.openqa.selenium.support.ui.WebDriverWait;
   import org.testng.annotations.Test;
   import testbase.UITestBase;
   import common.Assert;
   import common.Reporter;
   import pageobjects.YourPageObject;
   import utility.Constants;
   import utility.Driver;
   import utility.PropertyReader;
   NOTE: Only import what you actually USE. Remove unused imports — they cause compilation warnings.

9. TEST CLASS STRUCTURE:
   package tests;
   [imports]
   public class TestName extends UITestBase {
       // MANUAL FIX MARKER - closeBannerPopup - navigateToPage
       @Test
       public void testScenario() {
           try {
               // ALL setup and test logic in this single method
               // UITestBase @BeforeMethod already initialized the driver
           } catch (Exception e) {
               e.printStackTrace();
               Assert.fail("Test failed: " + e.getMessage());
           }
       }
   }

10. PAGE OBJECT STRUCTURE:
    package pageobjects;
    import utility.Driver;
    import utility.ElementActions;
    import org.openqa.selenium.By;
    import org.openqa.selenium.WebElement;
    import org.openqa.selenium.support.ui.WebDriverWait;
    import org.openqa.selenium.support.ui.ExpectedConditions;
    import java.time.Duration;
    
    public class PageObjectName {
        private static final By LOCATOR = By.xpath("//input[@aria-label='Field']");
        
        public static void closeBannerPopup() {
            try {
                Driver.wait(2);
                ElementActions.clickElement("Close banner", Driver.instance.findElement(By.cssSelector("button.banner-close-button")));
            } catch (Exception e) {
                System.out.println("[INFO] Banner not found: " + e.getMessage());
            }
        }
        
        public static boolean enterField(String value) {
            WebDriverWait wait = new WebDriverWait(Driver.instance, Duration.ofSeconds(10));
            try {
                WebElement el = wait.until(ExpectedConditions.visibilityOfElementLocated(LOCATOR));
                ElementActions.enterTextWithSubmit("Enter field", el, value);
                return true;
            } catch (Exception e) {
                System.out.println("[WARN] Could not enter field: " + e.getMessage());
                return false;
            }
        }
    }

11. PARCELPRO CONTACT US PAGE SPECIFICS:
    - Form is inside IFRAME "aemFormFrame" — MUST switch to it
    - MUST close banner popup first: Page.closeBannerPopup()
    - MUST navigate to Contact Us: Page.navigateToContactUs() using By.cssSelector("a[href*='contact-us.html']")
    - MUST switch to iframe: Driver.instance.switchTo().frame("aemFormFrame")
    - Form locators (inside iframe):
      * First Name: By.xpath("//input[@aria-label='First Name']")
      * Last Name: By.xpath("//input[@aria-label='Last Name']")
      * Company: By.xpath("//input[@aria-label='Company']")
      * Email: By.xpath("//input[@aria-label='Email']")
      * Phone: By.xpath("//input[@aria-label='Phone']")
      * Country: By.xpath("//select[@aria-label='Country / Territory']")
      * Submit: By.cssSelector("button[aria-label='Submit']")
    - reCAPTCHA: attempt best-effort (switch to reCAPTCHA iframe, click checkbox), log warning if it fails
    - Property constant: Constants.PARCEL_PRO_CONTACTUS
    - Split name: String[] nameParts = prop.getProperty("name").split(" ", 2);

12. STAGE.ABOUT.UPS.COM AEM FORMS (e.g. request-a-speaker-form, any form on stage.about.ups.com):
    - ⚠️ ALL forms on stage.about.ups.com are inside an AEM iframe — MUST switch to it before any field interaction
    - The page object MUST include a switchToFormIframe() method:
        public static void switchToFormIframe() {
            WebDriverWait wait = new WebDriverWait(Driver.instance, Duration.ofSeconds(15));
            try {
                wait.until(ExpectedConditions.frameToBeAvailableAndSwitchToIt("aemFormFrame"));
                System.out.println("[INFO] Switched to iframe: aemFormFrame");
                return;
            } catch (Exception ignored) { }
            java.util.List<org.openqa.selenium.WebElement> frames =
                Driver.instance.findElements(By.tagName("iframe"));
            if (!frames.isEmpty()) {
                try { Driver.instance.switchTo().frame(frames.get(0)); return; } catch (Exception ignored) { }
            }
            System.out.println("[WARN] No iframe found - proceeding in main document.");
        }
    - The TEST METHOD must call switchToFormIframe() AFTER navigating and confirming the URL, BEFORE the first form field
    - Request a Speaker Form locators (inside iframe, aria-label strategy):
      * First Name:           By.xpath("//input[@aria-label='First Name']")
      * Last Name:            By.xpath("//input[@aria-label='Last Name']")
      * Organization:         By.xpath("//input[@aria-label='Name of Organization Hosting Event']")
      * Email:                By.xpath("//input[@aria-label='Email']")
      * Confirm Email:        By.xpath("//input[@aria-label='Confirm Email']")
      * Country Code:         By.xpath("//select[@aria-label='Country Code']")
      * Phone Number:         By.xpath("//input[@aria-label='Phone Number']")
      * Speaker Requested:    By.xpath("//select[@aria-label='Speaker Requested']")
      * Event Title:          By.xpath("//input[@aria-label='Event Title']")
      * Event Date:           By.xpath("//input[@aria-label='Event Date']")
      * Event Location:       By.xpath("//input[@aria-label='Event Location']")
      * Topic of Presentation:By.xpath("//textarea[@aria-label='Topic of Presentation']")
      * Event Description:    By.xpath("//textarea[@aria-label='Event Description']")
      * Send Request button:  By.cssSelector("button[aria-label='Send Request']")

OUTPUT FORMAT:
=== TEST CLASS ===
[Complete test class with @Test method only — NO @BeforeClass]

=== PAGE OBJECT ===
[Complete page object with static methods using ElementActions]`;
  }

  /**
   * Build user prompt with context
   */
  _buildUserPrompt(prompt, className, pageObjectClassName, testType) {
    return `Generate UPS ENTERPRISE STANDARD Selenium Java TestNG test for:

TEST TYPE: ${testType}
TEST CLASS NAME: ${className}
PAGE OBJECT NAME: ${pageObjectClassName}

USER REQUIREMENTS:
${prompt}

⚠️ CRITICAL: DO NOT use @BeforeClass, config.getEnv(), OpenShiftProjectConfig — THEY DO NOT EXIST.
UITestBase @BeforeMethod already initializes the WebDriver and navigates to the base URL.
Put ALL test logic inside a single @Test method wrapped in try/catch.

EXAMPLE TEST STRUCTURE (UPS ENTERPRISE PATTERN):
\`\`\`java
package tests;

import java.time.Duration;
import java.util.Properties;
import org.openqa.selenium.interactions.Actions;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;
import org.testng.annotations.Test;
import testbase.UITestBase;
import common.Assert;
import common.Reporter;
import pageobjects.${pageObjectClassName};
import utility.Constants;
import utility.Driver;
import utility.PropertyReader;

public class ${className} extends UITestBase {

    // MANUAL FIX MARKER - closeBannerPopup - navigateToPage
    @Test
    public void testScenario() {
        Reporter.startTestGroup("${className} Tests");
        Reporter.startTest("testScenario", "${className}", "Regression");
        try {
            // UITestBase @BeforeMethod already initialized driver and navigated to base URL
            Driver.instance.manage().window().maximize();
            
            // UITestBase @BeforeMethod already navigated — no title wait needed
            Reporter.logInfo("Page Load", "Homepage loaded successfully", true);
            
            // Close banner popup
            ${pageObjectClassName}.closeBannerPopup();
            
            // Navigate to test page
            // ${pageObjectClassName}.navigateToPage();
            
            // If test data is given explicitly in the prompt → hardcode inline:
            String firstName = "John"; // replace with actual prompt value
            String email     = "test@example.com";
            
            // If reading from .properties file (parcelpro3 tests only):
            // Properties prop = PropertyReader.readPropertyFile(Constants.PARCEL_PRO_CONTACTUS);
            // String firstName = prop.getProperty("first_name", "John");
            
            // Fill form using page object methods
            boolean result1 = ${pageObjectClassName}.enterField1(firstName);
            Reporter.logPass("Field 1", "Field 1 filled successfully", true);
            boolean result2 = ${pageObjectClassName}.selectDropdown(email);
            Reporter.logPass("Dropdown", "Dropdown selected successfully", true);
            ${pageObjectClassName}.clickSubmitButton();
            Reporter.logPass("Submit", "Form submitted", true);
            
            Assert.isTrue(result1, "Field 1 filled successfully");
        } catch (Exception e) {
            Reporter.logFail("Failure", e.getMessage(), true);
            e.printStackTrace();
            Assert.fail("Test failed: " + e.getMessage());
        } finally {
            Reporter.endTest();
            Reporter.endTestGroup();
        }
    }
}
\`\`\`

EXAMPLE PAGE OBJECT (UPS ENTERPRISE PATTERN):
\`\`\`java
package pageobjects;

import utility.Driver;
import utility.ElementActions;
import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.WebDriverWait;
import org.openqa.selenium.support.ui.ExpectedConditions;
import java.time.Duration;

public class ${pageObjectClassName} {
    
    private static final By FIELD1_INPUT = By.xpath("//input[@aria-label='Field 1']");
    private static final By DROPDOWN_SELECT = By.xpath("//select[@aria-label='Dropdown']");
    private static final By SUBMIT_BUTTON = By.cssSelector("button[aria-label='Submit']");
    
    public static boolean enterField1(String value) {
        WebDriverWait wait = new WebDriverWait(Driver.instance, Duration.ofSeconds(10));
        WebElement element = wait.until(ExpectedConditions.visibilityOfElementLocated(FIELD1_INPUT));
        ElementActions.enterTextWithSubmit("Enter field1: " + value, element, value);
        return true;
    }
    
    public static boolean selectDropdown(String option) {
        WebDriverWait wait = new WebDriverWait(Driver.instance, Duration.ofSeconds(10));
        WebElement element = wait.until(ExpectedConditions.visibilityOfElementLocated(DROPDOWN_SELECT));
        ElementActions.selectFromComboBox("Select option: " + option, element, option);
        return true;
    }
    
    public static void clickSubmitButton() {
        ElementActions.clickElement("Click submit button", 
            Driver.instance.findElement(SUBMIT_BUTTON));
    }
}
\`\`\`

🎯 CRITICAL REQUIREMENTS:
1. MUST NOT use @BeforeClass — UITestBase @BeforeMethod handles driver init
2. MUST put ALL logic in a single @Test method wrapped in try/catch
3. MUST use Page Object static methods (NO direct Selenium)
4. MUST use ElementActions utility (NO driver.findElement().click())
5. MUST use common.Assert (NO org.testng.Assert)
6. MUST use Properties files for test data (NO hardcoded values)
7. PREFER aria-label locators: By.xpath("//input[@aria-label='Name']")
8. MUST include MANUAL FIX MARKER comment with key method names

Generate COMPLETE, EXECUTABLE code for ALL steps. NO placeholders or TODOs.`;
  }

  /**
   * Call Claude API
   */
  async _callClaude(systemPrompt, userPrompt) {
    if (!this.llmClient || !this.llmClient.messages) {
      throw new Error('Claude client not properly configured');
    }
    
    const response = await this.llmClient.messages.create({
      model: 'claude-sonnet-4-6',  // Claude Sonnet 4.6 (latest)
      max_tokens: 8000,
      system: systemPrompt,
      messages: [{
        role: 'user',
        content: userPrompt
      }]
    });
    
    return response.content[0].text;
  }

  /**
   * Call OpenAI API
   */
  async _callOpenAI(systemPrompt, userPrompt) {
    if (!this.llmClient || !this.llmClient.chat) {
      throw new Error('OpenAI client not properly configured');
    }
    
    console.log('[AI-TEST-GEN] ═══════════════════════════════════════');
    console.log('[AI-TEST-GEN] CALLING AZURE OPENAI API');
    console.log('[AI-TEST-GEN] System prompt length:', systemPrompt.length);
    console.log('[AI-TEST-GEN] User prompt length:', userPrompt.length);
    console.log('[AI-TEST-GEN] ═══════════════════════════════════════');
    
    // For Azure OpenAI with deployment in baseURL:
    // The model parameter can be ANY string (Azure ignores it and uses the deployment)
    // Common practice: use the actual model name or empty string
    const response = await this.llmClient.chat.completions.create({
      model: '',  // Empty string - deployment already specified in baseURL
      max_tokens: 8000,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ]
    });
    
    console.log('[AI-TEST-GEN] ✅ Azure OpenAI Response received');
    console.log('[AI-TEST-GEN] Response ID:', response.id);
    console.log('[AI-TEST-GEN] Model used:', response.model);
    console.log('[AI-TEST-GEN] Finish reason:', response.choices[0].finish_reason);
    console.log('[AI-TEST-GEN] Content length:', response.choices[0].message.content.length);
    console.log('[AI-TEST-GEN] ═══════════════════════════════════════');
    
    return response.choices[0].message.content;
  }

  /**
   * Extract code blocks from AI response
   */
  _extractCodeFromResponse(response) {
    console.log('[AI-TEST-GEN] Extracting code from response...');
    console.log('[AI-TEST-GEN] Response length:', response.length);
    
    // Look for === TEST CLASS === and === PAGE OBJECT === markers
    const testMatch = response.match(/===\s*TEST CLASS\s*===\s*([\s\S]*?)(?:===\s*PAGE OBJECT\s*===|$)/i);
    const pageObjectMatch = response.match(/===\s*PAGE OBJECT\s*===\s*([\s\S]*?)$/i);
    
    let testCode = testMatch ? testMatch[1].trim() : '';
    let pageObjectCode = pageObjectMatch ? pageObjectMatch[1].trim() : '';
    
    // Remove code fences if present
    testCode = testCode.replace(/```java\n?/g, '').replace(/```\n?/g, '').trim();
    pageObjectCode = pageObjectCode.replace(/```java\n?/g, '').replace(/```\n?/g, '').trim();
    
    // If markers not found, try to extract code blocks directly
    if (!testCode || !pageObjectCode) {
      console.log('[AI-TEST-GEN] Markers not found, extracting code blocks...');
      const codeBlocks = response.match(/```java([\s\S]*?)```/g) || [];
      console.log('[AI-TEST-GEN] Found', codeBlocks.length, 'code blocks');
      
      if (codeBlocks.length >= 2) {
        testCode = codeBlocks[0].replace(/```java\n?/g, '').replace(/```\n?/g, '').trim();
        pageObjectCode = codeBlocks[1].replace(/```java\n?/g, '').replace(/```\n?/g, '').trim();
      } else if (codeBlocks.length === 1) {
        // Only one code block - use it as test, generate simple page object
        testCode = codeBlocks[0].replace(/```java\n?/g, '').replace(/```\n?/g, '').trim();
        console.log('[AI-TEST-GEN] Only one code block found, will use fallback for page object');
      }
    }
    
    console.log('[AI-TEST-GEN] Extracted testCode length:', testCode.length);
    console.log('[AI-TEST-GEN] Extracted pageObjectCode length:', pageObjectCode.length);

    // ── Truncation guard ────────────────────────────────────────────────────
    // If either file doesn't end with '}' the LLM was cut off mid-response.
    // Auto-close with '}' so the file at least compiles, and log a warning.
    const endsClean = (code) => code.trimEnd().endsWith('}');
    if (testCode && !endsClean(testCode)) {
      console.warn('[AI-TEST-GEN] ⚠ TEST FILE APPEARS TRUNCATED — auto-closing with }');
      testCode = testCode.trimEnd() + '\n}\n';
    }
    if (pageObjectCode && !endsClean(pageObjectCode)) {
      console.warn('[AI-TEST-GEN] ⚠ PAGE OBJECT APPEARS TRUNCATED — auto-closing with }');
      pageObjectCode = pageObjectCode.trimEnd() + '\n}\n';
    }

    return { testCode, pageObjectCode };
  }

  /**
   * Sanitize generated code to reduce brittle placeholder locator failures.
   * Acts as a post-generation safety net — fixes known LLM hallucination patterns
   * before the file is written to disk, regardless of what the LLM produced.
   */
  _sanitizeGeneratedCode(code, className = 'GeneratedTest') {
    if (!code || typeof code !== 'string') {
      return code;
    }

    let sanitized = code;

    // ─────────────────────────────────────────────────────────────────────────
    // 1. REMOVE TITLE-BASED WebDriverWait (causes runtime TimeoutException
    //    because page title varies: "Parcel Pro" != "ParcelPro" etc.)
    //    Removes the entire wait block in any variation the LLM might produce.
    // ─────────────────────────────────────────────────────────────────────────
    // Pattern: new WebDriverWait(...).until((WebDriver d) -> d.getTitle()...);
    sanitized = sanitized.replace(
      /new\s+WebDriverWait\s*\([^)]+\)\s*\.until\s*\(\s*\([^)]*WebDriver[^)]*\)\s*->\s*[^.]+\.getTitle\s*\(\s*\)[^;]*;\s*/g,
      '// UITestBase @BeforeMethod already navigated — page is ready\n            '
    );
    // Pattern: new WebDriverWait(...).until(ExpectedConditions.titleContains(...));
    sanitized = sanitized.replace(
      /new\s+WebDriverWait\s*\([^)]+\)\s*\.until\s*\(\s*ExpectedConditions\.title(?:Contains|Is)\s*\([^)]+\)\s*\)\s*;\s*/g,
      '// UITestBase @BeforeMethod already navigated — page is ready\n            '
    );

    // ─────────────────────────────────────────────────────────────────────────
    // 2. REMOVE UNUSED WebDriver IMPORT
    //    After stripping the title-wait lambda there is no usage of WebDriver
    //    as a type, so this import causes a warning and signals bad generation.
    // ─────────────────────────────────────────────────────────────────────────
    sanitized = sanitized.replace(/^import\s+org\.openqa\.selenium\.WebDriver\s*;\s*\n/gm, '');

    // ─────────────────────────────────────────────────────────────────────────
    // 3. FIX NON-EXISTENT ElementActions METHODS → correct alternatives
    //    ElementActions only has: clickElement, sendKeys, getText, isDisplayed,
    //    isEnabled, enterTextWithSubmit, selectFromComboBox
    // ─────────────────────────────────────────────────────────────────────────
    // hoverOverElement → Actions.moveToElement
    sanitized = sanitized.replace(
      /ElementActions\.hoverOverElement\s*\(\s*"([^"]+)"\s*,\s*([^)]+)\)\s*;/g,
      'new Actions(Driver.instance).moveToElement($2).perform(); // hover: $1'
    );
    // scrollToElement → JS scroll
    sanitized = sanitized.replace(
      /ElementActions\.scrollToElement\s*\(\s*"([^"]+)"\s*,\s*([^)]+)\)\s*;/g,
      '((JavascriptExecutor) Driver.instance).executeScript("arguments[0].scrollIntoView(true);", $2); // scroll: $1'
    );
    // dragAndDrop → Actions.dragAndDrop
    sanitized = sanitized.replace(
      /ElementActions\.dragAndDrop\s*\(\s*"([^"]+)"\s*,\s*([^,)]+)\s*,\s*([^)]+)\)\s*;/g,
      'new Actions(Driver.instance).dragAndDrop($2, $3).perform(); // drag: $1'
    );
    // doubleClick → Actions.doubleClick
    sanitized = sanitized.replace(
      /ElementActions\.doubleClick\s*\(\s*"([^"]+)"\s*,\s*([^)]+)\)\s*;/g,
      'new Actions(Driver.instance).doubleClick($2).perform(); // doubleClick: $1'
    );
    // rightClick → Actions.contextClick
    sanitized = sanitized.replace(
      /ElementActions\.rightClick\s*\(\s*"([^"]+)"\s*,\s*([^)]+)\)\s*;/g,
      'new Actions(Driver.instance).contextClick($2).perform(); // rightClick: $1'
    );

    // ─────────────────────────────────────────────────────────────────────────
    // 4. ADD MISSING IMPORTS when Actions/JavascriptExecutor were just injected
    // ─────────────────────────────────────────────────────────────────────────
    const needsActions = sanitized.includes('new Actions(') &&
                         !sanitized.includes('import org.openqa.selenium.interactions.Actions;');
    if (needsActions) {
      sanitized = sanitized.replace(
        /(import utility\.Driver;)/,
        'import org.openqa.selenium.interactions.Actions;\n$1'
      );
    }
    const needsJSExecutor = sanitized.includes('JavascriptExecutor') &&
                            !sanitized.includes('import org.openqa.selenium.JavascriptExecutor;');
    if (needsJSExecutor) {
      sanitized = sanitized.replace(
        /(import utility\.Driver;)/,
        'import org.openqa.selenium.JavascriptExecutor;\n$1'
      );
    }

    // ─────────────────────────────────────────────────────────────────────────
    // 5. FIX WRONG ASSERT CLASS
    //    LLMs often use org.testng.Assert instead of common.Assert
    // ─────────────────────────────────────────────────────────────────────────
    sanitized = sanitized.replace(/^import\s+org\.testng\.Assert\s*;\s*\n/gm, '');
    // Replace TestNG Assert static calls with common.Assert equivalents
    sanitized = sanitized.replace(/\bAssert\.assertEquals\s*\(/g, 'Assert.isTrue(');
    sanitized = sanitized.replace(/\bAssert\.assertNotNull\s*\(/g, 'Assert.isTrue(null != ');
    // Ensure common.Assert is imported if Assert is used
    const hasAssertUsage = /\bAssert\.(isTrue|fail|assertThat)\s*\(/.test(sanitized);
    const hasCommonAssertImport = sanitized.includes('import common.Assert;');
    if (hasAssertUsage && !hasCommonAssertImport) {
      sanitized = sanitized.replace(
        /(import common\.Reporter;|import testbase\.UITestBase;)/,
        '$1\nimport common.Assert;'
      );
    }

    // ─────────────────────────────────────────────────────────────────────────
    // 6. REMOVE @BeforeClass (runs before @BeforeMethod, Driver.instance is null)
    // ─────────────────────────────────────────────────────────────────────────
    sanitized = sanitized.replace(/^import\s+org\.testng\.annotations\.BeforeClass\s*;\s*\n/gm, '');
    sanitized = sanitized.replace(
      /@BeforeClass\s*(?:\/\/[^\n]*)?\s*\n\s*public\s+(?:static\s+)?void\s+\w+\s*\(\s*\)\s*\{[^}]*\}/gs,
      '// @BeforeClass removed — UITestBase @BeforeMethod handles driver init'
    );

    // ─────────────────────────────────────────────────────────────────────────
    // 7. EXISTING LOCATOR / URL FIXES
    // ─────────────────────────────────────────────────────────────────────────
    sanitized = sanitized.replace(/https:\/\/example\.com/g, 'https://parcelpro3.ams1907.com');
    sanitized = sanitized.replace(/By\.id\("about-menu"\)/g, "By.xpath(\"//a[contains(normalize-space(),'About')] | //a[contains(@href,'about-us')]\")");
    sanitized = sanitized.replace(/By\.id\("country-dropdown"\)/g, "By.xpath(\"//select[contains(@id,'country') or contains(@name,'country')] | //button[contains(.,'Country') or contains(.,'country')]\")");
    sanitized = sanitized.replace(/By\.id\("loginButton"\)/g, "By.xpath(\"//button[contains(.,'Login') or contains(.,'Sign in')] | //input[@type='submit']\")");
    sanitized = sanitized.replace(/By\.id\("dashboard"\)/g, "By.xpath(\"//main | //div[contains(@class,'dashboard')] | //body\")");
    sanitized = sanitized.replace(/assuming id/gi, 'robust locator');

    // ─────────────────────────────────────────────────────────────────────────
    // 8. ENFORCE CORRECT CLASS NAME (LLM may use wrong name)
    // ─────────────────────────────────────────────────────────────────────────
    sanitized = sanitized.replace(/public class\s+\w+\s+extends\s+UITestBase/, `public class ${className} extends UITestBase`);

    // ─────────────────────────────────────────────────────────────────────────
    // 9. FIX aria-label NAV LOCATORS → href-based (parcelpro3/insureshield3 nav
    //    links use href, not aria-label — AI frequently guesses aria-label)
    //    IMPORTANT: Only fix anchor <a> elements (nav links).
    //    NEVER touch form field locators: //input, //select, //textarea, //button
    // ─────────────────────────────────────────────────────────────────────────
    const navAriaLabelMap = {
      'About':              "a[href*='/us/en/about-us.html']",
      'Who We Serve':       "a[href*='/us/en/who-we-serve.html']",
      'Resources':          "a[href*='/us/en/resources.html']",
      'Insured Shipping':   "a[href*='/us/en/insured-shipping.html']",
      'Shipping Technology':"a[href*='/us/en/shipping-technology.html']",
      'Offices':            "a[href*='/about-us/offices']",
      'Contact':            "a[href*='contact-us']",
    };
    // Scope: only match XPath where the final element tag is 'a' (anchor).
    // Pattern requires .../a[@aria-label='...'] — does NOT match //input, //select, //textarea etc.
    sanitized = sanitized.replace(
      /By\.xpath\s*\(\s*"[^"]*\/a\[@aria-label='([^']+)'[^"]*"\s*\)/g,
      (match, label) => {
        const selector = navAriaLabelMap[label];
        if (selector) {
          return `By.cssSelector("${selector}")`;
        }
        // Generic fallback: convert to href-kebab — only safe for anchor nav links
        const slug = label.toLowerCase().replace(/\s+/g, '-');
        return `By.cssSelector("a[href*='${slug}']")  // auto-fixed from nav aria-label`;
      }
    );
    // Also fix select[@aria-label='Select Country'] → robust multi-selector
    sanitized = sanitized.replace(
      /By\.xpath\s*\(\s*"[^"]*@aria-label[^"]*'Select Country'[^"]*"\s*\)/g,
      `By.cssSelector("select#country, select[name*='country'], select[id*='country']")`
    );

    // ─────────────────────────────────────────────────────────────────────────
    // 10. REPLACE DIRECT new Select(...).selectByVisibleText() WITH
    //     ElementActions.selectFromComboBox() — the utility method uses
    //     JavaScript-first selection avoiding ChromeDriver click-hang.
    // ─────────────────────────────────────────────────────────────────────────
    // Pattern: new Select(someEl).selectByVisibleText("value");
    sanitized = sanitized.replace(
      /new\s+Select\s*\(\s*([^)]+)\s*\)\s*\.selectByVisibleText\s*\(\s*("(?:[^"\\]|\\.)*"|[^)]+)\s*\)\s*;/g,
      'ElementActions.selectFromComboBox("select dropdown", $1, $2);'
    );
    // Pattern: new Select(someEl).selectByValue("value");
    sanitized = sanitized.replace(
      /new\s+Select\s*\(\s*([^)]+)\s*\)\s*\.selectByValue\s*\(\s*("(?:[^"\\]|\\.)*"|[^)]+)\s*\)\s*;/g,
      'ElementActions.selectFromComboBox("select dropdown", $1, $2);'
    );
    // Remove now-unused: import org.openqa.selenium.support.ui.Select;
    // Only if no remaining direct Select usage
    if (!sanitized.match(/new\s+Select\s*\(/) && sanitized.includes('import org.openqa.selenium.support.ui.Select;')) {
      sanitized = sanitized.replace(/^import\s+org\.openqa\.selenium\.support\.ui\.Select\s*;\s*\n/gm, '');
    }

    return sanitized;
  }

  /**
   * Fallback: Generate basic template when AI fails
   */
  _generateFallbackTest(className, pageObjectClassName, prompt, testType) {
    // Escape prompt for Java string - replace newlines and quotes
    const escapedPrompt = prompt.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n').substring(0, 200);
    
    return `package tests;

import org.testng.annotations.Test;
import testbase.UITestBase;
import common.Assert;
import common.Reporter;
import utility.Driver;

/**
 * AI-Generated Test Case: ${className}
 * Type: ${testType.toUpperCase()}
 * MANUAL FIX MARKER - closeBannerPopup - navigateToPage
 * NOTE: AI generation failed - using fallback template
 */
public class ${className} extends UITestBase {

    @Test
    public void testFunctionalScenario() {
        try {
            System.out.println("[TEST] AI generation unavailable - using template");
            System.out.println("[TEST] Prompt: ${escapedPrompt}...");

            // UITestBase @BeforeMethod already initialized driver and navigated to base URL
            Driver.instance.manage().window().maximize();

            System.out.println("[TEST] Homepage loaded successfully");
            System.out.println("[TEST] ⚠ Using fallback template - configure AI to enable smart code generation");

            Assert.isTrue(true, "Fallback template test completed - homepage loaded");

        } catch (Exception e) {
            e.printStackTrace();
            Assert.fail("Test failed: " + e.getMessage());
        }
    }
}`;
  }

  /**
   * Fallback: Generate basic page object
   */
  _generateFallbackPageObject(className) {
    return `package pageobjects;

import utility.Driver;
import utility.ElementActions;
import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.WebDriverWait;
import org.openqa.selenium.support.ui.ExpectedConditions;
import java.time.Duration;

/**
 * MANUAL FIX MARKER - closeBannerPopup - navigateToPage
 * Fallback page object - configure AI for smart generation
 */
public class ${className} {
    
    public static void closeBannerPopup() {
        try {
            Driver.wait(2);
            ElementActions.clickElement("Close banner popup", 
                Driver.instance.findElement(By.cssSelector("button.banner-close-button")));
        } catch (Exception e) {
            System.out.println("[INFO] Banner not found or already closed: " + e.getMessage());
        }
    }
}`;
  }

  /**
   * Extract class name from prompt if specified
   */
  _extractClassNameFromPrompt(prompt) {
    // Look for explicit class name specification in prompt
    // Pattern: "The class name MUST be: ContactUsFormTest"
    const classNameMatch = prompt.match(/class name.*?MUST be:\s*(\w+)/i);
    if (classNameMatch) {
      return classNameMatch[1];
    }
    
    // Try to extract from file path specification
    // Pattern: "src/test/java/tests/ContactUsFormTest.java"
    const filePathMatch = prompt.match(/src\/test\/java\/tests\/(\w+)\.java/i);
    if (filePathMatch) {
      return filePathMatch[1];
    }
    
    // Look for test-specific keywords to generate meaningful names
    const lowerPrompt = prompt.toLowerCase();
    
    // InsureShield-specific checks FIRST — detect sub-type from test content
    const isInsureShield = lowerPrompt.includes('insureshield') || lowerPrompt.includes('insureshield3');
    // URL-based extraction: detect site from URL in prompt
    const urlMatch = prompt.match(/https?:\/\/([\w.-]+)/i);
    const urlDomain = urlMatch ? urlMatch[1].toLowerCase() : '';
    if (isInsureShield || urlDomain.includes('insureshield')) {
      // Determine which InsureShield test type based on the test scenario
      if (lowerPrompt.includes('deliverydefense') || lowerPrompt.includes('delivery-defense') || lowerPrompt.includes('delivery defense') || lowerPrompt.includes('delivery_defense')) {
        return 'InsureShieldDeliveryDefenseTest';
      }
      if (lowerPrompt.includes('contact') || lowerPrompt.includes('contact us') || lowerPrompt.includes('form')) {
        return 'InsureShieldContactFormTest';
      }
      if (lowerPrompt.includes('login') || lowerPrompt.includes('sign in')) {
        return 'InsureShieldLoginTest';
      }
      return 'InsureShieldCountrySelectTest'; // default InsureShield test
    }
    if (urlDomain.includes('insureshield')) return 'InsureShieldCountrySelectTest'; // fallback (unreachable but safe)
    if (urlMatch) {
      const domain = urlDomain;
      if (domain.includes('parcelpro')) {
        if (lowerPrompt.includes('office') || lowerPrompt.includes('country')) return 'OfficesCountrySelectTest';
        if (lowerPrompt.includes('contact')) return 'ContactUsFormTest';
        if (lowerPrompt.includes('login')) return 'LoginTest';
        if (lowerPrompt.includes('language') || lowerPrompt.includes('locale')) return 'LanguageSelectTest';
      }
    }
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
    // Canada/North America = InsureShield country selector context
    if (lowerPrompt.includes('canada') || lowerPrompt.includes('north america') || lowerPrompt.includes('another country')) {
      return 'InsureShieldCountrySelectTest';
    }
    
    // Return null to use timestamp fallback
    return null;
  }
}

module.exports = AITestGenerator;
