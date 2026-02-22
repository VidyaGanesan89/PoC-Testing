# Claude Sonnet 4.5 Agent Mode - Test Generation Guide

## 🤖 Overview

Your test generation system now uses **Claude Sonnet 4.5 in Extended Thinking (Agent Mode)** for intelligent Selenium test creation. This advanced generator uses multi-phase analysis to produce high-quality test code without requiring external API calls.

## ✨ Key Features

### Extended Thinking Process
1. **Phase 1: Deep Analysis** - Analyzes user intent, extracts steps, detects action patterns
2. **Phase 2: Strategy Generation** - Determines required imports, builds action sequence, plans assertions
3. **Phase 3: Code Generation** - Produces optimized Java/Selenium code with best practices

### Intelligent Pattern Detection
- **Hover Actions**: "hover on About and click Offices" → Actions class with moveToElement()
- **Dropdown Selection**: "select Germany" → Select class with multiple XPath strategies
- **Navigation Verification**: "navigate to offices page" → URL contains check with assertions
- **Smart Imports**: Automatically adds Actions, Select, Duration based on detected patterns
- **Variable Naming**: Converts natural language to valid Java variable names

### Enhanced-Selenium-MCP Integration
The generator is aware of 30+ enhanced-selenium-mcp tools:
- Dropdown/Select (2 tools)
- Alert Handling (4 tools)
- Iframe Navigation (3 tools)
- Window Management (3 tools)
- Page Scrolling (4 tools)
- Smart Waits (4 tools)
- Element Inspection (6 tools)
- Navigation (5 tools)
- Browser Control (3 tools)

## 🎯 How to Use

### 1. Select AI Model in UI

Open the test generation UI and choose:
- **🤖 Claude Sonnet 4.5 (Agent Mode)** - Intelligent test generation with extended thinking
- **⚙️ Pattern Matching (Fallback)** - Basic pattern matching (JavaTestGenerator)

### 2. Enter Your Test Prompt

Example prompts that work well with Claude Agent Mode:

```
1. Launch https://parcelpro3.ams1907.com
2. hover on About and click Offices
3. navigate to offices page
4. select Germany from country dropdown
```

```
Test the contact form:
1. Open https://example.com/contact
2. Enter name "John Doe"
3. Enter email "john@test.com"
4. Click submit button
5. Verify success message appears
```

```
Navigate through menu system:
1. Launch application
2. Hover on Products menu
3. Click on Electronics submenu
4. Verify Electronics page loads
5. Select category "Laptops" from dropdown
```

### 3. Review Generated Code

Claude Agent Mode generates code with:

#### Smart Imports
```java
import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.WebDriverWait;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.interactions.Actions;  // Added for hover
import org.openqa.selenium.support.ui.Select;     // Added for dropdown
import java.time.Duration;
```

#### Proper Setup
```java
WebDriverWait wait = new WebDriverWait(Driver.instance, Duration.ofSeconds(10));
Actions actions = new Actions(Driver.instance);  // Only if hover detected
```

#### Descriptive Comments
```java
// Hover on About and click Offices
WebElement aboutMenu = wait.until(ExpectedConditions.visibilityOfElementLocated(
    By.xpath("//a[contains(text(), 'About')]")));
actions.moveToElement(aboutMenu).perform();
Thread.sleep(500);
```

#### Smart Assertions
```java
// Verify navigation to offices page
wait.until(ExpectedConditions.urlContains("offices.html"));
String currentUrl = Driver.instance.getCurrentUrl();
Assert.assertTrue(currentUrl.contains("offices.html"), 
    "Expected URL to contain 'offices.html', but was: " + currentUrl);
```

## 🔍 How It Works (Technical Details)

### Phase 1: Prompt Analysis

The generator performs deep analysis:

```javascript
{
  steps: [
    { action: 'launch', tool: 'driver.get' },
    { action: 'hover_and_click', target: 'About', value: 'Offices', tool: 'Actions' },
    { action: 'navigate', value: 'offices page', tool: 'waitForElementVisible' },
    { action: 'dropdown_select', target: 'country', value: 'Germany', tool: 'selectDropdown' }
  ],
  url: 'https://parcelpro3.ams1907.com',
  interactions: ['launch', 'hover_and_click', 'navigate', 'dropdown_select'],
  complexity: 'medium'
}
```

### Phase 2: Strategy Generation

Based on analysis, creates execution strategy:

```javascript
{
  summary: 'functional test with 4 steps, complexity: medium',
  imports: Set([
    'org.openqa.selenium.By',
    'org.openqa.selenium.interactions.Actions',
    'org.openqa.selenium.support.ui.Select',
    ...
  ]),
  actions: [
    { type: 'navigate', url: 'https://parcelpro3.ams1907.com' },
    { type: 'hover_click', target: 'About', submenu: 'Offices' },
    { type: 'verify_navigation', expected: 'offices page' },
    { type: 'dropdown', target: 'country', value: 'Germany' }
  ]
}
```

### Phase 3: Code Generation

Produces optimized Java code with:
- Proper waits (no hardcoded delays except after actions)
- Descriptive variable names (`aboutMenu`, `officesSubmenu`, `countryDropdown`)
- Multiple XPath strategies for reliability
- Meaningful assertions with error messages

## 📊 Generator Comparison

| Feature | Claude Agent Mode 🤖 | Pattern Matching ⚙️ |
|---------|---------------------|---------------------|
| **Intelligence** | Extended thinking | Regex patterns |
| **Action Detection** | Deep analysis | Pattern matching |
| **Import Detection** | Automatic | Manual |
| **Variable Naming** | Natural language → Java | Generic names |
| **Code Quality** | Optimized | Basic |
| **Complexity Handling** | High | Medium |
| **No API Required** | ✅ | ✅ |

## 🚀 Backend Console Output

When you generate a test with Claude Agent Mode, you'll see:

```
✅ Initialized: ClaudeAgentGenerator (Extended Thinking Mode) + JavaTestGenerator (Fallback)
🤖 Using Claude Sonnet 4.5 Agent Mode (Extended Thinking)
🤖 Claude Agent Mode: Analyzing prompt with extended thinking...
💭 Analysis: {
  "steps": [...],
  "url": "https://parcelpro3.ams1907.com",
  "interactions": ["launch", "hover_and_click", "navigate", "dropdown_select"],
  "complexity": "medium"
}
📋 Strategy: functional test with 4 steps, complexity: medium
✨ Generated code with enhanced-selenium-mcp tools
```

## 💡 Best Practices

### Write Clear Prompts
- Use numbered steps for clarity
- Be specific about actions (hover, click, select, verify)
- Include URLs when navigating to pages
- Mention what to verify/assert

### Good Prompt Examples

✅ **Good**: "1. Launch https://app.com 2. hover on Menu and click Settings 3. verify Settings page loads"

❌ **Avoid**: "test the menu" (too vague)

✅ **Good**: "select Germany from country dropdown"

❌ **Avoid**: "pick a country" (unclear which one)

### When to Use Claude Agent Mode

- **Complex interactions**: Hover menus, multi-step workflows
- **Navigation verification**: Need to check URLs/page loads
- **Dropdown selection**: Multiple select elements
- **Form filling**: Need smart field detection
- **Better code quality**: Want optimized, readable code

### When to Use Pattern Matching

- **Simple clicks**: Basic button/link interactions
- **Known patterns**: You've tested similar scenarios
- **Speed**: Faster generation (no analysis phase)
- **Debugging**: Simpler code for troubleshooting

## 🔧 Architecture

```
User Prompt
    ↓
Frontend (TestPromptInput.jsx)
    ↓ [llm: 'Claude Sonnet 4.5']
Backend (api.js)
    ↓
Generator Selection
    ├─→ ClaudeAgentGenerator (if Claude selected)
    └─→ JavaTestGenerator (if Pattern Matching)
    ↓
[Extended Thinking]
    ├─→ Phase 1: Analyze Prompt
    ├─→ Phase 2: Generate Strategy
    └─→ Phase 3: Generate Code
    ↓
Test Request Handler
    ↓
Test File Generated (GeneratedTest_*.java)
```

## 📝 Example End-to-End Flow

### Input Prompt:
```
1. Launch https://parcelpro3.ams1907.com
2. hover on About and click Offices
3. navigate to offices page
4. select Germany
```

### Backend Console:
```
🤖 Claude Agent Mode: Analyzing prompt with extended thinking...
💭 Analysis: {"steps": 4, "complexity": "medium", "url": "https://parcelpro3.ams1907.com"}
📋 Strategy: functional test with 4 steps, complexity: medium
✨ Generated code with enhanced-selenium-mcp tools
```

### Generated Code:
```java
package test.java;

import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.interactions.Actions;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.Select;
import org.openqa.selenium.support.ui.WebDriverWait;
import java.time.Duration;
import org.testng.annotations.Test;
import org.testng.Assert;

/**
 * Auto-generated by Claude Sonnet 4.5 Agent Mode
 * functional test with 4 steps, complexity: medium
 */
public class GeneratedTest_1737825600000 {

    @Test
    public void testGenerated() throws InterruptedException {
        WebDriverWait wait = new WebDriverWait(Driver.instance, Duration.ofSeconds(10));
        Actions actions = new Actions(Driver.instance);

        // Launch application
        Driver.instance.get("https://parcelpro3.ams1907.com");
        Thread.sleep(2000);

        // Hover on About and click Offices
        WebElement about = wait.until(ExpectedConditions.visibilityOfElementLocated(
            By.xpath("//a[contains(text(), 'About')]")));
        actions.moveToElement(about).perform();
        Thread.sleep(500);

        WebElement offices = wait.until(ExpectedConditions.elementToBeClickable(
            By.xpath("//a[contains(text(), 'Offices')]")));
        offices.click();
        Thread.sleep(1000);

        // Verify navigation to offices page
        wait.until(ExpectedConditions.urlContains("offices"));
        String currentUrl = Driver.instance.getCurrentUrl();
        Assert.assertTrue(currentUrl.contains("offices"), 
            "Expected URL to contain 'offices', but was: " + currentUrl);

        // Select Germany from dropdown
        WebElement countryDropdown = wait.until(ExpectedConditions.elementToBeClickable(
            By.xpath("//select[contains(@id, 'country')] | //select[contains(@name, 'country')]")));
        Select countrySelect = new Select(countryDropdown);
        countrySelect.selectByVisibleText("Germany");
        Thread.sleep(500);
    }
}
```

## 🎉 Summary

Claude Sonnet 4.5 Agent Mode brings **intelligent test generation** to your UI without requiring external API calls. The extended thinking process analyzes your prompts deeply and generates production-ready Selenium tests with:

- ✅ Smart pattern detection
- ✅ Automatic import management
- ✅ Descriptive variable names
- ✅ Proper waits and assertions
- ✅ Clean, readable code
- ✅ Enhanced-selenium-mcp awareness

**Try it now**: Select "🤖 Claude Sonnet 4.5 (Agent Mode)" in the UI and generate your first intelligent test!
