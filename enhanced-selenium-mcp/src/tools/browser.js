import { formatResult } from '../utils.js';

export const maximizeWindowTool = {
  name: 'maximize_window',
  description: 'Maximize the browser window',
  inputSchema: {
    type: 'object',
    properties: {},
    required: []
  }
};

export async function maximizeWindow(driver) {
  await driver.manage().window().maximize();
  
  const size = await driver.manage().window().getRect();
  
  return formatResult(true, 'Window maximized', {
    width: size.width,
    height: size.height
  });
}

export const setWindowSizeTool = {
  name: 'set_window_size',
  description: 'Set the browser window size',
  inputSchema: {
    type: 'object',
    properties: {
      width: {
        type: 'number',
        description: 'Window width in pixels'
      },
      height: {
        type: 'number',
        description: 'Window height in pixels'
      }
    },
    required: ['width', 'height']
  }
};

export async function setWindowSize(driver, params) {
  const { width, height } = params;
  
  await driver.manage().window().setRect({ width, height });
  
  return formatResult(true, `Window size set to ${width}x${height}`, {
    width,
    height
  });
}

export const executeJavaScriptTool = {
  name: 'execute_javascript',
  description: 'Execute custom JavaScript code in the browser',
  inputSchema: {
    type: 'object',
    properties: {
      script: {
        type: 'string',
        description: 'JavaScript code to execute'
      },
      args: {
        type: 'array',
        description: 'Optional arguments to pass to the script',
        items: {
          type: 'string'
        },
        default: []
      }
    },
    required: ['script']
  }
};

export async function executeJavaScript(driver, params) {
  const { script, args = [] } = params;
  
  const result = await driver.executeScript(script, ...args);
  
  return formatResult(true, 'JavaScript executed', {
    result
  });
}
