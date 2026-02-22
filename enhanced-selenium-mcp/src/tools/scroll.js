import { getLocator, formatResult } from '../utils.js';

export const scrollToElementTool = {
  name: 'scroll_to_element',
  description: 'Scroll the page to bring an element into view',
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

export async function scrollToElement(driver, params) {
  const { by, value, timeout = 10000 } = params;
  const locator = getLocator(by, value);
  
  const element = await driver.wait(
    async () => await driver.findElement(locator),
    timeout,
    `Element not found: ${by}=${value}`
  );
  
  await driver.executeScript('arguments[0].scrollIntoView({behavior: "smooth", block: "center"});', element);
  
  return formatResult(true, `Scrolled to element: ${by}=${value}`);
}

export const scrollByOffsetTool = {
  name: 'scroll_by_offset',
  description: 'Scroll the page by a specific pixel offset',
  inputSchema: {
    type: 'object',
    properties: {
      x: {
        type: 'number',
        description: 'Horizontal scroll offset in pixels',
        default: 0
      },
      y: {
        type: 'number',
        description: 'Vertical scroll offset in pixels'
      }
    },
    required: ['y']
  }
};

export async function scrollByOffset(driver, params) {
  const { x = 0, y } = params;
  
  await driver.executeScript(`window.scrollBy(${x}, ${y});`);
  
  return formatResult(true, `Scrolled by offset: x=${x}, y=${y}`);
}

export const scrollToTopTool = {
  name: 'scroll_to_top',
  description: 'Scroll to the top of the page',
  inputSchema: {
    type: 'object',
    properties: {},
    required: []
  }
};

export async function scrollToTop(driver) {
  await driver.executeScript('window.scrollTo({top: 0, behavior: "smooth"});');
  
  return formatResult(true, 'Scrolled to top of page');
}

export const scrollToBottomTool = {
  name: 'scroll_to_bottom',
  description: 'Scroll to the bottom of the page',
  inputSchema: {
    type: 'object',
    properties: {},
    required: []
  }
};

export async function scrollToBottom(driver) {
  await driver.executeScript('window.scrollTo({top: document.body.scrollHeight, behavior: "smooth"});');
  
  return formatResult(true, 'Scrolled to bottom of page');
}
