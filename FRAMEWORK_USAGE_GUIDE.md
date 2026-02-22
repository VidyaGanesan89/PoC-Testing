# UPS Test Framework - AI Test Generation Guide

## Overview
This project now includes the enterprise-grade UPS test automation framework files copied from the UPS Global Repository. These files provide robust utilities, configuration management, data providers, and base classes for test automation.

---

## 📁 Framework Structure

```
src/test/java/
├── common/              ✅ Base classes and utilities
├── data/                ✅ Data helper classes  
├── dataprovider/        ✅ Test data providers (CSV, Excel, XML)
├── environment/         ✅ Environment configuration classes
├── pageobjects/         📄 Page Object Models (POM)
├── parcelprotests/      🧪 Test classes
├── testbase/            🎯 Test base classes
└── utility/             🔧 Utility classes
```

---

## 🎯 Framework Components

### 1. **common/** - Base Classes & Core Components

| File | Purpose | Usage in AI-Generated Tests |
|------|---------|------------------------------|
| `DriverBase.java` | Abstract base class for WebDriver management | Extend this instead of creating custom driver setup |
| `ElementActionsBase.java` | Enhanced element interaction methods | Use for robust element operations (wait, click, type) |
| `Assert.java` | Custom assertion methods | Use for test assertions with better error messages |
| `Reporter.java` | Test reporting utilities | Use for logging test steps and results |
| `Timer.java` | Timing and performance tracking | Use for measuring page load times |

**Example Usage:**
```java
// Instead of standard Selenium:
driver.findElement(By.id("username")).sendKeys("test");

// Use ElementActionsBase methods:
enterText(By.id("username"), "test");
```

### 2. **data/** - Data Helper Classes

| File | Purpose | Usage in AI-Generated Tests |
|------|---------|------------------------------|
| `DateHelper.java` | Date manipulation utilities | Use for test data with dates (format, parse, calculate) |

**Example Usage:**
```java
import data.DateHelper;

String futureDate = DateHelper.addDays(new Date(), 7);
String formattedDate = DateHelper.format(futureDate, "MM/dd/yyyy");
```

### 3. **dataprovider/** - Test Data Providers

| File | Purpose | Usage in AI-Generated Tests |
|------|---------|------------------------------|
| `DataProviderUtils.java` | Generic data provider for TestNG | Use `@DataProvider(name="dataprovider")` annotation |
| `ReadCsv.java` | Read test data from CSV files | Automatically reads CSV based on test method name |
| `ReadExcel.java` | Read test data from Excel files | Automatically reads Excel based on test method name |
| `ReadXml.java` | Read test data from XML files | Automatically reads XML based on test method name |

**Example Usage:**
```java
import dataprovider.DataProviderUtils;

@Test(dataProvider = "dataprovider", dataProviderClass = DataProviderUtils.class)
public void testLoginWithMultipleUsers(String username, String password) {
    // Test data will be read from testLoginWithMultipleUsers.csv
    // or testLoginWithMultipleUsers.xlsx based on config
}
```

### 4. **environment/** - Environment Configuration

| File | Purpose | Usage in AI-Generated Tests |
|------|---------|------------------------------|
| `EnvironmentConfig.java` | Main environment configuration loader | Load environment-specific settings |
| `UIConfig.java` | UI test configuration (URL, credentials) | Access base URL, test users |
| `APIConfig.java` | API test configuration | API endpoints, tokens |
| `DB2Config.java` | Database configuration | DB connection details |
| `CommonConfig.java` | Common configuration settings | Shared settings across environments |
| `AMQConfig.java` | Message queue configuration | MQ connection details |
| `OpenShiftProjectConfig.java` | OpenShift deployment config | Container deployment settings |

**Example Usage:**
```java
import environment.EnvironmentConfig;
import environment.UIConfig;
import utility.CommonUtils;

// Load environment configuration
EnvironmentConfig config = CommonUtils.populateEnvConfig();
UIConfig uiConfig = config.ui;

// Use configuration
driver.get(uiConfig.url);
loginPage.login(uiConfig.username, uiConfig.password);
```

### 5. **utility/** - Utility Classes

| File | Purpose | Usage in AI-Generated Tests |
|------|---------|------------------------------|
| `Driver.java` | WebDriver singleton instance | Access global WebDriver instance |
| `Constants.java` | Project-wide constants | Use predefined paths, timeouts, URLs |
| `PropertyReader.java` | Read properties files | Load configuration from .properties |
| `ElementActions.java` | Enhanced element actions | Robust element interactions with waits |
| `CommonUtils.java` | Common utility methods | String manipulation, file operations |
| `TestListener.java` | TestNG listener for reporting | Automatically attached to test execution |

**Example Usage:**
```java
import utility.Driver;
import utility.Constants;
import utility.ElementActions;

// Access WebDriver
WebDriver driver = Driver.instance;

// Use constants
String baseUrl = Constants.BASE_URL;
int timeout = Constants.DEFAULT_TIMEOUT;

// Use ElementActions for robust interactions
ElementActions.clickElement(By.id("submitBtn"));
ElementActions.enterText(By.name("username"), "testuser");
boolean isVisible = ElementActions.isElementVisible(By.className("error-msg"));
```

---

## 🤖 AI Test Generation Guidelines

### When Generating New Test Scripts:

#### 1. **Always Extend Base Classes**
```java
// ❌ DON'T:
public class MyTest {
    WebDriver driver;
    
    @BeforeMethod
    public void setup() {
        driver = new ChromeDriver();
    }
}

// ✅ DO:
import testbase.UITestBase;

public class MyTest extends UITestBase {
    // Driver is already initialized from UITestBase
}
```

#### 2. **Use Environment Configuration**
```java
// ❌ DON'T:
String url = "https://parcelpro3.ams1907.com";
String username = "testuser";

// ✅ DO:
EnvironmentConfig config = CommonUtils.populateEnvConfig();
String url = config.ui.url;
String username = config.ui.username;
```

#### 3. **Use Data Providers for Data-Driven Tests**
```java
// ❌ DON'T:
@Test
public void testLogin() {
    login("user1", "pass1");
    login("user2", "pass2");
    login("user3", "pass3");
}

// ✅ DO:
@Test(dataProvider = "dataprovider", dataProviderClass = DataProviderUtils.class)
public void testLogin(String username, String password) {
    loginPage.login(username, password);
    Assert.assertTrue(homePage.isDisplayed());
}
// Create testLogin.csv with username,password data
```

#### 4. **Use Enhanced Element Actions**
```java
// ❌ DON'T:
WebElement element = driver.findElement(By.id("button"));
element.click();

// ✅ DO:
import utility.ElementActions;

ElementActions.clickElement(By.id("button"));
// Includes implicit waits, error handling, retry logic
```

#### 5. **Use Custom Assertions**
```java
// ❌ DON'T:
org.testng.Assert.assertTrue(element.isDisplayed());

// ✅ DO:
import common.Assert;

Assert.assertTrue(element.isDisplayed(), "Login button should be visible");
// Provides better error messages and logging
```

#### 6. **Leverage Reporter for Logging**
```java
import common.Reporter;

@Test
public void testCheckout() {
    Reporter.log("Step 1: Navigate to product page");
    productPage.open();
    
    Reporter.log("Step 2: Add product to cart");
    productPage.addToCart();
    
    Reporter.log("Step 3: Proceed to checkout");
    cartPage.checkout();
}
```

---

## 📋 Test Class Template for AI Generation

```java
package parcelprotests;

import common.Assert;
import common.Reporter;
import dataprovider.DataProviderUtils;
import environment.EnvironmentConfig;
import org.openqa.selenium.By;
import org.testng.annotations.Test;
import pageobjects.YourPageObjectName;
import testbase.UITestBase;
import utility.CommonUtils;
import utility.Driver;
import utility.ElementActions;

/**
 * Test Class: YourTestName
 * Description: Brief description of what this test validates
 * 
 * Azure DevOps Work Item: [ID if applicable]
 * Test Type: [Functional/Regression/Smoke]
 */
public class YourTestName extends UITestBase {
    
    // Page objects
    private YourPageObjectName page;
    
    /**
     * Test method description
     */
    @Test(priority = 1, description = "Test description")
    public void testMethodName() {
        // Load environment config
        EnvironmentConfig config = CommonUtils.populateEnvConfig();
        
        // Step 1: Navigate to page
        Reporter.log("Step 1: Navigating to " + config.ui.url);
        Driver.instance.get(config.ui.url);
        
        // Step 2: Perform actions
        Reporter.log("Step 2: Performing action");
        ElementActions.clickElement(By.id("yourElement"));
        
        // Step 3: Validate results
        Reporter.log("Step 3: Validating results");
        Assert.assertTrue(
            ElementActions.isElementVisible(By.className("success")),
            "Success message should be visible"
        );
    }
    
    /**
     * Data-driven test example
     */
    @Test(
        priority = 2,
        dataProvider = "dataprovider",
        dataProviderClass = DataProviderUtils.class,
        description = "Data-driven test"
    )
    public void testWithDataProvider(String field1, String field2) {
        Reporter.log("Testing with data: " + field1 + ", " + field2);
        // Test implementation
    }
}
```

---

## 🗂️ Configuration Files Required

### 1. **environment.json** (Place in `src/test/resources/`)
```json
{
  "common": {
    "browser": "CHROME",
    "dataFile": "CSV",
    "environment": "DEV"
  },
  "ui": {
    "url": "https://parcelpro3.ams1907.com",
    "username": "testuser",
    "password": "testpass",
    "recordOwner": "ParcelPro"
  },
  "api": {
    "baseUrl": "https://api.parcelpro.com",
    "token": "your-api-token"
  }
}
```

### 2. **Test Data Files** (Place in `src/test/resources/testdata/`)
- CSV format: `testMethodName.csv`
- Excel format: `testMethodName.xlsx`
- XML format: `testMethodName.xml`

**Example: testLogin.csv**
```csv
username,password,expectedResult
validUser,validPass,success
invalidUser,wrongPass,error
emptyUser,,error
```

---

## 🚀 Running Tests with Framework

### Command Line Execution:
```bash
# Run all tests
mvn clean test

# Run specific test class
mvn test -Dtest=LanguageSelectTest

# Run with specific environment
mvn test -Denvironment=QA

# Run with specific browser
mvn test -Dbrowser=FIREFOX
```

### From Backend API:
```javascript
// POST http://localhost:8080/api/generate-test
{
  "testType": "functional",
  "prompt": "Use Azure DevOps work item 36237 to generate test",
  "azureDevOps": true,
  "relatedWorkItemIds": [36237]
}
```

---

## 📝 Best Practices for AI-Generated Tests

1. **Always use framework classes** instead of raw Selenium
2. **Extend UITestBase** for all UI test classes
3. **Use Page Object Model** - create page objects in `pageobjects/`
4. **Externalize test data** - use data providers for parameterization
5. **Add Reporter.log()** statements for better traceability
6. **Use custom Assert** methods for better error messages
7. **Load environment config** for URLs, credentials, settings
8. **Follow naming conventions**:
   - Test classes: `FeatureNameTest.java`
   - Page objects: `FeatureNamePage.java`
   - Test methods: `testActionDescription()`

---

## 🔍 Import Statements Checklist

When generating new test classes, include these imports:

```java
// Framework Base
import testbase.UITestBase;

// Common utilities
import common.Assert;
import common.Reporter;
import common.Timer;

// Environment & Config
import environment.EnvironmentConfig;
import utility.CommonUtils;
import utility.Constants;

// WebDriver & Actions
import utility.Driver;
import utility.ElementActions;

// Data Provider (if data-driven)
import dataprovider.DataProviderUtils;

// TestNG
import org.testng.annotations.Test;
import org.testng.annotations.BeforeMethod;
import org.testng.annotations.AfterMethod;

// Selenium (as needed)
import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;
```

---

## 📊 Framework Files Summary

**Total Files Copied:** 20+ files
- **common/**: 6 files (Assert, DriverBase, ElementActionsBase, Reporter, Timer, Assertions)
- **data/**: 1 file (DateHelper)
- **dataprovider/**: 4 files (DataProviderUtils, ReadCsv, ReadExcel, ReadXml)
- **environment/**: 7 files (EnvironmentConfig, UIConfig, APIConfig, DB2Config, CommonConfig, AMQConfig, OpenShiftProjectConfig)
- **utility/**: 6 files (Driver, Constants, PropertyReader, ElementActions, CommonUtils, TestListener)

**Framework Features:**
✅ Multi-browser support (Chrome, Firefox, Edge, Safari, IE)  
✅ Environment-based configuration (DEV, QA, PROD)  
✅ Data-driven testing (CSV, Excel, XML)  
✅ Page Object Model support  
✅ Enhanced element actions with waits  
✅ Custom assertions and reporting  
✅ Performance timing utilities  
✅ API, DB, and MQ configuration support  

---

## 🎓 Example: Converting Simple Test to Framework Test

### Before (Simple Test):
```java
public class SimpleTest {
    WebDriver driver;
    
    @BeforeMethod
    public void setup() {
        driver = new ChromeDriver();
        driver.manage().timeouts().implicitlyWait(Duration.ofSeconds(10));
    }
    
    @Test
    public void testLogin() {
        driver.get("https://parcelpro3.ams1907.com");
        driver.findElement(By.id("username")).sendKeys("testuser");
        driver.findElement(By.id("password")).sendKeys("testpass");
        driver.findElement(By.id("loginBtn")).click();
        
        Assert.assertTrue(driver.findElement(By.id("welcome")).isDisplayed());
    }
    
    @AfterMethod
    public void teardown() {
        driver.quit();
    }
}
```

### After (Framework Test):
```java
package parcelprotests;

import common.Assert;
import common.Reporter;
import environment.EnvironmentConfig;
import org.openqa.selenium.By;
import org.testng.annotations.Test;
import testbase.UITestBase;
import utility.CommonUtils;
import utility.Driver;
import utility.ElementActions;

public class LoginTest extends UITestBase {
    
    @Test(description = "Verify user can login with valid credentials")
    public void testLogin() {
        // Load configuration
        EnvironmentConfig config = CommonUtils.populateEnvConfig();
        
        // Step 1: Navigate
        Reporter.log("Step 1: Navigate to login page");
        Driver.instance.get(config.ui.url);
        
        // Step 2: Enter credentials
        Reporter.log("Step 2: Enter username and password");
        ElementActions.enterText(By.id("username"), config.ui.username);
        ElementActions.enterText(By.id("password"), config.ui.password);
        
        // Step 3: Click login
        Reporter.log("Step 3: Click login button");
        ElementActions.clickElement(By.id("loginBtn"));
        
        // Step 4: Validate success
        Reporter.log("Step 4: Verify successful login");
        Assert.assertTrue(
            ElementActions.isElementVisible(By.id("welcome")),
            "Welcome message should be visible after login"
        );
    }
}
```

---

## 🔗 Integration with AI Test Generation

When the AI generates test scripts, it should:

1. **Analyze the prompt/requirement**
2. **Select appropriate framework classes**
3. **Extend UITestBase**
4. **Use environment configuration**
5. **Implement Page Object if needed**
6. **Add data provider if data-driven**
7. **Use ElementActions for interactions**
8. **Use custom Assert for validations**
9. **Add Reporter.log() for traceability**
10. **Follow naming conventions**

---

## 📞 Support & Documentation

- **Framework Source**: `C:\Users\GWJ6DMZ\Documents\eclipse\workspace\Unified-UPS-Repo\ups-global\ui.tests\test-module\src\main\java`
- **Project Location**: `C:\Users\GWJ6DMZ\Desktop\FINAL_AI\FINAL FUNCTIONAL TEST Using UPS MCP\src\test\java`
- **Backend API**: `http://localhost:8080/api/generate-test`
- **Frontend UI**: `http://localhost:3000`

---

**Last Updated**: February 20, 2026  
**Framework Version**: UPS Global UI Test Framework  
**Project**: ParcelPro Test Automation Platform
