# Test Script Model Guide - UPS Enterprise Standards

## 📋 Reference Model
**Source File**: `ParcelProContactUsFormTest.java`  
**Location**: `C:\Users\GWJ6DMZ\Documents\eclipse\workspace\Unified-UPS-Repo\ups-global\ui.tests\test-module\src\test\java\parcelprotests\ParcelProContactUsFormTest.java`

This document provides the **EXACT patterns** to follow when generating test scripts using AI.

---

## 🎯 Complete Test Class Structure

### 1. Package Declaration
```java
package parcelprotests;
```
- **Rule**: All test classes go in `parcelprotests` package
- **Location**: `src/test/java/parcelprotests/YourTestName.java`

---

### 2. Import Organization (EXACT ORDER)

```java
// GROUP 1: Java standard libraries
import java.time.Duration;
import java.util.Arrays;
import java.util.Properties;

// GROUP 2: Selenium WebDriver
import org.openqa.selenium.Dimension;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.support.ui.ExpectedCondition;
import org.openqa.selenium.support.ui.WebDriverWait;

// GROUP 3: TestNG annotations
import org.testng.annotations.BeforeClass;
import org.testng.annotations.Test;

// GROUP 4: Framework - common
import common.Assert;

// GROUP 5: Framework - environment
import environment.OpenShiftProjectConfig;

// GROUP 6: Framework - pageobjects
import pageobjects.ApplicationPage;
import pageobjects.LoginPage;
import pageobjects.ParcelProHomePage;
import pageobjects.ParcelProLanguageSelectorPage;
import pageobjects.UPSersHomePage;

// GROUP 7: Framework - testbase
import testbase.UITestBase;

// GROUP 8: Framework - utility
import utility.Constants;
import utility.Driver;
import utility.ElementActions;
import utility.PropertyReader;
```

**Import Rules:**
- βœ… Group imports by category (Java → Selenium → TestNG → Framework)
- βœ… Order framework imports: common → environment → pageobjects → testbase → utility
- βœ… Only import what you actually use
- ❌ No wildcard imports (avoid `import utility.*`)

---

### 3. Class Declaration

```java
public class ParcelProContactUsFormTest extends UITestBase {
```

**Naming Convention:**
- Format: `ParcelPro[Feature]Test`
- Examples:
  - `ParcelProContactUsFormTest` - Contact form testing
  - `ParcelProLanguageSelectTest` - Language selection
  - `ParcelProLoginTest` - Login functionality
  - `ParcelProSearchTest` - Search functionality

**Inheritance:**
- βœ… **ALWAYS** extend `UITestBase`
- This provides: WebDriver setup, configuration loading, teardown

---

### 4. Setup Method (@BeforeClass)

```java
@BeforeClass
public void beforeClass() throws Exception {
    // Step 1: Load environment configuration for specific app
    OpenShiftProjectConfig data = config.getEnv("parcelpro");
    String appURL = data.ui.url;
    
    // Step 2: Set browser window size
    Driver.instance.manage().window().setSize(new Dimension(1920, 1080));
    
    // Step 3: Navigate to application URL
    Driver.instance.get(appURL);
    
    // Step 4: Wait for page to load (explicit wait with custom condition)
    new WebDriverWait(Driver.instance, Duration.ofSeconds(30))
        .until(new ExpectedCondition<Boolean>() {
            @Override
            public Boolean apply(WebDriver driver) {
                return Driver.instance.getTitle().contains("Insured Shipping Services | Parcel Pro");
            }
        });
    
    // Step 5: Verify page loaded correctly
    Assert.contains(Driver.instance.getTitle(), "Insured Shipping Services | Parcel Pro");
    
    // Step 6: Handle any pop-ups or initial UI elements
    ParcelProHomePage.clickCloseIcon();
}
```

**Key Patterns:**
1. **Configuration Loading**: `config.getEnv("parcelpro")` - Gets environment-specific config
2. **Window Sizing**: `new Dimension(1920, 1080)` - Consistent browser size
3. **Explicit Waits**: Custom `ExpectedCondition` for page title verification
4. **Assertions**: Verify page loaded before proceeding
5. **Pop-up Handling**: Close any modal dialogs or overlays

---

### 5. Test Method Structure

```java
@Test
public void verifyContactUsForm() throws Exception {
    // Step 1: Navigate to feature
    ParcelProHomePage.clickContactUslink();
    
    // Step 2: Verify navigation successful
    Assert.areEqual(Driver.instance.getTitle(), "Contact Us For Help and Services | Parcel Pro");
    
    // Step 3: Handle frames if needed
    ParcelProHomePage.switchToFrame("aemFormFrame");
    
    // Step 4: Load test data from properties file
    Properties prop = PropertyReader.readPropertyFile(Constants.PARCEL_PRO_CONTACTUS);
    
    // Step 5: Perform form actions using test data
    ParcelProHomePage.enterContactFirstName(prop.get("firstName").toString());
    ParcelProHomePage.enterContactLastName(prop.get("lastName").toString());
    ParcelProHomePage.enterContactCompanyName(prop.get("Company").toString());
    ParcelProHomePage.enterContactCountry(prop.get("Country").toString());
    ParcelProHomePage.enterContactState(prop.get("State").toString());
    ParcelProHomePage.enterZipCode(prop.get("Zipcode").toString());
    ParcelProHomePage.enterContactEmail(prop.get("Email").toString());
    ParcelProHomePage.enterContactPhoneNumber(prop.get("PhoneNumber").toString());
    ParcelProHomePage.selectRadioBtn(prop.get("Service").toString());
    
    // Step 6: Submit and verify
    ParcelProHomePage.clickContactSubmitBtnWithFlashMsg();
}
```

**Test Method Patterns:**
1. **Method Naming**: `verify[Feature]` or `test[Action]`
2. **Exception Handling**: `throws Exception` on method signature
3. **Page Interactions**: Use Page Object Model static methods
4. **Test Data**: Load from properties file using `PropertyReader`
5. **Assertions**: After navigation, before submission
6. **Frame Handling**: Switch to iframe when needed

---

## πŸ—οΈ Page Object Model Pattern

### Page Object Class Example:

```java
package pageobjects;

import org.openqa.selenium.By;
import utility.Driver;
import utility.ElementActions;

public class ParcelProHomePage {
    
    // Locators (private static final)
    private static final By CLOSE_ICON = By.cssSelector(".close-icon");
    private static final By CONTACT_US_LINK = By.linkText("Contact Us");
    private static final By IFRAME_CONTACTUS = By.name("aemFormFrame");
    private static final By INPUT_FIRSTNAME = By.id("firstName");
    private static final By INPUT_LASTNAME = By.id("lastName");
    private static final By INPUT_COMPANY = By.id("companyName");
    private static final By SELECT_COUNTRY = By.id("country");
    private static final By SELECT_STATE = By.id("state");
    private static final By INPUT_ZIPCODE = By.id("zipCode");
    private static final By INPUT_EMAIL = By.id("email");
    private static final By INPUT_PHONE = By.id("phoneNumber");
    private static final By SUBMIT_BTN = By.cssSelector("button[type='submit']");
    private static final By SUCCESS_MSG = By.className("flash-message");
    
    // Action methods (public static)
    public static void clickCloseIcon() {
        ElementActions.clickElement(CLOSE_ICON);
    }
    
    public static void clickContactUslink() {
        ElementActions.clickElement(CONTACT_US_LINK);
    }
    
    public static void switchToFrame(String frameName) {
        Driver.instance.switchTo().frame(frameName);
    }
    
    public static void enterContactFirstName(String firstName) {
        ElementActions.enterText(INPUT_FIRSTNAME, firstName);
    }
    
    public static void enterContactLastName(String lastName) {
        ElementActions.enterText(INPUT_LASTNAME, lastName);
    }
    
    public static void enterContactCompanyName(String company) {
        ElementActions.enterText(INPUT_COMPANY, company);
    }
    
    public static void enterContactCountry(String country) {
        ElementActions.selectDropdownByVisibleText(SELECT_COUNTRY, country);
    }
    
    public static void enterContactState(String state) {
        ElementActions.selectDropdownByVisibleText(SELECT_STATE, state);
    }
    
    public static void enterZipCode(String zipCode) {
        ElementActions.enterText(INPUT_ZIPCODE, zipCode);
    }
    
    public static void enterContactEmail(String email) {
        ElementActions.enterText(INPUT_EMAIL, email);
    }
    
    public static void enterContactPhoneNumber(String phone) {
        ElementActions.enterText(INPUT_PHONE, phone);
    }
    
    public static void selectRadioBtn(String serviceName) {
        By radioBtn = By.xpath("//input[@type='radio' and @value='" + serviceName + "']");
        ElementActions.clickElement(radioBtn);
    }
    
    public static void clickContactSubmitBtnWithFlashMsg() {
        ElementActions.clickElement(SUBMIT_BTN);
        ElementActions.waitForElementVisible(SUCCESS_MSG);
    }
}
```

**Page Object Rules:**
1. **Locators**: Private static final constants at top of class
2. **Locator Naming**: ALL_CAPS with descriptive names (INPUT_FIRSTNAME, SUBMIT_BTN)
3. **Methods**: Public static methods for each action
4. **Method Naming**: Verb + element name (clickCloseIcon, enterContactFirstName)
5. **Element Interactions**: Always use `ElementActions` class, never direct Selenium
6. **Return Type**: Void for actions, boolean/String for verification methods

---

## πŸ" Element Location Strategy

### Locator Priority (Use in this order):

1. **ID** (highest priority)
   ```java
   By.id("firstName")
   By.id("submitBtn")
   ```

2. **Name**
   ```java
   By.name("aemFormFrame")
   By.name("username")
   ```

3. **LinkText** (for links)
   ```java
   By.linkText("Contact Us")
   By.partialLinkText("Sign In")
   ```

4. **CSS Selector**
   ```java
   By.cssSelector(".close-icon")
   By.cssSelector("button[type='submit']")
   By.cssSelector("#contactForm input[name='email']")
   ```

5. **XPath** (last resort, only when necessary)
   ```java
   By.xpath("//input[@type='radio' and @value='Service']")
   By.xpath("//div[@class='form-group']//label[text()='Country']/following-sibling::select")
   ```

### Element Location Best Practices:

βœ… **DO:**
- Use ID whenever available
- Use stable attributes (id, name, data-testid)
- Keep locators simple and readable
- Store locators as constants in Page Object class
- Use CSS selectors over XPath when possible

❌ **DON'T:**
- Use fragile locators (text that changes, index-based)
- Use absolute XPath `/html/body/div[1]/div[2]...`
- Hardcode locators in test methods
- Use complex XPath when simple selectors work

---

## πŸ"Š Test Data Management

### 1. Properties File Structure

**File Location**: `src/test/resources/testdata/parcelProContactUs.properties`

```properties
# Contact Us Form Test Data
firstName=John
lastName=Doe
Company=UPS Test Company
Country=United States
State=Georgia
Zipcode=30339
Email=john.doe@ups.com
PhoneNumber=4045551234
Service=Package Tracking
```

### 2. Constants Definition

**File**: `utility/Constants.java`

```java
public class Constants {
    // Base paths
    public static final String TESTDATA_PATH = "src/test/resources/testdata/";
    
    // Property files
    public static final String PARCEL_PRO_CONTACTUS = TESTDATA_PATH + "parcelProContactUs.properties";
    public static final String PARCEL_PRO_LOGIN = TESTDATA_PATH + "parcelProLogin.properties";
    public static final String PARCEL_PRO_SEARCH = TESTDATA_PATH + "parcelProSearch.properties";
}
```

### 3. Loading Test Data in Tests

```java
// Load properties file
Properties prop = PropertyReader.readPropertyFile(Constants.PARCEL_PRO_CONTACTUS);

// Access values
String firstName = prop.get("firstName").toString();
String lastName = prop.get("lastName").toString();
String email = prop.get("Email").toString();
```

---

## βš™οΈ Configuration Management

### Environment Config Structure:

```java
// Load environment-specific configuration
OpenShiftProjectConfig data = config.getEnv("parcelpro");

// Access configuration values
String appURL = data.ui.url;              // Application URL
String username = data.ui.username;        // Test user
String password = data.ui.password;        // Test password
```

### Environment JSON Example:

**File**: `src/test/resources/environment.json`

```json
{
  "parcelpro": {
    "ui": {
      "url": "https://parcelpro3.ams1907.com",
      "username": "testuser@ups.com",
      "password": "testpass123",
      "recordOwner": "ParcelPro"
    }
  }
}
```

---

## πŸ§ͺ Assertion Patterns

### 1. Title Verification
```java
// Contains check
Assert.contains(Driver.instance.getTitle(), "Expected Title Part");

// Exact match
Assert.areEqual(Driver.instance.getTitle(), "Exact Page Title");
```

### 2. Element Visibility
```java
// Verify element is visible
Assert.assertTrue(
    ElementActions.isElementVisible(By.id("successMsg")),
    "Success message should be displayed"
);
```

### 3. Text Verification
```java
// Verify element text
String actualText = ElementActions.getElementText(By.className("header"));
Assert.areEqual(actualText, "Expected Header Text");
```

### 4. URL Verification
```java
// Verify current URL
Assert.contains(Driver.instance.getCurrentUrl(), "/contact-us");
```

---

## ⏱️ Wait Strategies

### 1. Explicit Wait with Custom Condition
```java
new WebDriverWait(Driver.instance, Duration.ofSeconds(30))
    .until(new ExpectedCondition<Boolean>() {
        @Override
        public Boolean apply(WebDriver driver) {
            return Driver.instance.getTitle().contains("Expected Title");
        }
    });
```

### 2. Wait for Element (via ElementActions)
```java
// Wait for element to be clickable
ElementActions.clickElement(By.id("submitBtn"));  // Has built-in wait

// Wait for element to be visible
ElementActions.waitForElementVisible(By.className("success-msg"));
```

### 3. Page Load Wait
```java
// Wait for specific page load indicator
new WebDriverWait(Driver.instance, Duration.ofSeconds(30))
    .until(driver -> ((JavascriptExecutor) driver)
        .executeScript("return document.readyState").equals("complete"));
```

---

## πŸ–₯️ Frame/iFrame Handling

### Switch to Frame:
```java
// By name or id
ParcelProHomePage.switchToFrame("aemFormFrame");
// OR in Driver utility:
Driver.instance.switchTo().frame("frameName");

// By WebElement
WebElement frameElement = Driver.instance.findElement(By.id("frameId"));
Driver.instance.switchTo().frame(frameElement);
```

### Switch Back to Default Content:
```java
Driver.instance.switchTo().defaultContent();
```

---

## πŸ"‹ Complete Test Class Template (Production-Ready)

```java
package parcelprotests;

import java.time.Duration;
import java.util.Properties;

import org.openqa.selenium.Dimension;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.support.ui.ExpectedCondition;
import org.openqa.selenium.support.ui.WebDriverWait;
import org.testng.annotations.BeforeClass;
import org.testng.annotations.Test;

import common.Assert;
import environment.OpenShiftProjectConfig;
import pageobjects.ParcelProHomePage;
import testbase.UITestBase;
import utility.Constants;
import utility.Driver;
import utility.PropertyReader;

/**
 * Test Class: ParcelPro[Feature]Test
 * 
 * Description: [Brief description of what this test validates]
 * 
 * Test Coverage:
 * - [Feature 1]
 * - [Feature 2]
 * 
 * Azure DevOps Work Item: [Work Item ID if applicable]
 * 
 * @author AI Test Generator
 * @date February 20, 2026
 */
public class ParcelProFeatureTest extends UITestBase {

    /**
     * Setup method - Executes once before all tests in this class
     * - Loads environment configuration
     * - Sets browser window size
     * - Navigates to application URL
     * - Waits for page load
     * - Handles initial pop-ups
     */
    @BeforeClass
    public void beforeClass() throws Exception {
        // Load environment configuration
        OpenShiftProjectConfig data = config.getEnv("parcelpro");
        String appURL = data.ui.url;
        
        // Set browser window size for consistent behavior
        Driver.instance.manage().window().setSize(new Dimension(1920, 1080));
        
        // Navigate to application
        Driver.instance.get(appURL);
        
        // Wait for page to load completely
        new WebDriverWait(Driver.instance, Duration.ofSeconds(30))
            .until(new ExpectedCondition<Boolean>() {
                @Override
                public Boolean apply(WebDriver driver) {
                    return Driver.instance.getTitle().contains("Insured Shipping Services | Parcel Pro");
                }
            });
        
        // Verify page loaded successfully
        Assert.contains(Driver.instance.getTitle(), "Insured Shipping Services | Parcel Pro");
        
        // Close any pop-ups or modal dialogs
        ParcelProHomePage.clickCloseIcon();
    }
    
    /**
     * Test Method: verify[Feature]
     * 
     * Description: [Detailed description of what this test does]
     * 
     * Steps:
     * 1. [Step 1]
     * 2. [Step 2]
     * 3. [Step 3]
     * 
     * Expected Result: [What should happen if test passes]
     */
    @Test
    public void verifyFeature() throws Exception {
        // Step 1: Navigate to feature
        ParcelProHomePage.clickFeatureLink();
        
        // Step 2: Verify navigation successful
        Assert.areEqual(Driver.instance.getTitle(), "Expected Page Title");
        
        // Step 3: Load test data
        Properties prop = PropertyReader.readPropertyFile(Constants.PARCEL_PRO_FEATURE);
        
        // Step 4: Perform actions using Page Object methods
        ParcelProHomePage.enterField1(prop.get("field1").toString());
        ParcelProHomePage.enterField2(prop.get("field2").toString());
        
        // Step 5: Submit and verify result
        ParcelProHomePage.clickSubmitBtn();
        Assert.assertTrue(
            ParcelProHomePage.isSuccessMessageDisplayed(),
            "Success message should be displayed after submission"
        );
    }
}
```

---

## πŸš€ AI Test Generation Checklist

When AI generates a new test script, it MUST follow these steps:

### βœ… Pre-Generation Phase:
- [ ] Identify the feature/functionality to test
- [ ] Determine required Page Objects (create if missing)
- [ ] Define test data requirements
- [ ] Plan test steps and assertions

### βœ… Generation Phase:
- [ ] Use correct package: `package parcelprotests;`
- [ ] Add imports in proper order (Java β†' Selenium β†' TestNG β†' Framework)
- [ ] Extend `UITestBase`
- [ ] Add JavaDoc class comment with description
- [ ] Implement `@BeforeClass` with environment config and setup
- [ ] Add test methods with `@Test` annotation
- [ ] Use Page Object Model for all element interactions
- [ ] Load test data from properties file
- [ ] Add assertions after key actions
- [ ] Handle frames/iframes if needed
- [ ] Use explicit waits for dynamic content

### βœ… Post-Generation Phase:
- [ ] Create corresponding Page Object class if needed
- [ ] Create properties file with test data
- [ ] Add constant to `Constants.java` for property file path
- [ ] Verify all imports resolve correctly
- [ ] Ensure no compilation errors

---

## πŸ"— Reference Files

**Test Class Model**:
```
C:\Users\GWJ6DMZ\Documents\eclipse\workspace\Unified-UPS-Repo\ups-global\ui.tests\test-module\src\test\java\parcelprotests\ParcelProContactUsFormTest.java
```

**Current Project Location**:
```
C:\Users\GWJ6DMZ\Desktop\FINAL_AI\FINAL FUNCTIONAL TEST Using UPS MCP\src\test\java\parcelprotests\
```

**Framework Documentation**:
- [FRAMEWORK_USAGE_GUIDE.md](FRAMEWORK_USAGE_GUIDE.md) - Complete framework component guide

---

## πŸ"Œ Key Takeaways

1. **ALWAYS extend UITestBase** - Never create standalone test classes
2. **Use Page Object Model** - No locators or element interactions in test methods
3. **Load configuration** - Use `config.getEnv("parcelpro")` for environment settings
4. **Externalize test data** - Use properties files and `PropertyReader`
5. **Add explicit waits** - For page loads and dynamic content
6. **Use custom assertions** - `Assert.contains()`, `Assert.areEqual()`
7. **Set window size** - `new Dimension(1920, 1080)` for consistency
8. **Document thoroughly** - JavaDoc comments on classes and methods
9. **Follow naming conventions** - `ParcelPro[Feature]Test`, `verify[Action]()`
10. **Use ElementActions** - Never direct Selenium calls in tests or page objects

---

**Last Updated**: February 20, 2026  
**Model Source**: UPS Global UI Test Framework  
**Reference Test**: ParcelProContactUsFormTest.java
