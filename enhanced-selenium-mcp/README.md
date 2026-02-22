# Enhanced Selenium Wrapper

A comprehensive Selenium WebDriver wrapper library providing 30+ tools for browser automation. **Zero npm dependencies** - import directly into your existing Selenium projects!

## Features

This library provides extensive browser automation capabilities organized into 9 modules:

### Dropdown/Select Management (2 tools)
- `select_dropdown` - Select option by value, text, or index
- `get_selected_option` - Get currently selected option

### Alert Handling (4 tools)
- `alert_accept` - Accept alert/confirm/prompt
- `alert_dismiss` - Dismiss (cancel) alert/confirm/prompt
- `alert_get_text` - Read alert text
- `alert_send_keys` - Type into prompt dialog

### Iframe Navigation (3 tools)
- `switch_to_iframe` - Switch to iframe by locator or index
- `switch_to_default_content` - Return to main page content
- `switch_to_parent_frame` - Navigate to parent frame

### Window Management (3 tools)
- `switch_to_window` - Switch between windows/tabs
- `get_window_handles` - Get all window handles
- `close_current_window` - Close current window/tab

### Page Scrolling (4 tools)
- `scroll_to_element` - Scroll element into view
- `scroll_by_offset` - Scroll by pixel offset
- `scroll_to_top` - Scroll to page top
- `scroll_to_bottom` - Scroll to page bottom

### Smart Waits (4 tools)
- `wait_for_element_visible` - Wait for element to be visible
- `wait_for_element_clickable` - Wait for element to be clickable
- `wait_for_element_not_visible` - Wait for element to disappear
- `explicit_wait` - Wait for specified duration

### Element Inspection (6 tools)
- `clear_input` - Clear input field
- `get_attribute` - Get element attribute value
- `element_exists` - Check if element exists
- `is_displayed` - Check if element is visible
- `is_enabled` - Check if element is enabled

### Navigation (5 tools)
- `refresh_page` - Refresh current page
- `navigate_back` - Browser back button
- `navigate_forward` - Browser forward button
- `get_current_url` - Get current page URL
- `get_page_title` - Get page title

### Browser Control (3 tools)
- `maximize_window` - Maximize browser window
- `set_window_size` - Set window dimensions
- `execute_javascript` - Execute custom JavaScript

## Installation

**No installation needed!** This library has zero dependencies. Simply import it into your existing Selenium project.

### Prerequisites

Your project should already have:
- `selenium-webdriver` ^4.0.0 (already in your backend/pom.xml)

## Usage

### Import and Use Directly in Your Tests

```javascript
import { Builder } from 'selenium-webdriver';
import { 
  selectDropdown, 
  getSelectedOption,
  alertAccept,
  switchToIframe,
  scrollToElement,
  waitForElementClickable,
  executeJavaScript
} from '../enhanced-selenium-mcp/src/index.js';

// Your test code
async function myTest() {
  const driver = await new Builder().forBrowser('chrome').build();
  
  try {
    // Navigate
    await driver.get('https://example.com');
    
    // Wait for element to be clickable
    await waitForElementClickable(driver, {
      by: 'id',
      value: 'submit-btn',
      timeout: 10000
    });
    
    // Select dropdown option
    await selectDropdown(driver, {
      by: 'id',
      value: 'country-select',
      selectBy: 'text',
      optionValue: 'United States'
    });
    
    // Scroll to element
    await scrollToElement(driver, {
      by: 'css',
      value: '#footer-section'
    });
    
    // Handle alert
    await alertAccept(driver, { timeout: 5000 });
    
    // Execute custom JavaScript
    const result = await executeJavaScript(driver, {
      script: 'return document.title;'
    });
    
    console.log('Page title:', result.data.result);
    
  } finally {
    await driver.quit();
  }
}

myTest();
```

## Dependencies

**Peer Dependencies:**
- `selenium-webdriver` ^4.0.0 (must be installed in your project)

**No npm packages to install** - this library uses only what you already have!


## Tool Reference

### Element Locator Strategies

All tools that locate elements support these strategies:
- `id` - Find by element ID
- `css` - Find by CSS selector
- `xpath` - Find by XPath expression
- `name` - Find by name attribute
- `tag` - Find by tag name
- `class` - Find by class name

### Example Tool Calls

#### Select Dropdown Option
```javascript
await selectDropdown(driver, {
  by: 'id',
  value: 'country-select',
  selectBy: 'text',
  optionValue: 'United States'
});
```

#### Handle Alert
```javascript
await alertAccept(driver, { timeout: 5000 });
```

#### Switch to Iframe
```javascript
await switchToIframe(driver, {
  by: 'css',
  value: '#payment-iframe'
});
```

#### Wait for Element
```javascript
await waitForElementClickable(driver, {
  by: 'xpath',
  value: '//button[@id="submit"]',
  timeout: 15000
});
```

#### Execute JavaScript
```javascript
const result = await executeJavaScript(driver, {
  script: 'return document.querySelector("#username").value;',
  args: []
});
console.log(result.data.result);
```

## Architecture

### Modular Tool Structure

```
src/
├── index.js           # Main MCP server
├── utils.js           # Shared utilities
└── tools/
    ├── dropdown.js    # Dropdown/select tools
    ├── alert.js       # Alert handling tools
    ├── iframe.js      # Iframe navigation tools
    ├── window.js      # Window management tools
    ├── scroll.js      # Scrolling tools
    ├── waits.js       # Wait condition tools
    ├── element.js     # Element inspection tools
    ├── navigation.js  # Browser navigation tools
    └── browser.js     # Browser control tools
```

### Response Format

All tools return consistent responses:

**Success:**
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": { /* optional additional data */ }
}
```

**Error:**
```json
{
  "success": false,
  "message": "Error description",
  "error": {
    "name": "ErrorType",
    "message": "Detailed error message",
    "stack": "Stack trace..."
  }
}
```

## Best Practices

### Wait Strategies
- Use `wait_for_element_clickable` before clicking elements
- Use `wait_for_element_visible` before reading text
- Avoid `explicit_wait` unless absolutely necessary

### Element Location
- Prefer `id` and `css` selectors for performance
- Use `xpath` for complex DOM traversal
- Combine `element_exists` with conditional logic

### Frame/Window Management
- Always call `switch_to_default_content` after iframe work
- Track window handles when working with multiple tabs
- Use descriptive window handle variables

### JavaScript Execution
- Use for complex operations not available via tools
- Return values for verification
- Keep scripts concise and focused

## Troubleshooting

### ChromeDriver Not Found
Ensure ChromeDriver is installed and in your PATH. You may already have it if you're running Selenium tests.

### Element Not Found
Increase timeout values or verify locator:
```javascript
await waitForElementVisible(driver, {
  by: 'css',
  value: '#element',
  timeout: 15000  // Increase from default 10000
});
```

### Alert Not Present
Ensure alert has time to appear:
```javascript
// Wait before accepting alert
await explicitWait(driver, { milliseconds: 1000 });
await alertAccept(driver, { timeout: 5000 });
```

### Iframe Issues
Verify iframe switching:
```javascript
// Switch to iframe
await switchToIframe(driver, { by: 'id', value: 'myframe' });

// Perform operations
await clearInput(driver, { by: 'id', value: 'input-in-iframe' });

// Always switch back
await switchToDefaultContent(driver);
```

## Integration with Your Test Project

### Option 1: Copy into Your Project
```bash
# Copy the enhanced-selenium-mcp folder into your project
cp -r enhanced-selenium-mcp ../your-test-project/lib/
```

### Option 2: Import Directly
```javascript
// From your test files, import using relative path
import { selectDropdown } from '../enhanced-selenium-mcp/src/index.js';
```

### Option 3: Use in Java Tests via Node.js
You can call these functions from Java using a Node.js bridge or by generating JavaScript snippets.

## Version History

### 2.0.0 (Current)
- 30+ comprehensive Selenium wrapper functions
- Zero npm dependencies (uses peer dependency)
- Modular architecture for easy importing
- Works directly in existing Selenium projects
- No installation required

## License

MIT
