import { getLocator, formatResult } from '../utils.js';

export const clearInputTool = {
  name: 'clear_input',
  description: 'Clear the text from an input field',
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

export async function clearInput(driver, params) {
  const { by, value, timeout = 10000 } = params;
  const locator = getLocator(by, value);
  
  const element = await driver.wait(
    async () => await driver.findElement(locator),
    timeout,
    `Element not found: ${by}=${value}`
  );
  
  await element.clear();
  
  return formatResult(true, `Cleared input: ${by}=${value}`);
}

export const getAttributeTool = {
  name: 'get_attribute',
  description: 'Get the value of an element attribute',
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
      attributeName: {
        type: 'string',
        description: 'Name of the attribute to get (e.g., "href", "class", "value")'
      },
      timeout: {
        type: 'number',
        description: 'Timeout in milliseconds (default: 10000)',
        default: 10000
      }
    },
    required: ['by', 'value', 'attributeName']
  }
};

export async function getAttribute(driver, params) {
  const { by, value, attributeName, timeout = 10000 } = params;
  const locator = getLocator(by, value);
  
  const element = await driver.wait(
    async () => await driver.findElement(locator),
    timeout,
    `Element not found: ${by}=${value}`
  );
  
  const attributeValue = await element.getAttribute(attributeName);
  
  return formatResult(true, `Got attribute "${attributeName}"`, {
    attributeName,
    attributeValue
  });
}

export const elementExistsTool = {
  name: 'element_exists',
  description: 'Check if an element exists on the page',
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
        description: 'Timeout in milliseconds (default: 5000)',
        default: 5000
      }
    },
    required: ['by', 'value']
  }
};

export async function elementExists(driver, params) {
  const { by, value, timeout = 5000 } = params;
  const locator = getLocator(by, value);
  
  try {
    await driver.wait(
      async () => await driver.findElement(locator),
      timeout
    );
    return formatResult(true, `Element exists: ${by}=${value}`, { exists: true });
  } catch (err) {
    return formatResult(true, `Element does not exist: ${by}=${value}`, { exists: false });
  }
}

export const isDisplayedTool = {
  name: 'is_displayed',
  description: 'Check if an element is displayed (visible)',
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

export async function isDisplayed(driver, params) {
  const { by, value, timeout = 10000 } = params;
  const locator = getLocator(by, value);
  
  const element = await driver.wait(
    async () => await driver.findElement(locator),
    timeout,
    `Element not found: ${by}=${value}`
  );
  
  const displayed = await element.isDisplayed();
  
  return formatResult(true, `Element display status: ${displayed}`, {
    isDisplayed: displayed
  });
}

export const isEnabledTool = {
  name: 'is_enabled',
  description: 'Check if an element is enabled',
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

export async function isEnabled(driver, params) {
  const { by, value, timeout = 10000 } = params;
  const locator = getLocator(by, value);
  
  const element = await driver.wait(
    async () => await driver.findElement(locator),
    timeout,
    `Element not found: ${by}=${value}`
  );
  
  const enabled = await element.isEnabled();
  
  return formatResult(true, `Element enabled status: ${enabled}`, {
    isEnabled: enabled
  });
}
