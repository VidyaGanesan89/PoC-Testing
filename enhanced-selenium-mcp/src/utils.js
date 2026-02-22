import { By } from 'selenium-webdriver';

/**
 * Helper function to create Selenium locator from strategy and value
 */
export function getLocator(by, value) {
  switch (by) {
    case 'id':
      return By.id(value);
    case 'css':
      return By.css(value);
    case 'xpath':
      return By.xpath(value);
    case 'name':
      return By.name(value);
    case 'tag':
      return By.tagName(value);
    case 'class':
      return By.className(value);
    case 'linkText':
      return By.linkText(value);
    case 'partialLinkText':
      return By.partialLinkText(value);
    default:
      throw new Error(`Unknown locator strategy: ${by}`);
  }
}

/**
 * Format result for MCP response
 */
export function formatResult(success, message, data = {}) {
  return {
    success,
    message,
    ...data
  };
}

/**
 * Format error for MCP response
 */
export function formatError(error) {
  return {
    success: false,
    error: error.message,
    stack: error.stack
  };
}
