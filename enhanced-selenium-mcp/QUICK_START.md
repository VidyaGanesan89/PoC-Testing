# Enhanced Selenium Wrapper - Quick Start

## What is This?

A library of 30+ Selenium WebDriver helper functions organized into 9 modules that make browser automation easier. **No npm install required** - just import and use!

## Why Use It?

Instead of writing complex Selenium code repeatedly, use pre-built functions:

**Before (Standard Selenium):**
```javascript
const Select = require('selenium-webdriver/lib/select');
const element = await driver.findElement(By.id('dropdown'));
const select = new Select(element);
await select.selectByVisibleText('Option 1');
```

**After (Enhanced Wrapper):**
```javascript
import { selectDropdown } from '../enhanced-selenium-mcp/src/index.js';

await selectDropdown(driver, {
  by: 'id',
  value: 'dropdown',
  selectBy: 'text',
  optionValue: 'Option 1'
});
```

## Available Functions (30+)

### Dropdowns (2)
- `selectDropdown()` - Select option by value/text/index
- `getSelectedOption()` - Get current selection

### Alerts (4)
- `alertAccept()` - Click OK
- `alertDismiss()` - Click Cancel
- `alertGetText()` - Read alert message
- `alertSendKeys()` - Type into prompt

### Iframes (3)
- `switchToIframe()` - Switch to iframe
- `switchToDefaultContent()` - Return to main page
- `switchToParentFrame()` - Go to parent frame

### Windows (3)
- `switchToWindow()` - Switch tabs/windows
- `getWindowHandles()` - Get all window IDs
- `closeCurrentWindow()` - Close current tab

### Scrolling (4)
- `scrollToElement()` - Scroll element into view
- `scrollByOffset()` - Scroll by pixels
- `scrollToTop()` - Go to page top
- `scrollToBottom()` - Go to page bottom

### Waits (4)
- `waitForElementVisible()` - Wait until visible
- `waitForElementClickable()` - Wait until clickable
- `waitForElementNotVisible()` - Wait until hidden
- `explicitWait()` - Sleep for duration

### Elements (6)
- `clearInput()` - Clear text field
- `getAttribute()` - Get attribute value
- `elementExists()` - Check if exists
- `isDisplayed()` - Check if visible
- `isEnabled()` - Check if enabled

### Navigation (5)
- `refreshPage()` - Reload page
- `navigateBack()` - Browser back
- `navigateForward()` - Browser forward
- `getCurrentUrl()` - Get current URL
- `getPageTitle()` - Get page title

### Browser (3)
- `maximizeWindow()` - Maximize window
- `setWindowSize()` - Set dimensions
- `executeJavaScript()` - Run custom JS

## How to Use

1. **Import the functions you need:**
```javascript
import { Builder } from 'selenium-webdriver';
import { 
  waitForElementClickable,
  selectDropdown,
  scrollToElement 
} from '../enhanced-selenium-mcp/src/index.js';
```

2. **Use in your tests:**
```javascript
const driver = await new Builder().forBrowser('chrome').build();
await driver.get('https://example.com');

await waitForElementClickable(driver, {
  by: 'id',
  value: 'submit-btn',
  timeout: 10000
});

await driver.quit();
```

## Response Format

All functions return consistent responses:

**Success:**
```javascript
{
  success: true,
  message: "Operation completed",
  data: { /* optional data */ }
}
```

**Error:**
```javascript
{
  success: false,
  message: "Error description",
  error: { name: "ErrorType", message: "...", stack: "..." }
}
```

## Element Locators

All functions support these locator strategies:
- `id` - By ID attribute
- `css` - By CSS selector
- `xpath` - By XPath
- `name` - By name attribute
- `tag` - By tag name
- `class` - By class name

## File Structure

```
enhanced-selenium-mcp/
├── src/
│   ├── index.js          # Main exports
│   ├── utils.js          # Shared utilities
│   └── tools/
│       ├── dropdown.js   # Dropdown functions
│       ├── alert.js      # Alert functions
│       ├── iframe.js     # Iframe functions
│       ├── window.js     # Window functions
│       ├── scroll.js     # Scroll functions
│       ├── waits.js      # Wait functions
│       ├── element.js    # Element functions
│       ├── navigation.js # Navigation functions
│       └── browser.js    # Browser functions
├── example.js            # Usage example
├── README.md             # Full documentation
└── package.json          # Package metadata
```

## Tips

1. **Always wait before clicking:**
```javascript
await waitForElementClickable(driver, { by: 'id', value: 'btn' });
// Now it's safe to click
```

2. **Remember to switch back from iframes:**
```javascript
await switchToIframe(driver, { by: 'id', value: 'frame1' });
// Do work in iframe
await switchToDefaultContent(driver);
```

3. **Use explicitWait sparingly:**
```javascript
// Better: Use smart waits
await waitForElementVisible(driver, { by: 'id', value: 'element' });

// Avoid: Fixed delays
await explicitWait(driver, { milliseconds: 5000 });
```

4. **Check element existence before interaction:**
```javascript
const exists = await elementExists(driver, { by: 'id', value: 'optional-btn' });
if (exists.data.exists) {
  // Element is present, interact with it
}
```

## Need Help?

See [README.md](README.md) for complete documentation and examples.
