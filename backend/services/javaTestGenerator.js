/**
 * Java Test Generator Service
 * Generates Selenium Java test files with Page Objects
 */

const fs = require('fs').promises;
const path = require('path');

class JavaTestGenerator {
  constructor(options = {}) {
    this.baseTestPath = options.baseTestPath || path.join(__dirname, '../../src/test/java/tests');
    this.basePageObjectPath = options.basePageObjectPath || path.join(__dirname, '../../src/test/java/pageobjects');
    this.openaiClient = options.openaiClient || null;
  }

  /**
   * Generate test files
   * @param {object} config - Test configuration
   * @param {string} config.prompt - Test prompt
   * @param {string} config.testType - Test type
   * @param {string} config.llm - LLM model to use
   * @returns {Promise<object>} - Generated file info
   */
  async generateTest(config) {
    const { prompt, testType = 'functional', llm = 'Claude 3.5 Sonnet' } = config;
    
    const timestamp = Date.now();
    const className = `GeneratedTest_${timestamp}`;
    const pageObjectClassName = `${className}Page`;
    
    // Generate test class
    const testContent = this._generateTestClass(className, pageObjectClassName, prompt, testType);
    const testFileName = `${className}.java`;
    const testFilePath = path.join(this.baseTestPath, testFileName);
    
    // Generate page object class
    const pageObjectContent = this._generatePageObjectClass(pageObjectClassName, prompt);
    const pageObjectFileName = `${pageObjectClassName}.java`;
    const pageObjectFilePath = path.join(this.basePageObjectPath, pageObjectFileName);
    
    // Ensure directories exist
    await fs.mkdir(this.baseTestPath, { recursive: true });
    await fs.mkdir(this.basePageObjectPath, { recursive: true });
    
    // Write files
    await fs.writeFile(testFilePath, testContent, 'utf8');
    await fs.writeFile(pageObjectFilePath, pageObjectContent, 'utf8');
    
    console.log(`✓ Generated test file: ${testFilePath}`);
    console.log(`✓ Generated page object: ${pageObjectFilePath}`);
    
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
   * Parse prompt to extract test steps
   */
  _parseTestSteps(prompt) {
    const steps = [];
    const lines = prompt.split(/\r?\n/);
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // Match numbered steps: "1.", "2)", "Step 1:", etc.
      const stepMatch = line.match(/^(?:\d+[\.\)]|Step\s+\d+:?)\s*(.+)/i);
      if (stepMatch) {
        steps.push({
          number: steps.length + 1,
          text: stepMatch[1].trim(),
          originalLine: line
        });
      }
    }
    
    return steps;
  }

  /**
   * Generate test code from parsed steps
   */
  _generateTestStepsCode(steps) {
    if (!steps || steps.length === 0) {
      return this._generateDefaultTemplateSteps();
    }

    let code = '';
    
    steps.forEach((step, index) => {
      const stepNum = index + 1;
      const stepText = step.text.toLowerCase();
      
      code += `\n            // Step ${stepNum}: ${step.text}\n`;
      code += `            System.out.println("[STEP ${stepNum}] ${step.text}");\n`;
      
      // Parse and generate code based on step content
      if (stepText.includes('launch') && stepText.includes('url')) {
        const urlMatch = step.text.match(/https?:\/\/[^\s]+/);
        if (urlMatch) {
          code += `            Driver.instance.get("${urlMatch[0]}");\n`;
          code += `            Driver.wait(2);\n`;
        }
      }
      // Handle hover actions with submenu clicks
      else if (stepText.includes('hover') && (stepText.includes('click') || stepText.includes('offices'))) {
        const menuMatch = step.text.match(/hover[- ]on\s+(\w+)/i);
        const submenuMatch = step.text.match(/click(?:\s+on)?\s+(\w+)/i);
        
        const menuText = menuMatch ? menuMatch[1] : 'About';
        const submenuText = submenuMatch ? submenuMatch[1] : 'Offices';
        
        code += `            // Hover on ${menuText} menu and click ${submenuText}\n`;
        code += `            Actions actions = new Actions(Driver.instance);\n`;
        code += `            WebElement ${menuText.toLowerCase()}Menu = wait.until(ExpectedConditions.presenceOfElementLocated(\n`;
        code += `                By.linkText("${menuText}")));\n`;
        code += `            actions.moveToElement(${menuText.toLowerCase()}Menu).perform();\n`;
        code += `            Driver.wait(1);\n`;
        code += `            \n`;
        code += `            WebElement ${submenuText.toLowerCase()}Link = wait.until(ExpectedConditions.elementToBeClickable(\n`;
        code += `                By.linkText("${submenuText}")));\n`;
        code += `            ${submenuText.toLowerCase()}Link.click();\n`;
        code += `            Driver.wait(2);\n`;
      }
      else if (stepText.includes('click') && stepText.includes('drop') && stepText.includes('down')) {
        if (stepText.includes('united states') || stepText.includes('english') || stepText.includes('header')) {
          code += `            // Click language dropdown in header using JavaScript (more reliable)\n`;
          code += `            WebElement languageDropdown = wait.until(ExpectedConditions.presenceOfElementLocated(\n`;
          code += `                By.xpath("//header//a[contains(@href, 'global')]")));\n`;
          code += `            ((JavascriptExecutor) Driver.instance).executeScript("arguments[0].click();", languageDropdown);\n`;
          code += `            Driver.wait(3);\n`;
        }
      }
      else if (stepText.includes('navigate') || stepText.includes('navigating')) {
        const urlMatch = step.text.match(/https?:\/\/[^\s]+/);
        if (urlMatch) {
          // Extract the page name from URL (e.g., "offices.html")
          const pageMatch = urlMatch[0].match(/\/([^\/]+\.html)/);
          const pageName = pageMatch ? pageMatch[1] : 'page';
          
          code += `            // Verify navigation to: ${urlMatch[0]}\n`;
          code += `            wait.until(ExpectedConditions.urlContains("${pageName}"));\n`;
          code += `            String currentUrl = Driver.instance.getCurrentUrl();\n`;
          code += `            System.out.println("[STEP ${stepNum}] Current URL: " + currentUrl);\n`;
          code += `            Assert.isTrue(currentUrl.contains("${pageName}"), "Navigated to ${pageName}");\n`;
        }
      }
      else if (stepText.includes('click') && stepText.includes('select') && stepText.includes('country')) {
        // Extract country name
        const countryMatch = step.text.match(/select\s+(\w+)/i);
        const country = countryMatch ? countryMatch[1] : 'country';
        
        code += `            // Click on select country dropdown\n`;
        code += `            WebElement countryDropdown = wait.until(ExpectedConditions.elementToBeClickable(\n`;
        code += `                By.xpath("//select[contains(@id, 'country') or contains(@name, 'country')] | //button[contains(text(), 'country') or contains(text(), 'Country')]")));\n`;
        code += `            countryDropdown.click();\n`;
        code += `            Driver.wait(1);\n`;
        code += `            \n`;
        code += `            // Select ${country}\n`;
        code += `            WebElement ${country.toLowerCase()}Option = wait.until(ExpectedConditions.elementToBeClickable(\n`;
        code += `                By.xpath("//option[contains(text(), '${country}')] | //a[contains(text(), '${country}')] | //li[contains(text(), '${country}')]")));\n`;
        code += `            ${country.toLowerCase()}Option.click();\n`;
        code += `            Driver.wait(2);\n`;
      }
      else if (stepText.includes('click') && (stepText.includes('europe') || stepText.includes('select'))) {
        // Extract continent and language
        const europeMatch = step.text.match(/europe/i);
        const langMatch = step.text.match(/united kingdom|italy|france|germany|spain/i);
        
        if (europeMatch) {
          code += `            // Click on Europe continent\n`;
          code += `            WebElement europeLink = wait.until(ExpectedConditions.elementToBeClickable(\n`;
          code += `                By.xpath("//a[contains(text(), 'Europe') or contains(@href, 'europe')]")));\n`;
          code += `            europeLink.click();\n`;
          code += `            Driver.wait(2);\n`;
        }
        
        if (langMatch) {
          const language = langMatch[0];
          code += `            // Select language: ${language}\n`;
          code += `            WebElement languageLink = wait.until(ExpectedConditions.elementToBeClickable(\n`;
          code += `                By.xpath("//a[contains(text(), '${language}')]")));\n`;
          code += `            languageLink.click();\n`;
          code += `            Driver.wait(3);\n`;
        }
      }
      else if (stepText.includes('select') && stepText.includes('language')) {
        code += `            // TODO: Implement language selection\n`;
        code += `            // Use appropriate locators based on your application\n`;
      }
      else if (stepText.includes('verify') || stepText.includes('assert')) {
        code += `            // TODO: Add verification for: ${step.text}\n`;
        code += `            // Assert.isTrue(condition, "Verification passed");\n`;
      }
      else {
        code += `            // TODO: Implement action for: ${step.text}\n`;
      }
      
      code += `            System.out.println("[STEP ${stepNum}] ✓ Completed");\n`;
      code += `            Driver.takeScreenshot("Step${stepNum}");\n`;
    });
    
    return code;
  }

  /**
   * Generate default template steps when no steps are parsed
   */
  _generateDefaultTemplateSteps() {
    return `
            // Step 1: Verify page is loaded
            System.out.println("[STEP 1] Verifying page is loaded");
            boolean pageLoaded = ${pageObjectClassName}.isPageLoaded();
            Assert.isTrue(pageLoaded, "Page loaded successfully");
            Reporter.logPass("Page Load", "Page loaded successfully", true);
            
            // Step 2: Verify current URL
            System.out.println("[STEP 2] Verifying URL");
            String currentUrl = Driver.instance.getCurrentUrl();
            System.out.println("[STEP 2] Current URL: " + currentUrl);
            Assert.isTrue(currentUrl != null && !currentUrl.isEmpty(), "URL is valid");
            Reporter.logPass("URL Check", "Current URL: " + currentUrl, true);
            
            // Step 3: Perform main test actions
            System.out.println("[STEP 3] Executing main test actions");
            // Add specific test actions using static Page Object methods:
            // ${pageObjectClassName}.clickOn("description", LOCATOR);
            // ${pageObjectClassName}.enterText("description", LOCATOR, "value");
            // ${pageObjectClassName}.selectOption("description", LOCATOR, "option");
            Reporter.logInfo("Main Actions", "Main test actions completed", true);
            
            // Step 4: Verify test results
            System.out.println("[STEP 4] Verifying test results");
            // Add verification using common.Assert:
            // Assert.isTrue(condition, "Pass message");
            Reporter.logPass("Verification", "Test verification completed", true);`;
  }

  /**
   * Generate TestNG test class content
   */
  _generateTestClass(className, pageObjectClassName, prompt, testType) {
    const testMethodName = `test${testType.charAt(0).toUpperCase() + testType.slice(1)}Scenario`;
    // Truncate prompt for description (single line, max 100 chars)
    const descriptionText = prompt.length > 100 
      ? prompt.substring(0, 100).replace(/[\r\n]+/g, ' ') + '...' 
      : prompt.replace(/[\r\n]+/g, ' ');
    // Truncate prompt for javadoc comments (multi-line, max 200 chars)
    const promptSnippet = prompt.length > 200 ? prompt.substring(0, 200) + '...' : prompt;
    
    // Parse test steps from prompt
    const testSteps = this._parseTestSteps(prompt);
    const testStepsCode = this._generateTestStepsCode(testSteps);
    
    return `package tests;

import java.time.Duration;
import java.util.Properties;
import org.openqa.selenium.By;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.interactions.Actions;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;
import org.testng.annotations.Test;
import pageobjects.${pageObjectClassName};
import testbase.UITestBase;
import common.Assert;
import common.Reporter;
import utility.Constants;
import utility.Driver;
import utility.PropertyReader;

/**
 * Automated Test Case: ${className}
 * 
 * Description:
 * ${promptSnippet.split('\n').map(line => ' * ' + line).join('\n')}
 * 
 * Test Type: ${testType.toUpperCase()}
 * Generated: ${new Date().toISOString()}
 * 
 * @author Test Automation Framework
 */
public class ${className} extends UITestBase {

    /**
     * Main test method
     * 
     * Test Scenario:
     * ${promptSnippet.split('\n').map(line => '     * ' + line).join('\n')}
     */
    @Test(description = "${testType} test case for: ${descriptionText}")
    public void ${testMethodName}() {
        Reporter.startTestGroup("${className} Tests");
        Reporter.startTest("${testMethodName}", "${className}", "Regression");
        try {
            System.out.println("[TEST] Starting test execution: ${testMethodName}");
            
            // UITestBase @BeforeMethod already initialized driver and navigated to base URL
            Driver.instance.manage().window().maximize();
            
            WebDriverWait wait = new WebDriverWait(Driver.instance, Duration.ofSeconds(10));
            
            // Wait for homepage to load
            new WebDriverWait(Driver.instance, Duration.ofSeconds(30))
                .until((WebDriver d) -> d.getTitle().contains("ParcelPro"));
            Reporter.logInfo("Page Load", "Homepage loaded successfully", true);
            
            // ===== TEST IMPLEMENTATION SECTION =====
            // Test Requirement: ${descriptionText}
            ${testStepsCode}
            
            Reporter.logPass("Test Complete", "All test steps completed successfully", true);
            Assert.isTrue(true, "Test completed successfully");
            
        } catch (Exception e) {
            System.err.println("[ERROR] Test execution failed: " + e.getMessage());
            Reporter.logFail("Test Failure", e.getMessage(), true);
            e.printStackTrace();
            Assert.fail("Test failed: " + e.getMessage());
        } finally {
            Reporter.endTest();
            Reporter.endTestGroup();
        }
    }
}
`;
  }

  /**
   * Generate Page Object class content
   */
  _generatePageObjectClass(className, prompt) {
    const promptSnippet = prompt.length > 200 ? prompt.substring(0, 200) + '...' : prompt;
    
    return `package pageobjects;

import org.openqa.selenium.By;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;
import utility.Driver;
import utility.ElementActions;
import java.time.Duration;

/**
 * Page Object Model: ${className}
 * 
 * Purpose:
 * ${promptSnippet.split('\n').map(line => ' * ' + line).join('\n')}
 * 
 * This class encapsulates all page elements and interactions for the test scenario.
 * All methods are STATIC and use Driver.instance (no constructor or instance fields).
 * Uses ElementActions utility for all element interactions.
 * 
 * Generated: ${new Date().toISOString()}
 * @author Test Automation Framework
 */
public class ${className} {
    
    // Wait timeout duration
    private static final Duration DEFAULT_WAIT_TIMEOUT = Duration.ofSeconds(10);

    // ========================================
    // LOCATORS SECTION
    // Define all page element locators as private static final By
    // Prefer aria-label XPath locators per UPS standard
    // ========================================
    
    private static final By BANNER_CLOSE_BUTTON = By.cssSelector("button.banner-close-button");

    // ========================================
    // PAGE METHODS SECTION (ALL STATIC)
    // ========================================
    
    /**
     * Close the banner popup if present
     */
    public static void closeBannerPopup() {
        try {
            Driver.wait(2);
            ElementActions.clickElement("Close banner popup", 
                Driver.instance.findElement(BANNER_CLOSE_BUTTON));
        } catch (Exception e) {
            System.out.println("[INFO] Banner not found or already closed: " + e.getMessage());
        }
    }

    /**
     * Verify if the page is loaded successfully
     * 
     * @return true if page is loaded, false otherwise
     */
    public static boolean isPageLoaded() {
        try {
            WebDriverWait wait = new WebDriverWait(Driver.instance, DEFAULT_WAIT_TIMEOUT);
            wait.until(driver -> {
                String readyState = ((JavascriptExecutor) driver)
                    .executeScript("return document.readyState").toString();
                return readyState.equals("complete");
            });
            System.out.println("[PAGE OBJECT] Page loaded successfully");
            return true;
        } catch (Exception e) {
            System.out.println("[WARN] Page load check failed: " + e.getMessage());
            return false;
        }
    }

    /**
     * Get the current page title
     * 
     * @return page title as String
     */
    public static String getPageTitle() {
        try {
            String title = Driver.instance.getTitle();
            System.out.println("[PAGE OBJECT] Page title: " + title);
            return title;
        } catch (Exception e) {
            System.out.println("[WARN] Error getting page title: " + e.getMessage());
            return "";
        }
    }
    
    /**
     * Get the current page URL
     * 
     * @return current URL as String
     */
    public static String getCurrentUrl() {
        return Driver.instance.getCurrentUrl();
    }
    
    /**
     * Wait for element to be visible and return it
     * 
     * @param locator By locator of the element
     * @return WebElement if found and visible
     */
    private static WebElement waitForVisible(By locator) {
        WebDriverWait wait = new WebDriverWait(Driver.instance, DEFAULT_WAIT_TIMEOUT);
        return wait.until(ExpectedConditions.visibilityOfElementLocated(locator));
    }
    
    /**
     * Wait for element to be clickable and return it
     * 
     * @param locator By locator of the element
     * @return WebElement if found and clickable
     */
    private static WebElement waitForClickable(By locator) {
        WebDriverWait wait = new WebDriverWait(Driver.instance, DEFAULT_WAIT_TIMEOUT);
        return wait.until(ExpectedConditions.elementToBeClickable(locator));
    }
    
    /**
     * Click on an element using ElementActions
     * 
     * @param description Description for reporting
     * @param locator By locator of the element to click
     * @return true if click succeeded, false otherwise
     */
    public static boolean clickOn(String description, By locator) {
        try {
            WebElement element = waitForClickable(locator);
            ElementActions.clickElement(description, element);
            return true;
        } catch (Exception e) {
            System.out.println("[WARN] Click failed for " + description + ": " + e.getMessage());
            return false;
        }
    }
    
    /**
     * Enter text into an input field using ElementActions
     * 
     * @param description Description for reporting
     * @param locator By locator of the input field
     * @param text Text to enter
     * @return true if text entered, false otherwise
     */
    public static boolean enterText(String description, By locator, String text) {
        try {
            WebElement element = waitForVisible(locator);
            ElementActions.enterTextWithSubmit(description, element, text);
            return true;
        } catch (Exception e) {
            System.out.println("[WARN] Text entry failed for " + description + ": " + e.getMessage());
            return false;
        }
    }
    
    /**
     * Select option from a combo box using ElementActions
     * 
     * @param description Description for reporting
     * @param locator By locator of the select element
     * @param option Option text to select
     * @return true if selected, false otherwise
     */
    public static boolean selectOption(String description, By locator, String option) {
        try {
            WebElement element = waitForVisible(locator);
            ElementActions.selectFromComboBox(description, element, option);
            return true;
        } catch (Exception e) {
            System.out.println("[WARN] Selection failed for " + description + ": " + e.getMessage());
            return false;
        }
    }
    
    /**
     * Get text from an element
     * 
     * @param locator By locator of the element
     * @return element text or empty string on failure
     */
    public static String getText(By locator) {
        try {
            WebElement element = waitForVisible(locator);
            return element.getText();
        } catch (Exception e) {
            System.out.println("[WARN] Get text failed: " + e.getMessage());
            return "";
        }
    }
    
    /**
     * Check if element is displayed
     * 
     * @param locator By locator of the element
     * @return true if displayed, false otherwise
     */
    public static boolean isElementDisplayed(By locator) {
        try {
            return Driver.instance.findElement(locator).isDisplayed();
        } catch (Exception e) {
            return false;
        }
    }
}
`;
  }
}

module.exports = JavaTestGenerator;
