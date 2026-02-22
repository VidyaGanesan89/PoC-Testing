import { until } from 'selenium-webdriver';
import { getLocator, formatResult } from '../utils.js';

export const waitForElementVisibleTool = {
  name: 'wait_for_element_visible',
  description: 'Wait for an element to be visible on the page',
  inputSchema: {
    type: 'object',
    properties: {
      by: {
        type: 'string',
        enum: ['id', 'css', 'xpath', 'name', 'tag', 'class'],
        description: 'Locator strategy'
      },
      value: {
        type: 'string',
        description: 'Locator value'
      },
      timeout: {
        type: 'number',
        description: 'Timeout in milliseconds (default: 10000)',
        default: 10000
      }
    },
    required: ['by', 'value']
  }
};

export async function waitForElementVisible(driver, params) {
  const { by, value, timeout = 10000 } = params;
  const locator = getLocator(by, value);
  
  await driver.wait(until.elementLocated(locator), timeout, `Element not located: ${by}=${value}`);
  const element = await driver.findElement(locator);
  await driver.wait(until.elementIsVisible(element), timeout, `Element not visible: ${by}=${value}`);
  
  return formatResult(true, `Element is visible: ${by}=${value}`);
}

export const waitForElementClickableTool = {
  name: 'wait_for_element_clickable',
  description: 'Wait for an element to be clickable (visible and enabled)',
  inputSchema: {
    type: 'object',
    properties: {
      by: {
        type: 'string',
        enum: ['id', 'css', 'xpath', 'name', 'tag', 'class'],
        description: 'Locator strategy'
      },
      value: {
        type: 'string',
        description: 'Locator value'
      },
      timeout: {
        type: 'number',
        description: 'Timeout in milliseconds (default: 10000)',
        default: 10000
      }
    },
    required: ['by', 'value']
  }
};

export async function waitForElementClickable(driver, params) {
  const { by, value, timeout = 10000 } = params;
  const locator = getLocator(by, value);
  
  await driver.wait(until.elementLocated(locator), timeout, `Element not located: ${by}=${value}`);
  const element = await driver.findElement(locator);
  await driver.wait(until.elementIsVisible(element), timeout, `Element not visible: ${by}=${value}`);
  await driver.wait(until.elementIsEnabled(element), timeout, `Element not enabled: ${by}=${value}`);
  
  return formatResult(true, `Element is clickable: ${by}=${value}`);
}

export const waitForElementNotVisibleTool = {
  name: 'wait_for_element_not_visible',
  description: 'Wait for an element to become invisible or removed from DOM',
  inputSchema: {
    type: 'object',
    properties: {
      by: {
        type: 'string',
        enum: ['id', 'css', 'xpath', 'name', 'tag', 'class'],
        description: 'Locator strategy'
      },
      value: {
        type: 'string',
        description: 'Locator value'
      },
      timeout: {
        type: 'number',
        description: 'Timeout in milliseconds (default: 10000)',
        default: 10000
      }
    },
    required: ['by', 'value']
  }
};

export async function waitForElementNotVisible(driver, params) {
  const { by, value, timeout = 10000 } = params;
  const locator = getLocator(by, value);
  
  await driver.wait(async () => {
    try {
      const element = await driver.findElement(locator);
      const isVisible = await element.isDisplayed();
      return !isVisible;
    } catch (err) {
      // Element not found = not visible
      return true;
    }
  }, timeout, `Element still visible: ${by}=${value}`);
  
  return formatResult(true, `Element is not visible: ${by}=${value}`);
}

export const explicitWaitTool = {
  name: 'explicit_wait',
  description: 'Wait for a specified duration (sleep)',
  inputSchema: {
    type: 'object',
    properties: {
      milliseconds: {
        type: 'number',
        description: 'Duration to wait in milliseconds'
      }
    },
    required: ['milliseconds']
  }
};

export async function explicitWait(driver, params) {
  const { milliseconds } = params;
  
  await driver.sleep(milliseconds);
  
  return formatResult(true, `Waited for ${milliseconds}ms`);
}
