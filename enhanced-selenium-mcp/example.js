// Example: Using Enhanced Selenium Wrapper in Your Tests
// This demonstrates how to import and use the wrapper functions

import { Builder } from 'selenium-webdriver';

// Import the functions you need
import { 
  selectDropdown,
  getSelectedOption,
  alertAccept,
  switchToIframe,
  switchToDefaultContent,
  scrollToElement,
  waitForElementClickable,
  waitForElementVisible,
  clearInput,
  getAttribute,
  elementExists,
  executeJavaScript,
  maximizeWindow
} from './src/index.js';

async function exampleTest() {
  // Create driver
  const driver = await new Builder().forBrowser('chrome').build();
  
  try {
    console.log('Starting test...\n');
    
    // Maximize window
    console.log('1. Maximizing window...');
    await maximizeWindow(driver);
    
    // Navigate
    console.log('2. Navigating to test page...');
    await driver.get('https://www.example.com');
    
    // Wait for element to be visible
    console.log('3. Waiting for element to be visible...');
    const existsResult = await elementExists(driver, {
      by: 'tag',
      value: 'h1',
      timeout: 5000
    });
    console.log('   Element exists:', existsResult.data.exists);
    
    // Scroll to element
    console.log('4. Scrolling to element...');
    await scrollToElement(driver, {
      by: 'tag',
      value: 'h1'
    });
    
    // Get page title using JavaScript
    console.log('5. Getting page title...');
    const titleResult = await executeJavaScript(driver, {
      script: 'return document.title;'
    });
    console.log('   Page title:', titleResult.data.result);
    
    // Get element attribute
    console.log('6. Getting element attribute...');
    const attrResult = await getAttribute(driver, {
      by: 'tag',
      value: 'h1',
      attributeName: 'textContent'
    });
    console.log('   H1 text:', attrResult.data.attributeValue);
    
    console.log('\n✅ Test completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    // Always quit the driver
    await driver.quit();
  }
}

// Run the example
exampleTest();
