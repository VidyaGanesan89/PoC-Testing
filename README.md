# ParcelPro Selenium Automation Framework

A Maven-based Selenium automation testing framework using TestNG and Page Object Model (POM) design pattern.

## Project Structure

```
FINAL FUNCTIONAL TEST Using UPS MCP/
├── pom.xml
├── README.md
└── src
    └── test
        ├── java
        │   ├── common
        │   │   └── Assertions.java
        │   ├── pageobjects
        │   │   └── ParcelProLanguageSelectorPage.java
        │   ├── parcelprotests
        │   │   └── ParcelProLanguageSelectTest.java
        │   ├── testbase
        │   │   └── UITestBase.java
        │   └── utility
        │       ├── Constants.java
        │       ├── Driver.java
        │       ├── ElementActions.java
        │       └── PropertyReader.java
        └── resources
            ├── test.properties
            └── testng.xml
```

## Features

- ✅ **Page Object Model (POM)** design pattern
- ✅ **TestNG** framework for test execution and assertions
- ✅ **Selenium 4.27.0** (latest version)
- ✅ **WebDriverManager** for automatic driver management
- ✅ **Explicit waits** instead of Thread.sleep
- ✅ **Try-catch** exception handling throughout
- ✅ **Property-based configuration**
- ✅ **Comprehensive logging**

## Prerequisites

- Java 11 or higher
- Maven 3.6 or higher
- Internet connection (for downloading dependencies and WebDriver binaries)

## Installation

1. **Clone or navigate to the project directory:**
   ```bash
   cd "c:\Users\GWJ6DMZ\Desktop\FINAL_AI\FINAL FUNCTIONAL TEST Using UPS MCP"
   ```

2. **Install Maven dependencies:**
   ```bash
   mvn clean install -DskipTests
   ```

## Configuration

Edit `src/test/resources/test.properties` to configure:

```properties
# Browser: chrome, firefox, edge
browser=chrome

# Run in headless mode
headless=false

# Application URLs
base.url=https://parcelpro3.ams1907.com
```

## Running Tests

### Option 1: Run all tests using Maven
```bash
mvn clean test
```

### Option 2: Run specific test using TestNG XML
```bash
mvn test -DsuiteXmlFile=src/test/resources/testng.xml
```

### Option 3: Run specific test class
```bash
mvn test -Dtest=ParcelProLanguageSelectTest
```

### Option 4: Run specific test method
```bash
mvn test -Dtest=ParcelProLanguageSelectTest#verifyLanguageSelection
```

## Test Scenarios

### ParcelProLanguageSelectTest

**Test 1: Verify Language Selection**
- Launch URL: https://parcelpro3.ams1907.com
- Click on language dropdown (United States - English)
- Navigate to global page
- Select "Asia & India Subcontinent"
- Select "India – English"
- Verify selected language

**Test 2: Verify Global Page Navigation**
- Launch URL: https://parcelpro3.ams1907.com
- Click on language selector
- Verify navigation to global.html page

## UPS Selenium MCP Integration

This framework is designed to work with the **ups-selenium MCP (Model Context Protocol)** server for browser automation.

### Prerequisites for MCP
- ups-selenium MCP server must be running
- Configure MCP connection in your environment

### Running Tests with UPS MCP

The framework uses standard Selenium WebDriver which can be integrated with MCP for enhanced automation capabilities.

## Framework Components

### Base Classes
- **UITestBase**: Base test class with @BeforeMethod and @AfterMethod setup/teardown

### Page Objects
- **ParcelProLanguageSelectorPage**: Language and country selection functionality

### Utilities
- **Driver**: WebDriver initialization and common wait operations
- **ElementActions**: Wrapper methods for Selenium actions with logging
- **PropertyReader**: Read configuration from properties file
- **Constants**: Application-wide constants

### Common
- **Assertions**: Custom assertion utilities

## Test Reports

After test execution, TestNG generates reports in:
```
target/surefire-reports/
```

Open `index.html` in a browser to view detailed test results.

## Best Practices Implemented

1. ✅ **Page Object Model**: Separation of page logic from test logic
2. ✅ **Explicit Waits**: Using WebDriverWait and ExpectedConditions
3. ✅ **TestNG Assertions**: Added at the end of tests only
4. ✅ **Exception Handling**: Try-catch blocks for all operations
5. ✅ **Recommended Locators**: Priority order - ID, Name, CSS, XPath
6. ✅ **JavaDoc Comments**: Comprehensive documentation
7. ✅ **Logging**: Console output for debugging
8. ✅ **Property-based Config**: Externalized test data

## Troubleshooting

### Issue: WebDriver not found
**Solution**: WebDriverManager will automatically download the required driver. Ensure internet connectivity.

### Issue: Element not found
**Solution**: Increase timeout values in `test.properties` or check if locators need updating.

### Issue: Tests fail in headless mode
**Solution**: Set `headless=false` in `test.properties` to debug visually.

### Issue: Maven build fails
**Solution**: Run `mvn clean install -U` to force update dependencies.

## Supported Browsers

- Google Chrome (default)
- Mozilla Firefox
- Microsoft Edge

Set browser in `test.properties`:
```properties
browser=chrome
```

## Author

Generated for ParcelPro Automation Testing

## License

Internal use only
