import { until } from 'selenium-webdriver';
import { getLocator, formatResult } from '../utils.js';

export const switchToIframeTool = {
  name: 'switch_to_iframe',
  description: 'Switch context to an iframe or frame element',
  inputSchema: {
    type: 'object',
    properties: {
      by: {
        type: 'string',
        enum: ['id', 'css', 'xpath', 'name', 'index'],
        description: 'How to locate the iframe (use "index" for numeric index)'
      },
      value: {
        type: 'string',
        description: 'Locator value or numeric index (as string)'
      },
      timeout: {
        type: 'number',
        default: 10000
      }
    },
    required: ['by', 'value']
  }
};

export async function switchToIframe(driver, params) {
  const { by, value, timeout = 10000 } = params;
  
  if (by === 'index') {
    await driver.switchTo().frame(parseInt(value));
    return formatResult(true, `Switched to iframe at index ${value}`);
  }
  
  const locator = getLocator(by, value);
  const iframe = await driver.wait(until.elementLocated(locator), timeout);
  await driver.switchTo().frame(iframe);
  
  return formatResult(true, `Switched to iframe located by ${by}: ${value}`);
}

export const switchToDefaultContentTool = {
  name: 'switch_to_default_content',
  description: 'Switch back to the main page content from an iframe',
  inputSchema: {
    type: 'object',
    properties: {},
    required: []
  }
};

export async function switchToDefaultContent(driver) {
  await driver.switchTo().defaultContent();
  return formatResult(true, 'Switched to default content (main page)');
}

export const switchToParentFrameTool = {
  name: 'switch_to_parent_frame',
  description: 'Switch to the parent frame from a nested iframe',
  inputSchema: {
    type: 'object',
    properties: {},
    required: []
  }
};

export async function switchToParentFrame(driver) {
  await driver.switchTo().parentFrame();
  return formatResult(true, 'Switched to parent frame');
}
