import { formatResult } from '../utils.js';

export const refreshPageTool = {
  name: 'refresh_page',
  description: 'Refresh the current page',
  inputSchema: {
    type: 'object',
    properties: {},
    required: []
  }
};

export async function refreshPage(driver) {
  await driver.navigate().refresh();
  
  return formatResult(true, 'Page refreshed');
}

export const navigateBackTool = {
  name: 'navigate_back',
  description: 'Navigate back in browser history',
  inputSchema: {
    type: 'object',
    properties: {},
    required: []
  }
};

export async function navigateBack(driver) {
  await driver.navigate().back();
  
  return formatResult(true, 'Navigated back');
}

export const navigateForwardTool = {
  name: 'navigate_forward',
  description: 'Navigate forward in browser history',
  inputSchema: {
    type: 'object',
    properties: {},
    required: []
  }
};

export async function navigateForward(driver) {
  await driver.navigate().forward();
  
  return formatResult(true, 'Navigated forward');
}

export const getCurrentUrlTool = {
  name: 'get_current_url',
  description: 'Get the current page URL',
  inputSchema: {
    type: 'object',
    properties: {},
    required: []
  }
};

export async function getCurrentUrl(driver) {
  const url = await driver.getCurrentUrl();
  
  return formatResult(true, 'Current URL retrieved', {
    url
  });
}

export const getPageTitleTool = {
  name: 'get_page_title',
  description: 'Get the current page title',
  inputSchema: {
    type: 'object',
    properties: {},
    required: []
  }
};

export async function getPageTitle(driver) {
  const title = await driver.getTitle();
  
  return formatResult(true, 'Page title retrieved', {
    title
  });
}
