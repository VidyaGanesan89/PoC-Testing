import { until } from 'selenium-webdriver';
import { formatResult } from '../utils.js';

export const alertAcceptTool = {
  name: 'alert_accept',
  description: 'Accept (click OK on) a JavaScript alert, confirm, or prompt dialog',
  inputSchema: {
    type: 'object',
    properties: {
      timeout: {
        type: 'number',
        description: 'Maximum time to wait for alert in milliseconds',
        default: 5000
      }
    },
    required: []
  }
};

export async function alertAccept(driver, params) {
  const { timeout = 5000 } = params;
  
  await driver.wait(until.alertIsPresent(), timeout);
  const alert = await driver.switchTo().alert();
  const alertText = await alert.getText();
  await alert.accept();
  
  return formatResult(true, 'Alert accepted', { alertText });
}

export const alertDismissTool = {
  name: 'alert_dismiss',
  description: 'Dismiss (click Cancel on) a JavaScript confirm or prompt dialog',
  inputSchema: {
    type: 'object',
    properties: {
      timeout: {
        type: 'number',
        default: 5000
      }
    },
    required: []
  }
};

export async function alertDismiss(driver, params) {
  const { timeout = 5000 } = params;
  
  await driver.wait(until.alertIsPresent(), timeout);
  const alert = await driver.switchTo().alert();
  const alertText = await alert.getText();
  await alert.dismiss();
  
  return formatResult(true, 'Alert dismissed', { alertText });
}

export const alertGetTextTool = {
  name: 'alert_get_text',
  description: 'Get the text from a JavaScript alert, confirm, or prompt dialog',
  inputSchema: {
    type: 'object',
    properties: {
      timeout: {
        type: 'number',
        default: 5000
      }
    },
    required: []
  }
};

export async function alertGetText(driver, params) {
  const { timeout = 5000 } = params;
  
  await driver.wait(until.alertIsPresent(), timeout);
  const alert = await driver.switchTo().alert();
  const alertText = await alert.getText();
  
  return formatResult(true, 'Alert text retrieved', { alertText });
}

export const alertSendKeysTool = {
  name: 'alert_send_keys',
  description: 'Send keys to a JavaScript prompt dialog',
  inputSchema: {
    type: 'object',
    properties: {
      text: {
        type: 'string',
        description: 'Text to send to the prompt'
      },
      timeout: {
        type: 'number',
        default: 5000
      }
    },
    required: ['text']
  }
};

export async function alertSendKeys(driver, params) {
  const { text, timeout = 5000 } = params;
  
  await driver.wait(until.alertIsPresent(), timeout);
  const alert = await driver.switchTo().alert();
  await alert.sendKeys(text);
  
  return formatResult(true, `Sent keys to alert: ${text}`, { text });
}
