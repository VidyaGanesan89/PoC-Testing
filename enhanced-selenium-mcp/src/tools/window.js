import { formatResult } from '../utils.js';

export const switchToWindowTool = {
  name: 'switch_to_window',
  description: 'Switch to a different browser window or tab by index or handle',
  inputSchema: {
    type: 'object',
    properties: {
      windowHandle: {
        type: 'string',
        description: 'Window handle or numeric index (as string). Use "0" for first window, "1" for second, etc.'
      }
    },
    required: ['windowHandle']
  }
};

export async function switchToWindow(driver, params) {
  const { windowHandle } = params;
  
  // Check if it's a numeric index
  if (/^\d+$/.test(windowHandle)) {
    const handles = await driver.getAllWindowHandles();
    const index = parseInt(windowHandle);
    
    if (index >= handles.length) {
      throw new Error(`Window index ${index} out of range. Only ${handles.length} window(s) available.`);
    }
    
    await driver.switchTo().window(handles[index]);
    return formatResult(true, `Switched to window at index ${index}`, { 
      windowHandle: handles[index],
      totalWindows: handles.length
    });
  }
  
  // It's a window handle string
  await driver.switchTo().window(windowHandle);
  return formatResult(true, `Switched to window: ${windowHandle}`);
}

export const getWindowHandlesTool = {
  name: 'get_window_handles',
  description: 'Get all window handles (IDs) for currently open windows/tabs',
  inputSchema: {
    type: 'object',
    properties: {},
    required: []
  }
};

export async function getWindowHandles(driver) {
  const handles = await driver.getAllWindowHandles();
  const currentHandle = await driver.getWindowHandle();
  
  return formatResult(true, `Found ${handles.length} window(s)`, {
    windowHandles: handles,
    currentWindowHandle: currentHandle,
    totalWindows: handles.length
  });
}

export const closeCurrentWindowTool = {
  name: 'close_current_window',
  description: 'Close the current window/tab (does not close the browser session)',
  inputSchema: {
    type: 'object',
    properties: {},
    required: []
  }
};

export async function closeCurrentWindow(driver) {
  const handlesBefore = await driver.getAllWindowHandles();
  await driver.close();
  const handlesAfter = await driver.getAllWindowHandles();
  
  return formatResult(true, 'Current window closed', {
    remainingWindows: handlesAfter.length
  });
}
